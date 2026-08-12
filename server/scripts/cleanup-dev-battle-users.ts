import 'dotenv/config';

import { promises as fs, type Dirent } from 'fs';
import { isAbsolute, relative, resolve, sep } from 'path';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../src/prisma/prisma.service';
import { getUploadStorageRoot } from '../src/environment/environment.config';

const EXECUTE_FLAG = '--execute';
const CLEANUP_ALLOWED_ENV = 'CLEANUP_TEST_DATA_ALLOWED';
const TRANSACTION_OPTIONS = { maxWait: 10_000, timeout: 120_000 } as const;

export const DEV_BATTLE_OPEN_IDS = [
  'dev:test-player-a',
  'dev:test-player-b',
] as const;

type TargetUser = {
  id: string;
  openId: string;
};

type CleanupScope = {
  users: TargetUser[];
  userIds: string[];
  roomIds: string[];
  participantIds: string[];
  postIds: string[];
  affectedCourseIds: string[];
  affectedExternalPostIds: string[];
};

type CleanupCounts = Record<string, number>;

type CleanupClient = PrismaService | Prisma.TransactionClient;

type UploadCandidate = {
  absolutePath: string;
  relativePath: string;
};

function parseArguments() {
  const arguments_ = process.argv.slice(2);
  const unknown = arguments_.filter((argument) => argument !== EXECUTE_FLAG);

  if (unknown.length > 0) {
    throw new Error(`Unknown cleanup argument: ${unknown.join(', ')}`);
  }

  return { execute: arguments_.includes(EXECUTE_FLAG) };
}

function assertExecutePermission() {
  if (
    process.env[CLEANUP_ALLOWED_ENV]?.trim().toLowerCase() !== 'true'
  ) {
    throw new Error(
      `Refusing execute mode. Set ${CLEANUP_ALLOWED_ENV}=true explicitly.`,
    );
  }
}

function assertInsideRoot(root: string, target: string) {
  const normalizedRoot = resolve(root);
  const normalizedTarget = resolve(target);
  const childPath = relative(normalizedRoot, normalizedTarget);

  if (
    !childPath ||
    childPath === '..' ||
    childPath.startsWith(`..${sep}`) ||
    isAbsolute(childPath)
  ) {
    throw new Error('Refusing to operate outside UPLOAD_STORAGE_ROOT.');
  }

  return childPath.split(sep).join('/');
}

