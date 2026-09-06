import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  BattleMode,
  BattleRoomStatus,
  BattleRatingReason,
  LearningGoalStatus,
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
import { getTrackForMajor, PROFESSIONAL_TRACK_CATALOG } from '../course/course-catalog';
import { getFormalCoreRoute, getFormalCourse } from './growth-route';
import {
  calculateGoalMetrics,
  compareGoalDates,
  parseGoalDate,
} from './growth-goal';
import { CreateGrowthGoalDto } from './dto/create-growth-goal.dto';
import { UpdateGrowthGoalDto } from './dto/update-growth-goal.dto';
import type {
  GrowthActivitySummary,
  GrowthBattleSummary,
  GrowthBattleSkillSummary,
  GrowthBattleTrackSummary,
  GrowthChapterPerformance,
  GrowthContinueLearning,
  GrowthNextCourseRecommendation,
  GrowthProfessionalRouteNode,
  GrowthLearningGoal,
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
  courseId: string | null;
  courseTitle: string;
  chapterId: string | null;
  chapterTitle: string;
  wrongCount: number;
  latestWrongAt: number;
};

type AreaAccumulator = {
  courseId: string | null;
  courseTitle: string;
  chapterId: string | null;
  chapterTitle: string;
  wrongAttempts: number;
  questionKeys: Set<string>;
};

type SkillAccumulator = {
  counts: Map<BattleMode, number>;
  metrics: Map<BattleMode, AnswerMetric>;
};

type GoalRecord = {
  id: string;
  userId: string;
  courseId: string;
  targetDate: Date;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  startedAt: Date;
  completedAt: Date | null;
  course: { id: string; title: string };
};

@Injectable()
export class GrowthService {
  constructor(private readonly prisma: PrismaService) {}

  async getCurrentGoal(
    userId: string,
    now = new Date(),
  ): Promise<{ success: true; data: { goal: GrowthLearningGoal | null } }> {
    const goal = await this.prisma.userLearningGoal.findFirst({
      where: { userId, status: LearningGoalStatus.ACTIVE },
      select: {
        id: true,
        userId: true,
        courseId: true,
        targetDate: true,
        status: true,
        startedAt: true,
        completedAt: true,
        course: { select: { id: true, title: true } },
      },
    });

    return {
      success: true,
      data: { goal: goal ? await this.resolveGoalView(goal, now) : null },
    };
  }

  async createGoal(
    userId: string,
    input: CreateGrowthGoalDto,
    now = new Date(),
  ) {
    this.assertFutureTargetDate(input.targetDate, now);
    const course = await this.findLearnableCourse(input.courseId);
    const activeGoal = await this.prisma.userLearningGoal.findFirst({
      where: { userId, status: LearningGoalStatus.ACTIVE },
      select: { id: true },
    });
    if (activeGoal) {
      throw new ConflictException('ACTIVE_LEARNING_GOAL_EXISTS');
    }

    let goal;
    try {
      goal = await this.prisma.userLearningGoal.create({
        data: {
          userId,
          courseId: course.id,
          targetDate: parseGoalDate(input.targetDate),
          status: LearningGoalStatus.ACTIVE,
          startedAt: now,
        },
        select: {
          id: true,
          userId: true,
          courseId: true,
          targetDate: true,
          status: true,
          startedAt: true,
          completedAt: true,
          course: { select: { id: true, title: true } },
        },
      });
    } catch (error) {
      if ((error as { code?: unknown }).code === 'P2002') {
        throw new ConflictException('ACTIVE_LEARNING_GOAL_EXISTS');
      }
      throw error;
    }

    return {
      success: true as const,
      data: { goal: await this.resolveGoalView(goal, now) },
    };
  }

