import { BattleTrackService } from './battle-track.service';

describe('BattleTrackService', () => {
  it('discovers only published metadata courses for a track', async () => {
    const service = new BattleTrackService({} as never);
    const client = {
      course: {
        findMany: jest.fn().mockResolvedValue([
          { slug: 'python-basic' },
          { slug: 'linux-fundamentals' },
          { slug: 'offline-course' },
        ]),
      },
    };
    await expect(service.getPublishedCourseSlugs('big-data', client as never)).resolves.toEqual([
      'python-basic', 'linux-fundamentals',
    ]);
  });

  it('lazy initializes one track rating without touching other tracks', async () => {
    const service = new BattleTrackService({} as never);
    const upsert = jest.fn().mockResolvedValue({ trackKey: 'big-data', rating: 1000 });
    const client = { userBattleTrackRating: { upsert } };
    await service.ensureRating('user-1', 'big-data', client as never);
    expect(upsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { userId_trackKey: { userId: 'user-1', trackKey: 'big-data' } },
    }));
  });
});
