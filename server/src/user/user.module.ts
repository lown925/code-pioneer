import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { IsHttpsUrlConstraint } from './dto/update-current-user.dto';

@Module({
  imports: [AuthModule],
  controllers: [UserController],
  providers: [UserService, IsHttpsUrlConstraint],
  exports: [UserService],
})
export class UserModule {}