  async updateCurrentGoal(
    userId: string,
    input: UpdateGrowthGoalDto,
    now = new Date(),
  ) {
    if (!input.courseId && !input.targetDate) {
      throw new BadRequestException('LEARNING_GOAL_UPDATE_EMPTY');
    }

    const current = await this.prisma.userLearningGoal.findFirst({
      where: { userId, status: LearningGoalStatus.ACTIVE },
      select: {
        id: true,
        userId: true,
        courseId: true,
        targetDate: true,
        status: true,
        startedAt: true,
        completedAt: true,
        course: { select: { id: true, title: true } },
      },
    });
    if (!current) {
      throw new NotFoundException('LEARNING_GOAL_NOT_FOUND');
    }

    const nextTargetDate = input.targetDate ?? current.targetDate;
    this.assertFutureTargetDate(nextTargetDate, now);
    const course = input.courseId
      ? await this.findLearnableCourse(input.courseId)
      : current.course;
    const courseChanged = course.id !== current.courseId;
    const goal = await this.prisma.userLearningGoal.update({
      where: { id: current.id },
      data: {
        courseId: course.id,
        targetDate: parseGoalDate(nextTargetDate),
        startedAt: courseChanged ? now : current.startedAt,
        completedAt: null,
        status: LearningGoalStatus.ACTIVE,
      },
      select: {
        id: true,
        userId: true,
        courseId: true,
        targetDate: true,
        status: true,
        startedAt: true,
        completedAt: true,
        course: { select: { id: true, title: true } },
      },
    });

    return {
      success: true as const,
      data: { goal: await this.resolveGoalView(goal, now) },
    };
  }

  async cancelCurrentGoal(userId: string) {
    const current = await this.prisma.userLearningGoal.findFirst({
      where: { userId, status: LearningGoalStatus.ACTIVE },
      select: { id: true },
    });
    if (!current) {
      return { success: true as const, data: { goal: null } };
    }

    await this.prisma.userLearningGoal.update({
      where: { id: current.id },
      data: { status: LearningGoalStatus.CANCELLED },
    });
    return { success: true as const, data: { goal: null } };
  }

  private assertFutureTargetDate(value: string | Date, now: Date) {
    if (compareGoalDates(value, this.toDateKey(now)) <= 0) {
      throw new BadRequestException('TARGET_DATE_MUST_BE_FUTURE');
    }
  }

  private async findLearnableCourse(courseId: string) {
    const course = await this.prisma.course.findFirst({
      where: { id: courseId, status: 'PUBLISHED', deletedAt: null },
      select: { id: true, title: true },
    });
    if (!course) {
      throw new NotFoundException('LEARNABLE_COURSE_NOT_FOUND');
    }
    return course;
  }

