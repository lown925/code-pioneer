import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { PracticeController } from './practice.controller';
import { PracticeService } from './practice.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [PracticeController],
  providers: [PracticeService],
})
export class PracticeModule {}
