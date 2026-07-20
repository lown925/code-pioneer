import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [CourseController],
  providers: [CourseService],
})
export class CourseModule {}
