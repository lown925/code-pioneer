import { readSeedDocument } from '../content-source';
import type {
  SeedChapter,
  SeedLesson,
  SeedLessonBlock,
  SeedQuestion,
  SeedQuestionOption,
} from '../types';

const LESSON_KEYS = [
  'receive-user-input',
  'input-returns-string',
  'convert-input-with-int',
  'convert-with-float-and-str',
  'print-multiple-values',
  'format-output-with-f-strings',
] as const;

const QUESTION_KEYS = [
  'receive-course-name',
  'input-function-name',
  'save-study-minutes-input',
  'input-result-type',
  'input-integer-addition-error',
  'input-score-type',
  'convert-correct-count',
  'convert-rating-to-int',
  'convert-string-25-to-int',
  'convert-decimal-input',
  'convert-progress-to-string',
  'convert-string-88-5-to-float',
  'print-string-and-integer',
  'print-study-minutes',
  'format-rating-with-f-string',
  'f-string-braces',
  'format-correct-count',
  'f-string-expression-output',
] as const;

const PRESENTATION_MAP = {
  代码用途: 'CODE_PURPOSE',
  代码阅读: 'CODE_READING',
  代码分析: 'CODE_READING',
  异常识别: 'CODE_READING',
  代码纠错: 'BUG_FIX',
  'Bug 定位': 'BUG_FIX',
  代码填空: 'INPUT_CODE_FILL',
  执行流程: 'OUTPUT_PREDICTION',
  输出预测: 'OUTPUT_PREDICTION',
  场景判断: 'CODE_PURPOSE',
  综合判断: 'CODE_READING',
  工程判断: 'CODE_PURPOSE',
} as const;

function requiredMatch(input: string, pattern: RegExp, label: string): string {
  const value = input.match(pattern)?.[1]?.trim();
  if (!value) {
    throw new Error(`Python chapter source is missing ${label}`);
  }
  return value;
}

function collectUntilToken(lines: string[], startIndex: number) {
  const collected: string[] = [];
  let index = startIndex;

  while (index < lines.length) {
    const line = lines[index] ?? '';
    if (
      /^\[(标题|文本|代码|示例|提示|警告)(?:\s|\])/.test(line) ||
      /^#{2,4}\s/.test(line) ||
      line === '---' ||
      line === '参考代码：'
    ) {
      break;
    }
    collected.push(line);
    index += 1;
  }

  while (collected.at(-1) === '') {
    collected.pop();
  }

  return { value: collected.join('\n').trim(), nextIndex: index };
}

function parseLessonBlocks(markdown: string, lessonKey: string) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const blocks: SeedLessonBlock[] = [];
  let index = 0;

  const keyFor = (type: string) =>
    `${lessonKey}-block-${String(blocks.length + 1).padStart(2, '0')}-${type}`;

  while (index < lines.length) {
    const line = lines[index] ?? '';

    if (line === '[标题]' || line === '[文本]') {
      const type = line === '[标题]' ? 'HEADING' : 'TEXT';
      const collected = collectUntilToken(lines, index + 1);
      if (collected.value) {
        blocks.push(
          type === 'HEADING'
            ? {
                key: keyFor('heading'),
                type,
                text: collected.value,
                level: 2,
              }
            : { key: keyFor('text'), type, text: collected.value },
        );
      }
      index = collected.nextIndex;
      continue;
    }

    const codeMatch = line.match(/^\[代码 language=([^\]]+)\]$/);
    if (codeMatch) {
      const endIndex = lines.indexOf('[/代码]', index + 1);
      if (endIndex < 0) {
        throw new Error(`Unclosed code block in ${lessonKey}`);
      }
      blocks.push({
        key: keyFor('code'),
        type: 'CODE',
        language: codeMatch[1]!.trim(),
        code: lines
          .slice(index + 1, endIndex)
          .join('\n')
          .trim(),
      });
      index = endIndex + 1;
      continue;
    }

    const exampleMatch = line.match(/^\[示例 title=([^\]]+)\]$/);
    if (exampleMatch) {
      const endIndex = lines.indexOf('[/示例]', index + 1);
      if (endIndex < 0) {
        throw new Error(`Unclosed example block in ${lessonKey}`);
      }
      const content = lines
        .slice(index + 1, endIndex)
        .join('\n')
        .trim();
      const description = content.match(/^说明：(.+)$/m)?.[1]?.trim();
      const language = requiredMatch(
        content,
        /^语言：(.+)$/m,
        'example language',
      );
      const code = content
        .replace(/^说明：.+$/m, '')
        .replace(/^语言：.+$/m, '')
        .trim();
      blocks.push({
        key: keyFor('example'),
        type: 'EXAMPLE',
        title: exampleMatch[1]!.trim(),
        ...(description ? { description } : {}),
        language,
        code,
      });
      index = endIndex + 1;
      continue;
    }

    const calloutMatch = line.match(/^\[(提示|警告) title=([^\]]+)\]$/);
    if (calloutMatch) {
      const collected = collectUntilToken(lines, index + 1);
      blocks.push({
        key: keyFor(calloutMatch[1] === '提示' ? 'tip' : 'warning'),
        type: calloutMatch[1] === '提示' ? 'TIP' : 'WARNING',
        title: calloutMatch[2]!.trim(),
        text: collected.value,
      });
      index = collected.nextIndex;
      continue;
    }

    index += 1;
  }

  return blocks;
}

