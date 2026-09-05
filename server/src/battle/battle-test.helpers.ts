/* eslint-disable @typescript-eslint/require-await */
import {
  BattleInvitationStatus,
  BattleMode,
  BattleParticipantStatus,
  BattleQuestionDifficulty,
  BattleQuestionPresentation,
  BattleRatingReason,
  BattleQuestionType,
  BattleResult,
  BattleRoomStatus,
  ChapterStatus,
  CourseStatus,
  QuestionType,
  QuizStatus,
} from '../../generated/prisma/enums';

type UserRecord = {
  id: string;
  battleRating: number;
  nickname?: string | null;
  avatarUrl?: string | null;
};

type BattleProfileRecord = {
  id: string;
  userId: string;
  rating: number;
  highestRating: number;
  totalBattles?: number;
  rankedBattles?: number;
  friendBattles?: number;
  trainingBattles?: number;
  wins?: number;
  losses?: number;
  draws?: number;
  currentWinStreak?: number;
  bestWinStreak?: number;
};

type UserBattleSkillRatingRecord = {
  id: string;
  userId: string;
  skillCode: string;
  rating: number;
  highestRating: number;
  rankedBattles: number;
  wins: number;
  losses: number;
  draws: number;
  currentWinStreak: number;
  bestWinStreak: number;
};

type UserBattleTrackRatingRecord = {
  id: string;
  userId: string;
  trackKey: string;
  rating: number;
  highestRating: number;
  rankedBattles: number;
  wins: number;
  losses: number;
  draws: number;
  currentWinStreak: number;
  bestWinStreak: number;
};

type BattleSkillRecord = {
  code: string;
  name: string;
  isEnabled: boolean;
  sortOrder: number;
};

type BattleQueueRecord = {
  id: string;
  userId: string;
  skillCode?: string | null;
  professionalTrackKey?: string | null;
  status: 'SEARCHING' | 'MATCHED' | 'CANCELLED' | 'EXPIRED';
  ratingSnapshot: number;
  matchedBattleRoomId: string | null;
  searchStartedAt: Date | null;
  matchedAt: Date | null;
  cancelledAt: Date | null;
  expiresAt: Date | null;
  updatedAt?: Date;
};

type BattleRoomRecord = {
  id: string;
  mode: BattleMode;
  skillCode?: string | null;
  professionalTrackKey?: string | null;
  status: BattleRoomStatus;
  questionCount: number;
  durationSeconds: number;
  correctScore: number;
  wrongScore: number;
  unansweredScore: number;
  createdByUserId: string | null;
  expiresAt: Date | null;
  startedAt: Date | null;
  settledAt?: Date | null;
  completedAt?: Date | null;
  cancelledAt?: Date | null;
  endReason: string | null;
  winnerUserId?: string | null;
  createdAt: Date;
  updatedAt?: Date;
};

type BattleParticipantRecord = {
  id: string;
  battleRoomId: string;
  userId: string;
  professionalTrackKey?: string | null;
  seat: number;
  status: BattleParticipantStatus;
  result: BattleResult;
  joinedAt: Date;
  readyAt?: Date | null;
  submittedAt?: Date | null;
  forfeitedAt?: Date | null;
  completedAt?: Date | null;
  score?: number;
  correctCount?: number;
  wrongCount?: number;
  unansweredCount?: number;
  ratingBefore?: number | null;
  ratingDelta?: number;
  ratingAfter?: number | null;
  updatedAt?: Date;
};

type BattleAiOpponentRecord = {
  id: string;
  battleRoomId: string;
  displayName: string;
  strategyVersion: string;
  seed: string;
  answerPlan: unknown;
  plannedSubmittedOffsetMs: number;
  createdAt: Date;
  updatedAt: Date;
};

type BattleInvitationRecord = {
  id: string;
  battleRoomId: string;
  inviterUserId: string;
  inviteeUserId: string | null;
  token: string;
  inviteCode: string | null;
  status: BattleInvitationStatus;
  expiresAt: Date;
  acceptedAt: Date | null;
  cancelledAt: Date | null;
};

type BattleQuestionSnapshotRecord = {
  id: string;
  battleRoomId: string;
  ownerParticipantId?: string | null;
  sourceQuizQuestionId: string | null;
  orderIndex: number;
  participantOrderIndex?: number | null;
  questionType: BattleQuestionType;
  presentation: BattleQuestionPresentation;
  difficulty: BattleQuestionDifficulty | null;
  stemSnapshot: unknown;
  optionsSnapshot: unknown;
  correctAnswerSnapshot: unknown;
  explanationSnapshot: unknown;
  acceptedAnswersSnapshot: unknown;
  answerNormalizationSnapshot: unknown;
  knowledgeTagsSnapshot: unknown;
  programmingLanguage: string | null;
  skillCodeSnapshot?: string | null;
  courseIdSnapshot: string | null;
  chapterIdSnapshot: string | null;
  createdAt: Date;
};

type BattleAnswerRecord = {
  id: string;
  battleRoomId: string;
  participantId: string;
  battleQuestionSnapshotId: string;
  userId: string;
  clientRequestId: string;
  answerVersion: number;
  answerPayload: unknown;
  normalizedAnswer: string | null;
  isCorrect: boolean;
  scoreDelta: number;
  submittedAt: Date;
  timeSpentMs: number | null;
  createdAt: Date;
};

type BattleRatingLogRecord = {
  id: string;
  userId: string;
  battleRoomId: string | null;
  participantId: string | null;
  skillCode?: string | null;
  professionalTrackKey?: string | null;
  reason: BattleRatingReason;
  ratingBefore: number;
  ratingDelta: number;
  ratingAfter: number;
  createdAt: Date;
};

type QuizQuestionRecord = {
  id: string;
  type: QuestionType;
  content: string;
  explanation: string | null;
  battlePresentation: BattleQuestionPresentation | null;
  battleDifficulty: BattleQuestionDifficulty | null;
  isBattleEnabled: boolean;
  stemBlocks: unknown;
  explanationBlocks: unknown;
  acceptedAnswers: unknown;
  answerNormalization: unknown;
  caseSensitive: boolean;
  knowledgeTags: unknown;
  programmingLanguage: string | null;
  battleSkillCode?: string | null;
  createdAt: Date;
  options: Array<{
    id: string;
    content: string;
    contentBlocks: unknown;
    isCorrect: boolean;
    sortOrder: number;
  }>;
  quiz: {
    status: QuizStatus;
    chapterId: string;
    chapter: {
      status: ChapterStatus;
      courseId: string;
      course: {
        status: CourseStatus;
        deletedAt?: Date | null;
      };
    };
  };
};

let sequence = 0;

function nextId() {
  sequence += 1;
  const suffix = sequence.toString(16).padStart(12, '0');
  return `00000000-0000-4000-8000-${suffix}`;
}

function normalizeParticipant(record: Partial<BattleParticipantRecord>) {
  return {
    id: record.id ?? nextId(),
    battleRoomId: record.battleRoomId!,
    userId: record.userId!,
    professionalTrackKey: record.professionalTrackKey ?? null,
    seat: record.seat!,
    status: record.status ?? BattleParticipantStatus.JOINED,
    result: record.result ?? BattleResult.NONE,
    joinedAt: record.joinedAt ?? new Date(),
    readyAt: record.readyAt ?? null,
    submittedAt: record.submittedAt ?? null,
    forfeitedAt: record.forfeitedAt ?? null,
    completedAt: record.completedAt ?? null,
    score: record.score ?? 0,
    correctCount: record.correctCount ?? 0,
    wrongCount: record.wrongCount ?? 0,
    unansweredCount: record.unansweredCount ?? 0,
    ratingBefore: record.ratingBefore ?? null,
    ratingDelta: record.ratingDelta ?? 0,
    ratingAfter: record.ratingAfter ?? null,
    updatedAt: record.updatedAt ?? new Date(),
  } satisfies BattleParticipantRecord;
}

