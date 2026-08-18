import { IsIn, IsOptional } from 'class-validator';
import type { GrowthRange } from '../growth.types';

export class GrowthOverviewQueryDto {
  @IsOptional()
  @IsIn(['7d', '30d'])
  range?: GrowthRange = '7d';
}
