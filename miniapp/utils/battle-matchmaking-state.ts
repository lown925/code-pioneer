import type {
  BattleAiMatchmakingResolutionResponse,
  MatchmakingStatusResponse,
} from '../types/battle';
import {
  clearAuthSession,
  getAuthStateSummary,
  redirectToLogin,
} from './auth';
import { formatBattleSkill } from './battle';
import { request, RequestError } from './request';

declare function clearTimeout(timeoutId: number): void;
declare function setTimeout(handler: () => void, timeout: number): number;

export type BattleMatchmakingManagerStatus =
  | 'IDLE'
  | 'SEARCHING'
  | 'SEARCHING_COMPUTER_AVAILABLE'
  | 'MATCHED'
  | 'ENTERING_BATTLE'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'ERROR';

export type BattleMatchmakingSnapshot = {
  status: BattleMatchmakingManagerStatus;
  skillCode: string;
  skillName: string;
  battleId: string;
  searchStartedAt: string | null;
  expiresAt: string | null;
  serverTime: string | null;
  elapsedMs: number;
  remainingSearchMs: number;
  waitingCount: number;
  computerAvailable: boolean;
  collapsed: boolean;
  lastError: string;
  reconnecting: boolean;
  isJoining: boolean;
  isCancelling: boolean;
  isStartingComputer: boolean;
};

type MatchmakingListener = (snapshot: BattleMatchmakingSnapshot) => void;

type MatchmakingDependencies = {
  request<T>(options: {
    url: string;
    method: 'GET' | 'POST' | 'DELETE';
    data?: WechatMiniprogram.IAnyObject;
    authMode: 'required';
    disableAuthRedirect?: boolean;
  }): Promise<T>;
  getAuthStateSummary: typeof getAuthStateSummary;
  clearAuthSession: typeof clearAuthSession;
  redirectToLogin: typeof redirectToLogin;
  navigateTo(options: {
    url: string;
    success?: () => void;
    fail?: () => void;
  }): void;
  now(): number;
  setTimeout(handler: () => void, timeout: number): number;
  clearTimeout(timeoutId: number): void;
};

const POLL_INTERVAL_MS = 1800;
const DISPLAY_TICK_MS = 1000;
const ERROR_THRESHOLD = 3;

const INITIAL_SNAPSHOT: BattleMatchmakingSnapshot = {
  status: 'IDLE',
  skillCode: 'PYTHON',
  skillName: 'Python',
  battleId: '',
  searchStartedAt: null,
  expiresAt: null,
  serverTime: null,
  elapsedMs: 0,
  remainingSearchMs: 0,
  waitingCount: 0,
  computerAvailable: false,
  collapsed: true,
  lastError: '',
  reconnecting: false,
  isJoining: false,
  isCancelling: false,
  isStartingComputer: false,
};

function isUnauthorized(error: unknown) {
  return (
    error instanceof RequestError &&
    (error.statusCode === 401 || error.code === 'UNAUTHORIZED')
  );
}

function toErrorMessage(error: unknown) {
  if (error instanceof RequestError && error.code === 'BATTLE_AI_NOT_AVAILABLE') {
    return '电脑对战暂不可用，已重新同步真人匹配状态。';
  }

  if (error instanceof RequestError && error.message) {
    return error.message;
  }

  return '匹配状态同步失败，正在尝试重新连接。';
}

function normalizeMilliseconds(value: number | null | undefined) {
  return Number.isFinite(value) ? Math.max(0, Math.floor(value ?? 0)) : 0;
}

export class BattleMatchmakingManager {
  private readonly listeners = new Set<MatchmakingListener>();
  private snapshot: BattleMatchmakingSnapshot = { ...INITIAL_SNAPSHOT };
  private pollTimer: number | null = null;
  private displayTimer: number | null = null;
  private initialized = false;
  private appVisible = false;
  private syncPromise: Promise<BattleMatchmakingSnapshot> | null = null;
  private consecutiveFailures = 0;
  private lastServerSyncLocalMs = 0;
  private previousTrustedStatus: BattleMatchmakingManagerStatus = 'IDLE';

  constructor(private readonly dependencies: MatchmakingDependencies) {}

