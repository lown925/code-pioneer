import { readFileSync } from 'fs';
import { resolve } from 'path';

const miniappRoot = resolve(__dirname, '../../miniapp');

function readMiniappFile(relativePath: string) {
  return readFileSync(resolve(miniappRoot, relativePath), 'utf8');
}

describe('miniapp Battle live state and skill leaderboard', () => {
  it('polls results while playing and converges when the opponent forfeits', () => {
    const playScript = readMiniappFile('pages/battle/play.ts');

    expect(playScript).toContain("if (nextState === 'PLAYING')");
    expect(playScript).toContain('this.startResultPolling()');
    expect(playScript).toContain('/result`');
    expect(playScript).toContain("response.endReason === 'USER_FORFEIT'");
    expect(playScript).toContain("response.result === 'WIN'");
    expect(playScript).toContain('对手已认输，本场已结算');
    expect(playScript).toContain("error.code === 'BATTLE_ALREADY_COMPLETED'");
    expect(playScript).toContain(
      "error.code === 'BATTLE_PARTICIPANT_ALREADY_SUBMITTED'",
    );
    expect(playScript).toContain("error.code === 'BATTLE_INVALID_STATUS'");
  });

  it('shows the total leaderboard first and switches scopes in place', () => {
    const indexScript = readMiniappFile('pages/battle/index.ts');
    const indexTemplate = readMiniappFile('pages/battle/index.wxml');

    expect(indexScript).toContain("leaderboardScope: 'TOTAL'");
    expect(indexScript).toContain("this.data.leaderboardScope === 'PYTHON'");
    expect(indexScript).toContain('handleLeaderboardScopeChange');
    expect(indexScript).toContain('profile.availableSkills.find');
    expect(indexTemplate).toContain('总榜');
    expect(indexTemplate).toContain('Python 榜');
    expect(indexTemplate).toContain('bindtap="handleLeaderboardScopeChange"');
    expect(indexTemplate).not.toContain('全部榜单');
  });

  it('offers both the legacy total leaderboard and Python leaderboard', () => {
    const leaderboardScript = readMiniappFile('pages/battle/leaderboard.ts');
    const leaderboardTemplate = readMiniappFile('pages/battle/leaderboard.wxml');

    expect(leaderboardScript).toContain("type LeaderboardScope = 'TOTAL' | 'PYTHON'");
    expect(leaderboardScript).toContain(
      "this.data.scope === 'PYTHON' ? { skill: 'PYTHON' } : {}",
    );
    expect(leaderboardTemplate).toContain('data-scope="TOTAL"');
    expect(leaderboardTemplate).toContain('data-scope="PYTHON"');
    expect(leaderboardTemplate).toContain('>总榜</view>');
    expect(leaderboardTemplate).toContain('>Python 榜</view>');
  });

  it('shows the live waiting count instead of profile rating and rank', () => {
    const matchmakingScript = readMiniappFile('pages/battle/matchmaking.ts');
    const matchmakingTemplate = readMiniappFile(
      'pages/battle/matchmaking.wxml',
    );

    expect(matchmakingScript).toContain('payload.waitingCount');
    expect(matchmakingTemplate).toContain('当前等待匹配人数');
    expect(matchmakingTemplate).toContain('{{waitingCountText}}');
    expect(matchmakingTemplate).not.toContain('当前评分');
    expect(matchmakingTemplate).not.toContain('当前排名');
  });
});
