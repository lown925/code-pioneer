import { BadRequestException } from '@nestjs/common';
import { toShanghaiDateKey } from './growth-metrics';
import type { GrowthGoalPaceStatus, GrowthLearningGoal } from './growth.types';

const DAY_MS = 24 * 60 * 60 * 1000;

export type GoalDateInput = string | Date;

export function parseGoalDate(value: GoalDateInput): Date {
  const dateKey = typeof value === 'string' ? value : toShanghaiDateKey(value);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
    throw new BadRequestException('TARGET_DATE_INVALID');
  }

  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new BadRequestException('TARGET_DATE_INVALID');
  }

  return date;
}

export function compareGoalDates(left: GoalDateInput, right: GoalDateInput) {
  return parseGoalDate(left).getTime() - parseGoalDate(right).getTime();
}

export function roundGoalMetric(value: number) {
  return Math.round(value * 100) / 100;
}

export function calculateGoalMetrics(input: {
  id: string;
  userId: string;
  courseId: string;
  courseTitle: string;
  targetDate: GoalDateInput;
  persistedStatus: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  startedAt: Date;
  completedAt: Date | null;
  totalChapters: number;
  completedChapters: number;
  now: Date;
}): GrowthLearningGoal {
  const targetDate = parseGoalDate(input.targetDate);
  const todayKey = toShanghaiDateKey(input.now);
  const today = parseGoalDate(todayKey);
  const startedKey = toShanghaiDateKey(input.startedAt);
  const started = parseGoalDate(startedKey);
  const totalChapters = Math.max(0, input.totalChapters);
  const completedChapters = Math.min(
    totalChapters,
    Math.max(0, input.completedChapters),
  );
  const remainingChapters = Math.max(0, totalChapters - completedChapters);
  const remainingDays = Math.max(
    0,
    Math.floor((targetDate.getTime() - today.getTime()) / DAY_MS),
  );
  const durationDays = Math.max(
    1,
    Math.floor((targetDate.getTime() - started.getTime()) / DAY_MS),
  );
  const elapsedDays = Math.max(
    0,
    Math.min(
      durationDays,
      Math.floor((today.getTime() - started.getTime()) / DAY_MS),
    ),
  );
  const progressPercent =
    totalChapters === 0
      ? 0
      : roundGoalMetric((completedChapters / totalChapters) * 100);
  const plannedProgressPercent = Math.min(
    100,
    roundGoalMetric((elapsedDays / durationDays) * 100),
  );
  const status =
    input.persistedStatus === 'CANCELLED'
      ? 'CANCELLED'
      : totalChapters > 0 && completedChapters >= totalChapters
        ? 'COMPLETED'
        : input.persistedStatus;
  const paceStatus: GrowthGoalPaceStatus =
    status === 'COMPLETED'
      ? 'AHEAD'
      : progressPercent > plannedProgressPercent
        ? 'AHEAD'
        : progressPercent < plannedProgressPercent
          ? 'BEHIND'
          : 'ON_TRACK';

  return {
    id: input.id,
    userId: input.userId,
    courseId: input.courseId,
    courseTitle: input.courseTitle,
    targetDate: toShanghaiDateKey(targetDate),
    status,
    startedAt: input.startedAt.toISOString(),
    completedAt:
      status === 'COMPLETED'
        ? (input.completedAt?.toISOString() ?? null)
        : null,
    totalChapters,
    completedChapters,
    remainingChapters,
    remainingDays,
    requiredChaptersPerDay:
      remainingChapters === 0
        ? 0
        : remainingDays > 0
          ? roundGoalMetric(remainingChapters / remainingDays)
          : null,
    requiredChaptersPerWeek:
      remainingChapters === 0
        ? 0
        : remainingDays > 0
          ? roundGoalMetric((remainingChapters / remainingDays) * 7)
          : null,
    progressPercent,
    plannedProgressPercent,
    paceStatus,
  };
}
