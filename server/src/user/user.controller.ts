import {
  Body,
  Controller,
  HttpCode,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { type CurrentUserContext } from '../auth/auth.types';
import { JwtUserAuthGuard } from '../auth/jwt-user-auth.guard';
import { DeleteAccountDto } from './dto/delete-account.dto';
import { UpdateCurrentUserDto } from './dto/update-current-user.dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtUserAuthGuard)
  @Patch('me')
  updateCurrentUser(
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() dto: UpdateCurrentUserDto,
  ) {
    return this.userService.updateCurrentUser(currentUser, dto);
  }

  @HttpCode(200)
  @UseGuards(JwtUserAuthGuard)
  @Post('me/delete-account')
  deleteCurrentUser(
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() dto: DeleteAccountDto,
  ) {
    return this.userService.deleteCurrentUser(currentUser, dto);
  }
}
