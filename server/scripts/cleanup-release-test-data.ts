import 'dotenv/config';

import { promises as fs, type Dirent } from 'fs';
import { isAbsolute, relative, resolve, sep } from 'path';
import { PrismaService } from '../src/prisma/prisma.service';
import { getUploadStorageRoot } from '../src/environment/environment.config';

const CONFIRM_FLAG = '--confirm';
const DELETE_ALL_UPLOADS_FLAG = '--delete-all-uploads';
const DELETE_ALL_USERS_FLAG = '--delete-all-users';
const REQUIRED_PERMISSION_VALUE = 'true';
const DEFAULT_BATTLE_RATING = 1000;
const PYTHON_COURSE_SLUG = 'python-basic';
const EXPECTED_PYTHON_CHAPTER_COUNT = 15;
const MINIMUM_BATTLE_QUESTION_COUNT = 20;
const MOCK_OPEN_ID_PREFIXES = ['mock-openid-', 'test-openid-'] as const;
const TRANSACTION_OPTIONS = {
  maxWait: 10_000,
  timeout: 120_000,
} as const;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type PrismaClient = PrismaService;
type TransactionClient = Parameters<
  Parameters<PrismaService['$transaction']>[0]
>[0];

const TABLES = [
  ['SystemHealth', 'systemHealth'],
  ['User', 'user'],
  ['UserFollow', 'userFollow'],
  ['UserSession', 'userSession'],
  ['Course', 'course'],
  ['CourseChapter', 'courseChapter'],
  ['ChapterContentBlock', 'chapterContentBlock'],
  ['CourseLearningRecord', 'courseLearningRecord'],
  ['ChapterLearningRecord', 'chapterLearningRecord'],
  ['Quiz', 'quiz'],
  ['QuizQuestion', 'quizQuestion'],
  ['QuizOption', 'quizOption'],
  ['QuizAttempt', 'quizAttempt'],
  ['QuizAnswer', 'quizAnswer'],
  ['PracticeAttempt', 'practiceAttempt'],
  ['PracticeAnswer', 'practiceAnswer'],
  ['BattleProfile', 'battleProfile'],
  ['BattleSkill', 'battleSkill'],
  ['UserBattleSkillRating', 'userBattleSkillRating'],
  ['BattleRoom', 'battleRoom'],
  ['BattleParticipant', 'battleParticipant'],
  ['BattleQuestionSnapshot', 'battleQuestionSnapshot'],
  ['BattleAnswer', 'battleAnswer'],
  ['BattleInvitation', 'battleInvitation'],
  ['BattleRatingLog', 'battleRatingLog'],
  ['BattleMatchQueue', 'battleMatchQueue'],
  ['CommunityCategory', 'communityCategory'],
  ['CommunityPost', 'communityPost'],
  ['CommunityPostImage', 'communityPostImage'],
  ['CommunityPostFavorite', 'communityPostFavorite'],
  ['CommunityPostViewHistory', 'communityPostViewHistory'],
  ['CommunityPostLike', 'communityPostLike'],
  ['CommunityComment', 'communityComment'],
] as const;

const PROTECTED_TABLES = new Set([
  'SystemHealth',
  'Course',
  'CourseChapter',
  'ChapterContentBlock',
  'Quiz',
  'QuizQuestion',
  'QuizOption',
  'BattleSkill',
  'CommunityCategory',
]);

type TableName = (typeof TABLES)[number][0];
type TableCounts = Record<TableName, number>;

type UploadCandidate = {
  absolutePath: string;
  relativePath: string;
};

type UploadPlan = {
  orphanedBeforeCleanup: UploadCandidate[];
  unreferencedAfterCleanup: UploadCandidate[];
  protectedFiles: UploadCandidate[];
  allFiles: UploadCandidate[];
};

type ContentIntegritySummary = {
  pythonCourseId: string;
  pythonChapterCount: number;
  pythonQuestionCount: number;
  missingExplanations: number;
  invalidSingleChoiceAnswers: number;
  invalidTextAnswers: number;
  battleEligibleCount: number;
};

