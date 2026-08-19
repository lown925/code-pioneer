import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { BattleAiService } from './battle-ai.service';
import { BattleController } from './battle.controller';
import { BattleAnswerService } from './battle-answer.service';
import { BattleDomainService } from './battle-domain.service';
import { BattleFriendRoomService } from './battle-friend-room.service';
import { BattleHistoryService } from './battle-history.service';
import { BattleLeaderboardService } from './battle-leaderboard.service';
import { BattleMatchmakingService } from './battle-matchmaking.service';
import { BattleNormalizationService } from './battle-normalization.service';
import { BattleProfileService } from './battle-profile.service';
import { BattleQuestionService } from './battle-question.service';
import { BattleRatingService } from './battle-rating.service';
import { BattleReadyService } from './battle-ready.service';
import { BattleResultService } from './battle-result.service';
import { BattleRoomService } from './battle-room.service';
import { BattleScoreService } from './battle-score.service';
import { BattleSettlementService } from './battle-settlement.service';
import { BattleSubmitService } from './battle-submit.service';
import { BattleTrainingService } from './battle-training.service';
import { BattleSkillService } from './battle-skill.service';
import { BattleTokenService } from './battle-token.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [BattleController],
  providers: [
    BattleScoreService,
    BattleRatingService,
    BattleDomainService,
    BattleTokenService,
    BattleAiService,
    BattleSettlementService,
    BattleRoomService,
    BattleNormalizationService,
    BattleQuestionService,
    BattleReadyService,
    BattleAnswerService,
    BattleSubmitService,
    BattleTrainingService,
    BattleSkillService,
    BattleResultService,
    BattleProfileService,
    BattleLeaderboardService,
    BattleHistoryService,
    BattleMatchmakingService,
    BattleFriendRoomService,
  ],
  exports: [
    BattleScoreService,
    BattleRatingService,
    BattleDomainService,
    BattleTokenService,
    BattleAiService,
    BattleSettlementService,
    BattleRoomService,
    BattleNormalizationService,
    BattleQuestionService,
    BattleReadyService,
    BattleAnswerService,
    BattleSubmitService,
    BattleTrainingService,
    BattleResultService,
    BattleProfileService,
    BattleLeaderboardService,
    BattleHistoryService,
    BattleMatchmakingService,
    BattleFriendRoomService,
  ],
})
export class BattleModule {}
