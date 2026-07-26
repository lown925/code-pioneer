export const WRONG_QUESTION_SOURCES = ['LEARNING', 'BATTLE'] as const;

export type WrongQuestionSource =
  (typeof WRONG_QUESTION_SOURCES)[number];
