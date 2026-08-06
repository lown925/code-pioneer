import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import { extname, join } from 'path';
import { type CurrentUserContext } from '../auth/auth.types';
import { getUploadStorageRoot } from '../environment/environment.config';
import { PrismaService } from '../prisma/prisma.service';
import {
  COMMUNITY_DEFAULT_CATEGORIES,
  COMMUNITY_POST_LIMIT_DEFAULT,
  COMMUNITY_POST_LIMIT_MAX,
  COMMUNITY_RECOMMENDATION_BUCKET_MS,
  COMMUNITY_RECOMMENDATION_WEIGHTS,
  COMMUNITY_VIEW_COUNT_WINDOW_MS,
  type CommunityCategoryKey,
} from './community.constants';
import {
  decodeCommunityCursor,
  encodeCommunityCursor,
  previewCommunityText,
  toCommunityImagePreview,
  trimCommunityText,
} from './community.utils';
import type {
  CommunityAuthorPayload,
  CommunityCategoryPayload,
  CommunityCommentPayload,
  CommunityCommentStatusValue,
  CommunityCommentsResponse,
  CommunityCreateCommentResponse,
  CommunityCreatePostResponse,
  CommunityCursorPage,
  CommunityFavoriteListItemPayload,
  CommunityHistoryListItemPayload,
  CommunityMyPostListItemPayload,
  CommunityPostCategoryPayload,
  CommunityPostContentBlockPayload,
  CommunityPostDetailPayload,
  CommunityPostImagePayload,
  CommunityPostListItemPayload,
  CommunityStatusValue,
  CommunityPostStatusValue,
  CommunitySummaryPayload,
  CommunityUploadImageResponse,
  CommunityLikeMutationResponse,
} from './community.types';
import { CreateCommunityCommentDto } from './dto/create-community-comment.dto';
import {
  CreateCommunityPostDto,
  type CreateCommunityPostContentBlockDto,
  type CreateCommunityPostImageDto,
} from './dto/create-community-post.dto';
import { CommunityPostsQueryDto, CommunityUserPostsQueryDto, CommunityCursorQueryDto } from './dto/community-posts-query.dto';

type CommunityCategoryRecord = {
  id: string;
  key: string;
  name: string;
  description: string | null;
  sortOrder: number;
  status: CommunityStatusValue;
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
  status: CommunityPostStatusValue;
  recommendationScore: number;
  likeCount: number;
  commentCount: number;
  favoriteCount: number;
  viewCount: number;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    nickname: string | null;
    avatarUrl: string | null;
  };
  category: {
    id: string;
    key: string;
    name: string;
    description: string | null;
    sortOrder: number;
    status: CommunityStatusValue;
  };
  images: Array<{
    id: string;
    objectKey: string | null;
    url: string;
    width: number | null;
    height: number | null;
    sortOrder: number;
  }>;
};

type CommunityFavoriteRecord = {
  id: string;
  createdAt: Date;
  post: CommunityPostRecord;
};

type CommunityCommentRecord = {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  status: CommunityCommentStatusValue;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    nickname: string | null;
    avatarUrl: string | null;
  };
};

type CommunityHistoryRecord = {
  id: string;
  firstViewedAt: Date;
  lastViewedAt: Date;
  viewCount: number;
  post: CommunityPostRecord;
};

type CommunityPostCursor = {
  id: string;
};

type CommunityCategoryLookup = {
  id: string;
  key: string;
  status: CommunityStatusValue;
};

type UploadedCommunityImageFile = {
  buffer: Buffer;
  size: number;
  mimetype: string;
  originalname: string;
};

const COMMUNITY_CATEGORY_STATUS = {
  ENABLED: 'ENABLED' as const,
  DISABLED: 'DISABLED' as const,
};

const COMMUNITY_POST_STATUS = {
  PUBLISHED: 'PUBLISHED' as const,
  HIDDEN: 'HIDDEN' as const,
  DELETED: 'DELETED' as const,
};

const COMMUNITY_COMMENT_STATUS = {
  PUBLISHED: 'PUBLISHED' as const,
  HIDDEN: 'HIDDEN' as const,
  DELETED: 'DELETED' as const,
};

const COMMUNITY_UPLOAD_DIR = join(getUploadStorageRoot(), 'community');
const COMMUNITY_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);
const COMMUNITY_IMAGE_EXTENSIONS = new Map<string, string>([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
  ['image/gif', '.gif'],
]);
const COMMUNITY_IMAGE_MAX_SIZE_BYTES = 5 * 1024 * 1024;
const COMMUNITY_POST_SELECT = {
  id: true,
  authorId: true,
  categoryId: true,
  title: true,
  content: true,
  contentBlocks: true,
  status: true,
  recommendationScore: true,
  likeCount: true,
  commentCount: true,
  favoriteCount: true,
  viewCount: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
  author: {
    select: {
      id: true,
      nickname: true,
      avatarUrl: true,
    },
  },
  category: {
    select: {
      id: true,
      key: true,
      name: true,
      description: true,
      sortOrder: true,
      status: true,
    },
  },
  images: {
    orderBy: {
      sortOrder: 'asc' as const,
    },
    select: {
      id: true,
      objectKey: true,
      url: true,
      width: true,
      height: true,
      sortOrder: true,
    },
  },
} as const;

@Injectable()
export class CommunityService {
  private ensureDefaultCategoriesPromise: Promise<void> | null = null;

