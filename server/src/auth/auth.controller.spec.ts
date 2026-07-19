import { Test, type TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let authController: AuthController;
  const authService = {
    wechatLogin: jest.fn(),
    refresh: jest.fn(),
    logout: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    }).compile();

    authController = module.get(AuthController);
    Object.values(authService).forEach((mockFn) => mockFn.mockReset());
  });

  it('delegates wechat-login to AuthService', async () => {
    const dto = {
      code: 'dev-code',
      mockOpenId: 'mock-user-001',
    };

    const expected = {
      success: true,
      data: {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 900,
        user: {
          id: 'user-id',
          nickname: null,
          avatarUrl: null,
          status: 'NORMAL',
          experience: 0,
          battleRating: 1000,
          continuousLearningDays: 0,
        },
        isNewUser: true,
      },
    };

    authService.wechatLogin.mockResolvedValue(expected);

    await expect(authController.wechatLogin(dto)).resolves.toEqual(expected);
    expect(authService.wechatLogin).toHaveBeenCalledWith(dto);
  });

  it('delegates refresh to AuthService', async () => {
    const dto = {
      refreshToken: 'refresh-token',
    };
    const expected = {
      success: true,
      data: {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresIn: 900,
      },
    };

    authService.refresh.mockResolvedValue(expected);

    await expect(authController.refresh(dto)).resolves.toEqual(expected);
    expect(authService.refresh).toHaveBeenCalledWith(dto);
  });

  it('delegates logout to AuthService', async () => {
    const currentUser = {
      id: 'user-id',
      sessionId: 'session-id',
      tokenType: 'USER' as const,
      role: 'NORMAL' as const,
    };
    const expected = {
      success: true,
      data: {},
    };

    authService.logout.mockResolvedValue(expected);

    await expect(authController.logout(currentUser)).resolves.toEqual(expected);
    expect(authService.logout).toHaveBeenCalledWith(currentUser);
  });
});
