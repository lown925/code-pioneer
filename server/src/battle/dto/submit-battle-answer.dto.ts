import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Min,
  ValidateNested,
} from 'class-validator';

export class SubmitBattleAnswerPayloadDto {
  @IsOptional()
  @IsUUID()
  optionId?: string;

  @IsOptional()
  @IsString()
  value?: string;
}

export class SubmitBattleAnswerDto {
  @IsUUID()
  battleQuestionId!: string;

  @IsString()
  @Length(1, 128)
  clientRequestId!: string;

  @IsInt()
  @Min(1)
  answerVersion!: number;

  @ValidateNested()
  @Type(() => SubmitBattleAnswerPayloadDto)
  answer!: SubmitBattleAnswerPayloadDto;
}
