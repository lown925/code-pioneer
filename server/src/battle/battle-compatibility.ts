import type { BattleParticipant, BattleQuestionSnapshot, BattleRoom } from '../../generated/prisma/client';

export type ParticipantTrackSource = Pick<BattleParticipant, 'professionalTrackKey'>;
export type RoomTrackSource = Pick<BattleRoom, 'professionalTrackKey'>;

export function resolveParticipantTrack(
  participant: ParticipantTrackSource,
  room: RoomTrackSource,
  historicalTrackKey?: string | null,
) {
  return (
    participant.professionalTrackKey ??
    room.professionalTrackKey ??
    historicalTrackKey ??
    null
  );
}

export type QuestionSnapshotOwnerSource = Pick<
  BattleQuestionSnapshot,
  'id' | 'ownerParticipantId' | 'participantOrderIndex' | 'orderIndex' | 'battleRoomId'
>;

type QuestionSnapshotDelegate = {
  findMany<TSnapshot extends QuestionSnapshotOwnerSource>(args: {
    where: {
      battleRoomId: string;
      ownerParticipantId: string | null | { not: null };
    };
    orderBy:
      | { participantOrderIndex: 'asc' }
      | { orderIndex: 'asc' };
  }): Promise<TSnapshot[]>;
};

export type ResolveParticipantQuestionSnapshotsInput = {
  roomId: string;
  participantId: string;
};

export async function resolveParticipantQuestionSnapshots<
  TSnapshot extends QuestionSnapshotOwnerSource,
>(
  snapshotDelegate: QuestionSnapshotDelegate,
  input: ResolveParticipantQuestionSnapshotsInput,
) {
  const owned = await snapshotDelegate.findMany<TSnapshot>({
    where: {
      battleRoomId: input.roomId,
      ownerParticipantId: { not: null },
    },
    orderBy: {
      participantOrderIndex: 'asc',
    },
  });

  const participantOwned = owned.filter(
    (snapshot) => snapshot.ownerParticipantId === input.participantId,
  );
  if (owned.length > 0) {
    const legacy = await snapshotDelegate.findMany<TSnapshot>({
      where: {
        battleRoomId: input.roomId,
        ownerParticipantId: null,
      },
      orderBy: {
        orderIndex: 'asc',
      },
    });
    if (legacy.length > 0) {
      throw new Error('BATTLE_QUESTION_SET_INVALID');
    }
    return participantOwned;
  }

  return snapshotDelegate.findMany<TSnapshot>({
    where: {
      battleRoomId: input.roomId,
      ownerParticipantId: null,
    },
    orderBy: {
      orderIndex: 'asc',
    },
  });
}

export function resolveParticipantQuestionOrder(
  snapshot: Pick<BattleQuestionSnapshot, 'participantOrderIndex' | 'orderIndex'>,
) {
  return snapshot.participantOrderIndex ?? snapshot.orderIndex;
}

export function selectParticipantQuestionSnapshots<
  TSnapshot extends QuestionSnapshotOwnerSource,
>(
  snapshots: TSnapshot[],
  participantId: string,
  questionCount?: number,
) {
  const owned = snapshots.filter(
    (snapshot) =>
      snapshot.ownerParticipantId !== null &&
      snapshot.ownerParticipantId !== undefined,
  );
  const legacy = snapshots.filter(
    (snapshot) =>
      snapshot.ownerParticipantId === null ||
      snapshot.ownerParticipantId === undefined,
  );
  if (owned.length > 0 && legacy.length > 0) {
    throw new Error('BATTLE_QUESTION_SET_INVALID');
  }

  const effective = owned.length > 0
    ? owned
        .filter((snapshot) => snapshot.ownerParticipantId === participantId)
        .sort(
          (left, right) =>
            (left.participantOrderIndex ?? Number.MAX_SAFE_INTEGER) -
            (right.participantOrderIndex ?? Number.MAX_SAFE_INTEGER),
        )
    : legacy.sort((left, right) => left.orderIndex - right.orderIndex);

  if (questionCount !== undefined) {
    if (effective.length !== questionCount) {
      throw new Error('BATTLE_QUESTION_SET_INVALID');
    }
    if (owned.length > 0) {
      const indexes = effective.map((snapshot) => snapshot.participantOrderIndex);
      if (
        indexes.some((value, index) => value !== index) ||
        new Set(indexes).size !== indexes.length
      ) {
        throw new Error('BATTLE_QUESTION_SET_INVALID');
      }
    }
  }

  return effective;
}
