import type { BattleProfileResponse } from '../../types/battle';
import { getAuthStateSummary, redirectToLogin } from '../../utils/auth';
import {
  formatBattleRank,
  formatBattleRating,
  formatBattleRecord,
  formatBattleWinRate,
} from '../../utils/battle';
import { request, RequestError } from '../../utils/request';

type PageState = 'guest' | 'loading' | 'success' | 'error';

type BattleProfileCard = {
  ratingText: string;
  highestRatingText: string;
  totalBattlesText: string;
  rankedBattlesText: string;
  friendBattlesText: string;
  winsText: string;
  lossesText: string;
  drawsText: string;
  winRateText: string;
  currentWinStreakText: string;
  bestWinStreakText: string;
  rankText: string;
  currentRankText: string;
  recordText: string;
};

type BattleEntryCard = {
  key: 'random' | 'friend' | 'leaderboard' | 'history';
  title: string;
  description: string;
  actionText: string;
  badgeText: string;
  badgeClassName: string;
  disabled: boolean;
};

type BattlePageData = {
  state: PageState;
  isAuthenticated: boolean;
  displayName: string;
  errorMessage: string;
  profile: BattleProfileCard | null;
  entries: BattleEntryCard[];
};

type BattlePageMethods = {
  syncAuthState(): boolean;
  loadProfile(): Promise<void>;
  handleLogin(): void;
  handleRetry(): void;
  handleEntryTap(
    event: WechatMiniprogram.BaseEvent<{
      entryKey?: BattleEntryCard['key'];
      disabled?: boolean;
    }>,
  ): void;
  mapProfile(profile: BattleProfileResponse): BattleProfileCard;
  getReadableErrorMessage(error: unknown): string;
};

const ENTRY_CARDS: BattleEntryCard[] = [
  {
    key: 'random',
    title: '随机匹配',
    description: '进入匹配池后按评分范围轮询寻找对手，并在匹配成功后跳转房间。',
    actionText: '开始匹配',
    badgeText: '已开放',
    badgeClassName: 'entry-badge-live',
    disabled: false,
  },
  {
    key: 'friend',
    title: '好友对战',
    description: '通过邀请码与好友发起同房间对战。',
    actionText: '后续开放',
    badgeText: '即将开放',
    badgeClassName: 'entry-badge-pending',
    disabled: true,
  },
  {
    key: 'leaderboard',
    title: '排行榜',
    description: '查看全站对战排名、评分和当前自己的名次。',
    actionText: '查看排行',
    badgeText: '已开放',
    badgeClassName: 'entry-badge-live',
    disabled: false,
  },
  {
    key: 'history',
    title: '战绩',
    description: '查看历史对战记录、胜负结果和局数统计。',
    actionText: '后续开放',
    badgeText: '即将开放',
    badgeClassName: 'entry-badge-pending',
    disabled: true,
  },
];

let isPageActive = false;
let isRequesting = false;
let requestSerial = 0;