  private async resolveGoalView(
    goal: GoalRecord,
    now: Date,
  ): Promise<GrowthLearningGoal> {
    const [courseChapters, chapterRecords] = await Promise.all([
      this.prisma.courseChapter.findMany({
        where: {
          courseId: goal.courseId,
          status: 'PUBLISHED',
          deletedAt: null,
        },
        select: { id: true },
      }),
      this.prisma.chapterLearningRecord.findMany({
        where: {
          userId: goal.userId,
          courseId: goal.courseId,
          chapter: { status: 'PUBLISHED', deletedAt: null },
        },
        select: { chapterId: true, status: true },
      }),
    ]);
    return this.buildGoalView(goal, courseChapters, chapterRecords, now);
  }

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
    const skillMetrics = new Map<string, SkillAccumulator>();
    const trackMetrics = new Map<string, SkillAccumulator>();
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
      publishedCourses,
      courseLearningRecords,
      chapterLearningRecords,
      quizAttempts,
      practiceAttempts,
      battleParticipants,
      battleProfile,
      activeGoal,
      battleSkills,
      skillRatings,
      legacyPythonSkillRating,
      trackRatings,
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
          sortOrder: true,
          courseId: true,
          course: { select: { id: true, title: true } },
        },
      }),
      this.prisma.course?.findMany?.({
        where: { status: 'PUBLISHED', deletedAt: null },
        select: { id: true, slug: true, title: true },
      }) ?? Promise.resolve([]),
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
          selectedAt: true,
          updatedAt: true,
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
              professionalTrackKey: true,
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
                  courseIdSnapshot: true,
                  skillCodeSnapshot: true,
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
      this.prisma.userLearningGoal?.findFirst?.({
        where: { userId, status: LearningGoalStatus.ACTIVE },
        select: {
          id: true,
          userId: true,
          courseId: true,
          targetDate: true,
          status: true,
          startedAt: true,
          completedAt: true,
          course: { select: { id: true, title: true } },
        },
      }) ?? Promise.resolve(null),
      this.prisma.battleSkill?.findMany?.({
        orderBy: [{ sortOrder: 'asc' }, { code: 'asc' }],
        select: { code: true, name: true, isEnabled: true },
      }) ?? Promise.resolve([]),
      this.prisma.userBattleSkillRating?.findMany?.({
        where: { userId },
        select: {
          skillCode: true,
          rating: true,
          highestRating: true,
          rankedBattles: true,
        },
      }) ?? Promise.resolve([]),
      this.prisma.userBattleSkillRating?.findUnique?.({
        where: { userId_skillCode: { userId, skillCode: 'PYTHON' } },
        select: { rating: true },
      }) ?? Promise.resolve(null),
      this.prisma.userBattleTrackRating?.findMany?.({
        where: { userId },
        select: {
          trackKey: true,
          rating: true,
          highestRating: true,
          rankedBattles: true,
        },
      }) ?? Promise.resolve([]),
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
            chapter.courseId,
            chapter.courseTitle,
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
            chapter.course.id,
            chapter.course.title,
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
      const skillCode = room.skillCode ?? null;
      const trackKey = room.professionalTrackKey ?? null;
      let skillAccumulator: SkillAccumulator | null = null;
      if (skillCode) {
        skillAccumulator = skillMetrics.get(skillCode) ?? {
          counts: new Map<BattleMode, number>([
            [BattleMode.RANKED, 0],
            [BattleMode.TRAINING, 0],
            [BattleMode.FRIEND, 0],
          ]),
          metrics: new Map<BattleMode, AnswerMetric>([
            [BattleMode.RANKED, { answeredCount: 0, correctCount: 0 }],
            [BattleMode.TRAINING, { answeredCount: 0, correctCount: 0 }],
            [BattleMode.FRIEND, { answeredCount: 0, correctCount: 0 }],
          ]),
        };
        skillMetrics.set(skillCode, skillAccumulator);
        skillAccumulator.counts.set(
          mode,
          (skillAccumulator.counts.get(mode) ?? 0) + 1,
        );
      }
      const trackAccumulator = trackKey
        ? trackMetrics.get(trackKey) ?? {
            counts: new Map<BattleMode, number>([
              [BattleMode.RANKED, 0],
              [BattleMode.TRAINING, 0],
              [BattleMode.FRIEND, 0],
            ]),
            metrics: new Map<BattleMode, AnswerMetric>([
              [BattleMode.RANKED, { answeredCount: 0, correctCount: 0 }],
              [BattleMode.TRAINING, { answeredCount: 0, correctCount: 0 }],
              [BattleMode.FRIEND, { answeredCount: 0, correctCount: 0 }],
            ]),
          }
        : null;
      if (trackKey && trackAccumulator) {
        trackMetrics.set(trackKey, trackAccumulator);
        trackAccumulator.counts.set(
          mode,
          (trackAccumulator.counts.get(mode) ?? 0) + 1,
        );
      }
      for (const answer of participant.answers) {
        modeMetric.answeredCount += 1;
        modeMetric.correctCount += answer.isCorrect ? 1 : 0;
        const skillModeMetric = skillAccumulator?.metrics.get(mode);
        if (skillModeMetric) {
          skillModeMetric.answeredCount += 1;
          skillModeMetric.correctCount += answer.isCorrect ? 1 : 0;
        }
        const trackModeMetric = trackAccumulator?.metrics.get(mode);
        if (trackModeMetric) {
          trackModeMetric.answeredCount += 1;
          trackModeMetric.correctCount += answer.isCorrect ? 1 : 0;
        }

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
            answer.battleQuestionSnapshot.courseIdSnapshot ??
              snapshotChapter?.courseId ??
              null,
            snapshotChapter?.courseTitle ?? '未归类课程',
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

    // Fetch the user's skill history without a global limit. The response
    // caps each skill independently so one active skill cannot starve another.
    const ratingLogs = await this.prisma.battleRatingLog.findMany({
      where: {
        userId,
        skillCode: { not: null },
        reason: BattleRatingReason.BATTLE_RESULT,
      },
      orderBy: [{ createdAt: 'desc' }],
      select: {
        ratingBefore: true,
        ratingAfter: true,
        ratingDelta: true,
        createdAt: true,
        skillCode: true,
        professionalTrackKey: true,
      },
    });

    const profile: GrowthProfileSummary = {
      major: user.major,
      professionalTrack: getTrackForMajor(user.major),
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
      battleSkills,
      skillRatings,
      skillMetrics,
      legacyPythonSkillRating?.rating ?? null,
      trackRatings,
      trackMetrics,
      profile.professionalTrack?.trackKey ?? null,
      ratingLogs,
    );
    const wrongQuestionSummary = this.buildWrongSummary(
      wrongQuestions,
      weakAreas,
    );
    const continueLearning = this.findContinueLearning(
      courseLearningRecords,
      publishedChapters,
      chapterLearningRecords,
    );
    const professionalRoute = this.buildProfessionalRoute(
      profile.professionalTrack?.trackKey ?? null,
      publishedCourses,
      courseLearningRecords,
    );
    const nextRecommendation = this.findNextCourseRecommendation(
      professionalRoute,
    );
    const goal = activeGoal
      ? this.buildGoalView(
          activeGoal,
          publishedChapters.filter(
            (chapter) => chapter.courseId === activeGoal.courseId,
          ),
          chapterLearningRecords.filter((record) =>
            publishedChapters.some(
              (chapter) =>
                chapter.courseId === activeGoal.courseId &&
                chapter.id === record.chapterId,
            ),
          ),
          now,
        )
      : null;
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
      goal,
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
          nextRecommendation,
          professionalRoute,
        },
        competency: { chapters: chapterPerformance },
        wrongQuestions: wrongQuestionSummary,
        goal,
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
    battleSkills: Array<{
      code: string;
      name: string;
      isEnabled: boolean;
    }>,
    skillRatings: Array<{
      skillCode: string;
      rating: number;
      highestRating: number;
      rankedBattles: number;
    }>,
    skillMetrics: Map<string, SkillAccumulator>,
    legacyPythonRating: number | null,
    trackRatings: Array<{
      trackKey: string;
      rating: number;
      highestRating: number;
      rankedBattles: number;
    }>,
    trackMetrics: Map<string, SkillAccumulator>,
    defaultTrackKey: string | null,
    ratingLogs: Array<{
      ratingBefore: number;
      ratingAfter: number;
      ratingDelta: number;
      createdAt: Date;
      skillCode: string | null;
      professionalTrackKey: string | null;
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

    const ratingBySkill = new Map(
      (skillRatings ?? []).map((rating) => [rating.skillCode, rating]),
    );
    const logsBySkill = new Map<string, typeof ratingLogs>();
    for (const log of ratingLogs) {
      if (!log.skillCode) {
        continue;
      }

      const logs = logsBySkill.get(log.skillCode) ?? [];
      if (logs.length < RATING_TREND_LIMIT) {
        logs.push(log);
      }
      logsBySkill.set(log.skillCode, logs);
    }

    const skillDefinitions = new Map(
      (battleSkills ?? []).map((skill) => [skill.code, skill]),
    );
    for (const code of skillMetrics.keys()) {
      if (!skillDefinitions.has(code)) {
        skillDefinitions.set(code, {
          code,
          name: code,
          isEnabled: true,
        });
      }
    }
    for (const rating of skillRatings) {
      if (!skillDefinitions.has(rating.skillCode)) {
        skillDefinitions.set(rating.skillCode, {
          code: rating.skillCode,
          name: rating.skillCode,
          isEnabled: true,
        });
      }
    }
    for (const log of ratingLogs) {
      if (log.skillCode && !skillDefinitions.has(log.skillCode)) {
        skillDefinitions.set(log.skillCode, {
          code: log.skillCode,
          name: log.skillCode,
          isEnabled: true,
        });
      }
    }
    if (legacyPythonRating !== null && !skillDefinitions.has('PYTHON')) {
      skillDefinitions.set('PYTHON', {
        code: 'PYTHON',
        name: 'Python',
        isEnabled: true,
      });
    }

    const buildSkillSummary = (definition: {
      code: string;
      name: string;
      isEnabled: boolean;
    }): GrowthBattleSkillSummary => {
      const accumulator = skillMetrics.get(definition.code);
      const skillRating = ratingBySkill.get(definition.code);
      const getSkillCount = (mode: BattleMode) =>
        accumulator?.counts.get(mode) ?? 0;
      const getSkillMetric = (mode: BattleMode) =>
        accumulator?.metrics.get(mode) ?? {
          answeredCount: 0,
          correctCount: 0,
        };
      const buildSkillModePerformance = (mode: BattleMode) =>
        this.buildPerformanceSummary(
          getSkillCount(mode),
          getSkillCount(mode),
          getSkillMetric(mode),
        );
      const skillTrend: GrowthRatingTrendPoint[] = [
        ...(logsBySkill.get(definition.code) ?? []),
      ]
        .reverse()
        .map((log) => ({
          ratingBefore: log.ratingBefore,
          ratingAfter: log.ratingAfter,
          ratingDelta: log.ratingDelta,
          createdAt: log.createdAt.toISOString(),
          skillCode: definition.code,
        }));

      return {
        code: definition.code,
        name: definition.name,
        isEnabled: definition.isEnabled,
        rating: skillRating?.rating ?? null,
        highestRating: skillRating?.highestRating ?? null,
        rankedBattles:
          skillRating?.rankedBattles ?? getSkillCount(BattleMode.RANKED),
        trainingBattles: getSkillCount(BattleMode.TRAINING),
        friendBattles: getSkillCount(BattleMode.FRIEND),
        ranked: buildSkillModePerformance(BattleMode.RANKED),
        training: buildSkillModePerformance(BattleMode.TRAINING),
        friend: buildSkillModePerformance(BattleMode.FRIEND),
        ratingTrend: skillTrend,
      };
    };

    const skills = [...skillDefinitions.values()].map(buildSkillSummary);
    const defaultSkill =
      skills.find(
        (skill) => skill.rankedBattles > 0 || skill.rating !== null,
      ) ??
      skills[0] ??
      null;
    const ratingByTrack = new Map(
      (trackRatings ?? []).map((rating) => [rating.trackKey, rating]),
    );
    const logsByTrack = new Map<string, typeof ratingLogs>();
    for (const log of ratingLogs) {
      if (!log.professionalTrackKey) continue;
      const logs = logsByTrack.get(log.professionalTrackKey) ?? [];
      if (logs.length < RATING_TREND_LIMIT) logs.push(log);
      logsByTrack.set(log.professionalTrackKey, logs);
    }
    const buildTrackSummary = (track: (typeof PROFESSIONAL_TRACK_CATALOG)[number]): GrowthBattleTrackSummary => {
      const accumulator = trackMetrics.get(track.trackKey);
      const rating = ratingByTrack.get(track.trackKey);
      const getTrackCount = (mode: BattleMode) => accumulator?.counts.get(mode) ?? 0;
      const getTrackMetric = (mode: BattleMode) => accumulator?.metrics.get(mode) ?? { answeredCount: 0, correctCount: 0 };
      const buildTrackModePerformance = (mode: BattleMode) => this.buildPerformanceSummary(getTrackCount(mode), getTrackCount(mode), getTrackMetric(mode));
      const trend = [...(logsByTrack.get(track.trackKey) ?? [])].reverse().map((log) => ({
        ratingBefore: log.ratingBefore,
        ratingAfter: log.ratingAfter,
        ratingDelta: log.ratingDelta,
        createdAt: log.createdAt.toISOString(),
        skillCode: log.skillCode ?? '',
        professionalTrackKey: track.trackKey,
      }));
      return {
        trackKey: track.trackKey,
        formalName: track.formalName,
        shortName: track.shortName,
        rating: rating?.rating ?? null,
        highestRating: rating?.highestRating ?? null,
        rankedBattles: rating?.rankedBattles ?? getTrackCount(BattleMode.RANKED),
        trainingBattles: getTrackCount(BattleMode.TRAINING),
        friendBattles: getTrackCount(BattleMode.FRIEND),
        ranked: buildTrackModePerformance(BattleMode.RANKED),
        training: buildTrackModePerformance(BattleMode.TRAINING),
        friend: buildTrackModePerformance(BattleMode.FRIEND),
        ratingTrend: trend,
      };
    };
    const tracks = PROFESSIONAL_TRACK_CATALOG.map(buildTrackSummary);
    const defaultTrack = tracks.find((track) => track.trackKey === defaultTrackKey) ??
      tracks.find((track) => track.rankedBattles > 0 || track.rating !== null) ??
      tracks[0] ?? null;
    const rankedBattles = profile?.rankedBattles ?? getCount(BattleMode.RANKED);
    const trainingBattles =
      profile?.trainingBattles ?? getCount(BattleMode.TRAINING);
    const friendBattles = profile?.friendBattles ?? getCount(BattleMode.FRIEND);
    const ratingTrend = defaultSkill?.ratingTrend ?? [];

    return {
      skills,
      defaultSkillCode: defaultSkill?.code ?? null,
      tracks,
      defaultTrackKey: defaultTrack?.trackKey ?? null,
      rankedBattles,
      trainingBattles,
      friendBattles,
      ranked: buildModePerformance(BattleMode.RANKED),
      training: buildModePerformance(BattleMode.TRAINING),
      friend: buildModePerformance(BattleMode.FRIEND),
      currentPythonRating:
        skills.find((skill) => skill.code === 'PYTHON')?.rating ??
        legacyPythonRating,
      ratingTrend,
    };
  }

  private buildGoalView(
    goal: GoalRecord,
    courseChapters: Array<{ id: string }>,
    chapterRecords: Array<{ chapterId: string; status: string }>,
    now: Date,
  ): GrowthLearningGoal {
    const completedChapterIds = new Set(
      chapterRecords
        .filter((record) => record.status === 'COMPLETED')
        .map((record) => record.chapterId),
    );

    return calculateGoalMetrics({
      id: goal.id,
      userId: goal.userId,
      courseId: goal.courseId,
      courseTitle: goal.course.title,
      targetDate: goal.targetDate,
      persistedStatus: goal.status,
      startedAt: goal.startedAt,
      completedAt: goal.completedAt,
      totalChapters: courseChapters.length,
      completedChapters: courseChapters.filter((chapter) =>
        completedChapterIds.has(chapter.id),
      ).length,
      now,
    });
  }

  private addWrongQuestion(
    questions: Map<string, WrongAccumulator>,
    areas: Map<string, AreaAccumulator>,
    key: string,
    courseId: string | null,
    courseTitle: string,
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
        courseId,
        courseTitle,
        chapterId,
        chapterTitle: normalizedChapterTitle,
        wrongCount: 1,
        latestWrongAt: wrongAt.getTime(),
      });
    }

    const areaKey = chapterId ?? 'unknown';
    const area = areas.get(areaKey) ?? {
      courseId,
      courseTitle,
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
    const allWeakAreas: GrowthWrongArea[] = [...areas.values()]
      .sort(
        (left, right) =>
          right.wrongAttempts - left.wrongAttempts ||
          right.questionKeys.size - left.questionKeys.size,
      )
      .map((area) => ({
        courseId: area.courseId,
        courseTitle: area.courseTitle,
        chapterId: area.chapterId,
        chapterTitle: area.chapterTitle,
        wrongCount: area.wrongAttempts,
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
      topWeakAreas: allWeakAreas.slice(0, MAX_WEAK_AREAS),
      areas: allWeakAreas,
    };
  }

  private findContinueLearning(
    records: Array<{
      courseId: string;
      isSelected: boolean;
      status: string;
      progressPercent: unknown;
      lastLearnedAt: Date | null;
      selectedAt?: Date | null;
      updatedAt?: Date | null;
      course: { id: string; title: string };
      lastChapter: { id: string; title: string } | null;
    }>,
    publishedChapters: Array<{
      id: string;
      title: string;
      sortOrder: number;
      courseId: string;
      course: { id: string; title: string };
    }>,
    chapterLearningRecords: Array<{
      chapterId: string;
      status: string;
    }>,
  ): GrowthContinueLearning {
    const chapterStatusById = new Map(
      chapterLearningRecords.map((record) => [record.chapterId, record.status]),
    );
    const chaptersByCourse = new Map<string, typeof publishedChapters>();

    for (const chapter of publishedChapters) {
      const chapters = chaptersByCourse.get(chapter.courseId) ?? [];
      chapters.push(chapter);
      chaptersByCourse.set(chapter.courseId, chapters);
    }

    for (const chapters of chaptersByCourse.values()) {
      chapters.sort((left, right) => {
        const leftOrder = Number.isFinite(left.sortOrder)
          ? left.sortOrder
          : Number.MAX_SAFE_INTEGER;
        const rightOrder = Number.isFinite(right.sortOrder)
          ? right.sortOrder
          : Number.MAX_SAFE_INTEGER;

        return leftOrder - rightOrder || left.id.localeCompare(right.id);
      });
    }

    const sortedRecords = [...records]
      .filter((item) => item.isSelected && item.status === 'LEARNING')
      .sort((left, right) => {
        const lastLearnedDifference =
          (right.lastLearnedAt?.getTime?.() ?? 0) -
          (left.lastLearnedAt?.getTime?.() ?? 0);
        if (lastLearnedDifference !== 0) {
          return lastLearnedDifference;
        }

        const progressDifference =
          this.toSafeProgressPercent(right.progressPercent) -
          this.toSafeProgressPercent(left.progressPercent);
        if (progressDifference !== 0) {
          return progressDifference;
        }

        const selectedDifference =
          (right.selectedAt?.getTime?.() ?? 0) -
          (left.selectedAt?.getTime?.() ?? 0);
        if (selectedDifference !== 0) {
          return selectedDifference;
        }

        const updatedDifference =
          (right.updatedAt?.getTime?.() ?? 0) -
          (left.updatedAt?.getTime?.() ?? 0);
        if (updatedDifference !== 0) {
          return updatedDifference;
        }

        return (left.course.id || left.courseId).localeCompare(
          right.course.id || right.courseId,
        );
      });

    for (const record of sortedRecords) {
      const chapters = chaptersByCourse.get(record.courseId) ?? [];
      if (chapters.length === 0) {
        continue;
      }

      const isCompleted = (chapter: (typeof chapters)[number]) =>
        chapterStatusById.get(chapter.id) === 'COMPLETED';
      const incompleteChapters = chapters.filter(
        (chapter) => !isCompleted(chapter),
      );
      if (incompleteChapters.length === 0) {
        continue;
      }

      const lastChapterIndex = record.lastChapter
        ? chapters.findIndex(
            (chapter) =>
              chapter.id === record.lastChapter?.id &&
              chapter.courseId === record.courseId,
          )
        : -1;
      const lastChapter =
        lastChapterIndex >= 0 ? chapters[lastChapterIndex] : undefined;

      const targetChapter =
        lastChapter && !isCompleted(lastChapter)
          ? lastChapter
          : lastChapterIndex >= 0
            ? (chapters
                .slice(lastChapterIndex + 1)
                .find((chapter) => !isCompleted(chapter)) ??
              incompleteChapters[0])
            : incompleteChapters[0];

      if (!targetChapter) {
        continue;
      }

      return {
        courseId: record.course.id || record.courseId,
        courseTitle: record.course.title,
        chapterId: targetChapter.id,
        chapterTitle: targetChapter.title,
        progressPercent: this.toSafeProgressPercent(record.progressPercent),
      };
    }

    return null;
  }

  private toSafeProgressPercent(value: unknown) {
    const progress = Number(value);
    if (!Number.isFinite(progress)) {
      return 0;
    }

    return Math.min(100, Math.max(0, progress));
  }

  private buildProfessionalRoute(
    trackKey: string | null,
    publishedCourses: Array<{ id: string; slug: string; title: string }>,
    records: Array<{
      courseId: string;
      status: string;
      progressPercent: unknown;
    }>,
  ): GrowthProfessionalRouteNode[] {
    if (!trackKey) return [];

    const publishedBySlug = new Map(
      publishedCourses.map((course) => [course.slug, course]),
    );
    const progressByCourseId = new Map(
      records.map((record) => [
        record.courseId,
        {
          progressPercent: Number(record.progressPercent),
          status: record.status,
        },
      ]),
    );

    return getFormalCoreRoute(trackKey).map((course) => {
      const published = publishedBySlug.get(course.slug);
      const progress = published
        ? progressByCourseId.get(published.id)
        : undefined;
      const progressPercent = Math.max(0, Math.min(100, progress?.progressPercent ?? 0));
      const completed = progress?.status === 'COMPLETED' || progressPercent >= 100;
      const status = !published
        ? 'UPCOMING'
        : completed
          ? 'COMPLETED'
          : progressPercent > 0
            ? 'LEARNING'
            : 'AVAILABLE';

      return {
        slug: course.slug,
        courseId: published?.id ?? null,
        courseTitle: published?.title ?? course.title,
        progressPercent,
        status,
        targetPath: published
          ? `/pages/course/detail?courseId=${encodeURIComponent(published.id)}`
          : null,
      };
    });
  }

  private findNextCourseRecommendation(
    route: GrowthProfessionalRouteNode[],
  ): GrowthNextCourseRecommendation | null {
    const current = route.find(
      (item) => item.status === 'LEARNING' && item.progressPercent < 100,
    );
    const candidate = route.find((item) => {
      if (item.status !== 'AVAILABLE' || !item.courseId) return false;
      const prerequisites = getFormalCourse(item.slug)?.prerequisites ?? [];
      return prerequisites.every((slug) => {
        const prerequisite = route.find((routeItem) => routeItem.slug === slug);
        return prerequisite && prerequisite.status !== 'UPCOMING';
      });
    });
    if (!candidate?.courseId || !candidate.targetPath) return null;

    const prerequisiteSlug = getFormalCourse(candidate.slug)?.prerequisites[0];
    const prerequisite = prerequisiteSlug
      ? route.find((item) => item.slug === prerequisiteSlug)
      : undefined;
    const reason = prerequisite && prerequisite.status === 'LEARNING'
      ? `建议先完成${prerequisite.courseTitle}后学习`
      : current && current.slug !== candidate.slug
        ? '专业核心课程 · 下一步推荐'
        : '专业核心课程 · 下一步推荐';

    return {
      courseId: candidate.courseId,
      courseTitle: candidate.courseTitle,
      progressPercent: candidate.progressPercent,
      reason,
      targetPath: candidate.targetPath,
    };
  }
}
