import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { type CurrentUserContext } from '../auth/auth.types';
import { JwtUserAuthGuard } from '../auth/jwt-user-auth.guard';
import { BattleFriendRoomService } from './battle-friend-room.service';
import { BattleAnswerService } from './battle-answer.service';
import { BattleMatchmakingService } from './battle-matchmaking.service';
import { BattleQuestionService } from './battle-question.service';
import { BattleReadyService } from './battle-ready.service';
import { BattleRoomService } from './battle-room.service';
import { BattleIdParamDto } from './dto/battle-id-param.dto';
import { InvitationTokenParamDto } from './dto/invitation-token-param.dto';
import { SubmitBattleAnswerDto } from './dto/submit-battle-answer.dto';

@UseGuards(JwtUserAuthGuard)
@Controller('battles')
export class BattleController {
  constructor(
    private readonly battleMatchmakingService: BattleMatchmakingService,
    private readonly battleFriendRoomService: BattleFriendRoomService,
    private readonly battleReadyService: BattleReadyService,
    private readonly battleQuestionService: BattleQuestionService,
    private readonly battleAnswerService: BattleAnswerService,
    private readonly battleRoomService: BattleRoomService,
  ) {}

  @Post('matchmaking/join')
  joinMatchmaking(@CurrentUser() currentUser: CurrentUserContext) {
    return this.battleMatchmakingService.joinMatchmaking(currentUser);
  }

  @Get('matchmaking/status')
  getMatchmakingStatus(@CurrentUser() currentUser: CurrentUserContext) {
    return this.battleMatchmakingService.getMatchmakingStatus(currentUser);
  }

  @HttpCode(200)
  @Delete('matchmaking')
  cancelMatchmaking(@CurrentUser() currentUser: CurrentUserContext) {
    return this.battleMatchmakingService.cancelMatchmaking(currentUser);
  }

  @Post('friend-rooms')
  createFriendRoom(@CurrentUser() currentUser: CurrentUserContext) {
    return this.battleFriendRoomService.createFriendRoom(currentUser);
  }

  @Get('friend-rooms/:invitationToken')
  previewFriendRoom(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param() params: InvitationTokenParamDto,
  ) {
    return this.battleFriendRoomService.previewFriendRoom(
      currentUser,
      params.invitationToken,
    );
  }

  @Post('friend-rooms/:invitationToken/join')
  joinFriendRoom(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param() params: InvitationTokenParamDto,
  ) {
    return this.battleFriendRoomService.joinFriendRoom(
      currentUser,
      params.invitationToken,
    );
  }

  @Post(':battleId/ready')
  readyBattle(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param() params: BattleIdParamDto,
  ) {
    return this.battleReadyService.readyBattle(currentUser, params.battleId);
  }

  @Get(':battleId/questions')
  getBattleQuestions(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param() params: BattleIdParamDto,
  ) {
    return this.battleQuestionService.getBattleQuestions(
      currentUser.id,
      params.battleId,
    );
  }

  @Post(':battleId/answers')
  submitBattleAnswer(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param() params: BattleIdParamDto,
    @Body() dto: SubmitBattleAnswerDto,
  ) {
    return this.battleAnswerService.submitAnswer(
      currentUser.id,
      params.battleId,
      dto,
    );
  }

  @Get(':battleId')
  getBattleRoom(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param() params: BattleIdParamDto,
  ) {
    return this.battleRoomService.getBattleRoom(currentUser, params.battleId);
  }
}
