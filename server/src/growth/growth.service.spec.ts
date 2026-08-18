import {
  BattleMode,
  BattleRoomStatus,
  PracticeAttemptStatus,
} from '../../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { GrowthService } from './growth.service';

function createMockPrisma() {
  return {
    user: { findFirst: jest.fn() },
    courseChapter: { findMany: jest.fn() },
    courseLearningRecord: { findMany: jest.fn() },
    chapterLearningRecord: { findMany: jest.fn() },
    quizAttempt: { findMany: jest.fn() },
    practiceAttempt: { findMany: jest.fn() },
    battleParticipant: { findMany: jest.fn() },
    battleProfile: { findUnique: jest.fn() },
    userBattleSkillRating: { findUnique: jest.fn() },
    battleRatingLog: { findMany: jest.fn() },
  };
}

function seedEmpty(prisma: ReturnType<typeof createMockPrisma>) {
  prisma.user.findFirst.mockResolvedValue({
    major: null,
    grade: null,
    learningDirection: null,
    technicalInterests: [],
    careerDirection: null,
  });
  prisma.courseChapter.findMany.mockResolvedValue([]);
  prisma.courseLearningRecord.findMany.mockResolvedValue([]);
  prisma.chapterLearningRecord.findMany.mockResolvedValue([]);
  prisma.quizAttempt.findMany.mockResolvedValue([]);
  prisma.practiceAttempt.findMany.mockResolvedValue([]);
  prisma.battleParticipant.findMany.mockResolvedValue([]);
  prisma.battleProfile.findUnique.mockResolvedValue(null);
  prisma.userBattleSkillRating.findUnique.mockResolvedValue(null);
  prisma.battleRatingLog.findMany.mockResolvedValue([]);
}