function toRoomView(
  rooms: Map<string, BattleRoomRecord>,
  aiOpponents: Map<string, BattleAiOpponentRecord>,
  participants: Map<string, BattleParticipantRecord>,
  users: Map<string, UserRecord>,
  skills: Map<string, BattleSkillRecord>,
  questionSnapshots: Map<string, BattleQuestionSnapshotRecord>,
  answers: Map<string, BattleAnswerRecord>,
  roomId: string,
) {
  const room = rooms.get(roomId);

  if (!room) {
    return null;
  }

  const roomParticipants = [...participants.values()]
    .filter((participant) => participant.battleRoomId === roomId)
    .map((participant) => ({
      id: participant.id,
      userId: participant.userId,
      professionalTrackKey: participant.professionalTrackKey ?? null,
      seat: participant.seat,
      status: participant.status,
      result: participant.result,
      score: participant.score ?? 0,
      correctCount: participant.correctCount ?? 0,
      wrongCount: participant.wrongCount ?? 0,
      unansweredCount: participant.unansweredCount ?? 0,
      ratingBefore: participant.ratingBefore ?? null,
      ratingDelta: participant.ratingDelta ?? 0,
      ratingAfter: participant.ratingAfter ?? null,
      readyAt: participant.readyAt ?? null,
      submittedAt: participant.submittedAt ?? null,
      forfeitedAt: participant.forfeitedAt ?? null,
      completedAt: participant.completedAt ?? null,
      user: {
        id: participant.userId,
        nickname: users.get(participant.userId)?.nickname ?? null,
        avatarUrl: users.get(participant.userId)?.avatarUrl ?? null,
      },
    }));

  const snapshots = [...questionSnapshots.values()]
    .filter((snapshot) => snapshot.battleRoomId === roomId)
    .sort((left, right) => left.orderIndex - right.orderIndex);

  const roomAnswers = [...answers.values()]
    .filter((answer) => answer.battleRoomId === roomId)
    .sort((left, right) => {
      const submittedDiff =
        left.submittedAt.getTime() - right.submittedAt.getTime();

      if (submittedDiff !== 0) {
        return submittedDiff;
      }

      return left.createdAt.getTime() - right.createdAt.getTime();
    })
    .map((answer) => ({
      id: answer.id,
      battleRoomId: answer.battleRoomId,
      participantId: answer.participantId,
      battleQuestionSnapshotId: answer.battleQuestionSnapshotId,
      userId: answer.userId,
      clientRequestId: answer.clientRequestId,
      answerPayload: answer.answerPayload,
      normalizedAnswer: answer.normalizedAnswer,
      isCorrect: answer.isCorrect,
      scoreDelta: answer.scoreDelta,
      submittedAt: answer.submittedAt,
      timeSpentMs: answer.timeSpentMs,
      createdAt: answer.createdAt,
    }));

  return {
    ...room,
    skill: room.skillCode
      ? {
          name: skills.get(room.skillCode)?.name ?? room.skillCode,
        }
      : null,
    winnerUserId: room.winnerUserId ?? null,
    updatedAt: room.updatedAt ?? room.createdAt,
    participants: roomParticipants,
    aiOpponent:
      [...aiOpponents.values()].find(
        (opponent) => opponent.battleRoomId === roomId,
      ) ?? null,
    questionSnapshots: snapshots,
    answers: roomAnswers,
  };
}

