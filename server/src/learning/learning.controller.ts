import {
  BadRequestException,
  Controller,
  Delete,
  DefaultValuePipe,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { LearningStatus } from '../../generated/prisma/enums';
import { CurrentUser } from '../auth/current-user.decorator';
import { type CurrentUserContext } from '../auth/auth.types';
import { JwtUserAuthGuard } from '../auth/jwt-user-auth.guard';
import { LearningService } from './learning.service';

@UseGuards(JwtUserAuthGuard)
@Controller()
export class LearningController {
  constructor(private readonly learningService: LearningService) {}

  @HttpCode(200)
  @Post('courses/:courseId/start')
  startCourse(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param('courseId', ParseUUIDPipe) courseId: string,
  ) {
    return this.learningService.startCourse(currentUser, courseId);
  }

  @HttpCode(200)
  @Post('courses/:courseId/selection')
  selectCourse(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param('courseId', ParseUUIDPipe) courseId: string,
  ) {
    return this.learningService.selectCourse(currentUser, courseId);
  }

  @HttpCode(200)
  @Delete('courses/:courseId/selection')
  deselectCourse(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param('courseId', ParseUUIDPipe) courseId: string,
  ) {
    return this.learningService.deselectCourse(currentUser, courseId);
  }

  @Get('courses/:courseId/progress')
  getCourseProgress(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param('courseId', ParseUUIDPipe) courseId: string,
  ) {
    return this.learningService.getCourseProgress(currentUser, courseId);
  }

  @HttpCode(200)
  @Post('chapters/:chapterId/start')
  startChapter(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param('chapterId', ParseUUIDPipe) chapterId: string,
  ) {
    return this.learningService.startChapter(currentUser, chapterId);
  }

  @HttpCode(200)
  @Post('chapters/:chapterId/complete')
  completeChapter(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param('chapterId', ParseUUIDPipe) chapterId: string,
  ) {
    return this.learningService.completeChapter(currentUser, chapterId);
  }

  @Get('users/me/learning')
  listMyLearning(
    @CurrentUser() currentUser: CurrentUserContext,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
    @Query('status') status?: string,
  ) {
    if (
      status !== undefined &&
      status !== LearningStatus.LEARNING &&
      status !== LearningStatus.COMPLETED
    ) {
      throw new BadRequestException('INVALID_PARAMETER');
    }

    return this.learningService.listMyLearning(
      currentUser,
      page,
      pageSize,
      status,
    );
  }

  @Get('users/me/learning-summary')
  getLearningSummary(@CurrentUser() currentUser: CurrentUserContext) {
    return this.learningService.getLearningSummary(currentUser);
  }
}
