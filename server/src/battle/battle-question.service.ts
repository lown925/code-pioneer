import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Prisma } from '../../generated/prisma/client';
import {
  BattleQuestionDifficulty,
  BattleQuestionPresentation,
  BattleQuestionType,
  BattleRoomStatus,
  ChapterStatus,
  CourseStatus,
  QuestionType,
  QuizStatus,
} from '../../generated/prisma/enums';
import { BattleRoomService } from './battle-room.service';
import { BATTLE_COUNTDOWN_SECONDS } from './battle.constants';
import { BATTLE_ERROR_CODES } from './battle.errors';
import { BattleSettlementService } from './battle-settlement.service';
import { PrismaService } from '../prisma/prisma.service';
import type {
  BattleAnswerPayload,
  BattleCorrectAnswerSnapshot,
  BattleQuestionOptionSnapshot,
  BattleQuestionsPayload,
  BattleQuestionView,
  BattleTransactionClient,
  CodeFillAnswerConfig,
  ContentBlock,
} from './battle.types';

type CandidateQuestionRecord = {
  id: string;
  type: QuestionType;
  content: string;
  explanation: string | null;
  battlePresentation: BattleQuestionPresentation | null;
  battleDifficulty: BattleQuestionDifficulty | null;
  stemBlocks: unknown;
  explanationBlocks: unknown;
  acceptedAnswers: unknown;
  answerNormalization: unknown;
  caseSensitive: boolean;
  knowledgeTags: unknown;
  programmingLanguage: string | null;
  battleSkillCode: string | null;
  options: Array<{
    id: string;
    content: string;
    contentBlocks: unknown;
    isCorrect: boolean;
    sortOrder: number;
  }>;
  quiz: {
    chapterId: string;
    chapter: {
      courseId: string;
    };
  };
};

type SnapshotRecord = {
  id: string;
  battleRoomId: string;
  orderIndex: number;
  questionType: string;
  presentation: string;
  difficulty: string | null;
  stemSnapshot: unknown;
  optionsSnapshot: unknown;
  programmingLanguage: string | null;
  skillCodeSnapshot: string | null;
  sourceQuizQuestion: {
    content: string;
  } | null;
};

type AnswerRecord = {
  battleQuestionSnapshotId: string;
  submittedAt: Date;
  answerVersion: number;
  answerPayload: unknown;
};

