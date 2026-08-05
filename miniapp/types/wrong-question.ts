import type {
  BattleContentBlock,
  BattleQuestionDifficulty,
  BattleQuestionOptionSnapshotResponse,
  BattleQuestionPresentation,
  BattleQuestionType,
  BattleSubmittedAnswerResponse,
} from './battle';

export type WrongQuestionSource = 'LEARNING' | 'PRACTICE' | 'BATTLE';

export type WrongQuestionType = BattleQuestionType | 'TRUE_FALSE' | 'FILL_BLANK';

export type WrongQuestionListQuery = {
  source?: WrongQuestionSource;
  courseId?: string;
  chapterId?: string;
  page?: number;
  pageSize?: number;
};

export type WrongQuestionBattleReference = {
  battleId: string;
  completedAt: string | null;
  opponent: {
    userId: string;
    nickname: string | null;
    avatarUrl: string | null;
  } | null;
} | null;

export type WrongQuestionListItem = {
  source: WrongQuestionSource;
  questionId: string;
  battleQuestionSnapshotId: string | null;
  questionType: WrongQuestionType;
  questionContent: string;
  courseId: string | null;
  courseTitle: string | null;
  chapterId: string | null;
  chapterTitle: string | null;
  wrongCount: number;
  lastWrongAt: string;
  latestWrongAt: string;
  presentation: BattleQuestionPresentation | null;
  difficulty: BattleQuestionDifficulty | null;
  programmingLanguage: string | null;
  battle: WrongQuestionBattleReference;
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

export type WrongQuestionCorrectAnswer =
  | {
      type: 'SINGLE_CHOICE' | 'TRUE_FALSE';
      optionId: string;
    }
  | {
      type: 'FILL_BLANK' | 'CODE_FILL';
      acceptedAnswers: string[];
    };

export type WrongQuestionSubmittedAnswer =
  | BattleSubmittedAnswerResponse
  | { type: 'TRUE_FALSE'; optionId: string }
  | { type: 'FILL_BLANK'; value: string };

export type WrongQuestionDetail = {
  source: WrongQuestionSource;
  questionId: string;
  battleQuestionSnapshotId: string | null;
  questionType: WrongQuestionType;
  content: string;
  questionContent: string;
  courseId: string | null;
  courseTitle: string | null;
  chapterId: string | null;
  chapterTitle: string | null;
  options: WrongQuestionOption[] | null;
  correctOptionId: string | null;
  correctAnswer: WrongQuestionCorrectAnswer | null;
  explanation: string | BattleContentBlock[] | null;
  wrongCount: number;
  lastWrongAt: string;
  latestWrongAt: string;
  presentation: BattleQuestionPresentation | null;
  difficulty: BattleQuestionDifficulty | null;
  programmingLanguage: string | null;
  stem: BattleContentBlock[] | null;
  optionSnapshots: BattleQuestionOptionSnapshotResponse[] | null;
  latestWrongAnswer: WrongQuestionSubmittedAnswer | null;
  sourceQuizQuestionId: string | null;
  battle: WrongQuestionBattleReference;
};

export type WrongQuestionDetailResponse = WrongQuestionDetail;