  constructor(private readonly prisma: PrismaService) {}

  private get communityDb(): any {
    return this.prisma as any;
  }

  async getCategories() {
    await this.ensureDefaultCategories();

    const categories = (await this.communityDb.communityCategory.findMany({
      where: {
        status: COMMUNITY_CATEGORY_STATUS.ENABLED,
      },
      orderBy: [
        {
          sortOrder: 'asc',
        },
        {
          createdAt: 'asc',
        },
      ],
    })) as CommunityCategoryRecord[];

    return {
      success: true as const,
      data: {
        items: categories.map((category) => this.toCategoryPayload(category)),
      },
    };
  }

  async getPosts(currentUser: CurrentUserContext | null, query: CommunityPostsQueryDto) {
    await this.ensureDefaultCategories();

    const limit = this.normalizeLimit(query.limit);
    const category = query.categoryKey
      ? await this.resolveCategory(query.categoryKey)
      : null;
    const cursor = decodeCommunityCursor(query.cursor);
    const where = this.buildVisiblePostWhere({
      categoryId: category?.id,
    });

    const records = (await this.communityDb.communityPost.findMany({
      where,
      orderBy: this.getPostOrderBy(query.sort),
      take: limit + 1,
      ...(cursor
        ? {
            cursor: {
              id: cursor.id,
            },
            skip: 1,
          }
        : {}),
      select: COMMUNITY_POST_SELECT,
    })) as CommunityPostRecord[];

    const hasMore = records.length > limit;
    const visibleRecords = hasMore ? records.slice(0, limit) : records;
    const favoriteState = await this.loadFavoriteState(
      currentUser,
      visibleRecords.map((record) => record.id),
    );

    return {
      success: true as const,
      data: this.toCursorPage(
        visibleRecords.map((record) =>
          this.toPostListItem(record, favoriteState.has(record.id), currentUser),
        ),
        hasMore,
        visibleRecords,
      ),
    };
  }

  async createPost(currentUser: CurrentUserContext, dto: CreateCommunityPostDto) {
    await this.ensureDefaultCategories();

    const title = trimCommunityText(dto.title);
    const normalizedContent = this.normalizeCreatePostContent(currentUser, dto);

    if (title.length < 2 || title.length > 80) {
      throw new BadRequestException('COMMUNITY_POST_TITLE_INVALID');
    }

    const category = await this.resolveCategory(dto.categoryKey, true);
    const createdAt = new Date();

    const post = await this.communityDb.communityPost.create({
      data: {
        authorId: currentUser.id,
        categoryId: category.id,
        title,
        content: normalizedContent.content,
        contentBlocks: normalizedContent.contentBlocks,
        status: COMMUNITY_POST_STATUS.PUBLISHED,
        recommendationScore: this.getRecommendationBaseScore(createdAt),
        deletedAt: null,
        createdAt,
        updatedAt: createdAt,
        ...(normalizedContent.images.length > 0
          ? {
              images: {
                create: normalizedContent.images.map((image, index) => ({
                  objectKey: image.objectKey,
                  url: this.buildUploadedImageUrl(image.objectKey),
                  width: null,
                  height: null,
                  sortOrder: index,
                })),
              },
            }
          : {}),
      },
      select: {
        id: true,
        createdAt: true,
      },
    });

    return {
      success: true as const,
      data: {
        postId: post.id,
        createdAt: post.createdAt,
      } satisfies CommunityCreatePostResponse,
    };
  }

  async uploadImage(
    currentUser: CurrentUserContext,
    file: UploadedCommunityImageFile,
  ) {
    if (!COMMUNITY_IMAGE_MIME_TYPES.has(file.mimetype)) {
      throw new BadRequestException('COMMUNITY_IMAGE_TYPE_INVALID');
    }

    if (!file.buffer || file.size <= 0) {
      throw new BadRequestException('COMMUNITY_IMAGE_FILE_REQUIRED');
    }

    if (file.size > COMMUNITY_IMAGE_MAX_SIZE_BYTES) {
      throw new BadRequestException('COMMUNITY_IMAGE_TOO_LARGE');
    }

    await fs.mkdir(COMMUNITY_UPLOAD_DIR, { recursive: true });

    const extension =
      COMMUNITY_IMAGE_EXTENSIONS.get(file.mimetype) ||
      extname(file.originalname || '').toLowerCase() ||
      '.bin';
    const objectKey = `${currentUser.id}/${Date.now()}-${randomUUID()}${extension}`;
    const absolutePath = join(COMMUNITY_UPLOAD_DIR, objectKey);

    await fs.mkdir(join(COMMUNITY_UPLOAD_DIR, currentUser.id), {
      recursive: true,
    });
    await fs.writeFile(absolutePath, file.buffer);

    return {
      success: true as const,
      data: {
        image: {
          objectKey,
          url: this.buildUploadedImageUrl(objectKey),
          width: null,
          height: null,
        },
      } satisfies CommunityUploadImageResponse,
    };
  }

