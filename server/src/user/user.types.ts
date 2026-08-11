import { UserStatus } from '../../generated/prisma/enums';

export type CurrentUserProfile = {
  id: string;
  nickname: string | null;
  avatarUrl: string | null;
  major: string | null;
  grade: string | null;
  learningDirection: string | null;
  technicalInterests: string[];
  careerDirection: string | null;
  status: UserStatus;
  experience: number;
  battleRating: number;
  continuousLearningDays: number;
  lastLoginAt: Date | null;
  createdAt: Date;
};

type CurrentUserProfileSource = CurrentUserProfile;

export function toCurrentUserProfile(
  user: CurrentUserProfileSource,
): CurrentUserProfile {
  return {
    id: user.id,
    nickname: user.nickname,
    avatarUrl: user.avatarUrl,
    major: user.major,
    grade: user.grade,
    learningDirection: user.learningDirection,
    technicalInterests: user.technicalInterests,
    careerDirection: user.careerDirection,
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
