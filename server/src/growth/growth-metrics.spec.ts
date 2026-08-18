import {
  buildChapterPerformance,
  calculateAccuracy,
  classifyStrength,
  combineChapterMastery,
  getDimensionStatus,
  getConfidence,
  resolveGrowthDataState,
} from './growth-metrics';

describe('growth metrics', () => {
  it('returns null accuracy when there is no sample', () => {
    expect(calculateAccuracy({ answeredCount: 0, correctCount: 0 })).toBeNull();
    expect(getDimensionStatus(0, false)).toBe('NOT_STARTED');
    expect(getDimensionStatus(0, true)).toBe('NO_SAMPLE');
  });

  it('keeps small samples unclassified and stable samples classifiable', () => {
    expect(getDimensionStatus(4, true)).toBe('INSUFFICIENT_SAMPLE');
    expect(getConfidence(4)).toBe('NONE');
    expect(getConfidence(7)).toBe('TENTATIVE');
    expect(getConfidence(10)).toBe('STABLE');
    expect(classifyStrength(45, 9)).toBeNull();
    expect(classifyStrength(45, 10)).toBe('WEAK');
    expect(classifyStrength(85, 10)).toBe('STRONG');
  });

  it('combines only available chapter sources with equal Quiz/Practice weights', () => {
    expect(
      combineChapterMastery(
        { answeredCount: 10, correctCount: 8 },
        { answeredCount: 0, correctCount: 0 },
      ),
    ).toBeCloseTo(75, 1);

    const result = buildChapterPerformance({
      chapterId: 'chapter-1',
      chapterTitle: 'Functions',
      courseId: 'course-1',
      courseTitle: 'Python',
      started: true,
      quiz: { answeredCount: 5, correctCount: 4 },
      practice: { answeredCount: 5, correctCount: 2 },
    });

    expect(result.answeredCount).toBe(10);
    expect(result.accuracy).toBe(60);
    expect(result.masteryScore).toBeCloseTo(57.14, 1);
    expect(result.status).toBe('ASSESSED');
    expect(result.strength).toBe('NORMAL');
  });

  it('does not mark a user weak when there is no assessed chapter', () => {
    expect(resolveGrowthDataState(true, [])).toBe('PARTIAL');
    expect(resolveGrowthDataState(false, [])).toBe('NO_DATA');
  });
});
