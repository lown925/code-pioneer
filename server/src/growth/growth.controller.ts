import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import type { CurrentUserContext } from '../auth/auth.types';
import { JwtUserAuthGuard } from '../auth/jwt-user-auth.guard';
import { GrowthOverviewQueryDto } from './dto/growth-overview-query.dto';
import { CreateGrowthGoalDto } from './dto/create-growth-goal.dto';
import { UpdateGrowthGoalDto } from './dto/update-growth-goal.dto';
import { GrowthService } from './growth.service';

@UseGuards(JwtUserAuthGuard)
@Controller('growth')
export class GrowthController {
  constructor(private readonly growthService: GrowthService) {}

  @Get('overview')
  getOverview(
    @CurrentUser() currentUser: CurrentUserContext,
    @Query() query: GrowthOverviewQueryDto,
  ) {
    return this.growthService.getOverview(currentUser.id, query.range ?? '7d');
  }

  @Get('goals/current')
  getCurrentGoal(@CurrentUser() currentUser: CurrentUserContext) {
    return this.growthService.getCurrentGoal(currentUser.id);
  }

  @Post('goals')
  createGoal(
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() input: CreateGrowthGoalDto,
  ) {
    return this.growthService.createGoal(currentUser.id, input);
  }

  @Patch('goals/current')
  updateCurrentGoal(
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() input: UpdateGrowthGoalDto,
  ) {
    return this.growthService.updateCurrentGoal(currentUser.id, input);
  }

  @Delete('goals/current')
  cancelCurrentGoal(@CurrentUser() currentUser: CurrentUserContext) {
    return this.growthService.cancelCurrentGoal(currentUser.id);
  }
}
