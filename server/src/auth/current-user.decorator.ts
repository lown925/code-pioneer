import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import { type CurrentUserContext } from './auth.types';

type AuthenticatedRequest = Request & {
  user?: CurrentUserContext | null;
};

export const CurrentUser = createParamDecorator(
  (data: keyof CurrentUserContext | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user ?? null;

    if (!data) {
      return user;
    }

    return user?.[data] ?? null;
  },
);
