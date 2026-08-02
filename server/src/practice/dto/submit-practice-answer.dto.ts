import { IsUUID } from 'class-validator';

export class SubmitPracticeAnswerDto {
  @IsUUID()
  questionId!: string;

  @IsUUID()
  selectedOptionId!: string;
}