export function createBattlePrismaMock() {
  const users = new Map<string, UserRecord>();
  const battleProfiles = new Map<string, BattleProfileRecord>();
  const battleSkills = new Map<string, BattleSkillRecord>([
    [
      'PYTHON',
      {
        code: 'PYTHON',
        name: 'Python',
        isEnabled: true,
        sortOrder: 100,
      },
    ],
  ]);
  const userBattleSkillRatings = new Map<string, UserBattleSkillRatingRecord>();
  const userBattleTrackRatings = new Map<string, UserBattleTrackRatingRecord>();
  const battleQueues = new Map<string, BattleQueueRecord>();
  const battleRooms = new Map<string, BattleRoomRecord>();
  const battleAiOpponents = new Map<string, BattleAiOpponentRecord>();
  const battleParticipants = new Map<string, BattleParticipantRecord>();
  const battleInvitations = new Map<string, BattleInvitationRecord>();
  const battleRatingLogs = new Map<string, BattleRatingLogRecord>();
  const battleQuestionSnapshots = new Map<
    string,
    BattleQuestionSnapshotRecord
  >();
  const battleAnswers = new Map<string, BattleAnswerRecord>();
  const quizQuestions = new Map<string, QuizQuestionRecord>();

  const tx = {
    $queryRaw: jest.fn(async () => [{ locked: true }]),
    user: {
      findUnique: jest.fn(async ({ where }: { where: { id: string } }) => {
        const user = users.get(where.id);
        return user
          ? {
              id: user.id,
              battleRating: user.battleRating,
              nickname: user.nickname ?? null,
              avatarUrl: user.avatarUrl ?? null,
            }
          : null;
      }),
    },
    battleProfile: {
      upsert: jest.fn(
        async ({
          where,
          create,
        }: {
          where: { userId: string };
          create: { userId: string; rating: number; highestRating: number };
        }) => {
          const existing = battleProfiles.get(where.userId);

          if (existing) {
            return existing;
          }

          const record: BattleProfileRecord = {
            id: nextId(),
            userId: create.userId,
            rating: create.rating,
            highestRating: create.highestRating,
            totalBattles: 0,
            rankedBattles: 0,
            friendBattles: 0,
            trainingBattles: 0,
            wins: 0,
            losses: 0,
            draws: 0,
            currentWinStreak: 0,
            bestWinStreak: 0,
          };

          battleProfiles.set(record.userId, record);
          return record;
        },
      ),
      findUnique: jest.fn(async ({ where }: { where: { userId: string } }) => {
        return battleProfiles.get(where.userId) ?? null;
      }),
      update: jest.fn(
        async ({
          where,
          data,
        }: {
          where: { userId: string };
          data: Record<string, unknown>;
        }) => {
          const existing = battleProfiles.get(where.userId);

          if (!existing) {
            throw new Error('Battle profile not found');
          }

          const updated = applyScalarUpdate(existing, data);
          battleProfiles.set(where.userId, updated);
          return updated;
        },
      ),
      findMany: jest.fn(
        async ({ where }: { where?: Record<string, unknown> }) => {
          return [...battleProfiles.values()]
            .filter((record) => {
              if (!where) {
                return true;
              }

              if (
                where.userId !== undefined &&
                record.userId !== where.userId
              ) {
                return false;
              }

              return true;
            })
            .map((record) => ({
              ...record,
              user: {
                id: record.userId,
                nickname: users.get(record.userId)?.nickname ?? null,
                avatarUrl: users.get(record.userId)?.avatarUrl ?? null,
              },
            }));
        },
      ),
    },
    battleSkill: {
      findMany: jest.fn(
        async ({
          where,
          select,
        }: {
          where?: { isEnabled?: boolean };
          select?: {
            quizQuestions?: { where?: Record<string, unknown> };
          };
        }) =>
          [...battleSkills.values()]
            .filter(
              (skill) =>
                where?.isEnabled === undefined ||
                skill.isEnabled === where.isEnabled,
            )
            .sort(
              (left, right) =>
                left.sortOrder - right.sortOrder ||
                left.code.localeCompare(right.code),
            )
            .map((skill) => ({
              ...skill,
              quizQuestions: [...quizQuestions.values()].filter(
                (question) =>
                  question.battleSkillCode === skill.code &&
                  matchesQuizQuestionWhere(
                    question,
                    select?.quizQuestions?.where ?? {},
                  ),
              ),
            })),
      ),
    },
    userBattleSkillRating: {
      upsert: jest.fn(
        async ({
          where,
          create,
        }: {
          where: { userId_skillCode: { userId: string; skillCode: string } };
          create: Partial<UserBattleSkillRatingRecord> & {
            userId: string;
            skillCode: string;
          };
        }) => {
          const key = `${where.userId_skillCode.userId}:${where.userId_skillCode.skillCode}`;
          const existing = userBattleSkillRatings.get(key);

          if (existing) {
            return existing;
          }

          const record: UserBattleSkillRatingRecord = {
            id: create.id ?? nextId(),
            userId: create.userId,
            skillCode: create.skillCode,
            rating: create.rating ?? 1000,
            highestRating: create.highestRating ?? 1000,
            rankedBattles: create.rankedBattles ?? 0,
            wins: create.wins ?? 0,
            losses: create.losses ?? 0,
            draws: create.draws ?? 0,
            currentWinStreak: create.currentWinStreak ?? 0,
            bestWinStreak: create.bestWinStreak ?? 0,
          };
          userBattleSkillRatings.set(key, record);
          return record;
        },
      ),
      update: jest.fn(
        async ({
          where,
          data,
        }: {
          where: { userId_skillCode: { userId: string; skillCode: string } };
          data: Record<string, unknown>;
        }) => {
          const key = `${where.userId_skillCode.userId}:${where.userId_skillCode.skillCode}`;
          const existing = userBattleSkillRatings.get(key);

          if (!existing) {
            throw new Error('Battle skill rating not found');
          }

          const updated = applyScalarUpdate(existing, data);
          userBattleSkillRatings.set(key, updated);
          return updated;
        },
      ),
      findMany: jest.fn(
        async ({ where }: { where?: Record<string, unknown> }) =>
          [...userBattleSkillRatings.values()]
            .filter((record) => {
              if (!where) {
                return true;
              }

              if (
                typeof where.skillCode === 'string' &&
                record.skillCode !== where.skillCode
              ) {
                return false;
              }

              if (
                where.rankedBattles &&
                typeof where.rankedBattles === 'object' &&
                'gt' in where.rankedBattles &&
                record.rankedBattles <=
                  ((where.rankedBattles as { gt?: number }).gt ?? 0)
              ) {
                return false;
              }

              return true;
            })
            .map((record) => ({
              ...record,
              user: {
                nickname: users.get(record.userId)?.nickname ?? null,
                avatarUrl: users.get(record.userId)?.avatarUrl ?? null,
              },
            })),
      ),
    },
    userBattleTrackRating: {
      upsert: jest.fn(
        async ({
          where,
          create,
        }: {
          where: { userId_trackKey: { userId: string; trackKey: string } };
          create: Partial<UserBattleTrackRatingRecord> & {
            userId: string;
            trackKey: string;
          };
        }) => {
          const key = `${where.userId_trackKey.userId}:${where.userId_trackKey.trackKey}`;
          const existing = userBattleTrackRatings.get(key);
          if (existing) return existing;
          const record: UserBattleTrackRatingRecord = {
            id: create.id ?? nextId(),
            userId: create.userId,
            trackKey: create.trackKey,
            rating: create.rating ?? 1000,
            highestRating: create.highestRating ?? 1000,
            rankedBattles: create.rankedBattles ?? 0,
            wins: create.wins ?? 0,
            losses: create.losses ?? 0,
            draws: create.draws ?? 0,
            currentWinStreak: create.currentWinStreak ?? 0,
            bestWinStreak: create.bestWinStreak ?? 0,
          };
          userBattleTrackRatings.set(key, record);
          return record;
        },
      ),
      update: jest.fn(
        async ({
          where,
          data,
        }: {
          where: { userId_trackKey: { userId: string; trackKey: string } };
          data: Record<string, unknown>;
        }) => {
          const key = `${where.userId_trackKey.userId}:${where.userId_trackKey.trackKey}`;
          const existing = userBattleTrackRatings.get(key);
          if (!existing) throw new Error('Battle track rating not found');
          const updated = applyScalarUpdate(existing, data) as UserBattleTrackRatingRecord;
          userBattleTrackRatings.set(key, updated);
          return updated;
        },
      ),
      findUnique: jest.fn(
        async ({
          where,
        }: {
          where: { userId_trackKey: { userId: string; trackKey: string } };
        }) =>
          userBattleTrackRatings.get(
            `${where.userId_trackKey.userId}:${where.userId_trackKey.trackKey}`,
          ) ?? null,
      ),
      findMany: jest.fn(
        async ({ where }: { where?: Record<string, unknown> } = {}) =>
          [...userBattleTrackRatings.values()]
            .filter((record) => {
              if (typeof where?.trackKey === 'string' && record.trackKey !== where.trackKey) return false;
              const rankedBattles = where?.rankedBattles as { gt?: number } | undefined;
              if (rankedBattles?.gt !== undefined && record.rankedBattles <= rankedBattles.gt) return false;
              return true;
            })
            .map((record) => ({
              ...record,
              user: {
                nickname: users.get(record.userId)?.nickname ?? null,
                avatarUrl: users.get(record.userId)?.avatarUrl ?? null,
              },
            })),
      ),
    },
    battleMatchQueue: {
      findUnique: jest.fn(async ({ where }: { where: { userId: string } }) => {
        return battleQueues.get(where.userId) ?? null;
      }),
      create: jest.fn(
        async ({ data }: { data: Partial<BattleQueueRecord> }) => {
          const record: BattleQueueRecord = {
            id: nextId(),
            userId: data.userId!,
            skillCode: data.skillCode ?? null,
            professionalTrackKey: data.professionalTrackKey ?? null,
            status: (data.status as BattleQueueRecord['status']) ?? 'CANCELLED',
            ratingSnapshot: data.ratingSnapshot ?? 1000,
            matchedBattleRoomId: data.matchedBattleRoomId ?? null,
            searchStartedAt: data.searchStartedAt ?? null,
            matchedAt: data.matchedAt ?? null,
            cancelledAt: data.cancelledAt ?? null,
            expiresAt: data.expiresAt ?? null,
            updatedAt: data.updatedAt ?? new Date(),
          };
          battleQueues.set(record.userId, record);
          return record;
        },
      ),
      update: jest.fn(
        async ({
          where,
          data,
        }: {
          where: { userId: string };
          data: Partial<BattleQueueRecord>;
        }) => {
          const existing = battleQueues.get(where.userId);

          if (!existing) {
            throw new Error('Queue not found');
          }

          const updated = {
            ...existing,
            ...data,
            updatedAt: data.updatedAt ?? new Date(),
          };

          battleQueues.set(where.userId, updated);
          return updated;
        },
      ),
      updateMany: jest.fn(
        async ({
          where,
          data,
        }: {
          where: Record<string, unknown>;
          data: Partial<BattleQueueRecord>;
        }) => {
          let count = 0;

          for (const [userId, record] of battleQueues.entries()) {
            if (!matchesQueueWhere(record, where)) {
              continue;
            }

            battleQueues.set(userId, {
              ...record,
              ...data,
              updatedAt: data.updatedAt ?? new Date(),
            });
            count += 1;
          }

          return { count };
        },
      ),
      findMany: jest.fn(
        async ({ where }: { where: Record<string, unknown> }) => {
          return [...battleQueues.values()].filter((record) =>
            matchesQueueWhere(record, where),
          );
        },
      ),
      count: jest.fn(async ({ where }: { where: Record<string, unknown> }) => {
        return [...battleQueues.values()].filter((record) =>
          matchesQueueWhere(record, where),
        ).length;
      }),
    },
    battleRoom: {
      create: jest.fn(async ({ data }: { data: Partial<BattleRoomRecord> }) => {
        const record: BattleRoomRecord = {
          id: data.id ?? nextId(),
          mode: data.mode ?? BattleMode.RANKED,
          skillCode: data.skillCode ?? null,
          professionalTrackKey: data.professionalTrackKey ?? null,
          status: data.status ?? BattleRoomStatus.WAITING,
          questionCount: data.questionCount ?? 20,
          durationSeconds: data.durationSeconds ?? 180,
          correctScore: data.correctScore ?? 2,
          wrongScore: data.wrongScore ?? -1,
          unansweredScore: data.unansweredScore ?? 0,
          createdByUserId: data.createdByUserId ?? null,
          expiresAt: data.expiresAt ?? null,
          startedAt: data.startedAt ?? null,
          settledAt: data.settledAt ?? null,
          completedAt: data.completedAt ?? null,
          cancelledAt: data.cancelledAt ?? null,
          endReason: data.endReason ?? null,
          winnerUserId: data.winnerUserId ?? null,
          createdAt: data.createdAt ?? new Date(),
          updatedAt: data.updatedAt ?? new Date(),
        };
        battleRooms.set(record.id, record);
        return record;
      }),
      findUnique: jest.fn(async ({ where }: { where: { id: string } }) => {
        return toRoomView(
          battleRooms,
          battleAiOpponents,
          battleParticipants,
          users,
          battleSkills,
          battleQuestionSnapshots,
          battleAnswers,
          where.id,
        );
      }),
      findMany: jest.fn(
        async ({ where }: { where?: Record<string, unknown> }) => {
          return [...battleRooms.values()]
            .filter((room) =>
              matchesRoomWhere(room, where ?? {}, battleParticipants),
            )
            .map((room) =>
              toRoomView(
                battleRooms,
                battleAiOpponents,
                battleParticipants,
                users,
                battleSkills,
                battleQuestionSnapshots,
                battleAnswers,
                room.id,
              ),
            );
        },
      ),
      findFirst: jest.fn(
        async ({
          where,
        }: {
          where: {
            id?: string;
            participants?: { some?: { userId?: string } };
          };
        }) => {
          const candidateIds = where.id ? [where.id] : [...battleRooms.keys()];

          for (const roomId of candidateIds) {
            const room = toRoomView(
              battleRooms,
              battleAiOpponents,
              battleParticipants,
              users,
              battleSkills,
              battleQuestionSnapshots,
              battleAnswers,
              roomId,
            );

            if (!room) {
              continue;
            }

            if (
              where.participants?.some?.userId &&
              !room.participants.some(
                (participant) =>
                  participant.userId === where.participants?.some?.userId,
              )
            ) {
              continue;
            }

            return room;
          }

          return null;
        },
      ),
      update: jest.fn(
        async ({
          where,
          data,
        }: {
          where: { id: string };
          data: Partial<BattleRoomRecord>;
        }) => {
          const existing = battleRooms.get(where.id);

          if (!existing) {
            throw new Error('Room not found');
          }

          const updated = {
            ...existing,
            ...data,
            updatedAt: (data.updatedAt as Date | undefined) ?? new Date(),
          };
          battleRooms.set(where.id, updated);
          return updated;
        },
      ),
      updateMany: jest.fn(
        async ({
          where,
          data,
        }: {
          where: Record<string, unknown>;
          data: Partial<BattleRoomRecord>;
        }) => {
          let count = 0;

          for (const [id, room] of battleRooms.entries()) {
            if (!matchesRoomWhere(room, where, battleParticipants)) {
              continue;
            }

            battleRooms.set(id, {
              ...room,
              ...data,
              updatedAt: (data.updatedAt as Date | undefined) ?? new Date(),
            });
            count += 1;
          }

          return { count };
        },
      ),
    },
    battleParticipant: {
      findFirst: jest.fn(
        async ({
          where,
        }: {
          where: {
            userId?: string;
            battleRoomId?: string;
            battleRoom?: { status?: { in: BattleRoomStatus[] } };
          };
        }) => {
          for (const participant of battleParticipants.values()) {
            if (where.userId && participant.userId !== where.userId) {
              continue;
            }

            if (
              where.battleRoomId &&
              participant.battleRoomId !== where.battleRoomId
            ) {
              continue;
            }

            const room = battleRooms.get(participant.battleRoomId);

            if (!room) {
              continue;
            }

            if (
              where.battleRoom?.status?.in &&
              !where.battleRoom.status.in.includes(room.status)
            ) {
              continue;
            }

            return {
              ...participant,
              score: participant.score ?? 0,
              correctCount: participant.correctCount ?? 0,
              wrongCount: participant.wrongCount ?? 0,
              unansweredCount: participant.unansweredCount ?? 0,
              ratingBefore: participant.ratingBefore ?? null,
              ratingDelta: participant.ratingDelta ?? 0,
              ratingAfter: participant.ratingAfter ?? null,
              battleRoom: {
                id: room.id,
                mode: room.mode,
                skillCode: room.skillCode ?? null,
                skill: room.skillCode
                  ? {
                      name:
                        battleSkills.get(room.skillCode)?.name ?? room.skillCode,
                    }
                  : null,
                status: room.status,
                questionCount: room.questionCount,
                durationSeconds: room.durationSeconds,
                correctScore: room.correctScore,
                wrongScore: room.wrongScore,
                startedAt: room.startedAt,
                expiresAt: room.expiresAt,
                settledAt: room.settledAt,
                completedAt: room.completedAt,
                cancelledAt: room.cancelledAt,
                endReason: room.endReason,
                invitation:
                  [...battleInvitations.values()].find(
                    (invitation) => invitation.battleRoomId === room.id,
                  ) ?? null,
              },
            };
          }

          return null;
        },
      ),
      findMany: jest.fn(
        async ({ where }: { where: Record<string, unknown> }) => {
          return [...battleParticipants.values()]
            .filter((participant) =>
              matchesParticipantWhere(participant, where, battleRooms),
            )
            .map((participant) => ({
              ...participant,
              score: participant.score ?? 0,
              correctCount: participant.correctCount ?? 0,
              wrongCount: participant.wrongCount ?? 0,
              unansweredCount: participant.unansweredCount ?? 0,
              ratingBefore: participant.ratingBefore ?? null,
              ratingDelta: participant.ratingDelta ?? 0,
              ratingAfter: participant.ratingAfter ?? null,
            }));
        },
      ),
      createMany: jest.fn(
        async ({ data }: { data: Array<Partial<BattleParticipantRecord>> }) => {
          for (const item of data) {
            const record = normalizeParticipant(item);
            battleParticipants.set(record.id, record);
          }

          return { count: data.length };
        },
      ),
      create: jest.fn(
        async ({ data }: { data: Partial<BattleParticipantRecord> }) => {
          const existingSeat = [...battleParticipants.values()].find(
            (participant) =>
              participant.battleRoomId === data.battleRoomId &&
              participant.seat === data.seat,
          );

          const existingUser = [...battleParticipants.values()].find(
            (participant) =>
              participant.battleRoomId === data.battleRoomId &&
              participant.userId === data.userId,
          );

          if (existingSeat || existingUser) {
            const error = Object.assign(new Error('Unique constraint failed'), {
              code: 'P2002',
            });
            throw error;
          }

          const record = normalizeParticipant(data);
          battleParticipants.set(record.id, record);
          return record;
        },
      ),
      update: jest.fn(
        async ({
          where,
          data,
        }: {
          where: { id: string };
          data: Record<string, unknown>;
        }) => {
          const existing = battleParticipants.get(where.id);

          if (!existing) {
            throw new Error('Participant not found');
          }

          const updated = applyParticipantUpdate(existing, data);
          battleParticipants.set(where.id, updated);
          return updated;
        },
      ),
      updateMany: jest.fn(
        async ({
          where,
          data,
        }: {
          where: Record<string, unknown>;
          data: Record<string, unknown>;
        }) => {
          let count = 0;

          for (const [id, participant] of battleParticipants.entries()) {
            if (!matchesParticipantWhere(participant, where, battleRooms)) {
              continue;
            }

            battleParticipants.set(
              id,
              applyParticipantUpdate(participant, data),
            );
            count += 1;
          }

          return { count };
        },
      ),
    },
    battleAiOpponent: {
      create: jest.fn(
        async ({ data }: { data: Partial<BattleAiOpponentRecord> }) => {
          const existing = [...battleAiOpponents.values()].find(
            (opponent) => opponent.battleRoomId === data.battleRoomId,
          );

          if (existing) {
            const error = Object.assign(new Error('Unique constraint failed'), {
              code: 'P2002',
            });
            throw error;
          }

          const record: BattleAiOpponentRecord = {
            id: data.id ?? nextId(),
            battleRoomId: data.battleRoomId!,
            displayName: data.displayName ?? '电脑对手',
            strategyVersion: data.strategyVersion ?? 'normal-v1',
            seed: data.seed ?? 'test-seed',
            answerPlan: data.answerPlan ?? null,
            plannedSubmittedOffsetMs: data.plannedSubmittedOffsetMs ?? 0,
            createdAt: data.createdAt ?? new Date(),
            updatedAt: data.updatedAt ?? new Date(),
          };

          battleAiOpponents.set(record.id, record);
          return record;
        },
      ),
      findUnique: jest.fn(
        async ({ where }: { where: { battleRoomId: string } }) =>
          [...battleAiOpponents.values()].find(
            (opponent) => opponent.battleRoomId === where.battleRoomId,
          ) ?? null,
      ),
    },
    battleInvitation: {
      create: jest.fn(
        async ({ data }: { data: Partial<BattleInvitationRecord> }) => {
          const tokenExists = [...battleInvitations.values()].some(
            (invitation) => invitation.token === data.token,
          );
          const inviteCodeExists =
            data.inviteCode !== undefined &&
            data.inviteCode !== null &&
            [...battleInvitations.values()].some(
              (invitation) => invitation.inviteCode === data.inviteCode,
            );

          if (tokenExists || inviteCodeExists) {
            const error = Object.assign(new Error('Unique constraint failed'), {
              code: 'P2002',
            });
            throw error;
          }

          const record: BattleInvitationRecord = {
            id: data.id ?? nextId(),
            battleRoomId: data.battleRoomId!,
            inviterUserId: data.inviterUserId!,
            inviteeUserId: data.inviteeUserId ?? null,
            token: data.token!,
            inviteCode: data.inviteCode ?? null,
            status: data.status ?? BattleInvitationStatus.ACTIVE,
            expiresAt: data.expiresAt!,
            acceptedAt: data.acceptedAt ?? null,
            cancelledAt: data.cancelledAt ?? null,
          };

          battleInvitations.set(record.id, record);
          return record;
        },
      ),
      findUnique: jest.fn(
        async ({
          where,
        }: {
          where: {
            token?: string;
            inviteCode?: string;
            battleRoomId?: string;
          };
        }) => {
          const invitation = [...battleInvitations.values()].find(
            (item) =>
              (where.token !== undefined && item.token === where.token) ||
              (where.inviteCode !== undefined &&
                item.inviteCode === where.inviteCode) ||
              (where.battleRoomId !== undefined &&
                item.battleRoomId === where.battleRoomId),
          );

          if (!invitation) {
            return null;
          }

          return {
            ...invitation,
            inviterUser: {
              id: invitation.inviterUserId,
              nickname: users.get(invitation.inviterUserId)?.nickname ?? null,
              avatarUrl: users.get(invitation.inviterUserId)?.avatarUrl ?? null,
            },
            battleRoom: toRoomView(
              battleRooms,
              battleAiOpponents,
              battleParticipants,
              users,
              battleSkills,
              battleQuestionSnapshots,
              battleAnswers,
              invitation.battleRoomId,
            ),
          };
        },
      ),
      update: jest.fn(
        async ({
          where,
          data,
        }: {
          where: { id: string };
          data: Partial<BattleInvitationRecord>;
        }) => {
          const existing = battleInvitations.get(where.id);

          if (!existing) {
            throw new Error('Invitation not found');
          }

          const updated = {
            ...existing,
            ...data,
          };

          battleInvitations.set(where.id, updated);
          return updated;
        },
      ),
      updateMany: jest.fn(
        async ({
          where,
          data,
        }: {
          where: Record<string, unknown>;
          data: Partial<BattleInvitationRecord>;
        }) => {
          let count = 0;

          for (const [id, invitation] of battleInvitations.entries()) {
            if (!matchesInvitationWhere(invitation, where)) {
              continue;
            }

            battleInvitations.set(id, {
              ...invitation,
              ...data,
            });
            count += 1;
          }

          return { count };
        },
      ),
    },
    battleRatingLog: {
      create: jest.fn(
        async ({ data }: { data: Partial<BattleRatingLogRecord> }) => {
          const duplicate = [...battleRatingLogs.values()].find(
            (record) =>
              record.battleRoomId === (data.battleRoomId ?? null) &&
              record.userId === data.userId &&
              record.reason === data.reason,
          );

          if (duplicate) {
            const error = Object.assign(new Error('Unique constraint failed'), {
              code: 'P2002',
            });
            throw error;
          }

          const record: BattleRatingLogRecord = {
            id: data.id ?? nextId(),
            userId: data.userId!,
            battleRoomId: data.battleRoomId ?? null,
            participantId: data.participantId ?? null,
            skillCode: data.skillCode ?? null,
            professionalTrackKey: data.professionalTrackKey ?? null,
            reason: data.reason!,
            ratingBefore: data.ratingBefore ?? 0,
            ratingDelta: data.ratingDelta ?? 0,
            ratingAfter: data.ratingAfter ?? 0,
            createdAt: data.createdAt ?? new Date(),
          };

          battleRatingLogs.set(record.id, record);
          return record;
        },
      ),
      findMany: jest.fn(
        async ({ where }: { where?: Record<string, unknown> }) => {
          return [...battleRatingLogs.values()].filter((record) =>
            matchesRatingLogWhere(record, where ?? {}),
          );
        },
      ),
      count: jest.fn(async ({ where }: { where?: Record<string, unknown> }) => {
        return [...battleRatingLogs.values()].filter((record) =>
          matchesRatingLogWhere(record, where ?? {}),
        ).length;
      }),
    },
    battleQuestionSnapshot: {
      createMany: jest.fn(
        async ({
          data,
        }: {
          data:
            | Partial<BattleQuestionSnapshotRecord>
            | Array<Partial<BattleQuestionSnapshotRecord>>;
        }) => {
          const items = Array.isArray(data) ? data : [data];

          for (const item of items) {
            const duplicate = [...battleQuestionSnapshots.values()].find(
              (snapshot) =>
                snapshot.battleRoomId === item.battleRoomId &&
                snapshot.orderIndex === item.orderIndex,
            );

            if (duplicate) {
              const error = Object.assign(
                new Error('Unique constraint failed'),
                {
                  code: 'P2002',
                },
              );
              throw error;
            }

            const record: BattleQuestionSnapshotRecord = {
              id: item.id ?? nextId(),
              battleRoomId: item.battleRoomId!,
              ownerParticipantId: item.ownerParticipantId ?? null,
              sourceQuizQuestionId: item.sourceQuizQuestionId ?? null,
              orderIndex: item.orderIndex ?? 0,
              participantOrderIndex: item.participantOrderIndex ?? null,
              questionType:
                item.questionType ?? BattleQuestionType.SINGLE_CHOICE,
              presentation:
                item.presentation ?? BattleQuestionPresentation.TEXT_CHOICE,
              difficulty: item.difficulty ?? null,
              stemSnapshot: item.stemSnapshot ?? [],
              optionsSnapshot: item.optionsSnapshot ?? [],
              correctAnswerSnapshot: item.correctAnswerSnapshot ?? {},
              explanationSnapshot: item.explanationSnapshot ?? null,
              acceptedAnswersSnapshot: item.acceptedAnswersSnapshot ?? null,
              answerNormalizationSnapshot:
                item.answerNormalizationSnapshot ?? null,
              knowledgeTagsSnapshot: item.knowledgeTagsSnapshot ?? null,
              programmingLanguage: item.programmingLanguage ?? null,
              skillCodeSnapshot: item.skillCodeSnapshot ?? null,
              courseIdSnapshot: item.courseIdSnapshot ?? null,
              chapterIdSnapshot: item.chapterIdSnapshot ?? null,
              createdAt: item.createdAt ?? new Date(),
            };

            battleQuestionSnapshots.set(record.id, record);
          }

          return { count: items.length };
        },
      ),
      findMany: jest.fn(
        async ({
          where,
          select,
        }: {
          where: Record<string, unknown>;
          orderBy?: { orderIndex?: 'asc' | 'desc' };
          select?: { sourceQuizQuestion?: unknown };
        }) => {
          const items = [...battleQuestionSnapshots.values()].filter(
            (snapshot) => matchesQuestionSnapshotWhere(snapshot, where),
          );

          const sortedItems = items.sort(
            (left, right) => left.orderIndex - right.orderIndex,
          );

          return sortedItems.map((snapshot) => ({
            ...snapshot,
            ...(select?.sourceQuizQuestion
              ? {
                  sourceQuizQuestion: snapshot.sourceQuizQuestionId
                    ? {
                        content:
                          quizQuestions.get(snapshot.sourceQuizQuestionId)
                            ?.content ?? '',
                      }
                    : null,
                }
              : {}),
          }));
        },
      ),
      findFirst: jest.fn(
        async ({ where }: { where: Record<string, unknown> }) => {
          return (
            [...battleQuestionSnapshots.values()].find((snapshot) =>
              matchesQuestionSnapshotWhere(snapshot, where),
            ) ?? null
          );
        },
      ),
    },
    battleAnswer: {
      findFirst: jest.fn(
        async ({ where }: { where: Record<string, unknown> }) => {
          return (
            [...battleAnswers.values()].find((answer) =>
              matchesBattleAnswerWhere(answer, where),
            ) ?? null
          );
        },
      ),
      findMany: jest.fn(
        async ({ where }: { where: Record<string, unknown> }) => {
          return [...battleAnswers.values()].filter((answer) =>
            matchesBattleAnswerWhere(answer, where),
          );
        },
      ),
      create: jest.fn(
        async ({ data }: { data: Partial<BattleAnswerRecord> }) => {
          const duplicateQuestion = [...battleAnswers.values()].find(
            (answer) =>
              answer.participantId === data.participantId &&
              answer.battleQuestionSnapshotId === data.battleQuestionSnapshotId,
          );
          const duplicateRequest = [...battleAnswers.values()].find(
            (answer) =>
              answer.participantId === data.participantId &&
              answer.clientRequestId === data.clientRequestId,
          );

          if (duplicateQuestion || duplicateRequest) {
            const error = Object.assign(new Error('Unique constraint failed'), {
              code: 'P2002',
            });
            throw error;
          }

          const record: BattleAnswerRecord = {
            id: data.id ?? nextId(),
            battleRoomId: data.battleRoomId!,
            participantId: data.participantId!,
            battleQuestionSnapshotId: data.battleQuestionSnapshotId!,
            userId: data.userId!,
            clientRequestId: data.clientRequestId!,
            answerVersion: data.answerVersion ?? 1,
            answerPayload: data.answerPayload ?? null,
            normalizedAnswer: data.normalizedAnswer ?? null,
            isCorrect: data.isCorrect ?? false,
            scoreDelta: data.scoreDelta ?? 0,
            submittedAt: data.submittedAt ?? new Date(),
            timeSpentMs: data.timeSpentMs ?? null,
            createdAt: data.createdAt ?? new Date(),
          };

          battleAnswers.set(record.id, record);
          return record;
        },
      ),
      updateMany: jest.fn(
        async ({
          where,
          data,
        }: {
          where: Record<string, unknown>;
          data: Partial<BattleAnswerRecord>;
        }) => {
          let count = 0;

          for (const [id, answer] of battleAnswers.entries()) {
            if (!matchesBattleAnswerWhere(answer, where)) {
              continue;
            }

            battleAnswers.set(id, {
              ...answer,
              ...data,
            });
            count += 1;
          }

          return { count };
        },
      ),
      count: jest.fn(async ({ where }: { where: Record<string, unknown> }) => {
        return [...battleAnswers.values()].filter((answer) =>
          matchesBattleAnswerWhere(answer, where),
        ).length;
      }),
    },
    quizQuestion: {
      findMany: jest.fn(
        async ({ where }: { where: Record<string, unknown> }) => {
          return [...quizQuestions.values()].filter((question) =>
            matchesQuizQuestionWhere(question, where),
          );
        },
      ),
    },
  };

  const prisma = {
    ...tx,
    $queryRaw: jest.fn(async () => {
      throw new Error('Battle lock query escaped its transaction client');
    }),
    $transaction: jest.fn(async (callback: (client: typeof tx) => unknown) => {
      const snapshot = {
        users: structuredClone([...users.entries()]),
        battleProfiles: structuredClone([...battleProfiles.entries()]),
        battleSkills: structuredClone([...battleSkills.entries()]),
        userBattleSkillRatings: structuredClone([
          ...userBattleSkillRatings.entries(),
        ]),
        userBattleTrackRatings: structuredClone([
          ...userBattleTrackRatings.entries(),
        ]),
        battleQueues: structuredClone([...battleQueues.entries()]),
        battleRooms: structuredClone([...battleRooms.entries()]),
        battleAiOpponents: structuredClone([...battleAiOpponents.entries()]),
        battleParticipants: structuredClone([...battleParticipants.entries()]),
        battleInvitations: structuredClone([...battleInvitations.entries()]),
        battleRatingLogs: structuredClone([...battleRatingLogs.entries()]),
        battleQuestionSnapshots: structuredClone([
          ...battleQuestionSnapshots.entries(),
        ]),
        battleAnswers: structuredClone([...battleAnswers.entries()]),
        quizQuestions: structuredClone([...quizQuestions.entries()]),
      };

      try {
        return await callback(tx);
      } catch (error) {
        restoreMap(users, snapshot.users);
        restoreMap(battleProfiles, snapshot.battleProfiles);
        restoreMap(battleSkills, snapshot.battleSkills);
        restoreMap(userBattleSkillRatings, snapshot.userBattleSkillRatings);
        restoreMap(userBattleTrackRatings, snapshot.userBattleTrackRatings);
        restoreMap(battleQueues, snapshot.battleQueues);
        restoreMap(battleRooms, snapshot.battleRooms);
        restoreMap(battleAiOpponents, snapshot.battleAiOpponents);
        restoreMap(battleParticipants, snapshot.battleParticipants);
        restoreMap(battleInvitations, snapshot.battleInvitations);
        restoreMap(battleRatingLogs, snapshot.battleRatingLogs);
        restoreMap(battleQuestionSnapshots, snapshot.battleQuestionSnapshots);
        restoreMap(battleAnswers, snapshot.battleAnswers);
        restoreMap(quizQuestions, snapshot.quizQuestions);
        throw error;
      }
    }),
  };

  return {
    prisma,
    tx,
    users,
    battleProfiles,
    battleSkills,
    userBattleSkillRatings,
    userBattleTrackRatings,
    battleQueues,
    battleRooms,
    battleAiOpponents,
    battleParticipants,
    battleInvitations,
    battleRatingLogs,
    battleQuestionSnapshots,
    battleAnswers,
    quizQuestions,
  };
}

