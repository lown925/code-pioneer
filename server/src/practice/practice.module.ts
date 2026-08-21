import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CourseModule } from '../course/course.module';
import { PrismaModule } from '../prisma/prisma.module';
import { PracticeController } from './practice.controller';
import { PracticeService } from './practice.service';

@Module({
  imports: [PrismaModule, AuthModule, CourseModule],
  controllers: [PracticeController],
  providers: [PracticeService],
})
export class PracticeModule {}
