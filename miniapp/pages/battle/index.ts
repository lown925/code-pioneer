import type {
  BattleLeaderboardItem,
  BattleLeaderboardResponse,
  BattleProfileResponse,
} from '../../types/battle';
import { getAuthStateSummary, redirectToLogin } from '../../utils/auth';
import {
  formatBattleInitial,
  formatBattleNickname,
  formatBattleRank,
  formatBattleRating,
  getBattleErrorMessage,
} from '../../utils/battle';
import { request } from '../../utils/request';

type PageState = 'guest' | 'loading' | 'success' | 'empty' | 'error';

type LeaderboardRow = {
  rank: number;
  userId: string;
  avatarUrl: string | null;
  nicknameText: string;
  avatarFallbackText: string;
  rankText: string;
  ratingText: string;
  totalBattlesText: string;
  rankClassName: string;
  isCurrentUser: boolean;
};

type MyRankCard = {
  avatarUrl: string | null;
  avatarFallbackText: string;
  nicknameText: string;
  rankText: string;
  ratingText: string;
  totalBattlesText: string;
};

type BattlePageData = {
  state: PageState;
  isAuthenticated: boolean;
  errorMessage: string;
  rankings: LeaderboardRow[];
  myRank: MyRankCard | null;
};

type BattlePageMethods = {
  syncAuthState(): boolean;
  loadBattleHome(): Promise<void>;
  handleLogin(): void;
  handleRetry(): void;
  handleRandomMatch(): void;
  handleFriendBattle(): void;
  handleHistory(): void;
  openBattlePage(path: string): void;
  mapLeaderboardItem(item: BattleLeaderboardItem): LeaderboardRow;
  mapMyRank(
    profile: BattleProfileResponse,
    leaderboard: BattleLeaderboardResponse,
  ): MyRankCard;
  getReadableErrorMessage(error: unknown): string;
};

const LEADERBOARD_LIMIT = 20;

let isPageActive = false;
let isRequesting = false;
let requestSerial = 0;

Page<BattlePageData, BattlePageMethods>({
  data: {
    state: 'guest',
    isAuthenticated: false,
    errorMessage: '',
    rankings: [],
    myRank: null,
  },

  onLoad() {
    isPageActive = true;
    void this.loadBattleHome();
  },

  onShow() {
    isPageActive = true;
    void this.loadBattleHome();
  },

  onUnload() {
    isPageActive = false;
    requestSerial += 1;
  },

  onPullDownRefresh() {
    void this.loadBattleHome().finally(() => {
      wx.stopPullDownRefresh();
    });
  },

  syncAuthState() {
    const isAuthenticated = getAuthStateSummary().isAuthenticated;

    this.setData({
      isAuthenticated,
    });

    return isAuthenticated;
  },

  async loadBattleHome() {
    if (!this.syncAuthState()) {
      if (!isPageActive) {
        return;
      }

      this.setData({
        state: 'guest',
        errorMessage: '',
        rankings: [],
        myRank: null,
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
    });

    try {
      const [profile, leaderboard] = await Promise.all([
        request<BattleProfileResponse>({
          url: '/battles/profile',
          method: 'GET',
          authMode: 'required',
        }),
        request<BattleLeaderboardResponse>({
          url: '/battles/leaderboard',
          method: 'GET',
          data: {
            page: 1,
            pageSize: LEADERBOARD_LIMIT,
          },
          authMode: 'required',
        }),
      ]);

      if (!isPageActive || currentRequestSerial !== requestSerial) {
        return;
      }

      const rankings = leaderboard.items
        .slice(0, LEADERBOARD_LIMIT)
        .map((item) => this.mapLeaderboardItem(item));

      this.setData({
        state: rankings.length > 0 ? 'success' : 'empty',
        errorMessage: '',
        rankings,
        myRank: this.mapMyRank(profile, leaderboard),
      });
    } catch (error) {
      if (!isPageActive || currentRequestSerial !== requestSerial) {
        return;
      }

      this.setData({
        state: 'error',
        errorMessage: this.getReadableErrorMessage(error),
        rankings: [],
        myRank: null,
      });
    } finally {
      isRequesting = false;
    }
  },

  handleLogin() {
    redirectToLogin('/pages/battle/index');
  },

  handleRetry() {
    void this.loadBattleHome();
  },

  handleRandomMatch() {
    this.openBattlePage('/pages/battle/matchmaking');
  },

  handleFriendBattle() {
    this.openBattlePage('/pages/battle/friend-room');
  },

  handleHistory() {
    this.openBattlePage('/pages/battle/history');
  },

  openBattlePage(path: string) {
    if (!this.data.isAuthenticated) {
      redirectToLogin('/pages/battle/index');
      return;
    }

    wx.navigateTo({
      url: path,
    });
  },

  mapLeaderboardItem(item: BattleLeaderboardItem) {
    const currentUserId = getAuthStateSummary().user?.id ?? '';

    return {
      rank: item.rank,
      userId: item.userId,
      avatarUrl: item.avatarUrl,
      nicknameText: formatBattleNickname(item.nickname),
      avatarFallbackText: formatBattleInitial(item.nickname),
      rankText: formatBattleRank(item.rank),
      ratingText: formatBattleRating(item.rating),
      totalBattlesText: String(
        Math.max(0, item.wins) + Math.max(0, item.losses) + Math.max(0, item.draws),
      ),
      rankClassName: item.rank <= 3 ? `rank-${item.rank}` : 'rank-default',
      isCurrentUser: item.userId === currentUserId,
    };
  },

  mapMyRank(
    profile: BattleProfileResponse,
    leaderboard: BattleLeaderboardResponse,
  ) {
    const user = getAuthStateSummary().user;

    return {
      avatarUrl: user?.avatarUrl ?? null,
      avatarFallbackText: formatBattleInitial(user?.nickname ?? null),
      nicknameText: user?.nickname?.trim() || '微信用户',
      rankText: formatBattleRank(leaderboard.myRank ?? profile.currentRank),
      ratingText: formatBattleRating(leaderboard.myRating ?? profile.rating),
      totalBattlesText: String(Math.max(0, profile.totalBattles)),
    };
  },

  getReadableErrorMessage(error: unknown) {
    return getBattleErrorMessage(error, {
      unauthorized: '登录状态已失效，请重新登录后查看对战排行。',
      network: '网络连接失败，请检查网络后重试。',
      fallback: '对战首页加载失败，请稍后重试。',
    });
  },
});