function matchesQueueWhere(
  record: BattleQueueRecord,
  where: Record<string, unknown>,
) {
  if (where.userId !== undefined) {
    if (typeof where.userId === 'string' && record.userId !== where.userId) {
      return false;
    }

    if (
      typeof where.userId === 'object' &&
      where.userId !== null &&
      'in' in where.userId
    ) {
      const values = (where.userId as { in?: string[] }).in ?? [];

      if (!values.includes(record.userId)) {
        return false;
      }
    }

    if (
      typeof where.userId === 'object' &&
      where.userId !== null &&
      'not' in where.userId
    ) {
      const value = (where.userId as { not?: string }).not;

      if (value === record.userId) {
        return false;
      }
    }
  }

  if (where.status !== undefined && record.status !== where.status) {
    return false;
  }

  if (where.skillCode !== undefined && record.skillCode !== where.skillCode) {
    return false;
  }

  if (where.professionalTrackKey !== undefined) {
    if (
      typeof where.professionalTrackKey === 'object' &&
      where.professionalTrackKey !== null &&
      'not' in where.professionalTrackKey
    ) {
      const value = (where.professionalTrackKey as { not?: string | null }).not;
      if (value === null && record.professionalTrackKey === null) {
        return false;
      }
    } else if (record.professionalTrackKey !== where.professionalTrackKey) {
      return false;
    }
  }

  if (where.expiresAt !== undefined && where.expiresAt !== null) {
    const expiresAt = where.expiresAt as { gt?: Date };

    if (
      expiresAt.gt &&
      (!record.expiresAt || !(record.expiresAt > expiresAt.gt))
    ) {
      return false;
    }
  }

  if (where.updatedAt !== undefined && where.updatedAt !== null) {
    const updatedAt = where.updatedAt as { gt?: Date };
    const recordUpdatedAt = record.updatedAt ?? new Date();

    if (updatedAt.gt && !(recordUpdatedAt > updatedAt.gt)) {
      return false;
    }
  }

  return true;
}

