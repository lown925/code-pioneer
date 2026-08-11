import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Body,
  Query,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../auth/current-user.decorator';
import { type CurrentUserContext } from '../auth/auth.types';
import {
  JwtUserAuthGuard,
  OptionalUserAuthGuard,
} from '../auth/jwt-user-auth.guard';
import { CommunityService } from './community.service';
import { CommunityAvailabilityGuard } from './community-availability';
import { CreateCommunityCommentDto } from './dto/create-community-comment.dto';
import { CreateCommunityPostDto } from './dto/create-community-post.dto';
import {
  CommunityCursorQueryDto,
  CommunityPostsQueryDto,
  CommunityUserPostsQueryDto,
} from './dto/community-posts-query.dto';

type UploadedCommunityImageFile = {
  buffer: Buffer;
  size: number;
  mimetype: string;
  originalname: string;
};

@Controller()
@UseGuards(CommunityAvailabilityGuard)
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @UseGuards(OptionalUserAuthGuard)
  @Get('community/categories')
  getCategories() {
    return this.communityService.getCategories();
  }

  @UseGuards(OptionalUserAuthGuard)
  @Get('community/posts')
  getPosts(
    @CurrentUser() currentUser: CurrentUserContext | null,
    @Query() query: CommunityPostsQueryDto,
  ) {
    return this.communityService.getPosts(currentUser, query);
  }

  @UseGuards(JwtUserAuthGuard)
  @HttpCode(200)
  @Post('community/posts')
  createPost(
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() dto: CreateCommunityPostDto,
  ) {
    return this.communityService.createPost(currentUser, dto);
  }

  @UseGuards(JwtUserAuthGuard)
  @HttpCode(200)
  @Post('community/images')
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(
    @CurrentUser() currentUser: CurrentUserContext,
    @UploadedFile() file: UploadedCommunityImageFile | undefined,
  ) {
    if (!file) {
      throw new BadRequestException('COMMUNITY_IMAGE_FILE_REQUIRED');
    }

    return this.communityService.uploadImage(currentUser, file);
  }

  @UseGuards(OptionalUserAuthGuard)
  @Get('community/posts/:postId')
  getPostDetail(
    @CurrentUser() currentUser: CurrentUserContext | null,
    @Param('postId', ParseUUIDPipe) postId: string,
  ) {
    return this.communityService.getPostDetail(currentUser, postId);
  }

  @UseGuards(OptionalUserAuthGuard)
  @Get('community/posts/:postId/comments')
  getComments(
    @CurrentUser() currentUser: CurrentUserContext | null,
    @Param('postId', ParseUUIDPipe) postId: string,
  ) {
    return this.communityService.getComments(currentUser, postId);
  }

  @UseGuards(JwtUserAuthGuard)
  @HttpCode(200)
  @Post('community/posts/:postId/comments')
  createComment(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param('postId', ParseUUIDPipe) postId: string,
    @Body() dto: CreateCommunityCommentDto,
  ) {
    return this.communityService.createComment(currentUser, postId, dto);
  }

  @UseGuards(JwtUserAuthGuard)
  @HttpCode(200)
  @Delete('community/posts/:postId')
  deletePost(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param('postId', ParseUUIDPipe) postId: string,
  ) {
    return this.communityService.deletePost(currentUser, postId);
  }

  @UseGuards(JwtUserAuthGuard)
  @HttpCode(200)
  @Post('community/posts/:postId/favorite')
  favoritePost(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param('postId', ParseUUIDPipe) postId: string,
  ) {
    return this.communityService.favoritePost(currentUser, postId);
  }

  @UseGuards(JwtUserAuthGuard)
  @HttpCode(200)
  @Delete('community/posts/:postId/favorite')
  unfavoritePost(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param('postId', ParseUUIDPipe) postId: string,
  ) {
    return this.communityService.unfavoritePost(currentUser, postId);
  }

  @UseGuards(JwtUserAuthGuard)
  @HttpCode(200)
  @Post('community/posts/:postId/like')
  likePost(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param('postId', ParseUUIDPipe) postId: string,
  ) {
    return this.communityService.likePost(currentUser, postId);
  }

  @UseGuards(JwtUserAuthGuard)
  @HttpCode(200)
  @Delete('community/posts/:postId/like')
  unlikePost(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param('postId', ParseUUIDPipe) postId: string,
  ) {
    return this.communityService.unlikePost(currentUser, postId);
  }

  @UseGuards(JwtUserAuthGuard)
  @Get('users/me/community/favorites')
  getMyFavorites(
    @CurrentUser() currentUser: CurrentUserContext,
    @Query() query: CommunityCursorQueryDto,
  ) {
    return this.communityService.getMyFavorites(currentUser, query);
  }

  @UseGuards(JwtUserAuthGuard)
  @Get('users/me/community/history')
  getMyHistory(
    @CurrentUser() currentUser: CurrentUserContext,
    @Query() query: CommunityCursorQueryDto,
  ) {
    return this.communityService.getMyHistory(currentUser, query);
  }

  @UseGuards(JwtUserAuthGuard)
  @HttpCode(200)
  @Delete('users/me/community/history/:postId')
  deleteMyHistoryItem(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param('postId', ParseUUIDPipe) postId: string,
  ) {
    return this.communityService.deleteMyHistoryItem(currentUser, postId);
  }

  @UseGuards(JwtUserAuthGuard)
  @HttpCode(200)
  @Delete('users/me/community/history')
  clearMyHistory(@CurrentUser() currentUser: CurrentUserContext) {
    return this.communityService.clearMyHistory(currentUser);
  }

  @UseGuards(JwtUserAuthGuard)
  @Get('users/me/community/posts')
  getMyPosts(
    @CurrentUser() currentUser: CurrentUserContext,
    @Query() query: CommunityUserPostsQueryDto,
  ) {
    return this.communityService.getMyPosts(currentUser, query);
  }

  @UseGuards(JwtUserAuthGuard)
  @Get('users/me/community/summary')
  getSummary(@CurrentUser() currentUser: CurrentUserContext) {
    return this.communityService.getSummary(currentUser);
  }
}
