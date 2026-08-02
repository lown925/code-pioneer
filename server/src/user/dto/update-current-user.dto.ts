import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  Validate,
  ValidatorConstraint,
  type ValidatorConstraintInterface,
} from 'class-validator';

function trimString(value: unknown) {
  return typeof value === 'string' ? value.trim() : value;
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
}
