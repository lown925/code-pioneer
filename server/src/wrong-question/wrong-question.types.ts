export const WRONG_QUESTION_SOURCES = ['LEARNING', 'PRACTICE', 'BATTLE'] as const;

export type WrongQuestionSource =
  (typeof WRONG_QUESTION_SOURCES)[number];
