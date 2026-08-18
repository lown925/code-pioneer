import { IsDateString, IsUUID, Matches } from 'class-validator';

export class CreateGrowthGoalDto {
  @IsUUID()
  courseId!: string;

  @IsDateString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  targetDate!: string;
}
