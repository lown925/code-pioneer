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

  it('accepts localhost http avatar URLs outside production', async () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    try {
      const dto = plainToInstance(UpdateCurrentUserDto, {
        avatarUrl: 'http://127.0.0.1:3000/uploads/avatars/user/avatar.png',
      });

      await expect(validate(dto)).resolves.toHaveLength(0);
    } finally {
      process.env.NODE_ENV = originalNodeEnv;
    }
  });

  it('rejects localhost http avatar URLs in production', async () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    try {
      const dto = plainToInstance(UpdateCurrentUserDto, {
        avatarUrl: 'http://localhost:3000/uploads/avatars/user/avatar.png',
      });

      expect(await validate(dto)).not.toHaveLength(0);
    } finally {
      process.env.NODE_ENV = originalNodeEnv;
    }
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

  it('accepts and trims Growth preset and custom values', async () => {
    const dto = plainToInstance(UpdateCurrentUserDto, {
      major: '  custom:金融工程  ',
      grade: ' grade.freshman ',
      learningDirection: ' direction.backend ',
      technicalInterests: [' interest.python ', ' custom:Power BI '],
      careerDirection: ' career.backend_engineer ',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto).toMatchObject({
      major: 'custom:金融工程',
      grade: 'grade.freshman',
      learningDirection: 'direction.backend',
      technicalInterests: ['interest.python', 'custom:Power BI'],
      careerDirection: 'career.backend_engineer',
    });
  });

  it('allows null scalar values and an empty interests array for clearing', async () => {
    const dto = plainToInstance(UpdateCurrentUserDto, {
      major: null,
      grade: null,
      learningDirection: null,
      technicalInterests: [],
      careerDirection: null,
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it.each([
    { field: 'major', value: '   ' },
    { field: 'major', value: 'custom:' },
    { field: 'major', value: 'custom:   ' },
    { field: 'major', value: 'direction.backend' },
    { field: 'grade', value: 'major.computer_science' },
    { field: 'learningDirection', value: 'learning.backend' },
    { field: 'careerDirection', value: 'interest.python' },
    { field: 'major', value: `custom:${'a'.repeat(94)}` },
  ])(
    'rejects invalid Growth scalar $field=$value',
    async ({ field, value }) => {
      const dto = plainToInstance(UpdateCurrentUserDto, {
        [field]: value,
      });

      expect(await validate(dto)).not.toHaveLength(0);
    },
  );

  it.each([
    'interest.python',
    null,
    [1],
    ['custom:'],
    ['interest.python', ' interest.python '],
    Array.from({ length: 13 }, (_, index) => `interest.topic_${index}`),
  ])('rejects invalid technicalInterests payload %#', async (value) => {
    const dto = plainToInstance(UpdateCurrentUserDto, {
      technicalInterests: value,
    });

    expect(await validate(dto)).not.toHaveLength(0);
  });
});
