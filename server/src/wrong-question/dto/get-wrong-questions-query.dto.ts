import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { WRONG_QUESTION_SOURCES } from '../wrong-question.types';

export class GetWrongQuestionsQueryDto {
  @IsOptional()
  @IsIn(WRONG_QUESTION_SOURCES)
  source?: (typeof WRONG_QUESTION_SOURCES)[number];

  @IsOptional()
  @IsUUID()
  courseId?: string;

  @IsOptional()
  @IsUUID()
  chapterId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  pageSize?: number;
}
