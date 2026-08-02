export type CommunityCategoryKey =
  | 'LEARNING'
  | 'BATTLE'
  | 'CODE_HELP'
  | 'CAREER'
  | 'GENERAL';

export type CommunityCategoryStatus = 'ENABLED' | 'DISABLED';
export type CommunityPostStatus = 'PUBLISHED' | 'HIDDEN' | 'DELETED';
export type CommunityCommentStatus = 'PUBLISHED' | 'HIDDEN' | 'DELETED';

export type CommunityAuthor = {
  userId: string;
  nickname: string | null;
  avatarUrl: string | null;
};

export type CommunityCategory = {
  id: string;
  key: CommunityCategoryKey;
  name: string;
  description: string | null;
  sortOrder: number;
  status: CommunityCategoryStatus;
  createdAt: string;
  updatedAt: string;
};

export type CommunityPostCategory = Pick<
  CommunityCategory,
  'id' | 'key' | 'name' | 'description' | 'sortOrder'
>;

export type CommunityPostImage = {
  imageId: string;
  url: string;
  objectKey: string | null;
  width: number | null;
  height: number | null;
  sortOrder: number;
};

export type CommunityPostListItem = {
  postId: string;
  title: string;
  contentPreview: string;
  category: CommunityPostCategory;
  author: CommunityAuthor;
  imagePreview: string[];
  likeCount: number;
  commentCount: number;
  favoriteCount: number;
  viewCount: number;
  createdAt: string;
  isAuthor: boolean;
  viewerHasFavorited: boolean;
};

export type CommunityPostDetail = CommunityPostListItem & {
  content: string;
  images: CommunityPostImage[];
  status: CommunityPostStatus;
  deletedAt: string | null;
  viewerHasLiked: boolean;
};

export type CommunityComment = {
  commentId: string;
  postId: string;
  content: string;
  author: CommunityAuthor;
  createdAt: string;
  updatedAt: string;
  isAuthor: boolean;
};

export type CommunityCursorPage<T> = {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
  limit: number;
};

export type CommunityCategoriesResponse = {
  items: CommunityCategory[];
};

export type CommunityPostsResponse = CommunityCursorPage<CommunityPostListItem>;

export type CommunityCreatePostResponse = {
  postId: string;
  createdAt: string;
};

export type CommunityUploadedImage = {
  objectKey: string;
  url: string;
  width: number | null;
  height: number | null;
};

export type CommunityUploadImageResponse = {
  image: CommunityUploadedImage;
};

export type CommunityFavoriteMutationResponse = {
  postId: string;
  viewerHasFavorited: boolean;
  favoriteCount: number;
};

export type CommunityDeletePostResponse = {
  postId: string;
  deletedAt: string;
};

export type CommunityDeleteHistoryResponse = {
  deletedCount: number;
};

export type CommunityCommentsResponse = {
  items: CommunityComment[];
};

export type CommunityCreateCommentResponse = {
  comment: CommunityComment;
  commentCount: number;
};

export type CommunityFavoriteListItem = {
  favoritedAt: string;
  post: CommunityPostListItem;
};

export type CommunityFavoritesResponse =
  CommunityCursorPage<CommunityFavoriteListItem>;

export type CommunityHistoryListItem = {
  firstViewedAt: string;
  lastViewedAt: string;
  personalViewCount: number;
  post: CommunityPostListItem;
};

export type CommunityHistoryResponse =
  CommunityCursorPage<CommunityHistoryListItem>;

export type CommunityMyPostsResponse =
  CommunityCursorPage<CommunityPostDetail>;

export type CommunitySummaryResponse = {
  postCount: number;
  favoriteCount: number;
  historyCount: number;
};

export type CommunityPostsQuery = {
  categoryKey?: CommunityCategoryKey;
  cursor?: string;
  limit?: number;
  sort?: 'latest';
};

export type CommunityCursorQuery = {
  cursor?: string;
  limit?: number;
};

export type CommunityMyPostsQuery = CommunityCursorQuery & {
  status?: CommunityPostStatus;
};
