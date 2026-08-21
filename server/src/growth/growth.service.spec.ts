import {
  BattleMode,
  BattleRatingReason,
  BattleRoomStatus,
  LearningGoalStatus,
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
    userBattleSkillRating: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    userBattleTrackRating: {
      findMany: jest.fn(),
    },
    battleSkill: { findMany: jest.fn() },
    battleRatingLog: { findMany: jest.fn() },
    userLearningGoal: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    course: { findFirst: jest.fn() },
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
  prisma.userBattleSkillRating.findMany.mockResolvedValue([]);
  prisma.userBattleTrackRating.findMany.mockResolvedValue([]);
  prisma.battleSkill.findMany.mockResolvedValue([]);
  prisma.battleRatingLog.findMany.mockResolvedValue([]);
  prisma.userLearningGoal.findFirst.mockResolvedValue(null);
}

function createGoalRecord(
  overrides: Partial<{
    id: string;
    userId: string;
    courseId: string;
    targetDate: Date;
    status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
    startedAt: Date;
    completedAt: Date | null;
    course: { id: string; title: string };
  }> = {},
) {
  return {
    id: 'goal-1',
    userId: 'user-1',
    courseId: 'course-1',
    targetDate: new Date('2026-08-31T00:00:00.000Z'),
    status: 'ACTIVE' as const,
    startedAt: new Date('2026-08-01T00:00:00.000Z'),
    completedAt: null,
    course: { id: 'course-1', title: 'Python' },
    ...overrides,
  };
}

