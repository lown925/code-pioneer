export type LearningStatus = 'NOT_STARTED' | 'LEARNING' | 'COMPLETED';

export type LearningChapterSummary = {
  chapterId: string;
  title: string;
};

export type LearningCourseItem = {
  courseId: string;
  courseName: string;
  coverUrl: string | null;
  status: LearningStatus;
  progressPercent: number;
  completedChapterCount: number;
  totalChapterCount: number;
  lastLearnedChapter: LearningChapterSummary | null;
  startedAt: string | null;
  lastLearnedAt: string | null;
  completedAt: string | null;
};

export type LearningPagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type LearningListResponse = {
  items: LearningCourseItem[];
  pagination: LearningPagination;
};

export type LearningListQuery = {
  page?: number;
  pageSize?: number;
  status?: Exclude<LearningStatus, 'NOT_STARTED'>;
};

export type CourseProgressChapter = {
  chapterId: string;
  title: string;
  sortOrder: number;
  status: LearningStatus;
  startedAt: string | null;
  lastLearnedAt: string | null;
  completedAt: string | null;
  hasQuiz: boolean;
  quizCompleted: boolean;
};

export type CourseProgress = {
  courseId: string;
  status: LearningStatus;
  progressPercent: number;
  completedChapterCount: number;
  totalChapterCount: number;
  startedAt: string | null;
  lastLearnedAt: string | null;
  completedAt: string | null;
  lastLearnedChapter: LearningChapterSummary | null;
  chapters: CourseProgressChapter[];
};

export type CourseProgressResponse = CourseProgress;

export type LearningSummary = {
  inProgressCourseCount: number;
  completedCourseCount: number;
  completedChapterCount: number;
  totalQuizAnswerCount: number;
  quizAccuracyPercent: number;
  learningWrongQuestionCount: number;
  continueLearningCourse: LearningCourseItem | null;
};

export type LearningSummaryResponse = LearningSummary;
