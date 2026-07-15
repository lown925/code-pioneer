import type { CourseDifficulty } from '../types/course';

const DIFFICULTY_LABELS: Record<CourseDifficulty, string> = {
  BEGINNER: '入门',
  BASIC: '基础',
  INTERMEDIATE: '进阶',
  ADVANCED: '高级',
};

export function formatDifficulty(value: CourseDifficulty) {
  return DIFFICULTY_LABELS[value] ?? value;
}

export function formatMinutes(value: number) {
  if (value <= 0) {
    return '预计时长待补充';
  }

  if (value < 60) {
    return `${value} 分钟`;
  }

  const hours = Math.floor(value / 60);
  const minutes = value % 60;

  if (minutes === 0) {
    return `${hours} 小时`;
  }

  return `${hours} 小时 ${minutes} 分钟`;
}

export function normalizeLearningObjectives(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === 'string')
      .filter((item) => item.trim().length > 0);
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    return [value.trim()];
  }

  return [];
}