function parseOptions(segment: string, questionNumber: number) {
  const options: SeedQuestionOption[] = [];
  const optionPattern = /^- ([A-D])\. (.+?)( \[正确\])?$/gm;
  let match: RegExpExecArray | null;

  while ((match = optionPattern.exec(segment))) {
    options.push({
      key: match[1]!.toLowerCase(),
      content: match[2]!.trim(),
      isCorrect: Boolean(match[3]),
    });
  }

  const optionKeys = new Set(options.map((option) => option.key));
  if (options.length < 2 || optionKeys.size !== options.length) {
    throw new Error(`Question ${questionNumber} must have unique options`);
  }

  const inlineCorrectOptions = options.filter((option) => option.isCorrect);
  const explicitCorrectKeys = [
    ...segment.matchAll(/^正确答案：([A-D])\s*$/gm),
  ].map((answerMatch) => answerMatch[1]!.toLowerCase());
  const uniqueExplicitCorrectKeys = [...new Set(explicitCorrectKeys)];

  if (uniqueExplicitCorrectKeys.length > 1) {
    throw new Error(
      `Question ${questionNumber} has conflicting explicit correct answers`,
    );
  }

  const explicitCorrectKey = uniqueExplicitCorrectKeys[0];
  if (explicitCorrectKey && !optionKeys.has(explicitCorrectKey)) {
    throw new Error(
      `Question ${questionNumber} correct answer does not reference an option`,
    );
  }
  if (
    explicitCorrectKey &&
    (inlineCorrectOptions.length > 1 ||
      (inlineCorrectOptions.length === 1 &&
        inlineCorrectOptions[0]!.key !== explicitCorrectKey))
  ) {
    throw new Error(
      `Question ${questionNumber} has conflicting correct answer markers`,
    );
  }
  if (explicitCorrectKey) {
    for (const option of options) {
      option.isCorrect = option.key === explicitCorrectKey;
    }
  }

  if (options.filter((option) => option.isCorrect).length !== 1) {
    throw new Error(
      `Question ${questionNumber} must have exactly one correct option`,
    );
  }
  return options;
}

function parseAcceptedAnswers(segment: string, questionNumber: number) {
  const section = requiredMatch(
    segment,
    /可接受答案[:：]\n([\s\S]*?)(?=\n判题设置[:：])/,
    `question ${questionNumber} accepted answers`,
  );
  const answers = [
    ...[...section.matchAll(/```[a-zA-Z0-9_-]*\n([\s\S]*?)\n```/g)].map(
      (match) => match[1]!.trim(),
    ),
    ...[...section.matchAll(/^- (.+)$/gm)].map((match) => {
      const answer = match[1]!.trim();
      return answer.match(/^`([\s\S]+)`$/)?.[1] ?? answer;
    }),
  ];
  const uniqueAnswers = [...new Set(answers.filter(Boolean))];
  if (uniqueAnswers.length === 0) {
    throw new Error(`Question ${questionNumber} has no accepted answer`);
  }
  return uniqueAnswers;
}

