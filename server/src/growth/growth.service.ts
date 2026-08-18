import { Injectable, NotFoundException } from '@nestjs/common';
import {
  BattleMode,
  BattleRoomStatus,
  PracticeAttemptStatus,
} from '../../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import {
  buildChapterPerformance,
  calculateAccuracy,
  getShanghaiDayStart,
  isWithinDateRange,
  listShanghaiDateKeys,
  resolveGrowthDataState,
  SHANGHAI_TIMEZONE,
} from './growth-metrics';
import { buildGrowthRecommendations } from './growth-recommendations';
import type {
  GrowthActivitySummary,
  GrowthBattleSummary,
  GrowthChapterPerformance,
  GrowthContinueLearning,
  GrowthOverviewResponse,
  GrowthPerformanceSummary,
  GrowthProfileSummary,
  GrowthRange,
  GrowthRatingTrendPoint,
  GrowthTrendPoint,
  GrowthWrongArea,
  GrowthWrongQuestionSummary,
} from './growth.types';

const DAY_MS = 24 * 60 * 60 * 1000;
const RATING_TREND_LIMIT = 20;
const MAX_CHAPTERS_IN_RESPONSE = 20;
const MAX_WEAK_AREAS = 5;

type AnswerMetric = {
  answeredCount: number;
  correctCount: number;
};

type ChapterAccumulator = {
  chapterId: string;
  chapterTitle: string;
  courseId: string;
  courseTitle: string;
  started: boolean;
  quiz: AnswerMetric;
  practice: AnswerMetric;
};

type TrendAccumulator = {
  date: string;
  quizAttempts: number;
  quizAnswered: number;
  quizCorrect: number;
  practiceAttempts: number;
  practiceAnswered: number;
  practiceCorrect: number;
  activityCount: number;
};

type WrongAccumulator = {
  key: string;
  chapterId: string | null;
  chapterTitle: string;
  wrongCount: number;
  latestWrongAt: number;
};

type AreaAccumulator = {
  chapterId: string | null;
  chapterTitle: string;
  wrongAttempts: number;
  questionKeys: Set<string>;
};

