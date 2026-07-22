export type UserStatus = 'NORMAL' | 'DISABLED' | 'DELETED';

export type AuthUserProfile = {
  id: string;
  nickname: string | null;
  avatarUrl: string | null;
  status: UserStatus;
  experience: number;
  battleRating: number;
  continuousLearningDays: number;
};

export type LoginResponseData = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthUserProfile;
  isNewUser: boolean;
};

export type RefreshResponseData = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  user: AuthUserProfile | null;
  expiresIn: number;
  updatedAt: number;
};

export type MiniProgramEnvVersion =
  | 'develop'
  | 'trial'
  | 'release'
  | 'unknown';

export type AppAuthStateSummary = {
  isReady: boolean;
  isAuthenticated: boolean;
  user: AuthUserProfile | null;
  envVersion: MiniProgramEnvVersion;
};
