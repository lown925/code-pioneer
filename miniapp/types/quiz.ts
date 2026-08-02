import type { BattleContentBlock } from './battle';

export type ChapterQuizQuestionType = 'SINGLE_CHOICE' | 'TRUE_FALSE' | string;

export type ChapterQuizOption = {
  optionId: string;
  content: string;
  contentBlocks: BattleContentBlock[];
  order: number;
};

export type ChapterQuizQuestion = {
  questionId: string;
  type: ChapterQuizQuestionType;
  content: string;
  stemBlocks: BattleContentBlock[];
  score: number;
  order: number;
  options: ChapterQuizOption[];
};

export type ChapterQuizData = {
  quizId: string;
  chapterId: string;
  title: string;
  description: string | null;
  questionCount: number;
  totalScore: number;
  passScorePercent: number;
  hasPassed: boolean;
  attemptCount: number;
  questions: ChapterQuizQuestion[];
};

export type SubmitChapterQuizAnswer = {
  questionId: string;
  selectedOptionId: string;
};

export type SubmitChapterQuizResult = {
  questionId: string;
  selectedOptionId: string;
  correctOptionId: string;
  isCorrect: boolean;
  scoreAwarded: number;
  scorePossible: number;
  explanation: string | null;
  explanationBlocks: BattleContentBlock[];
};

export type SubmitChapterQuizResponse = {
  attemptId: string;
  quizId: string;
  chapterId: string;
  score: number;
  totalScore: number;
  scorePercent: number;
  passScorePercent: number;
  passed: boolean;
  submittedAt: string;
  results: SubmitChapterQuizResult[];
};
