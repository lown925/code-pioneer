import {
  calculateGoalMetrics,
  compareGoalDates,
  parseGoalDate,
} from './growth-goal';

const baseInput = {
  id: 'goal-1',
  userId: 'user-1',
  courseId: 'course-1',
  courseTitle: 'Python 基础',
  targetDate: '2026-08-31',
  persistedStatus: 'ACTIVE' as const,
  startedAt: new Date('2026-08-01T00:00:00.000Z'),
  completedAt: null,
  totalChapters: 15,
  completedChapters: 3,
  now: new Date('2026-08-18T04:00:00.000Z'),
};

describe('growth goal calculations', () => {
  it('calculates remaining chapters, days, and weekly cadence', () => {
    const result = calculateGoalMetrics(baseInput);

    expect(result.remainingChapters).toBe(12);
    expect(result.remainingDays).toBe(13);
    expect(result.requiredChaptersPerDay).toBeCloseTo(12 / 13, 2);
    expect(result.requiredChaptersPerWeek).toBeCloseTo((12 / 13) * 7, 2);
    expect(result.progressPercent).toBe(20);
    expect(result.paceStatus).toBe('BEHIND');
  });

  it('classifies ahead and on-track progress transparently', () => {
    expect(
      calculateGoalMetrics({ ...baseInput, completedChapters: 12 }).paceStatus,
    ).toBe('AHEAD');
    expect(
      calculateGoalMetrics({
        ...baseInput,
        totalChapters: 30,
        completedChapters: 17,
      }).paceStatus,
    ).toBe('ON_TRACK');
  });

  it('returns completed dynamically without requiring a background job', () => {
    const result = calculateGoalMetrics({
      ...baseInput,
      completedChapters: 15,
    });

    expect(result.status).toBe('COMPLETED');
    expect(result.remainingChapters).toBe(0);
    expect(result.requiredChaptersPerDay).toBe(0);
    expect(result.requiredChaptersPerWeek).toBe(0);
  });

  it('handles the target-date boundary without dividing by zero', () => {
    const result = calculateGoalMetrics({
      ...baseInput,
      targetDate: '2026-08-18',
      completedChapters: 3,
    });

    expect(result.remainingDays).toBe(0);
    expect(result.requiredChaptersPerDay).toBeNull();
    expect(result.requiredChaptersPerWeek).toBeNull();
    expect(result.paceStatus).toBe('BEHIND');
  });

  it('validates calendar dates and compares date-only values', () => {
    expect(parseGoalDate('2026-08-20')).toEqual(
      new Date('2026-08-20T00:00:00.000Z'),
    );
    expect(compareGoalDates('2026-08-20', '2026-08-19')).toBeGreaterThan(0);
    expect(() => parseGoalDate('2026-02-30')).toThrow('TARGET_DATE_INVALID');
  });
});
