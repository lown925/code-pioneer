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
