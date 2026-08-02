import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { CurrentUser } from '../auth/current-user.decorator';
import { type CurrentUserContext } from '../auth/auth.types';
import {
  JwtUserAuthGuard,
  OptionalUserAuthGuard,
} from '../auth/jwt-user-auth.guard';
import { DeleteAccountDto } from './dto/delete-account.dto';
import { UserFollowListQueryDto } from './dto/user-follow-list-query.dto';
import { UpdateCurrentUserDto } from './dto/update-current-user.dto';
import { UserService } from './user.service';

type UploadedUserAvatarFile = {
  buffer: Buffer;
  size: number;
  mimetype: string;
  originalname: string;
};

function resolvePublicBaseUrl(request: Request) {
  const configuredBaseUrl = process.env.PUBLIC_BASE_URL?.trim();

  if (configuredBaseUrl) {
    return configuredBaseUrl.replace(/\/+$/, '');
  }

  const forwardedProtocol = request.headers['x-forwarded-proto'];
  const protocolValue = Array.isArray(forwardedProtocol)
    ? forwardedProtocol[0]
    : forwardedProtocol?.split(',')[0];
  const protocol =
    protocolValue === 'https' || protocolValue === 'http'
      ? protocolValue
      : request.protocol;

  return `${protocol}://${request.get('host')}`;
}

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtUserAuthGuard)
  @Patch('me')
  updateCurrentUser(
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() dto: UpdateCurrentUserDto,
  ) {
    return this.userService.updateCurrentUser(currentUser, dto);
  }

  @HttpCode(200)
  @UseGuards(JwtUserAuthGuard)
  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('file'))
  uploadCurrentUserAvatar(
    @CurrentUser() currentUser: CurrentUserContext,
    @UploadedFile() file: UploadedUserAvatarFile | undefined,
    @Req() request: Request,
  ) {
    if (!file) {
      throw new BadRequestException('USER_AVATAR_FILE_REQUIRED');
    }

    return this.userService.uploadCurrentUserAvatar(
      currentUser,
      file,
      resolvePublicBaseUrl(request),
    );
  }

  @HttpCode(200)
  @UseGuards(JwtUserAuthGuard)
  @Post('me/delete-account')
  deleteCurrentUser(
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() dto: DeleteAccountDto,
  ) {
    return this.userService.deleteCurrentUser(currentUser, dto);
  }

  @UseGuards(OptionalUserAuthGuard)
  @Get(':userId/profile')
  getUserProfile(
    @CurrentUser() currentUser: CurrentUserContext | null,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.userService.getUserProfile(currentUser, userId);
  }

  @HttpCode(200)
  @UseGuards(JwtUserAuthGuard)
  @Post(':userId/follow')
  followUser(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.userService.followUser(currentUser, userId);
  }

  @HttpCode(200)
  @UseGuards(JwtUserAuthGuard)
  @Delete(':userId/follow')
  unfollowUser(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.userService.unfollowUser(currentUser, userId);
  }

  @UseGuards(OptionalUserAuthGuard)
  @Get(':userId/following')
  getFollowingUsers(
    @CurrentUser() currentUser: CurrentUserContext | null,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query() query: UserFollowListQueryDto,
  ) {
    return this.userService.getFollowingUsers(currentUser, userId, query);
  }

  @UseGuards(OptionalUserAuthGuard)
  @Get(':userId/followers')
  getFollowerUsers(
    @CurrentUser() currentUser: CurrentUserContext | null,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query() query: UserFollowListQueryDto,
  ) {
    return this.userService.getFollowerUsers(currentUser, userId, query);
  }
}
