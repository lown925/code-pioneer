import { registerThemedPage } from '../../utils/theme-page';
import type {
  BattleLeaderboardItem,
  BattleLeaderboardQuery,
  BattleLeaderboardResponse,
} from '../../types/battle';
import { getAuthStateSummary, redirectToLogin } from '../../utils/auth';
import {
  formatBattleInitial,
  formatBattleNickname,
  formatBattleRank,
  formatBattleRating,
  formatBattleRecord,
  formatBattleWinRate,
  getBattleErrorMessage,
} from '../../utils/battle';
import { request, RequestError } from '../../utils/request';

type PageState = 'loading' | 'success' | 'empty' | 'error' | 'unauthorized';
type LeaderboardScope = 'TOTAL' | 'PYTHON';

type LeaderboardCard = BattleLeaderboardItem & {
  nicknameText: string;
  ratingText: string;
  highestRatingText: string;
  winRateText: string;
  recordText: string;
  rankText: string;
  rankBadgeText: string;
  avatarFallbackText: string;
  rankedBattlesText: string;
  starText: string;
  titleText: string;
  isCurrentUser: boolean;
};

type MyRankSummary = {
  rankText: string;
  ratingText: string;
  hintText: string;
};

type BattleLeaderboardPageData = {
  state: PageState;
  errorMessage: string;
  loadMoreErrorMessage: string;
  items: LeaderboardCard[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
  isLoadingMore: boolean;
  mySummary: MyRankSummary | null;
  scope: LeaderboardScope;
  titleText: string;
  descriptionText: string;
};

type BattleLeaderboardPageMethods = {
  ensureAuthenticated(): boolean;
  loadFirstPage(): Promise<void>;
  loadMore(): Promise<void>;
  refreshPage(): Promise<void>;
  fetchLeaderboard(options: { page: number; replace: boolean }): Promise<void>;
  buildQuery(page: number): BattleLeaderboardQuery;
  handleRetry(): void;
  handleLoadMoreRetry(): void;
  handleScopeChange(event: WechatMiniprogram.BaseEvent<{ scope?: LeaderboardScope }>): void;
  mapLeaderboardItem(item: BattleLeaderboardItem): LeaderboardCard;
  mapMySummary(response: BattleLeaderboardResponse, pageItems: LeaderboardCard[]): MyRankSummary;
  getReadableError(error: unknown): {
    state: PageState;
    message: string;
  };
};

const PAGE_SIZE = 20;

let isPageActive = false;
let isRequesting = false;
let requestSerial = 0;

registerThemedPage<BattleLeaderboardPageData, BattleLeaderboardPageMethods>({
  data: {
    state: 'loading',
    errorMessage: '',
    loadMoreErrorMessage: '',
    items: [],
    page: 1,
    pageSize: PAGE_SIZE,
    total: 0,
    totalPages: 0,
    hasMore: false,
    isLoadingMore: false,
    mySummary: null,
    scope: 'TOTAL',
    titleText: '总榜',
    descriptionText: '按全部方向 Rating 总和排名。',
  },

  onLoad() {
    isPageActive = true;
    void this.loadFirstPage();
  },

  onUnload() {
    isPageActive = false;
    requestSerial += 1;
  },

  onPullDownRefresh() {
    void this.refreshPage();
  },

  onReachBottom() {
    void this.loadMore();
  },

  ensureAuthenticated() {
    const authState = getAuthStateSummary();

    if (authState.isAuthenticated) {
      return true;
    }

    this.setData({
      state: 'unauthorized',
      errorMessage: '请先登录后再查看 Battle 排行榜。',
      items: [],
      mySummary: null,
      hasMore: false,
      isLoadingMore: false,
      loadMoreErrorMessage: '',
    });

    redirectToLogin('/pages/battle/leaderboard');
    return false;
  },

  async loadFirstPage() {
    if (!this.ensureAuthenticated()) {
      return;
    }

    await this.fetchLeaderboard({
      page: 1,
      replace: true,
    });
  },

  async loadMore() {
    if (!this.ensureAuthenticated() || isRequesting || !this.data.hasMore) {
      return;
    }

    await this.fetchLeaderboard({
      page: this.data.page + 1,
      replace: false,
    });
  },

  async refreshPage() {
    if (!this.ensureAuthenticated()) {
      wx.stopPullDownRefresh();
      return;
    }

    await this.fetchLeaderboard({
      page: 1,
      replace: true,
    });

    wx.stopPullDownRefresh();
  },

  async fetchLeaderboard({ page, replace }: { page: number; replace: boolean }) {
    if (isRequesting) {
      return;
    }

    const currentRequestSerial = ++requestSerial;
    isRequesting = true;

    if (replace) {
      this.setData({
        state: 'loading',
        errorMessage: '',
        loadMoreErrorMessage: '',
        items: [],
        page: 1,
        total: 0,
        totalPages: 0,
        hasMore: false,
        isLoadingMore: false,
        mySummary: this.data.mySummary,
      });
    } else {
      this.setData({
        isLoadingMore: true,
        loadMoreErrorMessage: '',
      });
    }

    try {
      const response = await request<BattleLeaderboardResponse>({
        url: '/battles/leaderboard',
        method: 'GET',
        data: this.buildQuery(page) as WechatMiniprogram.IAnyObject,
        authMode: 'required',
      });

      if (!isPageActive || currentRequestSerial !== requestSerial) {
        return;
      }

      const mappedItems = response.items.map((item) => this.mapLeaderboardItem(item));
      const items = replace ? mappedItems : [...this.data.items, ...mappedItems];
      const hasMore = response.page < response.totalPages;

      this.setData({
        state: items.length > 0 ? 'success' : 'empty',
        errorMessage: '',
        loadMoreErrorMessage: '',
        items,
        page: response.page,
        pageSize: response.pageSize,
        total: response.total,
        totalPages: response.totalPages,
        hasMore,
        isLoadingMore: false,
        mySummary: this.mapMySummary(response, items),
      });
    } catch (error) {
      if (!isPageActive || currentRequestSerial !== requestSerial) {
        return;
      }

      const readable = this.getReadableError(error);

      if (replace) {
        this.setData({
          state: readable.state,
          errorMessage: readable.message,
          items: [],
          page: 1,
          pageSize: PAGE_SIZE,
          total: 0,
          totalPages: 0,
          hasMore: false,
          isLoadingMore: false,
          loadMoreErrorMessage: '',
          mySummary: null,
        });
      } else {
        this.setData({
          isLoadingMore: false,
          loadMoreErrorMessage: readable.message,
        });
      }
    } finally {
      isRequesting = false;
    }
  },

  buildQuery(page: number) {
    return {
      page,
      pageSize: PAGE_SIZE,
      ...(this.data.scope === 'PYTHON' ? { skill: 'PYTHON' } : {}),
    };
  },

  handleScopeChange(event: WechatMiniprogram.BaseEvent<{ scope?: LeaderboardScope }>) {
    const scope = event.currentTarget.dataset.scope;

    if (!scope || scope === this.data.scope || isRequesting) {
      return;
    }

    this.setData({
      scope,
      titleText: scope === 'PYTHON' ? 'Python 排行榜' : '总榜',
      descriptionText:
        scope === 'PYTHON' ? '按 Python Ranked 方向 Rating 排名。' : '按全部方向 Rating 总和排名。',
      mySummary: null,
    });
    void this.loadFirstPage();
  },

  handleRetry() {
    void this.loadFirstPage();
  },

  handleLoadMoreRetry() {
    void this.loadMore();
  },

  mapLeaderboardItem(item: BattleLeaderboardItem) {
    const currentUserId = getAuthStateSummary().user?.id ?? '';

    return {
      ...item,
      nicknameText: formatBattleNickname(item.nickname),
      ratingText: formatBattleRating(item.rating),
      highestRatingText: formatBattleRating(item.highestRating),
      rankedBattlesText: String(Math.max(0, item.rankedBattles)),
      starText: item.star === undefined ? '' : `${item.star} 星`,
      titleText: item.title ?? '',
      winRateText: formatBattleWinRate(item.winRate),
      recordText: formatBattleRecord(item.wins, item.losses, item.draws),
      rankText: formatBattleRank(item.rank),
      rankBadgeText: item.rank <= 3 ? `TOP ${item.rank}` : `#${item.rank}`,
      avatarFallbackText: formatBattleInitial(item.nickname),
      isCurrentUser: item.userId === currentUserId,
    };
  },

  mapMySummary(response: BattleLeaderboardResponse, pageItems: LeaderboardCard[]) {
    const currentItem = pageItems.find((item) => item.isCurrentUser);
    const rankText = formatBattleRank(response.myRank);
    const ratingText = formatBattleRating(response.myRating);
    const hintText = currentItem
      ? '你当前的排行条目已在列表中高亮显示。'
      : '当前页未展示你的条目，可继续翻页查看或以该摘要为准。';

    return {
      rankText,
      ratingText,
      hintText,
    };
  },

  getReadableError(error: unknown) {
    if (error instanceof RequestError) {
      if (error.statusCode === 401 || error.code === 'UNAUTHORIZED') {
        return {
          state: 'unauthorized' as const,
          message: '登录状态已失效，请重新登录后再查看排行榜。',
        };
      }
      return {
        state: 'error' as const,
        message: getBattleErrorMessage(error, {
          unauthorized: '登录状态已失效，请重新登录后再查看排行榜。',
          network: '网络连接失败，请确认后端服务已启动后重试。',
          fallback: '排行榜加载失败，请稍后重试。',
        }),
      };
    }

    return {
      state: 'error' as const,
      message: '排行榜加载失败，请稍后重试。',
    };
  },
});
