import { Injectable, InternalServerErrorException } from '@nestjs/common';
import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';

type TokenKind = 'ACCESS' | 'REFRESH';

export type JwtPayload = {
  sub: string;
  userId: string;
  sessionId: string;
  type: TokenKind;
};

@Injectable()
export class JwtService {
  signAccessToken(payload: Omit<JwtPayload, 'type'>) {
    return this.sign(
      {
        ...payload,
        type: 'ACCESS',
      },
      this.getRequiredEnv('JWT_ACCESS_SECRET'),
      this.getRequiredEnv('JWT_ACCESS_EXPIRES'),
    );
  }

  signRefreshToken(payload: Omit<JwtPayload, 'type'>) {
    return this.sign(
      {
        ...payload,
        type: 'REFRESH',
      },
      this.getRequiredEnv('JWT_REFRESH_SECRET'),
      this.getRequiredEnv('JWT_REFRESH_EXPIRES'),
    );
  }

  verifyAccessToken(token: string) {
    return jwt.verify(
      token,
      this.getRequiredEnv('JWT_ACCESS_SECRET'),
    ) as JwtPayload;
  }

  verifyRefreshToken(token: string) {
    return jwt.verify(
      token,
      this.getRequiredEnv('JWT_REFRESH_SECRET'),
    ) as JwtPayload;
  }

  getAccessTokenExpiresInSeconds() {
    return this.parseDurationToSeconds(
      this.getRequiredEnv('JWT_ACCESS_EXPIRES'),
    );
  }

  getRefreshTokenExpiresAt() {
    const seconds = this.parseDurationToSeconds(
      this.getRequiredEnv('JWT_REFRESH_EXPIRES'),
    );

    return new Date(Date.now() + seconds * 1000);
  }

  private sign(payload: JwtPayload, secret: Secret, expiresIn: string) {
    const options: SignOptions = {
      expiresIn: expiresIn as SignOptions['expiresIn'],
    };

    return jwt.sign(payload, secret, options);
  }

  private getRequiredEnv(key: string) {
    const value = process.env[key];

    if (!value) {
      throw new InternalServerErrorException(
        `${key} is not configured for authentication`,
      );
    }

    return value;
  }

  private parseDurationToSeconds(value: string) {
    const normalized = value.trim().toLowerCase();
    const match = normalized.match(/^(\d+)([smhd])?$/);

    if (!match) {
      throw new InternalServerErrorException(
        `Unsupported duration format: ${value}`,
      );
    }

    const amount = Number(match[1]);
    const unit = match[2] ?? 's';

    const multiplier =
      unit === 'd' ? 86400 : unit === 'h' ? 3600 : unit === 'm' ? 60 : 1;

    return amount * multiplier;
  }
}
