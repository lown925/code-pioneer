/* eslint-disable @typescript-eslint/require-await */
import {
  BattleInvitationStatus,
  BattleMode,
  BattleParticipantStatus,
  BattleQuestionDifficulty,
  BattleQuestionPresentation,
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
};

type BattleQueueRecord = {
  id: string;
  userId: string;
  status: 'SEARCHING' | 'MATCHED' | 'CANCELLED' | 'EXPIRED';
  ratingSnapshot: number;
  matchedBattleRoomId: string | null;
  searchStartedAt: Date | null;
  matchedAt: Date | null;
  cancelledAt: Date | null;
  expiresAt: Date | null;
};

type BattleRoomRecord = {
  id: string;
  mode: BattleMode;
  status: BattleRoomStatus;
  questionCount: number;
  durationSeconds: number;
  correctScore: number;
  wrongScore: number;
  unansweredScore: number;
  createdByUserId: string | null;
  expiresAt: Date | null;
  startedAt: Date | null;
  settledAt: Date | null;
  completedAt: Date | null;
  cancelledAt: Date | null;
  endReason: string | null;
  createdAt: Date;
};

type BattleParticipantRecord = {
  id: string;
  battleRoomId: string;
  userId: string;
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
};

type BattleInvitationRecord = {
  id: string;
  battleRoomId: string;
  inviterUserId: string;
  inviteeUserId: string | null;
  token: string;
  status: BattleInvitationStatus;
  expiresAt: Date;
  acceptedAt: Date | null;
  cancelledAt: Date | null;
};

type BattleQuestionSnapshotRecord = {
  id: string;
  battleRoomId: string;
  sourceQuizQuestionId: string | null;
  orderIndex: number;
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
  answerPayload: unknown;
  normalizedAnswer: string | null;
  isCorrect: boolean;
  scoreDelta: number;
  submittedAt: Date;
  timeSpentMs: number | null;
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
  } satisfies BattleParticipantRecord;
}

function toRoomView(
  rooms: Map<string, BattleRoomRecord>,
  participants: Map<string, BattleParticipantRecord>,
  users: Map<string, UserRecord>,
  questionSnapshots: Map<string, BattleQuestionSnapshotRecord>,
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
      seat: participant.seat,
      status: participant.status,
      score: participant.score ?? 0,
      correctCount: participant.correctCount ?? 0,
      wrongCount: participant.wrongCount ?? 0,
      unansweredCount: participant.unansweredCount ?? 0,
      readyAt: participant.readyAt ?? null,
      submittedAt: participant.submittedAt ?? null,
      user: {
        id: participant.userId,
        nickname: users.get(participant.userId)?.nickname ?? null,
        avatarUrl: users.get(participant.userId)?.avatarUrl ?? null,
      },
    }));

  const snapshots = [...questionSnapshots.values()]
    .filter((snapshot) => snapshot.battleRoomId === roomId)
    .sort((left, right) => left.orderIndex - right.orderIndex);

  return {
    ...room,
    participants: roomParticipants,
    questionSnapshots: snapshots,
  };
}

