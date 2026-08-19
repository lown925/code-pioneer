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
      questionCount: 1,
      correctScore: 2,
      wrongScore: -1,
      unansweredScore: 0,
      aiOpponent: null as null | {
        displayName: string;
        strategyVersion: string;
        answerPlan: unknown;
        plannedSubmittedOffsetMs: number;
      },
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
          submittedAt: completedAt,
          forfeitedAt: null as Date | null,
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
      room,
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

  it('lists and returns AI history without requiring a second participant', async () => {
    const { service, room } = createService();
    const participant = room.participants[0]!;
    room.mode = BattleMode.AI;
    participant.result = BattleResult.WIN;
    participant.score = 2;
    participant.correctCount = 1;
    participant.wrongCount = 0;
    participant.unansweredCount = 0;
    participant.ratingBefore = null as never;
    participant.ratingAfter = null as never;
    participant.submittedAt = new Date(room.startedAt.getTime() + 30_000);
    room.aiOpponent = {
      displayName: '电脑对手',
      strategyVersion: 'normal-v1',
      answerPlan: {
        strategyVersion: 'normal-v1',
        questions: [
          {
            battleQuestionSnapshotId: 'snapshot-1',
            orderIndex: 0,
            plannedCompletedOffsetMs: 40_000,
            plannedCorrect: false,
          },
        ],
      },
      plannedSubmittedOffsetMs: 50_000,
    };

    const list = await service.getHistory(USER_ID, { mode: BattleMode.AI });
    const detail = await service.getHistoryDetail(USER_ID, room.id);

    expect(list.data.items).toEqual([
      expect.objectContaining({
        mode: BattleMode.AI,
        result: BattleResult.WIN,
        ratingDelta: 0,
        resultReason: 'MORE_CORRECT',
        opponent: expect.objectContaining({
          type: 'AI',
          displayName: '电脑对手',
          correctCount: 0,
        }),
      }),
    ]);
    expect(detail.data).toMatchObject({
      mode: BattleMode.AI,
      result: BattleResult.WIN,
      resultReason: 'MORE_CORRECT',
      myCompletionTimeMs: 30_000,
      opponentCompletionTimeMs: 50_000,
      opponent: {
        type: 'AI',
        displayName: '电脑对手',
      },
      opponentSummary: {
        type: 'AI',
        displayName: '电脑对手',
      },
    });
  });
});
