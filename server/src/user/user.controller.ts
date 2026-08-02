import {
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
  UseGuards,
} from '@nestjs/common';
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
