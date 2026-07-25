import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { BattleController } from './battle.controller';
import { BattleAnswerService } from './battle-answer.service';
import { BattleDomainService } from './battle-domain.service';
import { BattleFriendRoomService } from './battle-friend-room.service';
import { BattleMatchmakingService } from './battle-matchmaking.service';
import { BattleNormalizationService } from './battle-normalization.service';
import { BattleQuestionService } from './battle-question.service';
import { BattleRatingService } from './battle-rating.service';
import { BattleReadyService } from './battle-ready.service';
import { BattleRoomService } from './battle-room.service';
import { BattleScoreService } from './battle-score.service';
import { BattleTokenService } from './battle-token.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [BattleController],
  providers: [
    BattleScoreService,
    BattleRatingService,
    BattleDomainService,
    BattleTokenService,
    BattleRoomService,
    BattleNormalizationService,
    BattleQuestionService,
    BattleReadyService,
    BattleAnswerService,
    BattleMatchmakingService,
    BattleFriendRoomService,
  ],
  exports: [
    BattleScoreService,
    BattleRatingService,
    BattleDomainService,
    BattleTokenService,
    BattleRoomService,
    BattleNormalizationService,
    BattleQuestionService,
    BattleReadyService,
    BattleAnswerService,
    BattleMatchmakingService,
    BattleFriendRoomService,
  ],
})
export class BattleModule {}