  initialize() {
    if (this.initialized) {
      return this.getSnapshot();
    }

    this.initialized = true;
    return this.getSnapshot();
  }

  onAppShow() {
    this.initialize();
    this.appVisible = true;

    if (!this.dependencies.getAuthStateSummary().isAuthenticated) {
      this.clearSensitiveState();
      return Promise.resolve(this.getSnapshot());
    }

    return this.sync({ force: true });
  }

  onAppHide() {
    this.appVisible = false;
    this.stopPoller();
    this.stopDisplayTicker();
  }

  subscribe(listener: MatchmakingListener) {
    this.initialize();
    this.listeners.add(listener);
    listener(this.getSnapshot());

    return () => {
      this.listeners.delete(listener);
    };
  }

  getSnapshot() {
    return this.withSmoothTime(this.snapshot);
  }

  async sync(options?: { force?: boolean; skillCode?: string }) {
    this.initialize();

    if (!this.dependencies.getAuthStateSummary().isAuthenticated) {
      this.clearSensitiveState();
      return this.getSnapshot();
    }

    if (this.syncPromise && !options?.force) {
      return this.syncPromise;
    }

    if (this.syncPromise) {
      return this.syncPromise;
    }

    const skillCode = options?.skillCode || this.snapshot.skillCode || 'PYTHON';
    this.syncPromise = this.dependencies
      .request<MatchmakingStatusResponse>({
        url: '/battles/matchmaking/status',
        method: 'GET',
        data: { skill: skillCode },
        authMode: 'required',
        disableAuthRedirect: true,
      })
      .then((payload) => {
        this.applyServerStatus(payload);
        return this.getSnapshot();
      })
      .catch((error: unknown) => {
        this.handleSyncFailure(error);
        return this.getSnapshot();
      })
      .finally(() => {
        this.syncPromise = null;
        this.scheduleForCurrentState();
      });

    return this.syncPromise;
  }

  async join(skillCode: string) {
    if (
      this.snapshot.isJoining ||
      this.snapshot.isCancelling ||
      this.snapshot.isStartingComputer
    ) {
      return this.getSnapshot();
    }

    if (!this.dependencies.getAuthStateSummary().isAuthenticated) {
      this.dependencies.redirectToLogin('/pages/battle/matchmaking');
      return this.getSnapshot();
    }

    this.patch({
      isJoining: true,
      lastError: '',
      reconnecting: false,
      skillCode,
      skillName: formatBattleSkill(skillCode),
    });

    try {
      const payload = await this.dependencies.request<MatchmakingStatusResponse>({
        url: '/battles/matchmaking/join',
        method: 'POST',
        data: { skill: skillCode },
        authMode: 'required',
      });
      this.applyServerStatus(payload);
    } catch (error) {
      this.handleActionFailure(error, '加入真人匹配失败，请稍后重试。');
    } finally {
      this.patch({ isJoining: false });
      this.scheduleForCurrentState();
    }

    return this.getSnapshot();
  }

  async cancel() {
    if (this.snapshot.isCancelling || this.snapshot.isJoining) {
      return this.getSnapshot();
    }

    this.patch({ isCancelling: true, lastError: '' });

    try {
      await this.dependencies.request<MatchmakingStatusResponse>({
        url: '/battles/matchmaking',
        method: 'DELETE',
        authMode: 'required',
      });
      this.resetToIdle();
    } catch (error) {
      this.handleActionFailure(error, '取消匹配失败，请重新同步后再试。');
    } finally {
      this.patch({ isCancelling: false });
      this.scheduleForCurrentState();
    }

    return this.getSnapshot();
  }

  async startComputerBattle() {
    if (
      !this.snapshot.computerAvailable ||
      this.snapshot.isStartingComputer ||
      this.snapshot.isCancelling ||
      this.snapshot.isJoining
    ) {
      return null;
    }

    this.patch({ isStartingComputer: true, lastError: '' });

    try {
      const resolution =
        await this.dependencies.request<BattleAiMatchmakingResolutionResponse>({
          url: '/battles/matchmaking/ai',
          method: 'POST',
          authMode: 'required',
        });
      this.stopPoller();
      this.stopDisplayTicker();
      this.previousTrustedStatus = 'ENTERING_BATTLE';
      this.patch({
        status: 'ENTERING_BATTLE',
        battleId: resolution.battleId,
        isStartingComputer: false,
        reconnecting: false,
        lastError: '',
      });
      this.enterBattle(resolution.battleId);
      return resolution;
    } catch (error) {
      this.patch({ isStartingComputer: false });
      this.handleActionFailure(error, '电脑对战创建失败，请稍后重试。');
      await this.sync({ force: true });
      return null;
    }
  }

