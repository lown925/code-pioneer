import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  GoneException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  BattleParticipantStatus,
  BattleQuestionType,
  BattleRoomStatus,
} from '../../generated/prisma/enums';
import { BattleNormalizationService } from './battle-normalization.service';
import { BattleRoomService } from './battle-room.service';
import { BATTLE_ERROR_CODES } from './battle.errors';
import { type SubmitBattleAnswerDto } from './dto/submit-battle-answer.dto';
import { PrismaService } from '../prisma/prisma.service';
import type {
  BattleAnswerPayload,
  BattleAnswerSubmissionPayload,
  BattleCorrectAnswerSnapshot,
  BattleQuestionOptionSnapshot,
  BattleTransactionClient,
  CodeFillAnswerConfig,
} from './battle.types';

type ExistingAnswerRecord = {
  id: string;
  battleQuestionSnapshotId: string;
  clientRequestId: string;
  answerPayload: unknown;
  submittedAt: Date;
};

type SnapshotRecord = {
  id: string;
  questionType: BattleQuestionType;
  optionsSnapshot: unknown;
  correctAnswerSnapshot: unknown;
  acceptedAnswersSnapshot: unknown;
  answerNormalizationSnapshot: unknown;
};

@Injectable()
export class BattleAnswerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly battleRoomService: BattleRoomService,
    private readonly battleNormalizationService: BattleNormalizationService,
  ) {}

  async submitAnswer(
    currentUserId: string,
    battleId: string,
    dto: SubmitBattleAnswerDto,
  ) {
    const data = await this.prisma.$transaction(async (tx) => {
      const now = new Date();
      await this.battleRoomService.advanceRoomStateIfNeeded(battleId, now, tx);

      const participant = await tx.battleParticipant.findFirst({
        where: {
          battleRoomId: battleId,
          userId: currentUserId,
        },
        select: {
          id: true,
          userId: true,
          status: true,
          score: true,
          correctCount: true,
          wrongCount: true,
          battleRoom: {
            select: {
              id: true,
              status: true,
              startedAt: true,
              expiresAt: true,
              questionCount: true,
              correctScore: true,
              wrongScore: true,
            },
          },
        },
      });

      if (!participant) {
        throw new ForbiddenException(BATTLE_ERROR_CODES.BATTLE_NOT_PARTICIPANT);
      }

      this.assertAnswerWindow(participant.battleRoom, participant.status, now);

      const snapshot = (await tx.battleQuestionSnapshot.findFirst({
        where: {
          id: dto.battleQuestionId,
          battleRoomId: battleId,
        },
        select: {
          id: true,
          questionType: true,
          optionsSnapshot: true,
          correctAnswerSnapshot: true,
          acceptedAnswersSnapshot: true,
          answerNormalizationSnapshot: true,
        },
      })) as SnapshotRecord | null;

      if (!snapshot) {
        throw new NotFoundException(
          BATTLE_ERROR_CODES.BATTLE_QUESTION_NOT_FOUND,
        );
      }

      const existingByRequest = (await tx.battleAnswer.findFirst({
        where: {
          participantId: participant.id,
          clientRequestId: dto.clientRequestId,
        },
        select: {
          id: true,
          battleQuestionSnapshotId: true,
          clientRequestId: true,
          answerPayload: true,
          submittedAt: true,
        },
      })) as ExistingAnswerRecord | null;

      if (existingByRequest) {
        if (
          existingByRequest.battleQuestionSnapshotId !== dto.battleQuestionId ||
          !this.isSameAnswerPayload(
            existingByRequest.answerPayload,
            dto.answer,
            snapshot.questionType,
          )
        ) {
          throw new ConflictException(
            BATTLE_ERROR_CODES.BATTLE_IDEMPOTENCY_CONFLICT,
          );
        }

        return this.buildSubmissionResponse(
          tx,
          participant.id,
          existingByRequest.submittedAt,
          dto.battleQuestionId,
          participant.battleRoom.questionCount,
          now,
        );
      }

      const existingByQuestion = (await tx.battleAnswer.findFirst({
        where: {
          participantId: participant.id,
          battleQuestionSnapshotId: dto.battleQuestionId,
        },
        select: {
          id: true,
          battleQuestionSnapshotId: true,
          clientRequestId: true,
          answerPayload: true,
          submittedAt: true,
        },
      })) as ExistingAnswerRecord | null;

      if (existingByQuestion) {
        throw new ConflictException(
          BATTLE_ERROR_CODES.BATTLE_ANSWER_ALREADY_SUBMITTED,
        );
      }

      const evaluated = this.evaluateAnswer(
        dto.answer,
        snapshot,
        participant.battleRoom,
      );

      try {
        await tx.battleAnswer.create({
          data: {
            battleRoomId: battleId,
            participantId: participant.id,
            battleQuestionSnapshotId: snapshot.id,
            userId: currentUserId,
            clientRequestId: dto.clientRequestId,
            answerPayload: evaluated.answerPayload,
            normalizedAnswer: evaluated.normalizedAnswer,
            isCorrect: evaluated.isCorrect,
            scoreDelta: evaluated.scoreDelta,
            submittedAt: now,
          },
        });
      } catch (error) {
        if (this.isUniqueConstraintError(error)) {
          const retryByRequest = (await tx.battleAnswer.findFirst({
            where: {
              participantId: participant.id,
              clientRequestId: dto.clientRequestId,
            },
            select: {
              id: true,
              battleQuestionSnapshotId: true,
              clientRequestId: true,
              answerPayload: true,
              submittedAt: true,
            },
          })) as ExistingAnswerRecord | null;

          if (
            retryByRequest &&
            retryByRequest.battleQuestionSnapshotId === dto.battleQuestionId &&
            this.isSameAnswerPayload(
              retryByRequest.answerPayload,
              dto.answer,
              snapshot.questionType,
            )
          ) {
            return this.buildSubmissionResponse(
              tx,
              participant.id,
              retryByRequest.submittedAt,
              dto.battleQuestionId,
              participant.battleRoom.questionCount,
              now,
            );
          }

          throw new ConflictException(
            BATTLE_ERROR_CODES.BATTLE_ANSWER_ALREADY_SUBMITTED,
          );
        }

        throw error;
      }

      await tx.battleParticipant.update({
        where: {
          id: participant.id,
        },
        data: {
          score: {
            increment: evaluated.scoreDelta,
          },
          correctCount: {
            increment: evaluated.isCorrect ? 1 : 0,
          },
          wrongCount: {
            increment: evaluated.isCorrect ? 0 : 1,
          },
        },
      });

      return this.buildSubmissionResponse(
        tx,
        participant.id,
        now,
        dto.battleQuestionId,
        participant.battleRoom.questionCount,
        now,
      );
    });

    return {
      success: true as const,
      data,
    };
  }

  private assertAnswerWindow(
    room: {
      status: BattleRoomStatus;
      startedAt: Date | null;
      expiresAt: Date | null;
    },
    participantStatus: BattleParticipantStatus,
    now: Date,
  ) {
    if (
      participantStatus === BattleParticipantStatus.SUBMITTED ||
      participantStatus === BattleParticipantStatus.FORFEITED ||
      participantStatus === BattleParticipantStatus.COMPLETED
    ) {
      throw new ConflictException(
        BATTLE_ERROR_CODES.BATTLE_PARTICIPANT_ALREADY_SUBMITTED,
      );
    }

    if (
      room.status === BattleRoomStatus.COUNTDOWN &&
      room.startedAt &&
      room.startedAt.getTime() > now.getTime()
    ) {
      throw new ConflictException(
        BATTLE_ERROR_CODES.BATTLE_COUNTDOWN_NOT_FINISHED,
      );
    }

    if (room.status !== BattleRoomStatus.IN_PROGRESS) {
      throw new ConflictException(BATTLE_ERROR_CODES.BATTLE_INVALID_STATUS);
    }

    if (room.expiresAt && now.getTime() >= room.expiresAt.getTime()) {
      throw new GoneException(BATTLE_ERROR_CODES.BATTLE_EXPIRED);
    }
  }

  private evaluateAnswer(
    answer: SubmitBattleAnswerDto['answer'],
    snapshot: SnapshotRecord,
    room: {
      correctScore: number;
      wrongScore: number;
    },
  ) {
    if (snapshot.questionType === BattleQuestionType.SINGLE_CHOICE) {
      if (!answer.optionId || answer.value !== undefined) {
        throw new BadRequestException(BATTLE_ERROR_CODES.BATTLE_INVALID_ANSWER);
      }

      const options = this.asOptionSnapshots(snapshot.optionsSnapshot);
      const selectedOption = options.find(
        (option) => option.id === answer.optionId,
      );

      if (!selectedOption) {
        throw new BadRequestException(BATTLE_ERROR_CODES.BATTLE_INVALID_ANSWER);
      }

      const correctAnswer = this.asCorrectAnswerSnapshot(
        snapshot.correctAnswerSnapshot,
      );
      const isCorrect =
        correctAnswer.type === 'SINGLE_CHOICE' &&
        correctAnswer.optionId === selectedOption.id;

      return {
        answerPayload: {
          type: 'SINGLE_CHOICE',
          optionId: selectedOption.id,
        } satisfies BattleAnswerPayload,
        normalizedAnswer: null,
        isCorrect,
        scoreDelta: isCorrect ? room.correctScore : room.wrongScore,
      };
    }

    if (!answer.value || answer.optionId !== undefined) {
      throw new BadRequestException(BATTLE_ERROR_CODES.BATTLE_INVALID_ANSWER);
    }

    const config = this.asCodeFillConfig(snapshot.answerNormalizationSnapshot);
    const acceptedAnswers = this.asStringArray(
      snapshot.acceptedAnswersSnapshot,
    );
    const result = this.battleNormalizationService.evaluateCodeFillAnswer({
      rawValue: answer.value,
      acceptedAnswers,
      config,
    });

    return {
      answerPayload: {
        type: 'CODE_FILL',
        value: answer.value,
      } satisfies BattleAnswerPayload,
      normalizedAnswer: result.normalizedAnswer,
      isCorrect: result.isCorrect,
      scoreDelta: result.isCorrect ? room.correctScore : room.wrongScore,
    };
  }

  private async buildSubmissionResponse(
    tx: BattleTransactionClient,
    participantId: string,
    submittedAt: Date,
    battleQuestionId: string,
    totalQuestions: number,
    serverTime: Date,
  ): Promise<BattleAnswerSubmissionPayload> {
    const mySubmittedCount = await tx.battleAnswer.count({
      where: {
        participantId,
      },
    });

    return {
      accepted: true,
      battleQuestionId,
      submittedAt,
      mySubmittedCount,
      totalQuestions,
      serverTime,
    };
  }

  private isUniqueConstraintError(error: unknown) {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: unknown }).code === 'P2002'
    );
  }

  private isSameAnswerPayload(
    existingPayload: unknown,
    nextPayload: SubmitBattleAnswerDto['answer'],
    questionType: BattleQuestionType,
  ) {
    if (questionType === BattleQuestionType.SINGLE_CHOICE) {
      return (
        typeof existingPayload === 'object' &&
        existingPayload !== null &&
        'optionId' in existingPayload &&
        (existingPayload as { optionId?: unknown }).optionId ===
          nextPayload.optionId
      );
    }

    return (
      typeof existingPayload === 'object' &&
      existingPayload !== null &&
      'value' in existingPayload &&
      (existingPayload as { value?: unknown }).value === nextPayload.value
    );
  }

  private asOptionSnapshots(value: unknown) {
    if (!Array.isArray(value)) {
      return [];
    }

    return value as BattleQuestionOptionSnapshot[];
  }

  private asCorrectAnswerSnapshot(value: unknown) {
    return value as BattleCorrectAnswerSnapshot;
  }

  private asCodeFillConfig(value: unknown): CodeFillAnswerConfig {
    return value as CodeFillAnswerConfig;
  }

  private asStringArray(value: unknown) {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.filter((item): item is string => typeof item === 'string');
  }
}
