import { Transform } from 'class-transformer';
import { IsString, Length, Matches } from 'class-validator';

const INVITE_CODE_PATTERN = /^[A-Z2-9]+$/;

export class InviteCodeParamDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsString()
  @Length(6, 6)
  @Matches(INVITE_CODE_PATTERN)
  inviteCode!: string;
}
