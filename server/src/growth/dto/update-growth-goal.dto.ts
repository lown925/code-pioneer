import { IsDateString, IsOptional, IsUUID, Matches } from 'class-validator';

export class UpdateGrowthGoalDto {
  @IsOptional()
  @IsUUID()
  courseId?: string;

  @IsOptional()
  @IsDateString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  targetDate?: string;
}
