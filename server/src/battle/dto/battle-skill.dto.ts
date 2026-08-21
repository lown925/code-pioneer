import { Transform } from 'class-transformer';
import { IsOptional, IsString, Length, Matches } from 'class-validator';

const BATTLE_SKILL_CODE_PATTERN = /^[A-Z][A-Z0-9_]*$/;

export class BattleSkillDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsOptional()
  @IsString()
  @Length(2, 32)
  @Matches(BATTLE_SKILL_CODE_PATTERN)
  skill?: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsOptional()
  @IsString()
  @Length(3, 64)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  professionalTrackKey?: string;
}
