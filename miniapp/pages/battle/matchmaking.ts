import type {
  BattleProfileResponse,
  BattleSkillProfile,
  BattleTrainingStartResponse,
  MatchmakingStatusResponse,
} from '../../types/battle';
import { getAuthStateSummary, redirectToLogin } from '../../utils/auth';
import {
  formatBattleDuration,
  getBattleErrorMessage,
} from '../../utils/battle';
import { request, RequestError } from '../../utils/request';

declare function clearTimeout(timeoutId: number): void;

type MatchmakingPageState =
  | 'IDLE'
  | 'JOINING'
  | 'SEARCHING'
  | 'MATCHED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'ERROR';

type MatchmakingPageData = {
  state: MatchmakingPageState;
  waitingCountText: string;
  battleId: string;
  errorMessage: string;
  waitedText: string;
  remainingText: string;
  searchStartedAtMs: number;
  expiresAtMs: number;
  stateTitle: string;
  stateDescription: string;
  availableSkills: BattleSkillProfile[];
  selectedSkillCode: string;
  selectedSkillName: string;
  canStartTraining: boolean;
  isStartingTraining: boolean;
};

type MatchmakingPageMethods = {
  ensureAuthenticated(): boolean;
  loadInitialData(): Promise<void>;
  loadProfile(): Promise<void>;
  refreshStatus(options?: { autoNavigate?: boolean }): Promise<void>;
  joinMatchmaking(): Promise<void>;
  cancelMatchmaking(): Promise<void>;
  startTraining(): Promise<void>;
  applyStatus(
    payload: MatchmakingStatusResponse,
    options?: { autoNavigate?: boolean },
  ): void;
  updateElapsedTime(): void;
  startPolling(): void;
  stopPolling(): void;
  startElapsedTicker(): void;
  stopElapsedTicker(): void;
  handleStartMatchmaking(): void;
  handleSelectSkill(
    event: WechatMiniprogram.CustomEvent<{ skill?: string }>,
  ): void;
  handleCancelMatchmaking(): void;
  handleContinueWaiting(): void;
  handleStartTraining(): void;
  handleRetry(): void;
  handleBackHome(): void;
  handleEnterRoom(): void;
  navigateToRoom(battleId: string, autoNavigate?: boolean): void;
  getReadableErrorMessage(error: unknown, fallback: string): string;
  updateProfileCard(profile: BattleProfileResponse): void;
};

const POLL_INTERVAL_MS = 1800;
const ELAPSED_TICK_MS = 1000;
const TRAINING_UNLOCK_MS = 60_000;

let isPageActive = false;
let hasLoadedOnce = false;
let requestSerial = 0;
let pollTimer: number | null = null;
let elapsedTimer: number | null = null;
let isStatusRequesting = false;
let isJoining = false;
let isCancelling = false;
let lastAutoNavigatedBattleId = '';
let trainingPromptShown = false;
let trainingSearchStartedAtMs = 0;

function parseTimestamp(value: string | null) {
  if (!value) {
    return 0;
  }

  const timestamp = Date.parse(value);

  return Number.isFinite(timestamp) ? timestamp : 0;
}

