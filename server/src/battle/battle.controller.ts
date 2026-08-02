import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { type CurrentUserContext } from '../auth/auth.types';
import { JwtUserAuthGuard } from '../auth/jwt-user-auth.guard';
import { BattleFriendRoomService } from './battle-friend-room.service';
import { BattleHistoryService } from './battle-history.service';
import { BattleAnswerService } from './battle-answer.service';
import { BattleLeaderboardService } from './battle-leaderboard.service';
import { BattleMatchmakingService } from './battle-matchmaking.service';
import { BattleProfileService } from './battle-profile.service';
import { BattleQuestionService } from './battle-question.service';
import { BattleReadyService } from './battle-ready.service';
import { BattleResultService } from './battle-result.service';
import { BattleRoomService } from './battle-room.service';
import { BattleSubmitService } from './battle-submit.service';
import { BattleIdParamDto } from './dto/battle-id-param.dto';
import { BattleHistoryQueryDto } from './dto/battle-history-query.dto';
import { BattleLeaderboardQueryDto } from './dto/battle-leaderboard-query.dto';
import { InviteCodeParamDto } from './dto/invite-code-param.dto';
import { InvitationTokenParamDto } from './dto/invitation-token-param.dto';
import { SubmitBattleAnswerDto } from './dto/submit-battle-answer.dto';

@UseGuards(JwtUserAuthGuard)
@Controller('battles')
export class BattleController {
  constructor(
    private readonly battleMatchmakingService: BattleMatchmakingService,
    private readonly battleFriendRoomService: BattleFriendRoomService,
    private readonly battleProfileService: BattleProfileService,
    private readonly battleLeaderboardService: BattleLeaderboardService,
    private readonly battleHistoryService: BattleHistoryService,
    private readonly battleReadyService: BattleReadyService,
    private readonly battleQuestionService: BattleQuestionService,
    private readonly battleAnswerService: BattleAnswerService,
    private readonly battleSubmitService: BattleSubmitService,
    private readonly battleResultService: BattleResultService,
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

  @Get('profile')
  getBattleProfile(@CurrentUser() currentUser: CurrentUserContext) {
    return this.battleProfileService.getBattleProfile(currentUser.id);
  }

  @Get('leaderboard')
  getBattleLeaderboard(
    @CurrentUser() currentUser: CurrentUserContext,
    @Query() query: BattleLeaderboardQueryDto,
  ) {
    return this.battleLeaderboardService.getLeaderboard(
      currentUser.id,
      query.page,
      query.pageSize,
    );
  }

  @Get('history')
  getBattleHistory(
    @CurrentUser() currentUser: CurrentUserContext,
    @Query() query: BattleHistoryQueryDto,
  ) {
    return this.battleHistoryService.getHistory(currentUser.id, query);
  }

  @Get('history/:battleId')
  getBattleHistoryDetail(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param() params: BattleIdParamDto,
  ) {
    return this.battleHistoryService.getHistoryDetail(
      currentUser.id,
      params.battleId,
    );
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

  @Get('friend-rooms/code/:inviteCode')
  previewFriendRoomByInviteCode(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param() params: InviteCodeParamDto,
  ) {
    return this.battleFriendRoomService.previewFriendRoomByInviteCode(
      currentUser,
      params.inviteCode,
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

  @Post('friend-rooms/code/:inviteCode/join')
  joinFriendRoomByInviteCode(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param() params: InviteCodeParamDto,
  ) {
    return this.battleFriendRoomService.joinFriendRoomByInviteCode(
      currentUser,
      params.inviteCode,
    );
  }

  @HttpCode(200)
  @Delete('friend-rooms/:invitationToken')
  cancelFriendRoom(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param() params: InvitationTokenParamDto,
  ) {
    return this.battleFriendRoomService.cancelFriendRoom(
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

  @HttpCode(200)
  @Post(':battleId/submit')
  submitBattle(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param() params: BattleIdParamDto,
  ) {
    return this.battleSubmitService.submitBattle(currentUser.id, params.battleId);
  }

  @HttpCode(200)
  @Post(':battleId/forfeit')
  forfeitBattle(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param() params: BattleIdParamDto,
  ) {
    return this.battleSubmitService.forfeitBattle(
      currentUser.id,
      params.battleId,
    );
  }

  @Get(':battleId/result')
  getBattleResult(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param() params: BattleIdParamDto,
  ) {
    return this.battleResultService.getBattleResult(currentUser.id, params.battleId);
  }

  @Get(':battleId')
  getBattleRoom(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param() params: BattleIdParamDto,
  ) {
    return this.battleRoomService.getBattleRoom(currentUser, params.battleId);
  }
}
