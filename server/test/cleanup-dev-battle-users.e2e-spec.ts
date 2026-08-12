import {
  DEV_BATTLE_OPEN_IDS,
  loadScope,
} from '../scripts/cleanup-dev-battle-users';

function createScopePrisma(options?: {
  mixedParticipant?: boolean;
  mixedQueue?: boolean;
  mixedCommunity?: boolean;
  mixedInviter?: boolean;
}) {
  const users = [
    { id: 'dev-user-a', openId: DEV_BATTLE_OPEN_IDS[0] },
    { id: 'dev-user-b', openId: DEV_BATTLE_OPEN_IDS[1] },
  ];
  const prisma = {
    user: {
      findMany: jest.fn(async () => users),
    },
    battleRoom: {
      findMany: jest.fn(async () => [
        {
          id: 'battle-room-1',
          createdByUserId: users[0].id,
          winnerUserId: null,
          participants: [
            { id: 'participant-a', userId: users[0].id },
            {
              id: 'participant-b',
              userId: options?.mixedParticipant
                ? 'real-wechat-user'
                : users[1].id,
            },
          ],
          answers: [],
          invitation: {
            inviterUserId: options?.mixedInviter
              ? 'real-wechat-user'
              : users[0].id,
            inviteeUserId: users[1].id,
          },
          ratingLogs: [],
          matchedQueues: [
            {
              userId: options?.mixedQueue
                ? 'real-wechat-user'
                : users[0].id,
            },
          ],
        },
      ]),
    },
    communityPost: {
      findMany: jest.fn(async () =>
        options?.mixedCommunity
          ? [
              {
                id: 'dev-post-1',
                favorites: [],
                histories: [],
                likes: [{ userId: 'real-wechat-user' }],
                comments: [],
              },
            ]
          : [],
      ),
    },
    courseLearningRecord: {
      findMany: jest.fn(async () => []),
    },
    communityPostFavorite: {
      findMany: jest.fn(async () => []),
    },
    communityPostViewHistory: {
      findMany: jest.fn(async () => []),
    },
    communityPostLike: {
      findMany: jest.fn(async () => []),
    },
    communityComment: {
      findMany: jest.fn(async () => []),
    },
  };

  return { prisma, users };
}

describe('Dev Battle user cleanup scope', () => {
  it('queries only the two exact dev OpenIDs', async () => {
    const { prisma, users } = createScopePrisma();

    const scope = await loadScope(prisma as never);

    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { openId: { in: [...DEV_BATTLE_OPEN_IDS] } },
      }),
    );
    expect(scope.userIds).toEqual(users.map((user) => user.id));
    expect(scope.roomIds).toEqual(['battle-room-1']);
  });

  it.each([
    ['participant', { mixedParticipant: true }],
    ['match queue', { mixedQueue: true }],
    ['inviter', { mixedInviter: true }],
  ])('blocks a room with a non-dev %s', async (_name, options) => {
    const { prisma } = createScopePrisma(options);

    await expect(loadScope(prisma as never)).rejects.toThrow(
      'BLOCKER: dev Battle rooms reference non-dev users.',
    );
    expect(prisma.communityPost.findMany).not.toHaveBeenCalled();
  });

  it('blocks a dev Community post with a non-dev interaction', async () => {
    const { prisma } = createScopePrisma({ mixedCommunity: true });

    await expect(loadScope(prisma as never)).rejects.toThrow(
      'BLOCKER: dev Community posts reference non-dev users.',
    );
    expect(prisma.courseLearningRecord.findMany).toHaveBeenCalled();
  });
});