function isEnabled(value: string | undefined) {
  return value?.trim().toLowerCase() === REQUIRED_PERMISSION_VALUE;
}

function parseArguments() {
  const knownArguments = new Set([
    CONFIRM_FLAG,
    DELETE_ALL_UPLOADS_FLAG,
    DELETE_ALL_USERS_FLAG,
  ]);
  const unknownArguments = process.argv
    .slice(2)
    .filter((argument) => !knownArguments.has(argument));

  if (unknownArguments.length > 0) {
    throw new Error(`Unknown cleanup argument: ${unknownArguments.join(', ')}`);
  }

  const confirm = process.argv.includes(CONFIRM_FLAG);
  const deleteAllUploads = process.argv.includes(DELETE_ALL_UPLOADS_FLAG);
  const deleteAllUsers = process.argv.includes(DELETE_ALL_USERS_FLAG);

  if (deleteAllUploads && !confirm) {
    throw new Error('--delete-all-uploads requires --confirm.');
  }

  return { confirm, deleteAllUploads, deleteAllUsers };
}

function parsePreservedUserIds() {
  const ids = [
    ...new Set(
      (process.env.CLEANUP_PRESERVE_USER_IDS ?? '')
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  ];
  const invalidIds = ids.filter((id) => !UUID_PATTERN.test(id));

  if (invalidIds.length > 0) {
    throw new Error(
      `CLEANUP_PRESERVE_USER_IDS contains invalid UUID values (${invalidIds.length}).`,
    );
  }

  return ids;
}

function assertPermission() {
  if (!isEnabled(process.env.CLEANUP_TEST_DATA_ALLOWED)) {
    throw new Error(
      'Cleanup is disabled. Set CLEANUP_TEST_DATA_ALLOWED=true to run dry-run or confirmed cleanup.',
    );
  }
}

function assertUploadRoot(uploadRoot: string) {
  if (!isAbsolute(uploadRoot)) {
    throw new Error('UPLOAD_STORAGE_ROOT must resolve to an absolute path.');
  }

  const filesystemRoot = resolve(uploadRoot).split(sep).filter(Boolean);

  if (filesystemRoot.length < 2) {
    throw new Error('UPLOAD_STORAGE_ROOT is too broad for cleanup.');
  }
}

function assertInsideRoot(uploadRoot: string, targetPath: string) {
  const normalizedRoot = resolve(uploadRoot);
  const normalizedTarget = resolve(targetPath);
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
  const relativeDirectory = assertInsideRoot(uploadRoot, directory);
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
      continue;
    }

    if (entry.isFile()) {
      files.push({ absolutePath, relativePath });
    }
  }

  if (files.length === 0 && relativeDirectory) {
    return [];
  }

  return files;
}

async function collectUploadCandidates(uploadRoot: string) {
  const directories = ['avatars', 'community'].map((name) =>
    resolve(uploadRoot, name),
  );

  return (
    await Promise.all(
      directories.map((directory) => collectFiles(uploadRoot, directory)),
    )
  )
    .flat()
    .sort((left, right) => left.relativePath.localeCompare(right.relativePath));
}

function normalizeUploadReference(value: string, marker: string) {
  const normalized = value.trim().replace(/\\/g, '/');
  const markerIndex = normalized.indexOf(marker);

  if (markerIndex < 0) {
    return null;
  }

  const referencedPath = normalized.slice(markerIndex + '/uploads/'.length);

  return referencedPath && !referencedPath.includes('..')
    ? referencedPath.replace(/^\/+/, '')
    : null;
}

function collectBlockObjectKeys(value: unknown, output: Set<string>) {
  if (Array.isArray(value)) {
    value.forEach((item) => collectBlockObjectKeys(item, output));
    return;
  }

  if (!value || typeof value !== 'object') {
    return;
  }

  const block = value as Record<string, unknown>;

  if (block.type === 'IMAGE' && typeof block.objectKey === 'string') {
    const objectKey = block.objectKey.trim().replace(/\\/g, '/');

    if (objectKey && !objectKey.includes('..')) {
      output.add(`community/${objectKey.replace(/^\/+/, '')}`);
    }
  }

  Object.values(block).forEach((item) => collectBlockObjectKeys(item, output));
}