function seedGoalResolution(prisma: ReturnType<typeof createMockPrisma>) {
  prisma.courseChapter.findMany.mockResolvedValue([{ id: 'chapter-1' }]);
  prisma.chapterLearningRecord.findMany.mockResolvedValue([]);
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

  it('exposes profile-driven professional track battle summaries without legacy skill migration', async () => {
    const prisma = createMockPrisma();
    const now = new Date('2026-08-18T04:00:00.000Z');
    seedEmpty(prisma);
    prisma.user.findFirst.mockResolvedValue({
      major: 'major.data_science_big_data',
      grade: 'grade.freshman',
      learningDirection: 'direction.big_data',
      technicalInterests: [],
      careerDirection: null,
    });
    prisma.battleParticipant.findMany.mockResolvedValue([
      {
        battleRoom: {
          id: 'track-room',
          mode: BattleMode.RANKED,
          skillCode: 'PYTHON',
          professionalTrackKey: 'big-data',
          status: BattleRoomStatus.COMPLETED,
          completedAt: now,
        },
        answers: [{
          isCorrect: true,
          submittedAt: now,
          battleQuestionSnapshot: {
            id: 'track-question',
            sourceQuizQuestionId: 'question-1',
            chapterIdSnapshot: null,
            courseIdSnapshot: null,
          },
        }],
      },
    ]);
    prisma.userBattleTrackRating.findMany.mockResolvedValue([
      { trackKey: 'big-data', rating: 1040, highestRating: 1040, rankedBattles: 1 },
    ]);

    const result = await new GrowthService(
      prisma as unknown as PrismaService,
    ).getOverview('user-1', '7d', now);

    expect(result.data.profile.professionalTrack).toMatchObject({
      trackKey: 'big-data',
      shortName: '大数据',
    });
    expect(result.data.battle.defaultTrackKey).toBe('big-data');
    expect(result.data.battle.tracks?.find((track) => track.trackKey === 'big-data')).toMatchObject({
      rating: 1040,
      rankedBattles: 1,
      ranked: { answeredCount: 1 },
    });
    expect(result.data.battle.currentPythonRating).toBeNull();
  });

  it('builds continue learning, next recommendation, and the full track route from published courses', async () => {
    const prisma = createMockPrisma();
    const now = new Date('2026-08-18T04:00:00.000Z');
    seedEmpty(prisma);
    prisma.user.findFirst.mockResolvedValue({
      major: 'major.computer_science',
      grade: 'grade.junior',
      learningDirection: 'direction.backend',
      technicalInterests: [],
      careerDirection: null,
    });
    prisma.course.findMany = jest.fn().mockResolvedValue([
      { id: 'course-python', slug: 'python-basic', title: 'Python 基础入门' },
      { id: 'course-data', slug: 'data-structures-algorithms', title: '数据结构与算法基础' },
    ]);
    prisma.courseLearningRecord.findMany.mockResolvedValue([
      {
        courseId: 'course-python',
        isSelected: true,
        status: 'LEARNING',
        progressPercent: 6,
        lastLearnedAt: now,
        course: { id: 'course-python', title: 'Python 基础入门' },
        lastChapter: null,
      },
      {
        courseId: 'course-data',
        isSelected: false,
        status: 'NOT_STARTED',
        progressPercent: 0,
        lastLearnedAt: null,
        course: { id: 'course-data', title: '数据结构与算法基础' },
        lastChapter: null,
      },
    ]);

    const result = await new GrowthService(
      prisma as unknown as PrismaService,
    ).getOverview('user-1', '7d', now);

    expect(result.data.learning.continueLearning).toMatchObject({
      courseId: 'course-python',
      progressPercent: 6,
    });
    expect(result.data.learning.nextRecommendation).toMatchObject({
      courseId: 'course-data',
      courseTitle: '数据结构与算法基础',
    });
    expect(result.data.learning.professionalRoute.map((item) => [item.slug, item.status])).toEqual([
      ['python-basic', 'LEARNING'],
      ['data-structures-algorithms', 'AVAILABLE'],
      ['linux-fundamentals', 'UPCOMING'],
      ['database-sql-fundamentals', 'UPCOMING'],
      ['computer-architecture-operating-systems', 'UPCOMING'],
      ['computer-networks-fundamentals', 'UPCOMING'],
    ]);
    expect(result.data.learning.professionalRoute.filter((item) => item.status === 'UPCOMING').every((item) => item.courseId === null && item.targetPath === null)).toBe(true);
  });

  it('turns Linux from upcoming into available when it becomes published', async () => {
    const prisma = createMockPrisma();
    seedEmpty(prisma);
    prisma.user.findFirst.mockResolvedValue({
      major: 'major.computer_science',
      grade: 'grade.junior',
      learningDirection: 'direction.backend',
      technicalInterests: [],
      careerDirection: null,
    });
    prisma.course.findMany = jest.fn().mockResolvedValue([
      { id: 'course-linux', slug: 'linux-fundamentals', title: 'Linux 基础与常用命令' },
    ]);

    const result = await new GrowthService(
      prisma as unknown as PrismaService,
    ).getOverview('user-1', '7d', new Date('2026-08-18T04:00:00.000Z'));

    expect(result.data.learning.professionalRoute.find((item) => item.slug === 'linux-fundamentals')).toMatchObject({
      status: 'AVAILABLE',
      courseId: 'course-linux',
      targetPath: '/pages/course/detail?courseId=course-linux',
    });
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

    expect(prisma.battleRatingLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId: 'user-1',
          skillCode: { not: null },
          reason: BattleRatingReason.BATTLE_RESULT,
        },
      }),
    );

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

  it('keeps administrative and initialization logs out of Rating trends', async () => {
    const prisma = createMockPrisma();
    const now = new Date('2026-08-18T04:00:00.000Z');
    seedEmpty(prisma);
    prisma.battleSkill.findMany.mockResolvedValue([
      { code: 'PYTHON', name: 'Python', isEnabled: true },
    ]);
    prisma.battleRatingLog.findMany.mockImplementation(
      ({ where }: { where: { reason: BattleRatingReason } }) =>
        Promise.resolve(
          [
            {
              reason: BattleRatingReason.BATTLE_RESULT,
              ratingBefore: 1000,
              ratingAfter: 1020,
              ratingDelta: 20,
              createdAt: now,
              skillCode: 'PYTHON',
            },
            {
              reason: BattleRatingReason.ADMIN_ADJUSTMENT,
              ratingBefore: 1020,
              ratingAfter: 1200,
              ratingDelta: 180,
              createdAt: now,
              skillCode: 'PYTHON',
            },
            {
              reason: BattleRatingReason.INITIALIZATION,
              ratingBefore: 0,
              ratingAfter: 1000,
              ratingDelta: 1000,
              createdAt: now,
              skillCode: 'PYTHON',
            },
          ].filter((log) => log.reason === where.reason),
        ),
    );
    const service = new GrowthService(prisma as unknown as PrismaService);

    const result = await service.getOverview('user-1', '7d', now);
    const python = result.data.battle.skills.find(
      (skill) => skill.code === 'PYTHON',
    );

    expect(python?.ratingTrend).toHaveLength(1);
    expect(python?.ratingTrend[0]).toMatchObject({
      ratingBefore: 1000,
      ratingAfter: 1020,
      ratingDelta: 20,
    });
  });

  it('groups Battle counts and Rating trends by real skill data', async () => {
    const prisma = createMockPrisma();
    const now = new Date('2026-08-18T04:00:00.000Z');
    seedEmpty(prisma);
    prisma.battleSkill.findMany.mockResolvedValue([
      { code: 'PYTHON', name: 'Python', isEnabled: true },
      { code: 'JAVASCRIPT', name: 'JavaScript', isEnabled: false },
    ]);
    prisma.userBattleSkillRating.findMany.mockResolvedValue([
      {
        skillCode: 'PYTHON',
        rating: 1080,
        highestRating: 1110,
        rankedBattles: 2,
      },
    ]);
    prisma.userBattleSkillRating.findUnique.mockResolvedValue({ rating: 1080 });
    prisma.battleParticipant.findMany.mockResolvedValue([
      {
        battleRoom: {
          id: 'python-ranked',
          mode: BattleMode.RANKED,
          skillCode: 'PYTHON',
          status: BattleRoomStatus.COMPLETED,
          completedAt: now,
        },
        answers: [],
      },
      {
        battleRoom: {
          id: 'python-training',
          mode: BattleMode.TRAINING,
          skillCode: 'PYTHON',
          status: BattleRoomStatus.COMPLETED,
          completedAt: now,
        },
        answers: [],
      },
      {
        battleRoom: {
          id: 'javascript-friend',
          mode: BattleMode.FRIEND,
          skillCode: 'JAVASCRIPT',
          status: BattleRoomStatus.COMPLETED,
          completedAt: now,
        },
        answers: [],
      },
    ]);
    prisma.battleRatingLog.findMany.mockResolvedValue([
      {
        ratingBefore: 1060,
        ratingAfter: 1080,
        ratingDelta: 20,
        createdAt: now,
        skillCode: 'PYTHON',
      },
    ]);
    const service = new GrowthService(prisma as unknown as PrismaService);

    const result = await service.getOverview('user-1', '7d', now);
    const python = result.data.battle.skills.find(
      (skill) => skill.code === 'PYTHON',
    );
    const javascript = result.data.battle.skills.find(
      (skill) => skill.code === 'JAVASCRIPT',
    );

    expect(python).toMatchObject({
      rating: 1080,
      highestRating: 1110,
      rankedBattles: 2,
      trainingBattles: 1,
      friendBattles: 0,
    });
    expect(python?.ratingTrend).toHaveLength(1);
    expect(javascript).toMatchObject({
      rating: null,
      rankedBattles: 0,
      trainingBattles: 0,
      friendBattles: 1,
    });
    expect(javascript?.ratingTrend).toEqual([]);
  });

  it('keeps up to twenty Rating points for every skill', async () => {
    const prisma = createMockPrisma();
    const now = new Date('2026-08-18T04:00:00.000Z');
    seedEmpty(prisma);
    prisma.battleSkill.findMany.mockResolvedValue([
      { code: 'PYTHON', name: 'Python', isEnabled: true },
      { code: 'JAVASCRIPT', name: 'JavaScript', isEnabled: false },
    ]);
    prisma.userBattleSkillRating.findMany.mockResolvedValue([
      {
        skillCode: 'PYTHON',
        rating: 1200,
        highestRating: 1200,
        rankedBattles: 25,
      },
      {
        skillCode: 'JAVASCRIPT',
        rating: 1100,
        highestRating: 1100,
        rankedBattles: 25,
      },
    ]);
    prisma.userBattleSkillRating.findUnique.mockResolvedValue({ rating: 1200 });
    prisma.battleRatingLog.findMany.mockResolvedValue(
      Array.from({ length: 50 }, (_, index) => ({
        ratingBefore: 1000 + index,
        ratingAfter: 1010 + index,
        ratingDelta: 10,
        createdAt: new Date(now.getTime() - index * 60 * 60 * 1000),
        skillCode: index % 2 === 0 ? 'PYTHON' : 'JAVASCRIPT',
      })),
    );
    const service = new GrowthService(prisma as unknown as PrismaService);

    const result = await service.getOverview('user-1', '7d', now);
    const python = result.data.battle.skills.find(
      (skill) => skill.code === 'PYTHON',
    );
    const javascript = result.data.battle.skills.find(
      (skill) => skill.code === 'JAVASCRIPT',
    );

    expect(python?.ratingTrend).toHaveLength(20);
    expect(javascript?.ratingTrend).toHaveLength(20);
    expect(python?.ratingTrend[0]?.ratingAfter).toBe(1010 + 38);
    expect(javascript?.ratingTrend[0]?.ratingAfter).toBe(1010 + 39);
  });

  it('keeps legacy null-skill battles out of skill-specific summaries', async () => {
    const prisma = createMockPrisma();
    const now = new Date('2026-08-18T04:00:00.000Z');
    seedEmpty(prisma);
    prisma.battleSkill.findMany.mockResolvedValue([
      { code: 'PYTHON', name: 'Python', isEnabled: true },
    ]);
    prisma.battleParticipant.findMany.mockResolvedValue([
      {
        battleRoom: {
          id: 'legacy-room',
          mode: BattleMode.RANKED,
          skillCode: null,
          status: BattleRoomStatus.COMPLETED,
          completedAt: now,
        },
        answers: [],
      },
    ]);
    prisma.battleRatingLog.findMany.mockResolvedValue([]);
    const service = new GrowthService(prisma as unknown as PrismaService);

    const result = await service.getOverview('user-1', '7d', now);
    const python = result.data.battle.skills.find(
      (skill) => skill.code === 'PYTHON',
    );

    expect(result.data.battle.rankedBattles).toBe(1);
    expect(python?.rankedBattles).toBe(0);
    expect(python?.ratingTrend).toEqual([]);
  });

  it('creates goals for the authenticated user and resolves live chapter metrics', async () => {
    const prisma = createMockPrisma();
    const now = new Date('2026-08-18T04:00:00.000Z');
    const goal = createGoalRecord();
    prisma.course.findFirst.mockResolvedValue({
      id: 'course-1',
      title: 'Python',
    });
    prisma.userLearningGoal.findFirst.mockResolvedValue(null);
    prisma.userLearningGoal.create.mockResolvedValue(goal);
    seedGoalResolution(prisma);
    const service = new GrowthService(prisma as unknown as PrismaService);

    const result = await service.createGoal(
      'user-1',
      {
        courseId: 'course-1',
        targetDate: '2026-08-31',
        userId: 'other-user',
      } as never,
      now,
    );

    expect(result.data.goal).toMatchObject({
      userId: 'user-1',
      courseId: 'course-1',
      totalChapters: 1,
      completedChapters: 0,
    });
    expect(prisma.course.findFirst).toHaveBeenCalledWith({
      where: { id: 'course-1', status: 'PUBLISHED', deletedAt: null },
      select: { id: true, title: true },
    });
    expect(prisma.userLearningGoal.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: 'user-1' }),
      }),
    );
  });

  it('rejects an invalid course, duplicate active goal, and a unique-race P2002', async () => {
    const now = new Date('2026-08-18T04:00:00.000Z');

    const invalidCoursePrisma = createMockPrisma();
    invalidCoursePrisma.course.findFirst.mockResolvedValue(null);
    const invalidCourseService = new GrowthService(
      invalidCoursePrisma as unknown as PrismaService,
    );
    await expect(
      invalidCourseService.createGoal(
        'user-1',
        { courseId: 'course-1', targetDate: '2026-08-31' },
        now,
      ),
    ).rejects.toThrow('LEARNABLE_COURSE_NOT_FOUND');

    const duplicatePrisma = createMockPrisma();
    duplicatePrisma.course.findFirst.mockResolvedValue({
      id: 'course-1',
      title: 'Python',
    });
    duplicatePrisma.userLearningGoal.findFirst.mockResolvedValue({
      id: 'goal-1',
    });
    const duplicateService = new GrowthService(
      duplicatePrisma as unknown as PrismaService,
    );
    await expect(
      duplicateService.createGoal(
        'user-1',
        { courseId: 'course-1', targetDate: '2026-08-31' },
        now,
      ),
    ).rejects.toThrow('ACTIVE_LEARNING_GOAL_EXISTS');

    const racePrisma = createMockPrisma();
    racePrisma.course.findFirst.mockResolvedValue({
      id: 'course-1',
      title: 'Python',
    });
    racePrisma.userLearningGoal.findFirst.mockResolvedValue(null);
    racePrisma.userLearningGoal.create.mockRejectedValue({ code: 'P2002' });
    const raceService = new GrowthService(
      racePrisma as unknown as PrismaService,
    );
    await expect(
      raceService.createGoal(
        'user-1',
        { courseId: 'course-1', targetDate: '2026-08-31' },
        now,
      ),
    ).rejects.toThrow('ACTIVE_LEARNING_GOAL_EXISTS');
  });

  it('updates and cancels only the authenticated user active goal', async () => {
    const prisma = createMockPrisma();
    const now = new Date('2026-08-18T04:00:00.000Z');
    const current = createGoalRecord();
    const updated = createGoalRecord({
      courseId: 'course-2',
      course: { id: 'course-2', title: 'JavaScript' },
      targetDate: new Date('2026-09-10T00:00:00.000Z'),
    });
    prisma.userLearningGoal.findFirst.mockResolvedValue(current);
    prisma.course.findFirst.mockResolvedValue({
      id: 'course-2',
      title: 'JavaScript',
    });
    prisma.userLearningGoal.update.mockResolvedValue(updated);
    seedGoalResolution(prisma);
    const service = new GrowthService(prisma as unknown as PrismaService);

    const updateResult = await service.updateCurrentGoal(
      'user-1',
      { courseId: 'course-2', targetDate: '2026-09-10' },
      now,
    );

    expect(updateResult.data.goal.courseId).toBe('course-2');
    expect(prisma.userLearningGoal.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'user-1', status: LearningGoalStatus.ACTIVE },
      }),
    );
    expect(prisma.userLearningGoal.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'goal-1' },
        data: expect.objectContaining({
          courseId: 'course-2',
          status: 'ACTIVE',
        }),
      }),
    );

    prisma.userLearningGoal.findFirst.mockResolvedValue({ id: 'goal-1' });
    const cancelResult = await service.cancelCurrentGoal('user-1');
    expect(cancelResult.data.goal).toBeNull();
    expect(prisma.userLearningGoal.update).toHaveBeenLastCalledWith({
      where: { id: 'goal-1' },
      data: { status: 'CANCELLED' },
    });
  });

  it('marks a fully completed goal dynamically and suppresses goal recommendations', async () => {
    const prisma = createMockPrisma();
    const now = new Date('2026-08-18T04:00:00.000Z');
    seedEmpty(prisma);
    prisma.courseChapter.findMany.mockResolvedValue([
      {
        id: 'chapter-1',
        title: 'Basics',
        courseId: 'course-1',
        course: { id: 'course-1', title: 'Python' },
      },
      {
        id: 'chapter-2',
        title: 'Functions',
        courseId: 'course-1',
        course: { id: 'course-1', title: 'Python' },
      },
    ]);
    prisma.chapterLearningRecord.findMany.mockResolvedValue([
      {
        chapterId: 'chapter-1',
        status: 'COMPLETED',
        lastLearnedAt: now,
        completedAt: now,
      },
      {
        chapterId: 'chapter-2',
        status: 'COMPLETED',
        lastLearnedAt: now,
        completedAt: now,
      },
    ]);
    prisma.userLearningGoal.findFirst.mockResolvedValue(
      createGoalRecord({
        targetDate: new Date('2026-08-31T00:00:00.000Z'),
      }),
    );
    const service = new GrowthService(prisma as unknown as PrismaService);

    const result = await service.getOverview('user-1', '7d', now);

    expect(result.data.goal?.status).toBe('COMPLETED');
    expect(
      result.data.recommendations.some((item) =>
        ['RULE_GOAL_BEHIND', 'RULE_GOAL_AHEAD'].includes(item.type),
      ),
    ).toBe(false);
  });

  it('returns course-aware wrong areas and limits the default view to Top 5', async () => {
    const prisma = createMockPrisma();
    const now = new Date('2026-08-18T04:00:00.000Z');
    seedEmpty(prisma);
    const chapters = Array.from({ length: 6 }, (_, index) => ({
      id: `chapter-${index + 1}`,
      title: `Chapter ${index + 1}`,
      courseId: index < 3 ? 'course-python' : 'course-javascript',
      course: {
        id: index < 3 ? 'course-python' : 'course-javascript',
        title: index < 3 ? 'Python' : 'JavaScript',
      },
    }));
    prisma.courseChapter.findMany.mockResolvedValue(chapters);
    prisma.quizAttempt.findMany.mockResolvedValue(
      chapters.flatMap((chapter, chapterIndex) =>
        Array.from(
          { length: chapterIndex === 0 ? 3 : chapterIndex === 1 ? 2 : 1 },
          (_, attemptIndex) => ({
            submittedAt: now,
            quiz: { chapter },
            answers: [
              {
                questionId: `question-${chapterIndex}-${attemptIndex}`,
                isCorrect: false,
                createdAt: now,
              },
            ],
          }),
        ),
      ),
    );
    const service = new GrowthService(prisma as unknown as PrismaService);

    const result = await service.getOverview('user-1', '7d', now);
    const areas = result.data.wrongQuestions.areas ?? [];

    expect(result.data.wrongQuestions.topWeakAreas).toHaveLength(5);
    expect(areas).toHaveLength(6);
    expect(areas[0]).toMatchObject({
      chapterId: 'chapter-1',
      courseId: 'course-python',
      wrongCount: 3,
    });
    expect(
      result.data.wrongQuestions.topWeakAreas.some(
        (area) => area.chapterId === 'chapter-6',
      ),
    ).toBe(false);
    expect(areas.some((area) => area.courseId === 'course-javascript')).toBe(
      true,
    );
  });
});
