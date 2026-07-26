import type {
  BattleParticipantSummary,
  BattleRoomDetailResponse,
} from '../../types/battle';
import { getAuthStateSummary, redirectToLogin } from '../../utils/auth';
import {
  formatBattleDuration,
  formatBattleInitial,
  formatBattleNickname,
} from '../../utils/battle';
import { request, RequestError } from '../../utils/request';

declare function clearTimeout(timeoutId: number): void;

type RoomPageState =
  | 'LOADING'
  | 'WAITING'
  | 'READY'
  | 'COUNTDOWN'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'ERROR';

type ParticipantCard = {
  userId: string;
  seatText: string;
  nicknameText: string;
  avatarUrl: string;
  avatarFallbackText: string;
  statusText: string;
  statusClassName: string;
  isCurrentUser: boolean;
};

type RoomPageData = {
  battleId: string;
  isValidBattleId: boolean;
  state: RoomPageState;
  roomModeText: string;
  roomStatusText: string;
  titleText: string;
  descriptionText: string;
  errorMessage: string;
  questionCountText: string;
  durationText: string;
  countdownText: string;
  canReady: boolean;
  readyButtonText: string;
  myParticipant: ParticipantCard | null;
  opponentParticipant: ParticipantCard | null;
};

type RoomPageMethods = {
  ensureAuthenticated(): boolean;
  loadRoom(options?: { autoNavigate?: boolean }): Promise<void>;
  readyBattle(): Promise<void>;
  applyRoomData(
    payload: BattleRoomDetailResponse,
    options?: { autoNavigate?: boolean },
  ): void;
  startPolling(): void;
  stopPolling(): void;
  startCountdownTicker(): void;
  stopCountdownTicker(): void;
  updateCountdownDisplay(): void;
  handleRetry(): void;
  handleReady(): void;
  handleBackHome(): void;
  handleEnterPlay(): void;
  navigateToPlay(autoNavigate?: boolean): void;
  mapRoomState(payload: BattleRoomDetailResponse): RoomPageState;
  mapParticipant(
    participant: BattleParticipantSummary | null,
    currentUserId: string,
  ): ParticipantCard | null;
  getRoomMeta(payload: BattleRoomDetailResponse): {
    titleText: string;
    descriptionText: string;
    roomStatusText: string;
    canReady: boolean;
    readyButtonText: string;
  };
  getParticipantStatusText(status: string): string;
  getParticipantStatusClassName(status: string): string;
  getReadableError(error: unknown): string;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const POLL_INTERVAL_MS = 1800;
const COUNTDOWN_TICK_MS = 250;

let isPageActive = false;
let hasLoadedOnce = false;
let requestSerial = 0;
let pollTimer: number | null = null;
let countdownTimer: number | null = null;
let isRoomRequesting = false;
let isReadyRequesting = false;
let serverTimeOffsetMs = 0;
let startedAtTimestampMs = 0;
let lastAutoNavigatedBattleId = '';

function parseTimestamp(value: string | null | undefined) {
  if (!value) {
    return 0;
  }

  const timestamp = Date.parse(value);

  return Number.isFinite(timestamp) ? timestamp : 0;
}

function getServerNowMs() {
  return Date.now() + serverTimeOffsetMs;
}

Page<RoomPageData, RoomPageMethods>({
  data: {
    battleId: '',
    isValidBattleId: false,
    state: 'LOADING',
    roomModeText: '',
    roomStatusText: '',
    titleText: '正在加载 Battle 房间',
    descriptionText: '系统正在同步房间状态，请稍候。',
    errorMessage: '',
    questionCountText: '0 题',
    durationText: '00:00',
    countdownText: '',
    canReady: false,
    readyButtonText: '准备',
    myParticipant: null,
    opponentParticipant: null,
  },

  onLoad(options) {
    isPageActive = true;
    const battleId =
      typeof options?.battleId === 'string' ? options.battleId.trim() : '';
    const isValidBattleId = UUID_PATTERN.test(battleId);

    this.setData({
      battleId,
      isValidBattleId,
      state: isValidBattleId ? 'LOADING' : 'ERROR',
      titleText: isValidBattleId ? '正在加载 Battle 房间' : 'battleId 无效',
      descriptionText: isValidBattleId
        ? '系统正在同步房间状态，请稍候。'
        : '当前页面没有收到合法的 Battle 房间标识。',
      errorMessage: '',
    });

    if (!isValidBattleId) {
      return;
    }

    void this.loadRoom({
      autoNavigate: true,
    });
  },

  onShow() {
    isPageActive = true;

    if (hasLoadedOnce && this.data.isValidBattleId) {
      void this.loadRoom({
        autoNavigate: true,
      });
    }
  },

  onHide() {
    this.stopPolling();
    this.stopCountdownTicker();
  },

  onUnload() {
    isPageActive = false;
    requestSerial += 1;
    this.stopPolling();
    this.stopCountdownTicker();
  },

  onPullDownRefresh() {
    void this.loadRoom({
      autoNavigate: true,
    }).finally(() => {
      wx.stopPullDownRefresh();
    });
  },

  ensureAuthenticated() {
    if (getAuthStateSummary().isAuthenticated) {
      return true;
    }

    if (this.data.isValidBattleId) {
      redirectToLogin(
        `/pages/battle/room?battleId=${encodeURIComponent(this.data.battleId)}`,
      );
    } else {
      redirectToLogin('/pages/battle/index');
    }
    return false;
  },

  async loadRoom(options?: { autoNavigate?: boolean }) {
    if (
      !this.data.isValidBattleId ||
      !this.ensureAuthenticated() ||
      isRoomRequesting
    ) {
      return;
    }

    const currentRequestSerial = ++requestSerial;
    isRoomRequesting = true;

    try {
      const response = await request<BattleRoomDetailResponse>({
        url: `/battles/${encodeURIComponent(this.data.battleId)}`,
        method: 'GET',
        authMode: 'required',
      });

      if (!isPageActive || currentRequestSerial !== requestSerial) {
        return;
      }

      this.applyRoomData(response, {
        autoNavigate: options?.autoNavigate,
      });
    } catch (error) {
      if (!isPageActive || currentRequestSerial !== requestSerial) {
        return;
      }

      this.stopPolling();
      this.stopCountdownTicker();

      this.setData({
        state: 'ERROR',
        titleText: '房间状态加载失败',
        descriptionText: '你可以重新查询 Battle 房间状态，或返回对战首页。',
        errorMessage: this.getReadableError(error),
        canReady: false,
        countdownText: '',
      });
    } finally {
      isRoomRequesting = false;
      hasLoadedOnce = true;
    }
  },

  async readyBattle() {
    if (
      !this.data.isValidBattleId ||
      !this.ensureAuthenticated() ||
      isReadyRequesting
    ) {
      return;
    }

    isReadyRequesting = true;

    this.setData({
      readyButtonText: '准备中',
      errorMessage: '',
    });

    try {
      const response = await request<BattleRoomDetailResponse>({
        url: `/battles/${encodeURIComponent(this.data.battleId)}/ready`,
        method: 'POST',
        authMode: 'required',
      });

      if (!isPageActive) {
        return;
      }

      this.applyRoomData(response, {
        autoNavigate: true,
      });
    } catch (error) {
      if (!isPageActive) {
        return;
      }

      this.setData({
        errorMessage: this.getReadableError(error),
        readyButtonText: '准备',
      });
    } finally {
      isReadyRequesting = false;
    }
  },

  applyRoomData(
    payload: BattleRoomDetailResponse,
    options?: { autoNavigate?: boolean },
  ) {
    const currentUserId = getAuthStateSummary().user?.id ?? '';
    const sortedParticipants = [...payload.participants].sort(
      (left, right) => left.seat - right.seat,
    );
    const myParticipant =
      sortedParticipants.find((item) => item.userId === currentUserId) ?? null;
    const opponentParticipant =
      sortedParticipants.find((item) => item.userId !== currentUserId) ?? null;
    const state = this.mapRoomState(payload);
    const meta = this.getRoomMeta(payload);

    serverTimeOffsetMs = parseTimestamp(payload.serverTime) - Date.now();
    startedAtTimestampMs = parseTimestamp(payload.startedAt);

    this.stopPolling();
    this.stopCountdownTicker();

    if (state !== 'COUNTDOWN' && state !== 'IN_PROGRESS') {
      lastAutoNavigatedBattleId = '';
    }

    this.setData({
      state,
      roomModeText: payload.mode === 'FRIEND' ? '好友对战' : '随机匹配',
      roomStatusText: meta.roomStatusText,
      titleText: meta.titleText,
      descriptionText: meta.descriptionText,
      errorMessage: '',
      questionCountText: `${payload.totalQuestionCount} 题`,
      durationText: formatBattleDuration(payload.durationSeconds),
      countdownText: '',
      canReady: meta.canReady,
      readyButtonText: meta.readyButtonText,
      myParticipant: this.mapParticipant(myParticipant, currentUserId),
      opponentParticipant: this.mapParticipant(opponentParticipant, currentUserId),
    });

    if (state === 'WAITING' || state === 'READY') {
      this.startPolling();
      return;
    }

    if (state === 'COUNTDOWN') {
      this.updateCountdownDisplay();
      this.startPolling();
      this.startCountdownTicker();
      return;
    }

    if (state === 'IN_PROGRESS') {
      this.navigateToPlay(options?.autoNavigate);
    }
  },

  startPolling() {
    this.stopPolling();

    if (!isPageActive) {
      return;
    }

    if (
      this.data.state !== 'WAITING' &&
      this.data.state !== 'READY' &&
      this.data.state !== 'COUNTDOWN'
    ) {
      return;
    }

    pollTimer = setTimeout(() => {
      pollTimer = null;

      if (!isPageActive) {
        return;
      }

      void this.loadRoom({
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

  startCountdownTicker() {
    this.stopCountdownTicker();

    if (!isPageActive || this.data.state !== 'COUNTDOWN') {
      return;
    }

    const tick = () => {
      if (!isPageActive || this.data.state !== 'COUNTDOWN') {
        countdownTimer = null;
        return;
      }

      this.updateCountdownDisplay();

      if (this.data.state === 'COUNTDOWN') {
        countdownTimer = setTimeout(
          tick,
          COUNTDOWN_TICK_MS,
        ) as unknown as number;
      }
    };

    tick();
  },

  stopCountdownTicker() {
    if (countdownTimer !== null) {
      clearTimeout(countdownTimer);
      countdownTimer = null;
    }
  },

  updateCountdownDisplay() {
    if (this.data.state !== 'COUNTDOWN' || startedAtTimestampMs <= 0) {
      return;
    }

    const remainingSeconds = Math.max(
      0,
      Math.ceil((startedAtTimestampMs - getServerNowMs()) / 1000),
    );

    if (remainingSeconds <= 0) {
      this.navigateToPlay(true);
      return;
    }

    this.setData({
      countdownText: String(remainingSeconds),
    });
  },

  handleRetry() {
    void this.loadRoom({
      autoNavigate: true,
    });
  },

  handleReady() {
    void this.readyBattle();
  },

  handleBackHome() {
    wx.switchTab({
      url: '/pages/battle/index',
    });
  },

  handleEnterPlay() {
    this.navigateToPlay(false);
  },

  navigateToPlay(autoNavigate = false) {
    if (!this.data.isValidBattleId) {
      return;
    }

    if (autoNavigate && lastAutoNavigatedBattleId === this.data.battleId) {
      return;
    }

    if (autoNavigate) {
      lastAutoNavigatedBattleId = this.data.battleId;
    }

    wx.navigateTo({
      url: `/pages/battle/play?battleId=${encodeURIComponent(this.data.battleId)}`,
    });
  },

  mapRoomState(payload: BattleRoomDetailResponse) {
    if (payload.status === 'COUNTDOWN') {
      return 'COUNTDOWN';
    }

    if (payload.status === 'IN_PROGRESS' || payload.status === 'SETTLING') {
      return 'IN_PROGRESS';
    }

    if (payload.status === 'COMPLETED') {
      return 'COMPLETED';
    }

    if (payload.status === 'CANCELLED') {
      return 'CANCELLED';
    }

    if (payload.status === 'EXPIRED') {
      return 'EXPIRED';
    }

    if (payload.currentParticipantStatus === 'READY') {
      return 'READY';
    }

    return 'WAITING';
  },

  mapParticipant(
    participant: BattleParticipantSummary | null,
    currentUserId: string,
  ) {
    if (!participant) {
      return null;
    }

    return {
      userId: participant.userId,
      seatText: `座位 ${participant.seat}`,
      nicknameText: formatBattleNickname(participant.nickname),
      avatarUrl: participant.avatarUrl ?? '',
      avatarFallbackText: formatBattleInitial(participant.nickname),
      statusText: this.getParticipantStatusText(participant.status),
      statusClassName: this.getParticipantStatusClassName(participant.status),
      isCurrentUser: participant.userId === currentUserId,
    };
  },

  getRoomMeta(payload: BattleRoomDetailResponse) {
    const currentParticipantStatus = payload.currentParticipantStatus ?? '';
    const participantCount = payload.participants.length;

    if (payload.status === 'COUNTDOWN') {
      return {
        titleText: '双方已准备完成',
        descriptionText: '服务端倒计时已开始，到达 startedAt 后会自动进入答题页占位入口。',
        roomStatusText: '倒计时中',
        canReady: false,
        readyButtonText: '等待开始',
      };
    }

    if (payload.status === 'IN_PROGRESS') {
      return {
        titleText: '对战已开始',
        descriptionText: 'Battle 已进入答题阶段，正在为你打开答题页占位入口。',
        roomStatusText: '答题中',
        canReady: false,
        readyButtonText: '进入答题',
      };
    }

    if (payload.status === 'COMPLETED') {
      return {
        titleText: '本场对战已完成',
        descriptionText: '当前房间已经结束，本页仅保留状态展示，结算页将在后续阶段开放。',
        roomStatusText: '已完成',
        canReady: false,
        readyButtonText: '已完成',
      };
    }

    if (payload.status === 'CANCELLED') {
      return {
        titleText: '房间已取消',
        descriptionText: '该 Battle 房间已被系统或业务流程取消，无法继续准备或开始。',
        roomStatusText: '已取消',
        canReady: false,
        readyButtonText: '不可准备',
      };
    }

    if (payload.status === 'EXPIRED') {
      return {
        titleText: '房间已过期',
        descriptionText: '该 Battle 房间已经过期，当前无法继续进行准备或答题。',
        roomStatusText: '已过期',
        canReady: false,
        readyButtonText: '不可准备',
      };
    }

    if (participantCount < 2) {
      return {
        titleText: '等待对手进入房间',
        descriptionText: '当前房间人数未满，达到 2 人后才可以进入双方准备流程。',
        roomStatusText: '等待入场',
        canReady: false,
        readyButtonText: '等待对手',
      };
    }

    if (currentParticipantStatus === 'READY') {
      return {
        titleText: '你已准备完成',
        descriptionText: '当前正在等待对手点击准备。页面会持续轮询服务端房间状态。',
        roomStatusText: '等待对手',
        canReady: false,
        readyButtonText: '等待对手',
      };
    }

    return {
      titleText: '等待双方准备',
      descriptionText: '当前可以点击“准备”进入待开始状态。双方都准备后会进入 3 秒倒计时。',
      roomStatusText: '待准备',
      canReady: true,
      readyButtonText: '准备',
    };
  },

  getParticipantStatusText(status: string) {
    if (status === 'READY') {
      return '已准备';
    }

    if (status === 'PLAYING') {
      return '答题中';
    }

    if (status === 'SUBMITTED') {
      return '已交卷';
    }

    if (status === 'FORFEITED') {
      return '已认输';
    }

    if (status === 'COMPLETED') {
      return '已完成';
    }

    return '待准备';
  },

  getParticipantStatusClassName(status: string) {
    if (status === 'READY') {
      return 'participant-ready';
    }

    if (status === 'PLAYING' || status === 'SUBMITTED') {
      return 'participant-playing';
    }

    if (status === 'FORFEITED' || status === 'COMPLETED') {
      return 'participant-finished';
    }

    return 'participant-joined';
  },

  getReadableError(error: unknown) {
    if (error instanceof RequestError) {
      if (error.statusCode === 401 || error.code === 'UNAUTHORIZED') {
        redirectToLogin(
          `/pages/battle/room?battleId=${encodeURIComponent(this.data.battleId)}`,
        );
        return '登录状态已失效，请重新登录后再查看 Battle 房间。';
      }

      if (error.code === 'NETWORK_ERROR') {
        return '无法连接 Battle 房间服务，请确认后端服务已启动。';
      }

      if (error.code === 'BATTLE_NOT_PARTICIPANT') {
        return '你不是当前 Battle 房间参与者，无法查看该房间详情。';
      }

      if (error.code === 'BATTLE_INVALID_STATUS') {
        return '当前房间状态不允许继续准备或进入倒计时，请重新查询服务端状态。';
      }

      if (error.code === 'BATTLE_PARTICIPANTS_INCOMPLETE') {
        return '当前房间人数未满，暂时不能开始准备流程。';
      }

      return error.message || 'Battle 房间加载失败，请稍后重试。';
    }

    if (error instanceof Error && error.message) {
      return error.message;
    }

    return 'Battle 房间加载失败，请稍后重试。';
  },
});