function parseQuestion(
  segment: string,
  questionNumber: number,
  questionKeys: readonly string[],
  programmingLanguage = 'python',
): SeedQuestion {
  const type = requiredMatch(
    segment,
    /^题型：(.+)$/m,
    `question ${questionNumber} type`,
  );
  const title = requiredMatch(
    segment,
    /^题干：(.+)$/m,
    `question ${questionNumber} title`,
  );
  const explanation = requiredMatch(
    segment,
    /解析：\n([\s\S]*?)(?=\n标准完整代码[:：]|\n---|$)/,
    `question ${questionNumber} explanation`,
  );
  const difficulty = requiredMatch(
    segment,
    /^难度：(EASY|MEDIUM|HARD)$/m,
    `question ${questionNumber} difficulty`,
  ) as 'EASY' | 'MEDIUM' | 'HARD';
  const score = Number(
    requiredMatch(
      segment,
      /^分值：(\d+)$/m,
      `question ${questionNumber} score`,
    ),
  );
  const tags = requiredMatch(
    segment,
    /^知识点：(.+)$/m,
    `question ${questionNumber} knowledge tags`,
  )
    .split('、')
    .map((tag) => `topic:${tag.trim()}`);
  const isBattleEnabled =
    requiredMatch(
      segment,
      /^是否用于 Battle：(是|否)$/m,
      `question ${questionNumber} Battle flag`,
    ) === '是';
  const codeFencePattern = new RegExp(
    '```' + programmingLanguage + '\\r?\\n([\\s\\S]*?)\\r?\\n```',
  );
  const stemCode =
    segment.match(codeFencePattern)?.[1]?.trim() ??
    segment
      .match(
        new RegExp(
          '\\[代码 language=' +
            programmingLanguage +
            '\\]\\r?\\n([\\s\\S]*?)\\r?\\n\\[/代码\\]',
        ),
      )?.[1]
      ?.trim();
  if (type === 'CODE_FILL' && !stemCode) {
    throw new Error(
      `CODE_FILL question ${questionNumber} must include a code context`,
    );
  }
  const stemBlocks = stemCode
    ? [
        { type: 'TEXT' as const, text: title },
        {
          type: 'CODE' as const,
          language: programmingLanguage,
          code: stemCode,
        },
      ]
    : undefined;

  if (type === 'SINGLE_CHOICE') {
    const battlePresentation = isBattleEnabled
      ? (() => {
          const presentationLabel = requiredMatch(
            segment,
            /^Battle 展示类型：(.+)$/m,
            `question ${questionNumber} Battle presentation`,
          );
          const presentation =
            presentationLabel === '综合项目题'
              ? 'TEXT_CHOICE'
              : PRESENTATION_MAP[
                  presentationLabel as keyof typeof PRESENTATION_MAP
                ];
          if (!presentation) {
            throw new Error(
              `Question ${questionNumber} has unsupported Battle presentation ${presentationLabel}`,
            );
          }
          return presentation;
        })()
      : 'TEXT_CHOICE';
    return {
      key: questionKeys[questionNumber - 1]!,
      type,
      title,
      explanation,
      difficulty,
      score,
      isBattleEnabled,
      battlePresentation,
      programmingLanguage,
      stemBlocks,
      options: parseOptions(segment, questionNumber),
      tags,
    };
  }

  if (type !== 'FILL_BLANK' && type !== 'CODE_FILL') {
    throw new Error(`Question ${questionNumber} has unsupported type ${type}`);
  }

  const acceptedAnswers = parseAcceptedAnswers(segment, questionNumber);
  const caseSensitive = /区分大小写：是/.test(segment)
    ? true
    : !/忽略大小写：是/.test(segment);
  const collapseWhitespace = /合并连续空格：是/.test(segment);
  const standardCode = segment
    .match(
      new RegExp(
        '标准完整代码[:：]\\n\\s*```' +
          programmingLanguage +
          '\\n([\\s\\S]*?)\\n```',
      ),
    )?.[1]
    ?.trim();

  if (type === 'FILL_BLANK') {
    if (isBattleEnabled) {
      throw new Error(
        `FILL_BLANK question ${questionNumber} cannot be Battle enabled`,
      );
    }
    return {
      key: questionKeys[questionNumber - 1]!,
      type,
      title,
      explanation,
      difficulty,
      score,
      isBattleEnabled: false,
      acceptedAnswers,
      answerNormalization: {
        trim: /忽略首尾空格：是/.test(segment),
        normalizeLineEndings: true,
        caseSensitive,
        collapseWhitespace,
      },
      stemBlocks,
      tags,
    };
  }

  const presentationLabel = requiredMatch(
    segment,
    /^Battle 展示类型：(.+)$/m,
    `question ${questionNumber} Battle presentation`,
  );
  const battlePresentation =
    presentationLabel === '综合项目题'
      ? 'INPUT_CODE_FILL'
      : PRESENTATION_MAP[presentationLabel as keyof typeof PRESENTATION_MAP];
  if (!battlePresentation) {
    throw new Error(
      `Question ${questionNumber} has unsupported Battle presentation ${presentationLabel}`,
    );
  }
  return {
    key: questionKeys[questionNumber - 1]!,
    type,
    title,
    explanation,
    difficulty,
    score,
    isBattleEnabled,
    battlePresentation,
    programmingLanguage,
    acceptedAnswers,
    answerNormalization: {
      trim: /忽略首尾空格：是/.test(segment),
      normalizeLineEndings: /统一 Windows 和 Unix 换行：是/.test(segment),
      caseSensitive,
      collapseWhitespace: false,
    },
    stemBlocks,
    explanationBlocks: standardCode
      ? [
          { type: 'TEXT', text: explanation },
          { type: 'CODE', language: programmingLanguage, code: standardCode },
        ]
      : undefined,
    tags,
  };
}

