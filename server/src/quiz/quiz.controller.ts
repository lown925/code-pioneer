import {
  Controller,
  DefaultValuePipe,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { type CurrentUserContext } from '../auth/auth.types';
import { JwtUserAuthGuard } from '../auth/jwt-user-auth.guard';
import { SubmitChapterQuizDto } from './dto/submit-chapter-quiz.dto';
import { QuizService } from './quiz.service';

@UseGuards(JwtUserAuthGuard)
@Controller()
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Get('chapters/:chapterId/quiz')
  getChapterQuiz(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param('chapterId', ParseUUIDPipe) chapterId: string,
  ) {
    return this.quizService.getChapterQuiz(currentUser, chapterId);
  }

  @HttpCode(200)
  @Post('chapters/:chapterId/quiz/submit')
  submitChapterQuiz(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param('chapterId', ParseUUIDPipe) chapterId: string,
    @Body() dto: SubmitChapterQuizDto,
  ) {
    return this.quizService.submitChapterQuiz(currentUser, chapterId, dto);
  }

  @Get('chapters/:chapterId/quiz/attempts')
  listChapterQuizAttempts(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param('chapterId', ParseUUIDPipe) chapterId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
  ) {
    return this.quizService.listChapterQuizAttempts(
      currentUser,
      chapterId,
      page,
      pageSize,
    );
  }

  @Get('quiz-attempts/:attemptId')
  getQuizAttemptDetail(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param('attemptId', ParseUUIDPipe) attemptId: string,
  ) {
    return this.quizService.getQuizAttemptDetail(currentUser, attemptId);
  }
}
