import {
  BattleQuestionDifficulty,
  BattleQuestionPresentation,
  QuestionType,
} from '../../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { CourseCapabilityService } from './course-capability.service';

describe('CourseCapabilityService', () => {
  it('discovers published metadata courses and excludes offline rows from the query', async () => {
    const findMany = jest.fn().mockResolvedValue([
      {
        id: 'linux-id',
        slug: 'linux-fundamentals',
        title: 'Linux 基础',
        language: null,
        chapters: [
          {
            quiz: {
              questions: [
                {
                  isBattleEnabled: true,
                  battleDifficulty: BattleQuestionDifficulty.MEDIUM,
                  battlePresentation: BattleQuestionPresentation.TEXT_CHOICE,
                  type: QuestionType.SINGLE_CHOICE,
                  acceptedAnswers: null,
                  options: [{ isCorrect: true }, { isCorrect: false }],
                },
              ],
            },
          },
        ],
      },
    ]);
    const service = new CourseCapabilityService({
      course: { findMany },
    } as unknown as PrismaService);

    const capabilities = await service.getPublishedCapabilities();

    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { status: 'PUBLISHED', deletedAt: null },
    }));
    expect(capabilities).toEqual([
      expect.objectContaining({
        slug: 'linux-fundamentals',
        professionalTracks: ['computer-science', 'big-data', 'software-engineering'],
        supportsPractice: true,
        supportsBattle: true,
        battleQuestionCount: 1,
      }),
    ]);
  });

  it('returns a dynamic track projection from the same capability result', async () => {
    const service = new CourseCapabilityService({
      course: { findMany: jest.fn().mockResolvedValue([]) },
    } as unknown as PrismaService);

    await expect(service.getTrackCapabilities('big-data')).resolves.toMatchObject({
      track: { trackKey: 'big-data' },
      courses: [],
    });
    await expect(service.getTrackCapabilities('future-track')).resolves.toBeNull();
  });
});
