import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import type { CurrentUserContext } from '../auth/auth.types';
import { JwtUserAuthGuard } from '../auth/jwt-user-auth.guard';
import { GrowthOverviewQueryDto } from './dto/growth-overview-query.dto';
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
}