function parseQuestions(
  markdown: string,
  questionKeys: readonly string[],
  programmingLanguage = 'python',
  questionKeyOffset = 0,
) {
  const matches = [...markdown.matchAll(/^#### 题目 (\d+)$/gm)];
  return matches.map((match, index) => {
    const questionNumber = Number(match[1]);
    const start = match.index! + match[0].length;
    const end = matches[index + 1]?.index ?? markdown.length;
    return parseQuestion(
      markdown.slice(start, end).trim(),
      questionNumber - questionKeyOffset,
      questionKeys,
      programmingLanguage,
    );
  });
}

export type PythonChapterSourceConfig = {
  chapterNumber: number;
  chapterOrdinal: string;
  chapterKey: string;
  lessonKeys: readonly string[];
  questionKeys: readonly string[];
  quizTitle: string;
  quizDescription: string;
  passScorePercent: number;
  programmingLanguage?: string;
  keyPrefix?: string;
  questionKeyOffset?: number;
};

export function parsePythonChapterSource(
  source: string,
  config: PythonChapterSourceConfig,
): SeedChapter {
  const normalized = source.replace(/\r\n/g, '\n');
  const chapterObjectives = requiredMatch(
    normalized,
    /章节学习目标：\n([\s\S]*?)(?=\n---)/,
    `chapter ${config.chapterNumber} learning objectives`,
  );
  const lessonMatches = [...normalized.matchAll(/^## 课时 (\d+)：(.+)$/gm)];
  if (lessonMatches.length !== config.lessonKeys.length) {
    throw new Error(
      `Python chapter ${config.chapterNumber} must contain ${config.lessonKeys.length} lessons`,
    );
  }

  const lessons: SeedLesson[] = lessonMatches.map((match, index) => {
    const lessonNumber = Number(match[1]);
    const rawLessonKey = config.lessonKeys[lessonNumber - 1]!;
    const lessonKey = config.keyPrefix
      ? `${config.keyPrefix}-${rawLessonKey}`
      : rawLessonKey;
    const start = match.index! + match[0].length;
    const end = lessonMatches[index + 1]?.index ?? normalized.length;
    const lessonSource = normalized.slice(start, end);
    const questionMarker = lessonSource.indexOf('### 课时题目');
    if (questionMarker < 0) {
      throw new Error(`Lesson ${lessonNumber} is missing its question section`);
    }
    const questionSection = lessonSource.slice(questionMarker);
    const supplementalStart = questionSection.search(
      new RegExp(`\\n---\\n\\n## 第${config.chapterOrdinal}章总结`),
    );
    const questions = parseQuestions(
      supplementalStart >= 0
        ? questionSection.slice(0, supplementalStart)
        : questionSection,
      config.keyPrefix
        ? config.questionKeys.map((key) => `${config.keyPrefix}-${key}`)
        : config.questionKeys,
      config.programmingLanguage ?? 'python',
      config.questionKeyOffset ?? 0,
    );
    const blocks = parseLessonBlocks(
      `${lessonSource.slice(0, questionMarker)}\n${
        supplementalStart >= 0 ? questionSection.slice(supplementalStart) : ''
      }`,
      lessonKey,
    );
    if (lessonNumber === 1) {
      blocks.unshift(
        {
          key: `${lessonKey}-chapter-objectives-heading`,
          type: 'HEADING',
          text: '本章学习目标',
          level: 2,
        },
        {
          key: `${lessonKey}-chapter-objectives-text`,
          type: 'TEXT',
          text: chapterObjectives,
        },
      );
    }
    return {
      key: lessonKey,
      title: `课时 ${lessonNumber}：${match[2]!.trim()}`,
      summary: requiredMatch(
        lessonSource,
        /^课时简介：(.+)$/m,
        `lesson ${lessonNumber} summary`,
      ),
      estimatedMinutes: Number(
        requiredMatch(
          lessonSource,
          /^预计学习时间：(\d+) 分钟$/m,
          `lesson ${lessonNumber} estimated minutes`,
        ),
      ),
      blocks,
      questions,
    };
  });

  const questions = lessons.flatMap((lesson) => lesson.questions);
  if (questions.length !== config.questionKeys.length) {
    throw new Error(
      `Python chapter ${config.chapterNumber} must contain ${config.questionKeys.length} questions`,
    );
  }

  return {
    key: config.chapterKey,
    title: requiredMatch(
      normalized,
      new RegExp(`^# (第${config.chapterOrdinal}章：.+)$`, 'm'),
      `chapter ${config.chapterNumber} title`,
    ),
    summary: requiredMatch(
      normalized,
      /^章节简介：(.+)$/m,
      `chapter ${config.chapterNumber} summary`,
    ),
    estimatedMinutes: Number(
      requiredMatch(
        normalized,
        new RegExp(
          `^# 第${config.chapterOrdinal}章：.+\\n\\n章节简介：.+\\n\\n?预计学习时间：(\\d+) 分钟$`,
          'm',
        ),
        `chapter ${config.chapterNumber} estimated minutes`,
      ),
    ),
    sortOrder: config.chapterNumber,
    quizTitle: config.quizTitle,
    quizDescription: config.quizDescription,
    passScorePercent: config.passScorePercent,
    lessons,
  };
}

export const PYTHON_BASIC_CHAPTER_03 = parsePythonChapterSource(
  readSeedDocument('python-basic-chapter-03.md'),
  {
    chapterNumber: 3,
    chapterOrdinal: '三',
    chapterKey: 'python-input-conversion-and-formatted-output',
    lessonKeys: LESSON_KEYS,
    questionKeys: QUESTION_KEYS,
    quizTitle: '输入、类型转换与格式化输出章节测验',
    quizDescription:
      '检验你是否掌握 input()、int()、float()、str()、print() 多参数输出和 f-string。提交后可查看每题答案与解析。',
    passScorePercent: 70,
  },
);
