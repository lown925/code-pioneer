import { Test, type TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth/auth.service';
import { JwtUserAuthGuard } from '../auth/jwt-user-auth.guard';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let userController: UserController;
  const userService = {
    updateCurrentUser: jest.fn(),
    deleteCurrentUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: userService,
        },
        {
          provide: AuthService,
          useValue: {
            validateAccessToken: jest.fn(),
          },
        },
        {
          provide: JwtUserAuthGuard,
          useValue: {
            canActivate: jest.fn(() => true),
          },
        },
      ],
    }).compile();

    userController = module.get(UserController);
    Object.values(userService).forEach((mockFn) => mockFn.mockReset());
  });

  it('delegates profile updates to UserService', async () => {
    const currentUser = {
      id: 'user-id',
      sessionId: 'session-id',
      tokenType: 'USER' as const,
      role: 'NORMAL' as const,
    };
    const dto = {
      nickname: '码站学员',
      avatarUrl: 'https://cdn.example.com/avatar.png',
    };
    const expected = {
      success: true,
      data: {
        id: 'user-id',
        nickname: '码站学员',
        avatarUrl: 'https://cdn.example.com/avatar.png',
        status: 'NORMAL',
        experience: 0,
        battleRating: 1000,
        continuousLearningDays: 0,
        lastLoginAt: null,
        createdAt: new Date('2026-07-19T00:00:00.000Z'),
      },
    };

    userService.updateCurrentUser.mockResolvedValue(expected);

    await expect(
      userController.updateCurrentUser(currentUser, dto),
    ).resolves.toEqual(expected);
    expect(userService.updateCurrentUser).toHaveBeenCalledWith(
      currentUser,
      dto,
    );
  });

  it('delegates account deletion to UserService', async () => {
    const currentUser = {
      id: 'user-id',
      sessionId: 'session-id',
      tokenType: 'USER' as const,
      role: 'NORMAL' as const,
    };
    const dto = {
      confirmation: 'DELETE',
    };
    const expected = {
      success: true,
      data: {},
    };

    userService.deleteCurrentUser.mockResolvedValue(expected);

    await expect(
      userController.deleteCurrentUser(currentUser, dto),
    ).resolves.toEqual(expected);
    expect(userService.deleteCurrentUser).toHaveBeenCalledWith(
      currentUser,
      dto,
    );
  });
});
