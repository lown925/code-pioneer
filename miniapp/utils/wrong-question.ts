import type { WrongQuestionSource, WrongQuestionType } from '../types/wrong-question';

const QUESTION_TYPE_LABELS: Record<WrongQuestionType, string> = {
  SINGLE_CHOICE: '单选题',
  TRUE_FALSE: '判断题',
};

const SOURCE_LABELS: Record<WrongQuestionSource, string> = {
  LEARNING: '学习错题',
  BATTLE: '对战错题',
};

const SOURCE_CLASS_NAMES: Record<WrongQuestionSource, string> = {
  LEARNING: 'source-learning',
  BATTLE: 'source-battle',
};

function normalizeIndex(value: number) {
  if (!Number.isFinite(value) || value < 1) {
    return 1;
  }

  return Math.floor(value);
}

export function formatWrongQuestionType(value: string | null | undefined) {
  if (value === 'SINGLE_CHOICE' || value === 'TRUE_FALSE') {
    return QUESTION_TYPE_LABELS[value];
  }

  return '未知题型';
}

export function formatWrongQuestionSource(value?: string | null) {
  if (value === 'LEARNING' || value === 'BATTLE') {
    return SOURCE_LABELS[value];
  }

  return SOURCE_LABELS.LEARNING;
}

export function getWrongQuestionSourceClassName(value?: string | null) {
  if (value === 'LEARNING' || value === 'BATTLE') {
    return SOURCE_CLASS_NAMES[value];
  }

  return SOURCE_CLASS_NAMES.LEARNING;
}

export function getWrongQuestionOptionLabel(index: number) {
  let value = normalizeIndex(index + 1);
  let label = '';

  while (value > 0) {
    const remainder = (value - 1) % 26;
    label = String.fromCharCode(65 + remainder) + label;
    value = Math.floor((value - 1) / 26);
  }

  return label || 'A';
}

export function formatWrongQuestionCount(value: number) {
  const normalized = Number.isFinite(value) ? Math.max(1, Math.floor(value)) : 1;

  return `${normalized} 次错误`;
}
