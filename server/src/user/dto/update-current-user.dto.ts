import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  Validate,
  ValidateIf,
  ValidatorConstraint,
  type ValidatorConstraintInterface,
} from 'class-validator';

const GROWTH_PROFILE_VALUE_MAX_LENGTH = 100;
const TECHNICAL_INTEREST_MAX_COUNT = 12;
const TECHNICAL_INTEREST_MAX_LENGTH = 80;
const MAJOR_VALUE_PATTERN =
  /^(?:major\.[a-z][a-z0-9_]*|custom:\S(?:[^\r\n\t]*\S)?)$/u;
const GRADE_VALUE_PATTERN =
  /^(?:grade\.[a-z][a-z0-9_]*|custom:\S(?:[^\r\n\t]*\S)?)$/u;
const LEARNING_DIRECTION_VALUE_PATTERN =
  /^(?:direction\.[a-z][a-z0-9_]*|custom:\S(?:[^\r\n\t]*\S)?)$/u;
const TECHNICAL_INTEREST_VALUE_PATTERN =
  /^(?:interest\.[a-z][a-z0-9_]*|custom:\S(?:[^\r\n\t]*\S)?)$/u;
const CAREER_DIRECTION_VALUE_PATTERN =
  /^(?:career\.[a-z][a-z0-9_]*|custom:\S(?:[^\r\n\t]*\S)?)$/u;

function trimString(value: unknown) {
  return typeof value === 'string' ? value.trim() : value;
}

function trimStringArray(value: unknown) {
  return Array.isArray(value) ? value.map((item) => trimString(item)) : value;
}

@ValidatorConstraint({ name: 'isHttpsUrl', async: false })
export class IsHttpsUrlConstraint implements ValidatorConstraintInterface {
  validate(value: unknown) {
    if (typeof value !== 'string') {
      return false;
    }

    try {
      const url = new URL(value);

      if (url.protocol === 'https:') {
        return true;
      }

      return (
        process.env.NODE_ENV !== 'production' &&
        url.protocol === 'http:' &&
        (url.hostname === '127.0.0.1' || url.hostname === 'localhost')
      );
    } catch {
      return false;
    }
  }

  defaultMessage() {
    return 'avatarUrl must be a valid https URL';
  }
}

export class UpdateCurrentUserDto {
  @IsOptional()
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MinLength(1)
  @MaxLength(30)
  nickname?: string;

  @IsOptional()
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MinLength(1)
  @MaxLength(2048)
  @Validate(IsHttpsUrlConstraint)
  avatarUrl?: string;

  @ValidateIf((_object, value) => value !== undefined && value !== null)
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(GROWTH_PROFILE_VALUE_MAX_LENGTH)
  @Matches(MAJOR_VALUE_PATTERN)
  major?: string | null;

  @ValidateIf((_object, value) => value !== undefined && value !== null)
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(GROWTH_PROFILE_VALUE_MAX_LENGTH)
  @Matches(GRADE_VALUE_PATTERN)
  grade?: string | null;

  @ValidateIf((_object, value) => value !== undefined && value !== null)
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(GROWTH_PROFILE_VALUE_MAX_LENGTH)
  @Matches(LEARNING_DIRECTION_VALUE_PATTERN)
  learningDirection?: string | null;

  @ValidateIf((_object, value) => value !== undefined)
  @Transform(({ value }) => trimStringArray(value))
  @IsArray()
  @ArrayMaxSize(TECHNICAL_INTEREST_MAX_COUNT)
  @ArrayUnique()
  @IsString({ each: true })
  @MaxLength(TECHNICAL_INTEREST_MAX_LENGTH, { each: true })
  @Matches(TECHNICAL_INTEREST_VALUE_PATTERN, { each: true })
  technicalInterests?: string[];

  @ValidateIf((_object, value) => value !== undefined && value !== null)
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(GROWTH_PROFILE_VALUE_MAX_LENGTH)
  @Matches(CAREER_DIRECTION_VALUE_PATTERN)
  careerDirection?: string | null;
}
