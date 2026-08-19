import { registerThemedPage } from '../../utils/theme-page';
import type { BattleProfileResponse, BattleSkillProfile } from '../../types/battle';
import { getAuthStateSummary, redirectToLogin } from '../../utils/auth';
import {
  getBattleMatchmakingManager,
  type BattleMatchmakingSnapshot,
} from '../../utils/battle-matchmaking-state';
import { formatBattleDuration, formatBattleStarDisplay } from '../../utils/battle';
import { request } from '../../utils/request';

type BattleSkillOption = BattleSkillProfile & ReturnType<typeof formatBattleStarDisplay>;

type MatchmakingPageData = {
  state: BattleMatchmakingSnapshot['status'] | 'JOINING';
  waitingCountText: string;
  battleId: string;
  errorMessage: string;
  waitedText: string;
  remainingText: string;
  stateTitle: string;
  stateDescription: string;
  availableSkills: BattleSkillOption[];
  selectedSkillCode: string;
  selectedSkillName: string;
  computerAvailable: boolean;
  isStartingComputer: boolean;
  isCancelling: boolean;
};

type MatchmakingPageMethods = {
  ensureAuthenticated(): boolean;
  loadProfile(): Promise<void>;
  applyManagerSnapshot(snapshot: BattleMatchmakingSnapshot): void;
  updateProfileCard(profile: BattleProfileResponse): void;
  handleStartMatchmaking(): void;
  handleSelectSkill(event: WechatMiniprogram.CustomEvent<{ skill?: string }>): void;
  handleCancelMatchmaking(): void;
  handleContinueWaiting(): void;
  handleStartComputer(): void;
  handleRetry(): void;
  handleBackHome(): void;
  handleEnterRoom(): void;
};

let unsubscribeMatchmaking: (() => void) | null = null;

function getStateCopy(snapshot: BattleMatchmakingSnapshot) {
  if (snapshot.status === 'SEARCHING_COMPUTER_AVAILABLE') {
    return { title: '正在匹配对手', description: '暂时没有合适的对手，可进入电脑对战或继续等待。' };
  }
  if (snapshot.status === 'SEARCHING') {
    return { title: '正在匹配对手', description: '可以离开本页继续使用小程序，匹配状态会持续同步。' };
  }
  if (snapshot.status === 'MATCHED') {
    return { title: '匹配成功', description: '正在打开对战房间，请完成准备。' };
  }
  if (snapshot.status === 'CANCELLED') {
    return { title: '该次匹配已失效', description: '房间未能在准备时间内开始，可以重新匹配。' };
  }
  if (snapshot.status === 'EXPIRED') {
    return { title: '匹配已结束', description: snapshot.computerAvailable ? '30 分钟搜索已结束，仍可进入电脑对战或重新匹配。' : '本轮搜索已结束，可以重新开始匹配。' };
  }
  if (snapshot.status === 'ERROR') {
    return { title: '正在重新连接', description: '匹配状态会继续保留，请重新同步最新状态。' };
  }
  return { title: '准备开始随机匹配', description: '选择对战语言后开始匹配。' };
}

function formatWaitingCount(waitingCount: number) {
  return waitingCount > 1
    ? `当前有 ${waitingCount} 位玩家正在匹配`
    : '正在寻找合适的对手';
}

