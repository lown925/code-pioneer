import { readFileSync } from 'fs';
import { resolve } from 'path';

const miniappRoot = resolve(__dirname, '../../miniapp');

function readMiniappFile(relativePath: string) {
  return readFileSync(resolve(miniappRoot, relativePath), 'utf8');
}

describe('Miniapp development mock login isolation', () => {
  const loginScript = readMiniappFile('pages/auth/login.ts');
  const loginTemplate = readMiniappFile('pages/auth/login.wxml');
  const authUtils = readMiniappFile('utils/auth.ts');
  const publicEnvironment = readMiniappFile('utils/public-env.ts');

  it('renders only fixed A/B test accounts behind the develop-only flag', () => {
    expect(loginScript).toContain('showTestLogin: isDevelopmentEnvironment()');
    expect(loginTemplate).toContain('wx:if="{{showTestLogin}}"');
    expect(loginTemplate).toContain('测试玩家 A');
    expect(loginTemplate).toContain('测试玩家 B');
    expect(loginTemplate).not.toMatch(/<input\b/i);
    expect(authUtils).toContain("CURRENT_ENV_VERSION === 'develop'");
  });

  it('uses the existing WeChat login endpoint with only fixed mock OpenIDs', () => {
    expect(loginScript).toContain('url: "/auth/wechat-login"');
    expect(loginScript).toContain('mockOpenId');
    expect(loginScript).toContain('"test-player-a"');
    expect(loginScript).toContain('"test-player-b"');
    expect(loginScript).toContain('saveLoginSession(data)');
    expect(loginScript).not.toContain('/auth/dev-login');
    expect(loginScript).not.toContain('dev:test-player');
  });

  it('keeps formal WeChat login and non-development API URLs intact', () => {
    expect(loginScript).toContain('wx.login({');
    expect(publicEnvironment).not.toMatch(
      /(?:trialApiBaseUrl|releaseApiBaseUrl):\s*["']http:\/\/(?:localhost|127\.0\.0\.1)/,
    );
  });
});
