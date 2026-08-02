import { Body, Controller, Get, HttpCode, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import type { CurrentUserContext } from '../auth/auth.types';
import { JwtUserAuthGuard } from '../auth/jwt-user-auth.guard';
import { CreatePracticeAttemptDto } from './dto/create-practice-attempt.dto';
import { SubmitPracticeAnswerDto } from './dto/submit-practice-answer.dto';
import { PracticeService } from './practice.service';

@UseGuards(JwtUserAuthGuard)
@Controller('practice')
export class PracticeController {
  constructor(private readonly practiceService: PracticeService) {}

  @Get('targets')
  getTargets(@CurrentUser() currentUser: CurrentUserContext) {
    return this.practiceService.getTargets(currentUser);
  }

  @HttpCode(200)
  @Post('attempts')
  createAttempt(
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() dto: CreatePracticeAttemptDto,
  ) {
    return this.practiceService.createAttempt(currentUser, dto);
  }

  @HttpCode(200)
  @Post('attempts/:attemptId/answers')
  submitAnswer(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param('attemptId', ParseUUIDPipe) attemptId: string,
    @Body() dto: SubmitPracticeAnswerDto,
  ) {
    return this.practiceService.submitAnswer(currentUser, attemptId, dto);
  }
}
