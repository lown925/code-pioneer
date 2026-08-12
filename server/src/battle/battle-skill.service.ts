import { BadRequestException, Injectable } from '@nestjs/common';
import {
  ChapterStatus,
  CourseStatus,
  QuestionType,
  QuizStatus,
} from '../../generated/prisma/enums';
import type { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { DEFAULT_BATTLE_QUESTION_COUNT, INITIAL_BATTLE_RATING } from './battle.constants';
import { BATTLE_ERROR_CODES } from './battle.errors';
import type { BattleTransactionClient } from './battle.types';

type BattleClient = PrismaService | BattleTransactionClient;

@Injectable()
export class BattleSkillService {
  constructor(private readonly prisma: PrismaService) {}

  async getAvailableSkills(client?: BattleClient) {
    const prisma = client ?? this.prisma;
    const skills = await prisma.battleSkill.findMany({
      where: { isEnabled: true },
      orderBy: [{ sortOrder: 'asc' }, { code: 'asc' }],
      select: {
        code: true,
        name: true,
        quizQuestions: {
          where: this.getEligibleQuestionWhere(),
          select: {
            type: true,
            battlePresentation: true,
            battleDifficulty: true,
            acceptedAnswers: true,
            options: {
              select: { isCorrect: true },
            },
          },
        },
      },
    });

    return skills
      .map((skill) => ({
        code: skill.code,
        name: skill.name,
        questionCount: skill.quizQuestions.filter((question) =>
          this.isValidBattleQuestion(question),
        ).length,
      }))
      .filter((skill) => skill.questionCount >= DEFAULT_BATTLE_QUESTION_COUNT)
      .map((skill) => ({
        code: skill.code,
        name: skill.name,
        questionCount: skill.questionCount,
      }));
  }

  async assertAvailableSkill(skillCode: string, client?: BattleClient) {
    const normalizedSkillCode = this.normalizeSkillCode(skillCode);
    const availableSkills = await this.getAvailableSkills(client);
    const skill = availableSkills.find(
      (item) => item.code === normalizedSkillCode,
    );

    if (!skill) {
      throw new BadRequestException(BATTLE_ERROR_CODES.BATTLE_SKILL_UNAVAILABLE);
    }

    return skill;
  }

  async ensureUserSkillRating(
    userId: string,
    skillCode: string,
    client?: BattleClient,
  ) {
    const prisma = client ?? this.prisma;

    return prisma.userBattleSkillRating.upsert({
      where: {
        userId_skillCode: {
          userId,
          skillCode,
        },
      },
      update: {},
      create: {
        userId,
        skillCode,
        rating: INITIAL_BATTLE_RATING,
        highestRating: INITIAL_BATTLE_RATING,
      },
    });
  }

  normalizeSkillCode(skillCode: string) {
    return skillCode.trim().toUpperCase();
  }

  private getEligibleQuestionWhere(): Prisma.QuizQuestionWhereInput {
    return {
      isBattleEnabled: true,
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
    };
  }

  private isValidBattleQuestion(question: {
    type: QuestionType;
    battlePresentation: string | null;
    battleDifficulty: string | null;
    acceptedAnswers: unknown;
    options: Array<{ isCorrect: boolean }>;
  }) {
    if (!question.battlePresentation || !question.battleDifficulty) {
      return false;
    }

    if (question.type === QuestionType.SINGLE_CHOICE) {
      return (
        question.options.length >= 2 &&
        question.options.filter((option) => option.isCorrect).length === 1
      );
    }

    return (
      question.type === QuestionType.CODE_FILL &&
      Array.isArray(question.acceptedAnswers) &&
      question.acceptedAnswers.some((answer) => typeof answer === 'string')
    );
  }
}
