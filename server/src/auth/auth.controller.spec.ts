import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let authController: AuthController;
  const authService = {
    wechatLogin: jest.fn(),
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
    authService.wechatLogin.mockReset();
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
});
