import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { type CurrentUserContext } from '../auth/auth.types';
import { JwtUserAuthGuard } from '../auth/jwt-user-auth.guard';
import { GetWrongQuestionsQueryDto } from './dto/get-wrong-questions-query.dto';
import { WrongQuestionService } from './wrong-question.service';

@UseGuards(JwtUserAuthGuard)
@Controller('users/me/wrong-questions')
export class WrongQuestionController {
  constructor(private readonly wrongQuestionService: WrongQuestionService) {}

  @Get('statistics')
  getStatistics(@CurrentUser() currentUser: CurrentUserContext) {
    return this.wrongQuestionService.getStatistics(currentUser);
  }

  @Get(':questionId')
  getDetail(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param('questionId', ParseUUIDPipe) questionId: string,
    @Query() query: GetWrongQuestionsQueryDto,
  ) {
    return this.wrongQuestionService.getDetail(
      currentUser,
      questionId,
      query.source,
    );
  }

  @Get()
  getList(
    @CurrentUser() currentUser: CurrentUserContext,
    @Query() query: GetWrongQuestionsQueryDto,
  ) {
    return this.wrongQuestionService.getList(currentUser, query);
  }
}