registerThemedPage<MatchmakingPageData, MatchmakingPageMethods>({
  data: {
    state: 'IDLE',
    waitingCountText: '正在寻找合适的对手',
    battleId: '',
    errorMessage: '',
    waitedText: '00:00',
    remainingText: '00:00',
    stateTitle: '准备开始随机匹配',
    stateDescription: '选择对战语言后开始匹配。',
    availableSkills: [],
    selectedSkillCode: 'PYTHON',
    selectedSkillName: 'Python',
    computerAvailable: false,
    isStartingComputer: false,
    isCancelling: false,
  },

  onLoad() {
    if (!this.ensureAuthenticated()) return;
    const manager = getBattleMatchmakingManager();
    manager.setCollapsed(true);
    unsubscribeMatchmaking?.();
    unsubscribeMatchmaking = manager.subscribe((snapshot: BattleMatchmakingSnapshot) => this.applyManagerSnapshot(snapshot));
    void Promise.allSettled([this.loadProfile(), manager.sync({ force: true })]);
  },

  onShow() {
    if (getAuthStateSummary().isAuthenticated) void getBattleMatchmakingManager().sync({ force: true });
  },

  onUnload() {
    unsubscribeMatchmaking?.();
    unsubscribeMatchmaking = null;
  },

  onPullDownRefresh() {
    Promise.allSettled([this.loadProfile(), getBattleMatchmakingManager().sync({ force: true })]).finally(() => wx.stopPullDownRefresh());
  },

  ensureAuthenticated() {
    if (getAuthStateSummary().isAuthenticated) return true;
    redirectToLogin('/pages/battle/matchmaking');
    return false;
  },

  async loadProfile() {
    if (!this.ensureAuthenticated()) return;
    try {
      const profile = await request<BattleProfileResponse>({ url: '/battles/profile', method: 'GET', authMode: 'required' });
      this.updateProfileCard(profile);
    } catch {
      // Matchmaking recovery remains available if profile decoration fails.
    }
  },

  applyManagerSnapshot(snapshot: BattleMatchmakingSnapshot) {
    const copy = getStateCopy(snapshot);
    const selectedSkill = this.data.availableSkills.find((skill) => skill.code === snapshot.skillCode);
    this.setData({
      state: snapshot.isJoining ? 'JOINING' : snapshot.status,
      waitingCountText: formatWaitingCount(snapshot.waitingCount),
      battleId: snapshot.battleId,
      errorMessage: snapshot.lastError,
      waitedText: formatBattleDuration(snapshot.elapsedMs / 1000),
      remainingText: formatBattleDuration(snapshot.remainingSearchMs / 1000),
      stateTitle: copy.title,
      stateDescription: copy.description,
      selectedSkillCode: snapshot.skillCode || this.data.selectedSkillCode,
      selectedSkillName: selectedSkill?.name || snapshot.skillName || this.data.selectedSkillName,
      computerAvailable: snapshot.computerAvailable,
      isStartingComputer: snapshot.isStartingComputer,
      isCancelling: snapshot.isCancelling,
    });
  },

  updateProfileCard(profile: BattleProfileResponse) {
    const availableSkills = profile.availableSkills.map((skill: BattleSkillProfile) => ({ ...skill, ...formatBattleStarDisplay(skill.star) }));
    const selectedSkill = availableSkills.find((skill: BattleSkillOption) => skill.code === this.data.selectedSkillCode) ?? availableSkills[0];
    this.setData({ availableSkills, selectedSkillCode: selectedSkill?.code ?? 'PYTHON', selectedSkillName: selectedSkill?.name ?? 'Python' });
  },

  handleStartMatchmaking() {
    if (!this.data.selectedSkillCode) {
      wx.showToast({ title: '请先选择对战语言', icon: 'none' });
      return;
    }
    void getBattleMatchmakingManager().join(this.data.selectedSkillCode);
  },

  handleSelectSkill(event: WechatMiniprogram.CustomEvent<{ skill?: string }>) {
    if (['SEARCHING', 'SEARCHING_COMPUTER_AVAILABLE', 'MATCHED', 'JOINING'].includes(this.data.state)) return;
    const skillCode = event.currentTarget.dataset.skill;
    const skill = this.data.availableSkills.find((item) => item.code === skillCode);
    if (!skill) return;
    this.setData({ selectedSkillCode: skill.code, selectedSkillName: skill.name });
    void getBattleMatchmakingManager().sync({ force: true, skillCode: skill.code });
  },

  handleCancelMatchmaking() {
    void getBattleMatchmakingManager().cancel();
  },

  handleContinueWaiting() {
    getBattleMatchmakingManager().setCollapsed(true);
    wx.switchTab({ url: '/pages/battle/index' });
  },

  handleStartComputer() {
    void getBattleMatchmakingManager().startComputerBattle();
  },

  handleRetry() {
    if (this.data.state === 'CANCELLED' || this.data.state === 'EXPIRED') {
      void getBattleMatchmakingManager().join(this.data.selectedSkillCode);
      return;
    }
    void getBattleMatchmakingManager().sync({ force: true });
  },

  handleBackHome() {
    wx.switchTab({ url: '/pages/battle/index' });
  },

  handleEnterRoom() {
    getBattleMatchmakingManager().enterMatchedBattle();
  },
});
