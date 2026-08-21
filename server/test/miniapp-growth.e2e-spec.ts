import { readFileSync } from 'fs';
import { resolve } from 'path';
import {
  DEFAULT_TAB_PAGE_PATH,
  isTabBarPage,
} from '../../miniapp/utils/config';
import {
  MAJOR_OPTIONS,
  buildCustomGrowthValue,
  dedupeGrowthValues,
  getGrowthValueLabel,
  resolveSingleGrowthValue,
} from '../../miniapp/utils/growth-profile';
import { buildGrowthCourseRecommendations } from '../../miniapp/utils/growth';

type MiniappAppConfig = {
  pages: string[];
  tabBar: {
    list: Array<{
      pagePath: string;
      text: string;
    }>;
  };
};

const miniappRoot = resolve(__dirname, '../../miniapp');

function readMiniappFile(relativePath: string) {
  return readFileSync(resolve(miniappRoot, relativePath), 'utf8');
}

describe('miniapp Growth product skeleton', () => {
  it('registers the exact four-tab order while keeping Battle as default', () => {
    const appConfig = JSON.parse(
      readMiniappFile('app.json'),
    ) as MiniappAppConfig;

    expect(appConfig.tabBar.list).toEqual([
      expect.objectContaining({
        pagePath: 'pages/battle/index',
        text: '对战',
      }),
      expect.objectContaining({
        pagePath: 'pages/learning/index',
        text: '学习',
      }),
      expect.objectContaining({
        pagePath: 'pages/growth/index',
        text: '成长',
      }),
      expect.objectContaining({
        pagePath: 'pages/profile/index',
        text: '我的',
      }),
    ]);
    expect(appConfig.pages).toEqual(
      expect.arrayContaining(['pages/growth/index', 'pages/growth/profile']),
    );
    expect(DEFAULT_TAB_PAGE_PATH).toBe('/pages/battle/index');
    expect(isTabBarPage('/pages/growth/index')).toBe(true);
  });

  it('keeps Growth independent from Community and Follow', () => {
    const sources = [
      readMiniappFile('pages/growth/index.ts'),
      readMiniappFile('pages/growth/index.wxml'),
      readMiniappFile('pages/growth/profile.ts'),
      readMiniappFile('pages/growth/profile.wxml'),
      readMiniappFile('utils/growth-profile.ts'),
    ].join('\n');

    expect(sources).not.toMatch(/utils\/community|followUser|unfollowUser/);
    expect(sources).not.toMatch(/pages\/community|pages\/profile\/follow-list/);
  });

  it('loads the Growth overview and has a safe guest state', () => {
    const indexScript = readMiniappFile('pages/growth/index.ts');
    const indexTemplate = readMiniappFile('pages/growth/index.wxml');

    expect(indexScript).toContain('fetchGrowthOverview(this.data.range)');
    expect(indexScript).toMatch(/state:\s*["']guest["']/);
    expect(indexScript).toMatch(
      /redirectToLogin\(["']\/pages\/growth\/index["']\)/,
    );
    expect(indexScript).toContain('profile.isCoreProfileComplete');
    expect(indexScript).toContain('buildRatingChartPoints');
    expect(indexScript).toContain('openGoalEditor');
    expect(indexTemplate).toContain('微信登录');
    expect(indexTemplate).toContain('下一步建议');
    expect(indexTemplate).toContain('推荐学习');
    expect(indexTemplate).toContain('学习趋势');
    expect(indexTemplate).toContain('rating-points=');
    expect(indexTemplate).toContain('chart-mode="rating"');
    expect(indexTemplate).toContain('我的学习目标');
    expect(indexTemplate).toContain('skill-filter');
    expect(indexTemplate).toContain('学习表现');
    expect(indexTemplate).not.toContain('学习概览');
    expect(indexTemplate).not.toContain('trend-section');
    expect(indexTemplate).not.toMatch(/雷达图|星级/);
    expect(indexTemplate).not.toMatch(/Python Rating/);
  });

  it('puts profile before goals and keeps complete/incomplete profile paths', () => {
    const template = readMiniappFile('pages/growth/index.wxml');
    const profileIndex = template.indexOf('学习画像');
    const courseIndex = template.indexOf('推荐学习');
    const goalIndex = template.indexOf('我的学习目标');

    expect(profileIndex).toBeGreaterThan(-1);
    expect(profileIndex).toBeLessThan(courseIndex);
    expect(courseIndex).toBeLessThan(goalIndex);
    expect(template).toContain('完善学习画像');
    expect(template).toContain('告诉我们你的专业、学习方向和职业目标');
    expect(template).toContain('profile.isCoreProfileComplete');
    expect(template).toContain('profile-summary-primary');
    expect(template).toContain('编辑 ›');
  });

  it('uses real course identity for technical-interest recommendations', () => {
    const recommendations = buildGrowthCourseRecommendations(
      {
        major: 'major.computer_science',
        grade: 'grade.freshman',
        learningDirection: 'direction.frontend',
        technicalInterests: ['interest.python'],
        careerDirection: null,
        isCoreProfileComplete: true,
      },
      [
        {
          id: 'course-python',
          title: 'Python 基础入门',
          slug: 'python-basic',
          summary: 'Python',
          coverUrl: null,
          category: 'PROGRAMMING',
          language: 'Python',
          difficulty: 'BEGINNER',
          estimatedMinutes: 60,
          chapterCount: 1,
          learnerCount: 0,
          progressPercent: 0,
          isSelected: false,
        },
        {
          id: 'course-data-structures',
          title: '数据结构与算法基础',
          slug: 'data-structures-algorithms',
          summary: '算法基础',
          coverUrl: null,
          category: 'GENERAL',
          language: 'Python',
          difficulty: 'BEGINNER',
          estimatedMinutes: 60,
          chapterCount: 1,
          learnerCount: 0,
          progressPercent: 0,
          isSelected: false,
        },
      ],
    );

    expect(recommendations.map((item) => item.courseId)).toEqual([
      'course-python',
      'course-data-structures',
    ]);
    expect(recommendations[0]).toEqual(
      expect.objectContaining({
        courseId: 'course-python',
        courseTitle: 'Python 基础入门',
        targetPath: '/pages/course/detail?courseId=course-python',
      }),
    );
    expect(recommendations[1]).toEqual(
      expect.objectContaining({
        courseId: 'course-data-structures',
        courseTitle: '数据结构与算法基础',
        targetPath: '/pages/course/detail?courseId=course-data-structures',
      }),
    );
    expect(
      buildGrowthCourseRecommendations(
        {
          major: null,
          grade: null,
          learningDirection: null,
          technicalInterests: ['interest.database'],
          careerDirection: null,
          isCoreProfileComplete: true,
        },
        [],
      ),
    ).toEqual([]);
  });

  it('uses progress and published prerequisites without synthesizing planned courses', () => {
    const profile = {
      major: 'major.computer_science',
      grade: 'grade.sophomore',
      learningDirection: 'direction.backend',
      technicalInterests: ['interest.algorithm'],
      careerDirection: 'career.backend_engineer',
      isCoreProfileComplete: true,
    };
    const python = {
      id: 'course-python',
      title: 'Python 程序设计基础',
      slug: 'python-basic',
      summary: 'Python',
      coverUrl: null,
      category: 'PROGRAMMING',
      language: 'Python',
      difficulty: 'BEGINNER' as const,
      estimatedMinutes: 1200,
      chapterCount: 15,
      learnerCount: 10,
      progressPercent: 40,
      isSelected: true,
    };
    const dataStructures = {
      id: 'course-data-structures',
      title: '数据结构与算法基础',
      slug: 'data-structures-algorithms',
      summary: '算法',
      coverUrl: null,
      category: 'GENERAL',
      language: 'Python',
      difficulty: 'BEGINNER' as const,
      estimatedMinutes: 1440,
      chapterCount: 12,
      learnerCount: 0,
      progressPercent: 0,
      isSelected: false,
      prerequisites: ['python-basic'],
    };

    const whilePythonIncomplete = buildGrowthCourseRecommendations(profile, [
      python,
      dataStructures,
    ]);
    expect(whilePythonIncomplete.map((item) => item.courseId)).toEqual([
      'course-python',
    ]);
    expect(whilePythonIncomplete[0]?.reason).toContain('40%');

    const afterPythonComplete = buildGrowthCourseRecommendations(profile, [
      { ...python, progressPercent: 100 },
      dataStructures,
    ]);
    expect(afterPythonComplete.map((item) => item.courseId)).toEqual([
      'course-data-structures',
    ]);
    expect(
      afterPythonComplete.every(
        (item) => item.courseTitle !== 'Linux 基础与常用命令',
      ),
    ).toBe(true);
  });

  it('keeps the recommendation fallback and preserves the Goal controls', () => {
    const template = readMiniappFile('pages/growth/index.wxml');
    expect(template).toContain('courseRecommendationFallbackText');
    expect(readMiniappFile('pages/growth/index.ts')).toContain('"浏览课程"');
    expect(template).toContain('继续学习');
    expect(template).toContain('调整目标');
    expect(template).toContain('取消目标');
  });

  it('shows only useful chapter samples and embeds the trend threshold in performance', () => {
    const script = readMiniappFile('pages/growth/index.ts');
    const template = readMiniappFile('pages/growth/index.wxml');
    expect(script).toContain(
      '.filter((chapter) => chapter.status === "ASSESSED")',
    );
    expect(script).toContain('.slice(0, 5)');
    expect(script).toContain('validTrendPointCount >= 3');
    expect(template).toContain('class="growth-section performance-section"');
    expect(template).toContain('class="learning-trend"');
    expect(template).toContain('chart-mode="learning"');
    expect(template).not.toContain('无答题样本的日期不会被画成 0%');
  });

  it('keeps wrong-question, multi-course, Battle, Rating, and theme contracts', () => {
    const template = readMiniappFile('pages/growth/index.wxml');
    const script = readMiniappFile('pages/growth/index.ts');
    expect(template).toContain('course-filter');
    expect(template).toContain('courseTitle');
    expect(template).toContain('skill-filter');
    expect(template).toContain('rating-points=');
    expect(template).toContain('chart-mode="rating"');
    expect(template).toContain('resolved-theme="{{resolvedTheme}}"');
    expect(script).toContain('buildWrongAreaViews');
  });

  it('supports all five fields, clearing, loading, and refresh-on-return', () => {
    const profileScript = readMiniappFile('pages/growth/profile.ts');
    const profileTemplate = readMiniappFile('pages/growth/profile.wxml');
    const indexScript = readMiniappFile('pages/growth/index.ts');

    expect(profileScript).toContain('fetchCurrentUserProfile()');
    expect(profileScript).toContain('updateCurrentUser({');
    expect(profileScript).toContain('major: resolveStoredSingleValue(');
    expect(profileScript).toContain('grade: resolveStoredSingleValue(');
    expect(profileScript).toContain(
      'learningDirection: resolveStoredSingleValue(',
    );
    expect(profileScript).toContain('technicalInterests,');
    expect(profileScript).toContain(
      'careerDirection: resolveStoredSingleValue(',
    );
    expect(profileScript).toContain(
      'return selectedCode || buildCustomGrowthValue(customValue) || null;',
    );
    expect(profileScript).toContain('selectedTechnicalInterestCodes: []');
    expect(profileTemplate).toContain('loading="{{isSaving}}"');
    expect(profileTemplate).toContain('disabled="{{isSaving}}"');
    expect(indexScript).toContain('onShow()');
    expect(indexScript).toContain('void this.loadOverview()');
  });

  it('converts stable preset and custom values for display and editing', () => {
    expect(getGrowthValueLabel('major.computer_science', MAJOR_OPTIONS)).toBe(
      '计算机科学与技术',
    );
    expect(getGrowthValueLabel('custom:金融工程', MAJOR_OPTIONS)).toBe(
      '金融工程',
    );
    expect(buildCustomGrowthValue('  custom:Power BI  ')).toBe(
      'custom:Power BI',
    );
    expect(buildCustomGrowthValue('   ')).toBe('');
    expect(
      resolveSingleGrowthValue('major.computer_science', MAJOR_OPTIONS),
    ).toEqual({
      selectedCode: 'major.computer_science',
      customValue: '',
    });
    expect(resolveSingleGrowthValue('custom:金融工程', MAJOR_OPTIONS)).toEqual({
      selectedCode: '',
      customValue: '金融工程',
    });
    expect(
      dedupeGrowthValues([
        ' interest.python ',
        'interest.python',
        'custom:Power BI',
        '',
      ]),
    ).toEqual(['interest.python', 'custom:Power BI']);
  });
});
