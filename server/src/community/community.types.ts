import type { CommunityCategoryKey } from './community.constants';

export type CommunityStatusValue = 'ENABLED' | 'DISABLED';
export type CommunityPostStatusValue = 'PUBLISHED' | 'HIDDEN' | 'DELETED';
export type CommunityCommentStatusValue = 'PUBLISHED' | 'HIDDEN' | 'DELETED';

export type CommunityAuthorPayload = {
  userId: string;
  nickname: string | null;
  avatarUrl: string | null;
};

export type CommunityCategoryPayload = {
  id: string;
  key: CommunityCategoryKey;
  name: string;
  description: string | null;
  sortOrder: number;
  status: CommunityStatusValue;
  createdAt: Date;
  updatedAt: Date;
};

export type CommunityPostImagePayload = {
  imageId: string;
  url: string;
  objectKey: string | null;
  width: number | null;
  height: number | null;
  sortOrder: number;
};

export type CommunityPostContentBlockPayload =
  | {
      type: 'TEXT';
      text: string;
    }
  | {
      type: 'CODE';
      code: string;
      language: string | null;
    }
  | {
      type: 'IMAGE';
      objectKey: string | null;
      url: string;
    };

export type CommunityUploadedImagePayload = {
  objectKey: string;
  url: string;
  width: number | null;
  height: number | null;
};

export type CommunityPostCategoryPayload = Pick<
  CommunityCategoryPayload,
  'id' | 'key' | 'name' | 'description' | 'sortOrder'
>;

export type CommunityPostListItemPayload = {
  postId: string;
  title: string;
  contentPreview: string;
  category: CommunityPostCategoryPayload;
  author: CommunityAuthorPayload;
  imagePreview: string[];
  likeCount: number;
  commentCount: number;
  favoriteCount: number;
  viewCount: number;
  createdAt: Date;
  isAuthor: boolean;
  viewerHasFavorited: boolean;
};

export type CommunityPostDetailPayload = CommunityPostListItemPayload & {
  content: string;
  contentBlocks: CommunityPostContentBlockPayload[];
  images: CommunityPostImagePayload[];
  status: CommunityPostStatusValue;
  deletedAt: Date | null;
  viewerHasLiked: boolean;
};

export type CommunityCommentPayload = {
  commentId: string;
  postId: string;
  content: string;
  author: CommunityAuthorPayload;
  createdAt: Date;
  updatedAt: Date;
  isAuthor: boolean;
};

export type CommunityCommentsResponse = {
  items: CommunityCommentPayload[];
};

export type CommunityCreateCommentResponse = {
  comment: CommunityCommentPayload;
  commentCount: number;
};

export type CommunityCursorPage<T> = {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
  limit: number;
};

export type CommunityCreatePostResponse = {
  postId: string;
  createdAt: Date;
};

export type CommunityLikeMutationResponse = {
  postId: string;
  viewerHasLiked: boolean;
  likeCount: number;
};

export type CommunityUploadImageResponse = {
  image: CommunityUploadedImagePayload;
};

export type CommunityFavoriteListItemPayload = {
  favoritedAt: Date;
  post: CommunityPostListItemPayload;
};

export type CommunityHistoryListItemPayload = {
  firstViewedAt: Date;
  lastViewedAt: Date;
  personalViewCount: number;
  post: CommunityPostListItemPayload;
};

export type CommunityMyPostListItemPayload = CommunityPostDetailPayload;

export type CommunitySummaryPayload = {
  postCount: number;
  favoriteCount: number;
  historyCount: number;
};
