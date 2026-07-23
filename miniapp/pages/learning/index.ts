import type {
  LearningCourseItem,
  LearningListQuery,
  LearningListResponse,
  LearningStatus,
} from '../../types/learning';
import { getAuthStateSummary, redirectToLogin } from '../../utils/auth';
import { formatLearningTimestamp } from '../../utils/time';
import { request, RequestError } from '../../utils/request';

type LearningFilterKey = 'ALL' | 'LEARNING' | 'COMPLETED';
type PageState = 'loading' | 'success' | 'empty' | 'error';

type LearningFilterTab = {
  key: LearningFilterKey;
  label: string;
};

type LearningCourseCard = LearningCourseItem & {
  progressPercentClamped: number;
  progressPercentText: string;
  completedChapterText: string;
  lastLearnedChapterText: string;
  lastLearnedAtText: string;
  statusText: string;
  statusClassName: string;
  actionText: string;
  coverFallbackText: string;
};

type LearningPageData = {
  state: PageState;
  errorMessage: string;
  emptyMessage: string;
  loadMoreErrorMessage: string;
  activeFilter: LearningFilterKey;
  filterTabs: LearningFilterTab[];
  items: LearningCourseCard[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
  isLoadingMore: boolean;
  isRefreshing: boolean;
};

type LearningPageMethods = {
  ensureAuthenticated(): boolean;
  loadFirstPage(forceRefresh?: boolean): Promise<void>;
  loadMore(): Promise<void>;
  refreshList(): Promise<void>;
  fetchList(options: {
    page: number;
    replace: boolean;
    showPullDownRefresh?: boolean;
  }): Promise<void>;
  handleFilterTap(
    event: WechatMiniprogram.BaseEvent<{ filterKey: LearningFilterKey }>,
  ): void;
  handleRetry(): void;
  handleLoadMoreRetry(): void;
  openCourseProgress(
    event: WechatMiniprogram.BaseEvent<{ courseId: string }>,
  ): void;
  buildQuery(page: number): LearningListQuery;
  mapCourseItem(item: LearningCourseItem): LearningCourseCard;
  getStatusText(status: LearningStatus): string;
  getStatusClassName(status: LearningStatus): string;
  getActionText(status: LearningStatus): string;
  getEmptyMessage(filter: LearningFilterKey): string;
};

const PAGE_SIZE = 10;

const FILTER_TABS: LearningFilterTab[] = [
  { key: 'ALL', label: '全部' },
  { key: 'LEARNING', label: '学习中' },
  { key: 'COMPLETED', label: '已完成' },
];

const FILTER_TO_STATUS: Record<
  Exclude<LearningFilterKey, 'ALL'>,
  Exclude<LearningStatus, 'NOT_STARTED'>
> = {
  LEARNING: 'LEARNING',
  COMPLETED: 'COMPLETED',
};

function clampProgressPercent(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round(value)));
}

function formatChapterCount(completed: number, total: number) {
  return `${completed}/${total}`;
}

function formatCoverFallback(name: string) {
  const trimmed = name.trim();

  if (!trimmed) {
    return '学习';
  }

  return trimmed.slice(0, 2);
}

let isPageActive = false;
let isRequesting = false;
let hasLoadedOnce = false;
let requestSerial = 0;

