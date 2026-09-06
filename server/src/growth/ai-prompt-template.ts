import type { GrowthAiPromptContext } from './ai-prompt.types';

const MAX_TEXT_LENGTH = 90;

const GRADE_LABELS: Record<string, string> = {
  'grade.freshman': '大一',
  'grade.sophomore': '大二',
  'grade.junior': '大三',
  'grade.senior': '大四',
  'grade.vocational': '专科',
  'grade.postgraduate': '研究生',
  'grade.working': '在职学习',
};

const CAREER_DIRECTION_LABELS: Record<string, string> = {
  'career.frontend_engineer': '前端工程师',
  'career.backend_engineer': '后端工程师',
  'career.data_analyst': '数据分析师',
  'career.algorithm_engineer': '算法工程师',
  'career.test_engineer': '测试工程师',
  'career.database_engineer': '数据库工程师',
};

const TECHNICAL_INTEREST_LABELS: Record<string, string> = {
  'interest.python': 'Python',
  'interest.javascript': 'JavaScript',
  'interest.java': 'Java',
  'interest.sql': 'SQL',
  'interest.data_visualization': '数据可视化',
  'interest.database': '数据库',
  'interest.algorithm': '算法',
  'interest.web': 'Web 开发',
  'interest.ai_ml': 'AI / ML',
  'interest.linux': 'Linux',
  'interest.system': '系统',
  'interest.operations': '运维',
  'interest.backend': '后端开发',
  'interest.data_processing': '数据处理',
  'interest.data_analysis': '数据分析',
  'interest.distributed_computing': '分布式计算',
  'interest.spark': 'Spark',
  'interest.network': '网络',
  'interest.network_security': '网络安全基础',
  'interest.operating_system': '操作系统',
  'interest.computer_foundations': '计算机基础',
  'interest.software_development': '软件开发',
  'interest.project_development': '项目开发',
  'interest.teamwork': '团队协作',
};

function cleanText(value: unknown, maxLength = MAX_TEXT_LENGTH) {
  if (typeof value !== 'string') {
    return '';
  }

  const normalized = value.trim();
  return /^(?:undefined|null|nan|n\/a)$/iu.test(normalized)
    ? ''
    : normalized.slice(0, maxLength);
}

function cleanCustomValue(value: string) {
  const trimmed = cleanText(value);
  return cleanText(trimmed.replace(/^custom:/iu, ''), MAX_TEXT_LENGTH);
}

export function formatGrowthGrade(value: string | null | undefined) {
  const normalized = cleanText(value);
  return (
    GRADE_LABELS[normalized] ??
    (normalized.startsWith('custom:')
      ? cleanCustomValue(normalized)
      : normalized)
  );
}

export function formatGrowthCareerDirection(value: string | null | undefined) {
  const normalized = cleanText(value);
  return (
    CAREER_DIRECTION_LABELS[normalized] ??
    (normalized.startsWith('custom:')
      ? cleanCustomValue(normalized)
      : normalized)
  );
}

export function formatGrowthTechnicalInterest(value: string) {
  const normalized = cleanText(value, 80);
  return (
    TECHNICAL_INTEREST_LABELS[normalized] ??
    (normalized.startsWith('custom:')
      ? cleanCustomValue(normalized)
      : normalized)
  );
}

function optionalLine(label: string, value: string | undefined) {
  return value ? `- ${label}：${value}` : '';
}

function formatAccuracy(value: number | undefined) {
  return typeof value === 'number' && Number.isFinite(value) ? `${value}%` : '';
}

function formatCount(value: number | undefined) {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.max(0, Math.round(value))
    : 0;
}

function formatCourseLine(
  course: GrowthAiPromptContext['learningCourses'][number],
) {
  const title = cleanText(course.title);
  if (!title) {
    return '';
  }

  const progress =
    typeof course.progressPercent === 'number' &&
    Number.isFinite(course.progressPercent)
      ? `（进度 ${Math.max(0, Math.min(100, Math.round(course.progressPercent)))}%）`
      : '';
  return `- ${title}${progress}`;
}

function formatWeakAreaLine(area: GrowthAiPromptContext['weakAreas'][number]) {
  const courseTitle = cleanText(area.courseTitle);
  const chapterTitle = cleanText(area.chapterTitle);
  const subject = [courseTitle, chapterTitle].filter(Boolean).join(' / ');
  if (!subject) {
    return '';
  }

  const errorCount =
    typeof area.errorCount === 'number' &&
    Number.isFinite(area.errorCount) &&
    area.errorCount > 0
      ? `（错误 ${Math.round(area.errorCount)} 次）`
      : '';
  return `- ${subject}${errorCount}`;
}