function matchesRoomWhere(
  room: BattleRoomRecord,
  where: Record<string, unknown>,
  battleParticipants: Map<string, BattleParticipantRecord>,
) {
  if (where.id !== undefined && room.id !== where.id) {
    return false;
  }

  if (where.startedAt === null && room.startedAt !== null) {
    return false;
  }

  if (where.startedAt && typeof where.startedAt === 'object') {
    const startedAt = where.startedAt as { lte?: Date };

    if (startedAt.lte && (!room.startedAt || room.startedAt > startedAt.lte)) {
      return false;
    }
  }

  if (where.status !== undefined) {
    if (typeof where.status === 'string' && room.status !== where.status) {
      return false;
    }

    if (
      typeof where.status === 'object' &&
      where.status !== null &&
      'in' in where.status
    ) {
      const values = (where.status as { in?: BattleRoomStatus[] }).in ?? [];

      if (!values.includes(room.status)) {
        return false;
      }
    }
  }

  if (where.mode !== undefined) {
    if (typeof where.mode === 'string' && room.mode !== where.mode) {
      return false;
    }

    if (
      typeof where.mode === 'object' &&
      where.mode !== null &&
      'in' in where.mode
    ) {
      const values = (where.mode as { in?: string[] }).in ?? [];

      if (!values.includes(room.mode)) {
        return false;
      }
    }
  }

  if (where.expiresAt && typeof where.expiresAt === 'object') {
    const expiresAt = where.expiresAt as { lte?: Date; gt?: Date };

    if (expiresAt.lte && (!room.expiresAt || room.expiresAt > expiresAt.lte)) {
      return false;
    }

    if (expiresAt.gt && (!room.expiresAt || room.expiresAt <= expiresAt.gt)) {
      return false;
    }
  }

  if (where.participants && typeof where.participants === 'object') {
    const participantsWhere = where.participants as {
      some?: { userId?: string };
    };

    if (participantsWhere.some?.userId) {
      const hasParticipant = [...battleParticipants.values()].some(
        (participant) =>
          participant.battleRoomId === room.id &&
          participant.userId === participantsWhere.some?.userId,
      );

      if (!hasParticipant) {
        return false;
      }
    }
  }

  if (where.updatedAt && typeof where.updatedAt === 'object') {
    const updatedAt = where.updatedAt as { lte?: Date };
    const roomUpdatedAt = room.updatedAt ?? room.createdAt;

    if (updatedAt.lte && !(roomUpdatedAt <= updatedAt.lte)) {
      return false;
    }
  }

  return true;
}

