import {
  resolveParticipantQuestionOrder,
  resolveParticipantQuestionSnapshots,
  resolveParticipantTrack,
  selectParticipantQuestionSnapshots,
} from './battle-compatibility';

describe('Battle per-player compatibility resolver', () => {
  it('prefers a participant professional track', () => {
    expect(
      resolveParticipantTrack(
        { professionalTrackKey: 'computer-science' },
        { professionalTrackKey: 'big-data' },
      ),
    ).toBe('computer-science');
  });

  it('falls back to the legacy room professional track', () => {
    expect(
      resolveParticipantTrack(
        { professionalTrackKey: null },
        { professionalTrackKey: 'big-data' },
      ),
    ).toBe('big-data');
  });

  it('uses a supplied battle-specific historical track as a final fallback', () => {
    expect(
      resolveParticipantTrack(
        { professionalTrackKey: null },
        { professionalTrackKey: null },
        'software-engineering',
      ),
    ).toBe('software-engineering');
  });

  it('returns null when no reliable track source exists', () => {
    expect(
      resolveParticipantTrack(
        { professionalTrackKey: null },
        { professionalTrackKey: null },
      ),
    ).toBeNull();
  });

  it('uses only owned snapshots when an owned set exists', async () => {
    const snapshots = [
      { battleRoomId: 'room', ownerParticipantId: null, participantOrderIndex: null, orderIndex: 0 },
      { battleRoomId: 'room', ownerParticipantId: 'opponent', participantOrderIndex: 0, orderIndex: 2 },
      { battleRoomId: 'room', ownerParticipantId: 'current', participantOrderIndex: 1, orderIndex: 1 },
      { battleRoomId: 'room', ownerParticipantId: 'current', participantOrderIndex: 0, orderIndex: 0 },
    ];

    const findMany = jest
      .fn()
      .mockResolvedValueOnce([snapshots[1], snapshots[3], snapshots[2]])
      .mockResolvedValueOnce([]);

    await expect(
      resolveParticipantQuestionSnapshots({ findMany }, {
        roomId: 'room',
        participantId: 'current',
      }),
    ).resolves.toEqual([snapshots[3], snapshots[2]]);
    expect(findMany).toHaveBeenCalledTimes(2);
    expect(findMany).toHaveBeenCalledWith({
      where: { battleRoomId: 'room', ownerParticipantId: { not: null } },
      orderBy: { participantOrderIndex: 'asc' },
    });
  });

  it('falls back to legacy shared snapshots when no owned set exists', async () => {
    const snapshots = [
      { battleRoomId: 'room', ownerParticipantId: 'opponent', participantOrderIndex: 0, orderIndex: 1 },
      { battleRoomId: 'room', ownerParticipantId: null, participantOrderIndex: null, orderIndex: 1 },
      { battleRoomId: 'room', ownerParticipantId: null, participantOrderIndex: null, orderIndex: 0 },
    ];

    const findMany = jest
      .fn()
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([snapshots[2], snapshots[1]]);

    await expect(
      resolveParticipantQuestionSnapshots({ findMany }, {
        roomId: 'room',
        participantId: 'current',
      }),
    ).resolves.toEqual([snapshots[2], snapshots[1]]);
    expect(findMany).toHaveBeenNthCalledWith(2, {
      where: { battleRoomId: 'room', ownerParticipantId: null },
      orderBy: { orderIndex: 'asc' },
    });
  });

  it('rejects a room that mixes owned and legacy snapshots', () => {
    expect(() =>
      selectParticipantQuestionSnapshots([
        { id: 'owned', battleRoomId: 'room', ownerParticipantId: 'current', participantOrderIndex: 0, orderIndex: 0 },
        { id: 'legacy', battleRoomId: 'room', ownerParticipantId: null, participantOrderIndex: null, orderIndex: 1 },
      ], 'current'),
    ).toThrow('BATTLE_QUESTION_SET_INVALID');
  });

  it('uses participant-local ordering for owned snapshots', () => {
    expect(resolveParticipantQuestionOrder({ participantOrderIndex: 0, orderIndex: 20 })).toBe(0);
    expect(resolveParticipantQuestionOrder({ participantOrderIndex: 1, orderIndex: 21 })).toBe(1);
  });

  it('uses legacy room ordering for shared snapshots', () => {
    expect(resolveParticipantQuestionOrder({ participantOrderIndex: null, orderIndex: 4 })).toBe(4);
  });

  it('allows both participants to start at local order zero with distinct room order', () => {
    const snapshots = [
      { battleRoomId: 'room', ownerParticipantId: 'a', participantOrderIndex: 0, orderIndex: 0 },
      { battleRoomId: 'room', ownerParticipantId: 'b', participantOrderIndex: 0, orderIndex: 20 },
    ];

    expect(snapshots.map((snapshot) => snapshot.participantOrderIndex)).toEqual([0, 0]);
    expect(new Set(snapshots.map((snapshot) => snapshot.orderIndex)).size).toBe(2);
  });
});
