import { Transform, Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Length, Matches, Max, Min } from 'class-validator';

export class BattleLeaderboardQueryDto {
  @IsOptional()
  @IsString()
  @Length(3, 64)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  professionalTrackKey?: string;
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsString()
  @Length(2, 32)
  @Matches(/^[A-Z][A-Z0-9_]*$/)
  skill?: string;

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
