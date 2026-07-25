import { IsUUID } from 'class-validator';

export class BattleIdParamDto {
  @IsUUID()
  battleId!: string;
}
