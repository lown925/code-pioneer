import { Type } from 'class-transformer';
import { IsInt, IsUUID, Max, Min } from 'class-validator';

export class CreatePracticeAttemptDto {
  @IsUUID()
  courseId!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  questionCount!: number;
}
