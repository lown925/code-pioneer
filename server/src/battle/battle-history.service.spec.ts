import {
  BattleEndReason,
  BattleMode,
  BattleParticipantStatus,
  BattleQuestionPresentation,
  BattleQuestionType,
  BattleResult,
  BattleRoomStatus,
} from '../../generated/prisma/enums';
import { BattleHistoryService } from './battle-history.service';

const USER_ID = '11111111-1111-4111-8111-111111111111';

describe('BattleHistoryService', () => {
  function createService() {
    const completedAt = new Date('2026-08-16T10:05:00.000Z');
    const room = {
      id: 'training-room',
      mode: BattleMode.TRAINING,
      skillCode: 'PYTHON',
      status: BattleRoomStatus.COMPLETED,
      startedAt: new Date('2026-08-16T10:02:00.000Z'),
      expiresAt: completedAt,
      completedAt,
      endReason: BattleEndReason.NORMAL,
      durationSeconds: 180,
      unansweredScore: 0,
      participants: [
        {
          id: 'training-participant',
          userId: USER_ID,
          seat: 1,
          status: BattleParticipantStatus.COMPLETED,
          result: BattleResult.NONE,
          score: 1,
          correctCount: 1,
          wrongCount: 1,
          unansweredCount: 0,
          ratingBefore: 1200,
          ratingDelta: 0,
          ratingAfter: 1200,
          user: {
            id: USER_ID,
            nickname: 'Training Player',
            avatarUrl: null,
          },
        },
      ],
      questionSnapshots: [
        {
          id: 'snapshot-1',
          battleRoomId: 'training-room',
          sourceQuizQuestionId: 'question-1',
          orderIndex: 0,
          questionType: BattleQuestionType.SINGLE_CHOICE,
          presentation: BattleQuestionPresentation.TEXT_CHOICE,
          difficulty: 'MEDIUM',
          stemSnapshot: [{ type: 'TEXT', text: 'Question' }],
          optionsSnapshot: [
            {
              id: 'option-1',
              sourceOptionId: 'source-option-1',
              orderIndex: 0,
              blocks: [{ type: 'TEXT', text: 'Option' }],
            },
          ],
          correctAnswerSnapshot: {
            type: 'SINGLE_CHOICE',
            optionId: 'option-1',
          },
          explanationSnapshot: [{ type: 'TEXT', text: 'Explanation' }],
          programmingLanguage: null,
          courseIdSnapshot: 'course-1',
          chapterIdSnapshot: 'chapter-1',
        },
      ],
      answers: [
        {
          battleRoomId: 'training-room',
          participantId: 'training-participant',
          battleQuestionSnapshotId: 'snapshot-1',
          answerPayload: {
            type: 'SINGLE_CHOICE',
            optionId: 'option-2',
          },
          submittedAt: new Date('2026-08-16T10:03:00.000Z'),
          timeSpentMs: 12_000,
          isCorrect: false,
          scoreDelta: -1,
        },
      ],
    };
    const prisma = {
      battleRoom: {
        findMany: jest.fn(async () => [room]),
        findUnique: jest.fn(async () => room),
      },
    };

    return {
      service: new BattleHistoryService(prisma as never),
      prisma,
    };
  }

  it('lists training rooms and supports TRAINING mode filtering', async () => {
    const { service } = createService();

    const result = await service.getHistory(USER_ID, {
      mode: BattleMode.TRAINING,
      page: 1,
      pageSize: 20,
    });

    expect(result.data.total).toBe(1);
    expect(result.data.items).toEqual([
      expect.objectContaining({
        battleId: 'training-room',
        mode: BattleMode.TRAINING,
        skill: 'PYTHON',
        result: BattleResult.NONE,
        opponent: null,
        opponentScore: null,
        ratingDelta: 0,
      }),
    ]);

    const rankedResult = await service.getHistory(USER_ID, {
      mode: BattleMode.RANKED,
    });
    expect(rankedResult.data.total).toBe(0);
  });

  it('returns training detail with nullable opponent fields and real answers', async () => {
    const { service } = createService();

    const result = await service.getHistoryDetail(USER_ID, 'training-room');

    expect(result.data).toMatchObject({
      battleId: 'training-room',
      mode: BattleMode.TRAINING,
      skill: 'PYTHON',
      result: BattleResult.NONE,
      myScore: 1,
      opponentScore: null,
      opponent: null,
      opponentSummary: null,
      ratingBefore: 1200,
      ratingDelta: 0,
      ratingAfter: 1200,
    });
    expect(result.data.questions).toEqual([
      expect.objectContaining({
        battleQuestionSnapshotId: 'snapshot-1',
        source: 'BATTLE',
        isCorrect: false,
        scoreDelta: -1,
        myAnswer: expect.objectContaining({
          answer: {
            type: 'SINGLE_CHOICE',
            optionId: 'option-2',
          },
        }),
      }),
    ]);
  });
});
