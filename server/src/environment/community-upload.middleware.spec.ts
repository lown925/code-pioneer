import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import express from 'express';
import request from 'supertest';
import { createCommunityUploadBlocker } from './community-upload.middleware';
import type { AppEnvironment } from './environment.config';

describe('createCommunityUploadBlocker', () => {
  let uploadRoot: string;

  beforeAll(async () => {
    uploadRoot = await fs.mkdtemp(join(tmpdir(), 'code-pioneer-uploads-'));
    await fs.mkdir(join(uploadRoot, 'avatars', 'user-id'), {
      recursive: true,
    });
    await fs.mkdir(join(uploadRoot, 'community', 'user-id'), {
      recursive: true,
    });
    await fs.writeFile(
      join(uploadRoot, 'avatars', 'user-id', 'avatar.png'),
      Buffer.from('avatar-image'),
    );
    await fs.writeFile(
      join(uploadRoot, 'community', 'user-id', 'post.png'),
      Buffer.from('community-image'),
    );
  });

  afterAll(async () => {
    await fs.rm(uploadRoot, { recursive: true, force: true });
  });

  function createApp(appEnvironment: AppEnvironment) {
    const app = express();

    app.use('/uploads/community', createCommunityUploadBlocker(appEnvironment));
    app.use('/uploads', express.static(uploadRoot));

    return app;
  }

  it.each(['production', 'trial'] as const)(
    'blocks Community images but serves avatars in APP_ENV=%s',
    async (appEnvironment) => {
      const app = createApp(appEnvironment);

      await request(app).get('/uploads/community/user-id/post.png').expect(404);

      const avatarResponse = await request(app)
        .get('/uploads/avatars/user-id/avatar.png')
        .expect(200);

      expect(Buffer.from(avatarResponse.body).toString()).toBe('avatar-image');
    },
  );

  it.each(['development', 'test'] as const)(
    'keeps Community images available in APP_ENV=%s',
    async (appEnvironment) => {
      const app = createApp(appEnvironment);
      const response = await request(app)
        .get('/uploads/community/user-id/post.png')
        .expect(200);

      expect(Buffer.from(response.body).toString()).toBe('community-image');
    },
  );
});
