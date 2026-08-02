import { UserStatus } from '../../generated/prisma/enums';

export type PublicUser = {
  id: string;
  nickname: string | null;
  avatarUrl: string | null;
  status: UserStatus;
  experience: number;
  battleRating: number;
  continuousLearningDays: number;
  lastLoginAt: Date | null;
  createdAt: Date;
};

type PublicUserSource = PublicUser;

export function toPublicUser(user: PublicUserSource): PublicUser {
  return {
    id: user.id,
    nickname: user.nickname,
    avatarUrl: user.avatarUrl,
    status: user.status,
    experience: user.experience,
    battleRating: user.battleRating,
    continuousLearningDays: user.continuousLearningDays,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
  };
}

export type UserFollowListItem = {
  userId: string;
  nickname: string | null;
  avatarUrl: string | null;
  battleRating: number;
  isFollowedByViewer: boolean;
};

export type UserProfilePostSummary = {
  postId: string;
  title: string;
  contentPreview: string;
  createdAt: Date;
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

export type PublicUserProfile = {
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