Page<BattlePageData, BattlePageMethods>({
  data: {
    state: 'guest',
    isAuthenticated: false,
    displayName: '游客用户',
    errorMessage: '',
    profile: null,
    entries: ENTRY_CARDS,
  },

  onLoad() {
    isPageActive = true;
    void this.loadProfile();
  },

  onShow() {
    if (!isPageActive) {
      isPageActive = true;
    }

    if (getAuthStateSummary().isAuthenticated) {
      void this.loadProfile();
      return;
    }

    if (this.data.isAuthenticated !== getAuthStateSummary().isAuthenticated) {
      void this.loadProfile();
    }
  },

  onUnload() {
    isPageActive = false;
    requestSerial += 1;
  },

  onPullDownRefresh() {
    void this.loadProfile().finally(() => {
      wx.stopPullDownRefresh();
    });
  },

  syncAuthState() {
    const authState = getAuthStateSummary();
    const displayName = authState.user?.nickname?.trim() || '微信用户';

    this.setData({
      isAuthenticated: authState.isAuthenticated,
      displayName,
    });

    return authState.isAuthenticated;
  },

  async loadProfile() {
    const isAuthenticated = this.syncAuthState();

    if (!isAuthenticated) {
      if (!isPageActive) {
        return;
      }

      this.setData({
        state: 'guest',
        errorMessage: '',
        profile: null,
        entries: ENTRY_CARDS,
      });
      return;
    }

    if (isRequesting) {
      return;
    }

    const currentRequestSerial = ++requestSerial;
    isRequesting = true;

    this.setData({
      state: 'loading',
      errorMessage: '',
      profile: null,
      entries: ENTRY_CARDS,
    });

    try {
      const response = await request<BattleProfileResponse>({
        url: '/battles/profile',
        method: 'GET',
        authMode: 'required',
      });

      if (!isPageActive || currentRequestSerial !== requestSerial) {
        return;
      }

      this.setData({
        state: 'success',
        errorMessage: '',
        profile: this.mapProfile(response),
      });
    } catch (error) {
      if (!isPageActive || currentRequestSerial !== requestSerial) {
        return;
      }

      this.setData({
        state: 'error',
        errorMessage: this.getReadableErrorMessage(error),
        profile: null,
      });
    } finally {
      isRequesting = false;
    }
  },

  handleLogin() {
    redirectToLogin('/pages/battle/index');
  },

  handleRetry() {
    void this.loadProfile();
  },

  handleEntryTap(
    event: WechatMiniprogram.BaseEvent<{
      entryKey?: BattleEntryCard['key'];
      disabled?: boolean;
    }>,
  ) {
    const { entryKey, disabled } = event.currentTarget.dataset;

    if (!this.data.isAuthenticated) {
      redirectToLogin('/pages/battle/index');
      return;
    }

    if (disabled) {
      wx.showToast({
        title: '该功能将在后续阶段开放',
        icon: 'none',
      });
      return;
    }

    if (entryKey === 'leaderboard') {
      wx.navigateTo({
        url: '/pages/battle/leaderboard',
      });
      return;
    }

    if (entryKey === 'random') {
      wx.navigateTo({
        url: '/pages/battle/matchmaking',
      });
      return;
    }

    wx.showToast({
      title: '该功能将在后续阶段开放',
      icon: 'none',
    });
  },

  mapProfile(profile: BattleProfileResponse) {
    return {
      ratingText: formatBattleRating(profile.rating),
      highestRatingText: formatBattleRating(profile.highestRating),
      totalBattlesText: String(Math.max(0, profile.totalBattles)),
      rankedBattlesText: String(Math.max(0, profile.rankedBattles)),
      friendBattlesText: String(Math.max(0, profile.friendBattles)),
      winsText: String(Math.max(0, profile.wins)),
      lossesText: String(Math.max(0, profile.losses)),
      drawsText: String(Math.max(0, profile.draws)),
      winRateText: formatBattleWinRate(profile.winRate),
      currentWinStreakText: String(Math.max(0, profile.currentWinStreak)),
      bestWinStreakText: String(Math.max(0, profile.bestWinStreak)),
      rankText: formatBattleRank(profile.rank),
      currentRankText: formatBattleRank(profile.currentRank),
      recordText: formatBattleRecord(profile.wins, profile.losses, profile.draws),
    };
  },

  getReadableErrorMessage(error: unknown) {
    if (error instanceof RequestError) {
      if (error.statusCode === 401 || error.code === 'UNAUTHORIZED') {
        return '登录状态已失效，请重新登录后再查看对战首页。';
      }

      if (error.code === 'NETWORK_ERROR') {
        return '无法连接对战服务，请确认后端服务已启动。';
      }

      return error.message || '对战首页加载失败，请稍后重试。';
    }

    if (error instanceof Error && error.message) {
      return error.message;
    }

    return '对战首页加载失败，请稍后重试。';
  },
});
