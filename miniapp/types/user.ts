import type { AuthUserProfile } from './auth';

export type UserAvatarUploadResponse = {
  avatarUrl: string;
};

export type UpdateCurrentUserResponse = AuthUserProfile;

export type UserProfilePostSummary = {
  postId: string;
  title: string;
  contentPreview: string;
  createdAt: string;
  category: {
    id: string;
    key: string;
    name: string;
    description: string | null;
    sortOrder: number;
  };
  favoriteCount: number;
  commentCount: number;
  viewCount: number;
};

export type PublicUserProfileResponse = {
  userId: string;
  nickname: string | null;
  avatarUrl: string | null;
  battleRating: number;
  totalBattles: number;
  followingCount: number;
  followerCount: number;
  wrongQuestionCount: number;
  postCount: number;
  viewerIsSelf: boolean;
  viewerHasFollowed: boolean;
  recentPosts: UserProfilePostSummary[];
};

export type UserFollowMutationResponse = {
  userId: string;
  followed: boolean;
};

export type UserFollowListItem = {
  userId: string;
  nickname: string | null;
  avatarUrl: string | null;
  battleRating: number;
  isFollowedByViewer: boolean;
};

export type UserFollowListResponse = {
  items: UserFollowListItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type UserFollowListMode = 'following' | 'followers';
