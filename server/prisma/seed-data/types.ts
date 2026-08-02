import type {
  BattleQuestionDifficulty,
  BattleQuestionPresentation,
  ContentBlockType,
  CourseDifficulty,
  QuestionType,
} from '../../generated/prisma/enums';

export type SeedTextBlock = {
  key: string;
  type: 'TEXT';
  text: string;
};

export type SeedHeadingBlock = {
  key: string;
  type: 'HEADING';
  text: string;
  level?: 1 | 2 | 3;
};

export type SeedCodeBlock = {
  key: string;
  type: 'CODE';
  language: string;
  code: string;
  caption?: string;
};

export type SeedTipBlock = {
  key: string;
  type: 'TIP' | 'WARNING';
  text: string;
  title?: string;
};

export type SeedExampleBlock = {
  key: string;
  type: 'EXAMPLE';
  title?: string;
  description?: string;
  text?: string;
  language?: string;
  code?: string;
  caption?: string;
};

export type SeedLessonBlock =
  | SeedTextBlock
  | SeedHeadingBlock
  | SeedCodeBlock
  | SeedTipBlock
  | SeedExampleBlock;

export type SeedQuestionOption = {
  key: string;
  content: string;
  isCorrect: boolean;
};

export type SeedQuestionDifficulty = BattleQuestionDifficulty;

export type SeedSingleChoiceQuestion = {
  key: string;
  type: 'SINGLE_CHOICE';
  title: string;
  explanation: string;
  difficulty: SeedQuestionDifficulty;
  score: number;
  isBattleEnabled: boolean;
  battlePresentation: BattleQuestionPresentation;
  programmingLanguage?: string;
  stemBlocks?: Array<
    | {
        type: 'TEXT';
        text: string;
      }
    | {
        type: 'CODE';
        code: string;
        language?: string;
      }
  >;
  explanationBlocks?: Array<
    | {
        type: 'TEXT';
        text: string;
      }
    | {
        type: 'CODE';
        code: string;
        language?: string;
      }
  >;
  options: SeedQuestionOption[];
  tags?: string[];
};

export type SeedTrueFalseQuestion = {
  key: string;
  type: 'TRUE_FALSE';
  title: string;
  explanation: string;
  difficulty: SeedQuestionDifficulty;
  score: number;
  isBattleEnabled: false;
  options: [SeedQuestionOption, SeedQuestionOption];
  tags?: string[];
};

export type SeedCodeFillQuestion = {
  key: string;
  type: 'CODE_FILL';
  title: string;
  explanation: string;
  difficulty: SeedQuestionDifficulty;
  score: number;
  isBattleEnabled: boolean;
  battlePresentation: BattleQuestionPresentation;
  programmingLanguage: string;
  acceptedAnswers: string[];
  answerNormalization?: {
    trim?: boolean;
    normalizeLineEndings?: boolean;
    caseSensitive?: boolean;
    collapseWhitespace?: boolean;
  };
  stemBlocks?: Array<
    | {
        type: 'TEXT';
        text: string;
      }
    | {
        type: 'CODE';
        code: string;
        language?: string;
      }
  >;
  explanationBlocks?: Array<
    | {
        type: 'TEXT';
        text: string;
      }
    | {
        type: 'CODE';
        code: string;
        language?: string;
      }
  >;
  tags?: string[];
};

export type SeedQuestion =
  | SeedSingleChoiceQuestion
  | SeedTrueFalseQuestion
  | SeedCodeFillQuestion;

export type SeedLesson = {
  key: string;
  title: string;
  summary: string;
  estimatedMinutes: number;
  blocks: SeedLessonBlock[];
  questions: SeedQuestion[];
};

export type SeedChapter = {
  key: string;
  title: string;
  summary: string;
  estimatedMinutes: number;
  sortOrder: number;
  quizTitle: string;
  quizDescription: string;
  passScorePercent: number;
  lessons: SeedLesson[];
};

export type SeedCourse = {
  version: string;
  key: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  difficulty: CourseDifficulty;
  estimatedMinutes: number;
  targetAudience: string;
  learningObjectives: string[];
  status: 'PUBLISHED';
  sortOrder: number;
  chapters: SeedChapter[];
};

export const SUPPORTED_LESSON_BLOCK_TYPES = new Set<ContentBlockType>([
  'TEXT',
  'HEADING',
  'CODE',
  'TIP',
  'WARNING',
  'EXAMPLE',
]);

export const SUPPORTED_QUESTION_TYPES = new Set<QuestionType>([
  'SINGLE_CHOICE',
  'TRUE_FALSE',
  'CODE_FILL',
]);
