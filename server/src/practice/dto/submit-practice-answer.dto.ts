import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class SubmitPracticeAnswerDto {
  @IsUUID()
  questionId!: string;

  @IsOptional()
  @IsUUID()
  selectedOptionId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  answerText?: string;
}
