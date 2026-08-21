export type GrowthRange = '7d' | '30d';

export type GrowthDataState = 'NO_DATA' | 'PARTIAL' | 'READY';

export type GrowthDimensionStatus =
  'NOT_STARTED' | 'NO_SAMPLE' | 'INSUFFICIENT_SAMPLE' | 'ASSESSED';

export type GrowthConfidence = 'NONE' | 'TENTATIVE' | 'STABLE';

export type GrowthStrength = 'WEAK' | 'NORMAL' | 'STRONG' | null;

export type GrowthPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export type GrowthLearningGoalStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export type GrowthGoalPaceStatus = 'AHEAD' | 'ON_TRACK' | 'BEHIND';

export type GrowthLearningGoal = {
  id: string;
  userId: string;
  courseId: string;
  courseTitle: string;
  targetDate: string;
  status: GrowthLearningGoalStatus;
  startedAt: string;
  completedAt: string | null;
  totalChapters: number;
  completedChapters: number;
  remainingChapters: number;
  remainingDays: number;
  requiredChaptersPerDay: number | null;
  requiredChaptersPerWeek: number | null;
  progressPercent: number;
  plannedProgressPercent: number;
  paceStatus: GrowthGoalPaceStatus;
};

export type GrowthPerformanceSummary = {
  attemptCount: number;
  completedAttemptCount: number;
  answeredCount: number;
  correctCount: number;
  accuracy: number | null;
};

export type GrowthProfileSummary = {
  major: string | null;
  professionalTrack?: {
    trackKey: string;
    formalName: string;
    shortName: string;
  } | null;
  grade: string | null;
  learningDirection: string | null;
  technicalInterests: string[];
  careerDirection: string | null;
  isCoreProfileComplete: boolean;
};

export type GrowthActivitySummary = {
  activeDays: number;
  recent7ActiveDays: number;
  previous23ActiveDays: number;
  completedChapters: number;
  quizAttempts: number;
  practiceAttempts: number;
  battleCount: number;
  rankedBattles: number;
  trainingBattles: number;
  friendBattles: number;
};

export type GrowthTrendPoint = {
  date: string;
  quizAttempts: number;
  quizAnswered: number;
  quizAccuracy: number | null;
  practiceAttempts: number;
  practiceAnswered: number;
  practiceAccuracy: number | null;
  activityCount: number;
};

export type GrowthChapterPerformance = {
  chapterId: string;
  chapterTitle: string;
  courseId: string;
  courseTitle: string;
  answeredCount: number;
  correctCount: number;
  accuracy: number | null;
  quizAnsweredCount: number;
  quizCorrectCount: number;
  quizAccuracy: number | null;
  practiceAnsweredCount: number;
  practiceCorrectCount: number;
  practiceAccuracy: number | null;
  masteryScore: number | null;
  status: GrowthDimensionStatus;
  confidence: GrowthConfidence;
  strength: GrowthStrength;
};

export type GrowthContinueLearning = {
  courseId: string;
  courseTitle: string;
  chapterId: string | null;
  chapterTitle: string | null;
  progressPercent: number;
} | null;

export type GrowthWrongArea = {
  courseId: string | null;
  courseTitle: string;
  chapterId: string | null;
  chapterTitle: string;
  wrongCount: number;
  wrongAttempts: number;
  uniqueWrongQuestions: number;
};

export type GrowthWrongQuestionSummary = {
  uniqueWrongQuestions: number;
  totalWrongAttempts: number;
  repeatedWrongQuestions: number;
  topWeakAreas: GrowthWrongArea[];
  areas: GrowthWrongArea[];
};

export type GrowthRatingTrendPoint = {
  ratingBefore: number;
  ratingAfter: number;
  ratingDelta: number;
  createdAt: string;
  skillCode: string;
  professionalTrackKey?: string;
};

export type GrowthBattleSkillSummary = {
  code: string;
  name: string;
  isEnabled: boolean;
  rating: number | null;
  highestRating: number | null;
  rankedBattles: number;
  trainingBattles: number;
  friendBattles: number;
  ranked: GrowthPerformanceSummary;
  training: GrowthPerformanceSummary;
  friend: GrowthPerformanceSummary;
  ratingTrend: GrowthRatingTrendPoint[];
};

export type GrowthBattleTrackSummary = {
  trackKey: string;
  formalName: string;
  shortName: string;
  rating: number | null;
  highestRating: number | null;
  rankedBattles: number;
  trainingBattles: number;
  friendBattles: number;
  ranked: GrowthPerformanceSummary;
  training: GrowthPerformanceSummary;
  friend: GrowthPerformanceSummary;
  ratingTrend: GrowthRatingTrendPoint[];
};

export type GrowthBattleSummary = {
  skills: GrowthBattleSkillSummary[];
  defaultSkillCode: string | null;
  tracks?: GrowthBattleTrackSummary[];
  defaultTrackKey?: string | null;
  rankedBattles: number;
  trainingBattles: number;
  friendBattles: number;
  ranked: GrowthPerformanceSummary;
  training: GrowthPerformanceSummary;
  friend: GrowthPerformanceSummary;
  currentPythonRating: number | null;
  ratingTrend: GrowthRatingTrendPoint[];
};

export type GrowthRecommendation = {
  type: string;
  title: string;
  reason: string;
  actionLabel: string;
  targetPath: string;
  priority: GrowthPriority;
};

export type GrowthOverviewResponse = {
  meta: {
    range: GrowthRange;
    timezone: 'Asia/Shanghai';
    generatedAt: string;
  };
  profile: GrowthProfileSummary;
  dataState: GrowthDataState;
  activity: GrowthActivitySummary;
  learning: {
    quiz: GrowthPerformanceSummary;
    practice: GrowthPerformanceSummary;
    trend: GrowthTrendPoint[];
    continueLearning: GrowthContinueLearning;
  };
  competency: {
    chapters: GrowthChapterPerformance[];
  };
  wrongQuestions: GrowthWrongQuestionSummary;
  goal: GrowthLearningGoal | null;
  battle: GrowthBattleSummary;
  recommendations: GrowthRecommendation[];
};

export type GrowthRecommendationContext = {
  profile: GrowthProfileSummary;
  activity: GrowthActivitySummary;
  quiz: GrowthPerformanceSummary;
  practice: GrowthPerformanceSummary;
  chapters: GrowthChapterPerformance[];
  wrongQuestions: GrowthWrongQuestionSummary;
  goal?: GrowthLearningGoal | null;
  battle: GrowthBattleSummary;
  continueLearning: GrowthContinueLearning;
};
