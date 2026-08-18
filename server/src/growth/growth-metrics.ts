import type {
  GrowthChapterPerformance,
  GrowthConfidence,
  GrowthDataState,
  GrowthDimensionStatus,
  GrowthStrength,
} from './growth.types';

export const GROWTH_MIN_SAMPLE = 5;
export const GROWTH_STABLE_SAMPLE = 10;
export const GROWTH_WEAK_THRESHOLD = 60;
export const GROWTH_STRONG_THRESHOLD = 80;
export const GROWTH_QUIZ_WEIGHT = 0.5;
export const GROWTH_PRACTICE_WEIGHT = 0.5;

export type AnswerMetric = {
  answeredCount: number;
  correctCount: number;
};

export type ChapterMetricInput = {
  chapterId: string;
  chapterTitle: string;
  courseId: string;
  courseTitle: string;
  started: boolean;
  quiz: AnswerMetric;
  practice: AnswerMetric;
};

export function calculateAccuracy(metric: AnswerMetric): number | null {
  if (metric.answeredCount <= 0) {
    return null;
  }

  return Math.round((metric.correctCount / metric.answeredCount) * 10000) / 100;
}

export function calculateSmoothedAccuracy(metric: AnswerMetric): number | null {
  if (metric.answeredCount <= 0) {
    return null;
  }

  return ((metric.correctCount + 1) / (metric.answeredCount + 2)) * 100;
}

export function getDimensionStatus(
  answeredCount: number,
  started: boolean,
): GrowthDimensionStatus {
  if (!started) {
    return 'NOT_STARTED';
  }

  if (answeredCount <= 0) {
    return 'NO_SAMPLE';
  }

  if (answeredCount < GROWTH_MIN_SAMPLE) {
    return 'INSUFFICIENT_SAMPLE';
  }

  return 'ASSESSED';
}

export function getConfidence(answeredCount: number): GrowthConfidence {
  if (answeredCount <= 0) {
    return 'NONE';
  }

  if (answeredCount < GROWTH_MIN_SAMPLE) {
    return 'NONE';
  }

  if (answeredCount < GROWTH_STABLE_SAMPLE) {
    return 'TENTATIVE';
  }

  return 'STABLE';
}

export function classifyStrength(
  score: number | null,
  answeredCount: number,
): GrowthStrength {
  if (score === null || answeredCount < GROWTH_STABLE_SAMPLE) {
    return null;
  }

  if (score < GROWTH_WEAK_THRESHOLD) {
    return 'WEAK';
  }

  if (score >= GROWTH_STRONG_THRESHOLD) {
    return 'STRONG';
  }

  return 'NORMAL';
}

export function combineChapterMastery(
  quiz: AnswerMetric,
  practice: AnswerMetric,
): number | null {
  const sources = [
    {
      metric: quiz,
      weight: GROWTH_QUIZ_WEIGHT,
    },
    {
      metric: practice,
      weight: GROWTH_PRACTICE_WEIGHT,
    },
  ].filter((source) => source.metric.answeredCount > 0);

  if (sources.length === 0) {
    return null;
  }

  const totalWeight = sources.reduce((sum, source) => sum + source.weight, 0);
  const weightedScore = sources.reduce(
    (sum, source) =>
      sum + (calculateSmoothedAccuracy(source.metric) ?? 0) * source.weight,
    0,
  );

  return Math.round((weightedScore / totalWeight) * 100) / 100;
}

export function buildChapterPerformance(
  input: ChapterMetricInput,
): GrowthChapterPerformance {
  const answeredCount = input.quiz.answeredCount + input.practice.answeredCount;
  const correctCount = input.quiz.correctCount + input.practice.correctCount;
  const masteryScore = combineChapterMastery(input.quiz, input.practice);
  const observedAccuracy = calculateAccuracy({ answeredCount, correctCount });

  return {
    chapterId: input.chapterId,
    chapterTitle: input.chapterTitle,
    courseId: input.courseId,
    courseTitle: input.courseTitle,
    answeredCount,
    correctCount,
    accuracy: observedAccuracy,
    quizAnsweredCount: input.quiz.answeredCount,
    quizCorrectCount: input.quiz.correctCount,
    quizAccuracy: calculateAccuracy(input.quiz),
    practiceAnsweredCount: input.practice.answeredCount,
    practiceCorrectCount: input.practice.correctCount,
    practiceAccuracy: calculateAccuracy(input.practice),
    masteryScore,
    status: getDimensionStatus(answeredCount, input.started),
    confidence: getConfidence(answeredCount),
    // Smoothing stabilizes the displayed mastery score; classification uses the
    // observed accuracy so a stable 60% result is not pushed below the weak boundary.
    strength: classifyStrength(observedAccuracy, answeredCount),
  };
}

export function resolveGrowthDataState(
  hasAnyActivity: boolean,
  chapters: GrowthChapterPerformance[],
): GrowthDataState {
  if (!hasAnyActivity) {
    return 'NO_DATA';
  }

  return chapters.some((chapter) => chapter.status === 'ASSESSED')
    ? 'READY'
    : 'PARTIAL';
}

export const SHANGHAI_TIMEZONE = 'Asia/Shanghai' as const;
const SHANGHAI_OFFSET_MS = 8 * 60 * 60 * 1000;

export function toShanghaiDateKey(value: Date): string {
  return new Date(value.getTime() + SHANGHAI_OFFSET_MS)
    .toISOString()
    .slice(0, 10);
}

export function getShanghaiDayStart(value: Date): Date {
  const shifted = new Date(value.getTime() + SHANGHAI_OFFSET_MS);
  shifted.setUTCHours(0, 0, 0, 0);
  return new Date(shifted.getTime() - SHANGHAI_OFFSET_MS);
}

export function listShanghaiDateKeys(now: Date, days: number): string[] {
  const todayStart = getShanghaiDayStart(now);
  const keys: string[] = [];

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(todayStart.getTime() - offset * 24 * 60 * 60 * 1000);
    keys.push(toShanghaiDateKey(date));
  }

  return keys;
}

export function isWithinDateRange(
  value: Date,
  start: Date,
  end: Date,
): boolean {
  const timestamp = value.getTime();
  return timestamp >= start.getTime() && timestamp <= end.getTime();
}