  async getPostDetail(
    currentUser: CurrentUserContext | null,
    postId: string,
  ) {
    await this.ensureDefaultCategories();

    const post = await this.loadVisiblePost(postId);

    if (!post) {
      throw new NotFoundException('COMMUNITY_POST_NOT_FOUND');
    }

    const [viewerHasFavorited, viewerHasLiked] = await Promise.all([
      this.loadFavoriteState(currentUser, [post.id]).then((set) =>
        set.has(post.id),
      ),
      this.loadLikeState(currentUser, [post.id]).then((set) =>
        set.has(post.id),
      ),
    ]);

    let viewCount = post.viewCount;
    if (currentUser) {
      const now = new Date();

      const result = await this.prisma.$transaction(async (tx) => {
        const communityTx = tx as any;
        const currentPost = (await communityTx.communityPost.findFirst({
          where: {
            id: post.id,
            status: COMMUNITY_POST_STATUS.PUBLISHED,
            deletedAt: null,
          },
          select: {
            id: true,
            viewCount: true,
          },
        })) as { id: string; viewCount: number } | null;

        if (!currentPost) {
          return {
            history: null,
            shouldIncrementViewCount: false,
            nextViewCount: viewCount,
          };
        }

        const existingHistory = await communityTx.communityPostViewHistory.findUnique({
          where: {
            postId_userId: {
              postId: post.id,
              userId: currentUser.id,
            },
          },
        });

        const shouldIncrementViewCount =
          !existingHistory ||
          now.getTime() - existingHistory.lastViewedAt.getTime() >=
            COMMUNITY_VIEW_COUNT_WINDOW_MS;

        const history = await communityTx.communityPostViewHistory.upsert({
          where: {
            postId_userId: {
              postId: post.id,
              userId: currentUser.id,
            },
          },
          create: {
            postId: post.id,
            userId: currentUser.id,
            firstViewedAt: now,
            lastViewedAt: now,
            viewCount: 1,
            createdAt: now,
            updatedAt: now,
          },
          update: {
            lastViewedAt: now,
            viewCount: {
              increment: 1,
            },
          },
        });

        let nextViewCount = currentPost.viewCount;

        if (shouldIncrementViewCount) {
          const updatedPost = await communityTx.communityPost.update({
            where: {
              id: post.id,
            },
            data: {
              viewCount: {
                increment: 1,
              },
            },
            select: {
              viewCount: true,
            },
          });

          nextViewCount = updatedPost.viewCount;
        }

        return {
          history,
          shouldIncrementViewCount,
          nextViewCount,
        };
      });

      viewCount = result.nextViewCount;
    }

    return {
      success: true as const,
      data: this.toPostDetailItem(
        post,
        viewerHasFavorited,
        currentUser,
        viewCount,
        viewerHasLiked,
      ),
    };
  }

  async deletePost(currentUser: CurrentUserContext, postId: string) {
    await this.ensureDefaultCategories();

    const post = (await this.communityDb.communityPost.findFirst({
      where: {
        id: postId,
      },
      select: {
        id: true,
        authorId: true,
        deletedAt: true,
      },
    })) as { id: string; authorId: string; deletedAt: Date | null } | null;

    if (!post) {
      throw new NotFoundException('COMMUNITY_POST_NOT_FOUND');
    }

    if (post.authorId !== currentUser.id) {
      throw new ForbiddenException('COMMUNITY_POST_FORBIDDEN');
    }

    if (post.deletedAt) {
      return {
        success: true as const,
        data: {
          postId: post.id,
          deletedAt: post.deletedAt,
        },
      };
    }

    const deletedAt = new Date();

    await this.communityDb.communityPost.update({
      where: {
        id: post.id,
      },
      data: {
        status: COMMUNITY_POST_STATUS.DELETED,
        deletedAt,
      },
    });

    return {
      success: true as const,
      data: {
        postId: post.id,
        deletedAt,
      },
    };
  }

