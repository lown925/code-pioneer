import {
  Injectable,
  UnauthorizedException,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { type CurrentUserContext } from './auth.types';

type AuthenticatedRequest = Request & {
  user?: CurrentUserContext | null;
};

@Injectable()
export class JwtUserAuthGuard implements CanActivate {
  constructor(protected readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    return this.authenticate(context, (token) =>
      this.authService.validateAccessToken(token),
    );
  }

  protected async authenticate(
    context: ExecutionContext,
    validator: (token: string) => Promise<CurrentUserContext>,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractBearerToken(request.headers.authorization);

    if (!token) {
      throw new UnauthorizedException('ACCESS_TOKEN_INVALID');
    }

    request.user = await validator(token);
    return true;
  }

  protected extractBearerToken(authorization: unknown) {
    if (typeof authorization !== 'string') {
      return null;
    }

    const [scheme, token, ...rest] = authorization.trim().split(/\s+/);

    if (rest.length > 0) {
      return null;
    }

    if (scheme !== 'Bearer' || !token) {
      return null;
    }

    return token;
  }
}

@Injectable()
export class OptionalUserAuthGuard extends JwtUserAuthGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractBearerToken(request.headers.authorization);

    if (!token) {
      request.user = null;
      return true;
    }

    return super.canActivate(context);
  }
}

@Injectable()
export class LogoutAuthGuard extends JwtUserAuthGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    return this.authenticate(context, (token) =>
      this.authService.validateLogoutAccessToken(token),
    );
  }
}
