import type {
  BattleRoomSummaryResponse,
  FriendRoomCreateResponse,
  FriendRoomPreviewResponse,
} from '../../types/battle';
import { getAuthStateSummary, redirectToLogin } from '../../utils/auth';
import { formatBattleDuration, formatBattleNickname } from '../../utils/battle';
import { request, RequestError } from '../../utils/request';

declare function clearTimeout(timeoutId: number): void;

type FriendRoomPageState =
  | 'IDLE'
  | 'CREATING'
  | 'WAITING'
  | 'PREVIEWING'
  | 'JOINING'
  | 'JOINED'
  | 'EXPIRED'
  | 'FULL'
  | 'ERROR';

type FriendRoomPageData = {
  state: FriendRoomPageState;
  invitationToken: string;
  sharePath: string;
  battleId: string;
  inviterName: string;
  participantCountText: string;
  expiresAtText: string;
  stateTitle: string;
  stateDescription: string;
  errorMessage: string;
  canJoin: boolean;
  isCreator: boolean;
  shareEnabled: boolean;
  shareHint: string;
};

type FriendRoomPageMethods = {
  ensureAuthenticated(): boolean;
  buildRedirectPath(): string;
  loadInitialData(): Promise<void>;
  createFriendRoom(): Promise<void>;
  previewFriendRoom(): Promise<void>;
  joinFriendRoom(): Promise<void>;
  applyPreview(payload: FriendRoomPreviewResponse): void;
  handleRetry(): void;
  handleJoin(): void;
  handleOpenRoom(): void;
  handleBackHome(): void;
  navigateToRoom(battleId: string): void;
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

Page<FriendRoomPageData, FriendRoomPageMethods>({
  data: {
    state: 'IDLE',
    invitationToken: '',
    sharePath: '',
    battleId: '',
    inviterName: '',
    participantCountText: '1 / 2',
    expiresAtText: '',
    stateTitle: '准备发起好友对战',
    stateDescription: '从 Battle 首页进入后会自动创建好友房并生成邀请链接。',
    errorMessage: '',
    canJoin: false,
    isCreator: false,
    shareEnabled: false,
    shareHint: '创建成功后可通过系统分享按钮邀请好友。',
  },

  onLoad(options) {
    isPageActive = true;
    const invitationToken = parseInvitationToken(options?.invitationToken);

    this.setData({
      invitationToken,
    });

    void this.loadInitialData();
  },

  onShow() {
    isPageActive = true;

    if (hasLoadedOnce && this.data.invitationToken) {
      void this.previewFriendRoom();
    }
  },

  onUnload() {
    isPageActive = false;
    requestSerial += 1;
  },

  onPullDownRefresh() {
    const task = this.data.invitationToken
      ? this.previewFriendRoom()
      : this.createFriendRoom();

    task.finally(() => {
      wx.stopPullDownRefresh();
    });
  },

  onShareAppMessage() {
    const invitationToken = this.data.invitationToken.trim();
    const sharePath =
      this.data.sharePath || `/pages/battle/friend-room?invitationToken=${invitationToken}`;

    return {
      title: '来一局 Battle 好友对战',
      path: sharePath,
    };
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

  async loadInitialData() {
    if (!this.ensureAuthenticated()) {
      return;
    }

    try {
      if (this.data.invitationToken) {
        await this.previewFriendRoom();
      } else {
        await this.createFriendRoom();
      }
    } finally {
      hasLoadedOnce = true;
    }
  },

  async createFriendRoom() {
    if (!this.ensureAuthenticated()) {
      return;
    }

    const currentRequestSerial = ++requestSerial;

    this.setData({
      state: 'CREATING',
      errorMessage: '',
      battleId: '',
      shareEnabled: false,
      canJoin: false,
      isCreator: true,
      stateTitle: '正在创建好友房',
      stateDescription: '系统正在生成邀请链接和等待中的 Battle 房间。',
      shareHint: '创建成功后可通过系统分享按钮邀请好友。',
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

      this.setData({
        state: 'WAITING',
        invitationToken: response.invitationToken,
        sharePath: response.sharePath,
        battleId: response.battleId,
        inviterName:
          formatBattleNickname(getAuthStateSummary().user?.nickname ?? null),
        participantCountText: '1 / 2',
        expiresAtText: formatExpiry(response.expiresAt),
        stateTitle: '好友房已创建',
        stateDescription: '现在可以分享邀请链接，等待好友加入同一房间。',
        errorMessage: '',
        canJoin: false,
        isCreator: true,
        shareEnabled: true,
        shareHint: '分享路径仅包含 invitationToken，不会携带账号和敏感认证信息。',
      });
    } catch (error) {
      if (!isPageActive || currentRequestSerial !== requestSerial) {
        return;
      }

      this.setData({
        state: 'ERROR',
        errorMessage: this.getReadableErrorMessage(
          error,
          '好友房创建失败，请稍后重试。',
        ),
        stateTitle: '好友房创建失败',
        stateDescription: '你可以重新尝试创建好友房，或先返回对战首页。',
        shareEnabled: false,
      });
    }
  },

  async previewFriendRoom() {
    if (!this.ensureAuthenticated()) {
      return;
    }

    const invitationToken = this.data.invitationToken.trim();

    if (!invitationToken) {
      await this.createFriendRoom();
      return;
    }

    const currentRequestSerial = ++requestSerial;

    this.setData({
      state: 'PREVIEWING',
      errorMessage: '',
      stateTitle: '正在同步好友房状态',
      stateDescription: '系统正在读取邀请信息和当前房间状态。',
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

      this.applyPreview(response);
    } catch (error) {
      if (!isPageActive || currentRequestSerial !== requestSerial) {
        return;
      }

      this.setData({
        state: 'ERROR',
        errorMessage: this.getReadableErrorMessage(
          error,
          '好友房状态加载失败，请稍后重试。',
        ),
        stateTitle: '好友房状态获取失败',
        stateDescription: '你可以重新查询邀请状态，或返回对战首页。',
        shareEnabled: false,
      });
    }
  },

  async joinFriendRoom() {
    if (!this.ensureAuthenticated()) {
      return;
    }

    const invitationToken = this.data.invitationToken.trim();

    if (!invitationToken) {
      return;
    }

    const currentRequestSerial = ++requestSerial;

    this.setData({
      state: 'JOINING',
      errorMessage: '',
      stateTitle: '正在加入好友房',
      stateDescription: '系统正在校验邀请有效性并尝试加入 Battle 房间。',
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

      const participantCount = Array.isArray(response.participants)
        ? response.participants.length
        : 0;

      this.setData({
        state: 'JOINED',
        battleId: response.battleId,
        participantCountText: `${participantCount} / 2`,
        stateTitle: '加入成功',
        stateDescription: '你已进入好友房，正在打开 Battle 房间占位页。',
        errorMessage: '',
        canJoin: false,
        shareEnabled: false,
      });

      this.navigateToRoom(response.battleId);
    } catch (error) {
      if (!isPageActive || currentRequestSerial !== requestSerial) {
        return;
      }

      if (error instanceof RequestError) {
        if (
          error.code === 'BATTLE_ROOM_FULL' ||
          error.code === 'BATTLE_INVITATION_ALREADY_ACCEPTED'
        ) {
          this.setData({
            state: 'FULL',
            errorMessage: this.getJoinRestrictionMessage(error.code),
            stateTitle: '当前好友房已不可加入',
            stateDescription: '邀请已被其他玩家接受或房间已满，请等待新的邀请链接。',
            canJoin: false,
            shareEnabled: false,
          });
          return;
        }

        if (error.code === 'BATTLE_INVITATION_EXPIRED') {
          this.setData({
            state: 'EXPIRED',
            errorMessage: this.getJoinRestrictionMessage(error.code),
            stateTitle: '邀请已过期',
            stateDescription: '当前好友房邀请已失效，请让创建者重新发起邀请。',
            canJoin: false,
            shareEnabled: false,
          });
          return;
        }
      }

      this.setData({
        state: 'ERROR',
        errorMessage: this.getReadableErrorMessage(
          error,
          '加入好友房失败，请稍后重试。',
        ),
        stateTitle: '加入好友房失败',
        stateDescription: '你可以重新查询邀请状态，确认服务端房间是否仍可加入。',
        canJoin: false,
        shareEnabled: false,
      });
    }
  },

  applyPreview(payload: FriendRoomPreviewResponse) {
    const currentUserId = getAuthStateSummary().user?.id ?? '';
    const isCreator = payload.inviter.userId === currentUserId;
    const participantCountText = `${Math.max(0, payload.participantCount)} / 2`;
    const state = this.getPreviewState(payload);
    const sharePath = this.data.sharePath
      ? this.data.sharePath
      : `/pages/battle/friend-room?invitationToken=${this.data.invitationToken}`;

    let stateTitle = '好友房状态';
    let stateDescription = '当前邀请状态以服务端返回为准。';
    let errorMessage = '';
    let shareEnabled = isCreator && state === 'WAITING';
    let canJoin = payload.canJoin && !isCreator;

    if (state === 'WAITING') {
      stateTitle = isCreator ? '等待好友加入' : '可加入好友房';
      stateDescription = isCreator
        ? '好友房已创建，可以分享邀请链接并等待好友加入。'
        : '邀请仍然有效，点击下方按钮即可加入 Battle 房间。';
    } else if (state === 'JOINED') {
      stateTitle = '好友房已就绪';
      stateDescription = isCreator
        ? '已有好友加入房间，你现在可以进入 Battle 房间占位页。'
        : '你已经是该好友房参与者，可以直接进入 Battle 房间占位页。';
      canJoin = false;
    } else if (state === 'EXPIRED') {
      stateTitle = '邀请已过期';
      stateDescription = '当前好友房邀请已失效，请重新创建或向创建者索取新的邀请链接。';
      errorMessage = this.getJoinRestrictionMessage(
        payload.cannotJoinReason || 'BATTLE_INVITATION_EXPIRED',
      );
      shareEnabled = false;
      canJoin = false;
    } else if (state === 'FULL') {
      stateTitle = '当前好友房已满';
      stateDescription = '邀请已经被其他玩家接受，当前房间不能再加入。';
      errorMessage = this.getJoinRestrictionMessage(
        payload.cannotJoinReason || 'BATTLE_ROOM_FULL',
      );
      shareEnabled = false;
      canJoin = false;
    } else if (state === 'ERROR') {
      stateTitle = '当前无法加入好友房';
      stateDescription = '该邀请暂时不可用，请查看下方提示。';
      errorMessage = this.getJoinRestrictionMessage(
        payload.cannotJoinReason || 'BATTLE_INVITATION_INVALID',
      );
      canJoin = false;
    }

    this.setData({
      state,
      battleId: payload.battleId,
      inviterName: formatBattleNickname(payload.inviter.nickname),
      participantCountText,
      expiresAtText: formatExpiry(payload.expiresAt),
      stateTitle,
      stateDescription,
      errorMessage,
      canJoin,
      isCreator,
      shareEnabled,
      sharePath,
      shareHint: shareEnabled
        ? '分享路径只包含 invitationToken，不会带上 token、用户 ID 或其他敏感字段。'
        : '当前页面仍可查看好友房状态，但不允许再次发起该邀请分享。',
    });
  },

  handleRetry() {
    if (this.data.state === 'EXPIRED' && this.data.isCreator) {
      this.setData({
        invitationToken: '',
        sharePath: '',
        battleId: '',
      });
      void this.createFriendRoom();
      return;
    }

    if (this.data.invitationToken) {
      void this.previewFriendRoom();
      return;
    }

    void this.createFriendRoom();
  },

  handleJoin() {
    void this.joinFriendRoom();
  },

  handleOpenRoom() {
    if (!UUID_PATTERN.test(this.data.battleId)) {
      wx.showToast({
        title: 'battleId 无效',
        icon: 'none',
      });
      return;
    }

    this.navigateToRoom(this.data.battleId);
  },

  handleBackHome() {
    wx.switchTab({
      url: '/pages/battle/index',
    });
  },

  navigateToRoom(battleId: string) {
    wx.navigateTo({
      url: `/pages/battle/room?battleId=${encodeURIComponent(battleId)}`,
    });
  },

  getPreviewState(payload: FriendRoomPreviewResponse) {
    const currentUserId = getAuthStateSummary().user?.id ?? '';
    const isCreator = payload.inviter.userId === currentUserId;

    if (
      payload.invitationStatus === 'EXPIRED' ||
      payload.roomStatus === 'EXPIRED'
    ) {
      return 'EXPIRED';
    }

    if (payload.invitationStatus === 'ACCEPTED') {
      if (payload.canJoin || isCreator) {
        return 'JOINED';
      }

      return 'FULL';
    }

    if (isCreator) {
      return 'WAITING';
    }

    if (payload.canJoin) {
      return 'WAITING';
    }

    if (payload.cannotJoinReason === 'BATTLE_ROOM_FULL') {
      return 'FULL';
    }

    return 'ERROR';
  },

  getReadableErrorMessage(error: unknown, fallback: string) {
    if (error instanceof RequestError) {
      if (error.statusCode === 401 || error.code === 'UNAUTHORIZED') {
        redirectToLogin(this.buildRedirectPath());
        return '登录状态已失效，请重新登录后再继续查看好友房。';
      }

      if (error.code === 'NETWORK_ERROR') {
        return '无法连接好友房服务，请确认后端服务已启动。';
      }

      if (
        error.code === 'BATTLE_ALREADY_ACTIVE' ||
        error.code === 'BATTLE_ALREADY_MATCHING' ||
        error.code === 'BATTLE_ROOM_FULL' ||
        error.code === 'BATTLE_INVITATION_EXPIRED' ||
        error.code === 'BATTLE_INVITATION_ALREADY_ACCEPTED' ||
        error.code === 'BATTLE_CANNOT_INVITE_SELF' ||
        error.code === 'BATTLE_INVITATION_INVALID'
      ) {
        return this.getJoinRestrictionMessage(error.code);
      }

      return error.message || fallback;
    }

    if (error instanceof Error && error.message) {
      return error.message;
    }

    return fallback;
  },

  getJoinRestrictionMessage(code: string) {
    if (code === 'BATTLE_INVITATION_EXPIRED') {
      return '邀请已过期，请让创建者重新发送新的好友房邀请。';
    }

    if (code === 'BATTLE_ROOM_FULL') {
      return '当前好友房已满，不能再加入新的玩家。';
    }

    if (code === 'BATTLE_INVITATION_ALREADY_ACCEPTED') {
      return '该邀请已经被其他玩家接受，当前房间不可重复加入。';
    }

    if (code === 'BATTLE_ALREADY_ACTIVE') {
      return '你当前已有进行中的 Battle，对战结束前不能加入新的好友房。';
    }

    if (code === 'BATTLE_ALREADY_MATCHING') {
      return '你当前正在随机匹配中，请先退出匹配再加入好友房。';
    }

    if (code === 'BATTLE_CANNOT_INVITE_SELF') {
      return '这是你自己创建的邀请链接，可查看房间状态，但不能以邀请者身份再次加入。';
    }

    if (code === 'BATTLE_INVITATION_INVALID') {
      return '当前邀请链接无效，请确认 invitationToken 是否正确。';
    }

    return '当前邀请暂时不可用，请稍后重试或向好友索取新的邀请链接。';
  },
});
