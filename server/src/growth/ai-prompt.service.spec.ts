/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { GrowthAiPromptService } from './ai-prompt.service';
import {
  buildGrowthAiPrompt,
  formatGrowthCareerDirection,
} from './ai-prompt-template';
import type { GrowthAiPromptContext } from './ai-prompt.types';

function createPrismaMock() {
  return {
    user: { findFirst: jest.fn() },
    courseLearningRecord: { findMany: jest.fn() },
    quizAttempt: { findMany: jest.fn() },
    practiceAttempt: { findMany: jest.fn() },
  } as never;
}

function createService() {
  const prisma = createPrismaMock();
  const service = new GrowthAiPromptService(prisma);
  return { prisma: prisma as any, service };
}

function seedEmpty(prisma: any) {
  prisma.user.findFirst.mockResolvedValue({
    grade: null,
    major: null,
    careerDirection: null,
    technicalInterests: [],
    userId: 'do-not-leak-user-id',
    nickname: 'do-not-leak-nickname',
    email: 'do-not-leak-email@example.com',
    avatarUrl: 'do-not-leak-avatar',
  });
  prisma.courseLearningRecord.findMany.mockResolvedValue([]);
  prisma.quizAttempt.findMany.mockResolvedValue([]);
  prisma.practiceAttempt.findMany.mockResolvedValue([]);
}

describe('Growth AI prompt template', () => {
  it('builds a complete deterministic prompt from allowlisted data', () => {
    const context: GrowthAiPromptContext = {
      gradeLabel: '大三',
      professionalTrackName: '计算机',
      careerDirectionLabel: '数据分析师',
      technicalInterests: ['Python', 'SQL'],
      completedCourses: ['Python 基础入门', '数据结构与算法基础'],
      learningCourses: [{ title: '数据库 SQL 基础', progressPercent: 35 }],
      learningSummary: { completedCourseCount: 2, learningCourseCount: 1 },
      quizSummary: {
        completedAttempts: 2,
        answeredQuestions: 10,
        correctQuestions: 7,
        accuracyPercent: 70,
      },
      practiceSummary: {
        completedAttempts: 1,
        answeredQuestions: 5,
        correctQuestions: 3,
        accuracyPercent: 60,
      },
      weakAreas: [
        {
          courseTitle: '数据库 SQL 基础',
          chapterTitle: '多表查询',
          errorCount: 3,
        },
      ],
    };

    const prompt = buildGrowthAiPrompt(context);

    expect(prompt).toContain('- 年级：大三');
    expect(prompt).toContain('- 专业：计算机');
    expect(prompt).toContain('- 职业目标：数据分析师');
    expect(prompt).toContain('- 技术兴趣：Python、SQL');
    expect(prompt).toContain(
      '- 已完成课程：Python 基础入门、数据结构与算法基础',
    );
    expect(prompt).toContain('- 数据库 SQL 基础（进度 35%）');
    expect(prompt).toContain(
      'Quiz 概况：完成 2 次，共回答 10 道题，正确 7 道，正确率 70%',
    );
    expect(prompt).toContain(
      'Practice 概况：完成 1 次，共回答 5 道题，正确 3 道，正确率 60%',
    );
    expect(prompt).toContain('- 数据库 SQL 基础 / 多表查询（错误 3 次）');
    expect(prompt).not.toMatch(/undefined|null|NaN/);
  });

  it('keeps the minimal profile natural and omits empty sections', () => {
    const prompt = buildGrowthAiPrompt({
      professionalTrackName: '计算机',
      completedCourses: [],
      learningCourses: [],
      weakAreas: [],
    });

    expect(prompt).toContain('我的情况：');
    expect(prompt).toContain('- 专业：计算机');
    expect(prompt).not.toContain('当前学习情况：');
    expect(prompt).not.toContain('当前较薄弱的学习领域：');
    expect(prompt).not.toMatch(/undefined|null|NaN|暂无|N\/A/);
  });

  it('never renders placeholder literals or non-finite numeric values', () => {
    const prompt = buildGrowthAiPrompt({
      gradeLabel: 'undefined',
      professionalTrackName: 'null',
      careerDirectionLabel: formatGrowthCareerDirection('custom:null'),
      completedCourses: ['NaN'],
      learningCourses: [{ title: '有效课程', progressPercent: Number.NaN }],
      quizSummary: {
        completedAttempts: Number.NaN,
        answeredQuestions: Number.POSITIVE_INFINITY,
        correctQuestions: Number.NaN,
        accuracyPercent: Number.NaN,
      },
      weakAreas: [
        {
          courseTitle: '有效课程',
          chapterTitle: '有效章节',
          errorCount: Number.NaN,
        },
      ],
    });

    expect(prompt).toContain('- 正在学习课程：');
    expect(prompt).not.toMatch(/undefined|null|NaN|N\/A/);
  });

  it('formats preset and custom career directions without changing persistence values', () => {
    expect(formatGrowthCareerDirection('career.backend_engineer')).toBe(
      '后端工程师',
    );
    expect(formatGrowthCareerDirection('custom: Java 后端开发 ')).toBe(
      'Java 后端开发',
    );
    expect(formatGrowthCareerDirection('   ')).toBe('');
  });
});

