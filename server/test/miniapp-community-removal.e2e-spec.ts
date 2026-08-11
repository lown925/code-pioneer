import { readFileSync } from 'fs';
import { resolve } from 'path';
import { sanitizeLoginRedirectPath } from '../../miniapp/utils/navigation';

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

describe('miniapp Community removal', () => {
  it('keeps only Battle, Learning, and Profile in the TabBar', () => {
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
        pagePath: 'pages/profile/index',
        text: '我的',
      }),
    ]);
  });

  it('does not register Community pages or profile Community pages', () => {
    const appConfig = JSON.parse(
      readMiniappFile('app.json'),
    ) as MiniappAppConfig;

    expect(
      appConfig.pages.filter(
        (pagePath) =>
          pagePath.startsWith('pages/community/') ||
          pagePath.startsWith('pages/profile/community-'),
      ),
    ).toEqual([]);
  });

  it('sanitizes every removed Community login redirect to Battle', () => {
    const fallback = '/pages/battle/index';
    const removedPaths = [
      '/pages/community/index',
      '/pages/community/create',
      '/pages/community/detail?postId=post-id',
      '/pages/profile/community-posts',
      '/pages/profile/community-favorites?cursor=cursor-id',
      '/pages/profile/community-history',
    ];

    removedPaths.forEach((target) => {
      expect(sanitizeLoginRedirectPath(target, fallback)).toBe(fallback);
    });
    expect(
      sanitizeLoginRedirectPath('/pages/battle/room?battleId=id', fallback),
    ).toBe('/pages/battle/room?battleId=id');
  });

  it('removes Community requests and navigation from active profile pages', () => {
    const profileIndex = [
      readMiniappFile('pages/profile/index.ts'),
      readMiniappFile('pages/profile/index.wxml'),
    ].join('\n');
    const userProfile = [
      readMiniappFile('pages/profile/user-profile.ts'),
      readMiniappFile('pages/profile/user-profile.wxml'),
    ].join('\n');
    const followList = readMiniappFile('pages/profile/follow-list.ts');

    expect(profileIndex).not.toMatch(/fetchMyCommunity|\/pages\/community/);
    expect(profileIndex).not.toMatch(/community-(posts|favorites|history)/);
    expect(profileIndex).not.toMatch(/我的帖子|社区收藏|社区浏览历史/);
    expect(userProfile).not.toMatch(/recentPosts|postCount|\/pages\/community/);
    expect(followList).toContain("from '../../utils/validation'");
    expect(followList).not.toContain("from '../../utils/community'");
  });

  it('does not expose an explicit Community sitemap rule', () => {
    const sitemap = readMiniappFile('sitemap.json');

    expect(sitemap).not.toMatch(/pages\/community|pages\/profile\/community-/);
  });
});