function matchesParticipantWhere(
  participant: BattleParticipantRecord,
  where: Record<string, unknown>,
  battleRooms: Map<string, BattleRoomRecord>,
) {
  if (where.id !== undefined && participant.id !== where.id) {
    return false;
  }

  if (
    where.battleRoomId !== undefined &&
    participant.battleRoomId !== where.battleRoomId
  ) {
    return false;
  }

  if (where.userId !== undefined && participant.userId !== where.userId) {
    return false;
  }

  if (where.status !== undefined) {
    if (
      typeof where.status === 'string' &&
      participant.status !== where.status
    ) {
      return false;
    }

    if (
      typeof where.status === 'object' &&
      where.status !== null &&
      'in' in where.status
    ) {
      const values =
        (where.status as { in?: BattleParticipantStatus[] }).in ?? [];

      if (!values.includes(participant.status)) {
        return false;
      }
    }
  }

  if (where.result !== undefined) {
    if (
      typeof where.result === 'string' &&
      participant.result !== where.result
    ) {
      return false;
    }

    if (
      typeof where.result === 'object' &&
      where.result !== null &&
      'in' in where.result
    ) {
      const values = (where.result as { in?: BattleResult[] }).in ?? [];

      if (!values.includes(participant.result)) {
        return false;
      }
    }
  }

  if (where.battleRoom && typeof where.battleRoom === 'object') {
    const roomWhere = where.battleRoom as {
      status?: BattleRoomStatus | { in?: BattleRoomStatus[] };
      mode?: string | { in?: string[] };
      expiresAt?: { lte?: Date; gt?: Date };
      startedAt?: null;
    };
    const room = battleRooms.get(participant.battleRoomId);

    if (!room) {
      return false;
    }

    if (roomWhere.status !== undefined) {
      if (
        typeof roomWhere.status === 'string' &&
        room.status !== roomWhere.status
      ) {
        return false;
      }

      if (
        typeof roomWhere.status === 'object' &&
        roomWhere.status !== null &&
        'in' in roomWhere.status
      ) {
        const values =
          (roomWhere.status as { in?: BattleRoomStatus[] }).in ?? [];

        if (!values.includes(room.status)) {
          return false;
        }
      }
    }

    if (roomWhere.expiresAt !== undefined) {
      const expiresAt = roomWhere.expiresAt as { lte?: Date; gt?: Date };

      if (
        expiresAt.lte &&
        (!room.expiresAt || room.expiresAt > expiresAt.lte)
      ) {
        return false;
      }

      if (expiresAt.gt && (!room.expiresAt || room.expiresAt <= expiresAt.gt)) {
        return false;
      }
    }

    if (roomWhere.startedAt === null && room.startedAt !== null) {
      return false;
    }

    if (roomWhere.mode !== undefined) {
      if (typeof roomWhere.mode === 'string' && room.mode !== roomWhere.mode) {
        return false;
      }

      if (
        typeof roomWhere.mode === 'object' &&
        roomWhere.mode !== null &&
        'in' in roomWhere.mode
      ) {
        const values = (roomWhere.mode as { in?: string[] }).in ?? [];

        if (!values.includes(room.mode)) {
          return false;
        }
      }
    }
  }

  return true;
}