export function createBattlePrismaMock() {
  const users = new Map<string, UserRecord>();
  const battleProfiles = new Map<string, BattleProfileRecord>();
  const battleQueues = new Map<string, BattleQueueRecord>();
  const battleRooms = new Map<string, BattleRoomRecord>();
  const battleParticipants = new Map<string, BattleParticipantRecord>();
  const battleInvitations = new Map<string, BattleInvitationRecord>();
  const battleQuestionSnapshots = new Map<
    string,
    BattleQuestionSnapshotRecord
  >();
  const battleAnswers = new Map<string, BattleAnswerRecord>();
  const quizQuestions = new Map<string, QuizQuestionRecord>();

  const tx = {
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
          };

          battleProfiles.set(record.userId, record);
          return record;
        },
      ),
      findUnique: jest.fn(async ({ where }: { where: { userId: string } }) => {
        return battleProfiles.get(where.userId) ?? null;
      }),
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
            status: (data.status as BattleQueueRecord['status']) ?? 'CANCELLED',
            ratingSnapshot: data.ratingSnapshot ?? 1000,
            matchedBattleRoomId: data.matchedBattleRoomId ?? null,
            searchStartedAt: data.searchStartedAt ?? null,
            matchedAt: data.matchedAt ?? null,
            cancelledAt: data.cancelledAt ?? null,
            expiresAt: data.expiresAt ?? null,
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
    },
    battleRoom: {
      create: jest.fn(async ({ data }: { data: Partial<BattleRoomRecord> }) => {
        const record: BattleRoomRecord = {
          id: data.id ?? nextId(),
          mode: data.mode ?? BattleMode.RANKED,
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
          createdAt: data.createdAt ?? new Date(),
        };
        battleRooms.set(record.id, record);
        return record;
      }),
      findUnique: jest.fn(async ({ where }: { where: { id: string } }) => {
        return toRoomView(
          battleRooms,
          battleParticipants,
          users,
          battleQuestionSnapshots,
          where.id,
        );
      }),
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
              battleParticipants,
              users,
              battleQuestionSnapshots,
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
            if (!matchesRoomWhere(room, where)) {
              continue;
            }

            battleRooms.set(id, {
              ...room,
              ...data,
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
              battleRoom: {
                id: room.id,
                mode: room.mode,
                status: room.status,
                questionCount: room.questionCount,
                durationSeconds: room.durationSeconds,
                correctScore: room.correctScore,
                wrongScore: room.wrongScore,
                startedAt: room.startedAt,
                expiresAt: room.expiresAt,
                completedAt: room.completedAt,
                cancelledAt: room.cancelledAt,
                endReason: room.endReason,
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
              matchesParticipantWhere(participant, where),
            )
            .map((participant) => ({
              ...participant,
              score: participant.score ?? 0,
              correctCount: participant.correctCount ?? 0,
              wrongCount: participant.wrongCount ?? 0,
              unansweredCount: participant.unansweredCount ?? 0,
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
            if (!matchesParticipantWhere(participant, where)) {
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
    battleInvitation: {
      create: jest.fn(
        async ({ data }: { data: Partial<BattleInvitationRecord> }) => {
          const tokenExists = [...battleInvitations.values()].some(
            (invitation) => invitation.token === data.token,
          );

          if (tokenExists) {
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
            status: data.status ?? BattleInvitationStatus.ACTIVE,
            expiresAt: data.expiresAt!,
            acceptedAt: data.acceptedAt ?? null,
            cancelledAt: data.cancelledAt ?? null,
          };

          battleInvitations.set(record.id, record);
          return record;
        },
      ),
      findUnique: jest.fn(async ({ where }: { where: { token: string } }) => {
        const invitation = [...battleInvitations.values()].find(
          (item) => item.token === where.token,
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
            battleParticipants,
            users,
            battleQuestionSnapshots,
            invitation.battleRoomId,
          ),
        };
      }),
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
              sourceQuizQuestionId: item.sourceQuizQuestionId ?? null,
              orderIndex: item.orderIndex ?? 0,
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
        }: {
          where: Record<string, unknown>;
          orderBy?: { orderIndex?: 'asc' | 'desc' };
        }) => {
          const items = [...battleQuestionSnapshots.values()].filter(
            (snapshot) => matchesQuestionSnapshotWhere(snapshot, where),
          );

          return items.sort(
            (left, right) => left.orderIndex - right.orderIndex,
          );
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
    $transaction: jest.fn(async (callback: (client: typeof tx) => unknown) => {
      const snapshot = {
        users: structuredClone([...users.entries()]),
        battleProfiles: structuredClone([...battleProfiles.entries()]),
        battleQueues: structuredClone([...battleQueues.entries()]),
        battleRooms: structuredClone([...battleRooms.entries()]),
        battleParticipants: structuredClone([...battleParticipants.entries()]),
        battleInvitations: structuredClone([...battleInvitations.entries()]),
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
        restoreMap(battleQueues, snapshot.battleQueues);
        restoreMap(battleRooms, snapshot.battleRooms);
        restoreMap(battleParticipants, snapshot.battleParticipants);
        restoreMap(battleInvitations, snapshot.battleInvitations);
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
    battleQueues,
    battleRooms,
    battleParticipants,
    battleInvitations,
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

  if (where.expiresAt !== undefined && where.expiresAt !== null) {
    const expiresAt = where.expiresAt as { gt?: Date };

    if (
      expiresAt.gt &&
      (!record.expiresAt || !(record.expiresAt > expiresAt.gt))
    ) {
      return false;
    }
  }

  return true;
}

function matchesRoomWhere(
  room: BattleRoomRecord,
  where: Record<string, unknown>,
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

  return true;
}

function matchesParticipantWhere(
  participant: BattleParticipantRecord,
  where: Record<string, unknown>,
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

  return true;
}

function matchesInvitationWhere(
  record: BattleInvitationRecord,
  where: Record<string, unknown>,
) {
  if (where.id !== undefined && record.id !== where.id) {
    return false;
  }

  if (where.status !== undefined && record.status !== where.status) {
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
    record.battleRoomId !== where.battleRoomId
  ) {
    return false;
  }

  return true;
}

function matchesBattleAnswerWhere(
  record: BattleAnswerRecord,
  where: Record<string, unknown>,
) {
  if (
    where.participantId !== undefined &&
    record.participantId !== where.participantId
  ) {
    return false;
  }

  if (
    where.clientRequestId !== undefined &&
    record.clientRequestId !== where.clientRequestId
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
    record.battleRoomId !== where.battleRoomId
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

  return updated;
}

function restoreMap<T>(target: Map<string, T>, entries: Array<[string, T]>) {
  target.clear();

  for (const [key, value] of entries) {
    target.set(key, value);
  }
}
