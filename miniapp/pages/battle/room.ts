import { registerThemedPage } from '../../utils/theme-page';
import type {
  BattleParticipantSummary,
  BattleRoomDetailResponse,
} from '../../types/battle';
import { getAuthStateSummary, redirectToLogin } from '../../utils/auth';
import {
  disableBattleLeaveAlert,
  formatBattleDuration,
  formatBattleInitial,
  formatBattleNickname,
  formatBattleSkill,
  getBattleErrorMessage,
  showBattleConfirmModal,
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
  navTopPadding: number;
  navBarHeight: number;
  battleId: string;
  invitationToken: string;
  inviteCode: string;
  sharePath: string;
  isValidBattleId: boolean;
  state: RoomPageState;
  roomModeText: string;
  skillText: string;
  roomStatusText: string;
  titleText: string;
  descriptionText: string;
  errorMessage: string;
  questionCountText: string;
  durationText: string;
  countdownText: string;
  primaryActionText: string;
  primaryActionEnabled: boolean;
  canOpenPlay: boolean;
  isFriendMode: boolean;
  isFriendRoomCreator: boolean;
  canShareInvitation: boolean;
  showInviteTools: boolean;
  showInviteCode: boolean;
  canLeaveRoom: boolean;
  friendStatusNotice: string;
  myParticipant: ParticipantCard | null;
  opponentParticipant: ParticipantCard | null;
};