  enterMatchedBattle() {
    if (this.snapshot.status !== 'MATCHED' || !this.snapshot.battleId) {
      return;
    }

    this.enterBattle(this.snapshot.battleId);
  }

  setCollapsed(collapsed: boolean) {
    this.patch({ collapsed });
  }

  dismissTerminalState() {
    if (
      this.snapshot.status === 'CANCELLED' ||
      this.snapshot.status === 'EXPIRED' ||
      this.snapshot.status === 'ERROR'
    ) {
      this.resetToIdle();
    }
  }

  clearSensitiveState() {
    this.stopPoller();
    this.stopDisplayTicker();
    this.consecutiveFailures = 0;
    this.previousTrustedStatus = 'IDLE';
    this.lastServerSyncLocalMs = 0;
    this.snapshot = { ...INITIAL_SNAPSHOT };
    this.notify();
  }

  private applyServerStatus(payload: MatchmakingStatusResponse) {
    this.consecutiveFailures = 0;
    this.lastServerSyncLocalMs = this.dependencies.now();
    const skillCode = payload.skill || this.snapshot.skillCode || 'PYTHON';
    let status: BattleMatchmakingManagerStatus;

    if (payload.status === 'SEARCHING') {
      status = payload.aiAvailable
        ? 'SEARCHING_COMPUTER_AVAILABLE'
        : 'SEARCHING';
    } else if (payload.status === 'MATCHED') {
      status = 'MATCHED';
    } else if (payload.status === 'EXPIRED') {
      status = 'EXPIRED';
    } else if (payload.status === 'CANCELLED') {
      status = this.previousTrustedStatus === 'MATCHED' ? 'CANCELLED' : 'IDLE';
    } else {
      status = 'IDLE';
    }

    this.previousTrustedStatus = status;
    this.snapshot = {
      ...this.snapshot,
      status,
      skillCode,
      skillName: formatBattleSkill(skillCode),
      battleId: payload.battleId ?? '',
      searchStartedAt: payload.searchStartedAt,
      expiresAt: payload.expiresAt,
      serverTime: payload.serverTime,
      elapsedMs: normalizeMilliseconds(payload.elapsedMs),
      remainingSearchMs: normalizeMilliseconds(payload.remainingSearchMs),
      waitingCount: Number.isFinite(payload.waitingCount)
        ? Math.max(0, Math.floor(payload.waitingCount))
        : 0,
      computerAvailable: Boolean(payload.aiAvailable),
      lastError: '',
      reconnecting: false,
    };
    this.notify();
  }

  private handleSyncFailure(error: unknown) {
    if (isUnauthorized(error)) {
      this.dependencies.clearAuthSession();
      this.clearSensitiveState();

      if (this.appVisible) {
        this.dependencies.redirectToLogin();
      }
      return;
    }

    this.consecutiveFailures += 1;
    const lastError = toErrorMessage(error);

    if (this.consecutiveFailures >= ERROR_THRESHOLD) {
      this.patch({ status: 'ERROR', lastError, reconnecting: true });
      return;
    }

    this.patch({ lastError, reconnecting: true });
  }

  private handleActionFailure(error: unknown, fallback: string) {
    if (isUnauthorized(error)) {
      this.dependencies.clearAuthSession();
      this.clearSensitiveState();
      this.dependencies.redirectToLogin();
      return;
    }

    this.patch({ lastError: toErrorMessage(error) || fallback });
  }

