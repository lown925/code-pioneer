/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/require-await */
import {
  INestApplication,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { promises as fs } from 'fs';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { AuthService } from './../src/auth/auth.service';
import { PrismaService } from './../src/prisma/prisma.service';

type UserRecord = {
  id: string;
  nickname: string | null;
  avatarUrl: string | null;
};

type CommunityCategoryRecord = {
  id: string;
  key: string;
  name: string;
  description: string | null;
  sortOrder: number;
  status: 'ENABLED' | 'DISABLED';
  createdAt: Date;
  updatedAt: Date;
};

type CommunityPostRecord = {
  id: string;
  authorId: string;
  categoryId: string;
  title: string;
  content: string;
  contentBlocks: unknown;
  status: 'PUBLISHED' | 'HIDDEN' | 'DELETED';
  recommendationScore: number;
  likeCount: number;
  commentCount: number;
  favoriteCount: number;
  viewCount: number;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type CommunityCommentRecord = {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  status: 'PUBLISHED' | 'HIDDEN' | 'DELETED';
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type CommunityFavoriteRecord = {
  id: string;
  postId: string;
  userId: string;
  createdAt: Date;
};

type CommunityLikeRecord = {
  id: string;
  postId: string;
  userId: string;
  createdAt: Date;
};

type CommunityHistoryRecord = {
  id: string;
  postId: string;
  userId: string;
  firstViewedAt: Date;
  lastViewedAt: Date;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
};

const USER_A = {
  id: '11111111-1111-4111-8111-111111111111',
  sessionId: 'session-a',
  tokenType: 'USER' as const,
  role: 'NORMAL' as const,
};

const USER_B = {
  id: '22222222-2222-4222-8222-222222222222',
  sessionId: 'session-b',
  tokenType: 'USER' as const,
  role: 'NORMAL' as const,
};

const USER_A_TOKEN = 'community-user-a-token';
const USER_B_TOKEN = 'community-user-b-token';
const TEST_PUBLIC_BASE_URL = 'https://aryqvdjgwpnp.sealoshzh.site';
const originalPublicBaseUrl = process.env.PUBLIC_BASE_URL;
const originalAppEnvironment = process.env.APP_ENV;

function createCommunityPrismaMock() {
  const users = new Map<string, UserRecord>();
  const categories = new Map<string, CommunityCategoryRecord>();
  const posts = new Map<string, CommunityPostRecord>();
  const comments = new Map<string, CommunityCommentRecord>();
  const favorites = new Map<string, CommunityFavoriteRecord>();
  const likes = new Map<string, CommunityLikeRecord>();
  const histories = new Map<string, CommunityHistoryRecord>();

  let categorySequence = 0;
  let postSequence = 0;
  let commentSequence = 0;
  let favoriteSequence = 0;
  let likeSequence = 0;
  let historySequence = 0;
  let timestampSequence = 0;

  const toUuid = (sequence: number) =>
    `00000000-0000-4000-8000-${sequence.toString(16).padStart(12, '0')}`;

  const nextDate = (base?: Date) => {
    timestampSequence += 1;
    const now = base ? base.getTime() : Date.now();
    return new Date(now + timestampSequence);
  };

  const findCategoryByKey = (key: string) =>
    [...categories.values()].find((item) => item.key === key) ?? null;

  const findPostById = (postId: string) => posts.get(postId) ?? null;

  const buildPostPayload = (post: CommunityPostRecord) => {
    const author = users.get(post.authorId);
    const category = categories.get(post.categoryId);

    if (!author || !category) {
      throw new Error('Community post relations are not ready');
    }

    return {
      ...post,
      author: {
        id: author.id,
        nickname: author.nickname,
        avatarUrl: author.avatarUrl,
      },
      category: {
        id: category.id,
        key: category.key,
        name: category.name,
        description: category.description,
        sortOrder: category.sortOrder,
        status: category.status,
      },
      images: [],
    };
  };

  const buildCommentPayload = (comment: CommunityCommentRecord) => {
    const author = users.get(comment.authorId);

    if (!author) {
      throw new Error('Community comment relations are not ready');
    }

    return {
      ...comment,
      author: {
        id: author.id,
        nickname: author.nickname,
        avatarUrl: author.avatarUrl,
      },
    };
  };

  const matchesPostWhere = (
    post: CommunityPostRecord,
    where: Record<string, any> | undefined,
  ) => {
    if (!where) {
      return true;
    }

    if (where.id !== undefined && post.id !== where.id) {
      return false;
    }

    if (where.authorId !== undefined && post.authorId !== where.authorId) {
      return false;
    }

    if (
      where.categoryId !== undefined &&
      post.categoryId !== where.categoryId
    ) {
      return false;
    }

    if (where.status !== undefined && post.status !== where.status) {
      return false;
    }

    if (where.deletedAt === null && post.deletedAt !== null) {
      return false;
    }

    return true;
  };

  const getVisiblePosts = (where?: Record<string, any>) =>
    [...posts.values()]
      .filter((post) => matchesPostWhere(post, where))
      .sort((left, right) => {
        const timeDelta = right.createdAt.getTime() - left.createdAt.getTime();

        if (timeDelta !== 0) {
          return timeDelta;
        }

        return right.id.localeCompare(left.id);
      });

  const getOrderedVisiblePosts = (
    where?: Record<string, any>,
    orderBy?: Array<Record<string, 'asc' | 'desc'>>,
  ) => {
    const records = getVisiblePosts(where);

    if (!orderBy?.length) {
      return records;
    }

    return records.sort((left, right) => {
      for (const order of orderBy) {
        const [field, direction] = Object.entries(order)[0] ?? [];

        if (!field || !direction) {
          continue;
        }

        const leftValue = left[field as keyof CommunityPostRecord];
        const rightValue = right[field as keyof CommunityPostRecord];
        const leftComparable =
          leftValue instanceof Date ? leftValue.getTime() : leftValue;
        const rightComparable =
          rightValue instanceof Date ? rightValue.getTime() : rightValue;

        if (leftComparable === rightComparable) {
          continue;
        }

        const comparison = leftComparable! < rightComparable! ? -1 : 1;
        return direction === 'asc' ? comparison : -comparison;
      }

      return 0;
    });
  };

  const applyCursor = <T extends { id: string }>(
    records: T[],
    cursorId?: string,
    skip = 0,
  ) => {
    if (!cursorId) {
      return records;
    }

    const index = records.findIndex((record) => record.id === cursorId);

    if (index < 0) {
      return records;
    }

    return records.slice(index + skip);
  };

  const favoriteKey = (userId: string, postId: string) => `${userId}:${postId}`;
  const likeKey = (userId: string, postId: string) => `${userId}:${postId}`;
  const historyKey = (userId: string, postId: string) => `${userId}:${postId}`;

  const prisma: any = {
    communityCategory: {
      findMany: jest.fn(async ({ where }: { where?: any }) => {
        return [...categories.values()]
          .filter((category) => {
            if (!where) {
              return true;
            }

            if (
              where.status !== undefined &&
              category.status !== where.status
            ) {
              return false;
            }

            return true;
          })
          .sort((left, right) => {
            if (left.sortOrder !== right.sortOrder) {
              return left.sortOrder - right.sortOrder;
            }

            return left.createdAt.getTime() - right.createdAt.getTime();
          });
      }),
      findFirst: jest.fn(async ({ where }: { where?: any }) => {
        if (where?.key) {
          return findCategoryByKey(where.key);
        }

        return null;
      }),
      upsert: jest.fn(
        async ({
          where,
          create,
          update,
        }: {
          where: any;
          create: any;
          update: any;
        }) => {
          const existing = findCategoryByKey(where.key);

          if (existing) {
            const updatedRecord: CommunityCategoryRecord = {
              ...existing,
              ...update,
              updatedAt: nextDate(),
            };
            categories.set(updatedRecord.id, updatedRecord);
            return updatedRecord;
          }

          categorySequence += 1;
          const created: CommunityCategoryRecord = {
            id: toUuid(categorySequence),
            key: create.key,
            name: create.name,
            description: create.description ?? null,
            sortOrder: create.sortOrder ?? 0,
            status: create.status ?? 'ENABLED',
            createdAt: nextDate(),
            updatedAt: nextDate(),
          };
          categories.set(created.id, created);
          return created;
        },
      ),
    },
    communityPost: {
      findMany: jest.fn(
        async ({
          where,
          take,
          cursor,
          skip,
          orderBy,
        }: {
          where?: any;
          take?: number;
          cursor?: { id: string };
          skip?: number;
          orderBy?: Array<Record<string, 'asc' | 'desc'>>;
        }) => {
          const visiblePosts = applyCursor(
            getOrderedVisiblePosts(where, orderBy),
            cursor?.id,
            skip ?? 0,
          );

          return visiblePosts
            .slice(0, take ?? visiblePosts.length)
            .map((post) => buildPostPayload(post));
        },
      ),
      findFirst: jest.fn(async ({ where }: { where?: any }) => {
        const post = getVisiblePosts(where)[0] ?? null;
        return post ? buildPostPayload(post) : null;
      }),
      create: jest.fn(async ({ data }: { data: any }) => {
        postSequence += 1;
        const createdAt = nextDate(data.createdAt);
        const record: CommunityPostRecord = {
          id: toUuid(10_000 + postSequence),
          authorId: data.authorId,
          categoryId: data.categoryId,
          title: data.title,
          content: data.content,
          contentBlocks: data.contentBlocks ?? null,
          status: data.status,
          recommendationScore: data.recommendationScore ?? 0,
          likeCount: data.likeCount ?? 0,
          commentCount: data.commentCount ?? 0,
          favoriteCount: data.favoriteCount ?? 0,
          viewCount: data.viewCount ?? 0,
          deletedAt: data.deletedAt ?? null,
          createdAt,
          updatedAt: nextDate(data.updatedAt ?? createdAt),
        };
        posts.set(record.id, record);
        return {
          id: record.id,
          createdAt: record.createdAt,
        };
      }),
      update: jest.fn(async ({ where, data }: { where: any; data: any }) => {
        const existing = findPostById(where.id);

        if (!existing) {
          throw new Error('Community post not found');
        }

        const updated: CommunityPostRecord = {
          ...existing,
          status: data.status ?? existing.status,
          deletedAt:
            data.deletedAt !== undefined ? data.deletedAt : existing.deletedAt,
          favoriteCount:
            data.favoriteCount?.increment !== undefined
              ? existing.favoriteCount + data.favoriteCount.increment
              : data.favoriteCount?.decrement !== undefined
                ? Math.max(
                    0,
                    existing.favoriteCount - data.favoriteCount.decrement,
                  )
                : existing.favoriteCount,
          likeCount:
            data.likeCount?.increment !== undefined
              ? existing.likeCount + data.likeCount.increment
              : data.likeCount?.decrement !== undefined
                ? Math.max(0, existing.likeCount - data.likeCount.decrement)
                : existing.likeCount,
          commentCount:
            data.commentCount?.increment !== undefined
              ? existing.commentCount + data.commentCount.increment
              : data.commentCount?.decrement !== undefined
                ? Math.max(
                    0,
                    existing.commentCount - data.commentCount.decrement,
                  )
                : existing.commentCount,
          recommendationScore:
            data.recommendationScore?.increment !== undefined
              ? existing.recommendationScore +
                data.recommendationScore.increment
              : data.recommendationScore?.decrement !== undefined
                ? existing.recommendationScore -
                  data.recommendationScore.decrement
                : existing.recommendationScore,
          viewCount:
            data.viewCount?.increment !== undefined
              ? existing.viewCount + data.viewCount.increment
              : existing.viewCount,
          updatedAt: nextDate(),
        };
        posts.set(updated.id, updated);

        if (data.select?.commentCount === true) {
          return {
            commentCount: updated.commentCount,
          };
        }

        if (data.select?.favoriteCount === true) {
          return {
            favoriteCount: updated.favoriteCount,
          };
        }

        if (data.select?.likeCount === true) {
          return {
            likeCount: updated.likeCount,
          };
        }

        if (data.select?.viewCount === true) {
          return {
            viewCount: updated.viewCount,
          };
        }

        return buildPostPayload(updated);
      }),
      count: jest.fn(async ({ where }: { where?: any }) => {
        return [...posts.values()].filter((post) =>
          matchesPostWhere(post, where),
        ).length;
      }),
    },
    communityComment: {
      findMany: jest.fn(async ({ where }: { where?: any }) => {
        return [...comments.values()]
          .filter((comment) => {
            if (
              where?.postId !== undefined &&
              comment.postId !== where.postId
            ) {
              return false;
            }

            if (
              where?.status !== undefined &&
              comment.status !== where.status
            ) {
              return false;
            }

            if (where?.deletedAt === null && comment.deletedAt !== null) {
              return false;
            }

            return true;
          })
          .sort((left, right) => {
            const timeDelta =
              left.createdAt.getTime() - right.createdAt.getTime();

            if (timeDelta !== 0) {
              return timeDelta;
            }

            return left.id.localeCompare(right.id);
          })
          .map((comment) => buildCommentPayload(comment));
      }),
      create: jest.fn(async ({ data }: { data: any }) => {
        commentSequence += 1;
        const createdAt = nextDate(data.createdAt);
        const record: CommunityCommentRecord = {
          id: toUuid(15_000 + commentSequence),
          postId: data.postId,
          authorId: data.authorId,
          content: data.content,
          status: data.status,
          deletedAt: data.deletedAt ?? null,
          createdAt,
          updatedAt: nextDate(data.updatedAt ?? createdAt),
        };
        comments.set(record.id, record);
        return buildCommentPayload(record);
      }),
    },
    communityPostFavorite: {
      findMany: jest.fn(
        async ({
          where,
          take,
          cursor,
          skip,
        }: {
          where?: any;
          take?: number;
          cursor?: { id: string };
          skip?: number;
        }) => {
          let records = [...favorites.values()].filter((favorite) => {
            if (
              where?.userId !== undefined &&
              favorite.userId !== where.userId
            ) {
              return false;
            }

            if (where?.postId?.in) {
              return where.postId.in.includes(favorite.postId);
            }

            if (where?.post) {
              const post = findPostById(favorite.postId);

              return Boolean(
                post &&
                matchesPostWhere(post, {
                  status: where.post.status,
                  deletedAt: where.post.deletedAt,
                }),
              );
            }

            return true;
          });

          records = records.sort((left, right) => {
            const timeDelta =
              right.createdAt.getTime() - left.createdAt.getTime();

            if (timeDelta !== 0) {
              return timeDelta;
            }

            return right.id.localeCompare(left.id);
          });

          const pagedRecords = applyCursor(
            records,
            cursor?.id,
            skip ?? 0,
          ).slice(0, take ?? records.length);

          if (where?.postId?.in) {
            return pagedRecords.map((record) => ({
              postId: record.postId,
            }));
          }

          return pagedRecords.map((record) => ({
            id: record.id,
            createdAt: record.createdAt,
            post: buildPostPayload(findPostById(record.postId)!),
          }));
        },
      ),
      createMany: jest.fn(
        async ({
          data,
        }: {
          data: Array<{ postId: string; userId: string }>;
        }) => {
          let count = 0;

          data.forEach((item) => {
            const key = favoriteKey(item.userId, item.postId);
            const existing = favorites.get(key);

            if (existing) {
              return;
            }

            favoriteSequence += 1;
            favorites.set(key, {
              id: toUuid(20_000 + favoriteSequence),
              postId: item.postId,
              userId: item.userId,
              createdAt: nextDate(),
            });
            count += 1;
          });

          return {
            count,
          };
        },
      ),
      deleteMany: jest.fn(async ({ where }: { where?: any }) => {
        const toDelete = [...favorites.entries()].filter(([, favorite]) => {
          if (where?.userId !== undefined && favorite.userId !== where.userId) {
            return false;
          }

          if (where?.postId !== undefined && favorite.postId !== where.postId) {
            return false;
          }

          return true;
        });

        toDelete.forEach(([key]) => {
          favorites.delete(key);
        });

        return {
          count: toDelete.length,
        };
      }),
      count: jest.fn(async ({ where }: { where?: any }) => {
        return [...favorites.values()].filter((favorite) => {
          if (where?.userId !== undefined && favorite.userId !== where.userId) {
            return false;
          }

          if (where?.post) {
            const post = findPostById(favorite.postId);

            return Boolean(
              post &&
              matchesPostWhere(post, {
                status: where.post.status,
                deletedAt: where.post.deletedAt,
              }),
            );
          }

          return true;
        }).length;
      }),
    },
    communityPostLike: {
      findMany: jest.fn(async ({ where }: { where?: any }) => {
        return [...likes.values()]
          .filter((like) => {
            if (where?.userId !== undefined && like.userId !== where.userId) {
              return false;
            }

            if (where?.postId?.in) {
              return where.postId.in.includes(like.postId);
            }

            return true;
          })
          .map((like) => ({ postId: like.postId }));
      }),
      createMany: jest.fn(
        async ({
          data,
        }: {
          data: Array<{ postId: string; userId: string }>;
        }) => {
          let count = 0;

          data.forEach((item) => {
            const key = likeKey(item.userId, item.postId);

            if (likes.has(key)) {
              return;
            }

            likeSequence += 1;
            likes.set(key, {
              id: toUuid(25_000 + likeSequence),
              postId: item.postId,
              userId: item.userId,
              createdAt: nextDate(),
            });
            count += 1;
          });

          return { count };
        },
      ),
      deleteMany: jest.fn(async ({ where }: { where?: any }) => {
        const toDelete = [...likes.entries()].filter(([, like]) => {
          if (where?.userId !== undefined && like.userId !== where.userId) {
            return false;
          }

          if (where?.postId !== undefined && like.postId !== where.postId) {
            return false;
          }

          return true;
        });

        toDelete.forEach(([key]) => likes.delete(key));
        return { count: toDelete.length };
      }),
    },
    communityPostViewHistory: {
      findUnique: jest.fn(async ({ where }: { where: any }) => {
        return (
          histories.get(
            historyKey(where.postId_userId.userId, where.postId_userId.postId),
          ) ?? null
        );
      }),
      upsert: jest.fn(
        async ({
          where,
          create,
          update,
        }: {
          where: any;
          create: any;
          update: any;
        }) => {
          const key = historyKey(
            where.postId_userId.userId,
            where.postId_userId.postId,
          );
          const existing = histories.get(key);

          if (!existing) {
            historySequence += 1;
            const created: CommunityHistoryRecord = {
              id: toUuid(30_000 + historySequence),
              postId: create.postId,
              userId: create.userId,
              firstViewedAt: create.firstViewedAt,
              lastViewedAt: create.lastViewedAt,
              viewCount: create.viewCount,
              createdAt: create.createdAt,
              updatedAt: create.updatedAt,
            };
            histories.set(key, created);
            return created;
          }

          const updatedRecord: CommunityHistoryRecord = {
            ...existing,
            lastViewedAt: update.lastViewedAt ?? existing.lastViewedAt,
            viewCount:
              update.viewCount?.increment !== undefined
                ? existing.viewCount + update.viewCount.increment
                : existing.viewCount,
            updatedAt: nextDate(),
          };
          histories.set(key, updatedRecord);
          return updatedRecord;
        },
      ),
      findMany: jest.fn(
        async ({
          where,
          take,
          cursor,
          skip,
        }: {
          where?: any;
          take?: number;
          cursor?: { id: string };
          skip?: number;
        }) => {
          const records = [...histories.values()]
            .filter((history) => {
              if (
                where?.userId !== undefined &&
                history.userId !== where.userId
              ) {
                return false;
              }

              if (where?.post) {
                const post = findPostById(history.postId);

                return Boolean(
                  post &&
                  matchesPostWhere(post, {
                    status: where.post.status,
                    deletedAt: where.post.deletedAt,
                  }),
                );
              }

              return true;
            })
            .sort((left, right) => {
              const timeDelta =
                right.lastViewedAt.getTime() - left.lastViewedAt.getTime();

              if (timeDelta !== 0) {
                return timeDelta;
              }

              return right.id.localeCompare(left.id);
            });

          return applyCursor(records, cursor?.id, skip ?? 0)
            .slice(0, take ?? records.length)
            .map((record) => ({
              id: record.id,
              firstViewedAt: record.firstViewedAt,
              lastViewedAt: record.lastViewedAt,
              viewCount: record.viewCount,
              post: buildPostPayload(findPostById(record.postId)!),
            }));
        },
      ),
      deleteMany: jest.fn(async ({ where }: { where?: any }) => {
        const toDelete = [...histories.entries()].filter(([, history]) => {
          if (where?.userId !== undefined && history.userId !== where.userId) {
            return false;
          }

          if (where?.postId !== undefined && history.postId !== where.postId) {
            return false;
          }

          return true;
        });

        toDelete.forEach(([key]) => {
          histories.delete(key);
        });

        return {
          count: toDelete.length,
        };
      }),
      count: jest.fn(async ({ where }: { where?: any }) => {
        return [...histories.values()].filter((history) => {
          if (where?.userId !== undefined && history.userId !== where.userId) {
            return false;
          }

          if (where?.post) {
            const post = findPostById(history.postId);

            return Boolean(
              post &&
              matchesPostWhere(post, {
                status: where.post.status,
                deletedAt: where.post.deletedAt,
              }),
            );
          }

          return true;
        }).length;
      }),
    },
    $transaction: jest.fn(async (callback: (tx: any) => Promise<any>) =>
      callback(prisma),
    ),
  };

  return {
    prisma,
    users,
    categories,
    posts,
    comments,
    favorites,
    likes,
    histories,
  };
}

describe('Community routes (e2e)', () => {
  let app: INestApplication<App>;
  let mockState: ReturnType<typeof createCommunityPrismaMock>;

  beforeEach(async () => {
    process.env.APP_ENV = 'test';
    process.env.PUBLIC_BASE_URL = TEST_PUBLIC_BASE_URL;
    mockState = createCommunityPrismaMock();
    mockState.users.set(USER_A.id, {
      id: USER_A.id,
      nickname: 'Author A',
      avatarUrl: 'https://cdn.example.com/a.png',
    });
    mockState.users.set(USER_B.id, {
      id: USER_B.id,
      nickname: 'Reader B',
      avatarUrl: 'https://cdn.example.com/b.png',
    });

    const authServiceMock = {
      validateAccessToken: jest.fn(async (token: string) => {
        if (token === USER_A_TOKEN) {
          return USER_A;
        }

        if (token === USER_B_TOKEN) {
          return USER_B;
        }

        throw new UnauthorizedException('ACCESS_TOKEN_INVALID');
      }),
      validateLogoutAccessToken: jest.fn(async (token: string) => {
        if (token === USER_A_TOKEN) {
          return USER_A;
        }

        if (token === USER_B_TOKEN) {
          return USER_B;
        }

        throw new UnauthorizedException('ACCESS_TOKEN_INVALID');
      }),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockState.prisma)
      .overrideProvider(AuthService)
      .useValue(authServiceMock)
      .compile();

    app = moduleFixture.createNestApplication();
    app.enableCors();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    jest.restoreAllMocks();

    if (originalAppEnvironment === undefined) {
      delete process.env.APP_ENV;
    } else {
      process.env.APP_ENV = originalAppEnvironment;
    }

    if (originalPublicBaseUrl === undefined) {
      delete process.env.PUBLIC_BASE_URL;
    } else {
      process.env.PUBLIC_BASE_URL = originalPublicBaseUrl;
    }
  });

  it.each(['development', 'test'] as const)(
    'keeps Community available in APP_ENV=%s',
    async (appEnvironment) => {
      process.env.APP_ENV = appEnvironment;

      const response = await request(app.getHttpServer())
        .get('/api/v1/community/categories')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toHaveLength(5);
    },
  );

  it.each(['production', 'trial'] as const)(
    'blocks every Community endpoint before service work in APP_ENV=%s',
    async (appEnvironment) => {
      process.env.APP_ENV = appEnvironment;
      const mkdirSpy = jest.spyOn(fs, 'mkdir').mockResolvedValue(undefined);
      const writeFileSpy = jest
        .spyOn(fs, 'writeFile')
        .mockResolvedValue(undefined);
      const postId = '33333333-3333-4333-8333-333333333333';
      const authenticated = (testRequest: request.Test) =>
        testRequest.set('Authorization', `Bearer ${USER_A_TOKEN}`);
      const requests = [
        () => request(app.getHttpServer()).get('/api/v1/community/categories'),
        () => request(app.getHttpServer()).get('/api/v1/community/posts'),
        () =>
          request(app.getHttpServer()).get(`/api/v1/community/posts/${postId}`),
        () =>
          request(app.getHttpServer()).get(
            `/api/v1/community/posts/${postId}/comments`,
          ),
        () =>
          authenticated(
            request(app.getHttpServer()).post('/api/v1/community/posts'),
          ).send({
            categoryKey: 'GENERAL',
            title: 'blocked post',
            content: 'blocked content',
          }),
        () =>
          authenticated(
            request(app.getHttpServer()).post('/api/v1/community/images'),
          ).attach('file', Buffer.from('blocked-image'), {
            filename: 'blocked.png',
            contentType: 'image/png',
          }),
        () =>
          authenticated(
            request(app.getHttpServer()).post(
              `/api/v1/community/posts/${postId}/comments`,
            ),
          ).send({ content: 'blocked comment' }),
        () =>
          authenticated(
            request(app.getHttpServer()).delete(
              `/api/v1/community/posts/${postId}`,
            ),
          ),
        () =>
          authenticated(
            request(app.getHttpServer()).post(
              `/api/v1/community/posts/${postId}/like`,
            ),
          ),
        () =>
          authenticated(
            request(app.getHttpServer()).delete(
              `/api/v1/community/posts/${postId}/like`,
            ),
          ),
        () =>
          authenticated(
            request(app.getHttpServer()).post(
              `/api/v1/community/posts/${postId}/favorite`,
            ),
          ),
        () =>
          authenticated(
            request(app.getHttpServer()).delete(
              `/api/v1/community/posts/${postId}/favorite`,
            ),
          ),
        () =>
          authenticated(
            request(app.getHttpServer()).get(
              '/api/v1/users/me/community/favorites',
            ),
          ),
        () =>
          authenticated(
            request(app.getHttpServer()).get(
              '/api/v1/users/me/community/history',
            ),
          ),
        () =>
          authenticated(
            request(app.getHttpServer()).delete(
              `/api/v1/users/me/community/history/${postId}`,
            ),
          ),
        () =>
          authenticated(
            request(app.getHttpServer()).delete(
              '/api/v1/users/me/community/history',
            ),
          ),
        () =>
          authenticated(
            request(app.getHttpServer()).get(
              '/api/v1/users/me/community/posts',
            ),
          ),
        () =>
          authenticated(
            request(app.getHttpServer()).get(
              '/api/v1/users/me/community/summary',
            ),
          ),
      ];

      for (const createRequest of requests) {
        const response = await createRequest().expect(503);

        expect(response.body).toEqual({
          success: false,
          error: {
            code: 'COMMUNITY_UNAVAILABLE',
            message: 'COMMUNITY_UNAVAILABLE',
          },
        });
      }

      expect(mockState.categories.size).toBe(0);
      expect(mockState.posts.size).toBe(0);
      expect(mockState.comments.size).toBe(0);
      expect(mockState.favorites.size).toBe(0);
      expect(mockState.likes.size).toBe(0);
      expect(mockState.histories.size).toBe(0);
      expect(mkdirSpy).not.toHaveBeenCalled();
      expect(writeFileSpy).not.toHaveBeenCalled();
    },
  );

  it('covers categories, post publishing, pagination, comments, favorites, history, summary, and soft delete', async () => {
    const categoriesResponse = await request(app.getHttpServer())
      .get('/api/v1/community/categories')
      .expect(200);

    expect(categoriesResponse.body.success).toBe(true);
    expect(
      categoriesResponse.body.data.items.map((item: any) => item.key),
    ).toEqual(['LEARNING', 'BATTLE', 'CODE_HELP', 'CAREER', 'GENERAL']);

    await request(app.getHttpServer())
      .post('/api/v1/community/posts')
      .send({
        categoryKey: 'LEARNING',
        title: 'Unauthorized post',
        content: 'No auth',
      })
      .expect(401);

    await request(app.getHttpServer())
      .post('/api/v1/community/posts')
      .set('Authorization', `Bearer ${USER_A_TOKEN}`)
      .send({
        categoryKey: 'LEARNING',
        title: '   ',
        content: 'Still invalid after trim',
      })
      .expect(400)
      .expect((response) => {
        expect(String(response.body.message)).toContain(
          'COMMUNITY_POST_TITLE_INVALID',
        );
      });

    const learningPost = await request(app.getHttpServer())
      .post('/api/v1/community/posts')
      .set('Authorization', `Bearer ${USER_A_TOKEN}`)
      .send({
        categoryKey: 'LEARNING',
        title: 'Learning tips',
        content: 'Practice every day.',
      })
      .expect(200);

    const battlePost = await request(app.getHttpServer())
      .post('/api/v1/community/posts')
      .set('Authorization', `Bearer ${USER_A_TOKEN}`)
      .send({
        categoryKey: 'BATTLE',
        title: 'Battle notes',
        contentBlocks: [
          {
            type: 'TEXT',
            text: 'Study tactics before joining ranked matches.',
          },
          {
            type: 'CODE',
            language: 'JavaScript',
            code: 'const ready = true;\nconsole.info(ready);',
          },
          ...Array.from({ length: 7 }, (_, index) => ({
            type: 'IMAGE',
            objectKey: `${USER_A.id}/battle-${index + 1}.png`,
            url: `${TEST_PUBLIC_BASE_URL}/uploads/community/${USER_A.id}/battle-${index + 1}.png`,
          })),
        ],
      })
      .expect(200);

    const learningPostId = learningPost.body.data.postId as string;
    const battlePostId = battlePost.body.data.postId as string;

    await request(app.getHttpServer())
      .get(`/api/v1/community/posts/${battlePostId}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.data.contentBlocks).toHaveLength(9);
        expect(response.body.data.contentBlocks[1]).toMatchObject({
          type: 'CODE',
          language: 'JavaScript',
        });
        expect(
          response.body.data.contentBlocks.filter(
            (block: { type: string }) => block.type === 'IMAGE',
          ),
        ).toHaveLength(7);
        expect(response.body.data.contentBlocks[2].url).toBe(
          `${TEST_PUBLIC_BASE_URL}/uploads/community/${USER_A.id}/battle-1.png`,
        );
      });

    const firstPage = await request(app.getHttpServer())
      .get('/api/v1/community/posts?limit=1')
      .expect(200);

    expect(firstPage.body.success).toBe(true);
    expect(firstPage.body.data.items).toHaveLength(1);
    expect(firstPage.body.data.hasMore).toBe(true);
    expect(typeof firstPage.body.data.nextCursor).toBe('string');

    const secondPage = await request(app.getHttpServer())
      .get(
        `/api/v1/community/posts?limit=1&cursor=${encodeURIComponent(firstPage.body.data.nextCursor as string)}`,
      )
      .expect(200);

    expect(secondPage.body.data.items).toHaveLength(1);
    expect(
      new Set([
        firstPage.body.data.items[0].postId,
        secondPage.body.data.items[0].postId,
      ]),
    ).toEqual(new Set([learningPostId, battlePostId]));

    await request(app.getHttpServer())
      .get('/api/v1/community/posts?categoryKey=BATTLE')
      .expect(200)
      .expect((response) => {
        expect(response.body.data.items).toHaveLength(1);
        expect(response.body.data.items[0].postId).toBe(battlePostId);
      });

    await request(app.getHttpServer())
      .get(`/api/v1/community/posts/${learningPostId}/comments`)
      .expect(200)
      .expect((response) => {
        expect(response.body.data.items).toEqual([]);
      });

    await request(app.getHttpServer())
      .post(`/api/v1/community/posts/${learningPostId}/comments`)
      .send({
        content: 'Need auth',
      })
      .expect(401);

    await request(app.getHttpServer())
      .post(`/api/v1/community/posts/${learningPostId}/comments`)
      .set('Authorization', `Bearer ${USER_B_TOKEN}`)
      .send({
        content: '   ',
      })
      .expect(400)
      .expect((response) => {
        expect(String(response.body.message)).toContain(
          'COMMUNITY_COMMENT_CONTENT_INVALID',
        );
      });

    await request(app.getHttpServer())
      .post(`/api/v1/community/posts/${learningPostId}/comments`)
      .set('Authorization', `Bearer ${USER_B_TOKEN}`)
      .send({
        content: 'x'.repeat(1001),
      })
      .expect(400)
      .expect((response) => {
        expect(String(response.body.message)).toContain(
          'COMMUNITY_COMMENT_CONTENT_INVALID',
        );
      });

    const createCommentResponse = await request(app.getHttpServer())
      .post(`/api/v1/community/posts/${learningPostId}/comments`)
      .set('Authorization', `Bearer ${USER_B_TOKEN}`)
      .send({
        content: ' First useful comment. ',
      })
      .expect(200);

    expect(createCommentResponse.body.data.comment.content).toBe(
      'First useful comment.',
    );
    expect(createCommentResponse.body.data.comment.isAuthor).toBe(true);
    expect(createCommentResponse.body.data.commentCount).toBe(1);

    await request(app.getHttpServer())
      .get(`/api/v1/community/posts/${learningPostId}/comments`)
      .expect(200)
      .expect((response) => {
        expect(response.body.data.items).toHaveLength(1);
        expect(response.body.data.items[0].content).toBe(
          'First useful comment.',
        );
        expect(response.body.data.items[0].author.userId).toBe(USER_B.id);
      });

    await request(app.getHttpServer())
      .get(`/api/v1/community/posts/${learningPostId}`)
      .set('Authorization', `Bearer ${USER_B_TOKEN}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.data.postId).toBe(learningPostId);
        expect(response.body.data.viewCount).toBe(1);
        expect(response.body.data.viewerHasFavorited).toBe(false);
        expect(response.body.data.commentCount).toBe(1);
      });

    await request(app.getHttpServer())
      .post(`/api/v1/community/posts/${learningPostId}/like`)
      .set('Authorization', `Bearer ${USER_B_TOKEN}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.data.viewerHasLiked).toBe(true);
        expect(response.body.data.likeCount).toBe(1);
      });

    await request(app.getHttpServer())
      .post(`/api/v1/community/posts/${learningPostId}/like`)
      .set('Authorization', `Bearer ${USER_B_TOKEN}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.data.likeCount).toBe(1);
      });

    await request(app.getHttpServer())
      .get('/api/v1/community/posts?sort=mostLiked')
      .expect(200)
      .expect((response) => {
        expect(response.body.data.items[0].postId).toBe(learningPostId);
      });

    await request(app.getHttpServer())
      .delete(`/api/v1/community/posts/${learningPostId}/like`)
      .set('Authorization', `Bearer ${USER_B_TOKEN}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.data.viewerHasLiked).toBe(false);
        expect(response.body.data.likeCount).toBe(0);
      });

    await request(app.getHttpServer())
      .get(`/api/v1/community/posts/${learningPostId}`)
      .set('Authorization', `Bearer ${USER_B_TOKEN}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.data.viewCount).toBe(1);
      });

    await request(app.getHttpServer())
      .post(`/api/v1/community/posts/${learningPostId}/favorite`)
      .set('Authorization', `Bearer ${USER_B_TOKEN}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.data.viewerHasFavorited).toBe(true);
        expect(response.body.data.favoriteCount).toBe(1);
      });

    await request(app.getHttpServer())
      .post(`/api/v1/community/posts/${learningPostId}/favorite`)
      .set('Authorization', `Bearer ${USER_B_TOKEN}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.data.viewerHasFavorited).toBe(true);
        expect(response.body.data.favoriteCount).toBe(1);
      });

    await request(app.getHttpServer())
      .get('/api/v1/users/me/community/favorites')
      .set('Authorization', `Bearer ${USER_B_TOKEN}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.data.items).toHaveLength(1);
        expect(response.body.data.items[0].post.postId).toBe(learningPostId);
      });

    await request(app.getHttpServer())
      .get('/api/v1/users/me/community/history')
      .set('Authorization', `Bearer ${USER_B_TOKEN}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.data.items).toHaveLength(1);
        expect(response.body.data.items[0].post.postId).toBe(learningPostId);
        expect(response.body.data.items[0].personalViewCount).toBe(2);
      });

    await request(app.getHttpServer())
      .get('/api/v1/users/me/community/posts')
      .set('Authorization', `Bearer ${USER_A_TOKEN}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.data.items).toHaveLength(2);
      });

    await request(app.getHttpServer())
      .get('/api/v1/users/me/community/summary')
      .set('Authorization', `Bearer ${USER_B_TOKEN}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.data).toEqual({
          postCount: 0,
          favoriteCount: 1,
          historyCount: 1,
        });
      });

    await request(app.getHttpServer())
      .delete(`/api/v1/community/posts/${learningPostId}`)
      .set('Authorization', `Bearer ${USER_B_TOKEN}`)
      .expect(403);

    await request(app.getHttpServer())
      .delete(`/api/v1/community/posts/${learningPostId}`)
      .set('Authorization', `Bearer ${USER_A_TOKEN}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.data.postId).toBe(learningPostId);
      });

    await request(app.getHttpServer())
      .get(`/api/v1/community/posts/${learningPostId}`)
      .expect(404);

    await request(app.getHttpServer())
      .get('/api/v1/users/me/community/favorites')
      .set('Authorization', `Bearer ${USER_B_TOKEN}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.data.items).toEqual([]);
      });

    await request(app.getHttpServer())
      .get('/api/v1/users/me/community/history')
      .set('Authorization', `Bearer ${USER_B_TOKEN}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.data.items).toEqual([]);
      });

    await request(app.getHttpServer())
      .get('/api/v1/users/me/community/summary')
      .set('Authorization', `Bearer ${USER_A_TOKEN}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.data).toEqual({
          postCount: 1,
          favoriteCount: 0,
          historyCount: 0,
        });
      });
  });

  it('deletes single history items and clears only the current user history', async () => {
    const createdPost = await request(app.getHttpServer())
      .post('/api/v1/community/posts')
      .set('Authorization', `Bearer ${USER_A_TOKEN}`)
      .send({
        categoryKey: 'GENERAL',
        title: 'Shared post',
        content: 'Visible to both users.',
      })
      .expect(200);

    const postId = createdPost.body.data.postId as string;

    await request(app.getHttpServer())
      .get(`/api/v1/community/posts/${postId}`)
      .set('Authorization', `Bearer ${USER_A_TOKEN}`)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/api/v1/community/posts/${postId}`)
      .set('Authorization', `Bearer ${USER_B_TOKEN}`)
      .expect(200);

    await request(app.getHttpServer())
      .delete(`/api/v1/users/me/community/history/${postId}`)
      .set('Authorization', `Bearer ${USER_B_TOKEN}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.data.deletedCount).toBe(1);
      });

    await request(app.getHttpServer())
      .get('/api/v1/users/me/community/history')
      .set('Authorization', `Bearer ${USER_B_TOKEN}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.data.items).toEqual([]);
      });

    await request(app.getHttpServer())
      .get('/api/v1/users/me/community/history')
      .set('Authorization', `Bearer ${USER_A_TOKEN}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.data.items).toHaveLength(1);
      });

    await request(app.getHttpServer())
      .get(`/api/v1/community/posts/${postId}`)
      .set('Authorization', `Bearer ${USER_B_TOKEN}`)
      .expect(200);

    await request(app.getHttpServer())
      .delete('/api/v1/users/me/community/history')
      .set('Authorization', `Bearer ${USER_B_TOKEN}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.data.deletedCount).toBe(1);
      });

    await request(app.getHttpServer())
      .get('/api/v1/users/me/community/history')
      .set('Authorization', `Bearer ${USER_B_TOKEN}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.data.items).toEqual([]);
      });

    await request(app.getHttpServer())
      .get('/api/v1/users/me/community/history')
      .set('Authorization', `Bearer ${USER_A_TOKEN}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.data.items).toHaveLength(1);
      });
  });
});
