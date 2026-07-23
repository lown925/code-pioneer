export type WrongQuestionSource = 'LEARNING' | 'BATTLE';

export type WrongQuestionType = 'SINGLE_CHOICE' | 'TRUE_FALSE';

export type WrongQuestionListQuery = {
  courseId?: string;
  chapterId?: string;
  page?: number;
  pageSize?: number;
};

export type WrongQuestionListItem = {
  questionId: string;
  questionType: WrongQuestionType;
  questionContent: string;
  courseId: string;
  courseTitle: string;
  chapterId: string;
  chapterTitle: string;
  wrongCount: number;
  lastWrongAt: string;
};

export type WrongQuestionPagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type WrongQuestionListResponse = {
  items: WrongQuestionListItem[];
  pagination: WrongQuestionPagination;
};

export type WrongQuestionStatistics = {
  totalWrongQuestions: number;
  totalWrongAnswers: number;
  courseCount: number;
  latestWrongAt: string | null;
};

export type WrongQuestionStatisticsResponse = WrongQuestionStatistics;

export type WrongQuestionOption = {
  optionId: string;
  content: string;
  order: number;
};

export type WrongQuestionDetail = {
  questionId: string;
  questionType: WrongQuestionType;
  content: string;
  courseId: string;
  courseTitle: string;
  chapterId: string;
  chapterTitle: string;
  options: WrongQuestionOption[];
  correctOptionId: string;
  explanation: string | null;
  wrongCount: number;
  lastWrongAt: string;
};

export type WrongQuestionDetailResponse = WrongQuestionDetail;
