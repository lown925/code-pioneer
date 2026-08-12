import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { createHash, timingSafeEqual } from 'crypto';
import { UserStatus } from '../../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { type CurrentUserContext, type JwtUserPayload } from './auth.types';
import { JwtService } from './jwt.service';
import { WechatLoginDto } from './dto/wechat-login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

type LoginResponseUser = {
  id: string;
  nickname: string | null;
  avatarUrl: string | null;
  status: UserStatus;
  experience: number;
  battleRating: number;
  continuousLearningDays: number;
};

type WechatIdentity = {
  openId: string;
  unionId: string | null;
};

type WechatSessionResponse = {
  openid?: string;
  unionid?: string;
  errcode?: number;
  errmsg?: string;
};

const WECHAT_INVALID_CODE_ERROR_CODES = new Set([40029, 40163, 40226]);

type RefreshSessionRecord = {
  id: string;
  userId: string;
  refreshTokenHash: string | null;
  expiresAt: Date;
  revokedAt: Date | null;
  user: {
    id: string;
    status: UserStatus;
    deletedAt: Date | null;
  } | null;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async wechatLogin(dto: WechatLoginDto) {
    const identity = await this.resolveWechatIdentity(dto);
    const now = new Date();

    const existingUser = await this.prisma.user.findUnique({
      where: {
        openId: identity.openId,
      },
    });

    if (existingUser) {
      this.assertUserIsActive({
        status: existingUser.status,
        deletedAt: existingUser.deletedAt,
      });
    }

    const user = existingUser
      ? await this.prisma.user.update({
          where: { id: existingUser.id },
          data: {
            unionId: existingUser.unionId ?? identity.unionId,
            lastLoginAt: now,
          },
        })
      : await this.prisma.user.create({
          data: {
            openId: identity.openId,
            unionId: identity.unionId,
            lastLoginAt: now,
          },
        });

    const session = await this.prisma.userSession.create({
      data: {
        userId: user.id,
        expiresAt: this.jwtService.getRefreshTokenExpiresAt(),
      },
    });

    const tokenBasePayload = this.buildJwtPayload(user.id, session.id);
    const accessToken = this.jwtService.signAccessToken(tokenBasePayload);
    const refreshToken = this.jwtService.signRefreshToken(tokenBasePayload);

    await this.prisma.userSession.update({
      where: {
        id: session.id,
      },
      data: {
        refreshTokenHash: this.hashToken(refreshToken),
        lastUsedAt: now,
      },
    });

    return {
      success: true as const,
      data: {
        accessToken,
        refreshToken,
        expiresIn: this.jwtService.getAccessTokenExpiresInSeconds(),
        user: this.toLoginUser(user),
        isNewUser: !existingUser,
      },
    };
  }

  async refresh(dto: RefreshTokenDto) {
    const { session, user } = await this.validateRefreshToken(dto.refreshToken);
    const now = new Date();
    const nextExpiresAt = this.jwtService.getRefreshTokenExpiresAt();
    const tokenBasePayload = this.buildJwtPayload(user.id, session.id);
    const accessToken = this.jwtService.signAccessToken(tokenBasePayload);
    const refreshToken = this.jwtService.signRefreshToken(tokenBasePayload);
    const rotatedRefreshTokenHash = this.hashToken(refreshToken);
    const rotated = await this.prisma.userSession.updateMany({
      where: {
        id: session.id,
        userId: user.id,
        refreshTokenHash: session.refreshTokenHash,
        revokedAt: null,
        expiresAt: {
          gt: now,
        },
      },
      data: {
        refreshTokenHash: rotatedRefreshTokenHash,
        expiresAt: nextExpiresAt,
        lastUsedAt: now,
      },
    });

    if (rotated.count !== 1) {
      throw new UnauthorizedException('REFRESH_TOKEN_INVALID');
    }

    return {
      success: true as const,
      data: {
        accessToken,
        refreshToken,
        expiresIn: this.jwtService.getAccessTokenExpiresInSeconds(),
      },
    };
  }

  async logout(currentUser: CurrentUserContext) {
    const session = await this.prisma.userSession.findUnique({
      where: {
        id: currentUser.sessionId,
      },
      select: {
        id: true,
        userId: true,
        revokedAt: true,
      },
    });

    if (!session || session.userId !== currentUser.id) {
      throw new UnauthorizedException('ACCESS_TOKEN_INVALID');
    }

    if (!session.revokedAt) {
      await this.prisma.userSession.update({
        where: {
          id: session.id,
        },
        data: {
          revokedAt: new Date(),
          lastUsedAt: new Date(),
        },
      });
    }

    return {
      success: true as const,
      data: {},
    };
  }

  async validateAccessToken(accessToken: string): Promise<CurrentUserContext> {
    return this.validateAccessTokenContext(accessToken, false);
  }

  async validateLogoutAccessToken(
    accessToken: string,
  ): Promise<CurrentUserContext> {
    return this.validateAccessTokenContext(accessToken, true);
  }

  private async validateRefreshToken(refreshToken: string) {
    const payload = this.verifyRefreshTokenPayload(refreshToken);

    if (payload.type !== 'REFRESH' || payload.tokenType !== 'USER') {
      throw new UnauthorizedException('REFRESH_TOKEN_INVALID');
    }

    if (!payload.sub || !payload.userId || !payload.sessionId) {
      throw new UnauthorizedException('REFRESH_TOKEN_INVALID');
    }

    if (payload.sub !== payload.userId) {
      throw new UnauthorizedException('REFRESH_TOKEN_INVALID');
    }

    if (!this.isUuid(payload.sub) || !this.isUuid(payload.sessionId)) {
      throw new UnauthorizedException('REFRESH_TOKEN_INVALID');
    }

    const session = (await this.prisma.userSession.findUnique({
      where: {
        id: payload.sessionId,
      },
      include: {
        user: {
          select: {
            id: true,
            status: true,
            deletedAt: true,
          },
        },
      },
    })) as RefreshSessionRecord | null;

    if (!session || session.userId !== payload.sub || !session.user) {
      throw new UnauthorizedException('REFRESH_TOKEN_INVALID');
    }

    this.assertUserIsActive(session.user);

    if (session.revokedAt) {
      throw new UnauthorizedException('SESSION_REVOKED');
    }

    if (session.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException('TOKEN_EXPIRED');
    }

    if (!session.refreshTokenHash) {
      throw new UnauthorizedException('REFRESH_TOKEN_INVALID');
    }

    if (!this.matchesHashedToken(refreshToken, session.refreshTokenHash)) {
      throw new UnauthorizedException('REFRESH_TOKEN_INVALID');
    }

    return {
      session,
      user: session.user,
      payload,
    };
  }

  private verifyAccessTokenPayload(accessToken: string) {
    try {
      return this.jwtService.verifyAccessToken(accessToken);
    } catch (error) {
      if (this.isTokenExpiredError(error)) {
        throw new UnauthorizedException('TOKEN_EXPIRED');
      }

      throw new UnauthorizedException('ACCESS_TOKEN_INVALID');
    }
  }

  private verifyRefreshTokenPayload(refreshToken: string) {
    try {
      return this.jwtService.verifyRefreshToken(refreshToken);
    } catch (error) {
      if (this.isTokenExpiredError(error)) {
        throw new UnauthorizedException('TOKEN_EXPIRED');
      }

      throw new UnauthorizedException('REFRESH_TOKEN_INVALID');
    }
  }

  private isTokenExpiredError(error: unknown) {
    return error instanceof Error && error.name === 'TokenExpiredError';
  }

  private async validateAccessTokenContext(
    accessToken: string,
    allowRevokedSession: boolean,
  ): Promise<CurrentUserContext> {
    const payload = this.verifyAccessTokenPayload(accessToken);

    if (payload.type !== 'ACCESS' || payload.tokenType !== 'USER') {
      throw new UnauthorizedException('ACCESS_TOKEN_INVALID');
    }

    if (!payload.sub || !payload.userId || !payload.sessionId) {
      throw new UnauthorizedException('ACCESS_TOKEN_INVALID');
    }

    if (payload.sub !== payload.userId) {
      throw new UnauthorizedException('ACCESS_TOKEN_INVALID');
    }

    if (!this.isUuid(payload.sub) || !this.isUuid(payload.sessionId)) {
      throw new UnauthorizedException('ACCESS_TOKEN_INVALID');
    }

    const [user, session] = await Promise.all([
      this.prisma.user.findUnique({
        where: {
          id: payload.sub,
        },
      }),
      this.prisma.userSession.findUnique({
        where: {
          id: payload.sessionId,
        },
        select: {
          id: true,
          userId: true,
          expiresAt: true,
          revokedAt: true,
        },
      }),
    ]);

    if (!user || !session || session.userId !== user.id) {
      throw new UnauthorizedException('ACCESS_TOKEN_INVALID');
    }

    this.assertUserIsActive({
      status: user.status,
      deletedAt: user.deletedAt,
    });

    if (!allowRevokedSession && session.revokedAt) {
      throw new UnauthorizedException('SESSION_REVOKED');
    }

    if (session.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException('TOKEN_EXPIRED');
    }

    return {
      id: user.id,
      sessionId: session.id,
      tokenType: payload.tokenType,
      role: payload.role,
    };
  }

  private async resolveWechatIdentity(
    dto: WechatLoginDto,
  ): Promise<WechatIdentity> {
    if (dto.mockOpenId) {
      return this.resolveMockIdentity(dto.mockOpenId);
    }

    return this.resolveWechatCode(dto.code);
  }

  private resolveMockIdentity(mockOpenId: string): WechatIdentity {
    if (
      process.env.NODE_ENV === 'production' ||
      process.env.APP_ENV === 'production' ||
      process.env.APP_ENV === 'trial' ||
      !this.isMockLoginEnabled()
    ) {
      throw new BadRequestException('MOCK_LOGIN_DISABLED');
    }

    return {
      openId: mockOpenId,
      unionId: null,
    };
  }

  private async resolveWechatCode(code: string): Promise<WechatIdentity> {
    const appId = process.env.WECHAT_APP_ID?.trim();
    const appSecret = process.env.WECHAT_APP_SECRET?.trim();

    if (!appId || !appSecret) {
      throw new InternalServerErrorException(
        'WECHAT_LOGIN_CONFIGURATION_INVALID',
      );
    }

    const params = new URLSearchParams({
      appid: appId,
      secret: appSecret,
      js_code: code,
      grant_type: 'authorization_code',
    });

    let response: Response;
    let payload: WechatSessionResponse;

    try {
      response = await fetch(
        `https://api.weixin.qq.com/sns/jscode2session?${params.toString()}`,
      );

      if (!response.ok) {
        throw new Error('WECHAT_HTTP_FAILURE');
      }

      payload = (await response.json()) as WechatSessionResponse;
    } catch {
      throw new InternalServerErrorException('WECHAT_LOGIN_UPSTREAM_FAILED');
    }

    if (payload.errcode) {
      if (WECHAT_INVALID_CODE_ERROR_CODES.has(payload.errcode)) {
        throw new UnauthorizedException('WECHAT_LOGIN_CODE_INVALID');
      }

      throw new InternalServerErrorException('WECHAT_LOGIN_UPSTREAM_FAILED');
    }

    if (!payload.openid) {
      throw new InternalServerErrorException('WECHAT_LOGIN_UPSTREAM_FAILED');
    }

    return {
      openId: payload.openid,
      unionId: payload.unionid ?? null,
    };
  }

  private isMockLoginEnabled() {
    const value = process.env.AUTH_MOCK_ENABLED?.trim().toLowerCase();

    return value === 'true' || value === '1' || value === 'yes';
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private matchesHashedToken(token: string, expectedHash: string) {
    const actualHash = Buffer.from(this.hashToken(token));
    const targetHash = Buffer.from(expectedHash);

    if (actualHash.length !== targetHash.length) {
      return false;
    }

    return timingSafeEqual(actualHash, targetHash);
  }

  private isUuid(value: string) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    );
  }

  private buildJwtPayload(
    userId: string,
    sessionId: string,
  ): Omit<JwtUserPayload, 'type'> {
    return {
      sub: userId,
      userId,
      sessionId,
      tokenType: 'USER',
      role: 'NORMAL',
    };
  }

  private toLoginUser(user: {
    id: string;
    nickname: string | null;
    avatarUrl: string | null;
    status: UserStatus;
    experience: number;
    battleRating: number;
    continuousLearningDays: number;
  }): LoginResponseUser {
    return {
      id: user.id,
      nickname: user.nickname,
      avatarUrl: user.avatarUrl,
      status: user.status,
      experience: user.experience,
      battleRating: user.battleRating,
      continuousLearningDays: user.continuousLearningDays,
    };
  }

  private assertUserIsActive(user: {
    status: UserStatus;
    deletedAt?: Date | null;
  }) {
    if (user.deletedAt || user.status === UserStatus.DELETED) {
      throw new ForbiddenException('USER_DELETED');
    }

    if (user.status === UserStatus.DISABLED) {
      throw new ForbiddenException('USER_DISABLED');
    }
  }
}