Page<LearningPageData, LearningPageMethods>({
  data: {
    state: 'loading',
    errorMessage: '',
    emptyMessage: '还没有学习记录',
    loadMoreErrorMessage: '',
    activeFilter: 'ALL',
    filterTabs: FILTER_TABS,
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
    void this.loadFirstPage(true);
  },

  onShow() {
    if (!hasLoadedOnce && isPageActive && !isRequesting) {
      void this.loadFirstPage(true);
    }
  },

  onUnload() {
    isPageActive = false;
    requestSerial += 1;
  },

  onPullDownRefresh() {
    void this.refreshList();
  },

  onReachBottom() {
    void this.loadMore();
  },

  ensureAuthenticated() {
    const authState = getAuthStateSummary();

    if (authState.isAuthenticated) {
      return true;
    }

    redirectToLogin('/pages/learning/index');
    return false;
  },

  async loadFirstPage(forceRefresh = false) {
    if (!this.ensureAuthenticated()) {
      return;
    }

    await this.fetchList({
      page: 1,
      replace: true,
      showPullDownRefresh: false,
    });

    if (forceRefresh) {
      hasLoadedOnce = true;
    }
  },

  async loadMore() {
    if (!this.ensureAuthenticated() || isRequesting) {
      return;
    }

    const nextPage = this.data.page + 1;

    if (!this.data.hasMore || nextPage <= 1) {
      return;
    }

    await this.fetchList({
      page: nextPage,
      replace: false,
      showPullDownRefresh: false,
    });
  },

  async refreshList() {
    if (!this.ensureAuthenticated()) {
      wx.stopPullDownRefresh();
      return;
    }

    await this.fetchList({
      page: 1,
      replace: true,
      showPullDownRefresh: true,
    });
  },

  async fetchList({
    page,
    replace,
    showPullDownRefresh,
  }: {
    page: number;
    replace: boolean;
    showPullDownRefresh?: boolean;
  }) {
    if (isRequesting) {
      if (showPullDownRefresh) {
        wx.stopPullDownRefresh();
      }
      return;
    }

    const currentRequestSerial = ++requestSerial;
    const filter = this.data.activeFilter;
    const query = this.buildQuery(page);

    isRequesting = true;

    if (replace) {
      this.setData({
        state: 'loading',
        errorMessage: '',
        emptyMessage: this.getEmptyMessage(filter),
        loadMoreErrorMessage: '',
        items: [],
        page: 1,
        total: 0,
        totalPages: 0,
        hasMore: false,
        isRefreshing: showPullDownRefresh,
        isLoadingMore: false,
      });
    } else {
      this.setData({
        loadMoreErrorMessage: '',
        isLoadingMore: true,
      });
    }

    try {
      const response = await request<LearningListResponse>({
        url: '/users/me/learning',
        method: 'GET',
        data: query as WechatMiniprogram.IAnyObject,
        authMode: 'required',
      });

      if (!isPageActive || currentRequestSerial !== requestSerial) {
        return;
      }

      const mappedItems = response.items.map((item) => this.mapCourseItem(item));
      const items = replace ? mappedItems : [...this.data.items, ...mappedItems];
      const hasMore = response.pagination.page < response.pagination.totalPages;

      this.setData({
        state: items.length > 0 ? 'success' : 'empty',
        errorMessage: '',
        loadMoreErrorMessage: '',
        items,
        page: response.pagination.page,
        pageSize: response.pagination.pageSize,
        total: response.pagination.total,
        totalPages: response.pagination.totalPages,
        hasMore,
        isLoadingMore: false,
        isRefreshing: false,
      });

      hasLoadedOnce = true;
    } catch (error) {
      if (!isPageActive || currentRequestSerial !== requestSerial) {
        return;
      }

      const message =
        error instanceof RequestError || error instanceof Error
          ? error.message
          : '学习记录加载失败，请稍后重试';

      if (replace) {
        this.setData({
          state: 'error',
          errorMessage: message,
          emptyMessage: this.getEmptyMessage(filter),
          items: [],
          total: 0,
          totalPages: 0,
          page: 1,
          hasMore: false,
          isLoadingMore: false,
          isRefreshing: false,
        });
        hasLoadedOnce = true;
      } else {
        this.setData({
          isLoadingMore: false,
          loadMoreErrorMessage: message,
        });
      }
    } finally {
      isRequesting = false;

      if (showPullDownRefresh) {
        wx.stopPullDownRefresh();
      }
    }
  },

  handleFilterTap(
    event: WechatMiniprogram.BaseEvent<{ filterKey: LearningFilterKey }>,
  ) {
    const filterKey = event.currentTarget.dataset.filterKey;

    if (
      filterKey !== 'ALL' &&
      filterKey !== 'LEARNING' &&
      filterKey !== 'COMPLETED'
    ) {
      return;
    }

    if (filterKey === this.data.activeFilter || isRequesting) {
      return;
    }

    this.setData({
      activeFilter: filterKey,
      emptyMessage: this.getEmptyMessage(filterKey),
    });

    void this.fetchList({
      page: 1,
      replace: true,
      showPullDownRefresh: false,
    });
  },

  handleRetry() {
    void this.fetchList({
      page: 1,
      replace: true,
      showPullDownRefresh: false,
    });
  },

  handleLoadMoreRetry() {
    void this.loadMore();
  },

  openCourseProgress(
    event: WechatMiniprogram.BaseEvent<{ courseId: string }>,
  ) {
    const courseId = event.currentTarget.dataset.courseId;

    if (!courseId) {
      return;
    }

    wx.navigateTo({
      url: `/pages/learning/course-progress?courseId=${encodeURIComponent(courseId)}`,
    });
  },

  buildQuery(page: number) {
    const query: LearningListQuery = {
      page,
      pageSize: PAGE_SIZE,
    };

    if (this.data.activeFilter !== 'ALL') {
      query.status = FILTER_TO_STATUS[this.data.activeFilter];
    }

    return query;
  },

  mapCourseItem(item: LearningCourseItem) {
    const progressPercent = clampProgressPercent(item.progressPercent);
    const totalChapterCount = item.totalChapterCount < 0 ? 0 : item.totalChapterCount;
    const completedChapterCount =
      item.completedChapterCount < 0 ? 0 : item.completedChapterCount;
    const lastLearnedChapterText = item.lastLearnedChapter
      ? item.lastLearnedChapter.title
      : '';

    return {
      ...item,
      progressPercent,
      progressPercentClamped: progressPercent,
      progressPercentText: `${progressPercent}%`,
      completedChapterText: `${formatChapterCount(
        completedChapterCount,
        totalChapterCount,
      )} 章节`,
      lastLearnedChapterText,
      lastLearnedAtText: formatLearningTimestamp(item.lastLearnedAt),
      statusText: this.getStatusText(item.status),
      statusClassName: this.getStatusClassName(item.status),
      actionText: this.getActionText(item.status),
      coverFallbackText: formatCoverFallback(item.courseName),
      totalChapterCount,
      completedChapterCount,
    };
  },

  getStatusText(status: LearningStatus) {
    if (status === 'LEARNING') {
      return '学习中';
    }

    if (status === 'COMPLETED') {
      return '已完成';
    }

    return '未开始';
  },

  getStatusClassName(status: LearningStatus) {
    if (status === 'LEARNING') {
      return 'status-learning';
    }

    if (status === 'COMPLETED') {
      return 'status-completed';
    }

    return 'status-not-started';
  },

  getActionText(status: LearningStatus) {
    if (status === 'COMPLETED') {
      return '查看进度';
    }

    if (status === 'LEARNING') {
      return '继续学习';
    }

    return '开始学习';
  },

  getEmptyMessage(filter: LearningFilterKey) {
    if (filter === 'LEARNING') {
      return '暂无学习中的课程';
    }

    if (filter === 'COMPLETED') {
      return '暂无已完成课程';
    }

    return '还没有学习记录';
  },
});
