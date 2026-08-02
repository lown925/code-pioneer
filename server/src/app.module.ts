import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BattleModule } from './battle/battle.module';
import { CommunityModule } from './community/community.module';
import { CourseModule } from './course/course.module';
import { LearningModule } from './learning/learning.module';
import { PrismaModule } from './prisma/prisma.module';
import { PracticeModule } from './practice/practice.module';
import { QuizModule } from './quiz/quiz.module';
import { UserModule } from './user/user.module';
import { WrongQuestionModule } from './wrong-question/wrong-question.module';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    BattleModule,
    CommunityModule,
    CourseModule,
    LearningModule,
    QuizModule,
    PracticeModule,
    WrongQuestionModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