async function collectFiles(
  uploadRoot: string,
  directory: string,
): Promise<UploadCandidate[]> {
  assertInsideRoot(uploadRoot, directory);
  let entries: Dirent<string>[];

  try {
    entries = await fs.readdir(directory, { withFileTypes: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }

    throw error;
  }

  const files: UploadCandidate[] = [];

  for (const entry of entries) {
    const absolutePath = resolve(directory, entry.name);
    const relativePath = assertInsideRoot(uploadRoot, absolutePath);

    if (entry.isSymbolicLink()) {
      console.warn(`[skip] symbolic link: ${relativePath}`);
      continue;
    }

    if (entry.isDirectory()) {
      files.push(...(await collectFiles(uploadRoot, absolutePath)));
    } else if (entry.isFile()) {
      files.push({ absolutePath, relativePath });
    }
  }

  return files;
}

async function loadUploadCandidates(uploadRoot: string, userIds: string[]) {
  const directories = userIds.flatMap((userId) => [
    resolve(uploadRoot, 'avatars', userId),
    resolve(uploadRoot, 'community', userId),
  ]);
  const files = (
    await Promise.all(
      directories.map((directory) => collectFiles(uploadRoot, directory)),
    )
  ).flat();

  return files.sort((left, right) =>
    left.relativePath.localeCompare(right.relativePath),
  );
}

export async function loadScope(
  prisma: CleanupClient,
): Promise<CleanupScope> {
  const users = await prisma.user.findMany({
    where: { openId: { in: [...DEV_BATTLE_OPEN_IDS] } },
    select: { id: true, openId: true },
    orderBy: { openId: 'asc' },
  });
  const userIds = users.map((user) => user.id);

  if (userIds.length === 0) {
    return {
      users,
      userIds,
      roomIds: [],
      participantIds: [],
      postIds: [],
      affectedCourseIds: [],
      affectedExternalPostIds: [],
    };
  }

  const rooms = await prisma.battleRoom.findMany({
    where: {
      OR: [
        { createdByUserId: { in: userIds } },
        { winnerUserId: { in: userIds } },
        { participants: { some: { userId: { in: userIds } } } },
        { answers: { some: { userId: { in: userIds } } } },
        {
          invitation: {
            is: {
              OR: [
                { inviterUserId: { in: userIds } },
                { inviteeUserId: { in: userIds } },
              ],
            },
          },
        },
        { ratingLogs: { some: { userId: { in: userIds } } } },
        { matchedQueues: { some: { userId: { in: userIds } } } },
      ],
    },
    select: {
      id: true,
      createdByUserId: true,
      winnerUserId: true,
      participants: { select: { id: true, userId: true } },
      answers: { select: { userId: true } },
      invitation: {
        select: { inviterUserId: true, inviteeUserId: true },
      },
      ratingLogs: { select: { userId: true } },
      matchedQueues: { select: { userId: true } },
    },
  });
  const targetUserIds = new Set(userIds);
  const mixedUserReferenceRoomIds = rooms
    .filter((room) =>
      [
        room.createdByUserId,
        room.winnerUserId,
        room.invitation?.inviterUserId,
        room.invitation?.inviteeUserId,
        ...room.participants.map((participant) => participant.userId),
        ...room.answers.map((answer) => answer.userId),
        ...room.ratingLogs.map((ratingLog) => ratingLog.userId),
      ].some((userId) => userId !== null && userId !== undefined && !targetUserIds.has(userId)),
    )
    .map((room) => room.id);
  const mixedQueueRoomIds = rooms
    .filter((room) =>
      room.matchedQueues.some((queue) => !targetUserIds.has(queue.userId)),
    )
    .map((room) => room.id);

  if (mixedUserReferenceRoomIds.length > 0 || mixedQueueRoomIds.length > 0) {
    throw new Error(
      [
        'BLOCKER: dev Battle rooms reference non-dev users.',
        `mixed user-reference rooms: ${mixedUserReferenceRoomIds.length}`,
        `mixed queue rooms: ${mixedQueueRoomIds.length}`,
        'No database or upload data was deleted.',
      ].join(' '),
    );
  }

  const roomIds = rooms.map((room) => room.id);
  const participantIds = rooms.flatMap((room) =>
    room.participants.map((participant) => participant.id),
  );
  const [posts, learningRecords, externalPostRelations] = await Promise.all([
    prisma.communityPost.findMany({
      where: { authorId: { in: userIds } },
      select: {
        id: true,
        favorites: { select: { userId: true } },
        histories: { select: { userId: true } },
        likes: { select: { userId: true } },
        comments: { select: { authorId: true } },
      },
    }),
    prisma.courseLearningRecord.findMany({
      where: { userId: { in: userIds } },
      select: { courseId: true },
      distinct: ['courseId'],
    }),
    Promise.all([
      prisma.communityPostFavorite.findMany({
        where: { userId: { in: userIds } },
        select: { postId: true },
      }),
      prisma.communityPostViewHistory.findMany({
        where: { userId: { in: userIds } },
        select: { postId: true },
      }),
      prisma.communityPostLike.findMany({
        where: { userId: { in: userIds } },
        select: { postId: true },
      }),
      prisma.communityComment.findMany({
        where: { authorId: { in: userIds } },
        select: { postId: true },
      }),
    ]),
  ]);
  const mixedCommunityPostIds = posts
    .filter((post) =>
      [
        ...post.favorites.map((favorite) => favorite.userId),
        ...post.histories.map((history) => history.userId),
        ...post.likes.map((like) => like.userId),
        ...post.comments.map((comment) => comment.authorId),
      ].some((userId) => !targetUserIds.has(userId)),
    )
    .map((post) => post.id);

  if (mixedCommunityPostIds.length > 0) {
    throw new Error(
      [
        'BLOCKER: dev Community posts reference non-dev users.',
        `mixed posts: ${mixedCommunityPostIds.length}`,
        'No database or upload data was deleted.',
      ].join(' '),
    );
  }

  const postIds = posts.map((post) => post.id);
  const targetPostIds = new Set(postIds);
  const affectedExternalPostIds = [
    ...new Set(
      externalPostRelations
        .flat()
        .map((relation) => relation.postId)
        .filter((postId) => !targetPostIds.has(postId)),
    ),
  ];

  return {
    users,
    userIds,
    roomIds,
    participantIds,
    postIds,
    affectedCourseIds: learningRecords.map((record) => record.courseId),
    affectedExternalPostIds,
  };
}

async function loadCounts(prisma: PrismaService, scope: CleanupScope) {
  const { userIds, roomIds, postIds } = scope;
  const entries = await Promise.all([
    prisma.user.count({ where: { id: { in: userIds } } }),
    prisma.userSession.count({ where: { userId: { in: userIds } } }),
    prisma.userFollow.count({
      where: {
        OR: [
          { followerUserId: { in: userIds } },
          { followedUserId: { in: userIds } },
        ],
      },
    }),
    prisma.courseLearningRecord.count({ where: { userId: { in: userIds } } }),
    prisma.chapterLearningRecord.count({ where: { userId: { in: userIds } } }),
    prisma.quizAttempt.count({ where: { userId: { in: userIds } } }),
    prisma.quizAnswer.count({
      where: { attempt: { userId: { in: userIds } } },
    }),
    prisma.practiceAttempt.count({ where: { userId: { in: userIds } } }),
    prisma.practiceAnswer.count({ where: { userId: { in: userIds } } }),
    prisma.battleProfile.count({ where: { userId: { in: userIds } } }),
    prisma.userBattleSkillRating.count({ where: { userId: { in: userIds } } }),
    prisma.battleRoom.count({ where: { id: { in: roomIds } } }),
    prisma.battleParticipant.count({ where: { battleRoomId: { in: roomIds } } }),
    prisma.battleQuestionSnapshot.count({
      where: { battleRoomId: { in: roomIds } },
    }),
    prisma.battleAnswer.count({ where: { battleRoomId: { in: roomIds } } }),
    prisma.battleInvitation.count({ where: { battleRoomId: { in: roomIds } } }),
    prisma.battleRatingLog.count({
      where: { OR: [{ battleRoomId: { in: roomIds } }, { userId: { in: userIds } }] },
    }),
    prisma.battleMatchQueue.count({ where: { userId: { in: userIds } } }),
    prisma.communityPost.count({ where: { id: { in: postIds } } }),
    prisma.communityPostImage.count({ where: { postId: { in: postIds } } }),
    prisma.communityPostFavorite.count({
      where: { OR: [{ postId: { in: postIds } }, { userId: { in: userIds } }] },
    }),
    prisma.communityPostViewHistory.count({
      where: { OR: [{ postId: { in: postIds } }, { userId: { in: userIds } }] },
    }),
    prisma.communityPostLike.count({
      where: { OR: [{ postId: { in: postIds } }, { userId: { in: userIds } }] },
    }),
    prisma.communityComment.count({
      where: { OR: [{ postId: { in: postIds } }, { authorId: { in: userIds } }] },
    }),
  ]);
  const names = [
    'User',
    'UserSession',
    'UserFollow',
    'CourseLearningRecord',
    'ChapterLearningRecord',
    'QuizAttempt',
    'QuizAnswer',
    'PracticeAttempt',
    'PracticeAnswer',
    'BattleProfile',
    'UserBattleSkillRating',
    'BattleRoom',
    'BattleParticipant',
    'BattleQuestionSnapshot',
    'BattleAnswer',
    'BattleInvitation',
    'BattleRatingLog',
    'BattleMatchQueue',
    'CommunityPost',
    'CommunityPostImage',
    'CommunityPostFavorite',
    'CommunityPostViewHistory',
    'CommunityPostLike',
    'CommunityComment',
  ];

  return Object.fromEntries(
    names.map((name, index) => [name, entries[index]]),
  ) as CleanupCounts;
}

function printCounts(title: string, counts: CleanupCounts) {
  console.log(`\n${title}`);
  console.table(
    Object.entries(counts).map(([table, rows]) => ({ table, rows })),
  );
}

async function refreshExternalPostCounters(
  tx: Parameters<Parameters<PrismaService['$transaction']>[0]>[0],
  postIds: string[],
) {
  for (const postId of postIds) {
    const [likeCount, favoriteCount, commentCount, views] = await Promise.all([
      tx.communityPostLike.count({ where: { postId } }),
      tx.communityPostFavorite.count({ where: { postId } }),
      tx.communityComment.count({
        where: { postId, status: 'PUBLISHED', deletedAt: null },
      }),
      tx.communityPostViewHistory.aggregate({
        where: { postId },
        _sum: { viewCount: true },
      }),
    ]);

    await tx.communityPost.updateMany({
      where: { id: postId },
      data: {
        likeCount,
        favoriteCount,
        commentCount,
        viewCount: views._sum.viewCount ?? 0,
      },
    });
  }
}

function assertSameScope(expected: CleanupScope, actual: CleanupScope) {
  const comparable = (scope: CleanupScope) => ({
    users: scope.users,
    roomIds: [...scope.roomIds].sort(),
    participantIds: [...scope.participantIds].sort(),
    postIds: [...scope.postIds].sort(),
    affectedCourseIds: [...scope.affectedCourseIds].sort(),
    affectedExternalPostIds: [...scope.affectedExternalPostIds].sort(),
  });

  if (
    JSON.stringify(comparable(expected)) !== JSON.stringify(comparable(actual))
  ) {
    throw new Error(
      'BLOCKER: dev cleanup scope changed after locks were acquired. No data was deleted.',
    );
  }
}

async function acquireCleanupLocks(
  tx: Prisma.TransactionClient,
  scope: CleanupScope,
) {
  for (const userId of [...scope.userIds].sort()) {
    await tx.$queryRaw(
      Prisma.sql`SELECT 1 AS locked FROM pg_advisory_xact_lock(hashtextextended(${`battle:user:${userId}`}, 0))`,
    );
  }

  for (const roomId of [...scope.roomIds].sort()) {
    await tx.$queryRaw(
      Prisma.sql`SELECT 1 AS locked FROM pg_advisory_xact_lock(hashtextextended(${`battle:room:${roomId}`}, 0))`,
    );
  }
}

async function deleteDatabaseData(prisma: PrismaService, scope: CleanupScope) {
  const { userIds, roomIds, postIds } = scope;

  return prisma.$transaction(async (tx) => {
    await acquireCleanupLocks(tx, scope);

    const lockedScope = await loadScope(tx);
    assertSameScope(scope, lockedScope);

    await tx.communityPostFavorite.deleteMany({
      where: { OR: [{ postId: { in: postIds } }, { userId: { in: userIds } }] },
    });
    await tx.communityPostViewHistory.deleteMany({
      where: { OR: [{ postId: { in: postIds } }, { userId: { in: userIds } }] },
    });
    await tx.communityPostLike.deleteMany({
      where: { OR: [{ postId: { in: postIds } }, { userId: { in: userIds } }] },
    });
    await tx.communityComment.deleteMany({
      where: { OR: [{ postId: { in: postIds } }, { authorId: { in: userIds } }] },
    });
    await tx.communityPostImage.deleteMany({ where: { postId: { in: postIds } } });
    await tx.communityPost.deleteMany({ where: { id: { in: postIds } } });
    await refreshExternalPostCounters(tx, scope.affectedExternalPostIds);
    await tx.userFollow.deleteMany({
      where: {
        OR: [
          { followerUserId: { in: userIds } },
          { followedUserId: { in: userIds } },
        ],
      },
    });

    await tx.battleAnswer.deleteMany({ where: { battleRoomId: { in: roomIds } } });
    await tx.battleRatingLog.deleteMany({
      where: { OR: [{ battleRoomId: { in: roomIds } }, { userId: { in: userIds } }] },
    });
    await tx.battleInvitation.deleteMany({ where: { battleRoomId: { in: roomIds } } });
    await tx.battleMatchQueue.deleteMany({ where: { userId: { in: userIds } } });
    await tx.battleQuestionSnapshot.deleteMany({ where: { battleRoomId: { in: roomIds } } });
    await tx.battleParticipant.deleteMany({ where: { battleRoomId: { in: roomIds } } });
    await tx.battleRoom.deleteMany({ where: { id: { in: roomIds } } });
    await tx.userBattleSkillRating.deleteMany({ where: { userId: { in: userIds } } });
    await tx.battleProfile.deleteMany({ where: { userId: { in: userIds } } });

    await tx.quizAnswer.deleteMany({
      where: { attempt: { userId: { in: userIds } } },
    });
    await tx.quizAttempt.deleteMany({ where: { userId: { in: userIds } } });
    await tx.practiceAnswer.deleteMany({ where: { userId: { in: userIds } } });
    await tx.practiceAttempt.deleteMany({ where: { userId: { in: userIds } } });
    await tx.chapterLearningRecord.deleteMany({ where: { userId: { in: userIds } } });
    await tx.courseLearningRecord.deleteMany({ where: { userId: { in: userIds } } });
    await tx.userSession.deleteMany({ where: { userId: { in: userIds } } });

    for (const courseId of scope.affectedCourseIds) {
      const learnerCount = await tx.courseLearningRecord.count({
        where: { courseId, isSelected: true },
      });
      await tx.course.update({ where: { id: courseId }, data: { learnerCount } });
    }

    await tx.user.deleteMany({ where: { id: { in: userIds } } });
  }, TRANSACTION_OPTIONS);
}

async function deleteUploads(uploadRoot: string, files: UploadCandidate[]) {
  let deleted = 0;

  for (const file of files) {
    assertInsideRoot(uploadRoot, file.absolutePath);

    try {
      await fs.unlink(file.absolutePath);
      deleted += 1;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }

  return deleted;
}

async function main() {
  const { execute } = parseArguments();
  const prisma = new PrismaService();

  try {
    await prisma.onModuleInit();
    const scope = await loadScope(prisma);
    const counts = await loadCounts(prisma, scope);
    const uploadRoot = getUploadStorageRoot();
    const uploads = await loadUploadCandidates(uploadRoot, scope.userIds);

    console.log(execute ? 'Mode: EXECUTE' : 'Mode: DRY-RUN');
    console.log(`Exact OpenIDs: ${DEV_BATTLE_OPEN_IDS.join(', ')}`);
    console.log(`Matched users: ${scope.users.length}`);
    printCounts('Target rows', counts);
    console.log(`\nTarget upload files: ${uploads.length}`);
    uploads.forEach((file) => console.log(`- ${file.relativePath}`));

    if (!execute) {
      console.log('\nDry-run complete. No database rows or files were deleted.');
      return;
    }

    assertExecutePermission();
    await deleteDatabaseData(prisma, scope);
    const deletedUploads = await deleteUploads(uploadRoot, uploads);
    const afterScope = await loadScope(prisma);
    const afterCounts = await loadCounts(prisma, afterScope);

    printCounts('Rows remaining for exact dev users', afterCounts);
    console.log(`Deleted upload files: ${deletedUploads}`);
    console.log('Cleanup complete.');
  } finally {
    await prisma.onModuleDestroy();
  }
}

if (require.main === module) {
  void main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : 'Cleanup failed.');
    process.exitCode = 1;
  });
}
