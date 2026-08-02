import type {
  BattleRoomSummaryResponse,
  FriendRoomCreateResponse,
  FriendRoomPreviewResponse,
} from '../../types/battle';
import { getAuthStateSummary, redirectToLogin } from '../../utils/auth';
import {
  formatBattleDuration,
  formatBattleNickname,
  getBattleErrorMessage,
  normalizeBattleInviteCode,
} from '../../utils/battle';
import { request, RequestError } from '../../utils/request';

type FriendRoomPageState =
  | 'IDLE'
  | 'CREATING'
  | 'LOOKING_UP'
  | 'PREVIEWING'
  | 'AVAILABLE'
  | 'JOINING'
  | 'EXPIRED'
  | 'FULL'
  | 'ERROR';

type FriendRoomPageData = {
  navTopPadding: number;
  navBarHeight: number;
  state: FriendRoomPageState;
  invitationToken: string;
  inviteCode: string;
  inviteCodeInput: string;
  inviterName: string;
  participantCountText: string;
  expiresAtText: string;
  stateTitle: string;
  stateDescription: string;
  errorMessage: string;
  canJoin: boolean;
  isJoinInputVisible: boolean;
  isBusy: boolean;
  joinButtonText: string;
};

type FriendRoomPageMethods = {
  ensureAuthenticated(): boolean;
  buildRedirectPath(): string;
  resetToIdle(): void;
  loadInitialData(): Promise<void>;
  refreshPreview(): Promise<void>;
  createFriendRoom(): Promise<void>;
  previewFriendRoomByToken(): Promise<void>;
  previewFriendRoomByCode(inviteCode: string): Promise<FriendRoomPreviewResponse | null>;
  joinFriendRoomByToken(): Promise<void>;
  joinFriendRoomByCode(inviteCode: string): Promise<void>;
  applyPreview(payload: FriendRoomPreviewResponse): void;
  handleCreateRoom(): void;
  handleShowJoinInput(): void;
  handleJoinCodeInput(
    event: WechatMiniprogram.CustomEvent<{
      value?: string;
    }>,
  ): void;
  handleConfirmJoinByCode(): void;
  handleJoinFromPreview(): void;
  handleRetry(): void;
  handleNavBack(): void;
  leavePage(): void;
  navigateToRoom(
    battleId: string,
    invitationToken?: string,
    inviteCode?: string,
  ): void;
  shouldAutoOpenRoom(payload: FriendRoomPreviewResponse): boolean;
  getPreviewState(payload: FriendRoomPreviewResponse): FriendRoomPageState;
  getReadableErrorMessage(error: unknown, fallback: string): string;
  getJoinRestrictionMessage(code: string): string;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

let isPageActive = false;
let hasLoadedOnce = false;
let requestSerial = 0;

function parseInvitationToken(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function formatExpiry(value: string) {
  const expiresAt = Date.parse(value);

  if (!Number.isFinite(expiresAt)) {
    return '以服务端状态为准';
  }

  const remainingSeconds = Math.max(
    0,
    Math.floor((expiresAt - Date.now()) / 1000),
  );

  return `剩余 ${formatBattleDuration(remainingSeconds)}`;
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

Page<FriendRoomPageData, FriendRoomPageMethods>({
  data: {
    navTopPadding: 0,
    navBarHeight: 44,
    state: 'IDLE',
    invitationToken: '',
    inviteCode: '',
    inviteCodeInput: '',
    inviterName: '',
    participantCountText: '1 / 2',
    expiresAtText: '',
    stateTitle: '好友对战',
    stateDescription:
      '你可以主动创建好友房，也可以输入邀请码加入已有房间。',
    errorMessage: '',
    canJoin: false,
    isJoinInputVisible: false,
    isBusy: false,
    joinButtonText: '查询并加入',
  },

  onLoad(options) {
    isPageActive = true;
    hasLoadedOnce = false;
    const invitationToken = parseInvitationToken(options?.invitationToken);

    this.setData({
      ...getNavigationMetrics(),
      invitationToken,
    });

    void this.loadInitialData();
  },

  onShow() {
    isPageActive = true;

    if (hasLoadedOnce && this.data.invitationToken) {
      void this.refreshPreview();
    }
  },

  onUnload() {
    isPageActive = false;
    requestSerial += 1;
  },

  onPullDownRefresh() {
    void this.refreshPreview().finally(() => {
      wx.stopPullDownRefresh();
    });
  },

  ensureAuthenticated() {
    const authState = getAuthStateSummary();

    if (authState.isAuthenticated) {
      return true;
    }

    redirectToLogin(this.buildRedirectPath());
    return false;
  },

  buildRedirectPath() {
    if (this.data.invitationToken) {
      return `/pages/battle/friend-room?invitationToken=${encodeURIComponent(this.data.invitationToken)}`;
    }

    return '/pages/battle/friend-room';
  },

  resetToIdle() {
    this.setData({
      state: 'IDLE',
      inviteCode: '',
      inviteCodeInput: '',
      inviterName: '',
      participantCountText: '1 / 2',
      expiresAtText: '',
      stateTitle: '好友对战',
      stateDescription:
        '你可以主动创建好友房，也可以输入邀请码加入已有房间。',
      errorMessage: '',
      canJoin: false,
      isJoinInputVisible: false,
      isBusy: false,
      joinButtonText: '查询并加入',
    });
  },

  async loadInitialData() {
    if (!this.ensureAuthenticated()) {
      return;
    }

    try {
      if (this.data.invitationToken) {
        await this.previewFriendRoomByToken();
      } else if (isPageActive) {
        this.resetToIdle();
      }
    } finally {
      hasLoadedOnce = true;
    }
  },

  async refreshPreview() {
    if (this.data.invitationToken) {
      await this.previewFriendRoomByToken();
      return;
    }

    if (isPageActive) {
      this.resetToIdle();
    }
  },

  async createFriendRoom() {
    if (!this.ensureAuthenticated() || this.data.isBusy) {
      return;
    }

    const currentRequestSerial = ++requestSerial;

    this.setData({
      state: 'CREATING',
      stateTitle: '正在创建好友房',
      stateDescription: '系统正在为你生成好友房和邀请码，请稍候。',
      errorMessage: '',
      isBusy: true,
      canJoin: false,
    });

    try {
      const response = await request<FriendRoomCreateResponse>({
        url: '/battles/friend-rooms',
        method: 'POST',
        authMode: 'required',
      });

      if (!isPageActive || currentRequestSerial !== requestSerial) {
        return;
      }

      this.navigateToRoom(
        response.battleId,
        response.invitationToken,
        response.inviteCode ?? '',
      );
    } catch (error) {
      if (!isPageActive || currentRequestSerial !== requestSerial) {
        return;
      }

      this.setData({
        state: 'ERROR',
        stateTitle: '好友房创建失败',
        stateDescription: '当前无法创建好友房，请稍后重试。',
        errorMessage: this.getReadableErrorMessage(
          error,
          '好友房创建失败，请稍后重试。',
        ),
        isBusy: false,
        canJoin: false,
      });
    }
  },

  async previewFriendRoomByToken() {
    if (!this.ensureAuthenticated()) {
      return;
    }

    const invitationToken = this.data.invitationToken.trim();

    if (!invitationToken) {
      this.resetToIdle();
      return;
    }

    const currentRequestSerial = ++requestSerial;

    this.setData({
      state: 'PREVIEWING',
      stateTitle: '正在读取邀请信息',
      stateDescription: '系统正在同步好友房状态，请稍候。',
      errorMessage: '',
      isBusy: true,
      canJoin: false,
    });

    try {
      const response = await request<FriendRoomPreviewResponse>({
        url: `/battles/friend-rooms/${encodeURIComponent(invitationToken)}`,
        method: 'GET',
        authMode: 'required',
      });

      if (!isPageActive || currentRequestSerial !== requestSerial) {
        return;
      }

      if (this.shouldAutoOpenRoom(response)) {
        this.navigateToRoom(
          response.battleId,
          invitationToken,
          response.inviteCode ?? '',
        );
        return;
      }

      this.applyPreview(response);
    } catch (error) {
      if (!isPageActive || currentRequestSerial !== requestSerial) {
        return;
      }

      this.setData({
        state: 'ERROR',
        stateTitle: '邀请信息读取失败',
        stateDescription: '当前无法读取好友房状态，请稍后重试。',
        errorMessage: this.getReadableErrorMessage(
          error,
          '邀请信息读取失败，请稍后重试。',
        ),
        isBusy: false,
        canJoin: false,
      });
    }
  },

  async previewFriendRoomByCode(inviteCode: string) {
    if (!this.ensureAuthenticated()) {
      return null;
    }

    const normalizedCode = normalizeBattleInviteCode(inviteCode);

    if (!normalizedCode) {
      return null;
    }

    const currentRequestSerial = ++requestSerial;

    this.setData({
      state: 'LOOKING_UP',
      stateTitle: '正在查询邀请码',
      stateDescription: '系统正在根据邀请码查询好友房状态。',
      errorMessage: '',
      isBusy: true,
      joinButtonText: '查询中',
    });

    try {
      const response = await request<FriendRoomPreviewResponse>({
        url: `/battles/friend-rooms/code/${encodeURIComponent(normalizedCode)}`,
        method: 'GET',
        authMode: 'required',
      });

      if (!isPageActive || currentRequestSerial !== requestSerial) {
        return null;
      }

      return response;
    } catch (error) {
      if (!isPageActive || currentRequestSerial !== requestSerial) {
        return null;
      }

      this.setData({
        state: 'ERROR',
        stateTitle: '邀请码不可用',
        stateDescription: '当前邀请码无法加入，请检查后重试。',
        errorMessage: this.getReadableErrorMessage(
          error,
          '邀请码不可用，请确认后重试。',
        ),
        isBusy: false,
        joinButtonText: '查询并加入',
        canJoin: false,
      });
      return null;
    }
  },

  async joinFriendRoomByToken() {
    if (!this.ensureAuthenticated() || this.data.isBusy) {
      return;
    }

    const invitationToken = this.data.invitationToken.trim();

    if (!invitationToken) {
      return;
    }

    const currentRequestSerial = ++requestSerial;

    this.setData({
      state: 'JOINING',
      stateTitle: '正在加入好友房',
      stateDescription: '系统正在校验邀请并准备进入房间。',
      errorMessage: '',
      isBusy: true,
      canJoin: false,
    });

    try {
      const response = await request<BattleRoomSummaryResponse>({
        url: `/battles/friend-rooms/${encodeURIComponent(invitationToken)}/join`,
        method: 'POST',
        authMode: 'required',
      });

      if (!isPageActive || currentRequestSerial !== requestSerial) {
        return;
      }

      this.navigateToRoom(
        response.battleId,
        invitationToken,
        this.data.inviteCode,
      );
    } catch (error) {
      if (!isPageActive || currentRequestSerial !== requestSerial) {
        return;
      }

      this.setData({
        state: 'ERROR',
        stateTitle: '加入好友房失败',
        stateDescription: '当前无法加入好友房，请查看提示后重试。',
        errorMessage: this.getReadableErrorMessage(
          error,
          '加入好友房失败，请稍后重试。',
        ),
        isBusy: false,
        canJoin: false,
      });
    }
  },

  async joinFriendRoomByCode(inviteCode: string) {
    if (!this.ensureAuthenticated() || this.data.isBusy) {
      return;
    }

    const normalizedCode = normalizeBattleInviteCode(inviteCode);

    if (!normalizedCode) {
      wx.showToast({
        title: '请输入邀请码',
        icon: 'none',
      });
      return;
    }

    const preview = await this.previewFriendRoomByCode(normalizedCode);

    if (!preview || !isPageActive) {
      return;
    }

    if (!preview.canJoin) {
      this.applyPreview(preview);
      return;
    }

    const currentRequestSerial = ++requestSerial;

    this.setData({
      state: 'JOINING',
      stateTitle: '正在加入好友房',
      stateDescription: '系统正在根据邀请码进入房间。',
      errorMessage: '',
      isBusy: true,
      joinButtonText: '加入中',
      canJoin: false,
    });

    try {
      const response = await request<BattleRoomSummaryResponse>({
        url: `/battles/friend-rooms/code/${encodeURIComponent(normalizedCode)}/join`,
        method: 'POST',
        authMode: 'required',
      });

      if (!isPageActive || currentRequestSerial !== requestSerial) {
        return;
      }

      this.navigateToRoom(
        response.battleId,
        '',
        preview.inviteCode ?? normalizedCode,
      );
    } catch (error) {
      if (!isPageActive || currentRequestSerial !== requestSerial) {
        return;
      }

      this.setData({
        state: 'ERROR',
        stateTitle: '加入好友房失败',
        stateDescription: '当前邀请码暂时无法加入，请查看提示后重试。',
        errorMessage: this.getReadableErrorMessage(
          error,
          '加入好友房失败，请稍后重试。',
        ),
        isBusy: false,
        joinButtonText: '查询并加入',
      });
    }
  },

  applyPreview(payload: FriendRoomPreviewResponse) {
    const currentUserId = getAuthStateSummary().user?.id ?? '';
    const isCreator = payload.inviter.userId === currentUserId;
    const state = this.getPreviewState(payload);

    let stateTitle = '好友房状态';
    let stateDescription = '当前房间状态以服务端返回为准。';
    let errorMessage = '';
    let canJoin = payload.canJoin && !isCreator;

    if (state === 'AVAILABLE') {
      stateTitle = '可加入好友房';
      stateDescription =
        '邀请码有效。确认后即可进入这场好友对战，进入后会直接看到统一房间页。';
    } else if (state === 'FULL') {
      stateTitle = '当前好友房不可加入';
      stateDescription = '该房间已经满员、已开始，或邀请已被其他玩家接受。';
      errorMessage = this.getJoinRestrictionMessage(
        payload.cannotJoinReason || 'BATTLE_ROOM_FULL',
      );
      canJoin = false;
    } else if (state === 'EXPIRED') {
      stateTitle = '邀请已失效';
      stateDescription = '当前好友房邀请已经过期，请重新获取新的邀请码或邀请链接。';
      errorMessage = this.getJoinRestrictionMessage(
        payload.cannotJoinReason || 'BATTLE_INVITATION_EXPIRED',
      );
      canJoin = false;
    } else if (state === 'ERROR') {
      stateTitle = '当前好友房不可用';
      stateDescription = '请检查邀请状态后重试。';
      errorMessage = this.getJoinRestrictionMessage(
        payload.cannotJoinReason || 'BATTLE_INVITATION_INVALID',
      );
      canJoin = false;
    }

    this.setData({
      state,
      inviteCode: payload.inviteCode ?? '',
      inviterName: formatBattleNickname(payload.inviter.nickname),
      participantCountText: `${Math.max(0, payload.participantCount)} / 2`,
      expiresAtText: formatExpiry(payload.expiresAt),
      stateTitle,
      stateDescription,
      errorMessage,
      canJoin,
      isBusy: false,
      joinButtonText: '查询并加入',
    });
  },

  handleCreateRoom() {
    void this.createFriendRoom();
  },

  handleShowJoinInput() {
    this.setData({
      isJoinInputVisible: !this.data.isJoinInputVisible,
      errorMessage: '',
    });
  },

  handleJoinCodeInput(
    event: WechatMiniprogram.CustomEvent<{
      value?: string;
    }>,
  ) {
    this.setData({
      inviteCodeInput: normalizeBattleInviteCode(event.detail.value),
    });
  },

  handleConfirmJoinByCode() {
    void this.joinFriendRoomByCode(this.data.inviteCodeInput);
  },

  handleJoinFromPreview() {
    if (!this.data.canJoin) {
      return;
    }

    void this.joinFriendRoomByToken();
  },

  handleRetry() {
    if (this.data.invitationToken) {
      void this.previewFriendRoomByToken();
      return;
    }

    this.resetToIdle();
  },

  handleNavBack() {
    this.leavePage();
  },

  leavePage() {
    if (getCurrentPages().length > 1) {
      wx.navigateBack();
      return;
    }

    wx.switchTab({
      url: '/pages/battle/index',
    });
  },

  navigateToRoom(battleId: string, invitationToken = '', inviteCode = '') {
    const query = [`battleId=${encodeURIComponent(battleId)}`];

    if (invitationToken) {
      query.push(`invitationToken=${encodeURIComponent(invitationToken)}`);
    }

    if (inviteCode) {
      query.push(`inviteCode=${encodeURIComponent(inviteCode)}`);
    }

    wx.navigateTo({
      url: `/pages/battle/room?${query.join('&')}`,
    });
  },

  shouldAutoOpenRoom(payload: FriendRoomPreviewResponse) {
    const currentUserId = getAuthStateSummary().user?.id ?? '';

    if (payload.inviter.userId !== currentUserId) {
      return false;
    }

    if (!UUID_PATTERN.test(payload.battleId)) {
      return false;
    }

    return (
      payload.roomStatus === 'WAITING' ||
      payload.roomStatus === 'READY' ||
      payload.roomStatus === 'COUNTDOWN' ||
      payload.roomStatus === 'IN_PROGRESS' ||
      payload.roomStatus === 'SETTLING' ||
      payload.roomStatus === 'COMPLETED'
    );
  },

  getPreviewState(payload: FriendRoomPreviewResponse) {
    if (
      payload.invitationStatus === 'EXPIRED' ||
      payload.roomStatus === 'EXPIRED'
    ) {
      return 'EXPIRED';
    }

    if (
      payload.invitationStatus === 'CANCELLED' ||
      payload.roomStatus === 'CANCELLED'
    ) {
      return 'ERROR';
    }

    if (payload.canJoin) {
      return 'AVAILABLE';
    }

    if (
      payload.cannotJoinReason === 'BATTLE_ROOM_FULL' ||
      payload.cannotJoinReason === 'BATTLE_INVITATION_ALREADY_ACCEPTED' ||
      payload.cannotJoinReason === 'BATTLE_INVALID_STATUS'
    ) {
      return 'FULL';
    }

    if (payload.cannotJoinReason === 'BATTLE_INVITATION_EXPIRED') {
      return 'EXPIRED';
    }

    return 'ERROR';
  },

  getReadableErrorMessage(error: unknown, fallback: string) {
    if (error instanceof RequestError) {
      if (error.statusCode === 401 || error.code === 'UNAUTHORIZED') {
        redirectToLogin(this.buildRedirectPath());
        return '登录状态已失效，请重新登录后继续。';
      }
    }

    return getBattleErrorMessage(
      error,
      {
        unauthorized: '登录状态已失效，请重新登录后继续。',
        network: '网络连接失败，请确认后端服务可用后重试。',
        fallback,
      },
      {
        BATTLE_ALREADY_ACTIVE: this.getJoinRestrictionMessage(
          'BATTLE_ALREADY_ACTIVE',
        ),
        BATTLE_ALREADY_MATCHING: this.getJoinRestrictionMessage(
          'BATTLE_ALREADY_MATCHING',
        ),
        BATTLE_ROOM_FULL: this.getJoinRestrictionMessage('BATTLE_ROOM_FULL'),
        BATTLE_INVITATION_EXPIRED: this.getJoinRestrictionMessage(
          'BATTLE_INVITATION_EXPIRED',
        ),
        BATTLE_INVITATION_ALREADY_ACCEPTED: this.getJoinRestrictionMessage(
          'BATTLE_INVITATION_ALREADY_ACCEPTED',
        ),
        BATTLE_CANNOT_INVITE_SELF: this.getJoinRestrictionMessage(
          'BATTLE_CANNOT_INVITE_SELF',
        ),
        BATTLE_INVITATION_INVALID: this.getJoinRestrictionMessage(
          'BATTLE_INVITATION_INVALID',
        ),
        BATTLE_INVALID_STATUS: this.getJoinRestrictionMessage(
          'BATTLE_INVALID_STATUS',
        ),
      },
    );
  },

  getJoinRestrictionMessage(code: string) {
    if (code === 'BATTLE_INVITATION_EXPIRED') {
      return '邀请码已过期，请让房主重新发送新的邀请。';
    }

    if (code === 'BATTLE_ROOM_FULL') {
      return '当前好友房已满员，无法继续加入。';
    }

    if (code === 'BATTLE_INVITATION_ALREADY_ACCEPTED') {
      return '该邀请已被其他玩家接受，当前房间不能重复加入。';
    }

    if (code === 'BATTLE_ALREADY_ACTIVE') {
      return '你当前已有进行中的对局，请先完成当前对局后再加入好友房。';
    }

    if (code === 'BATTLE_ALREADY_MATCHING') {
      return '你当前正在随机匹配中，请先退出匹配后再加入好友房。';
    }

    if (code === 'BATTLE_CANNOT_INVITE_SELF') {
      return '这是你自己创建的好友房，系统将直接带你进入房间。';
    }

    if (code === 'BATTLE_INVITATION_INVALID') {
      return '当前邀请码不存在或已经失效，请确认后重试。';
    }

    if (code === 'BATTLE_INVALID_STATUS') {
      return '当前好友房状态已变化，暂时不能继续加入。';
    }

    return '当前邀请码暂时不可用，请稍后重试。';
  },
});
