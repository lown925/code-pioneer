import type { CourseListData, CourseListItem } from '../../types/course';
import type {
  LearningCourseItem,
  LearningListQuery,
  LearningListResponse,
  LearningSummaryResponse,
  LearningStatus,
} from '../../types/learning';
import { getAuthStateSummary, redirectToLogin } from '../../utils/auth';
import { formatDifficulty, formatMinutes } from '../../utils/course';
import { formatLearningTimestamp } from '../../utils/time';
import { request, RequestError } from '../../utils/request';

type LearningFilterKey = 'ALL' | 'LEARNING' | 'COMPLETED';
type ProgressState = 'guest' | 'loading' | 'success' | 'empty' | 'error';
type RecommendationState = 'loading' | 'success' | 'empty' | 'error';

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

type RecommendedCourseCard = CourseListItem & {
  difficultyText: string;
  estimatedMinutesText: string;
};

type LearningSummaryCard = {
  inProgressCourseCountText: string;
  completedCourseCountText: string;
  completedChapterCountText: string;
  totalQuizAnswerCountText: string;
  quizAccuracyPercentText: string;
  continueCourseName: string;
  continueCourseProgressText: string;
  continueCourseMetaText: string;
  continueCourseActionText: string;
  continueCourseId: string;
};

type LearningPageData = {
  progressState: ProgressState;
  progressErrorMessage: string;
  progressEmptyMessage: string;
  loadMoreErrorMessage: string;
  activeFilter: LearningFilterKey;
  filterTabs: LearningFilterTab[];
  learningItems: LearningCourseCard[];
  learningPage: number;
  learningPageSize: number;
  learningTotal: number;
  learningTotalPages: number;
  learningHasMore: boolean;
  isLoadingMore: boolean;
  isRefreshing: boolean;
  isAuthenticated: boolean;
  showLearningLoginHint: boolean;
  isSummaryLoading: boolean;
  learningSummaryErrorMessage: string;
  learningSummary: LearningSummaryCard | null;
  recommendationState: RecommendationState;
  recommendationErrorMessage: string;
  recommendedCourses: RecommendedCourseCard[];
};

type LearningPageMethods = {
  syncAuthState(): boolean;
  loadPageData(forceRefresh?: boolean): Promise<void>;
  loadLearningSummary(): Promise<void>;
  loadRecommendedCourses(): Promise<void>;
  loadLearningFirstPage(): Promise<void>;
  loadMoreLearning(): Promise<void>;
  refreshPage(): Promise<void>;
  fetchLearningList(options: {
    page: number;
    replace: boolean;
    showPullDownRefresh?: boolean;
  }): Promise<void>;
  handleFilterTap(
    event: WechatMiniprogram.BaseEvent<{ filterKey: LearningFilterKey }>,
  ): void;
  handleProgressRetry(): void;
  handleRecommendationRetry(): void;
  handleLoadMoreRetry(): void;
  handleLearningLogin(): void;
  handleContinueLearning(): void;
  openCourseProgress(
    event: WechatMiniprogram.BaseEvent<{ courseId: string }>,
  ): void;
  openCourseList(): void;
  openCourseDetail(
    event: WechatMiniprogram.BaseEvent<{ courseId: string }>,
  ): void;
  buildLearningQuery(page: number): LearningListQuery;
  mapLearningCourseItem(item: LearningCourseItem): LearningCourseCard;
  mapRecommendedCourse(item: CourseListItem): RecommendedCourseCard;
  getStatusText(status: LearningStatus): string;
  getStatusClassName(status: LearningStatus): string;
  getActionText(status: LearningStatus): string;
  getEmptyMessage(filter: LearningFilterKey): string;
  getReadableLearningError(error: unknown): string;
  getReadableRecommendationError(error: unknown): string;
};

const PAGE_SIZE = 10;
const LEARNING_FILTER_STORAGE_KEY = 'code-pioneer.learning.initial-filter';

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

function formatCount(value: number) {
  return String(Math.max(0, Math.floor(value)));
}

function readPendingInitialFilter(): LearningFilterKey | null {
  try {
    const value = wx.getStorageSync(LEARNING_FILTER_STORAGE_KEY);

    if (value === 'LEARNING' || value === 'COMPLETED' || value === 'ALL') {
      wx.removeStorageSync(LEARNING_FILTER_STORAGE_KEY);
      return value;
    }
  } catch {
    return null;
  }

  return null;
}

let isPageActive = false;
let isLearningRequesting = false;
let isRecommendationRequesting = false;
let isSummaryRequesting = false;
let hasLoadedOnce = false;
let learningRequestSerial = 0;
let recommendationRequestSerial = 0;
let summaryRequestSerial = 0;

