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
