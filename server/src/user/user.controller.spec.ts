import { Test, type TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { JwtUserAuthGuard } from '../auth/jwt-user-auth.guard';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let userController: UserController;
  const userService = {
    updateCurrentUser: jest.fn(),
    uploadCurrentUserAvatar: jest.fn(),
    deleteCurrentUser: jest.fn(),
  };
  const originalPublicBaseUrl = process.env.PUBLIC_BASE_URL;

  beforeEach(async () => {
    process.env.PUBLIC_BASE_URL = 'https://ffgdvydkrqaz.sealoshzh.site';
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

  afterAll(() => {
    if (originalPublicBaseUrl === undefined) {
      delete process.env.PUBLIC_BASE_URL;
      return;
    }

    process.env.PUBLIC_BASE_URL = originalPublicBaseUrl;
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

  it('delegates avatar uploads with the resolved public base URL', async () => {
    const currentUser = {
      id: 'user-id',
      sessionId: 'session-id',
      tokenType: 'USER' as const,
      role: 'NORMAL' as const,
    };
    const file = {
      buffer: Buffer.from('avatar'),
      size: 6,
      mimetype: 'image/png',
      originalname: 'avatar.png',
    };
    const expected = {
      success: true,
      data: {
        avatarUrl:
          'https://ffgdvydkrqaz.sealoshzh.site/uploads/avatars/user-id/avatar.png',
      },
    };

    userService.uploadCurrentUserAvatar.mockResolvedValue(expected);

    await expect(
      userController.uploadCurrentUserAvatar(currentUser, file),
    ).resolves.toEqual(expected);
    expect(userService.uploadCurrentUserAvatar).toHaveBeenCalledWith(
      currentUser,
      file,
      'https://ffgdvydkrqaz.sealoshzh.site',
    );
  });

  it('rejects avatar uploads without a file', () => {
    const currentUser = {
      id: 'user-id',
      sessionId: 'session-id',
      tokenType: 'USER' as const,
      role: 'NORMAL' as const,
    };

    expect(() =>
      userController.uploadCurrentUserAvatar(currentUser, undefined),
    ).toThrow(BadRequestException);
  });

  it.each([undefined, 'http://127.0.0.1:3000'])(
    'rejects unsafe PUBLIC_BASE_URL values (%s)',
    async (publicBaseUrl) => {
      if (publicBaseUrl === undefined) {
        delete process.env.PUBLIC_BASE_URL;
      } else {
        process.env.PUBLIC_BASE_URL = publicBaseUrl;
      }

      expect(() =>
        userController.uploadCurrentUserAvatar(
          {
            id: 'user-id',
            sessionId: 'session-id',
            tokenType: 'USER',
            role: 'NORMAL',
          },
          {
            buffer: Buffer.from('avatar'),
            size: 6,
            mimetype: 'image/png',
            originalname: 'avatar.png',
          },
        ),
      ).toThrow(InternalServerErrorException);
    },
  );
});
