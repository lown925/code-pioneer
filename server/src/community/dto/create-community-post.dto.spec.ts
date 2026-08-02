import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateCommunityPostDto } from './create-community-post.dto';

describe('CreateCommunityPostDto', () => {
  it('accepts ordered text, code, and more than six image blocks', async () => {
    const dto = plainToInstance(CreateCommunityPostDto, {
      categoryKey: 'CODE_HELP',
      title: 'Rich content post',
      contentBlocks: [
        {
          type: 'TEXT',
          text: 'Problem description',
        },
        {
          type: 'CODE',
          language: 'TypeScript',
          code: 'const answer = 42;',
        },
        ...Array.from({ length: 7 }, (_, index) => ({
          type: 'IMAGE',
          objectKey: `user-id/image-${index}.png`,
          url: `/uploads/community/user-id/image-${index}.png`,
        })),
      ],
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('keeps the legacy content and image contract compatible', async () => {
    const dto = plainToInstance(CreateCommunityPostDto, {
      categoryKey: 'LEARNING',
      title: 'Legacy post',
      content: 'Legacy content',
      images: Array.from({ length: 7 }, (_, index) => ({
        objectKey: `user-id/image-${index}.png`,
        url: `/uploads/community/user-id/image-${index}.png`,
      })),
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('rejects unknown content block types', async () => {
    const dto = plainToInstance(CreateCommunityPostDto, {
      categoryKey: 'GENERAL',
      title: 'Invalid block',
      contentBlocks: [
        {
          type: 'VIDEO',
          url: 'https://example.com/video.mp4',
        },
      ],
    });

    expect(await validate(dto)).not.toHaveLength(0);
  });
});