  async getComments(
    currentUser: CurrentUserContext | null,
    postId: string,
  ) {
    await this.ensureDefaultCategories();

    const post = await this.loadVisiblePost(postId);

    if (!post) {
      throw new NotFoundException('COMMUNITY_POST_NOT_FOUND');
    }

    const records = (await this.communityDb.communityComment.findMany({
      where: {
        postId: post.id,
        status: COMMUNITY_COMMENT_STATUS.PUBLISHED,
        deletedAt: null,
      },
      orderBy: [
        {
          createdAt: 'asc',
        },
        {
          id: 'asc',
        },
      ],
      select: {
        id: true,
        postId: true,
        authorId: true,
        content: true,
        status: true,
        deletedAt: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            id: true,
            nickname: true,
            avatarUrl: true,
          },
        },
      },
    })) as CommunityCommentRecord[];

    return {
      success: true as const,
      data: {
        items: records.map((record) =>
          this.toCommentPayload(record, currentUser),
        ),
      } satisfies CommunityCommentsResponse,
    };
  }

  async createComment(
    currentUser: CurrentUserContext,
    postId: string,
    dto: CreateCommunityCommentDto,
  ) {
    await this.ensureDefaultCategories();

    const content = trimCommunityText(dto.content);

    if (content.length < 1 || content.length > 1000) {
      throw new BadRequestException('COMMUNITY_COMMENT_CONTENT_INVALID');
    }

    const post = await this.loadVisiblePost(postId);

    if (!post) {
      throw new NotFoundException('COMMUNITY_POST_NOT_FOUND');
    }

    const now = new Date();

    const result = await this.prisma.$transaction(async (tx) => {
      const communityTx = tx as any;
      const currentPost = (await communityTx.communityPost.findFirst({
        where: {
          id: post.id,
          status: COMMUNITY_POST_STATUS.PUBLISHED,
          deletedAt: null,
        },
        select: {
          id: true,
          commentCount: true,
        },
      })) as { id: string; commentCount: number } | null;

      if (!currentPost) {
        throw new NotFoundException('COMMUNITY_POST_NOT_FOUND');
      }

      const comment = (await communityTx.communityComment.create({
        data: {
          postId: post.id,
          authorId: currentUser.id,
          content,
          status: COMMUNITY_COMMENT_STATUS.PUBLISHED,
          deletedAt: null,
          createdAt: now,
          updatedAt: now,
        },
        select: {
          id: true,
          postId: true,
          authorId: true,
          content: true,
          status: true,
          deletedAt: true,
          createdAt: true,
          updatedAt: true,
          author: {
            select: {
              id: true,
              nickname: true,
              avatarUrl: true,
            },
          },
        },
      })) as CommunityCommentRecord;

      const updatedPost = await communityTx.communityPost.update({
        where: {
          id: post.id,
        },
        data: {
          commentCount: {
            increment: 1,
          },
          recommendationScore: {
            increment: COMMUNITY_RECOMMENDATION_WEIGHTS.COMMENT,
          },
        },
        select: {
          commentCount: true,
        },
      });

      return {
        comment,
        commentCount: updatedPost.commentCount,
      };
    });

    return {
      success: true as const,
      data: {
        comment: this.toCommentPayload(result.comment, currentUser),
        commentCount: result.commentCount,
      } satisfies CommunityCreateCommentResponse,
    };
  }

  async favoritePost(currentUser: CurrentUserContext, postId: string) {
    await this.ensureDefaultCategories();

    const post = await this.loadVisiblePost(postId);

    if (!post) {
      throw new NotFoundException('COMMUNITY_POST_NOT_FOUND');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const communityTx = tx as any;
      const created = await communityTx.communityPostFavorite.createMany({
        data: [
          {
            postId: post.id,
            userId: currentUser.id,
          },
        ],
        skipDuplicates: true,
      });

      let nextFavoriteCount = post.favoriteCount;

      if (created.count > 0) {
        const updated = await communityTx.communityPost.update({
          where: {
            id: post.id,
          },
          data: {
            favoriteCount: {
              increment: 1,
            },
            recommendationScore: {
              increment: COMMUNITY_RECOMMENDATION_WEIGHTS.FAVORITE,
            },
          },
          select: {
            favoriteCount: true,
          },
        });

        nextFavoriteCount = updated.favoriteCount;
      }

      return {
        viewerHasFavorited: true,
        favoriteCount: nextFavoriteCount,
      };
    });

    return {
      success: true as const,
      data: {
        postId: post.id,
        viewerHasFavorited: result.viewerHasFavorited,
        favoriteCount: result.favoriteCount,
      },
    };
  }

  async unfavoritePost(currentUser: CurrentUserContext, postId: string) {
    await this.ensureDefaultCategories();

    const post = await this.loadVisiblePost(postId);

    if (!post) {
      throw new NotFoundException('COMMUNITY_POST_NOT_FOUND');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const communityTx = tx as any;
      const deleted = await communityTx.communityPostFavorite.deleteMany({
        where: {
          postId: post.id,
          userId: currentUser.id,
        },
      });

      let nextFavoriteCount = post.favoriteCount;

      if (deleted.count > 0) {
        const updated = await communityTx.communityPost.update({
          where: {
            id: post.id,
          },
          data: {
            favoriteCount: {
              decrement: 1,
            },
            recommendationScore: {
              decrement: COMMUNITY_RECOMMENDATION_WEIGHTS.FAVORITE,
            },
          },
          select: {
            favoriteCount: true,
          },
        });

        nextFavoriteCount = updated.favoriteCount;
      }

      return {
        viewerHasFavorited: false,
        favoriteCount: nextFavoriteCount,
      };
    });

    return {
      success: true as const,
      data: {
        postId: post.id,
        viewerHasFavorited: result.viewerHasFavorited,
        favoriteCount: result.favoriteCount,
      },
    };
  }

  async likePost(currentUser: CurrentUserContext, postId: string) {
    await this.ensureDefaultCategories();

    const post = await this.loadVisiblePost(postId);

    if (!post) {
      throw new NotFoundException('COMMUNITY_POST_NOT_FOUND');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const communityTx = tx as any;
      const created = await communityTx.communityPostLike.createMany({
        data: [
          {
            postId: post.id,
            userId: currentUser.id,
          },
        ],
        skipDuplicates: true,
      });
      let nextLikeCount = post.likeCount;

      if (created.count > 0) {
        const updated = await communityTx.communityPost.update({
          where: {
            id: post.id,
          },
          data: {
            likeCount: {
              increment: 1,
            },
            recommendationScore: {
              increment: COMMUNITY_RECOMMENDATION_WEIGHTS.LIKE,
            },
          },
          select: {
            likeCount: true,
          },
        });

        nextLikeCount = updated.likeCount;
      }

      return {
        viewerHasLiked: true,
        likeCount: nextLikeCount,
      };
    });

    return {
      success: true as const,
      data: {
        postId: post.id,
        viewerHasLiked: result.viewerHasLiked,
        likeCount: result.likeCount,
      } satisfies CommunityLikeMutationResponse,
    };
  }

  async unlikePost(currentUser: CurrentUserContext, postId: string) {
    await this.ensureDefaultCategories();

    const post = await this.loadVisiblePost(postId);

    if (!post) {
      throw new NotFoundException('COMMUNITY_POST_NOT_FOUND');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const communityTx = tx as any;
      const deleted = await communityTx.communityPostLike.deleteMany({
        where: {
          postId: post.id,
          userId: currentUser.id,
        },
      });
      let nextLikeCount = post.likeCount;

      if (deleted.count > 0) {
        const updated = await communityTx.communityPost.update({
          where: {
            id: post.id,
          },
          data: {
            likeCount: {
              decrement: 1,
            },
            recommendationScore: {
              decrement: COMMUNITY_RECOMMENDATION_WEIGHTS.LIKE,
            },
          },
          select: {
            likeCount: true,
          },
        });

        nextLikeCount = updated.likeCount;
      }

      return {
        viewerHasLiked: false,
        likeCount: nextLikeCount,
      };
    });

    return {
      success: true as const,
      data: {
        postId: post.id,
        viewerHasLiked: result.viewerHasLiked,
        likeCount: result.likeCount,
      } satisfies CommunityLikeMutationResponse,
    };
  }

  async getMyFavorites(
    currentUser: CurrentUserContext,
    query: CommunityCursorQueryDto,
  ) {
    const limit = this.normalizeLimit(query.limit);
    const cursor = decodeCommunityCursor(query.cursor);

    const records = (await this.communityDb.communityPostFavorite.findMany({
      where: {
        userId: currentUser.id,
        post: {
          status: COMMUNITY_POST_STATUS.PUBLISHED,
          deletedAt: null,
        },
      },
      orderBy: [
        {
          createdAt: 'desc',
        },
        {
          id: 'desc',
        },
      ],
      take: limit + 1,
      ...(cursor
        ? {
            cursor: {
              id: cursor.id,
            },
            skip: 1,
          }
        : {}),
      select: {
        id: true,
        createdAt: true,
        post: {
          select: COMMUNITY_POST_SELECT,
        },
      },
    })) as CommunityFavoriteRecord[];

    const hasMore = records.length > limit;
    const visibleRecords = hasMore ? records.slice(0, limit) : records;
    const favoriteState = await this.loadFavoriteState(
      currentUser,
      visibleRecords.map((record) => record.post.id),
    );

    return {
      success: true as const,
      data: this.toCursorPage(
        visibleRecords.map((record) => ({
          favoritedAt: record.createdAt,
          post: this.toPostListItem(
            record.post,
            favoriteState.has(record.post.id),
            currentUser,
          ),
        })) satisfies CommunityFavoriteListItemPayload[],
        hasMore,
        visibleRecords,
      ),
    };
  }

  async getMyHistory(
    currentUser: CurrentUserContext,
    query: CommunityCursorQueryDto,
  ) {
    const limit = this.normalizeLimit(query.limit);
    const cursor = decodeCommunityCursor(query.cursor);

    const records = (await this.communityDb.communityPostViewHistory.findMany({
      where: {
        userId: currentUser.id,
        post: {
          status: COMMUNITY_POST_STATUS.PUBLISHED,
          deletedAt: null,
        },
      },
      orderBy: [
        {
          lastViewedAt: 'desc',
        },
        {
          id: 'desc',
        },
      ],
      take: limit + 1,
      ...(cursor
        ? {
            cursor: {
              id: cursor.id,
            },
            skip: 1,
          }
        : {}),
      select: {
        id: true,
        firstViewedAt: true,
        lastViewedAt: true,
        viewCount: true,
        post: {
          select: COMMUNITY_POST_SELECT,
        },
      },
    })) as CommunityHistoryRecord[];

    const hasMore = records.length > limit;
    const visibleRecords = hasMore ? records.slice(0, limit) : records;
    const favoriteState = await this.loadFavoriteState(
      currentUser,
      visibleRecords.map((record) => record.post.id),
    );

    return {
      success: true as const,
      data: this.toCursorPage(
        visibleRecords.map((record) => ({
          firstViewedAt: record.firstViewedAt,
          lastViewedAt: record.lastViewedAt,
          personalViewCount: record.viewCount,
          post: this.toPostListItem(
            record.post,
            favoriteState.has(record.post.id),
            currentUser,
          ),
        })) satisfies CommunityHistoryListItemPayload[],
        hasMore,
        visibleRecords,
      ),
    };
  }

  async clearMyHistory(currentUser: CurrentUserContext) {
    const result = await this.communityDb.communityPostViewHistory.deleteMany({
      where: {
        userId: currentUser.id,
      },
    });

    return {
      success: true as const,
      data: {
        deletedCount: result.count,
      },
    };
  }

  async deleteMyHistoryItem(currentUser: CurrentUserContext, postId: string) {
    const result = await this.communityDb.communityPostViewHistory.deleteMany({
      where: {
        userId: currentUser.id,
        postId,
      },
    });

    return {
      success: true as const,
      data: {
        deletedCount: result.count,
      },
    };
  }

  async getMyPosts(
    currentUser: CurrentUserContext,
    query: CommunityUserPostsQueryDto,
  ) {
    const limit = this.normalizeLimit(query.limit);
    const cursor = decodeCommunityCursor(query.cursor);
    const status = this.normalizePostStatus(query.status);

    const records = (await this.communityDb.communityPost.findMany({
      where: {
        authorId: currentUser.id,
        deletedAt: null,
        ...(status
          ? {
              status,
            }
          : {}),
      },
      orderBy: [
        {
          createdAt: 'desc',
        },
        {
          id: 'desc',
        },
      ],
      take: limit + 1,
      ...(cursor
        ? {
            cursor: {
              id: cursor.id,
            },
            skip: 1,
          }
        : {}),
      select: COMMUNITY_POST_SELECT,
    })) as CommunityPostRecord[];

    const hasMore = records.length > limit;
    const visibleRecords = hasMore ? records.slice(0, limit) : records;
    const favoriteState = await this.loadFavoriteState(
      currentUser,
      visibleRecords.map((record) => record.id),
    );

    return {
      success: true as const,
      data: this.toCursorPage(
        visibleRecords.map((record) =>
          this.toPostDetailItem(
            record,
            favoriteState.has(record.id),
            currentUser,
            record.viewCount,
          ),
        ) satisfies CommunityMyPostListItemPayload[],
        hasMore,
        visibleRecords,
      ),
    };
  }

  async getSummary(currentUser: CurrentUserContext) {
    const [postCount, favoriteCount, historyCount] = await Promise.all([
      this.communityDb.communityPost.count({
        where: {
          authorId: currentUser.id,
          deletedAt: null,
        },
      }),
      this.communityDb.communityPostFavorite.count({
        where: {
          userId: currentUser.id,
          post: {
            status: COMMUNITY_POST_STATUS.PUBLISHED,
            deletedAt: null,
          },
        },
      }),
      this.communityDb.communityPostViewHistory.count({
        where: {
          userId: currentUser.id,
          post: {
            status: COMMUNITY_POST_STATUS.PUBLISHED,
            deletedAt: null,
          },
        },
      }),
    ]);

    return {
      success: true as const,
      data: {
        postCount,
        favoriteCount,
        historyCount,
      } satisfies CommunitySummaryPayload,
    };
  }

  private async ensureDefaultCategories() {
    if (!this.ensureDefaultCategoriesPromise) {
      this.ensureDefaultCategoriesPromise = this.prisma
        .$transaction(async (tx) => {
          const communityTx = tx as any;
          await Promise.all(
            COMMUNITY_DEFAULT_CATEGORIES.map((category) =>
              communityTx.communityCategory.upsert({
                where: {
                  key: category.key,
                },
                create: {
                  key: category.key,
                  name: category.name,
                  description: category.description,
                  sortOrder: category.sortOrder,
                  status: COMMUNITY_CATEGORY_STATUS.ENABLED,
                },
                update: {
                  name: category.name,
                  description: category.description,
                  sortOrder: category.sortOrder,
                  status: COMMUNITY_CATEGORY_STATUS.ENABLED,
                },
              }),
            ),
          );
        })
        .catch((error) => {
          this.ensureDefaultCategoriesPromise = null;
          throw error;
        });
    }

    return this.ensureDefaultCategoriesPromise;
  }

  private async resolveCategory(
    categoryKey: string,
    requireEnabled = false,
  ): Promise<CommunityCategoryLookup> {
    const category = (await this.communityDb.communityCategory.findFirst({
      where: {
        key: categoryKey,
      },
      select: {
        id: true,
        key: true,
        status: true,
      },
    })) as CommunityCategoryLookup | null;

    if (!category) {
      throw new NotFoundException('COMMUNITY_CATEGORY_NOT_FOUND');
    }

    if (
      requireEnabled &&
      category.status !== COMMUNITY_CATEGORY_STATUS.ENABLED
    ) {
      throw new ForbiddenException('COMMUNITY_CATEGORY_DISABLED');
    }

    return category;
  }

  private async loadVisiblePost(postId: string) {
    return (await this.communityDb.communityPost.findFirst({
      where: {
        id: postId,
        status: COMMUNITY_POST_STATUS.PUBLISHED,
        deletedAt: null,
      },
      select: COMMUNITY_POST_SELECT,
    })) as CommunityPostRecord | null;
  }

  private buildVisiblePostWhere(options: { categoryId?: string }) {
    const where: Record<string, unknown> = {
      status: COMMUNITY_POST_STATUS.PUBLISHED,
      deletedAt: null,
    };

    if (options.categoryId) {
      where.categoryId = options.categoryId;
    }

    return where;
  }

  private normalizeLimit(value: number | undefined) {
    if (!value || Number.isNaN(value)) {
      return COMMUNITY_POST_LIMIT_DEFAULT;
    }

    return Math.min(COMMUNITY_POST_LIMIT_MAX, Math.max(1, Math.floor(value)));
  }

  private normalizePostStatus(
    value: string | undefined,
  ): CommunityPostStatusValue | null {
    if (!value) {
      return null;
    }

    if (
      value !== COMMUNITY_POST_STATUS.PUBLISHED &&
      value !== COMMUNITY_POST_STATUS.HIDDEN &&
      value !== COMMUNITY_POST_STATUS.DELETED
    ) {
      throw new BadRequestException('INVALID_PARAMETER');
    }

    return value as CommunityPostStatusValue;
  }

  private getPostOrderBy(sort: CommunityPostsQueryDto['sort']) {
    if (sort === 'latest') {
      return [{ createdAt: 'desc' as const }, { id: 'desc' as const }];
    }

    if (sort === 'mostLiked') {
      return [
        { likeCount: 'desc' as const },
        { createdAt: 'desc' as const },
        { id: 'desc' as const },
      ];
    }

    if (sort === 'mostFavorited') {
      return [
        { favoriteCount: 'desc' as const },
        { createdAt: 'desc' as const },
        { id: 'desc' as const },
      ];
    }

    if (sort === 'mostCommented') {
      return [
        { commentCount: 'desc' as const },
        { createdAt: 'desc' as const },
        { id: 'desc' as const },
      ];
    }

    return [
      { recommendationScore: 'desc' as const },
      { createdAt: 'desc' as const },
      { id: 'desc' as const },
    ];
  }

  private getRecommendationBaseScore(createdAt: Date) {
    return Math.floor(
      createdAt.getTime() / COMMUNITY_RECOMMENDATION_BUCKET_MS,
    );
  }

  private normalizeCreatePostContent(
    currentUser: CurrentUserContext,
    dto: CreateCommunityPostDto,
  ) {
    if (dto.contentBlocks?.length) {
      const contentBlocks = dto.contentBlocks.map((block) =>
        this.normalizeCreatePostContentBlock(currentUser, block),
      );
      const content = contentBlocks
        .map((block) => {
          if (block.type === 'TEXT') {
            return block.text;
          }

          if (block.type === 'CODE') {
            return block.code;
          }

          return '';
        })
        .filter(Boolean)
        .join('\n\n') || '图片内容';

      if (content.length > 20000) {
        throw new BadRequestException('COMMUNITY_POST_CONTENT_INVALID');
      }

      const images = contentBlocks
        .filter(
          (block): block is Extract<
            CommunityPostContentBlockPayload,
            { type: 'IMAGE' }
          > => block.type === 'IMAGE',
        )
        .map((block) => ({
          objectKey: block.objectKey!,
          url: block.url,
        }));

      return {
        content,
        contentBlocks,
        images,
      };
    }

    const content = trimCommunityText(dto.content ?? '');

    if (content.length < 1 || content.length > 20000) {
      throw new BadRequestException('COMMUNITY_POST_CONTENT_INVALID');
    }

    const images = this.normalizeCreatePostImages(currentUser, dto.images);

    return {
      content,
      contentBlocks: [
        {
          type: 'TEXT' as const,
          text: content,
        },
        ...images.map((image) => ({
          type: 'IMAGE' as const,
          objectKey: image.objectKey,
          url: image.url,
        })),
      ],
      images,
    };
  }

  private normalizeCreatePostContentBlock(
    currentUser: CurrentUserContext,
    block: CreateCommunityPostContentBlockDto,
  ): CommunityPostContentBlockPayload {
    if (block.type === 'TEXT') {
      const text = trimCommunityText(block.text ?? '');

      if (!text) {
        throw new BadRequestException('COMMUNITY_POST_CONTENT_BLOCK_INVALID');
      }

      return {
        type: 'TEXT',
        text,
      };
    }

    if (block.type === 'CODE') {
      const code = block.code ?? '';

      if (!code.trim()) {
        throw new BadRequestException('COMMUNITY_POST_CONTENT_BLOCK_INVALID');
      }

      return {
        type: 'CODE',
        code,
        language: trimCommunityText(block.language ?? '') || null,
      };
    }

    if (block.type === 'IMAGE') {
      const objectKey = trimCommunityText(block.objectKey ?? '');

      this.assertOwnedCommunityImage(currentUser, objectKey);

      return {
        type: 'IMAGE',
        objectKey,
        url: this.buildUploadedImageUrl(objectKey),
      };
    }

    throw new BadRequestException('COMMUNITY_POST_CONTENT_BLOCK_INVALID');
  }

  private normalizeCreatePostImages(
    currentUser: CurrentUserContext,
    images: CreateCommunityPostImageDto[] | undefined,
  ) {
    if (!images || images.length === 0) {
      return [];
    }

    return images.map((image) => {
      const objectKey = trimCommunityText(image.objectKey);

      this.assertOwnedCommunityImage(currentUser, objectKey);

      return {
        objectKey,
        url: this.buildUploadedImageUrl(objectKey),
      };
    });
  }

  private assertOwnedCommunityImage(
    currentUser: CurrentUserContext,
    objectKey: string,
  ) {
    if (!objectKey || !objectKey.startsWith(`${currentUser.id}/`)) {
      throw new BadRequestException('COMMUNITY_POST_IMAGE_INVALID');
    }
  }

  private buildUploadedImageUrl(objectKey: string) {
    const uploadPath = `/uploads/community/${objectKey}`.replace(/\\/g, '/');
    const publicBaseUrl = process.env.PUBLIC_BASE_URL?.trim().replace(
      /\/+$/,
      '',
    );

    if (!publicBaseUrl) {
      throw new InternalServerErrorException('PUBLIC_BASE_URL_NOT_CONFIGURED');
    }

    let parsedUrl: URL;

    try {
      parsedUrl = new URL(publicBaseUrl);
    } catch {
      throw new InternalServerErrorException('PUBLIC_BASE_URL_INVALID');
    }

    if (
      parsedUrl.protocol !== 'https:' ||
      parsedUrl.hostname === 'localhost' ||
      parsedUrl.hostname === '127.0.0.1'
    ) {
      throw new InternalServerErrorException('PUBLIC_BASE_URL_INVALID');
    }

    return `${publicBaseUrl}${uploadPath}`;
  }

  private toCategoryPayload(
    category: CommunityCategoryRecord,
  ): CommunityCategoryPayload {
    return {
      id: category.id,
      key: category.key as CommunityCategoryKey,
      name: category.name,
      description: category.description,
      sortOrder: category.sortOrder,
      status: category.status,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }

  private toAuthorPayload(author: CommunityPostRecord['author']): CommunityAuthorPayload {
    return {
      userId: author.id,
      nickname: author.nickname,
      avatarUrl: author.avatarUrl,
    };
  }

  private toCategorySnapshot(category: CommunityPostRecord['category']): CommunityPostCategoryPayload {
    return {
      id: category.id,
      key: category.key as CommunityCategoryKey,
      name: category.name,
      description: category.description,
      sortOrder: category.sortOrder,
    };
  }

  private toImagePayload(image: CommunityPostRecord['images'][number]): CommunityPostImagePayload {
    return {
      imageId: image.id,
      url: image.url,
      objectKey: image.objectKey,
      width: image.width,
      height: image.height,
      sortOrder: image.sortOrder,
    };
  }

  private toCommentPayload(
    comment: CommunityCommentRecord,
    currentUser: CurrentUserContext | null,
  ): CommunityCommentPayload {
    return {
      commentId: comment.id,
      postId: comment.postId,
      content: comment.content,
      author: this.toAuthorPayload(comment.author),
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      isAuthor: currentUser?.id === comment.authorId,
    };
  }

  private toPostListItem(
    post: CommunityPostRecord,
    viewerHasFavorited: boolean,
    currentUser: CurrentUserContext | null,
  ): CommunityPostListItemPayload {
    const isAuthor = currentUser?.id === post.authorId;
    const images = post.images.map((image) => image.url);

    return {
      postId: post.id,
      title: post.title,
      contentPreview: previewCommunityText(post.content),
      category: this.toCategorySnapshot(post.category),
      author: this.toAuthorPayload(post.author),
      imagePreview: toCommunityImagePreview(images),
      likeCount: post.likeCount,
      commentCount: post.commentCount,
      favoriteCount: post.favoriteCount,
      viewCount: post.viewCount,
      createdAt: post.createdAt,
      isAuthor,
      viewerHasFavorited,
    };
  }

  private toPostDetailItem(
    post: CommunityPostRecord,
    viewerHasFavorited: boolean,
    currentUser: CurrentUserContext | null,
    viewCount: number,
    viewerHasLiked = false,
  ): CommunityPostDetailPayload {
    const base = this.toPostListItem(
      {
        ...post,
        viewCount,
      },
      viewerHasFavorited,
      currentUser,
    );

    return {
      ...base,
      content: post.content,
      contentBlocks: this.normalizeStoredContentBlocks(post),
      images: post.images.map((image) => this.toImagePayload(image)),
      status: post.status,
      deletedAt: post.deletedAt,
      viewerHasLiked,
    };
  }

  private normalizeStoredContentBlocks(
    post: CommunityPostRecord,
  ): CommunityPostContentBlockPayload[] {
    if (Array.isArray(post.contentBlocks)) {
      const blocks: CommunityPostContentBlockPayload[] = [];

      post.contentBlocks.forEach((value) => {
        if (!value || typeof value !== 'object') {
          return;
        }

        const block = value as Record<string, unknown>;

        if (block.type === 'TEXT' && typeof block.text === 'string') {
          blocks.push({
            type: 'TEXT',
            text: block.text,
          });
          return;
        }

        if (block.type === 'CODE' && typeof block.code === 'string') {
          blocks.push({
            type: 'CODE',
            code: block.code,
            language:
              typeof block.language === 'string' && block.language.trim()
                ? block.language.trim()
                : null,
          });
          return;
        }

        if (block.type === 'IMAGE' && typeof block.url === 'string') {
          blocks.push({
            type: 'IMAGE',
            objectKey:
              typeof block.objectKey === 'string' ? block.objectKey : null,
            url: block.url,
          });
        }
      });

      if (blocks.length > 0) {
        return blocks;
      }
    }

    return [
      {
        type: 'TEXT',
        text: post.content,
      },
      ...post.images.map((image) => ({
        type: 'IMAGE' as const,
        objectKey: image.objectKey,
        url: image.url,
      })),
    ];
  }

  private async loadFavoriteState(
    currentUser: CurrentUserContext | null,
    postIds: string[],
  ) {
    if (!currentUser || postIds.length === 0) {
      return new Set<string>();
    }

    const records = await this.communityDb.communityPostFavorite.findMany({
      where: {
        userId: currentUser.id,
        postId: {
          in: postIds,
        },
      },
      select: {
        postId: true,
      },
    });

    return new Set(records.map((record) => record.postId));
  }

  private async loadLikeState(
    currentUser: CurrentUserContext | null,
    postIds: string[],
  ) {
    if (!currentUser || postIds.length === 0) {
      return new Set<string>();
    }

    const records = await this.communityDb.communityPostLike.findMany({
      where: {
        userId: currentUser.id,
        postId: {
          in: postIds,
        },
      },
      select: {
        postId: true,
      },
    });

    return new Set(records.map((record) => record.postId));
  }

  private toCursorPage<T>(
    items: T[],
    hasMore: boolean,
    visibleRecords: Array<{ id: string }>,
  ): CommunityCursorPage<T> {
    const nextCursor =
      hasMore && visibleRecords.length > 0
        ? encodeCommunityCursor({
            id: visibleRecords[visibleRecords.length - 1]!.id,
          })
        : null;

    return {
      items,
      nextCursor,
      hasMore,
      limit: items.length,
    };
  }
}
