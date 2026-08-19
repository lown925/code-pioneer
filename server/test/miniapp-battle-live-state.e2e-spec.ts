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
    expect(playScript).toContain('setPendingProgress(response)');
    expect(playScript).toContain('response.myAnsweredCount');
    expect(playScript).toContain('response.opponentAnsweredCount');
    expect(playScript).toContain('await this.loadPlayerContext()');
    expect(playScript).toContain('this.startSettlementPolling()');
  });

  it('locks submitted Play controls and sends completed re-entry to Result', () => {
    const playScript = readMiniappFile('pages/battle/play.ts');
    const playTemplate = readMiniappFile('pages/battle/play.wxml');
    const roomScript = readMiniappFile('pages/battle/room.ts');

    expect(playScript).toContain('participantStatus: response.participantStatus ?? \'SUBMITTED\'');
    expect(playScript).toContain('isParticipantLocked: true');
    expect(playScript).toContain('!this.data.isParticipantLocked');
    expect(playTemplate).toContain('isParticipantLocked ? \'option-card-locked\'');
    expect(playTemplate).toContain('disabled="{{state !== \'PLAYING\' || isBattleActionPending || isParticipantLocked}}"');
    expect(roomScript).toContain('navigateToResult(options?.autoNavigate)');
  });

  it('renders server-owned answered progress and completed performance indicators', () => {
    const playScript = readMiniappFile('pages/battle/play.ts');
    const playTemplate = readMiniappFile('pages/battle/play.wxml');
    const resultScript = readMiniappFile('pages/battle/result.ts');

    expect(playScript).toContain('response.myAnsweredCount');
    expect(playScript).toContain('response.opponentAnsweredCount');
    expect(playTemplate).toContain('class="shared-progress-track"');
    expect(playTemplate).toContain('{{myProgressText}}');
    expect(playTemplate).toContain('{{opponentProgressText}}');
    expect(resultScript).toContain('response.bestCombo');
    expect(resultScript).toContain('response.accuracy');
  });

  it('allocates the shared progress bar by both players answered counts', () => {
    const playScript = readMiniappFile('pages/battle/play.ts');

    expect(playScript).toContain(
      'const combinedAnsweredCount = normalizedMy + normalizedOpponent;',
    );
    expect(playScript).toContain(
      '(normalizedMy / combinedAnsweredCount) * 100',
    );
    expect(playScript).toContain('100 - myShare');
    expect(playScript).toContain('myShare.toFixed(2)');
    expect(playScript).toContain('opponentShare.toFixed(2)');
    expect((5 / (5 + 10)) * 100).toBeCloseTo(33.33, 2);
    expect((10 / (5 + 10)) * 100).toBeCloseTo(66.67, 2);
  });

  it('loads player cards from the existing room detail and keeps Rating optional', () => {
    const playScript = readMiniappFile('pages/battle/play.ts');
    const playTemplate = readMiniappFile('pages/battle/play.wxml');

    expect(playScript).toContain('async loadPlayerContext()');
    expect(playScript).toContain('this.applyPlayerContext(response)');
    expect(playScript).toContain('payload.participants');
    expect(playScript).toContain('participant.userId === currentUserId');
    expect(playScript).toContain("ratingText: rating === null ? ''");
    expect(playTemplate).toContain("myPlayer ? myPlayer.nicknameText : '我'");
    expect(playTemplate).toContain(
      "opponentPlayer ? opponentPlayer.nicknameText : '对手'",
    );
    expect(playTemplate).toContain('myPlayer && myPlayer.ratingText');
    expect(playTemplate).toContain(
      'opponentPlayer && opponentPlayer.ratingText',
    );
  });

  it('opens a question overview for navigation, submit, and forfeit actions', () => {
    const playScript = readMiniappFile('pages/battle/play.ts');
    const playTemplate = readMiniappFile('pages/battle/play.wxml');

    expect(playScript).toContain('handleOpenOverview()');
    expect(playScript).toContain('handleCloseOverview()');
    expect(playScript).toContain('handleOverviewSelectQuestion(');
    expect(playScript).toContain('this.handleSelectQuestion(event)');
    expect(playScript).toContain('this.handleSubmitBattle()');
    expect(playScript).toContain('this.handleForfeitBattle()');
    expect(playTemplate).toContain('bindtap="handleOpenOverview"');
    expect(playTemplate).toContain('class="overview-backdrop"');
    expect(playTemplate).toContain('catchtap="handleOverviewPanelTap"');
    expect(playTemplate).toContain('bindtap="handleOverviewSelectQuestion"');
    expect(playTemplate).toContain('bindtap="handleOverviewSubmit"');
    expect(playTemplate).toContain('bindtap="handleOverviewForfeit"');
  });

  it('uses light and dark Battle tokens without component-level color literals', () => {
    const playConfig = readMiniappFile('pages/battle/play.json');
    const playTemplate = readMiniappFile('pages/battle/play.wxml');
    const playStyle = readMiniappFile('pages/battle/play.wxss');
    const componentRules = playStyle.slice(playStyle.indexOf('.battle-page'));

    expect(playConfig).toContain('"navigationStyle": "custom"');
    expect(playTemplate).toContain('battle-theme-{{themeMode}}');
    expect(playStyle).toContain('.battle-theme-dark');
    expect(playStyle).toContain('.battle-theme-light');
    expect(playStyle).toContain('--battle-success: #10b981;');
    expect(playStyle).toContain('--battle-danger: #ef4444;');
    expect(componentRules).not.toMatch(/#[0-9a-f]{3,8}|rgba?\(/i);
  });

  it('does not render correctness, scores, accuracy, or live Combo during play', () => {
    const playTemplate = readMiniappFile('pages/battle/play.wxml');

    expect(playTemplate).not.toContain('correctCount');
    expect(playTemplate).not.toContain('wrongCount');
    expect(playTemplate).not.toContain('isCorrect');
    expect(playTemplate).not.toContain('accuracy');
    expect(playTemplate).not.toContain('opponentCombo');
    expect(playTemplate).not.toContain('bestCombo');
    expect(playTemplate).not.toContain('实时得分');
    expect(playTemplate).not.toContain('实时正确');
    expect(playTemplate).not.toContain('Combo');
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
    expect(indexTemplate).toContain(
      "leaderboardScope === 'PYTHON' ? '排位胜率' : '总榜胜率'",
    );
    expect(indexTemplate).not.toContain('{{item.winRateText}} 胜率');
    expect(indexTemplate).not.toContain('全部榜单');
  });

  it('offers both the legacy total leaderboard and Python leaderboard', () => {
    const leaderboardScript = readMiniappFile('pages/battle/leaderboard.ts');
    const leaderboardTemplate = readMiniappFile(
      'pages/battle/leaderboard.wxml',
    );

    expect(leaderboardScript).toContain(
      "type LeaderboardScope = 'TOTAL' | 'PYTHON'",
    );
    expect(leaderboardScript).toContain(
      "this.data.scope === 'PYTHON' ? { skill: 'PYTHON' } : {}",
    );
    expect(leaderboardTemplate).toContain('data-scope="TOTAL"');
    expect(leaderboardTemplate).toContain('data-scope="PYTHON"');
    expect(leaderboardTemplate).toContain('>总榜</view>');
    expect(leaderboardTemplate).toContain('>Python 榜</view>');
    expect(leaderboardTemplate).toContain('排位胜率');
    expect(leaderboardScript).toContain('item.rankedBattles');
    expect(leaderboardScript).toContain('item.star');
    expect(leaderboardScript).toContain('formatBattleStarDisplay(item.star)');
    expect(leaderboardTemplate).toContain('item.starSlots');
    expect(leaderboardTemplate).not.toContain('item.titleText');
  });

  it('shows the skill-scoped live matching count instead of profile rating and rank', () => {
    const matchmakingScript = readMiniappFile('pages/battle/matchmaking.ts');
    const matchmakingTemplate = readMiniappFile(
      'pages/battle/matchmaking.wxml',
    );

    expect(matchmakingScript).toContain('snapshot.waitingCount');
    expect(matchmakingScript).toContain('waitingCountText: formatWaitingCount(snapshot.waitingCount)');
    expect(matchmakingTemplate).toContain('{{waitingCountText}}');
    expect(matchmakingTemplate).toContain("state === 'SEARCHING_COMPUTER_AVAILABLE'");
    expect(matchmakingScript).toContain('getBattleMatchmakingManager');
  });

  it('hides unavailable Battle review data instead of rendering internal placeholders', () => {
    const historyScript = readMiniappFile('pages/battle/history-detail.ts');
    const historyTemplate = readMiniappFile('pages/battle/history-detail.wxml');
    const wrongScript = readMiniappFile('pages/wrong-question/detail.ts');
    const wrongTemplate = readMiniappFile('pages/wrong-question/detail.wxml');

    expect(historyScript).toContain('hasCorrectAnswer');
    expect(historyScript).toContain('hasKnowledgePoint');
    expect(historyScript).toContain('hasCourseRelation');
    expect(historyTemplate).toContain('wx:if="{{question.hasKnowledgePoint}}"');
    expect(historyTemplate).toContain('wx:if="{{question.hasCourseRelation || question.hasChapterRelation}}"');
    expect(wrongScript).toContain('acceptedAnswers ?? []');
    expect(wrongScript).toContain('hasBattleKnowledge');
    expect(wrongTemplate).toContain('wx:if="{{detail.hasBattleCorrectAnswer}}"');
    expect(wrongTemplate).toContain('wx:if="{{detail.hasBattleKnowledge}}"');
    expect(historyScript).not.toContain('当前正式接口未返回');
    expect(wrongScript).not.toContain('当前正式接口未返回');
  });

  it('offers computer battle when the server unlocks it', () => {
    const matchmakingScript = readMiniappFile('pages/battle/matchmaking.ts');
    const matchmakingTemplate = readMiniappFile(
      'pages/battle/matchmaking.wxml',
    );

    expect(matchmakingScript).toContain('handleStartComputer()');
    expect(matchmakingScript).toContain(
      'getBattleMatchmakingManager().startComputerBattle()',
    );
    expect(matchmakingTemplate).toContain(
      "state === 'SEARCHING_COMPUTER_AVAILABLE'",
    );
    expect(matchmakingTemplate).toContain('class="computer-offer"');
    expect(matchmakingTemplate).toContain('bindtap="handleStartComputer"');
    expect(matchmakingTemplate).toContain('bindtap="handleContinueWaiting"');
  });

  it('keeps submit available while hiding forfeit in training mode', () => {
    const playScript = readMiniappFile('pages/battle/play.ts');
    const playTemplate = readMiniappFile('pages/battle/play.wxml');

    expect(playScript).toContain(
      "const isTrainingMode = payload.mode === 'TRAINING'",
    );
    expect(playScript).toContain('this.data.isTrainingMode ||');
    expect(playScript).toContain('opponentPlayer: null');
    expect(playTemplate).toContain('bindtap="handleOverviewSubmit"');
    expect(playTemplate).toContain('wx:if="{{!isTrainingMode}}"');
    expect(playTemplate).toContain('bindtap="handleOverviewForfeit"');
    expect(playTemplate).toContain(
      "class=\"overview-actions {{isTrainingMode ? 'overview-actions-training' : ''}}\"",
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
      'wx:if="{{isRankedMode}}" class="section-card rating-card"',
    );
    expect(resultTemplate).toContain(
      'wx:if="{{hasCompetitiveTier}}" class="section-card tier-card"',
    );
    expect(resultScript).toContain(
      'isRankedMode && response.skill !== null && response.star !== null',
    );

    expect(historyScript).toContain("{ value: 'TRAINING', label: '训练' }");
    expect(historyScript).toContain("return '单人训练';");
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
      'wx:if="{{isRankedMode}}" class="section-card rating-card"',
    );
  });

  it('renders six-slot stars from profile data without competitive titles', () => {
    const matchmakingTemplate = readMiniappFile(
      'pages/battle/matchmaking.wxml',
    );
    const indexScript = readMiniappFile('pages/battle/index.ts');
    const resultTemplate = readMiniappFile('pages/battle/result.wxml');
    const battleUtility = readMiniappFile('utils/battle.ts');

    expect(matchmakingTemplate).toContain("item.status === 'UNRANKED'");
    expect(matchmakingTemplate).toContain('item.starSlots');
    expect(matchmakingTemplate).not.toContain('item.title');
    expect(indexScript).toContain('item.star');
    expect(indexScript).not.toContain('item.title');
    expect(resultTemplate).toContain('当前星级');
    expect(resultTemplate).toContain('starSlots');
    expect(resultTemplate).not.toContain('tierTitleText');
    expect(battleUtility).toContain('const BATTLE_STAR_COUNT = 6');
    expect(battleUtility).toContain('isFilled: index < normalizedStar');
  });
});
