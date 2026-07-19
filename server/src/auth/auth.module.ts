import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import {
  JwtUserAuthGuard,
  LogoutAuthGuard,
  OptionalUserAuthGuard,
} from './jwt-user-auth.guard';
import { JwtService } from './jwt.service';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtService,
    JwtUserAuthGuard,
    OptionalUserAuthGuard,
    LogoutAuthGuard,
  ],
  exports: [
    AuthService,
    JwtService,
    JwtUserAuthGuard,
    OptionalUserAuthGuard,
    LogoutAuthGuard,
  ],
})
export class AuthModule {}
