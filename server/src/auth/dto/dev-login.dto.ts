import { IsIn } from 'class-validator';

export const DEV_LOGIN_ACCOUNTS = ['player-a', 'player-b'] as const;

export type DevLoginAccount = (typeof DEV_LOGIN_ACCOUNTS)[number];

export class DevLoginDto {
  @IsIn(DEV_LOGIN_ACCOUNTS)
  account!: DevLoginAccount;
}