async function loadUploadReferences(prisma: PrismaService) {
  const [users, images, posts] = await Promise.all([
    prisma.user.findMany({
      where: { avatarUrl: { not: null } },
      select: { avatarUrl: true },
    }),
    prisma.communityPostImage.findMany({
      select: { objectKey: true, url: true },
    }),
    prisma.communityPost.findMany({
      select: { contentBlocks: true },
    }),
  ]);
  const references = new Set<string>();

  for (const user of users) {
    if (!user.avatarUrl) {
      continue;
    }

    const reference = normalizeUploadReference(
      user.avatarUrl,
      '/uploads/avatars/',
    );

    if (reference) {
      references.add(reference);
    }
  }

  for (const image of images) {
    if (image.objectKey) {
      references.add(
        `community/${image.objectKey.trim().replace(/\\/g, '/').replace(/^\/+/, '')}`,
      );
    }

    const reference = normalizeUploadReference(
      image.url,
      '/uploads/community/',
    );

    if (reference) {
      references.add(reference);
    }
  }

  posts.forEach((post) =>
    collectBlockObjectKeys(post.contentBlocks, references),
  );

  return references;
}

function buildUploadPlan(
  files: UploadCandidate[],
  currentReferences: Set<string>,
  deleteAllUploads: boolean,
): UploadPlan {
  const orphanedBeforeCleanup = files.filter(
    (file) => !currentReferences.has(file.relativePath),
  );
  const referencedBeforeCleanup = files.filter((file) =>
    currentReferences.has(file.relativePath),
  );

  // The confirmed database cleanup clears every avatar and community post.
  const unreferencedAfterCleanup = referencedBeforeCleanup;
  const scheduledPaths = new Set(
    [...orphanedBeforeCleanup, ...unreferencedAfterCleanup].map(
      (file) => file.relativePath,
    ),
  );
  const protectedFiles = deleteAllUploads
    ? []
    : files.filter((file) => !scheduledPaths.has(file.relativePath));

  return {
    orphanedBeforeCleanup,
    unreferencedAfterCleanup,
    protectedFiles,
    allFiles: files,
  };
}

async function countTables(prisma: PrismaClient | TransactionClient) {
  const entries: Array<readonly [TableName, number]> = [];

  for (const [name, delegateName] of TABLES) {
    const delegate = prisma[delegateName] as unknown as {
      count(): Promise<number>;
    };

    try {
      entries.push([name, await delegate.count()] as const);
    } catch (error) {
      const code =
        error &&
        typeof error === 'object' &&
        'code' in error &&
        typeof error.code === 'string'
          ? error.code
          : 'UNKNOWN';

      throw new Error(`Failed to count ${name} (Prisma code: ${code}).`);
    }
  }

  return Object.fromEntries(entries) as TableCounts;
}

function printCounts(title: string, counts: TableCounts) {
  console.log(`\n${title}`);
  console.table(
    TABLES.map(([name]) => ({
      table: name,
      rows: counts[name],
      policy: PROTECTED_TABLES.has(name) ? 'PRESERVE' : 'CLEAN/RESET',
    })),
  );
}