describe('GrowthAiPromptService', () => {
  it('builds an allowlisted context with completed and learning courses', async () => {
    const { prisma, service } = createService();
    seedEmpty(prisma);
    prisma.user.findFirst.mockResolvedValue({
      grade: 'grade.junior',
      major: 'major.computer_science',
      careerDirection: 'career.data_analyst',
      technicalInterests: ['interest.python', 'interest.sql'],
      userId: 'do-not-leak-user-id',
      nickname: 'do-not-leak-nickname',
    });
    prisma.courseLearningRecord.findMany.mockResolvedValue([
      {
        status: 'COMPLETED',
        progressPercent: { toNumber: () => 100 },
        course: { title: 'Python 基础入门' },
      },
      {
        status: 'LEARNING',
        progressPercent: { toNumber: () => 35 },
        course: { title: '数据库 SQL 基础' },
      },
      {
        status: 'NOT_STARTED',
        progressPercent: { toNumber: () => 0 },
        course: { title: '不应出现在 Prompt 的课程' },
      },
    ]);

    const context = await service.getPromptContext('user-1');

    expect(context).toEqual({
      gradeLabel: '大三',
      professionalTrackName: '计算机',
      careerDirectionLabel: '数据分析师',
      technicalInterests: ['Python', 'SQL'],
      completedCourses: ['Python 基础入门'],
      learningCourses: [{ title: '数据库 SQL 基础', progressPercent: 35 }],
      learningSummary: { completedCourseCount: 1, learningCourseCount: 1 },
      weakAreas: [],
    });
    expect(context).not.toHaveProperty('userId');
    expect(context).not.toHaveProperty('nickname');
    expect(prisma.user.findFirst).toHaveBeenCalledTimes(1);
    expect(prisma.courseLearningRecord.findMany).toHaveBeenCalledTimes(1);
    expect(prisma.quizAttempt.findMany).toHaveBeenCalledTimes(1);
    expect(prisma.practiceAttempt.findMany).toHaveBeenCalledTimes(1);
  });

  it('only summarizes submitted Quiz and completed Practice answers', async () => {
    const { prisma, service } = createService();
    seedEmpty(prisma);
    prisma.quizAttempt.findMany.mockResolvedValue([
      {
        answers: [{ isCorrect: true }, { isCorrect: false }],
        quiz: { chapter: { title: '聚合查询', course: { title: 'SQL' } } },
      },
      {
        answers: [],
        quiz: { chapter: { title: '空', course: { title: 'SQL' } } },
      },
    ]);
    prisma.practiceAttempt.findMany.mockResolvedValue([
      {
        status: 'COMPLETED',
        answers: [
          {
            isCorrect: false,
            question: {
              quiz: {
                chapter: { title: '多表查询', course: { title: 'SQL' } },
              },
            },
          },
          {
            isCorrect: true,
            question: {
              quiz: {
                chapter: { title: '多表查询', course: { title: 'SQL' } },
              },
            },
          },
        ],
      },
      {
        status: 'IN_PROGRESS',
        answers: [
          {
            isCorrect: false,
            question: {
              quiz: {
                chapter: { title: '不应计入', course: { title: 'SQL' } },
              },
            },
          },
        ],
      },
    ]);

    const context = await service.getPromptContext('user-1');

    expect(context.quizSummary).toEqual({
      completedAttempts: 1,
      answeredQuestions: 2,
      correctQuestions: 1,
      accuracyPercent: 50,
    });
    expect(context.practiceSummary).toEqual({
      completedAttempts: 1,
      answeredQuestions: 2,
      correctQuestions: 1,
      accuracyPercent: 50,
    });
    expect(context.weakAreas).toEqual([
      { courseTitle: 'SQL', chapterTitle: '多表查询', errorCount: 1 },
      { courseTitle: 'SQL', chapterTitle: '聚合查询', errorCount: 1 },
    ]);
    expect(
      context.weakAreas.some((area) => area.chapterTitle === '不应计入'),
    ).toBe(false);
  });

  it('limits weak areas to five with stable title ordering', async () => {
    const { prisma, service } = createService();
    seedEmpty(prisma);
    prisma.quizAttempt.findMany.mockResolvedValue(
      ['E', 'D', 'C', 'B', 'A', 'F'].map((chapterTitle) => ({
        answers: [{ isCorrect: false }],
        quiz: { chapter: { title: chapterTitle, course: { title: '课程' } } },
      })),
    );

    const context = await service.getPromptContext('user-1');

    expect(context.weakAreas).toHaveLength(5);
    expect(context.weakAreas.map((area) => area.chapterTitle)).toEqual([
      'A',
      'B',
      'C',
      'D',
      'E',
    ]);
  });

  it('does not guess a professional track for an unmapped major', async () => {
    const { prisma, service } = createService();
    seedEmpty(prisma);
    prisma.user.findFirst.mockResolvedValue({
      grade: 'grade.junior',
      major: 'custom:金融工程',
      careerDirection: null,
      technicalInterests: [],
    });

    const context = await service.getPromptContext('user-1');

    expect(context).not.toHaveProperty('professionalTrackName');
    expect(buildGrowthAiPrompt(context)).not.toContain('专业：大数据');
  });

  it('does not leak sensitive fixture values into the context or prompt', async () => {
    const { prisma, service } = createService();
    seedEmpty(prisma);

    const context = await service.getPromptContext('user-1');
    const prompt = buildGrowthAiPrompt(context);

    expect(prompt).not.toContain('do-not-leak-user-id');
    expect(prompt).not.toContain('do-not-leak-nickname');
    expect(prompt).not.toContain('do-not-leak-email@example.com');
    expect(prompt).not.toContain('do-not-leak-avatar');
    expect(JSON.stringify(context)).not.toMatch(
      /userId|nickname|email|avatarUrl/,
    );
  });

  it('is deterministic for the same context', () => {
    const context: GrowthAiPromptContext = {
      gradeLabel: '大三',
      professionalTrackName: '计算机',
      completedCourses: ['Python 基础入门'],
      learningCourses: [],
      weakAreas: [],
    };

    expect(buildGrowthAiPrompt(context)).toBe(buildGrowthAiPrompt(context));
  });

  it('does not call network APIs while building the prompt', async () => {
    const { prisma, service } = createService();
    seedEmpty(prisma);
    const fetchSpy = jest.spyOn(globalThis, 'fetch');

    try {
      await service.buildPrompt('user-1');
      expect(fetchSpy).not.toHaveBeenCalled();
    } finally {
      fetchSpy.mockRestore();
    }
  });
});
