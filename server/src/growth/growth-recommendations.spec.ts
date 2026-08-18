import {
  buildGrowthRecommendations,
  isAllowedGrowthTargetPath,
} from './growth-recommendations';
import type { GrowthRecommendationContext } from './growth.types';

function createContext(
  overrides: Partial<GrowthRecommendationContext> = {},
): GrowthRecommendationContext {
  return {
    profile: {
      major: null,
      grade: null,
      learningDirection: null,
      technicalInterests: [],
      careerDirection: null,
      isCoreProfileComplete: true,
    },
    activity: {
      activeDays: 3,
      recent7ActiveDays: 3,
      previous23ActiveDays: 0,
      completedChapters: 1,
      quizAttempts: 1,
      practiceAttempts: 1,
      battleCount: 0,
      rankedBattles: 0,
      trainingBattles: 0,
      friendBattles: 0,
    },
    quiz: {
      attemptCount: 1,
      completedAttemptCount: 1,
      answeredCount: 10,
      correctCount: 8,
      accuracy: 80,
    },
    practice: {
      attemptCount: 1,
      completedAttemptCount: 1,
      answeredCount: 10,
      correctCount: 8,
      accuracy: 80,
    },
    chapters: [],
    wrongQuestions: {
      uniqueWrongQuestions: 0,
      totalWrongAttempts: 0,
      repeatedWrongQuestions: 0,
      topWeakAreas: [],
      areas: [],
    },
    battle: {
      skills: [],
      defaultSkillCode: null,
      rankedBattles: 0,
      trainingBattles: 0,
      friendBattles: 0,
      ranked: {
        attemptCount: 0,
        completedAttemptCount: 0,
        answeredCount: 0,
        correctCount: 0,
        accuracy: null,
      },
      training: {
        attemptCount: 0,
        completedAttemptCount: 0,
        answeredCount: 0,
        correctCount: 0,
        accuracy: null,
      },
      friend: {
        attemptCount: 0,
        completedAttemptCount: 0,
        answeredCount: 0,
        correctCount: 0,
        accuracy: null,
      },
      currentPythonRating: null,
      ratingTrend: [],
    },
    continueLearning: null,
    ...overrides,
  };
}

describe('growth recommendations', () => {
  it('recommends practice for a chapter below the minimum threshold', () => {
    const context = createContext({
      chapters: [
        {
          chapterId: 'chapter-1',
          chapterTitle: 'Functions',
          courseId: 'course-1',
          courseTitle: 'Python',
          answeredCount: 6,
          correctCount: 2,
          accuracy: 33.33,
          quizAnsweredCount: 0,
          quizCorrectCount: 0,
          quizAccuracy: null,
          practiceAnsweredCount: 6,
          practiceCorrectCount: 2,
          practiceAccuracy: 33.33,
          masteryScore: 37.5,
          status: 'ASSESSED',
          confidence: 'TENTATIVE',
          strength: null,
        },
      ],
    });

    expect(buildGrowthRecommendations(context)[0]).toMatchObject({
      type: 'PRACTICE_WEAK_CHAPTER',
      priority: 'HIGH',
      targetPath: '/pages/practice/index',
    });
  });

  it('never emits an action path outside the allowlist', () => {
    expect(isAllowedGrowthTargetPath('/pages/battle/index')).toBe(true);
    expect(isAllowedGrowthTargetPath('/pages/growth/profile')).toBe(true);
    expect(
      isAllowedGrowthTargetPath('/pages/profile/index?userId=other-user'),
    ).toBe(false);
  });

  it('does not call missing data weak', () => {
    const recommendations = buildGrowthRecommendations(
      createContext({
        quiz: {
          attemptCount: 0,
          completedAttemptCount: 0,
          answeredCount: 0,
          correctCount: 0,
          accuracy: null,
        },
        practice: {
          attemptCount: 0,
          completedAttemptCount: 0,
          answeredCount: 0,
          correctCount: 0,
          accuracy: null,
        },
        activity: {
          activeDays: 0,
          recent7ActiveDays: 0,
          previous23ActiveDays: 0,
          completedChapters: 0,
          quizAttempts: 0,
          practiceAttempts: 0,
          battleCount: 0,
          rankedBattles: 0,
          trainingBattles: 0,
          friendBattles: 0,
        },
      }),
    );

    expect(recommendations.every((item) => !/弱|差/.test(item.title))).toBe(
      true,
    );
    expect(recommendations.some((item) => item.type === 'EXPLORE_GROWTH')).toBe(
      true,
    );
  });

  it('prioritizes a behind active goal and suppresses completed-goal actions', () => {
    const goal = {
      id: 'goal-1',
      userId: 'user-1',
      courseId: 'course-1',
      courseTitle: 'Python',
      targetDate: '2026-08-31',
      status: 'ACTIVE' as const,
      startedAt: '2026-08-01T00:00:00.000Z',
      completedAt: null,
      totalChapters: 15,
      completedChapters: 2,
      remainingChapters: 13,
      remainingDays: 13,
      requiredChaptersPerDay: 1,
      requiredChaptersPerWeek: 7,
      progressPercent: 13.33,
      plannedProgressPercent: 50,
      paceStatus: 'BEHIND' as const,
    };

    const behind = buildGrowthRecommendations(createContext({ goal }));
    expect(behind[0]).toMatchObject({
      type: 'RULE_GOAL_BEHIND',
      priority: 'HIGH',
    });

    const completed = buildGrowthRecommendations(
      createContext({
        goal: { ...goal, status: 'COMPLETED', paceStatus: 'AHEAD' },
      }),
    );
    expect(
      completed.some((item) =>
        ['RULE_GOAL_BEHIND', 'RULE_GOAL_AHEAD'].includes(item.type),
      ),
    ).toBe(false);
  });
});