Page<LearningPageData, LearningPageMethods>({
  data: {
    progressState: 'loading',
    progressErrorMessage: '',
    progressEmptyMessage: '还没有学习记录',
    loadMoreErrorMessage: '',
    activeFilter: 'ALL',
    filterTabs: FILTER_TABS,
    learningItems: [],
    learningPage: 1,
    learningPageSize: PAGE_SIZE,
    learningTotal: 0,
    learningTotalPages: 0,
    learningHasMore: false,
    isLoadingMore: false,
    isRefreshing: false,
    isAuthenticated: false,
    showLearningLoginHint: false,
    isSummaryLoading: false,
    learningSummaryErrorMessage: '',
    learningSummary: null,
    recommendationState: 'loading',
    recommendationErrorMessage: '',
    recommendedCourses: [],
  },

  onLoad() {
    isPageActive = true;
    const pendingFilter = readPendingInitialFilter();

    if (pendingFilter) {
      this.setData({
        activeFilter: pendingFilter,
        progressEmptyMessage: this.getEmptyMessage(pendingFilter),
      });
    }

    void this.loadPageData(true);
  },

  onShow() {
    isPageActive = true;
    const pendingFilter = readPendingInitialFilter();

    if (pendingFilter && pendingFilter !== this.data.activeFilter) {
      this.setData({
        activeFilter: pendingFilter,
        progressEmptyMessage: this.getEmptyMessage(pendingFilter),
      });

      if (this.data.isAuthenticated) {
        void this.fetchLearningList({
          page: 1,
          replace: true,
          showPullDownRefresh: false,
        });
      }
    }

    if (!hasLoadedOnce) {
      void this.loadPageData(true);
      return;
    }

    const authChanged = this.data.isAuthenticated !== getAuthStateSummary().isAuthenticated;

    if (authChanged) {
      void this.loadPageData(true);
      return;
    }

    if (!isLearningRequesting && this.data.isAuthenticated) {
      void Promise.allSettled([
        this.loadLearningSummary(),
        this.loadLearningFirstPage(),
      ]);
    }
  },

  onUnload() {
    isPageActive = false;
    learningRequestSerial += 1;
    recommendationRequestSerial += 1;
    summaryRequestSerial += 1;
  },

  onPullDownRefresh() {
    void this.refreshPage();
  },

  onReachBottom() {
    void this.loadMoreLearning();
  },

  syncAuthState() {
    const isAuthenticated = getAuthStateSummary().isAuthenticated;

    this.setData({
      isAuthenticated,
      showLearningLoginHint: !isAuthenticated,
    });

    return isAuthenticated;
  },

  async loadPageData(forceRefresh = false) {
    const isAuthenticated = this.syncAuthState();

    await this.loadRecommendedCourses();

    if (isAuthenticated) {
      await Promise.allSettled([
        this.loadLearningSummary(),
        this.loadLearningFirstPage(),
      ]);
    } else if (isPageActive) {
      this.setData({
        progressState: 'guest',
        progressErrorMessage: '',
        progressEmptyMessage: this.getEmptyMessage(this.data.activeFilter),
        loadMoreErrorMessage: '',
        learningItems: [],
        learningPage: 1,
        learningTotal: 0,
        learningTotalPages: 0,
        learningHasMore: false,
        isLoadingMore: false,
        isRefreshing: false,
        isSummaryLoading: false,
        learningSummaryErrorMessage: '',
        learningSummary: null,
      });
    }

    if (forceRefresh) {
      hasLoadedOnce = true;
    }
  },

  async loadLearningSummary() {
    if (!this.syncAuthState()) {
      return;
    }

    if (isSummaryRequesting) {
      return;
    }

    const currentRequestSerial = ++summaryRequestSerial;
    isSummaryRequesting = true;

    this.setData({
      isSummaryLoading: true,
      learningSummaryErrorMessage: '',
    });

    try {
      const result = await request<LearningSummaryResponse>({
        url: '/users/me/learning-summary',
        authMode: 'required',
      });

      if (!isPageActive || currentRequestSerial !== summaryRequestSerial) {
        return;
      }

      const continueCourse = result.continueLearningCourse;

      this.setData({
        isSummaryLoading: false,
        learningSummaryErrorMessage: '',
        learningSummary: {
          inProgressCourseCountText: formatCount(result.inProgressCourseCount),
          completedCourseCountText: formatCount(result.completedCourseCount),
          completedChapterCountText: formatCount(result.completedChapterCount),
          totalQuizAnswerCountText: formatCount(result.totalQuizAnswerCount),
          quizAccuracyPercentText: `${Math.max(
            0,
            Math.min(100, Math.round(result.quizAccuracyPercent)),
          )}%`,
          continueCourseName:
            continueCourse?.courseName?.trim() || '暂无继续学习课程',
          continueCourseProgressText: `${Math.max(
            0,
            Math.min(100, Math.round(continueCourse?.progressPercent ?? 0)),
          )}%`,
          continueCourseMetaText: continueCourse
            ? `${Math.max(0, continueCourse.completedChapterCount)} / ${Math.max(
                0,
                continueCourse.totalChapterCount,
              )} 章节`
            : '开始第一门课程后会显示这里',
          continueCourseActionText:
            continueCourse?.status === 'COMPLETED' ? '重新查看' : '继续学习',
          continueCourseId: continueCourse?.courseId ?? '',
        },
      });
    } catch (error) {
      if (!isPageActive || currentRequestSerial !== summaryRequestSerial) {
        return;
      }

      this.setData({
        isSummaryLoading: false,
        learningSummaryErrorMessage: this.getReadableLearningError(error),
        learningSummary: null,
      });
    } finally {
      isSummaryRequesting = false;
    }
  },

  async loadRecommendedCourses() {
    if (isRecommendationRequesting) {
      return;
    }

    const currentRequestSerial = ++recommendationRequestSerial;
    isRecommendationRequesting = true;

    this.setData({
      recommendationState: 'loading',
      recommendationErrorMessage: '',
    });

    try {
      const result = await request<CourseListData>({
        url: '/courses',
      });

      if (!isPageActive || currentRequestSerial !== recommendationRequestSerial) {
        return;
      }

      const recommendedCourses = result.items.map((course) =>
        this.mapRecommendedCourse(course),
      );

      this.setData({
        recommendationState:
          recommendedCourses.length > 0 ? 'success' : 'empty',
        recommendationErrorMessage: '',
        recommendedCourses,
      });
    } catch (error) {
      if (!isPageActive || currentRequestSerial !== recommendationRequestSerial) {
        return;
      }

      this.setData({
        recommendationState: 'error',
        recommendationErrorMessage: this.getReadableRecommendationError(error),
        recommendedCourses: [],
      });
    } finally {
      isRecommendationRequesting = false;
    }
  },

  async loadLearningFirstPage() {
    if (!this.syncAuthState()) {
      return;
    }

    await this.fetchLearningList({
      page: 1,
      replace: true,
      showPullDownRefresh: false,
    });
  },

  async loadMoreLearning() {
    if (!this.syncAuthState() || isLearningRequesting) {
      return;
    }

    const nextPage = this.data.learningPage + 1;

    if (!this.data.learningHasMore || nextPage <= 1) {
      return;
    }

    await this.fetchLearningList({
      page: nextPage,
      replace: false,
      showPullDownRefresh: false,
    });
  },

  async refreshPage() {
    this.setData({
      isRefreshing: true,
    });

    await this.loadPageData(true);

    if (isPageActive) {
      this.setData({
        isRefreshing: false,
      });
    }

    wx.stopPullDownRefresh();
  },

  async fetchLearningList({
    page,
    replace,
    showPullDownRefresh,
  }: {
    page: number;
    replace: boolean;
    showPullDownRefresh?: boolean;
  }) {
    if (isLearningRequesting) {
      if (showPullDownRefresh) {
        wx.stopPullDownRefresh();
      }
      return;
    }

    if (!this.syncAuthState()) {
      if (showPullDownRefresh) {
        wx.stopPullDownRefresh();
      }
      return;
    }

    const currentRequestSerial = ++learningRequestSerial;
    const filter = this.data.activeFilter;
    const query = this.buildLearningQuery(page);

    isLearningRequesting = true;

    if (replace) {
      this.setData({
        progressState: 'loading',
        progressErrorMessage: '',
        progressEmptyMessage: this.getEmptyMessage(filter),
        loadMoreErrorMessage: '',
        learningItems: [],
        learningPage: 1,
        learningTotal: 0,
        learningTotalPages: 0,
        learningHasMore: false,
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

      if (!isPageActive || currentRequestSerial !== learningRequestSerial) {
        return;
      }

      const mappedItems = response.items.map((item) =>
        this.mapLearningCourseItem(item),
      );
      const learningItems = replace
        ? mappedItems
        : [...this.data.learningItems, ...mappedItems];
      const learningHasMore =
        response.pagination.page < response.pagination.totalPages;

      this.setData({
        progressState:
          learningItems.length > 0 ? 'success' : 'empty',
        progressErrorMessage: '',
        loadMoreErrorMessage: '',
        learningItems,
        learningPage: response.pagination.page,
        learningPageSize: response.pagination.pageSize,
        learningTotal: response.pagination.total,
        learningTotalPages: response.pagination.totalPages,
        learningHasMore,
        isLoadingMore: false,
        isRefreshing: false,
      });

      hasLoadedOnce = true;
    } catch (error) {
      if (!isPageActive || currentRequestSerial !== learningRequestSerial) {
        return;
      }

      const message = this.getReadableLearningError(error);

      if (replace) {
        this.setData({
          progressState: 'error',
          progressErrorMessage: message,
          progressEmptyMessage: this.getEmptyMessage(filter),
          learningItems: [],
          learningTotal: 0,
          learningTotalPages: 0,
          learningPage: 1,
          learningHasMore: false,
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
      isLearningRequesting = false;

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

    if (filterKey === this.data.activeFilter || isLearningRequesting) {
      return;
    }

    this.setData({
      activeFilter: filterKey,
      progressEmptyMessage: this.getEmptyMessage(filterKey),
    });

    if (!this.data.isAuthenticated) {
      return;
    }

    void this.fetchLearningList({
      page: 1,
      replace: true,
      showPullDownRefresh: false,
    });
  },

  handleProgressRetry() {
    if (!this.data.isAuthenticated) {
      this.handleLearningLogin();
      return;
    }

    void this.fetchLearningList({
      page: 1,
      replace: true,
      showPullDownRefresh: false,
    });
  },

  handleRecommendationRetry() {
    void this.loadRecommendedCourses();
  },

  handleLoadMoreRetry() {
    void this.loadMoreLearning();
  },

  handleLearningLogin() {
    redirectToLogin('/pages/learning/index');
  },

  handleContinueLearning() {
    const courseId = this.data.learningSummary?.continueCourseId ?? '';

    if (!courseId) {
      this.openCourseList();
      return;
    }

    wx.navigateTo({
      url: `/pages/learning/course-progress?courseId=${encodeURIComponent(courseId)}`,
    });
  },

  openCourseProgress(
    event: WechatMiniprogram.BaseEvent<{ courseId: string }>,
  ) {
    const courseId = event.currentTarget.dataset.courseId;

    if (!courseId) {
      return;
    }

    if (!this.data.isAuthenticated) {
      redirectToLogin('/pages/learning/index');
      return;
    }

    wx.navigateTo({
      url: `/pages/learning/course-progress?courseId=${encodeURIComponent(courseId)}`,
    });
  },

  openCourseList() {
    wx.navigateTo({
      url: '/pages/course/list',
    });
  },

  openCourseDetail(
    event: WechatMiniprogram.BaseEvent<{ courseId: string }>,
  ) {
    const courseId = event.currentTarget.dataset.courseId;

    if (!courseId) {
      return;
    }

    wx.navigateTo({
      url: `/pages/course/detail?courseId=${encodeURIComponent(courseId)}`,
    });
  },

  buildLearningQuery(page: number) {
    const query: LearningListQuery = {
      page,
      pageSize: PAGE_SIZE,
    };

    if (this.data.activeFilter !== 'ALL') {
      query.status = FILTER_TO_STATUS[this.data.activeFilter];
    }

    return query;
  },

  mapLearningCourseItem(item: LearningCourseItem) {
    const progressPercent = clampProgressPercent(item.progressPercent);
    const totalChapterCount =
      item.totalChapterCount < 0 ? 0 : item.totalChapterCount;
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

  mapRecommendedCourse(item: CourseListItem) {
    return {
      ...item,
      difficultyText: formatDifficulty(item.difficulty),
      estimatedMinutesText: formatMinutes(item.estimatedMinutes),
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
      return '暂时没有学习中的课程';
    }

    if (filter === 'COMPLETED') {
      return '暂时没有已完成课程';
    }

    return '还没有学习记录';
  },

  getReadableLearningError(error: unknown) {
    if (error instanceof RequestError) {
      if (error.code === 'NETWORK_ERROR') {
        return '网络连接失败，请确认后端服务已启动后重试';
      }

      if (error.statusCode === 401 || error.code === 'UNAUTHORIZED') {
        return '登录状态已失效，请重新登录后查看学习记录';
      }

      return '学习记录加载失败，请稍后重试';
    }

    if (error instanceof Error) {
      return '学习记录加载失败，请稍后重试';
    }

    return '学习记录加载失败，请稍后重试';
  },

  getReadableRecommendationError(error: unknown) {
    if (error instanceof RequestError && error.code === 'NETWORK_ERROR') {
      return '网络连接失败，请确认后端服务已启动后重试';
    }

    if (error instanceof Error) {
      return '课程加载失败，请稍后重试';
    }

    return '课程加载失败，请稍后重试';
  },
});