function matchesInvitationWhere(
  record: BattleInvitationRecord,
  where: Record<string, unknown>,
) {
  if (where.id !== undefined && record.id !== where.id) {
    return false;
  }

  if (where.status !== undefined) {
    if (typeof where.status === 'string' && record.status !== where.status) {
      return false;
    }

    if (
      typeof where.status === 'object' &&
      where.status !== null &&
      'in' in where.status
    ) {
      const values =
        (where.status as { in?: BattleInvitationStatus[] }).in ?? [];

      if (!values.includes(record.status)) {
        return false;
      }
    }
  }

  if (
    where.inviteCode !== undefined &&
    typeof where.inviteCode === 'string' &&
    record.inviteCode !== where.inviteCode
  ) {
    return false;
  }

  return true;
}

function matchesQuestionSnapshotWhere(
  record: BattleQuestionSnapshotRecord,
  where: Record<string, unknown>,
) {
  if (where.id !== undefined && record.id !== where.id) {
    return false;
  }

  if (
    where.battleRoomId !== undefined &&
    typeof where.battleRoomId === 'string' &&
    record.battleRoomId !== where.battleRoomId
  ) {
    return false;
  }

  if (
    where.battleRoomId &&
    typeof where.battleRoomId === 'object' &&
    'in' in where.battleRoomId
  ) {
    const values = (where.battleRoomId as { in?: string[] }).in ?? [];

    if (!values.includes(record.battleRoomId)) {
      return false;
    }
  }

  if (where.ownerParticipantId !== undefined) {
    if (
      typeof where.ownerParticipantId === 'object' &&
      where.ownerParticipantId !== null &&
      'not' in where.ownerParticipantId
    ) {
      const value = (where.ownerParticipantId as { not?: string | null }).not;
      if (value === null && (record.ownerParticipantId === null || record.ownerParticipantId === undefined)) {
        return false;
      }
    }
    if (
      where.ownerParticipantId === null &&
      record.ownerParticipantId !== null
    ) {
      return false;
    }
    if (
      typeof where.ownerParticipantId === 'string' &&
      record.ownerParticipantId !== where.ownerParticipantId
    ) {
      return false;
    }
  }

  return true;
}

