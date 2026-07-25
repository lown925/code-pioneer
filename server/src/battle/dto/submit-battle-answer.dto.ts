import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsUUID,
  Length,
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

  @ValidateNested()
  @Type(() => SubmitBattleAnswerPayloadDto)
  answer!: SubmitBattleAnswerPayloadDto;
}
