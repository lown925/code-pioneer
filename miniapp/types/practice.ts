import type { BattleContentBlock } from './battle';

export type PracticeTarget = {
  courseId: string;
  courseTitle: string;
  category: string;
  language: string | null;
  availableQuestionCount: number;
};

export type PracticeTargetsResponse = { items: PracticeTarget[] };

export type PracticeQuestionOption = {
  optionId: string;
  content: string;
  contentBlocks: BattleContentBlock[];
  order: number;
};

export type PracticeQuestion = {
  questionId: string;
  order: number;
  type: "SINGLE_CHOICE" | "TRUE_FALSE" | "FILL_BLANK" | "CODE_FILL";
  content: string;
  stemBlocks: BattleContentBlock[];
  programmingLanguage: string | null;
  options: PracticeQuestionOption[];
};

export type PracticeAttemptResponse = {
  attemptId: string;
  course: {
    id: string;
    title: string;
    category: string;
    language: string | null;
  };
  questionCount: number;
  startedAt: string;
  questions: PracticeQuestion[];
};

export type PracticeAnswerResponse = {
  questionId: string;
  selectedOptionId: string | null;
  answerText: string | null;
  correctOptionId: string | null;
  acceptedAnswers: string[] | null;
  isCorrect: boolean;
  explanation: string | null;
  explanationBlocks: BattleContentBlock[];
  answeredCount: number;
  totalQuestionCount: number;
  completed: boolean;
};
