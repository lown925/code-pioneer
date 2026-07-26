import { Type } from 'class-transformer';
import { IsEnum, IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import { BattleMode, BattleResult } from '../../../generated/prisma/enums';

const BATTLE_HISTORY_RESULTS = [
  BattleResult.WIN,
  BattleResult.LOSS,
  BattleResult.DRAW,
] as const;

export class BattleHistoryQueryDto {
  @IsOptional()
  @IsEnum(BattleMode)
  mode?: BattleMode;

  @IsOptional()
  @IsIn(BATTLE_HISTORY_RESULTS)
  result?: (typeof BATTLE_HISTORY_RESULTS)[number];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;
}
