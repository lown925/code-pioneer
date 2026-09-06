import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { GrowthController } from './growth.controller';
import { GrowthService } from './growth.service';
import { GrowthAiPromptService } from './ai-prompt.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [GrowthController],
  providers: [GrowthService, GrowthAiPromptService],
  exports: [GrowthService, GrowthAiPromptService],
})
export class GrowthModule {}
