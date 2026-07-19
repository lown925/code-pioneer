export type AuthTokenType = 'USER' | 'ADMIN';

export type AuthRole = 'NORMAL' | 'SUPER_ADMIN';

export type JwtTokenKind = 'ACCESS' | 'REFRESH';

export type JwtUserPayload = {
  sub: string;
  userId: string;
  sessionId: string;
  type: JwtTokenKind;
  tokenType: AuthTokenType;
  role: AuthRole;
};

export type CurrentUserContext = {
  id: string;
  sessionId: string;
  tokenType: AuthTokenType;
  role: AuthRole;
};