type RoomPageMethods = {
  ensureAuthenticated(): boolean;
  buildRedirectPath(): string;
  loadRoom(options?: { autoNavigate?: boolean }): Promise<void>;
  readyBattle(): Promise<void>;
  cancelFriendRoom(options?: {
    silentIdempotent?: boolean;
    navigateHomeOnSuccess?: boolean;
  }): Promise<boolean>;
  confirmCancelAndLeave(): Promise<void>;
  applyRoomData(
    payload: BattleRoomDetailResponse,
    options?: { autoNavigate?: boolean },
  ): void;
  startPolling(): void;
  stopPolling(): void;
  startCountdownTicker(): void;
  stopCountdownTicker(): void;
  updateCountdownDisplay(): void;
  syncLeaveAlert(): void;
  handleRetry(): void;
  handlePrimaryAction(): void;
  handleCopyInviteCode(): void;
  handleNavBack(): Promise<void>;
  handleLeaveRoom(): void;
  navigateToPlay(autoNavigate?: boolean): void;
  navigateToResult(autoNavigate?: boolean): void;
  navigateHome(): void;
  canCreatorCancelFriendRoom(status?: RoomPageState): boolean;
  mapRoomState(payload: BattleRoomDetailResponse): RoomPageState;
  mapParticipant(
    participant: BattleParticipantSummary | null,
    currentUserId: string,
  ): ParticipantCard | null;
  getRoomMeta(payload: BattleRoomDetailResponse): {
    titleText: string;
    descriptionText: string;
    roomStatusText: string;
    primaryActionText: string;
    primaryActionEnabled: boolean;
    canOpenPlay: boolean;
    friendStatusNotice: string;
  };
  getParticipantStatusText(status: string): string;
  getParticipantStatusClassName(status: string): string;
  getReadableError(error: unknown): string;
  getCancelConflictMessage(code: string): string;
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
let isCancelRequesting = false;
let serverTimeOffsetMs = 0;
let startedAtTimestampMs = 0;
let lastAutoNavigatedBattleId = '';
let lastAutoNavigatedResultId = '';

function parseTimestamp(value: string | null | undefined) {
  if (!value) {
    return 0;
  }

  const timestamp = Date.parse(value);

  return Number.isFinite(timestamp) ? timestamp : 0;
}

function parseStringParam(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function getServerNowMs() {
  return Date.now() + serverTimeOffsetMs;
}

function getNavigationMetrics() {
  const systemInfo = (
    wx as unknown as {
      getSystemInfoSync: () => {
        statusBarHeight?: number;
      };
    }
  ).getSystemInfoSync();
  const statusBarHeight = systemInfo.statusBarHeight ?? 20;
  const menuButtonGetter = (
    wx as unknown as {
      getMenuButtonBoundingClientRect?: () => {
        top: number;
        height: number;
      };
    }
  ).getMenuButtonBoundingClientRect;
  const menuButtonRect =
    typeof menuButtonGetter === 'function' ? menuButtonGetter() : null;

  if (!menuButtonRect) {
    return {
      navTopPadding: statusBarHeight,
      navBarHeight: 44,
    };
  }

  return {
    navTopPadding: statusBarHeight,
    navBarHeight: Math.max(
      44,
      menuButtonRect.height + (menuButtonRect.top - statusBarHeight) * 2,
    ),
  };
}

registerThemedPage<RoomPageData, RoomPageMethods>({
  data: {
    navTopPadding: 0,
    navBarHeight: 44,
    battleId: '',
    invitationToken: '',
    inviteCode: '',
    sharePath: '',
    isValidBattleId: false,
    state: 'LOADING',
    roomModeText: '',
    skillText: '',
    roomStatusText: '',
    titleText: '正在加载房间',
    descriptionText: '系统正在同步房间状态，请稍候。',
    errorMessage: '',
    questionCountText: '0 题',
    durationText: '00:00',
    countdownText: '',
    primaryActionText: '等待加载',
    primaryActionEnabled: false,
    canOpenPlay: false,
    isFriendMode: false,
    isFriendRoomCreator: false,
    canShareInvitation: false,
    showInviteTools: false,
    showInviteCode: false,
    canLeaveRoom: false,
    friendStatusNotice: '',
    myParticipant: null,
    opponentParticipant: null,
  },

  onLoad(options) {
    isPageActive = true;
    hasLoadedOnce = false;
    const battleId = parseStringParam(options?.battleId);
    const invitationToken = parseStringParam(options?.invitationToken);
    const inviteCode = parseStringParam(options?.inviteCode).toUpperCase();
    const isValidBattleId = UUID_PATTERN.test(battleId);

    this.setData({
      ...getNavigationMetrics(),
      battleId,
      invitationToken,
      inviteCode,
      sharePath: invitationToken
        ? `/pages/battle/friend-room?invitationToken=${encodeURIComponent(invitationToken)}`
        : '',
      isValidBattleId,
      state: isValidBattleId ? 'LOADING' : 'ERROR',
      titleText: isValidBattleId ? '正在加载房间' : '当前对战标识无效',
      descriptionText: isValidBattleId
        ? '系统正在同步房间状态，请稍候。'
        : '当前页面没有收到合法的房间标识。',
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
    this.syncLeaveAlert();

    if (hasLoadedOnce && this.data.isValidBattleId) {
      void this.loadRoom({
        autoNavigate: false,
      });
    }
  },

  onHide() {
    this.stopPolling();
    this.stopCountdownTicker();
    disableBattleLeaveAlert();
  },

  onUnload() {
    isPageActive = false;
    requestSerial += 1;
    this.stopPolling();
    this.stopCountdownTicker();
    disableBattleLeaveAlert();
  },

  onPullDownRefresh() {
    void this.loadRoom({
      autoNavigate: true,
    }).finally(() => {
      wx.stopPullDownRefresh();
    });
  },

  onShareAppMessage() {
    if (!this.data.canShareInvitation || !this.data.sharePath) {
      return {
        title: '好友对战',
        path: '/pages/battle/index',
      };
    }

    return {
      title: `来加入好友对战，邀请码 ${this.data.inviteCode || '待生成'}`,
      path: this.data.sharePath,
    };
  },

  ensureAuthenticated() {
    if (getAuthStateSummary().isAuthenticated) {
      return true;
    }

    redirectToLogin(this.buildRedirectPath());
    return false;
  },

  buildRedirectPath() {
    if (!this.data.isValidBattleId) {
      return '/pages/battle/index';
    }

    const query = [`battleId=${encodeURIComponent(this.data.battleId)}`];

    if (this.data.invitationToken) {
      query.push(
        `invitationToken=${encodeURIComponent(this.data.invitationToken)}`,
      );
    }

    if (this.data.inviteCode) {
      query.push(`inviteCode=${encodeURIComponent(this.data.inviteCode)}`);
    }

    return `/pages/battle/room?${query.join('&')}`;
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
        descriptionText: '你可以重新查询房间状态，或稍后返回对战首页。',
        errorMessage: this.getReadableError(error),
        primaryActionText: '重新查询',
        primaryActionEnabled: true,
        canOpenPlay: false,
        canShareInvitation: false,
        showInviteTools: false,
        showInviteCode: false,
        friendStatusNotice: '',
      });
      this.syncLeaveAlert();
    } finally {
      isRoomRequesting = false;
      hasLoadedOnce = true;
    }
  },

  async readyBattle() {
    if (
      !this.data.isValidBattleId ||
      !this.ensureAuthenticated() ||
      isReadyRequesting ||
      !this.data.primaryActionEnabled
    ) {
      return;
    }

    isReadyRequesting = true;

    this.setData({
      errorMessage: '',
      primaryActionEnabled: false,
      primaryActionText: this.data.isFriendMode ? '准备中' : '提交准备中',
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
      });
      void this.loadRoom({
        autoNavigate: true,
      });
    } finally {
      isReadyRequesting = false;
    }
  },

  async cancelFriendRoom(options?: {
    silentIdempotent?: boolean;
    navigateHomeOnSuccess?: boolean;
  }) {
    const invitationToken = this.data.invitationToken.trim();

    if (
      !this.ensureAuthenticated() ||
      !invitationToken ||
      isCancelRequesting ||
      !this.canCreatorCancelFriendRoom()
    ) {
      return false;
    }

    isCancelRequesting = true;

    this.setData({
      errorMessage: '',
      canShareInvitation: false,
      showInviteTools: false,
    });
    disableBattleLeaveAlert();

    try {
      await request({
        url: `/battles/friend-rooms/${encodeURIComponent(invitationToken)}`,
        method: 'DELETE',
        authMode: 'required',
      });

      if (!isPageActive) {
        return true;
      }

      if (options?.navigateHomeOnSuccess !== false) {
        this.navigateHome();
      }

      return true;
    } catch (error) {
      if (!isPageActive) {
        return false;
      }

      if (error instanceof RequestError) {
        if (
          error.statusCode === 404 ||
          error.code === 'BATTLE_INVITATION_INVALID' ||
          error.code === 'BATTLE_INVITATION_EXPIRED'
        ) {
          if (!options?.silentIdempotent) {
            wx.showToast({
              title: '好友对战已结束',
              icon: 'none',
            });
          }

          if (options?.navigateHomeOnSuccess !== false) {
            this.navigateHome();
          }

          return true;
        }

        if (error.code === 'BATTLE_INVALID_STATUS') {
          this.setData({
            errorMessage: this.getCancelConflictMessage(error.code),
          });
          this.syncLeaveAlert();
          return false;
        }
      }

      this.setData({
        errorMessage: this.getReadableError(error),
      });
      this.syncLeaveAlert();
      return false;
    } finally {
      isCancelRequesting = false;
    }
  },

  async confirmCancelAndLeave() {
    const result = await showBattleConfirmModal({
      title: '离开房间',
      content: '离开后将无法继续本场对战，当前好友对战房间也会结束。',
      confirmText: '确认离开',
      cancelText: '继续停留',
      confirmColor: '#c24343',
    });

    if (!result.confirm) {
      return;
    }

    await this.cancelFriendRoom({
      silentIdempotent: true,
      navigateHomeOnSuccess: true,
    });
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
    const aiOpponentParticipant =
      payload.mode === 'AI' && payload.opponent
        ? {
            userId: 'AI',
            seatText: '电脑对手',
            nicknameText: payload.opponent.displayName,
            avatarUrl: '',
            avatarFallbackText: '电',
            statusText: '已就位',
            statusClassName: 'status-ready',
            isCurrentUser: false,
          }
        : null;
    const state = this.mapRoomState(payload);
    const meta = this.getRoomMeta(payload);
    const isFriendMode = payload.mode === 'FRIEND';
    const isFriendRoomCreator = isFriendMode && myParticipant?.seat === 1;
    const showInviteCode = isFriendMode && !!this.data.inviteCode;
    const showInviteTools =
      isFriendRoomCreator &&
      state === 'WAITING' &&
      !!this.data.invitationToken &&
      !!this.data.inviteCode;

    serverTimeOffsetMs = parseTimestamp(payload.serverTime) - Date.now();
    startedAtTimestampMs = parseTimestamp(payload.startedAt);

    this.stopPolling();
    this.stopCountdownTicker();

    if (state !== 'COUNTDOWN' && state !== 'IN_PROGRESS') {
      lastAutoNavigatedBattleId = '';
    }

    if (state !== 'COMPLETED') {
      lastAutoNavigatedResultId = '';
    }

    this.setData({
      state,
      roomModeText:
        payload.mode === 'AI'
          ? '电脑对战'
          : isFriendMode
            ? '好友对战'
            : '随机匹配',
      skillText: formatBattleSkill(payload.skill),
      roomStatusText: meta.roomStatusText,
      titleText: meta.titleText,
      descriptionText: meta.descriptionText,
      errorMessage: '',
      questionCountText: `${payload.totalQuestionCount} 题`,
      durationText: formatBattleDuration(payload.durationSeconds),
      countdownText: '',
      primaryActionText: meta.primaryActionText,
      primaryActionEnabled: meta.primaryActionEnabled,
      canOpenPlay: meta.canOpenPlay,
      isFriendMode,
      isFriendRoomCreator,
      canShareInvitation: showInviteTools,
      showInviteTools,
      showInviteCode,
      canLeaveRoom:
        isFriendRoomCreator &&
        !!this.data.invitationToken &&
        (state === 'WAITING' || state === 'READY' || state === 'ERROR'),
      friendStatusNotice: meta.friendStatusNotice,
      myParticipant: this.mapParticipant(myParticipant, currentUserId),
      opponentParticipant:
        aiOpponentParticipant ??
        this.mapParticipant(opponentParticipant, currentUserId),
    });
    this.syncLeaveAlert();

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
      if (options?.autoNavigate) {
        this.navigateToPlay(true);
      }
      return;
    }

    if (state === 'COMPLETED') {
      this.navigateToResult(options?.autoNavigate);
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

  syncLeaveAlert() {
    disableBattleLeaveAlert();
  },

  handleRetry() {
    void this.loadRoom({
      autoNavigate: true,
    });
  },

  handlePrimaryAction() {
    if (this.data.canOpenPlay) {
      this.navigateToPlay(false);
      return;
    }

    if (
      this.data.state === 'ERROR' ||
      this.data.state === 'COMPLETED' ||
      this.data.state === 'CANCELLED' ||
      this.data.state === 'EXPIRED'
    ) {
      this.handleRetry();
      return;
    }

    if (!this.data.primaryActionEnabled) {
      return;
    }

    void this.readyBattle();
  },

  handleCopyInviteCode() {
    if (!this.data.inviteCode) {
      return;
    }

    wx.setClipboardData({
      data: this.data.inviteCode,
    });
  },

  async handleNavBack() {
    this.navigateHome();
  },

  handleLeaveRoom() {
    if (this.data.canLeaveRoom) {
      void this.confirmCancelAndLeave();
    }
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

  navigateToResult(autoNavigate = false) {
    if (!this.data.isValidBattleId) {
      return;
    }

    if (autoNavigate && lastAutoNavigatedResultId === this.data.battleId) {
      return;
    }

    if (autoNavigate) {
      lastAutoNavigatedResultId = this.data.battleId;
    }

    wx.redirectTo({
      url: `/pages/battle/result?battleId=${encodeURIComponent(this.data.battleId)}`,
    });
  },

  navigateHome() {
    wx.switchTab({
      url: '/pages/battle/index',
    });
  },

  canCreatorCancelFriendRoom(status?: RoomPageState) {
    const targetState = status ?? this.data.state;

    return (
      this.data.isFriendRoomCreator &&
      !!this.data.invitationToken &&
      (targetState === 'WAITING' ||
        targetState === 'READY' ||
        targetState === 'ERROR')
    );
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
    const isAiMode = payload.mode === 'AI';
    const participantCount = payload.participants.length + (isAiMode ? 1 : 0);
    const isFriendMode = payload.mode === 'FRIEND';
    const friendJoinedNotice =
      isFriendMode && participantCount >= 2
        ? '好友已加入，可以准备开始对战。'
        : '';

    if (payload.status === 'COUNTDOWN') {
      return {
        titleText: '双方已准备完成',
        descriptionText:
          '倒计时已经开始，结束后会自动进入答题页。',
        roomStatusText: '倒计时中',
        primaryActionText: '即将开始',
        primaryActionEnabled: false,
        canOpenPlay: false,
        friendStatusNotice: friendJoinedNotice,
      };
    }

    if (payload.status === 'IN_PROGRESS') {
      if (
        currentParticipantStatus === 'SUBMITTED' ||
        currentParticipantStatus === 'FORFEITED'
      ) {
        return {
          titleText: '等待本场结果',
          descriptionText: '你的作答已经结束，可以查看只读进度并等待结算。',
          roomStatusText: '等待结算',
          primaryActionText: '查看等待状态',
          primaryActionEnabled: true,
          canOpenPlay: true,
          friendStatusNotice: friendJoinedNotice,
        };
      }

      return {
        titleText: '对战已开始',
        descriptionText: '对战已进入答题阶段，正在为你打开答题页。',
        roomStatusText: '答题中',
        primaryActionText: '继续答题',
        primaryActionEnabled: true,
        canOpenPlay: true,
        friendStatusNotice: friendJoinedNotice,
      };
    }

    if (payload.status === 'COMPLETED') {
      return {
        titleText: '本场对战已完成',
        descriptionText: '当前房间已经结束，你可以返回对战首页继续其他流程。',
        roomStatusText: '已完成',
        primaryActionText: '刷新状态',
        primaryActionEnabled: true,
        canOpenPlay: false,
        friendStatusNotice: '',
      };
    }

    if (payload.status === 'CANCELLED') {
      return {
        titleText: '房间已取消',
        descriptionText: '该房间已经取消，当前无法继续准备或开始。',
        roomStatusText: '已取消',
        primaryActionText: '刷新状态',
        primaryActionEnabled: true,
        canOpenPlay: false,
        friendStatusNotice: '',
      };
    }

    if (payload.status === 'EXPIRED') {
      return {
        titleText: '房间已过期',
        descriptionText: '该房间已经过期，当前无法继续准备或答题。',
        roomStatusText: '已过期',
        primaryActionText: '刷新状态',
        primaryActionEnabled: true,
        canOpenPlay: false,
        friendStatusNotice: '',
      };
    }

    if (participantCount < 2) {
      return {
        titleText: isFriendMode ? '等待好友加入' : '等待对手进入房间',
        descriptionText: isFriendMode
          ? '好友加入前，你可以先复制邀请码或直接分享邀请。'
          : '房间人数未满，达到 2 人后才可以进入准备流程。',
        roomStatusText: isFriendMode ? '等待好友' : '等待入场',
        primaryActionText: isFriendMode ? '等待好友加入后才能准备' : '等待对手加入',
        primaryActionEnabled: false,
        canOpenPlay: false,
        friendStatusNotice: '',
      };
    }

    if (currentParticipantStatus === 'READY') {
      return {
        titleText: isFriendMode ? '你已准备，等待好友确认' : '你已准备完成',
        descriptionText: isFriendMode
          ? '当前正在等待好友点击准备，页面会持续同步房间状态。'
          : '当前正在等待对手点击准备，页面会持续同步房间状态。',
        roomStatusText: '等待对手',
        primaryActionText: isFriendMode ? '等待好友准备' : '等待对手准备',
        primaryActionEnabled: false,
        canOpenPlay: false,
        friendStatusNotice: friendJoinedNotice,
      };
    }

    if (isAiMode) {
      return {
        titleText: '电脑对手已就位',
        descriptionText: '点击准备后开始倒计时，电脑对战不会修改正式积分。',
        roomStatusText: '等待准备',
        primaryActionText: '准备电脑对战',
        primaryActionEnabled: true,
        canOpenPlay: false,
        friendStatusNotice: '',
      };
    }

    return {
      titleText: isFriendMode ? '可以开始好友对战' : '等待双方准备',
      descriptionText: isFriendMode
        ? '好友已经进入房间。你们各自点击准备后，就会进入统一倒计时。'
        : '当前可以点击准备，双方都准备后会进入 3 秒倒计时。',
      roomStatusText: isFriendMode ? '可准备' : '待准备',
      primaryActionText: '准备',
      primaryActionEnabled: true,
      canOpenPlay: false,
      friendStatusNotice: friendJoinedNotice,
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

    return '等待中';
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
        redirectToLogin(this.buildRedirectPath());
        return '登录状态已失效，请重新登录后再查看房间。';
      }
    }

    return getBattleErrorMessage(
      error,
      {
        unauthorized: '登录状态已失效，请重新登录后再查看房间。',
        network: '网络连接失败，请确认后端服务已启动后重试。',
        fallback: '房间加载失败，请稍后重试。',
      },
      {
        BATTLE_NOT_PARTICIPANT: '你不是当前对局参与者，无法查看该房间。',
        BATTLE_INVALID_STATUS:
          '当前房间状态已变化，请重新同步最新状态后再继续。',
        BATTLE_PARTICIPANTS_INCOMPLETE:
          '当前房间人数未满，暂时不能开始对战。',
        BATTLE_ALREADY_ACTIVE:
          '你当前已有进行中的对局，请先完成当前对局后再开始新的对战。',
      },
    );
  },

  getCancelConflictMessage(code: string) {
    if (code === 'BATTLE_INVALID_STATUS') {
      return '当前好友对战已进入不可直接取消的阶段。若对局已开始，请进入答题页后通过认输结束。';
    }

    return '当前好友对战暂时无法取消，请稍后重试。';
  },
});
