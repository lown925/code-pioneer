import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CurrentUser } from './current-user.decorator';
import { LogoutAuthGuard } from './jwt-user-auth.guard';
import { WechatLoginDto } from './dto/wechat-login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { type CurrentUserContext } from './auth.types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('wechat-login')
  wechatLogin(@Body() dto: WechatLoginDto) {
    return this.authService.wechatLogin(dto);
  }

  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto);
  }

  @HttpCode(200)
  @UseGuards(LogoutAuthGuard)
  @Post('logout')
  logout(@CurrentUser() currentUser: CurrentUserContext) {
    return this.authService.logout(currentUser);
  }
}
