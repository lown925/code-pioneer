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

  it('shows the skill-scoped live matching count instead of profile rating and rank', () => {
    const matchmakingScript = readMiniappFile('pages/battle/matchmaking.ts');
    const matchmakingTemplate = readMiniappFile(
      'pages/battle/matchmaking.wxml',
    );

    expect(matchmakingScript).toContain('payload.waitingCount');
    expect(matchmakingTemplate).toContain(
      "当前 {{selectedSkillName || 'Python'}} 在线匹配人数",
    );
    expect(matchmakingTemplate).toContain('{{waitingCountText}}');
    expect(matchmakingTemplate).not.toContain('当前等待匹配人数');
    expect(matchmakingTemplate).not.toContain('当前评分');
    expect(matchmakingTemplate).not.toContain('当前排名');
  });

  it('offers confirmed single-player training after sixty seconds', () => {
    const matchmakingScript = readMiniappFile('pages/battle/matchmaking.ts');
    const matchmakingTemplate = readMiniappFile(
      'pages/battle/matchmaking.wxml',
    );

    expect(matchmakingScript).toContain('const TRAINING_UNLOCK_MS = 60_000;');
    expect(matchmakingScript).toContain("url: '/battles/training'");
    expect(matchmakingScript).toContain('wx.showModal({');
    expect(matchmakingScript).toContain("confirmText: '单人训练'");
    expect(matchmakingScript).toContain("cancelText: '继续等待'");
    expect(matchmakingTemplate).toContain(
      "state === 'SEARCHING' && canStartTraining",
    );
    expect(matchmakingTemplate).toContain('开始单人训练');
    expect(matchmakingTemplate).toContain('继续等待');
  });

  it('keeps submit available while hiding forfeit in training mode', () => {
    const playScript = readMiniappFile('pages/battle/play.ts');
    const playTemplate = readMiniappFile('pages/battle/play.wxml');

    expect(playScript).toContain("const isTrainingMode = payload.mode === 'TRAINING'");
    expect(playScript).toContain('this.data.isTrainingMode ||');
    expect(playTemplate).toMatch(
      /wx:if="\{\{state === 'PLAYING' \|\| state === 'COUNTDOWN'\}\}"\s+class="primary-button submit-battle-button/,
    );
    expect(playTemplate).toMatch(
      /wx:if="\{\{!isTrainingMode && \(state === 'PLAYING' \|\| state === 'COUNTDOWN'\)\}\}"\s+class="ghost-button forfeit-button/,
    );
  });

  it('renders training result and history without opponent or Rating sections', () => {
    const resultScript = readMiniappFile('pages/battle/result.ts');
    const resultTemplate = readMiniappFile('pages/battle/result.wxml');
    const historyScript = readMiniappFile('pages/battle/history.ts');
    const historyDetailTemplate = readMiniappFile(
      'pages/battle/history-detail.wxml',
    );

    expect(resultScript).toContain("response.mode === 'TRAINING'");
    expect(resultScript).toContain("resultText: '训练完成'");
    expect(resultTemplate).toMatch(
      /<view class="section-card score-card">\s*<text class="score-label">我的分数<\/text>/,
    );
    expect(resultTemplate).toMatch(
      /wx:if="\{\{!isTrainingMode\}\}" class="section-card score-card">\s*<text class="score-label">对手分数<\/text>/,
    );
    expect(resultTemplate).toContain(
      'wx:if="{{!isTrainingMode}}" class="section-card opponent-card"',
    );
    expect(resultTemplate).toContain(
      'wx:if="{{!isTrainingMode}}" class="section-card rating-card"',
    );

    expect(historyScript).toContain("{ value: 'TRAINING', label: '训练' }");
    expect(historyScript).toContain(": '单人训练'");
    expect(historyDetailTemplate).toMatch(
      /<view class="section-card score-card">\s*<text class="score-label">我的分数<\/text>/,
    );
    expect(historyDetailTemplate).toMatch(
      /wx:if="\{\{!isTrainingMode\}\}" class="section-card score-card">\s*<text class="score-label">对手分数<\/text>/,
    );
    expect(historyDetailTemplate).toContain(
      'wx:if="{{!isTrainingMode}}" class="section-card opponent-card"',
    );
    expect(historyDetailTemplate).toContain(
      'wx:if="{{!isTrainingMode}}" class="section-card rating-card"',
    );
  });
});
