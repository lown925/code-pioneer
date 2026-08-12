import { Transform } from 'class-transformer';
import { IsString, Length, Matches } from 'class-validator';

const BATTLE_SKILL_CODE_PATTERN = /^[A-Z][A-Z0-9_]*$/;

export class BattleSkillDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsString()
  @Length(2, 32)
  @Matches(BATTLE_SKILL_CODE_PATTERN)
  skill!: string;
}