@Injectable()
export class GrowthService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(
    userId: string,
    range: GrowthRange = '7d',
    now = new Date(),
  ): Promise<{ success: true; data: GrowthOverviewResponse }> {
    const rangeDays = range === '30d' ? 30 : 7;
    const todayStart = getShanghaiDayStart(now);
    const rangeStart = new Date(
      todayStart.getTime() - (rangeDays - 1) * DAY_MS,
    );
    const activityLookbackStart = new Date(todayStart.getTime() - 29 * DAY_MS);
    const trendKeys = listShanghaiDateKeys(now, rangeDays);
    const trend = new Map<string, TrendAccumulator>(
      trendKeys.map((date) => [
        date,
        {
          date,
          quizAttempts: 0,
          quizAnswered: 0,
          quizCorrect: 0,
          practiceAttempts: 0,
          practiceAnswered: 0,
          practiceCorrect: 0,
          activityCount: 0,
        },
      ]),
    );
    const activityDates = new Set<string>();
    const chapters = new Map<string, ChapterAccumulator>();
    const wrongQuestions = new Map<string, WrongAccumulator>();
    const weakAreas = new Map<string, AreaAccumulator>();
    const quizMetric: AnswerMetric = { answeredCount: 0, correctCount: 0 };
    const practiceMetric: AnswerMetric = {
      answeredCount: 0,
      correctCount: 0,
    };
    const battleMetrics = new Map<BattleMode, AnswerMetric>([
      [BattleMode.RANKED, { answeredCount: 0, correctCount: 0 }],
      [BattleMode.TRAINING, { answeredCount: 0, correctCount: 0 }],
      [BattleMode.FRIEND, { answeredCount: 0, correctCount: 0 }],
    ]);
    const battleCounts = new Map<BattleMode, number>([
      [BattleMode.RANKED, 0],
      [BattleMode.TRAINING, 0],
      [BattleMode.FRIEND, 0],
    ]);
    let completedChapters = 0;
    let selectedRangeQuizAttempts = 0;
    let selectedRangePracticeAttempts = 0;
    let selectedRangeBattleCount = 0;
    let selectedRangeRankedBattles = 0;
    let selectedRangeTrainingBattles = 0;
    let selectedRangeFriendBattles = 0;

    const [
      user,
      publishedChapters,
      courseLearningRecords,
      chapterLearningRecords,
      quizAttempts,
      practiceAttempts,
      battleParticipants,
      battleProfile,
      pythonSkillRating,
      ratingLogs,
    ] = await Promise.all([
      this.prisma.user.findFirst({
        where: { id: userId, deletedAt: null },
        select: {
          major: true,
          grade: true,
          learningDirection: true,
          technicalInterests: true,
          careerDirection: true,
        },
      }),
      this.prisma.courseChapter.findMany({
        where: {
          status: 'PUBLISHED',
          deletedAt: null,
          course: { status: 'PUBLISHED', deletedAt: null },
        },
        orderBy: [{ courseId: 'asc' }, { sortOrder: 'asc' }],
        select: {
          id: true,
          title: true,
          courseId: true,
          course: { select: { id: true, title: true } },
        },
      }),
      this.prisma.courseLearningRecord.findMany({
        where: {
          userId,
          course: { status: 'PUBLISHED', deletedAt: null },
        },
        select: {
          courseId: true,
          isSelected: true,
          status: true,
          progressPercent: true,
          lastLearnedAt: true,
          course: { select: { id: true, title: true } },
          lastChapter: { select: { id: true, title: true } },
        },
      }),
      this.prisma.chapterLearningRecord.findMany({
        where: {
          userId,
          course: { status: 'PUBLISHED', deletedAt: null },
          chapter: { status: 'PUBLISHED', deletedAt: null },
        },
        select: {
          chapterId: true,
          status: true,
          lastLearnedAt: true,
          completedAt: true,
        },
      }),
      this.prisma.quizAttempt.findMany({
        where: {
          userId,
          quiz: {
            status: 'PUBLISHED',
            chapter: {
              status: 'PUBLISHED',
              deletedAt: null,
              course: { status: 'PUBLISHED', deletedAt: null },
            },
          },
        },
        select: {
          submittedAt: true,
          quiz: {
            select: {
              chapterId: true,
              chapter: {
                select: {
                  id: true,
                  title: true,
                  courseId: true,
                  course: { select: { id: true, title: true } },
                },
              },
            },
          },
          answers: {
            select: {
              questionId: true,
              isCorrect: true,
              createdAt: true,
            },
          },
        },
      }),
      this.prisma.practiceAttempt.findMany({
        where: {
          userId,
          course: { status: 'PUBLISHED', deletedAt: null },
        },
        select: {
          status: true,
          createdAt: true,
          completedAt: true,
          course: { select: { id: true, title: true } },
          answers: {
            select: {
              questionId: true,
              isCorrect: true,
              answeredAt: true,
              question: {
                select: {
                  quiz: {
                    select: {
                      chapterId: true,
                      chapter: {
                        select: {
                          id: true,
                          title: true,
                          courseId: true,
                          course: { select: { id: true, title: true } },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      }),
      this.prisma.battleParticipant.findMany({
        where: {
          userId,
          battleRoom: { status: BattleRoomStatus.COMPLETED },
        },
        select: {
          battleRoom: {
            select: {
              id: true,
              mode: true,
              skillCode: true,
              status: true,
              completedAt: true,
            },
          },
          answers: {
            select: {
              isCorrect: true,
              submittedAt: true,
              battleQuestionSnapshot: {
                select: {
                  id: true,
                  sourceQuizQuestionId: true,
                  chapterIdSnapshot: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.battleProfile.findUnique({
        where: { userId },
        select: {
          totalBattles: true,
          rankedBattles: true,
          trainingBattles: true,
          friendBattles: true,
        },
      }),
      this.prisma.userBattleSkillRating.findUnique({
        where: { userId_skillCode: { userId, skillCode: 'PYTHON' } },
        select: { rating: true },
      }),
      this.prisma.battleRatingLog.findMany({
        where: { userId, skillCode: 'PYTHON' },
        orderBy: [{ createdAt: 'desc' }],
        take: RATING_TREND_LIMIT,
        select: {
          ratingBefore: true,
          ratingAfter: true,
          ratingDelta: true,
          createdAt: true,
          skillCode: true,
        },
      }),
    ]);

    if (!user) {
      throw new NotFoundException('USER_NOT_FOUND');
    }

    for (const chapter of publishedChapters) {
      chapters.set(chapter.id, {
        chapterId: chapter.id,
        chapterTitle: chapter.title,
        courseId: chapter.courseId,
        courseTitle: chapter.course.title,
        started: false,
        quiz: { answeredCount: 0, correctCount: 0 },
        practice: { answeredCount: 0, correctCount: 0 },
      });
    }

    const addChapter = (
      chapterId: string,
      chapterTitle: string,
      courseId: string,
      courseTitle: string,
    ) => {
      const existing = chapters.get(chapterId);
      if (existing) {
        existing.started = true;
        return existing;
      }

      const created: ChapterAccumulator = {
        chapterId,
        chapterTitle,
        courseId,
        courseTitle,
        started: true,
        quiz: { answeredCount: 0, correctCount: 0 },
        practice: { answeredCount: 0, correctCount: 0 },
      };
      chapters.set(chapterId, created);
      return created;
    };

    const addActivity = (value: Date) => {
      if (!isWithinDateRange(value, activityLookbackStart, now)) {
        return;
      }

      const date = this.toDateKey(value);
      activityDates.add(date);

      const bucket = trend.get(date);
      if (bucket) {
        bucket.activityCount += 1;
      }
    };

    for (const record of chapterLearningRecords) {
      const chapter = chapters.get(record.chapterId);
      if (chapter) {
        chapter.started = true;
      }

      addActivity(record.lastLearnedAt);
      if (
        record.completedAt &&
        isWithinDateRange(record.completedAt, rangeStart, now)
      ) {
        completedChapters += 1;
      }
    }

    for (const record of courseLearningRecords) {
      if (record.lastLearnedAt) {
        addActivity(record.lastLearnedAt);
      }
    }

    for (const attempt of quizAttempts) {
      const chapter = addChapter(
        attempt.quiz.chapter.id,
        attempt.quiz.chapter.title,
        attempt.quiz.chapter.course.id,
        attempt.quiz.chapter.course.title,
      );
      const inSelectedRange = isWithinDateRange(
        attempt.submittedAt,
        rangeStart,
        now,
      );
      if (inSelectedRange) {
        selectedRangeQuizAttempts += 1;
        const bucket = trend.get(this.toDateKey(attempt.submittedAt));
        if (bucket) {
          bucket.quizAttempts += 1;
        }
        addActivity(attempt.submittedAt);
      }

      for (const answer of attempt.answers) {
        quizMetric.answeredCount += 1;
        quizMetric.correctCount += answer.isCorrect ? 1 : 0;
        chapter.quiz.answeredCount += 1;
        chapter.quiz.correctCount += answer.isCorrect ? 1 : 0;

        if (inSelectedRange) {
          const bucket = trend.get(this.toDateKey(attempt.submittedAt));
          if (bucket) {
            bucket.quizAnswered += 1;
            bucket.quizCorrect += answer.isCorrect ? 1 : 0;
          }
        }

        if (!answer.isCorrect) {
          this.addWrongQuestion(
            wrongQuestions,
            weakAreas,
            answer.questionId,
            chapter.chapterId,
            chapter.chapterTitle,
            attempt.submittedAt,
          );
        }
      }
    }

    for (const attempt of practiceAttempts) {
      const inSelectedRange = isWithinDateRange(
        attempt.createdAt,
        rangeStart,
        now,
      );
      if (inSelectedRange) {
        selectedRangePracticeAttempts += 1;
        const bucket = trend.get(this.toDateKey(attempt.createdAt));
        if (bucket) {
          bucket.practiceAttempts += 1;
        }
        addActivity(attempt.createdAt);
      }

      const isCompleted = attempt.status === PracticeAttemptStatus.COMPLETED;
      for (const answer of attempt.answers) {
        const chapter = answer.question.quiz.chapter;
        const chapterAccumulator = addChapter(
          chapter.id,
          chapter.title,
          chapter.course.id,
          chapter.course.title,
        );

        if (isCompleted) {
          practiceMetric.answeredCount += 1;
          practiceMetric.correctCount += answer.isCorrect ? 1 : 0;
          chapterAccumulator.practice.answeredCount += 1;
          chapterAccumulator.practice.correctCount += answer.isCorrect ? 1 : 0;
        }

        if (!answer.isCorrect) {
          this.addWrongQuestion(
            wrongQuestions,
            weakAreas,
            answer.questionId,
            chapter.id,
            chapter.title,
            answer.answeredAt,
          );
        }

        if (
          isCompleted &&
          isWithinDateRange(answer.answeredAt, rangeStart, now)
        ) {
          const bucket = trend.get(this.toDateKey(answer.answeredAt));
          if (bucket) {
            bucket.practiceAnswered += 1;
            bucket.practiceCorrect += answer.isCorrect ? 1 : 0;
          }
          addActivity(answer.answeredAt);
        }
      }
    }

    for (const participant of battleParticipants) {
      const room = participant.battleRoom;
      const mode = room.mode;
      const modeMetric = battleMetrics.get(mode);
      if (!modeMetric) {
        continue;
      }

      battleCounts.set(mode, (battleCounts.get(mode) ?? 0) + 1);
      for (const answer of participant.answers) {
        modeMetric.answeredCount += 1;
        modeMetric.correctCount += answer.isCorrect ? 1 : 0;

        if (!answer.isCorrect) {
          const snapshotChapter = answer.battleQuestionSnapshot
            .chapterIdSnapshot
            ? chapters.get(answer.battleQuestionSnapshot.chapterIdSnapshot)
            : undefined;
          this.addWrongQuestion(
            wrongQuestions,
            weakAreas,
            answer.battleQuestionSnapshot.sourceQuizQuestionId ??
              `battle:${answer.battleQuestionSnapshot.id}`,
            answer.battleQuestionSnapshot.chapterIdSnapshot,
            snapshotChapter?.chapterTitle ?? null,
            answer.submittedAt,
          );
        }
      }

      if (room.completedAt) {
        const inSelectedRange = isWithinDateRange(
          room.completedAt,
          rangeStart,
          now,
        );
        if (inSelectedRange) {
          selectedRangeBattleCount += 1;
          if (mode === BattleMode.RANKED) selectedRangeRankedBattles += 1;
          if (mode === BattleMode.TRAINING) selectedRangeTrainingBattles += 1;
          if (mode === BattleMode.FRIEND) selectedRangeFriendBattles += 1;
          addActivity(room.completedAt);
        }
      }
    }

    const profile: GrowthProfileSummary = {
      major: user.major,
      grade: user.grade,
      learningDirection: user.learningDirection,
      technicalInterests: user.technicalInterests ?? [],
      careerDirection: user.careerDirection,
      isCoreProfileComplete: Boolean(
        user.major && user.grade && user.learningDirection,
      ),
    };
    const chapterPerformance = [...chapters.values()]
      .filter(
        (chapter) =>
          chapter.started ||
          chapter.quiz.answeredCount > 0 ||
          chapter.practice.answeredCount > 0,
      )
      .map((chapter) =>
        buildChapterPerformance({
          chapterId: chapter.chapterId,
          chapterTitle: chapter.chapterTitle,
          courseId: chapter.courseId,
          courseTitle: chapter.courseTitle,
          started: chapter.started,
          quiz: chapter.quiz,
          practice: chapter.practice,
        }),
      )
      .sort((left, right) => {
        const leftScore = left.masteryScore ?? 101;
        const rightScore = right.masteryScore ?? 101;
        return (
          leftScore - rightScore ||
          left.chapterTitle.localeCompare(right.chapterTitle)
        );
      })
      .slice(0, MAX_CHAPTERS_IN_RESPONSE);

    const activity = this.buildActivitySummary(
      activityDates,
      trendKeys,
      completedChapters,
      selectedRangeQuizAttempts,
      selectedRangePracticeAttempts,
      selectedRangeBattleCount,
      selectedRangeRankedBattles,
      selectedRangeTrainingBattles,
      selectedRangeFriendBattles,
    );
    const learningTrend = this.buildTrend(trend);
    const quiz = this.buildPerformanceSummary(
      quizAttempts.length,
      quizAttempts.length,
      quizMetric,
    );
    const completedPracticeAttempts = practiceAttempts.filter(
      (attempt) => attempt.status === PracticeAttemptStatus.COMPLETED,
    ).length;
    const practice = this.buildPerformanceSummary(
      practiceAttempts.length,
      completedPracticeAttempts,
      practiceMetric,
    );
    const battle = this.buildBattleSummary(
      battleCounts,
      battleMetrics,
      battleProfile,
      pythonSkillRating?.rating ?? null,
      ratingLogs,
    );
    const wrongQuestionSummary = this.buildWrongSummary(
      wrongQuestions,
      weakAreas,
    );
    const continueLearning = this.findContinueLearning(courseLearningRecords);
    const dataState = resolveGrowthDataState(
      chapterLearningRecords.length > 0 ||
        courseLearningRecords.length > 0 ||
        quizAttempts.length > 0 ||
        practiceAttempts.length > 0 ||
        battleParticipants.length > 0,
      chapterPerformance,
    );
    const recommendations = buildGrowthRecommendations({
      profile,
      activity,
      quiz,
      practice,
      chapters: chapterPerformance,
      wrongQuestions: wrongQuestionSummary,
      battle,
      continueLearning,
    });

    return {
      success: true,
      data: {
        meta: {
          range,
          timezone: SHANGHAI_TIMEZONE,
          generatedAt: now.toISOString(),
        },
        profile,
        dataState,
        activity,
        learning: {
          quiz,
          practice,
          trend: learningTrend,
          continueLearning,
        },
        competency: { chapters: chapterPerformance },
        wrongQuestions: wrongQuestionSummary,
        battle,
        recommendations,
      },
    };
  }

  private toDateKey(value: Date) {
    const shifted = new Date(value.getTime() + 8 * 60 * 60 * 1000);
    return shifted.toISOString().slice(0, 10);
  }

  private buildPerformanceSummary(
    attemptCount: number,
    completedAttemptCount: number,
    metric: AnswerMetric,
  ): GrowthPerformanceSummary {
    return {
      attemptCount,
      completedAttemptCount,
      answeredCount: metric.answeredCount,
      correctCount: metric.correctCount,
      accuracy: calculateAccuracy(metric),
    };
  }

  private buildTrend(
    buckets: Map<string, TrendAccumulator>,
  ): GrowthTrendPoint[] {
    return [...buckets.values()].map((bucket) => ({
      date: bucket.date,
      quizAttempts: bucket.quizAttempts,
      quizAnswered: bucket.quizAnswered,
      quizAccuracy: calculateAccuracy({
        answeredCount: bucket.quizAnswered,
        correctCount: bucket.quizCorrect,
      }),
      practiceAttempts: bucket.practiceAttempts,
      practiceAnswered: bucket.practiceAnswered,
      practiceAccuracy: calculateAccuracy({
        answeredCount: bucket.practiceAnswered,
        correctCount: bucket.practiceCorrect,
      }),
      activityCount: bucket.activityCount,
    }));
  }

  private buildActivitySummary(
    activityDates: Set<string>,
    selectedRangeKeys: string[],
    completedChapters: number,
    quizAttempts: number,
    practiceAttempts: number,
    battleCount: number,
    rankedBattles: number,
    trainingBattles: number,
    friendBattles: number,
  ): GrowthActivitySummary {
    const selectedDates = new Set(selectedRangeKeys);
    const activeDays = [...activityDates].filter((date) =>
      selectedDates.has(date),
    );
    const recentKeys = new Set(selectedRangeKeys.slice(-7));
    const recent7ActiveDays = [...activityDates].filter((date) =>
      recentKeys.has(date),
    ).length;
    const previous23ActiveDays = [...activityDates].filter(
      (date) => !recentKeys.has(date),
    ).length;

    return {
      activeDays: activeDays.length,
      recent7ActiveDays,
      previous23ActiveDays,
      completedChapters,
      quizAttempts,
      practiceAttempts,
      battleCount,
      rankedBattles,
      trainingBattles,
      friendBattles,
    };
  }

  private buildBattleSummary(
    counts: Map<BattleMode, number>,
    metrics: Map<BattleMode, AnswerMetric>,
    profile: {
      totalBattles: number;
      rankedBattles: number;
      trainingBattles: number;
      friendBattles: number;
    } | null,
    currentPythonRating: number | null,
    ratingLogs: Array<{
      ratingBefore: number;
      ratingAfter: number;
      ratingDelta: number;
      createdAt: Date;
      skillCode: string | null;
    }>,
  ): GrowthBattleSummary {
    const getCount = (mode: BattleMode) => counts.get(mode) ?? 0;
    const getMetric = (mode: BattleMode) =>
      metrics.get(mode) ?? {
        answeredCount: 0,
        correctCount: 0,
      };
    const buildModePerformance = (mode: BattleMode) =>
      this.buildPerformanceSummary(
        getCount(mode),
        getCount(mode),
        getMetric(mode),
      );

    const rankedBattles = profile?.rankedBattles ?? getCount(BattleMode.RANKED);
    const trainingBattles =
      profile?.trainingBattles ?? getCount(BattleMode.TRAINING);
    const friendBattles = profile?.friendBattles ?? getCount(BattleMode.FRIEND);
    const ratingTrend: GrowthRatingTrendPoint[] = [...ratingLogs]
      .reverse()
      .filter((log): log is typeof log & { skillCode: string } =>
        Boolean(log.skillCode),
      )
      .map((log) => ({
        ratingBefore: log.ratingBefore,
        ratingAfter: log.ratingAfter,
        ratingDelta: log.ratingDelta,
        createdAt: log.createdAt.toISOString(),
        skillCode: log.skillCode,
      }));

    return {
      rankedBattles,
      trainingBattles,
      friendBattles,
      ranked: buildModePerformance(BattleMode.RANKED),
      training: buildModePerformance(BattleMode.TRAINING),
      friend: buildModePerformance(BattleMode.FRIEND),
      currentPythonRating,
      ratingTrend,
    };
  }

  private addWrongQuestion(
    questions: Map<string, WrongAccumulator>,
    areas: Map<string, AreaAccumulator>,
    key: string,
    chapterId: string | null,
    chapterTitle: string | null,
    wrongAt: Date,
  ) {
    const normalizedChapterTitle = chapterTitle ?? '未归类';
    const existing = questions.get(key);
    if (existing) {
      existing.wrongCount += 1;
      existing.latestWrongAt = Math.max(
        existing.latestWrongAt,
        wrongAt.getTime(),
      );
    } else {
      questions.set(key, {
        key,
        chapterId,
        chapterTitle: normalizedChapterTitle,
        wrongCount: 1,
        latestWrongAt: wrongAt.getTime(),
      });
    }

    const areaKey = chapterId ?? 'unknown';
    const area = areas.get(areaKey) ?? {
      chapterId,
      chapterTitle: normalizedChapterTitle,
      wrongAttempts: 0,
      questionKeys: new Set<string>(),
    };
    area.wrongAttempts += 1;
    area.questionKeys.add(key);
    areas.set(areaKey, area);
  }

  private buildWrongSummary(
    questions: Map<string, WrongAccumulator>,
    areas: Map<string, AreaAccumulator>,
  ): GrowthWrongQuestionSummary {
    const orderedQuestions = [...questions.values()].sort(
      (left, right) => right.latestWrongAt - left.latestWrongAt,
    );
    const topWeakAreas: GrowthWrongArea[] = [...areas.values()]
      .sort(
        (left, right) =>
          right.wrongAttempts - left.wrongAttempts ||
          right.questionKeys.size - left.questionKeys.size,
      )
      .slice(0, MAX_WEAK_AREAS)
      .map((area) => ({
        chapterId: area.chapterId,
        chapterTitle: area.chapterTitle,
        wrongAttempts: area.wrongAttempts,
        uniqueWrongQuestions: area.questionKeys.size,
      }));

    return {
      uniqueWrongQuestions: questions.size,
      totalWrongAttempts: orderedQuestions.reduce(
        (sum, question) => sum + question.wrongCount,
        0,
      ),
      repeatedWrongQuestions: orderedQuestions.filter(
        (question) => question.wrongCount >= 2,
      ).length,
      topWeakAreas,
    };
  }

  private findContinueLearning(
    records: Array<{
      courseId: string;
      isSelected: boolean;
      status: string;
      progressPercent: unknown;
      course: { id: string; title: string };
      lastChapter: { id: string; title: string } | null;
    }>,
  ): GrowthContinueLearning {
    const record = [...records]
      .filter((item) => item.isSelected && item.status === 'LEARNING')
      .sort(
        (left, right) =>
          Number(right.progressPercent) - Number(left.progressPercent),
      )[0];

    if (!record) {
      return null;
    }

    return {
      courseId: record.course.id || record.courseId,
      courseTitle: record.course.title,
      chapterId: record.lastChapter?.id ?? null,
      chapterTitle: record.lastChapter?.title ?? null,
      progressPercent: Number(record.progressPercent),
    };
  }
}
