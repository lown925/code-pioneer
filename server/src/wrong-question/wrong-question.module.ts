import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { WrongQuestionController } from './wrong-question.controller';
import { WrongQuestionService } from './wrong-question.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [WrongQuestionController],
  providers: [WrongQuestionService],
})
export class WrongQuestionModule {}