function matchesBattleAnswerWhere(
  record: BattleAnswerRecord,
  where: Record<string, unknown>,
) {
  if (where.isCorrect !== undefined && record.isCorrect !== where.isCorrect) {
    return false;
  }

  if (
    where.participantId &&
    typeof where.participantId === 'object' &&
    'in' in where.participantId
  ) {
    const values = (where.participantId as { in?: string[] }).in ?? [];

    if (!values.includes(record.participantId)) {
      return false;
    }
  }

  if (
    where.participantId !== undefined &&
    typeof where.participantId === 'string' &&
    record.participantId !== where.participantId
  ) {
    return false;
  }

  if (where.userId !== undefined && record.userId !== where.userId) {
    return false;
  }

  if (
    where.clientRequestId !== undefined &&
    record.clientRequestId !== where.clientRequestId
  ) {
    return false;
  }

  if (
    where.answerVersion !== undefined &&
    record.answerVersion !== where.answerVersion
  ) {
    return false;
  }

  if (
    where.battleQuestionSnapshotId !== undefined &&
    record.battleQuestionSnapshotId !== where.battleQuestionSnapshotId
  ) {
    return false;
  }

  if (
    where.battleRoomId !== undefined &&
    typeof where.battleRoomId === 'string' &&
    record.battleRoomId !== where.battleRoomId
  ) {
    return false;
  }

  if (
    where.battleRoomId &&
    typeof where.battleRoomId === 'object' &&
    'in' in where.battleRoomId
  ) {
    const values = (where.battleRoomId as { in?: string[] }).in ?? [];

    if (!values.includes(record.battleRoomId)) {
      return false;
    }
  }

  return true;
}

function matchesRatingLogWhere(
  record: BattleRatingLogRecord,
  where: Record<string, unknown>,
) {
  if (where.userId !== undefined && record.userId !== where.userId) {
    return false;
  }

  if (
    where.battleRoomId !== undefined &&
    record.battleRoomId !== where.battleRoomId
  ) {
    return false;
  }

  if (where.reason !== undefined && record.reason !== where.reason) {
    return false;
  }

  if (
    where.professionalTrackKey !== undefined &&
    record.professionalTrackKey !== where.professionalTrackKey
  ) {
    return false;
  }

  return true;
}

function matchesQuizQuestionWhere(
  record: QuizQuestionRecord,
  where: Record<string, unknown>,
) {
  if (where.isBattleEnabled !== undefined) {
    if (record.isBattleEnabled !== where.isBattleEnabled) {
      return false;
    }
  }

  if (
    where.battleSkillCode !== undefined &&
    record.battleSkillCode !== where.battleSkillCode
  ) {
    return false;
  }

  if (
    where.battleDifficulty &&
    typeof where.battleDifficulty === 'object' &&
    where.battleDifficulty !== null
  ) {
    const values =
      (where.battleDifficulty as { in?: BattleQuestionDifficulty[] }).in ?? [];

    if (
      values.length > 0 &&
      (!record.battleDifficulty || !values.includes(record.battleDifficulty))
    ) {
      return false;
    }
  }

  if (where.type && typeof where.type === 'object' && where.type !== null) {
    const values = (where.type as { in?: QuestionType[] }).in ?? [];

    if (values.length > 0 && !values.includes(record.type)) {
      return false;
    }
  }

  if (where.quiz && typeof where.quiz === 'object' && where.quiz !== null) {
    const quizWhere = where.quiz as {
      status?: QuizStatus;
      chapter?: {
        status?: ChapterStatus;
        course?: {
          status?: CourseStatus;
          deletedAt?: null;
        };
      };
    };

    if (quizWhere.status && record.quiz.status !== quizWhere.status) {
      return false;
    }

    if (
      quizWhere.chapter?.status &&
      record.quiz.chapter.status !== quizWhere.chapter.status
    ) {
      return false;
    }

    if (
      quizWhere.chapter?.course?.status &&
      record.quiz.chapter.course.status !== quizWhere.chapter.course.status
    ) {
      return false;
    }

    if (
      quizWhere.chapter?.course?.deletedAt === null &&
      record.quiz.chapter.course.deletedAt != null
    ) {
      return false;
    }

  }

  return true;
}

function applyParticipantUpdate(
  existing: BattleParticipantRecord,
  data: Record<string, unknown>,
) {
  const updated = {
    ...existing,
  };

  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) {
      continue;
    }

    if (
      typeof value === 'object' &&
      value !== null &&
      'increment' in value &&
      typeof (value as { increment?: unknown }).increment === 'number'
    ) {
      const current =
        typeof updated[key as keyof BattleParticipantRecord] === 'number'
          ? (updated[key as keyof BattleParticipantRecord] as number)
          : 0;

      (updated as Record<string, unknown>)[key] =
        current + ((value as { increment: number }).increment ?? 0);
      continue;
    }

    (updated as Record<string, unknown>)[key] = value;
  }

  updated.updatedAt = (data.updatedAt as Date | undefined) ?? new Date();

  return updated;
}

function applyScalarUpdate<T extends Record<string, unknown>>(
  existing: T,
  data: Record<string, unknown>,
) {
  const updated = {
    ...existing,
  };

  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) {
      continue;
    }

    if (
      typeof value === 'object' &&
      value !== null &&
      'increment' in value &&
      typeof (value as { increment?: unknown }).increment === 'number'
    ) {
      const current =
        typeof updated[key as keyof T] === 'number'
          ? (updated[key as keyof T] as number)
          : 0;

      (updated as Record<string, unknown>)[key] =
        current + ((value as { increment: number }).increment ?? 0);
      continue;
    }

    (updated as Record<string, unknown>)[key] = value;
  }

  return updated;
}

function restoreMap<T>(target: Map<string, T>, entries: Array<[string, T]>) {
  target.clear();

  for (const [key, value] of entries) {
    target.set(key, value);
  }
}
