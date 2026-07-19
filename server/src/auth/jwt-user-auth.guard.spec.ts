/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
import { UnauthorizedException } from '@nestjs/common';
import {
  JwtUserAuthGuard,
  LogoutAuthGuard,
  OptionalUserAuthGuard,
} from './jwt-user-auth.guard';
import { AuthService } from './auth.service';

function createExecutionContext(headers: Record<string, string | undefined>) {
  const request = {
    headers,
    user: undefined,
  };

  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
    __request: request,
  } as any;
}

describe('JwtUserAuthGuard', () => {
  const authService = {
    validateAccessToken: jest.fn(),
    validateLogoutAccessToken: jest.fn(),
  };

  const guard = new JwtUserAuthGuard(authService as unknown as AuthService);

  beforeEach(() => {
    authService.validateAccessToken.mockReset();
    authService.validateLogoutAccessToken.mockReset();
  });

  it('rejects missing bearer tokens', async () => {
    const context = createExecutionContext({});

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(authService.validateAccessToken).not.toHaveBeenCalled();
  });

  it('attaches the current user for valid bearer tokens', async () => {
    const context = createExecutionContext({
      authorization: 'Bearer access-token',
    });
    authService.validateAccessToken.mockResolvedValue({
      id: 'user-id',
      sessionId: 'session-id',
      tokenType: 'USER',
      role: 'NORMAL',
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(authService.validateAccessToken).toHaveBeenCalledWith(
      'access-token',
    );
    expect(context.__request.user).toEqual({
      id: 'user-id',
      sessionId: 'session-id',
      tokenType: 'USER',
      role: 'NORMAL',
    });
  });
});

describe('OptionalUserAuthGuard', () => {
  const authService = {
    validateAccessToken: jest.fn(),
    validateLogoutAccessToken: jest.fn(),
  };

  const guard = new OptionalUserAuthGuard(
    authService as unknown as AuthService,
  );

  beforeEach(() => {
    authService.validateAccessToken.mockReset();
    authService.validateLogoutAccessToken.mockReset();
  });

  it('allows anonymous requests without bearer tokens', async () => {
    const context = createExecutionContext({});

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(authService.validateAccessToken).not.toHaveBeenCalled();
    expect(context.__request.user).toBeNull();
  });
});

describe('LogoutAuthGuard', () => {
  const authService = {
    validateAccessToken: jest.fn(),
    validateLogoutAccessToken: jest.fn(),
  };

  const guard = new LogoutAuthGuard(authService as unknown as AuthService);

  beforeEach(() => {
    authService.validateAccessToken.mockReset();
    authService.validateLogoutAccessToken.mockReset();
  });

  it('rejects missing bearer tokens', async () => {
    const context = createExecutionContext({});

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(authService.validateLogoutAccessToken).not.toHaveBeenCalled();
  });

  it('validates logout tokens with the dedicated auth flow', async () => {
    const context = createExecutionContext({
      authorization: 'Bearer access-token',
    });
    authService.validateLogoutAccessToken.mockResolvedValue({
      id: 'user-id',
      sessionId: 'session-id',
      tokenType: 'USER',
      role: 'NORMAL',
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(authService.validateLogoutAccessToken).toHaveBeenCalledWith(
      'access-token',
    );
    expect(authService.validateAccessToken).not.toHaveBeenCalled();
    expect(context.__request.user).toEqual({
      id: 'user-id',
      sessionId: 'session-id',
      tokenType: 'USER',
      role: 'NORMAL',
    });
  });
});