Page<MatchmakingPageData, MatchmakingPageMethods>({
  data: {
    state: 'IDLE',
    waitingCountText: '—',
    battleId: '',
    errorMessage: '',
    waitedText: '00:00',
    remainingText: '00:00',
    searchStartedAtMs: 0,
    expiresAtMs: 0,
    stateTitle: '准备开始随机匹配',
    stateDescription: '进入匹配池后会按评分范围轮询查找对手。',
    availableSkills: [],
    selectedSkillCode: '',
    selectedSkillName: '',
    canStartTraining: false,
    isStartingTraining: false,
  },

  onLoad() {
    isPageActive = true;
    void this.loadInitialData();
  },

  onShow() {
    isPageActive = true;

    if (hasLoadedOnce) {
      void this.loadProfile();
      void this.refreshStatus({
        autoNavigate: true,
      });
    }
  },

  onHide() {
    this.stopPolling();
    this.stopElapsedTicker();
  },

  onUnload() {
    isPageActive = false;
    requestSerial += 1;
    this.stopPolling();
    this.stopElapsedTicker();
  },

  onPullDownRefresh() {
    Promise.allSettled([this.loadProfile(), this.refreshStatus({ autoNavigate: true })]).finally(
      () => {
        wx.stopPullDownRefresh();
      },
    );
  },

  ensureAuthenticated() {
    const authState = getAuthStateSummary();

    if (authState.isAuthenticated) {
      return true;
    }

    redirectToLogin('/pages/battle/matchmaking');
    return false;
  },

  async loadInitialData() {
    if (!this.ensureAuthenticated()) {
      return;
    }

    try {
      await Promise.allSettled([
        this.loadProfile(),
        this.refreshStatus({ autoNavigate: true }),
      ]);
    } finally {
      hasLoadedOnce = true;
    }
  },

  async loadProfile() {
    if (!this.ensureAuthenticated()) {
      return;
    }

    try {
      const response = await request<BattleProfileResponse>({
        url: '/battles/profile',
        method: 'GET',
        authMode: 'required',
      });

      if (!isPageActive) {
        return;
      }

      this.updateProfileCard(response);
    } catch {
      // Keep auth summary fallback rating when profile loading fails.
    }
  },

  async refreshStatus(options?: { autoNavigate?: boolean }) {
    if (!this.ensureAuthenticated() || isStatusRequesting) {
      return;
    }

    const currentRequestSerial = ++requestSerial;
    isStatusRequesting = true;

    try {
      const response = await request<MatchmakingStatusResponse>({
        url: '/battles/matchmaking/status',
        method: 'GET',
        data: {
          skill: this.data.selectedSkillCode || 'PYTHON',
        },
        authMode: 'required',
      });

      if (!isPageActive || currentRequestSerial !== requestSerial) {
        return;
      }

      this.applyStatus(response, {
        autoNavigate: options?.autoNavigate,
      });
    } catch (error) {
      if (!isPageActive || currentRequestSerial !== requestSerial) {
        return;
      }

      this.stopPolling();
      this.stopElapsedTicker();
      lastAutoNavigatedBattleId = '';

      this.setData({
        state: 'ERROR',
        errorMessage: this.getReadableErrorMessage(
          error,
          '匹配状态加载失败，请稍后重试。',
        ),
        stateTitle: '匹配状态获取失败',
        stateDescription: '你可以重新查询服务端状态，或返回对战首页。',
      });
    } finally {
      isStatusRequesting = false;
    }
  },

  async joinMatchmaking() {
    if (!this.ensureAuthenticated() || isJoining || isCancelling) {
      return;
    }

    isJoining = true;
    const currentRequestSerial = ++requestSerial;
    this.stopPolling();
    this.stopElapsedTicker();

    this.setData({
      state: 'JOINING',
      errorMessage: '',
      battleId: '',
      stateTitle: '正在加入匹配池',
      stateDescription: '系统正在登记你的评分并查找合适对手。',
    });

    try {
      const response = await request<MatchmakingStatusResponse>({
        url: '/battles/matchmaking/join',
        method: 'POST',
        authMode: 'required',
        data: {
          skill: this.data.selectedSkillCode,
        },
      });

      if (!isPageActive || currentRequestSerial !== requestSerial) {
        return;
      }

      this.applyStatus(response, {
        autoNavigate: true,
      });
    } catch (error) {
      if (!isPageActive || currentRequestSerial !== requestSerial) {
        return;
      }

      this.setData({
        state: 'ERROR',
        errorMessage: this.getReadableErrorMessage(
          error,
          '加入匹配池失败，请稍后重试。',
        ),
        stateTitle: '加入匹配失败',
        stateDescription: '你可以重新开始匹配，或先返回对战首页。',
      });
    } finally {
      isJoining = false;
    }
  },

  async cancelMatchmaking() {
    if (!this.ensureAuthenticated() || isCancelling || isJoining) {
      return;
    }

    isCancelling = true;
    const currentRequestSerial = ++requestSerial;
    this.stopPolling();
    this.stopElapsedTicker();

    try {
      const response = await request<MatchmakingStatusResponse>({
        url: '/battles/matchmaking',
        method: 'DELETE',
        authMode: 'required',
      });

      if (!isPageActive || currentRequestSerial !== requestSerial) {
        return;
      }

      this.applyStatus(response, {
        autoNavigate: false,
      });

      wx.showToast({
        title: '已取消匹配',
        icon: 'none',
      });

      wx.switchTab({
        url: '/pages/battle/index',
      });
    } catch (error) {
      if (!isPageActive || currentRequestSerial !== requestSerial) {
        return;
      }

      if (
        error instanceof RequestError &&
        error.code === 'BATTLE_MATCH_ALREADY_COMPLETED'
      ) {
        await this.refreshStatus({
          autoNavigate: true,
        });
        return;
      }

      if (
        error instanceof RequestError &&
        error.code === 'BATTLE_MATCH_EXPIRED'
      ) {
        this.setData({
          state: 'EXPIRED',
          errorMessage: '',
          battleId: '',
          searchStartedAtMs: 0,
          expiresAtMs: 0,
          waitedText: '00:00',
          remainingText: '00:00',
          stateTitle: '本次匹配已过期',
          stateDescription: '匹配窗口已结束，你可以重新开始随机匹配。',
        });
        return;
      }

      this.setData({
        state: 'ERROR',
        errorMessage: this.getReadableErrorMessage(
          error,
          '取消匹配失败，请稍后重试。',
        ),
        stateTitle: '取消匹配失败',
        stateDescription: '你可以重新查询当前状态，避免和服务端状态不一致。',
      });
    } finally {
      isCancelling = false;
    }
  },

  async startTraining() {
    if (
      !this.ensureAuthenticated() ||
      this.data.state !== 'SEARCHING' ||
      !this.data.canStartTraining ||
      this.data.isStartingTraining
    ) {
      return;
    }

    this.setData({
      isStartingTraining: true,
      errorMessage: '',
      stateDescription: '正在退出真人匹配并创建单人训练。',
    });
    this.stopPolling();
    this.stopElapsedTicker();
    const currentRequestSerial = ++requestSerial;

    try {
      const response = await request<BattleTrainingStartResponse>({
        url: '/battles/training',
        method: 'POST',
        authMode: 'required',
      });

      if (!isPageActive || currentRequestSerial !== requestSerial) {
        return;
      }

      wx.redirectTo({
        url: `/pages/battle/play?battleId=${encodeURIComponent(response.battleId)}`,
      });
    } catch (error) {
      if (!isPageActive || currentRequestSerial !== requestSerial) {
        return;
      }

      this.setData({
        isStartingTraining: false,
        errorMessage: this.getReadableErrorMessage(
          error,
          '单人训练创建失败，请重新同步匹配状态后再试。',
        ),
        stateDescription: '你可以继续等待真人，或重新尝试进入单人训练。',
      });
      await this.refreshStatus({ autoNavigate: true });
    }
  },

  applyStatus(
    payload: MatchmakingStatusResponse,
    options?: { autoNavigate?: boolean },
  ) {
    const searchStartedAtMs = parseTimestamp(payload.searchStartedAt);
    const expiresAtMs = parseTimestamp(payload.expiresAt);
    const battleId = payload.battleId ?? '';
    const nextState = payload.status;
    const selectedSkillCode = payload.skill ?? this.data.selectedSkillCode;
    const selectedSkill = this.data.availableSkills.find(
      (skill) => skill.code === selectedSkillCode,
    );
    const waitingCount = Number.isFinite(payload.waitingCount)
      ? Math.max(0, payload.waitingCount)
      : 0;

    this.setData({
      waitingCountText: String(waitingCount),
    });

    if (selectedSkillCode) {
      this.setData({
        selectedSkillCode,
        selectedSkillName: selectedSkill?.name ?? selectedSkillCode,
      });
    }

    this.stopPolling();
    this.stopElapsedTicker();

    if (nextState !== 'MATCHED') {
      lastAutoNavigatedBattleId = '';
    }

    if (nextState === 'SEARCHING') {
      if (trainingSearchStartedAtMs !== searchStartedAtMs) {
        trainingSearchStartedAtMs = searchStartedAtMs;
        trainingPromptShown = false;
      }

      this.setData({
        state: 'SEARCHING',
        battleId: '',
        errorMessage: '',
        searchStartedAtMs,
        expiresAtMs,
        canStartTraining:
          searchStartedAtMs > 0 &&
          Date.now() - searchStartedAtMs >= TRAINING_UNLOCK_MS,
        isStartingTraining: false,
        stateTitle: '正在搜索对手',
        stateDescription: '页面可安全离开，恢复后会重新同步服务端状态。',
      });
      this.updateElapsedTime();
      this.startPolling();
      this.startElapsedTicker();
      return;
    }

    if (nextState === 'MATCHED') {
      trainingPromptShown = false;
      trainingSearchStartedAtMs = 0;
      this.setData({
        state: 'MATCHED',
        battleId,
        errorMessage: '',
        searchStartedAtMs,
        expiresAtMs,
        canStartTraining: false,
        isStartingTraining: false,
        waitedText:
          searchStartedAtMs > 0
            ? formatBattleDuration(
                Math.max(0, Math.floor((Date.now() - searchStartedAtMs) / 1000)),
              )
            : '00:00',
        remainingText: '00:00',
        stateTitle: '匹配成功',
        stateDescription: '已找到对手，正在为你打开 Battle 房间占位页。',
      });

      if (battleId) {
        this.navigateToRoom(battleId, options?.autoNavigate);
      }
      return;
    }

    if (nextState === 'CANCELLED') {
      trainingPromptShown = false;
      trainingSearchStartedAtMs = 0;
      this.setData({
        state: 'CANCELLED',
        battleId: '',
        errorMessage: '',
        searchStartedAtMs,
        expiresAtMs,
        waitedText: '00:00',
        remainingText: '00:00',
        canStartTraining: false,
        isStartingTraining: false,
        stateTitle: '匹配已取消',
        stateDescription: '当前没有进行中的随机匹配，你可以重新开始。',
      });
      return;
    }

    if (nextState === 'EXPIRED') {
      trainingPromptShown = false;
      trainingSearchStartedAtMs = 0;
      this.setData({
        state: 'EXPIRED',
        battleId: '',
        errorMessage: '',
        searchStartedAtMs,
        expiresAtMs,
        waitedText: '00:00',
        remainingText: '00:00',
        canStartTraining: false,
        isStartingTraining: false,
        stateTitle: '本次匹配已过期',
        stateDescription: '匹配窗口已结束，你可以重新开始随机匹配。',
      });
      return;
    }

    this.setData({
      state: 'IDLE',
      battleId: '',
      errorMessage: '',
      searchStartedAtMs: 0,
      expiresAtMs: 0,
      waitedText: '00:00',
      remainingText: '00:00',
      canStartTraining: false,
      isStartingTraining: false,
      stateTitle: '准备开始随机匹配',
      stateDescription: '进入匹配池后会按评分范围轮询查找对手。',
    });
  },

  updateElapsedTime() {
    if (this.data.state !== 'SEARCHING') {
      return;
    }

    const now = Date.now();
    const waitedSeconds =
      this.data.searchStartedAtMs > 0
        ? Math.max(0, Math.floor((now - this.data.searchStartedAtMs) / 1000))
        : 0;
    const remainingSeconds =
      this.data.expiresAtMs > 0
        ? Math.max(0, Math.floor((this.data.expiresAtMs - now) / 1000))
        : 0;

    this.setData({
      waitedText: formatBattleDuration(waitedSeconds),
      remainingText: formatBattleDuration(remainingSeconds),
      canStartTraining: waitedSeconds * 1000 >= TRAINING_UNLOCK_MS,
    });

    if (waitedSeconds * 1000 >= TRAINING_UNLOCK_MS && !trainingPromptShown) {
      trainingPromptShown = true;
      wx.showModal({
        title: '匹配等待较久',
        content: '暂时没有找到合适对手，是否退出真人匹配并进入单人训练？',
        confirmText: '单人训练',
        cancelText: '继续等待',
        success: (result) => {
          if (result.confirm) {
            void this.startTraining();
          }
        },
      });
    }
  },

  startPolling() {
    this.stopPolling();

    if (!isPageActive || this.data.state !== 'SEARCHING') {
      return;
    }

    pollTimer = setTimeout(() => {
      pollTimer = null;

      if (!isPageActive) {
        return;
      }

      void this.refreshStatus({
        autoNavigate: true,
      });
    }, POLL_INTERVAL_MS) as unknown as number;
  },

  stopPolling() {
    if (pollTimer !== null) {
      clearTimeout(pollTimer);
      pollTimer = null;
    }
  },

  startElapsedTicker() {
    this.stopElapsedTicker();

    if (!isPageActive || this.data.state !== 'SEARCHING') {
      return;
    }

    const tick = () => {
      if (!isPageActive || this.data.state !== 'SEARCHING') {
        elapsedTimer = null;
        return;
      }

      this.updateElapsedTime();

      elapsedTimer = setTimeout(tick, ELAPSED_TICK_MS) as unknown as number;
    };

    tick();
  },

  stopElapsedTicker() {
    if (elapsedTimer !== null) {
      clearTimeout(elapsedTimer);
      elapsedTimer = null;
    }
  },

  handleStartMatchmaking() {
    if (!this.data.selectedSkillCode) {
      wx.showToast({
        title: '请先选择对战方向',
        icon: 'none',
      });
      return;
    }

    void this.joinMatchmaking();
  },

  handleSelectSkill(
    event: WechatMiniprogram.CustomEvent<{ skill?: string }>,
  ) {
    if (this.data.state === 'SEARCHING' || this.data.state === 'MATCHED') {
      return;
    }

    const skillCode = event.currentTarget.dataset.skill;
    const skill = this.data.availableSkills.find(
      (item) => item.code === skillCode,
    );

    if (!skill) {
      return;
    }

    this.setData({
      selectedSkillCode: skill.code,
      selectedSkillName: skill.name,
    });

    void this.refreshStatus();
  },

  handleCancelMatchmaking() {
    void this.cancelMatchmaking();
  },

  handleContinueWaiting() {
    trainingPromptShown = true;
    this.setData({
      stateDescription: '将继续等待合适的真人对手，你也可以随时进入单人训练。',
    });
  },

  handleStartTraining() {
    void this.startTraining();
  },

  handleRetry() {
    if (this.data.state === 'SEARCHING') {
      void this.refreshStatus({
        autoNavigate: true,
      });
      return;
    }

    if (this.data.state === 'EXPIRED' || this.data.state === 'CANCELLED') {
      void this.joinMatchmaking();
      return;
    }

    void this.refreshStatus({
      autoNavigate: true,
    });
  },

  handleBackHome() {
    wx.switchTab({
      url: '/pages/battle/index',
    });
  },

  handleEnterRoom() {
    if (!this.data.battleId) {
      return;
    }

    this.navigateToRoom(this.data.battleId, false);
  },

  navigateToRoom(battleId: string, autoNavigate = false) {
    if (!battleId) {
      return;
    }

    if (autoNavigate && lastAutoNavigatedBattleId === battleId) {
      return;
    }

    if (autoNavigate) {
      lastAutoNavigatedBattleId = battleId;
    }

    wx.navigateTo({
      url: `/pages/battle/room?battleId=${encodeURIComponent(battleId)}`,
    });
  },

  getReadableErrorMessage(error: unknown, fallback: string) {
    if (error instanceof RequestError) {
      if (error.statusCode === 401 || error.code === 'UNAUTHORIZED') {
        redirectToLogin('/pages/battle/matchmaking');
        return '登录状态已失效，请重新登录后再继续随机匹配。';
      }
    }

    return getBattleErrorMessage(
      error,
      {
        unauthorized: '登录状态已失效，请重新登录后再继续随机匹配。',
        network: '网络连接失败，请确认后端服务已启动后重试。',
        fallback,
      },
      {
        BATTLE_ALREADY_ACTIVE:
          '你当前已有进行中的对战，请先完成当前对局，再开始新的 Battle。',
        BATTLE_ALREADY_MATCHING:
          '你当前正在随机匹配中，请先返回匹配页取消当前匹配。',
        BATTLE_MATCH_EXPIRED: '本次匹配已过期，请重新开始匹配。',
        BATTLE_INVALID_STATUS:
          '当前匹配状态已变化，请重新同步服务端状态后再继续操作。',
        BATTLE_SKILL_UNAVAILABLE: '该方向暂未开放或题量不足，请选择其他方向。',
        BATTLE_SKILL_LOCKED: '当前匹配已锁定方向，请先取消后再切换。',
        BATTLE_TRAINING_NOT_AVAILABLE:
          '当前还不满足单人训练条件，请继续等待并重新同步状态。',
      },
    );
  },

  updateProfileCard(profile: BattleProfileResponse) {
    const selectedSkill =
      profile.availableSkills.find(
        (skill) => skill.code === this.data.selectedSkillCode,
      ) ?? profile.availableSkills[0];

    this.setData({
      availableSkills: profile.availableSkills,
      selectedSkillCode: selectedSkill?.code ?? '',
      selectedSkillName: selectedSkill?.name ?? '',
    });
  },
});
