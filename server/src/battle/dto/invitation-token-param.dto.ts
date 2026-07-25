import { IsString, Length, Matches } from 'class-validator';

const INVITATION_TOKEN_PATTERN = /^[A-Za-z0-9_-]+$/;

export class InvitationTokenParamDto {
  @IsString()
  @Length(16, 128)
  @Matches(INVITATION_TOKEN_PATTERN)
  invitationToken!: string;
}
