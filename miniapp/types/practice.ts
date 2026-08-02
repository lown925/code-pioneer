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
  contentBlocks: unknown[];
  order: number;
};

export type PracticeQuestion = {
  questionId: string;
  order: number;
  type: 'SINGLE_CHOICE' | 'TRUE_FALSE';
  content: string;
  stemBlocks: unknown[];
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
  selectedOptionId: string;
  correctOptionId: string;
  isCorrect: boolean;
  explanation: string | null;
  explanationBlocks: unknown[];
  answeredCount: number;
  totalQuestionCount: number;
  completed: boolean;
};
