import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
  IsHttpsUrlConstraint,
  UpdateCurrentUserDto,
} from './update-current-user.dto';

describe('UpdateCurrentUserDto', () => {
  it('trims nickname and avatarUrl before validation', async () => {
    const dto = plainToInstance(UpdateCurrentUserDto, {
      nickname: '  码站学员  ',
      avatarUrl: '  https://cdn.example.com/avatar.png  ',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.nickname).toBe('码站学员');
    expect(dto.avatarUrl).toBe('https://cdn.example.com/avatar.png');
  });

  it('rejects blank nickname after trimming', async () => {
    const dto = plainToInstance(UpdateCurrentUserDto, {
      nickname: '   ',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
  });

  it('rejects nickname longer than 30 characters', async () => {
    const dto = plainToInstance(UpdateCurrentUserDto, {
      nickname: 'a'.repeat(31),
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
  });

  it('accepts https avatar URLs up to 2048 characters', async () => {
    const suffix = 'a'.repeat(2024);
    const dto = plainToInstance(UpdateCurrentUserDto, {
      avatarUrl: `https://example.com/${suffix}`,
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it.each([
    'http://example.com/avatar.png',
    'data:text/plain,hello',
    'file:///avatar.png',
    'javascript:alert(1)',
    'ftp://example.com/avatar.png',
    'not-a-url',
    '',
    '   ',
  ])('rejects invalid avatarUrl: %s', async (avatarUrl) => {
    const dto = plainToInstance(UpdateCurrentUserDto, {
      avatarUrl,
    });

    const errors = await validate(dto);

    expect(errors).not.toHaveLength(0);
  });

  it('rejects avatarUrl longer than 2048 characters', async () => {
    const dto = plainToInstance(UpdateCurrentUserDto, {
      avatarUrl: `https://example.com/${'a'.repeat(2049)}`,
    });

    const errors = await validate(dto);

    expect(errors).not.toHaveLength(0);
  });

  it('uses the https URL validator directly', () => {
    const validator = new IsHttpsUrlConstraint();

    expect(validator.validate('https://example.com/avatar.png')).toBe(true);
    expect(validator.validate('http://example.com/avatar.png')).toBe(false);
  });
});
