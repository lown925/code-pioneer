import type {
  BattleHistoryListItemResponse,
  BattleHistoryQuery,
  BattleHistoryResponse,
} from '../../types/battle';
import { getAuthStateSummary, redirectToLogin } from '../../utils/auth';
import {
  formatBattleInitial,
  formatBattleNickname,
  formatBattleSkill,
  formatBattleRating,
  getBattleErrorMessage,
} from '../../utils/battle';
import { request, RequestError } from '../../utils/request';

type HistoryPageState = 'loading' | 'success' | 'empty' | 'error' | 'unauthorized';

type FilterOption = {
  value: string;
  label: string;
};

type HistoryCard = BattleHistoryListItemResponse & {
  opponentNicknameText: string;
  opponentAvatarFallbackText: string;
  modeText: string;
  skillText: string;
  resultText: string;
  resultClassName: string;
  scoreText: string;
  ratingDeltaText: string;
  completedAtText: string;
  endReasonText: string;
};

type HistoryPageData = {
  state: HistoryPageState;
  errorMessage: string;
  loadMoreErrorMessage: string;
  items: HistoryCard[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
  isLoadingMore: boolean;
  selectedMode: '' | 'RANKED' | 'FRIEND';
  selectedResult: '' | 'WIN' | 'LOSS' | 'DRAW';
  modeFilters: FilterOption[];
  resultFilters: FilterOption[];
};

type HistoryPageMethods = {
  ensureAuthenticated(): boolean;
  loadFirstPage(): Promise<void>;
  loadMore(): Promise<void>;
  refreshPage(): Promise<void>;
  fetchHistory(options: { page: number; replace: boolean }): Promise<void>;
  buildQuery(page: number): BattleHistoryQuery;
  handleRetry(): void;
  handleLoadMoreRetry(): void;
  handleModeFilterTap(
    event: WechatMiniprogram.BaseEvent<{ value?: string }>,
  ): void;
  handleResultFilterTap(
    event: WechatMiniprogram.BaseEvent<{ value?: string }>,
  ): void;
  handleItemTap(
    event: WechatMiniprogram.BaseEvent<{ battleId?: string }>,
  ): void;
  mapHistoryItem(item: BattleHistoryListItemResponse): HistoryCard;
  getModeText(mode: string): string;
  getResultMeta(result: 'WIN' | 'LOSS' | 'DRAW'): {
    resultText: string;
    resultClassName: string;
  };
  getEndReasonText(endReason: string | null): string;
  formatCompletedAt(value: string): string;
  formatRatingDelta(value: number): string;
  getReadableError(error: unknown): {
    state: HistoryPageState;
    message: string;
  };
};

const PAGE_SIZE = 20;
const MODE_FILTERS: FilterOption[] = [
  { value: '', label: '全部模式' },
  { value: 'RANKED', label: '排位' },
  { value: 'FRIEND', label: '好友' },
];
const RESULT_FILTERS: FilterOption[] = [
  { value: '', label: '全部结果' },
  { value: 'WIN', label: '胜利' },
  { value: 'LOSS', label: '失利' },
  { value: 'DRAW', label: '平局' },
];

let isPageActive = false;
let isRequesting = false;
let requestSerial = 0;

Page<HistoryPageData, HistoryPageMethods>({
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
    selectedMode: '',
    selectedResult: '',
    modeFilters: MODE_FILTERS,
    resultFilters: RESULT_FILTERS,
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
      errorMessage: '请先登录后再查看 Battle 战绩。',
      items: [],
      hasMore: false,
      isLoadingMore: false,
      loadMoreErrorMessage: '',
    });

    redirectToLogin('/pages/battle/history');
    return false;
  },

  async loadFirstPage() {
    if (!this.ensureAuthenticated()) {
      return;
    }

    await this.fetchHistory({
      page: 1,
      replace: true,
    });
  },

  async loadMore() {
    if (!this.ensureAuthenticated() || isRequesting || !this.data.hasMore) {
      return;
    }

    await this.fetchHistory({
      page: this.data.page + 1,
      replace: false,
    });
  },

  async refreshPage() {
    if (!this.ensureAuthenticated()) {
      wx.stopPullDownRefresh();
      return;
    }

    await this.fetchHistory({
      page: 1,
      replace: true,
    });

    wx.stopPullDownRefresh();
  },

  async fetchHistory({
    page,
    replace,
  }: {
    page: number;
    replace: boolean;
  }) {
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
      });
    } else {
      this.setData({
        isLoadingMore: true,
        loadMoreErrorMessage: '',
      });
    }

    try {
      const response = await request<BattleHistoryResponse>({
        url: '/battles/history',
        method: 'GET',
        data: this.buildQuery(page) as WechatMiniprogram.IAnyObject,
        authMode: 'required',
      });

      if (!isPageActive || currentRequestSerial !== requestSerial) {
        return;
      }

      const mappedItems = response.items.map((item) => this.mapHistoryItem(item));
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
          total: 0,
          totalPages: 0,
          hasMore: false,
          isLoadingMore: false,
          loadMoreErrorMessage: '',
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
    const query: BattleHistoryQuery = {
      page,
      pageSize: this.data.pageSize || PAGE_SIZE,
    };

    if (this.data.selectedMode) {
      query.mode = this.data.selectedMode;
    }

    if (this.data.selectedResult) {
      query.result = this.data.selectedResult;
    }

    return query;
  },

  handleRetry() {
    void this.loadFirstPage();
  },

  handleLoadMoreRetry() {
    void this.loadMore();
  },

  handleModeFilterTap(
    event: WechatMiniprogram.BaseEvent<{ value?: string }>,
  ) {
    const value = (event.currentTarget.dataset.value ?? '') as
      | ''
      | 'RANKED'
      | 'FRIEND';

    if (value === this.data.selectedMode) {
      return;
    }

    this.setData({
      selectedMode: value,
    });

    void this.loadFirstPage();
  },

  handleResultFilterTap(
    event: WechatMiniprogram.BaseEvent<{ value?: string }>,
  ) {
    const value = (event.currentTarget.dataset.value ?? '') as
      | ''
      | 'WIN'
      | 'LOSS'
      | 'DRAW';

    if (value === this.data.selectedResult) {
      return;
    }

    this.setData({
      selectedResult: value,
    });

    void this.loadFirstPage();
  },

  handleItemTap(
    event: WechatMiniprogram.BaseEvent<{ battleId?: string }>,
  ) {
    const battleId = event.currentTarget.dataset.battleId ?? '';

    if (!battleId) {
      return;
    }

    wx.navigateTo({
      url: `/pages/battle/history-detail?battleId=${encodeURIComponent(battleId)}`,
    });
  },

  mapHistoryItem(item: BattleHistoryListItemResponse): HistoryCard {
    const resultMeta = this.getResultMeta(item.result);

    return {
      ...item,
      opponentNicknameText: formatBattleNickname(item.opponent.nickname),
      opponentAvatarFallbackText: formatBattleInitial(item.opponent.nickname),
      modeText: this.getModeText(item.mode),
      skillText: formatBattleSkill(item.skill),
      resultText: resultMeta.resultText,
      resultClassName: resultMeta.resultClassName,
      scoreText: `${item.myScore} : ${item.opponentScore}`,
      ratingDeltaText: this.formatRatingDelta(item.ratingDelta),
      completedAtText: this.formatCompletedAt(item.completedAt),
      endReasonText: this.getEndReasonText(item.endReason),
    };
  },

  getModeText(mode: string) {
    if (mode === 'FRIEND') {
      return '好友对战';
    }

    if (mode === 'RANKED') {
      return '排位对战';
    }

    return '未知模式';
  },

  getResultMeta(result: 'WIN' | 'LOSS' | 'DRAW') {
    if (result === 'WIN') {
      return {
        resultText: '胜利',
        resultClassName: 'result-badge-win',
      };
    }

    if (result === 'LOSS') {
      return {
        resultText: '失利',
        resultClassName: 'result-badge-loss',
      };
    }

    return {
      resultText: '平局',
      resultClassName: 'result-badge-draw',
    };
  },

  getEndReasonText(endReason: string | null) {
    if (endReason === 'USER_FORFEIT') {
      return '认输结束';
    }

    if (endReason === 'MATCH_TIMEOUT') {
      return '超时结算';
    }

    if (endReason === 'EXPIRED') {
      return '房间过期';
    }

    if (endReason === 'SYSTEM_CANCELLED') {
      return '系统取消';
    }

    return '正常结束';
  },

  formatCompletedAt(value: string) {
    const timestamp = Date.parse(value);

    if (!Number.isFinite(timestamp)) {
      return '结算时间未知';
    }

    const date = new Date(timestamp);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${month}-${day} ${hours}:${minutes}`;
  },

  formatRatingDelta(value: number) {
    const normalized = Number.isFinite(value) ? value : 0;

    if (normalized > 0) {
      return `+${normalized}`;
    }

    return String(normalized);
  },

  getReadableError(error: unknown) {
    if (error instanceof RequestError) {
      if (error.statusCode === 401 || error.code === 'UNAUTHORIZED') {
        redirectToLogin('/pages/battle/history');
        return {
          state: 'unauthorized',
          message: '登录状态已失效，请重新登录后再查看 Battle 战绩。',
        };
      }
      return {
        state: 'error',
        message: getBattleErrorMessage(
          error,
          {
            unauthorized: '登录状态已失效，请重新登录后再查看 Battle 战绩。',
            network: '网络连接失败，请确认后端服务已启动后重试。',
            fallback: 'Battle 战绩加载失败，请稍后重试。',
          },
          {
            BATTLE_NOT_PARTICIPANT:
              '你不是当前对局参与者，无法查看对应 Battle 战绩。',
          },
        ),
      };
    }

    return {
      state: 'error',
      message: 'Battle 战绩加载失败，请稍后重试。',
    };
  },
});
