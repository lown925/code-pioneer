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
    expect(indexScript).toContain('ratingTrendView');
    expect(indexTemplate).toContain('微信登录');
    expect(indexTemplate).toContain('下一步建议');
    expect(indexTemplate).toContain('学习趋势');
    expect(indexTemplate).toContain('Python Rating 趋势');
    expect(indexTemplate).toContain('学习表现');
    expect(indexTemplate).not.toMatch(/雷达图|星级/);
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