describe('GrowthService', () => {
  it('returns a real no-data state without zero accuracy', async () => {
    const prisma = createMockPrisma();
    seedEmpty(prisma);
    const service = new GrowthService(prisma as unknown as PrismaService);

    const result = await service.getOverview(
      'user-1',
      '7d',
      new Date('2026-08-18T04:00:00.000Z'),
    );

    expect(result.data.dataState).toBe('NO_DATA');
    expect(result.data.learning.quiz.accuracy).toBeNull();
    expect(result.data.learning.practice.accuracy).toBeNull();
    expect(result.data.learning.trend).toHaveLength(7);
    expect(
      result.data.learning.trend.every((item) => item.quizAccuracy === null),
    ).toBe(true);
    expect(
      result.data.recommendations.some(
        (item) => item.type === 'EXPLORE_GROWTH',
      ),
    ).toBe(true);
  });

  it('combines Quiz and completed Practice by chapter while keeping Battle modes separate', async () => {
    const prisma = createMockPrisma();
    const now = new Date('2026-08-18T04:00:00.000Z');
    const chapter = {
      id: 'chapter-1',
      title: 'Functions',
      courseId: 'course-1',
      course: { id: 'course-1', title: 'Python' },
    };
    prisma.user.findFirst.mockResolvedValue({
      major: 'major.computer_science',
      grade: 'grade.freshman',
      learningDirection: 'direction.backend',
      technicalInterests: ['interest.python'],
      careerDirection: null,
    });
    prisma.courseChapter.findMany.mockResolvedValue([chapter]);
    prisma.courseLearningRecord.findMany.mockResolvedValue([
      {
        courseId: 'course-1',
        isSelected: true,
        status: 'LEARNING',
        progressPercent: 40,
        lastLearnedAt: now,
        course: { id: 'course-1', title: 'Python' },
        lastChapter: { id: 'chapter-1', title: 'Functions' },
      },
    ]);
    prisma.chapterLearningRecord.findMany.mockResolvedValue([
      {
        chapterId: 'chapter-1',
        status: 'LEARNING',
        lastLearnedAt: now,
        completedAt: null,
      },
    ]);
    prisma.quizAttempt.findMany.mockResolvedValue([
      {
        submittedAt: now,
        quiz: { chapterId: 'chapter-1', chapter },
        answers: Array.from({ length: 5 }, (_, index) => ({
          questionId: `quiz-${index}`,
          isCorrect: index < 4,
          createdAt: now,
        })),
      },
    ]);
    prisma.practiceAttempt.findMany.mockResolvedValue([
      {
        status: PracticeAttemptStatus.COMPLETED,
        createdAt: now,
        completedAt: now,
        course: { id: 'course-1', title: 'Python' },
        answers: Array.from({ length: 5 }, (_, index) => ({
          questionId: `practice-${index}`,
          isCorrect: index < 3,
          answeredAt: now,
          question: { quiz: { chapterId: 'chapter-1', chapter } },
        })),
      },
    ]);
    prisma.battleParticipant.findMany.mockResolvedValue([
      {
        battleRoom: {
          id: 'training-room',
          mode: BattleMode.TRAINING,
          skillCode: 'PYTHON',
          status: BattleRoomStatus.COMPLETED,
          completedAt: now,
        },
        answers: [
          {
            isCorrect: true,
            submittedAt: now,
            battleQuestionSnapshot: {
              id: 'training-question',
              sourceQuizQuestionId: 'quiz-1',
              chapterIdSnapshot: 'chapter-1',
            },
          },
        ],
      },
      {
        battleRoom: {
          id: 'friend-room',
          mode: BattleMode.FRIEND,
          skillCode: 'PYTHON',
          status: BattleRoomStatus.COMPLETED,
          completedAt: now,
        },
        answers: [
          {
            isCorrect: false,
            submittedAt: now,
            battleQuestionSnapshot: {
              id: 'friend-question',
              sourceQuizQuestionId: 'quiz-2',
              chapterIdSnapshot: 'chapter-1',
            },
          },
        ],
      },
    ]);
    prisma.battleProfile.findUnique.mockResolvedValue({
      totalBattles: 2,
      rankedBattles: 0,
      trainingBattles: 1,
      friendBattles: 1,
    });
    prisma.userBattleSkillRating.findUnique.mockResolvedValue(null);
    prisma.battleRatingLog.findMany.mockResolvedValue([]);
    const service = new GrowthService(prisma as unknown as PrismaService);

    const result = await service.getOverview('user-1', '30d', now);
    const chapterResult = result.data.competency.chapters[0];

    expect(chapterResult?.answeredCount).toBe(10);
    expect(chapterResult?.quizAnsweredCount).toBe(5);
    expect(chapterResult?.practiceAnsweredCount).toBe(5);
    expect(result.data.battle.training.answeredCount).toBe(1);
    expect(result.data.battle.friend.answeredCount).toBe(1);
    expect(result.data.battle.currentPythonRating).toBeNull();
    expect(result.data.wrongQuestions.topWeakAreas[0]).toMatchObject({
      chapterId: 'chapter-1',
      chapterTitle: 'Functions',
      wrongAttempts: 4,
    });
    expect(result.data.dataState).toBe('READY');
    expect(result.data.learning.trend).toHaveLength(30);
  });

  it('keeps Ranked rating history separate from Training and Friend data', async () => {
    const prisma = createMockPrisma();
    const now = new Date('2026-08-18T04:00:00.000Z');
    seedEmpty(prisma);
    prisma.battleProfile.findUnique.mockResolvedValue({
      totalBattles: 3,
      rankedBattles: 2,
      trainingBattles: 1,
      friendBattles: 0,
    });
    prisma.userBattleSkillRating.findUnique.mockResolvedValue({ rating: 1080 });
    prisma.battleRatingLog.findMany.mockResolvedValue([
      {
        ratingBefore: 1060,
        ratingAfter: 1080,
        ratingDelta: 20,
        createdAt: new Date('2026-08-17T04:00:00.000Z'),
        skillCode: 'PYTHON',
      },
      {
        ratingBefore: 1000,
        ratingAfter: 1060,
        ratingDelta: 60,
        createdAt: new Date('2026-08-16T04:00:00.000Z'),
        skillCode: 'PYTHON',
      },
    ]);
    const service = new GrowthService(prisma as unknown as PrismaService);

    const result = await service.getOverview('user-1', '7d', now);

    expect(result.data.battle.currentPythonRating).toBe(1080);
    expect(result.data.battle.rankedBattles).toBe(2);
    expect(result.data.battle.trainingBattles).toBe(1);
    expect(result.data.battle.friendBattles).toBe(0);
    expect(
      result.data.battle.ratingTrend.map((item) => item.ratingAfter),
    ).toEqual([1060, 1080]);
    expect(
      result.data.battle.ratingTrend.every(
        (item) => item.skillCode === 'PYTHON',
      ),
    ).toBe(true);
  });
});
