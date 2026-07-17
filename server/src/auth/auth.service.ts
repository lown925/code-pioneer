import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { createHash } from 'crypto';
import { UserStatus } from '../../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { WechatLoginDto } from './dto/wechat-login.dto';
import { JwtPayload, JwtService } from './jwt.service';

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

    if (existingUser?.status === UserStatus.DISABLED) {
      throw new ForbiddenException('USER_DISABLED');
    }

    if (existingUser?.status === UserStatus.DELETED) {
      throw new ForbiddenException('USER_DELETED');
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

    const tokenBasePayload: Omit<JwtPayload, 'type'> = {
      sub: user.id,
      userId: user.id,
      sessionId: session.id,
    };

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

  private async resolveWechatIdentity(
    dto: WechatLoginDto,
  ): Promise<WechatIdentity> {
    if (dto.mockOpenId) {
      return this.resolveMockIdentity(dto.mockOpenId);
    }

    return this.resolveWechatCode(dto.code);
  }

  private resolveMockIdentity(mockOpenId: string): WechatIdentity {
    if (process.env.NODE_ENV === 'production') {
      throw new BadRequestException(
        'Mock login is not available in production',
      );
    }

    if (!this.isMockLoginEnabled()) {
      throw new BadRequestException('Mock login is disabled');
    }

    return {
      openId: mockOpenId,
      unionId: null,
    };
  }

  private async resolveWechatCode(code: string): Promise<WechatIdentity> {
    const appId = process.env.WECHAT_APP_ID;
    const appSecret = process.env.WECHAT_APP_SECRET;

    if (!appId || !appSecret) {
      throw new InternalServerErrorException(
        'WECHAT_APP_ID or WECHAT_APP_SECRET is not configured',
      );
    }

    const params = new URLSearchParams({
      appid: appId,
      secret: appSecret,
      js_code: code,
      grant_type: 'authorization_code',
    });

    const response = await fetch(
      `https://api.weixin.qq.com/sns/jscode2session?${params.toString()}`,
    );

    if (!response.ok) {
      throw new UnauthorizedException('WeChat login request failed');
    }

    const payload = (await response.json()) as WechatSessionResponse;

    if (payload.errcode) {
      throw new UnauthorizedException(
        payload.errmsg ?? 'WeChat login was rejected',
      );
    }

    if (!payload.openid) {
      throw new UnauthorizedException('WeChat login did not return openid');
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
}
