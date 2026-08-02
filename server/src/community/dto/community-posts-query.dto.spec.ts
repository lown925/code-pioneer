import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CommunityPostsQueryDto } from './community-posts-query.dto';

describe('CommunityPostsQueryDto', () => {
  it.each([
    'recommended',
    'latest',
    'mostLiked',
    'mostFavorited',
    'mostCommented',
  ])('accepts the supported %s sort mode', async (sort) => {
    const dto = plainToInstance(CommunityPostsQueryDto, { sort });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('rejects unsupported sort modes', async () => {
    const dto = plainToInstance(CommunityPostsQueryDto, {
      sort: 'mostViewed',
    });

    expect(await validate(dto)).not.toHaveLength(0);
  });
});
