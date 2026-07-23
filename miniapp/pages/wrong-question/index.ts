import type {
  WrongQuestionListItem,
  WrongQuestionListQuery,
  WrongQuestionListResponse,
  WrongQuestionStatisticsResponse,
} from '../../types/wrong-question';
import { getAuthStateSummary, redirectToLogin } from '../../utils/auth';
import { formatLearningTimestamp } from '../../utils/time';
import {
  formatWrongQuestionCount,
  formatWrongQuestionSource,
  formatWrongQuestionType,
  getWrongQuestionSourceClassName,
} from '../../utils/wrong-question';
import { request, RequestError } from '../../utils/request';

type PageState = 'loading' | 'success' | 'empty' | 'error' | 'unauthorized';
type StatisticsState = 'loading' | 'success' | 'error';

type WrongQuestionStatisticsCard = {
  totalWrongQuestionsText: string;
  totalWrongAnswersText: string;
  courseCountText: string;
  latestWrongAtText: string;
};

type WrongQuestionListCard = WrongQuestionListItem & {
  sourceText: string;
  sourceClassName: string;
  questionTypeText: string;
  questionContentText: string;
  wrongCountText: string;
  lastWrongAtText: string;
  courseTagText: string;
  chapterTagText: string;
};

type WrongQuestionPageData = {
  state: PageState;
  statisticsState: StatisticsState;
  errorTitle: string;
  errorMessage: string;
  statisticsErrorMessage: string;
  loadMoreErrorMessage: string;
  emptyTitle: string;
  emptyMessage: string;
  statistics: WrongQuestionStatisticsCard | null;
  items: WrongQuestionListCard[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
  isLoadingMore: boolean;
  isRefreshing: boolean;
};

type WrongQuestionPageMethods = {
  ensureAuthenticated(): boolean;
  buildRedirectPath(): string;
  loadInitialData(): Promise<void>;
  loadStatistics(): Promise<void>;
  loadList(options: { page: number; replace: boolean }): Promise<void>;
  refreshPage(): Promise<void>;
  loadMore(): Promise<void>;
  handleRetry(): void;
  handleStatisticsRetry(): void;
  handleLoadMoreRetry(): void;
  handleBack(): void;
  handleOpenDetail(event: WechatMiniprogram.BaseEvent<{ questionId?: string }>): void;
  buildQuery(page: number): WrongQuestionListQuery;
  mapStatistics(data: WrongQuestionStatisticsResponse): WrongQuestionStatisticsCard;
  mapListItem(item: WrongQuestionListItem): WrongQuestionListCard;
  getReadableError(error: unknown): {
    title: string;
    message: string;
    state: PageState;
  };
};

const PAGE_SIZE = 10;
const EMPTY_TITLE = '还没有错题记录';
const EMPTY_MESSAGE = '完成课程测验后，答错的题目会出现在这里。';

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

let isPageActive = false;
let listRequestCount = 0;
let statisticsRequestCount = 0;
let listRequestSerial = 0;
let statisticsRequestSerial = 0;

Page<WrongQuestionPageData, WrongQuestionPageMethods>({
  data: {
    state: 'loading',
    statisticsState: 'loading',
    errorTitle: '',
    errorMessage: '',
    statisticsErrorMessage: '',
    loadMoreErrorMessage: '',
    emptyTitle: EMPTY_TITLE,
    emptyMessage: EMPTY_MESSAGE,
    statistics: null,
    items: [],
    page: 1,
    pageSize: PAGE_SIZE,
    total: 0,
    totalPages: 0,
    hasMore: false,
    isLoadingMore: false,
    isRefreshing: false,
  },

  onLoad() {
    isPageActive = true;
    void this.loadInitialData();
  },

  onUnload() {
    isPageActive = false;
    listRequestSerial += 1;
    statisticsRequestSerial += 1;
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
      errorTitle: '登录已失效',
      errorMessage: '请先登录后再查看我的错题。',
    });

    redirectToLogin(this.buildRedirectPath());
    return false;
  },

  buildRedirectPath() {
    return '/pages/wrong-question/index';
  },

  async loadInitialData() {
    if (!this.ensureAuthenticated()) {
      return;
    }

    await Promise.allSettled([this.loadStatistics(), this.loadList({ page: 1, replace: true })]);
  },

  async loadStatistics() {
    if (statisticsRequestCount > 0) {
      return;
    }

    const currentRequestSerial = ++statisticsRequestSerial;
    statisticsRequestCount += 1;

    this.setData({
      statisticsState: 'loading',
      statisticsErrorMessage: '',
    });

    try {
      const response = await request<WrongQuestionStatisticsResponse>({
        url: '/users/me/wrong-questions/statistics',
        method: 'GET',
        authMode: 'required',
      });

      if (!isPageActive || currentRequestSerial !== statisticsRequestSerial) {
        return;
      }

      this.setData({
        statisticsState: 'success',
        statisticsErrorMessage: '',
        statistics: this.mapStatistics(response),
      });
    } catch (error) {
      if (!isPageActive || currentRequestSerial !== statisticsRequestSerial) {
        return;
      }

      const readable = this.getReadableError(error);

      this.setData({
        statisticsState: 'error',
        statisticsErrorMessage: readable.message,
        statistics: null,
      });
    } finally {
      statisticsRequestCount = Math.max(0, statisticsRequestCount - 1);
    }
  },

  async loadList({ page, replace }: { page: number; replace: boolean }) {
    if (!replace && listRequestCount > 0) {
      return;
    }

    if (!this.ensureAuthenticated()) {
      return;
    }

    const currentRequestSerial = ++listRequestSerial;
    listRequestCount += 1;

    if (replace) {
      this.setData({
        state: 'loading',
        errorTitle: '',
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
      const response = await request<WrongQuestionListResponse>({
        url: '/users/me/wrong-questions',
        method: 'GET',
        data: this.buildQuery(page) as WechatMiniprogram.IAnyObject,
        authMode: 'required',
      });

      if (!isPageActive || currentRequestSerial !== listRequestSerial) {
        return;
      }

      const mappedItems = response.items.map((item) => this.mapListItem(item));
      const items = replace ? mappedItems : [...this.data.items, ...mappedItems];
      const hasMore = response.pagination.page < response.pagination.totalPages;

      this.setData({
        state: items.length > 0 ? 'success' : 'empty',
        errorTitle: '',
        errorMessage: '',
        emptyTitle: EMPTY_TITLE,
        emptyMessage: EMPTY_MESSAGE,
        items,
        page: response.pagination.page,
        pageSize: response.pagination.pageSize,
        total: response.pagination.total,
        totalPages: response.pagination.totalPages,
        hasMore,
        isLoadingMore: false,
        isRefreshing: false,
      });
    } catch (error) {
      if (!isPageActive || currentRequestSerial !== listRequestSerial) {
        return;
      }

      const readable = this.getReadableError(error);

      if (replace) {
        this.setData({
          state: readable.state,
          errorTitle: readable.title,
          errorMessage: readable.message,
          items: [],
          page: 1,
          total: 0,
          totalPages: 0,
          hasMore: false,
          isLoadingMore: false,
          isRefreshing: false,
          loadMoreErrorMessage: '',
        });
      } else {
        this.setData({
          isLoadingMore: false,
          loadMoreErrorMessage: readable.message,
        });
      }
    } finally {
      listRequestCount = Math.max(0, listRequestCount - 1);
    }
  },

  async refreshPage() {
    if (!this.ensureAuthenticated()) {
      wx.stopPullDownRefresh();
      return;
    }

    this.setData({
      isRefreshing: true,
    });

    await Promise.allSettled([this.loadStatistics(), this.loadList({ page: 1, replace: true })]);

    if (isPageActive) {
      this.setData({
        isRefreshing: false,
      });
    }

    wx.stopPullDownRefresh();
  },

  async loadMore() {
    if (!this.ensureAuthenticated() || listRequestCount > 0 || !this.data.hasMore) {
      return;
    }

    await this.loadList({
      page: this.data.page + 1,
      replace: false,
    });
  },

  handleRetry() {
    void this.loadInitialData();
  },

  handleStatisticsRetry() {
    void this.loadStatistics();
  },

  handleLoadMoreRetry() {
    void this.loadMore();
  },

  handleBack() {
    if (getCurrentPages().length > 1) {
      wx.navigateBack({
        delta: 1,
      });
      return;
    }

    wx.reLaunch({
      url: '/pages/profile/index',
    });
  },

  handleOpenDetail(event: WechatMiniprogram.BaseEvent<{ questionId?: string }>) {
    const questionId = event.currentTarget.dataset.questionId;

    if (!isNonEmptyString(questionId)) {
      wx.showToast({
        title: '题目参数无效',
        icon: 'none',
      });
      return;
    }

    wx.navigateTo({
      url: `/pages/wrong-question/detail?questionId=${encodeURIComponent(questionId)}`,
    });
  },

  buildQuery(page: number) {
    const query: WrongQuestionListQuery = {
      page,
      pageSize: PAGE_SIZE,
    };

    return query;
  },

  mapStatistics(data: WrongQuestionStatisticsResponse) {
    return {
      totalWrongQuestionsText: String(Math.max(0, Math.floor(data.totalWrongQuestions))),
      totalWrongAnswersText: String(Math.max(0, Math.floor(data.totalWrongAnswers))),
      courseCountText: String(Math.max(0, Math.floor(data.courseCount))),
      latestWrongAtText: data.latestWrongAt
        ? formatLearningTimestamp(data.latestWrongAt)
        : '暂无最近错题时间',
    };
  },

  mapListItem(item: WrongQuestionListItem) {
    return {
      ...item,
      sourceText: formatWrongQuestionSource('LEARNING'),
      sourceClassName: getWrongQuestionSourceClassName('LEARNING'),
      questionTypeText: formatWrongQuestionType(item.questionType),
      questionContentText: item.questionContent.trim() || '题干内容暂缺',
      wrongCountText: formatWrongQuestionCount(item.wrongCount),
      lastWrongAtText: formatLearningTimestamp(item.lastWrongAt),
      courseTagText: item.courseTitle.trim() || '课程名称暂缺',
      chapterTagText: item.chapterTitle.trim() || '章节名称暂缺',
    };
  },

  getReadableError(error: unknown) {
    if (error instanceof RequestError) {
      if (error.statusCode === 404 || error.code === 'WRONG_QUESTION_NOT_FOUND') {
        return {
          title: EMPTY_TITLE,
          message: EMPTY_MESSAGE,
          state: 'empty' as const,
        };
      }

      if (error.statusCode === 401 || error.code === 'UNAUTHORIZED') {
        return {
          title: '登录已失效',
          message: '登录状态已失效，请重新登录后再查看我的错题。',
          state: 'unauthorized' as const,
        };
      }

      if (error.code === 'NETWORK_ERROR') {
        return {
          title: '加载失败',
          message: error.message,
          state: 'error' as const,
        };
      }

      return {
        title: '加载失败',
        message: error.message,
        state: 'error' as const,
      };
    }

    if (error instanceof Error) {
      return {
        title: '加载失败',
        message: error.message,
        state: 'error' as const,
      };
    }

    return {
      title: '加载失败',
      message: '请稍后重试。',
      state: 'error' as const,
    };
  },
});
