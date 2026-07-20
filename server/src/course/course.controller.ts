import {
  BadRequestException,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { type CurrentUserContext } from '../auth/auth.types';
import { OptionalUserAuthGuard } from '../auth/jwt-user-auth.guard';
import {
  CourseDifficultyValue,
  COURSE_DIFFICULTIES,
  CourseService,
} from './course.service';

@Controller()
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get('courses')
  @UseGuards(OptionalUserAuthGuard)
  listCourses(
    @CurrentUser() currentUser: CurrentUserContext | null,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize: number,
    @Query('difficulty') difficulty?: string,
  ) {
    if (page < 1) {
      throw new BadRequestException('page must be greater than 0');
    }

    if (pageSize < 1) {
      throw new BadRequestException('pageSize must be greater than 0');
    }

    if (
      difficulty !== undefined &&
      !COURSE_DIFFICULTIES.includes(difficulty as CourseDifficultyValue)
    ) {
      throw new BadRequestException('Invalid difficulty');
    }

    return this.courseService.listCourses(
      page,
      pageSize,
      difficulty as CourseDifficultyValue | undefined,
      currentUser,
    );
  }

  @Get('courses/:courseId')
  @UseGuards(OptionalUserAuthGuard)
  getCourseDetail(
    @CurrentUser() currentUser: CurrentUserContext | null,
    @Param('courseId', ParseUUIDPipe) courseId: string,
  ) {
    return this.courseService.getCourseDetail(courseId, currentUser);
  }

  @Get('chapters/:chapterId')
  @UseGuards(OptionalUserAuthGuard)
  getChapterDetail(
    @CurrentUser() currentUser: CurrentUserContext | null,
    @Param('chapterId', ParseUUIDPipe) chapterId: string,
  ) {
    return this.courseService.getChapterDetail(chapterId, currentUser);
  }
}