async function loadContentIntegritySummary(
  prisma: PrismaClient,
): Promise<ContentIntegritySummary> {
  const course = await prisma.course.findUnique({
    where: { slug: PYTHON_COURSE_SLUG },
    select: {
      id: true,
      chapters: {
        where: { deletedAt: null },
        select: {
          quiz: {
            select: {
              questions: {
                select: {
                  type: true,
                  explanation: true,
                  acceptedAnswers: true,
                  isBattleEnabled: true,
                  battlePresentation: true,
                  battleDifficulty: true,
                  options: {
                    select: { isCorrect: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!course) {
    throw new Error(`Protected course not found: ${PYTHON_COURSE_SLUG}.`);
  }

  const questions = course.chapters.flatMap(
    (chapter) => chapter.quiz?.questions ?? [],
  );
  const hasAcceptedAnswer = (value: unknown) =>
    Array.isArray(value) &&
    value.some((answer) => typeof answer === 'string' && answer.trim());
  const singleChoiceQuestions = questions.filter(
    (question) => question.type === 'SINGLE_CHOICE',
  );
  const textQuestions = questions.filter(
    (question) =>
      question.type === 'FILL_BLANK' || question.type === 'CODE_FILL',
  );
  const battleEligibleCount = questions.filter((question) => {
    if (
      !question.isBattleEnabled ||
      !question.battlePresentation ||
      !question.battleDifficulty
    ) {
      return false;
    }

    if (question.type === 'SINGLE_CHOICE') {
      return (
        question.options.length >= 2 &&
        question.options.filter((option) => option.isCorrect).length === 1
      );
    }

    return (
      question.type === 'CODE_FILL' &&
      hasAcceptedAnswer(question.acceptedAnswers)
    );
  }).length;

  return {
    pythonCourseId: course.id,
    pythonChapterCount: course.chapters.length,
    pythonQuestionCount: questions.length,
    missingExplanations: questions.filter(
      (question) => !question.explanation?.trim(),
    ).length,
    invalidSingleChoiceAnswers: singleChoiceQuestions.filter(
      (question) =>
        question.options.filter((option) => option.isCorrect).length !== 1,
    ).length,
    invalidTextAnswers: textQuestions.filter(
      (question) => !hasAcceptedAnswer(question.acceptedAnswers),
    ).length,
    battleEligibleCount,
  };
}

function assertContentIntegrity(summary: ContentIntegritySummary) {
  if (summary.pythonChapterCount !== EXPECTED_PYTHON_CHAPTER_COUNT) {
    throw new Error(
      `Expected ${EXPECTED_PYTHON_CHAPTER_COUNT} Python chapters, found ${summary.pythonChapterCount}.`,
    );
  }

  if (
    summary.pythonQuestionCount === 0 ||
    summary.missingExplanations > 0 ||
    summary.invalidSingleChoiceAnswers > 0 ||
    summary.invalidTextAnswers > 0 ||
    summary.battleEligibleCount < MINIMUM_BATTLE_QUESTION_COUNT
  ) {
    throw new Error(
      'Protected Python course content failed integrity validation.',
    );
  }
}

function printContentIntegrity(
  title: string,
  summary: ContentIntegritySummary,
) {
  console.log(`\n${title}`);
  console.table(summary);
}

function assertProtectedCountsUnchanged(
  before: TableCounts,
  after: TableCounts,
) {
  for (const table of PROTECTED_TABLES) {
    if (before[table as TableName] !== after[table as TableName]) {
      throw new Error(`Protected table count changed unexpectedly: ${table}`);
    }
  }
}

function projectDryRunCounts(
  before: TableCounts,
  mockUserCount: number,
  mockBattleProfileCount: number,
  deleteAllUsers: boolean,
) {
  const projected = { ...before };

  for (const [table] of TABLES) {
    if (
      !PROTECTED_TABLES.has(table) &&
      table !== 'User' &&
      table !== 'BattleProfile'
    ) {
      projected[table] = 0;
    }
  }

  projected.User = deleteAllUsers
    ? 0
    : Math.max(0, before.User - mockUserCount);
  projected.BattleProfile = deleteAllUsers
    ? 0
    : Math.max(0, before.BattleProfile - mockBattleProfileCount);

  return projected;
}

function mockUserWhere(preservedUserIds: string[]) {
  return {
    AND: [
      {
        OR: MOCK_OPEN_ID_PREFIXES.map((prefix) => ({
          openId: { startsWith: prefix },
        })),
      },
      ...(preservedUserIds.length > 0
        ? [{ id: { notIn: preservedUserIds } }]
        : []),
    ],
  };
}

async function loadCleanupSummary(
  prisma: PrismaClient,
  preservedUserIds: string[],
) {
  const [counts, mockUserCount, mockBattleProfileCount, preservedUserCount] =
    await Promise.all([
      countTables(prisma),
      prisma.user.count({ where: mockUserWhere(preservedUserIds) }),
      prisma.battleProfile.count({
        where: { user: mockUserWhere(preservedUserIds) },
      }),
      preservedUserIds.length > 0
        ? prisma.user.count({ where: { id: { in: preservedUserIds } } })
        : Promise.resolve(0),
    ]);

  return {
    counts,
    mockUserCount,
    mockBattleProfileCount,
    preservedUserCount,
  };
}

async function deleteRuntimeData(
  prisma: PrismaService,
  preservedUserIds: string[],
  deleteAllUsers: boolean,
) {
  return prisma.$transaction(async (tx) => {
    const before = await countTables(tx);

    await tx.communityPostFavorite.deleteMany();
    await tx.communityPostViewHistory.deleteMany();
    await tx.communityPostLike.deleteMany();
    await tx.communityComment.deleteMany();
    await tx.communityPostImage.deleteMany();
    await tx.communityPost.deleteMany();
    await tx.userFollow.deleteMany();

    await tx.battleAnswer.deleteMany();
    await tx.battleRatingLog.deleteMany();
    await tx.battleInvitation.deleteMany();
    await tx.battleMatchQueue.deleteMany();
    await tx.battleQuestionSnapshot.deleteMany();
    await tx.battleParticipant.deleteMany();
    await tx.battleRoom.deleteMany();
    await tx.userBattleSkillRating.deleteMany();

    await tx.quizAnswer.deleteMany();
    await tx.quizAttempt.deleteMany();
    await tx.practiceAnswer.deleteMany();
    await tx.practiceAttempt.deleteMany();
    await tx.chapterLearningRecord.deleteMany();
    await tx.courseLearningRecord.deleteMany();
    await tx.userSession.deleteMany();

    await tx.battleProfile.updateMany({
      data: {
        rating: DEFAULT_BATTLE_RATING,
        highestRating: DEFAULT_BATTLE_RATING,
        totalBattles: 0,
        rankedBattles: 0,
        friendBattles: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        currentWinStreak: 0,
        bestWinStreak: 0,
      },
    });
    await tx.user.updateMany({
      data: {
        avatarUrl: null,
        experience: 0,
        battleRating: DEFAULT_BATTLE_RATING,
        continuousLearningDays: 0,
        lastLearningDate: null,
        lastLoginAt: null,
      },
    });
    await tx.course.updateMany({ data: { learnerCount: 0 } });

    let deletedUsers = 0;

    if (deleteAllUsers) {
      await tx.battleProfile.deleteMany();
      deletedUsers = (await tx.user.deleteMany()).count;
    } else {
      const mockUsers = await tx.user.findMany({
        where: mockUserWhere(preservedUserIds),
        select: { id: true },
      });
      const mockUserIds = mockUsers.map((user) => user.id);

      if (mockUserIds.length > 0) {
        await tx.battleProfile.deleteMany({
          where: { userId: { in: mockUserIds } },
        });
        deletedUsers = (
          await tx.user.deleteMany({ where: { id: { in: mockUserIds } } })
        ).count;
      }
    }

    const after = await countTables(tx);
    assertProtectedCountsUnchanged(before, after);

    return { before, after, deletedUsers };
  }, TRANSACTION_OPTIONS);
}

async function deleteUploadFiles(
  uploadRoot: string,
  candidates: UploadCandidate[],
) {
  let deleted = 0;

  for (const candidate of candidates) {
    assertInsideRoot(uploadRoot, candidate.absolutePath);

    try {
      await fs.unlink(candidate.absolutePath);
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
  assertPermission();
  const { confirm, deleteAllUploads, deleteAllUsers } = parseArguments();
  const preservedUserIds = parsePreservedUserIds();

  if (deleteAllUsers && preservedUserIds.length > 0) {
    throw new Error(
      '--delete-all-users cannot be combined with CLEANUP_PRESERVE_USER_IDS.',
    );
  }
  const uploadRoot = getUploadStorageRoot();
  assertUploadRoot(uploadRoot);

  const prisma = new PrismaService();

  try {
    await prisma.$connect();
    const summary = await loadCleanupSummary(prisma, preservedUserIds);
    const contentBefore = await loadContentIntegritySummary(prisma);
    assertContentIntegrity(contentBefore);
    const uploadCandidates = await collectUploadCandidates(uploadRoot);
    const uploadReferences = await loadUploadReferences(prisma);
    const uploadPlan = buildUploadPlan(
      uploadCandidates,
      uploadReferences,
      deleteAllUploads,
    );

    console.log('Release test-data cleanup');
    console.log(`mode: ${confirm ? 'CONFIRMED DELETE' : 'DRY RUN'}`);
    console.log(
      `user cleanup: ${deleteAllUsers ? 'DELETE ALL USERS' : 'DELETE MOCK USERS'}`,
    );
    console.log(`preserved user IDs configured: ${preservedUserIds.length}`);
    console.log(`preserved user IDs found: ${summary.preservedUserCount}`);
    console.log(`recognized mock users to delete: ${summary.mockUserCount}`);
    console.log(
      `mock OpenID rules: ${MOCK_OPEN_ID_PREFIXES.map((prefix) => `${prefix}*`).join(', ')}`,
    );
    printCounts('Before cleanup', summary.counts);
    printContentIntegrity('Protected content validation', contentBefore);
    printCounts(
      'Projected after cleanup',
      projectDryRunCounts(
        summary.counts,
        summary.mockUserCount,
        summary.mockBattleProfileCount,
        deleteAllUsers,
      ),
    );

    console.log('\nUpload root: configured and boundary-checked');
    console.log(
      `upload files currently orphaned: ${uploadPlan.orphanedBeforeCleanup.length}`,
    );
    console.log(
      `upload files becoming unreferenced: ${uploadPlan.unreferencedAfterCleanup.length}`,
    );
    console.log(`upload files protected: ${uploadPlan.protectedFiles.length}`);
    console.log(
      `delete-all-uploads: ${deleteAllUploads ? 'enabled' : 'disabled'}`,
    );
    const scheduledUploadFiles = deleteAllUploads
      ? uploadPlan.allFiles
      : [
          ...uploadPlan.orphanedBeforeCleanup,
          ...uploadPlan.unreferencedAfterCleanup,
        ];
    for (const candidate of scheduledUploadFiles) {
      console.log(`[upload] ${candidate.relativePath}`);
    }

    if (!confirm) {
      console.log(
        '\nDRY RUN complete: no database rows or files were changed.',
      );
      return;
    }

    if (summary.preservedUserCount !== preservedUserIds.length) {
      throw new Error(
        'One or more CLEANUP_PRESERVE_USER_IDS values do not exist; confirmed cleanup was refused.',
      );
    }

    const result = await deleteRuntimeData(
      prisma,
      preservedUserIds,
      deleteAllUsers,
    );
    printCounts('After cleanup', result.after);
    const contentAfter = await loadContentIntegritySummary(prisma);
    assertContentIntegrity(contentAfter);
    printContentIntegrity('Protected content after cleanup', contentAfter);
    console.log(`deleted users: ${result.deletedUsers}`);

    const deletedUploadFiles = await deleteUploadFiles(
      uploadRoot,
      scheduledUploadFiles,
    );
    console.log(`deleted upload files: ${deletedUploadFiles}`);
    console.log('Confirmed cleanup complete.');
  } finally {
    await prisma.$disconnect();
  }
}

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error(`Cleanup failed: ${message}`);
  process.exitCode = 1;
});