@Injectable()
export class BattleQuestionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly battleRoomService: BattleRoomService,
    private readonly battleSettlementService?: BattleSettlementService,
  ) {}

  async getBattleQuestions(currentUserId: string, battleId: string) {
    const data = await this.prisma.$transaction(async (tx) => {
      const now = new Date();
      await this.battleRoomService.advanceRoomStateIfNeeded(battleId, now, tx);
      await this.battleSettlementService?.normalizeBattleState(battleId, now, tx);

      const room = await tx.battleRoom.findFirst({
        where: {
          id: battleId,
          participants: {
            some: {
              userId: currentUserId,
            },
          },
        },
        select: {
          id: true,
          status: true,
          skillCode: true,
          startedAt: true,
          expiresAt: true,
          participants: {
            where: {
              userId: currentUserId,
            },
            select: {
              id: true,
            },
          },
        },
      });

      if (!room) {
        throw new ForbiddenException(BATTLE_ERROR_CODES.BATTLE_NOT_PARTICIPANT);
      }

      if (
        room.status !== BattleRoomStatus.COUNTDOWN &&
        room.status !== BattleRoomStatus.IN_PROGRESS &&
        room.status !== BattleRoomStatus.SETTLING &&
        room.status !== BattleRoomStatus.COMPLETED
      ) {
        throw new ConflictException(BATTLE_ERROR_CODES.BATTLE_ROOM_NOT_READY);
      }

      if (room.status === BattleRoomStatus.COUNTDOWN && room.startedAt) {
        return {
          battleId: room.id,
          status: room.status,
          skill: room.skillCode,
          startedAt: room.startedAt,
          expiresAt: room.expiresAt,
          serverTime: now,
        } satisfies BattleQuestionsPayload;
      }

      const participantId = room.participants[0]?.id;
      const answers = participantId
        ? await tx.battleAnswer.findMany({
            where: {
              participantId,
            },
            select: {
              battleQuestionSnapshotId: true,
              submittedAt: true,
              answerVersion: true,
              answerPayload: true,
            },
          })
        : [];

      const answersByQuestionId = new Map(
        answers.map((answer) => [
          answer.battleQuestionSnapshotId,
          answer as AnswerRecord,
        ]),
      );

      const snapshots = (await tx.battleQuestionSnapshot.findMany({
        where: {
          battleRoomId: battleId,
        },
        orderBy: {
          orderIndex: 'asc',
        },
        select: {
          id: true,
          battleRoomId: true,
          orderIndex: true,
          questionType: true,
          presentation: true,
          difficulty: true,
          stemSnapshot: true,
          optionsSnapshot: true,
          programmingLanguage: true,
          skillCodeSnapshot: true,
          sourceQuizQuestion: {
            select: {
              content: true,
            },
          },
        },
      })) as SnapshotRecord[];

      const questions = snapshots.map((snapshot) => {
        const answer = answersByQuestionId.get(snapshot.id);

        return {
          battleQuestionId: snapshot.id,
          orderIndex: snapshot.orderIndex,
          questionType: snapshot.questionType,
          presentation: snapshot.presentation,
          difficulty: snapshot.difficulty,
          stem: this.restoreLegacyStem(snapshot),
          options: this.asOptionSnapshots(snapshot.optionsSnapshot),
          programmingLanguage: snapshot.programmingLanguage,
          answered: Boolean(answer),
          submittedAt: answer?.submittedAt ?? null,
          answerVersion: answer?.answerVersion ?? null,
          submittedAnswer: answer
            ? this.asBattleAnswerPayload(answer.answerPayload)
            : null,
        } satisfies BattleQuestionView;
      });

      return {
        battleId: room.id,
        status: room.status,
        skill: room.skillCode,
        startedAt: room.startedAt,
        expiresAt: room.expiresAt,
        serverTime: now,
        questions,
      } satisfies BattleQuestionsPayload;
    });

    return {
      success: true as const,
      data,
    };
  }

  async createQuestionSnapshotsAndStartCountdown(
    tx: BattleTransactionClient,
    input: {
      battleId: string;
      questionCount: number;
      durationSeconds: number;
      now: Date;
      skillCode: string | null;
    },
  ) {
    const candidates = await this.loadBattleQuestionCandidates(
      tx,
      input.skillCode,
    );
    const selected = this.selectBattleQuestions(
      candidates,
      input.questionCount,
    );

    if (selected.length !== input.questionCount) {
      throw new ConflictException(
        BATTLE_ERROR_CODES.BATTLE_QUESTION_POOL_INSUFFICIENT,
      );
    }

    const snapshots = selected.map((question, orderIndex) =>
      this.createSnapshotRecord(
        input.battleId,
        input.skillCode,
        question,
        orderIndex,
      ),
    );

    await tx.battleQuestionSnapshot.createMany({
      data: snapshots,
    });

    const startedAt = new Date(
      input.now.getTime() + BATTLE_COUNTDOWN_SECONDS * 1000,
    );
    const expiresAt = new Date(
      startedAt.getTime() + input.durationSeconds * 1000,
    );

    await tx.battleRoom.update({
      where: {
        id: input.battleId,
      },
      data: {
        status: BattleRoomStatus.COUNTDOWN,
        startedAt,
        expiresAt,
      },
    });

    return {
      startedAt,
      expiresAt,
    };
  }

  private async loadBattleQuestionCandidates(
    tx: BattleTransactionClient,
    skillCode: string | null,
  ) {
    const records = (await tx.quizQuestion.findMany({
      where: {
        isBattleEnabled: true,
        ...(skillCode ? { battleSkillCode: skillCode } : {}),
        type: {
          in: [QuestionType.SINGLE_CHOICE, QuestionType.CODE_FILL],
        },
        quiz: {
          status: QuizStatus.PUBLISHED,
          chapter: {
            status: ChapterStatus.PUBLISHED,
            course: {
              status: CourseStatus.PUBLISHED,
              deletedAt: null,
            },
          },
        },
      },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      select: {
        id: true,
        type: true,
        content: true,
        explanation: true,
        battlePresentation: true,
        battleDifficulty: true,
        stemBlocks: true,
        explanationBlocks: true,
        acceptedAnswers: true,
        answerNormalization: true,
        caseSensitive: true,
        knowledgeTags: true,
        programmingLanguage: true,
        battleSkillCode: true,
        options: {
          orderBy: {
            sortOrder: 'asc',
          },
          select: {
            id: true,
            content: true,
            contentBlocks: true,
            isCorrect: true,
            sortOrder: true,
          },
        },
        quiz: {
          select: {
            chapterId: true,
            chapter: {
              select: {
                courseId: true,
              },
            },
          },
        },
      },
    })) as CandidateQuestionRecord[];

    return records.filter((record) => this.isValidCandidate(record));
  }

  private isValidCandidate(question: CandidateQuestionRecord) {
    if (!question.battlePresentation) {
      return false;
    }

    if (question.type === QuestionType.SINGLE_CHOICE) {
      const correctOptions = question.options.filter(
        (option) => option.isCorrect,
      );
      return question.options.length >= 2 && correctOptions.length === 1;
    }

    if (question.type === QuestionType.CODE_FILL) {
      const acceptedAnswers = this.asStringArray(question.acceptedAnswers);
      return acceptedAnswers.length > 0;
    }

    return false;
  }

  private selectBattleQuestions(
    candidates: CandidateQuestionRecord[],
    questionCount: number,
  ) {
    const selected: CandidateQuestionRecord[] = [];
    const selectedIds = new Set<string>();
    const targets = this.getDifficultyTargets(questionCount);
    const buckets = {
      [BattleQuestionDifficulty.EASY]: this.shuffle(
        candidates.filter(
          (question) =>
            question.battleDifficulty === BattleQuestionDifficulty.EASY,
        ),
      ),
      [BattleQuestionDifficulty.MEDIUM]: this.shuffle(
        candidates.filter(
          (question) =>
            question.battleDifficulty === BattleQuestionDifficulty.MEDIUM,
        ),
      ),
      [BattleQuestionDifficulty.HARD]: this.shuffle(
        candidates.filter(
          (question) =>
            question.battleDifficulty === BattleQuestionDifficulty.HARD,
        ),
      ),
    };

    for (const [difficulty, targetCount] of Object.entries(targets)) {
      const bucket = buckets[difficulty as BattleQuestionDifficulty];

      while (
        bucket.length > 0 &&
        this.countSelected(selected) < questionCount
      ) {
        if (
          this.countSelectedByDifficulty(selected, difficulty) >= targetCount
        ) {
          break;
        }

        const candidate = bucket.shift();

        if (!candidate || selectedIds.has(candidate.id)) {
          continue;
        }

        selected.push(candidate);
        selectedIds.add(candidate.id);
      }
    }

    const remainder = this.shuffle(
      candidates.filter((candidate) => !selectedIds.has(candidate.id)),
    );

    while (selected.length < questionCount && remainder.length > 0) {
      const candidate = remainder.shift();

      if (!candidate) {
        continue;
      }

      selected.push(candidate);
      selectedIds.add(candidate.id);
    }

    return selected;
  }

  private getDifficultyTargets(questionCount: number) {
    const easy = Math.floor(questionCount * 0.4);
    const medium = Math.floor(questionCount * 0.4);
    const hard = questionCount - easy - medium;

    return {
      [BattleQuestionDifficulty.EASY]: easy,
      [BattleQuestionDifficulty.MEDIUM]: medium,
      [BattleQuestionDifficulty.HARD]: hard,
    };
  }

  private countSelected(items: CandidateQuestionRecord[]) {
    return items.length;
  }

  private countSelectedByDifficulty(
    items: CandidateQuestionRecord[],
    difficulty: string,
  ) {
    return items.filter((item) => item.battleDifficulty === difficulty).length;
  }

  private shuffle<T>(items: T[]) {
    const copy = [...items];

    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(this.nextRandom() * (index + 1));
      [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
    }

    return copy;
  }

  protected nextRandom() {
    return Math.random();
  }

  private createSnapshotRecord(
    battleId: string,
    skillCode: string | null,
    question: CandidateQuestionRecord,
    orderIndex: number,
  ) {
    const base = {
      battleRoomId: battleId,
      sourceQuizQuestionId: question.id,
      orderIndex,
      questionType:
        question.type === QuestionType.SINGLE_CHOICE
          ? BattleQuestionType.SINGLE_CHOICE
          : BattleQuestionType.CODE_FILL,
      presentation: question.battlePresentation!,
      difficulty: question.battleDifficulty,
      stemSnapshot: this.resolveStemSnapshot(question),
      explanationSnapshot: this.resolveExplanationSnapshot(question),
      knowledgeTagsSnapshot: this.resolveKnowledgeTagsSnapshot(question),
      programmingLanguage: question.programmingLanguage,
      skillCodeSnapshot: skillCode,
      courseIdSnapshot: question.quiz.chapter.courseId,
      chapterIdSnapshot: question.quiz.chapterId,
    };

    if (question.type === QuestionType.SINGLE_CHOICE) {
      const options = this.shuffle(question.options).map((option, index) => ({
        id: randomUUID(),
        sourceOptionId: option.id,
        orderIndex: index,
        blocks: this.resolveOptionBlocks(option.contentBlocks, option.content),
      }));
      const correctSourceOption = question.options.find(
        (option) => option.isCorrect,
      )!;
      const correctOption = options.find(
        (option) => option.sourceOptionId === correctSourceOption.id,
      )!;
      const correctAnswerSnapshot: BattleCorrectAnswerSnapshot = {
        type: 'SINGLE_CHOICE',
        optionId: correctOption.id,
      };

      return {
        ...base,
        optionsSnapshot: options,
        correctAnswerSnapshot,
        acceptedAnswersSnapshot: Prisma.JsonNull,
        answerNormalizationSnapshot: Prisma.JsonNull,
      };
    }

    const answerNormalizationSnapshot =
      this.resolveAnswerNormalization(question);

    return {
      ...base,
      optionsSnapshot: [],
      correctAnswerSnapshot: {
        type: 'CODE_FILL',
      } satisfies BattleCorrectAnswerSnapshot,
      acceptedAnswersSnapshot: this.asStringArray(question.acceptedAnswers),
      answerNormalizationSnapshot,
    };
  }

  private resolveStemSnapshot(question: CandidateQuestionRecord) {
    const blocks = this.resolveContentBlocks(
      question.stemBlocks,
      question.content,
    );
    const hasVisibleText = blocks.some(
      (block) => block.type === 'TEXT' && block.text.trim().length > 0,
    );

    return hasVisibleText
      ? blocks
      : [...this.createTextBlock(question.content), ...blocks];
  }

  private resolveExplanationSnapshot(question: CandidateQuestionRecord) {
    if (question.explanationBlocks) {
      return this.asContentBlocks(question.explanationBlocks);
    }

    if (question.explanation) {
      return this.createTextBlock(question.explanation);
    }

    return Prisma.JsonNull;
  }

  private resolveKnowledgeTagsSnapshot(question: CandidateQuestionRecord) {
    if (Array.isArray(question.knowledgeTags)) {
      return structuredClone(question.knowledgeTags) as Prisma.InputJsonValue;
    }

    return Prisma.JsonNull;
  }

  private resolveAnswerNormalization(
    question: CandidateQuestionRecord,
  ): CodeFillAnswerConfig {
    const raw =
      typeof question.answerNormalization === 'object' &&
      question.answerNormalization !== null
        ? (question.answerNormalization as Record<string, unknown>)
        : {};

    return {
      trim: raw.trim === false ? false : true,
      normalizeLineEndings: raw.normalizeLineEndings === false ? false : true,
      caseSensitive:
        typeof raw.caseSensitive === 'boolean'
          ? raw.caseSensitive
          : question.caseSensitive,
      collapseWhitespace: raw.collapseWhitespace === true,
      acceptedAnswers: this.asStringArray(question.acceptedAnswers),
    };
  }

  private resolveContentBlocks(rawBlocks: unknown, fallbackText: string) {
    if (Array.isArray(rawBlocks) && rawBlocks.length > 0) {
      return this.asContentBlocks(rawBlocks);
    }

    return this.createTextBlock(fallbackText);
  }

  private resolveOptionBlocks(rawBlocks: unknown, fallbackText: string) {
    if (Array.isArray(rawBlocks) && rawBlocks.length > 0) {
      return this.asContentBlocks(rawBlocks);
    }

    return this.createTextBlock(fallbackText);
  }

  private createTextBlock(text: string): ContentBlock[] {
    return [
      {
        type: 'TEXT',
        text,
      },
    ];
  }

  private restoreLegacyStem(snapshot: SnapshotRecord) {
    const blocks = this.asContentBlocks(snapshot.stemSnapshot);
    const hasVisibleText = blocks.some(
      (block) => block.type === 'TEXT' && block.text.trim().length > 0,
    );

    if (hasVisibleText || !snapshot.sourceQuizQuestion?.content.trim()) {
      return blocks;
    }

    return [
      ...this.createTextBlock(snapshot.sourceQuizQuestion.content),
      ...blocks,
    ];
  }

  private asContentBlocks(value: unknown) {
    if (!Array.isArray(value)) {
      return [];
    }

    return value as ContentBlock[];
  }

  private asStringArray(value: unknown) {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.filter((item): item is string => typeof item === 'string');
  }

  private asOptionSnapshots(value: unknown) {
    if (!Array.isArray(value)) {
      return [];
    }

    return value as BattleQuestionOptionSnapshot[];
  }

  private asBattleAnswerPayload(value: unknown) {
    return value as BattleAnswerPayload;
  }
}