  private enterBattle(battleId: string) {
    if (!battleId) {
      return;
    }

    this.stopPoller();
    this.stopDisplayTicker();
    this.previousTrustedStatus = 'ENTERING_BATTLE';
    this.patch({ status: 'ENTERING_BATTLE', battleId });
    this.dependencies.navigateTo({
      url: `/pages/battle/room?battleId=${encodeURIComponent(battleId)}`,
      success: () => this.resetToIdle(),
      fail: () => {
        this.patch({ lastError: '无法打开 Battle 房间，请重新进入。' });
        void this.sync({ force: true });
      },
    });
  }

  private withSmoothTime(snapshot: BattleMatchmakingSnapshot) {
    if (
      snapshot.status !== 'SEARCHING' &&
      snapshot.status !== 'SEARCHING_COMPUTER_AVAILABLE'
    ) {
      return { ...snapshot };
    }

    const sinceSync = Math.max(
      0,
      this.dependencies.now() - this.lastServerSyncLocalMs,
    );

    return {
      ...snapshot,
      elapsedMs: snapshot.elapsedMs + sinceSync,
      remainingSearchMs: Math.max(0, snapshot.remainingSearchMs - sinceSync),
    };
  }

  private scheduleForCurrentState() {
    this.stopPoller();
    this.stopDisplayTicker();

    if (!this.appVisible || !this.dependencies.getAuthStateSummary().isAuthenticated) {
      return;
    }

    if (
      this.snapshot.status !== 'SEARCHING' &&
      this.snapshot.status !== 'SEARCHING_COMPUTER_AVAILABLE' &&
      this.snapshot.status !== 'MATCHED' &&
      this.snapshot.status !== 'ERROR' &&
      !this.snapshot.reconnecting
    ) {
      return;
    }

    this.pollTimer = this.dependencies.setTimeout(() => {
      this.pollTimer = null;
      void this.sync();
    }, POLL_INTERVAL_MS);

    if (
      this.snapshot.status === 'SEARCHING' ||
      this.snapshot.status === 'SEARCHING_COMPUTER_AVAILABLE'
    ) {
      this.displayTimer = this.dependencies.setTimeout(
        () => this.runDisplayTick(),
        DISPLAY_TICK_MS,
      );
    }
  }

  private runDisplayTick() {
    this.displayTimer = null;

    if (!this.appVisible) {
      return;
    }

    if (
      this.snapshot.status !== 'SEARCHING' &&
      this.snapshot.status !== 'SEARCHING_COMPUTER_AVAILABLE'
    ) {
      return;
    }

    this.notify();
    this.displayTimer = this.dependencies.setTimeout(
      () => this.runDisplayTick(),
      DISPLAY_TICK_MS,
    );
  }

  private stopPoller() {
    if (this.pollTimer !== null) {
      this.dependencies.clearTimeout(this.pollTimer);
      this.pollTimer = null;
    }
  }

  private stopDisplayTicker() {
    if (this.displayTimer !== null) {
      this.dependencies.clearTimeout(this.displayTimer);
      this.displayTimer = null;
    }
  }

  private resetToIdle() {
    const collapsed = this.snapshot.collapsed;
    this.stopPoller();
    this.stopDisplayTicker();
    this.consecutiveFailures = 0;
    this.previousTrustedStatus = 'IDLE';
    this.lastServerSyncLocalMs = 0;
    this.snapshot = { ...INITIAL_SNAPSHOT, collapsed };
    this.notify();
  }

  private patch(patch: Partial<BattleMatchmakingSnapshot>) {
    this.snapshot = { ...this.snapshot, ...patch };
    this.notify();
  }

  private notify() {
    const snapshot = this.getSnapshot();
    this.listeners.forEach((listener) => listener(snapshot));
  }
}

const manager = new BattleMatchmakingManager({
  request,
  getAuthStateSummary,
  clearAuthSession,
  redirectToLogin,
  navigateTo: (options) => wx.navigateTo(options),
  now: () => Date.now(),
  setTimeout: (handler, timeout) => setTimeout(handler, timeout),
  clearTimeout: (timeoutId) => clearTimeout(timeoutId),
});

export function initializeBattleMatchmakingManager() {
  return manager.initialize();
}

export function recoverBattleMatchmaking() {
  return manager.onAppShow();
}

export function pauseBattleMatchmaking() {
  manager.onAppHide();
}

export function getBattleMatchmakingManager() {
  return manager;
}
