import { ConflictException, ForbiddenException } from '@nestjs/common';
import {
  BattleParticipantStatus,
  BattleQuestionDifficulty,
  BattleQuestionPresentation,
  BattleRoomStatus,
  QuestionType,
} from '../../generated/prisma/enums';
import { BattleQuestionService } from './battle-question.service';
import { BattleDomainService } from './battle-domain.service';
import { BattleReadyService } from './battle-ready.service';
import { BattleRoomService } from './battle-room.service';
import { createBattlePrismaMock } from './battle-test.helpers';

const USER_A = {
  id: '11111111-1111-4111-8111-111111111111',
  sessionId: 'session-a',
  tokenType: 'USER' as const,
  role: 'NORMAL' as const,
};

const USER_B = {
  id: '22222222-2222-4222-8222-222222222222',
  sessionId: 'session-b',
  tokenType: 'USER' as const,
  role: 'NORMAL' as const,
};

describe('BattleReadyService', () => {
  function createService() {
    const mock = createBattlePrismaMock();
    const domainService = new BattleDomainService(mock.prisma as never);
    const roomService = new BattleRoomService(
      mock.prisma as never,
      domainService,
    );
    const questionService = new BattleQuestionService(
      mock.prisma as never,
      roomService,
    );
    jest
      .spyOn(
        questionService as unknown as { nextRandom: () => number },
        'nextRandom',
      )
      .mockReturnValue(0);
    const service = new BattleReadyService(
      mock.prisma as never,
      questionService,
      roomService,
      domainService,
    );

    mock.users.set(USER_A.id, {
      id: USER_A.id,
      battleRating: 1000,
      nickname: 'Ready A',
    });
    mock.users.set(USER_B.id, {
      id: USER_B.id,
      battleRating: 1010,
      nickname: 'Ready B',
    });
    mock.battleRooms.set('room-1', {
      id: 'room-1',
      mode: 'RANKED',
      status: BattleRoomStatus.WAITING,
      questionCount: 3,
      durationSeconds: 180,
      correctScore: 2,
      wrongScore: -1,
      unansweredScore: 0,
      createdByUserId: USER_A.id,
      expiresAt: null,
      startedAt: null,
      settledAt: null,
      completedAt: null,
      cancelledAt: null,
      endReason: null,
      createdAt: new Date('2026-07-25T10:00:00.000Z'),
    });
    mock.battleParticipants.set('participant-a', {
      id: 'participant-a',
      battleRoomId: 'room-1',
      userId: USER_A.id,
      seat: 1,
      status: BattleParticipantStatus.JOINED,
      result: 'NONE',
      joinedAt: new Date('2026-07-25T10:00:00.000Z'),
    });
    mock.battleParticipants.set('participant-b', {
      id: 'participant-b',
      battleRoomId: 'room-1',
      userId: USER_B.id,
      seat: 2,
      status: BattleParticipantStatus.JOINED,
      result: 'NONE',
      joinedAt: new Date('2026-07-25T10:00:01.000Z'),
    });

    seedBattleQuestions(mock, 3);

    return { mock, service };
  }

  it('marks the first participant READY and keeps the room in READY state', async () => {
    const { mock, service } = createService();

    const result = await service.readyBattle(USER_A, 'room-1');

    expect(result.data.status).toBe(BattleRoomStatus.READY);
    expect(mock.battleParticipants.get('participant-a')?.status).toBe(
      BattleParticipantStatus.READY,
    );
    expect(mock.battleRooms.get('room-1')?.status).toBe(BattleRoomStatus.READY);
    expect(mock.battleQuestionSnapshots.size).toBe(0);
  });

  it('starts countdown and creates one snapshot set when the second participant becomes READY', async () => {
    const { mock, service } = createService();

    await service.readyBattle(USER_A, 'room-1');
    const result = await service.readyBattle(USER_B, 'room-1');

    expect(result.data.status).toBe(BattleRoomStatus.COUNTDOWN);
    expect(mock.battleQuestionSnapshots.size).toBe(3);
    expect(mock.battleRooms.get('room-1')?.startedAt).toBeInstanceOf(Date);
    expect(mock.battleRooms.get('room-1')?.expiresAt).toBeInstanceOf(Date);
  });

  it('treats repeated ready as idempotent before the battle starts', async () => {
    const { mock, service } = createService();

    const first = await service.readyBattle(USER_A, 'room-1');
    const second = await service.readyBattle(USER_A, 'room-1');

    expect(first.data.status).toBe(BattleRoomStatus.READY);
    expect(second.data.status).toBe(BattleRoomStatus.READY);
    expect(mock.battleQuestionSnapshots.size).toBe(0);
  });

  it('rolls back countdown startup when the question pool is insufficient', async () => {
    const { mock, service } = createService();
    mock.quizQuestions.delete('question-3');

    await service.readyBattle(USER_A, 'room-1');
    await expect(service.readyBattle(USER_B, 'room-1')).rejects.toBeInstanceOf(
      ConflictException,
    );

    expect(mock.battleRooms.get('room-1')?.status).toBe(BattleRoomStatus.READY);
    expect(mock.battleRooms.get('room-1')?.startedAt).toBeNull();
    expect(mock.battleQuestionSnapshots.size).toBe(0);
  });

  it('rejects non-participants', async () => {
    const { service } = createService();

    await expect(
      service.readyBattle(
        {
          id: '33333333-3333-4333-8333-333333333333',
          sessionId: 'session-c',
          tokenType: 'USER',
          role: 'NORMAL',
        },
        'room-1',
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('cannot ready a cancelled or expired room', async () => {
    const { mock, service } = createService();

    mock.battleRooms.get('room-1')!.status = BattleRoomStatus.CANCELLED;
    await expect(service.readyBattle(USER_A, 'room-1')).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(mock.battleRooms.get('room-1')?.status).toBe(
      BattleRoomStatus.CANCELLED,
    );

    mock.battleRooms.get('room-1')!.status = BattleRoomStatus.EXPIRED;
    await expect(service.readyBattle(USER_A, 'room-1')).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(mock.battleRooms.get('room-1')?.status).toBe(
      BattleRoomStatus.EXPIRED,
    );
  });

  it('expires a stale FRIEND room before ready can advance it', async () => {
    const { mock, service } = createService();
    const room = mock.battleRooms.get('room-1')!;
    room.mode = 'FRIEND';
    room.expiresAt = new Date(Date.now() - 1000);
    mock.battleRooms.set(room.id, room);

    await expect(service.readyBattle(USER_A, 'room-1')).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(mock.battleRooms.get('room-1')?.status).toBe(
      BattleRoomStatus.EXPIRED,
    );
  });
});

function seedBattleQuestions(
  mock: ReturnType<typeof createBattlePrismaMock>,
  count: number,
) {
  const difficulties = [
    BattleQuestionDifficulty.EASY,
    BattleQuestionDifficulty.MEDIUM,
    BattleQuestionDifficulty.HARD,
  ];

  for (let index = 0; index < count; index += 1) {
    const id = `question-${index + 1}`;
    mock.quizQuestions.set(id, {
      id,
      type:
        index === count - 1
          ? QuestionType.CODE_FILL
          : QuestionType.SINGLE_CHOICE,
      content: `Question ${index + 1}`,
      explanation: `Explanation ${index + 1}`,
      battlePresentation:
        index === count - 1
          ? BattleQuestionPresentation.INPUT_CODE_FILL
          : BattleQuestionPresentation.TEXT_CHOICE,
      battleDifficulty: difficulties[index] ?? BattleQuestionDifficulty.EASY,
      isBattleEnabled: true,
      stemBlocks: null,
      explanationBlocks: null,
      acceptedAnswers: index === count - 1 ? ['print(1)'] : null,
      answerNormalization:
        index === count - 1
          ? {
              trim: true,
              normalizeLineEndings: true,
              caseSensitive: true,
              collapseWhitespace: false,
            }
          : null,
      caseSensitive: true,
      knowledgeTags: ['battle'],
      programmingLanguage: index === count - 1 ? 'python' : null,
      createdAt: new Date(`2026-07-25T10:00:0${index}.000Z`),
      options:
        index === count - 1
          ? []
          : [
              {
                id: `${id}-option-a`,
                content: 'A',
                contentBlocks: null,
                isCorrect: true,
                sortOrder: 0,
              },
              {
                id: `${id}-option-b`,
                content: 'B',
                contentBlocks: null,
                isCorrect: false,
                sortOrder: 1,
              },
            ],
      quiz: {
        status: 'PUBLISHED',
        chapterId: `chapter-${index + 1}`,
        chapter: {
          status: 'PUBLISHED',
          courseId: `course-${index + 1}`,
          course: {
            status: 'PUBLISHED',
          },
        },
      },
    });
  }
}
