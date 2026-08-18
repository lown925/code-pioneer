import type {
  GrowthChapterPerformance,
  GrowthPriority,
  GrowthRecommendation,
  GrowthRecommendationContext,
} from './growth.types';

type Candidate = GrowthRecommendation & {
  confidence: number;
  severity: number;
  recency: number;
};

const PRIORITY_ORDER: Record<GrowthPriority, number> = {
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

const UUID_OR_ID = '[^&?#]+';

export function isAllowedGrowthTargetPath(path: string): boolean {
  return (
    path === '/pages/learning/index' ||
    path === '/pages/practice/index' ||
    path === '/pages/wrong-question/index' ||
    path === '/pages/battle/index' ||
    path === '/pages/growth/profile' ||
    new RegExp(`^/pages/chapter/detail\\?chapterId=${UUID_OR_ID}$`).test(
      path,
    ) ||
    new RegExp(
      `^/pages/learning/course-progress\\?courseId=${UUID_OR_ID}$`,
    ).test(path)
  );
}

function recommendation(
  candidate: Omit<Candidate, 'targetPath'> & { targetPath: string },
): Candidate | null {
  if (!isAllowedGrowthTargetPath(candidate.targetPath)) {
    return null;
  }

  return candidate;
}

function chapterPath(chapter: GrowthChapterPerformance): string {
  return `/pages/chapter/detail?chapterId=${encodeURIComponent(chapter.chapterId)}`;
}

function prioritySort(left: Candidate, right: Candidate) {
  return (
    PRIORITY_ORDER[right.priority] - PRIORITY_ORDER[left.priority] ||
    right.confidence - left.confidence ||
    right.severity - left.severity ||
    right.recency - left.recency
  );
}

function weakestPracticeChapter(chapters: GrowthChapterPerformance[]) {
  return [...chapters]
    .filter(
      (chapter) =>
        chapter.practiceAnsweredCount >= 5 && chapter.practiceAccuracy !== null,
    )
    .sort(
      (left, right) =>
        (left.practiceAccuracy ?? 100) - (right.practiceAccuracy ?? 100),
    )[0];
}

function weakestCombinedChapter(chapters: GrowthChapterPerformance[]) {
  return [...chapters]
    .filter(
      (chapter) =>
        chapter.quizAnsweredCount >= 5 &&
        chapter.practiceAnsweredCount >= 5 &&
        chapter.quizAccuracy !== null &&
        chapter.practiceAccuracy !== null,
    )
    .sort(
      (left, right) => (left.masteryScore ?? 100) - (right.masteryScore ?? 100),
    )[0];
}

export function buildGrowthRecommendations(
  context: GrowthRecommendationContext,
): GrowthRecommendation[] {
  const candidates: Candidate[] = [];
  const practiceChapter = weakestPracticeChapter(context.chapters);
  const combinedChapter = weakestCombinedChapter(context.chapters);

  if (
    context.goal &&
    context.goal.status === 'ACTIVE' &&
    context.goal.paceStatus === 'BEHIND' &&
    context.goal.remainingChapters > 0
  ) {
    const item = recommendation({
      type: 'RULE_GOAL_BEHIND',
      title: `追回${context.goal.courseTitle}学习进度`,
      reason:
        context.goal.requiredChaptersPerWeek === null
          ? `目标已到截止日期，还剩 ${context.goal.remainingChapters} 个章节。`
          : `按照当前目标，本周还需要完成约 ${Math.ceil(
              context.goal.requiredChaptersPerWeek,
            )} 个章节。`,
      actionLabel: '继续学习',
      targetPath: `/pages/learning/course-progress?courseId=${encodeURIComponent(
        context.goal.courseId,
      )}`,
      priority: 'HIGH',
      confidence: 4,
      severity: 4,
      recency: 4,
    });
    if (item) candidates.push(item);
  }

  if (
    context.goal &&
    context.goal.status === 'ACTIVE' &&
    context.goal.paceStatus === 'AHEAD'
  ) {
    const item = recommendation({
      type: 'RULE_GOAL_AHEAD',
      title: '保持当前学习节奏',
      reason: `你在${context.goal.courseTitle}的目标进度领先计划，可以继续完成下一章节。`,
      actionLabel: '继续学习',
      targetPath: `/pages/learning/course-progress?courseId=${encodeURIComponent(
        context.goal.courseId,
      )}`,
      priority: 'LOW',
      confidence: 2,
      severity: 1,
      recency: 2,
    });
    if (item) candidates.push(item);
  }

  if (
    combinedChapter &&
    (combinedChapter.quizAccuracy ?? 100) < 60 &&
    (combinedChapter.practiceAccuracy ?? 100) < 60
  ) {
    const item = recommendation({
      type: 'REVIEW_CHAPTER',
      title: `复习${combinedChapter.chapterTitle}`,
      reason: 'Quiz 与 Practice 的近期表现都需要巩固，建议回到章节重新梳理。',
      actionLabel: '查看章节',
      targetPath: chapterPath(combinedChapter),
      priority: 'HIGH',
      confidence: 3,
      severity: 3,
      recency: 3,
    });
    if (item) candidates.push(item);
  }

  if (practiceChapter && (practiceChapter.practiceAccuracy ?? 100) < 60) {
    const item = recommendation({
      type: 'PRACTICE_WEAK_CHAPTER',
      title: `练习${practiceChapter.chapterTitle}`,
      reason: `Practice 正确率为 ${practiceChapter.practiceAccuracy ?? 0}%，建议再练习一次。`,
      actionLabel: '开始练习',
      targetPath: '/pages/practice/index',
      priority: 'HIGH',
      confidence: practiceChapter.confidence === 'STABLE' ? 3 : 2,
      severity: 3,
      recency: 2,
    });
    if (item) candidates.push(item);
  }

  if (context.wrongQuestions.repeatedWrongQuestions > 0) {
    const item = recommendation({
      type: 'REVIEW_WRONG_QUESTIONS',
      title: '复习重复错题',
      reason: `有 ${context.wrongQuestions.repeatedWrongQuestions} 道题出现重复错误，建议集中复习。`,
      actionLabel: '查看错题',
      targetPath: '/pages/wrong-question/index',
      priority: 'HIGH',
      confidence: 3,
      severity: 3,
      recency: 2,
    });
    if (item) candidates.push(item);
  }

  const quizAccuracy = context.quiz.accuracy;
  const battleAccuracy =
    context.battle.ranked.answeredCount > 0
      ? context.battle.ranked.accuracy
      : context.battle.training.accuracy;
  if (
    quizAccuracy !== null &&
    context.quiz.answeredCount >= 5 &&
    battleAccuracy !== null &&
    context.battle.ranked.answeredCount +
      context.battle.training.answeredCount >=
      5 &&
    quizAccuracy >= 80 &&
    battleAccuracy <= quizAccuracy - 15
  ) {
    const item = recommendation({
      type: 'THEORY_TO_PRACTICE_GAP',
      title: '把理解带到实战中',
      reason:
        'Quiz 表现不错，但 Battle/Training 还有明显差距，建议进行一次实战练习。',
      actionLabel: '进入 Battle',
      targetPath: '/pages/battle/index',
      priority: 'MEDIUM',
      confidence: 2,
      severity: 2,
      recency: 2,
    });
    if (item) candidates.push(item);
  }

  if (context.quiz.answeredCount >= 5 && context.practice.answeredCount === 0) {
    const item = recommendation({
      type: 'START_PRACTICE',
      title: '开始一次 Practice',
      reason:
        '你已经完成了一些 Quiz，Practice 可以帮助你把知识转化为答题熟练度。',
      actionLabel: '开始练习',
      targetPath: '/pages/practice/index',
      priority: 'MEDIUM',
      confidence: 2,
      severity: 1,
      recency: 1,
    });
    if (item) candidates.push(item);
  }

  if (
    context.activity.recent7ActiveDays <= 1 &&
    context.activity.previous23ActiveDays >= 3
  ) {
    const targetPath = context.continueLearning
      ? `/pages/learning/course-progress?courseId=${encodeURIComponent(
          context.continueLearning.courseId,
        )}`
      : '/pages/learning/index';
    const item = recommendation({
      type: 'RETURN_TO_LEARNING',
      title: '继续你的学习计划',
      reason: '最近一周的学习活动减少了，可以从上次停下的课程继续。',
      actionLabel: '继续学习',
      targetPath,
      priority: 'MEDIUM',
      confidence: 2,
      severity: 2,
      recency: 3,
    });
    if (item) candidates.push(item);
  }

  if (context.continueLearning) {
    const item = recommendation({
      type: 'CONTINUE_COURSE',
      title: `继续${context.continueLearning.courseTitle}`,
      reason: '保持当前课程进度，完成下一章节。',
      actionLabel: '继续学习',
      targetPath: `/pages/learning/course-progress?courseId=${encodeURIComponent(
        context.continueLearning.courseId,
      )}`,
      priority: 'LOW',
      confidence: 2,
      severity: 1,
      recency: 2,
    });
    if (item) candidates.push(item);
  }

  if (context.battle.ratingTrend.length >= 3) {
    const recent = context.battle.ratingTrend.slice(-3);
    const delta = recent.reduce((sum, item) => sum + item.ratingDelta, 0);
    if (delta <= -15) {
      const item = recommendation({
        type: 'REVIEW_BATTLE_PERFORMANCE',
        title: '复盘最近的 Battle 表现',
        reason: '最近几场 Ranked Rating 有下降，建议先练习再继续匹配。',
        actionLabel: '开始练习',
        targetPath: '/pages/practice/index',
        priority: 'MEDIUM',
        confidence: 2,
        severity: 2,
        recency: 3,
      });
      if (item) candidates.push(item);
    }
  }

  if (!context.profile.isCoreProfileComplete) {
    const item = recommendation({
      type: 'COMPLETE_PROFILE',
      title: '完善成长画像',
      reason: '补充专业和学习方向后，后续建议会更贴合你的目标。',
      actionLabel: '完善画像',
      targetPath: '/pages/growth/profile',
      priority: 'LOW',
      confidence: 1,
      severity: 1,
      recency: 1,
    });
    if (item) candidates.push(item);
  }

  if (
    candidates.length === 0 ||
    context.activity.battleCount +
      context.quiz.attemptCount +
      context.practice.attemptCount ===
      0
  ) {
    const item = recommendation({
      type: 'EXPLORE_GROWTH',
      title: '开始建立成长数据',
      reason: '完成课程、练习或 Battle 后，这里会逐步形成你的成长分析。',
      actionLabel: '开始学习',
      targetPath: '/pages/learning/index',
      priority: 'LOW',
      confidence: 1,
      severity: 1,
      recency: 0,
    });
    if (item) candidates.push(item);
  }

  return candidates
    .sort(prioritySort)
    .filter(
      (item, index, items) =>
        items.findIndex((candidate) => candidate.type === item.type) === index,
    )
    .slice(0, 3)
    .map(
      ({
        confidence: _confidence,
        severity: _severity,
        recency: _recency,
        ...item
      }) => item,
    );
}
