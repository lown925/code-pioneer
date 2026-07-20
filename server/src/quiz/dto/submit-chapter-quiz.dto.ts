import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsUUID, ValidateNested } from 'class-validator';

export class SubmitChapterQuizAnswerDto {
  @IsUUID()
  questionId!: string;

  @IsUUID()
  selectedOptionId!: string;
}

export class SubmitChapterQuizDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SubmitChapterQuizAnswerDto)
  answers!: SubmitChapterQuizAnswerDto[];
}