export function buildGrowthAiPrompt(context: GrowthAiPromptContext) {
  const profileLines = [
    optionalLine('年级', cleanText(context.gradeLabel)),
    optionalLine('专业', cleanText(context.professionalTrackName)),
    optionalLine('职业目标', cleanText(context.careerDirectionLabel)),
    context.technicalInterests && context.technicalInterests.length > 0
      ? `- 技术兴趣：${context.technicalInterests
          .map((item) => formatGrowthTechnicalInterest(item))
          .map((item) => cleanText(item, 80))
          .filter(Boolean)
          .slice(0, 5)
          .join('、')}`
      : '',
  ].filter(Boolean);

  const learningLines: string[] = [];
  const completedCourses = context.completedCourses
    .map((course) => cleanText(course))
    .filter(Boolean)
    .slice(0, 8);
  const learningCourses = context.learningCourses
    .map(formatCourseLine)
    .filter(Boolean)
    .slice(0, 5);

  if (completedCourses.length > 0) {
    learningLines.push(`- 已完成课程：${completedCourses.join('、')}`);
  }
  if (learningCourses.length > 0) {
    learningLines.push('- 正在学习课程：');
    learningLines.push(...learningCourses);
  }

  if (context.learningSummary) {
    const completed = Number.isFinite(
      context.learningSummary.completedCourseCount,
    )
      ? Math.max(0, Math.round(context.learningSummary.completedCourseCount))
      : null;
    const learning = Number.isFinite(
      context.learningSummary.learningCourseCount,
    )
      ? Math.max(0, Math.round(context.learningSummary.learningCourseCount))
      : null;
    if (
      completed !== null &&
      learning !== null &&
      (completed > 0 || learning > 0)
    ) {
      learningLines.push(
        `- 整体学习概况：已完成 ${completed} 门课程，正在学习 ${learning} 门课程`,
      );
    }
  }

  if (
    context.quizSummary &&
    Number.isFinite(context.quizSummary.answeredQuestions) &&
    context.quizSummary.answeredQuestions > 0
  ) {
    const quiz = context.quizSummary;
    const accuracy = formatAccuracy(quiz.accuracyPercent);
    learningLines.push(
      `- Quiz 概况：完成 ${formatCount(quiz.completedAttempts)} 次，共回答 ${formatCount(quiz.answeredQuestions)} 道题，正确 ${formatCount(quiz.correctQuestions)} 道${accuracy ? `，正确率 ${accuracy}` : ''}`,
    );
  }

  if (
    context.practiceSummary &&
    Number.isFinite(context.practiceSummary.answeredQuestions) &&
    context.practiceSummary.answeredQuestions > 0
  ) {
    const practice = context.practiceSummary;
    const accuracy = formatAccuracy(practice.accuracyPercent);
    learningLines.push(
      `- Practice 概况：完成 ${formatCount(practice.completedAttempts)} 次，共回答 ${formatCount(practice.answeredQuestions)} 道题，正确 ${formatCount(practice.correctQuestions)} 道${accuracy ? `，正确率 ${accuracy}` : ''}`,
    );
  }

  const weakLines = context.weakAreas
    .map(formatWeakAreaLine)
    .filter(Boolean)
    .slice(0, 5);

  const sections = [
    '你是一名面向计算机相关专业大学生的学习与职业成长顾问。',
    '',
    '请基于我提供的真实学习记录进行分析，不要虚构我没有完成过的课程、技能、项目或经历。',
    '',
    ...(profileLines.length > 0 ? ['我的情况：', ...profileLines, ''] : []),
    ...(learningLines.length > 0
      ? ['当前学习情况：', ...learningLines, '']
      : []),
    ...(weakLines.length > 0
      ? ['当前较薄弱的学习领域：', ...weakLines, '']
      : []),
    '请结合我的真实学习情况，为我制定未来 3～6 个月的成长计划。',
    '',
    '要求：',
    '1. 判断我当前最应该补强的能力',
    '2. 给出学习优先级，并说明排序依据',
    '3. 给出阶段性的学习路线',
    '4. 推荐 2～3 个适合大学生完成的项目',
    '5. 说明每个项目应该体现哪些技术能力',
    '6. 结合我的职业目标给出实习准备建议',
    '7. 给出简历中应该重点突出哪些内容',
    '8. 给出面试准备重点',
    '9. 最后生成一份可执行的 4 周行动清单',
    '10. 每周行动要有明确的学习主题、练习方式和完成标准',
    '',
    '请注意：',
    '- 不要给泛泛的励志建议',
    '- 不要把技术兴趣当成已经掌握的技能',
    '- 不要虚构课程、项目、实习经历',
    '- 如果职业目标和当前能力存在明显差距，请指出',
    '- 数据不足时明确说明数据不足',
    '- 优先结合课程、Quiz、Practice、薄弱领域',
    '- 输出中文',
    '- 不包含任何个人身份信息',
  ];

  return sections.join('\n').trim();
}
