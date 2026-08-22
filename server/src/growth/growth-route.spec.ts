import { getFormalCoreRoute, getFormalCourse } from './growth-route';
import { BattleTrackService } from '../battle/battle-track.service';

describe('formal professional learning routes', () => {
  it.each([
    [
      'big-data',
      [
        'python-basic',
        'data-structures-algorithms',
        'linux-fundamentals',
        'database-sql-foundations',
        'big-data-fundamentals',
        'spark-data-processing',
      ],
    ],
    [
      'computer-science',
      [
        'python-basic',
        'data-structures-algorithms',
        'linux-fundamentals',
        'database-sql-foundations',
        'computer-architecture-operating-systems',
        'computer-networks-fundamentals',
      ],
    ],
    [
      'software-engineering',
      [
        'python-basic',
        'data-structures-algorithms',
        'java-object-oriented-programming',
        'database-sql-foundations',
        'software-engineering-project-development',
        'computer-networks-fundamentals',
      ],
    ],
  ])('keeps the %s route in formal metadata order', (trackKey, expected) => {
    expect(getFormalCoreRoute(trackKey).map((course) => course.slug)).toEqual(
      expected,
    );
  });

  it('keeps battle eligibility independent from core route membership', () => {
    expect(
      getFormalCourse('linux-fundamentals')?.professionalDirections,
    ).toContain('software-engineering');
    expect(
      getFormalCoreRoute('software-engineering').map((course) => course.slug),
    ).not.toContain('linux-fundamentals');
  });

  it('lets newly published metadata courses enter Battle without page mappings', async () => {
    const service = new BattleTrackService({} as never);
    const client = {
      course: {
        findMany: jest
          .fn()
          .mockResolvedValue([
            { slug: 'spark-data-processing' },
            { slug: 'python-basic' },
            { slug: 'big-data-fundamentals' },
            { slug: 'offline-course' },
          ]),
      },
    };

    await expect(
      service.getPublishedCourseSlugs('big-data', client as never),
    ).resolves.toEqual([
      'python-basic',
      'big-data-fundamentals',
      'spark-data-processing',
    ]);
  });
});
