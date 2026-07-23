import type { CourseDetailData } from '../../types/course';
import type {
  CourseProgressChapter,
  CourseProgressResponse,
  LearningStatus,
} from '../../types/learning';
import { getAuthStateSummary, redirectToLogin } from '../../utils/auth';
import { request, RequestError } from '../../utils/request';
import { formatLearningTimestamp } from '../../utils/time';

type PageState = 'loading' | 'success' | 'invalid' | 'notFound' | 'error';

type CourseMetaCard = {
  courseId: string;
  courseName: string;
  coverUrl: string | null;
  progressPercentClamped: number;
  progressPercentText: string;
  completedChapterText: string;
  statusText: string;
  statusClassName: string;
  lastLearnedChapterText: string;
  lastLearnedAtText: string;
  startedAtText: string;
  completedAtText: string;
  primaryActionText: string;
  primaryActionDisabled: boolean;
  primaryActionChapterId: string;
  coverFallbackText: string;
};

type CourseProgressChapterCard = CourseProgressChapter & {
  indexText: string;
  titleText: string;
  statusText: string;
  statusClassName: string;
  startedAtText: string;
  completedAtText: string;
  isActionable: boolean;
  isCurrentTarget: boolean;
};

type CourseProgressPageData = {
  state: PageState;
  errorTitle: string;
  errorMessage: string;
  courseId: string;
  isRefreshing: boolean;
  isPrimaryActionLoading: boolean;
  hasChapters: boolean;
  noChapterMessage: string;
  course: CourseMetaCard | null;
  chapters: CourseProgressChapterCard[];
};

type CourseProgressPageMethods = {
  validateCourseId(value: string): boolean;
  ensureAuthenticated(): boolean;
  loadProgress(forceRefresh?: boolean): Promise<void>;
  handleRetry(): void;
  handleBack(): void;
  handlePrimaryAction(): void;
  handleChapterTap(
    event: WechatMiniprogram.BaseEvent<{
      chapterId?: string;
      courseId?: string;
    }>,
  ): void;
  handleOpenCourseDetail(): void;
  mapCourseState(
    courseId: string,
    progress: CourseProgressResponse,
    courseDetail: CourseDetailData,
  ): {
    course: CourseMetaCard;
    chapters: CourseProgressChapterCard[];
  };
  buildChapterCards(
    chapters: CourseProgressChapter[],
    targetChapterId: string,
  ): CourseProgressChapterCard[];
  selectPrimaryChapterId(progress: CourseProgressResponse): string;
  getStatusText(status: LearningStatus): string;
  getStatusClassName(status: LearningStatus): string;
  getPrimaryActionText(status: LearningStatus): string;
  getReadableError(error: unknown): { title: string; message: string; state: PageState };
};

function clampProgressPercent(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round(value)));
}

function formatCoverFallback(name: string) {
  const trimmed = name.trim();

  if (!trimmed) {
    return '课程';
  }

  return trimmed.slice(0, 2);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function decodeQueryValue(value: string) {
  try {
    return decodeURIComponent(value).trim();
  } catch {
    return value.trim();
  }
}

let isPageActive = false;
let isRequesting = false;
let hasLoadedOnce = false;
let hasShownOnce = false;
let requestSerial = 0;

Page<CourseProgressPageData, CourseProgressPageMethods>({
  data: {
    state: 'loading',
    errorTitle: '',
    errorMessage: '',
    courseId: '',
    isRefreshing: false,
    isPrimaryActionLoading: false,
    hasChapters: false,
    noChapterMessage: '该课程暂未发布章节',
    course: null,
    chapters: [],
  },

  onLoad(query) {
    isPageActive = true;
    hasLoadedOnce = false;
    hasShownOnce = false;

    const rawCourseId =
      typeof query.courseId === 'string' ? decodeQueryValue(query.courseId) : '';

    if (!isNonEmptyString(rawCourseId) || !this.validateCourseId(rawCourseId)) {
      this.setData({
        state: 'invalid',
        errorTitle: '课程参数无效',
        errorMessage: '当前页面缺少有效的 courseId，无法加载课程学习进度。',
        courseId: '',
        course: null,
        chapters: [],
        hasChapters: false,
      });
      return;
    }

    this.setData({
      courseId: rawCourseId,
    });

    void this.loadProgress(true);
  },

  onShow() {
    if (!hasShownOnce) {
      hasShownOnce = true;
      return;
    }

    if (hasLoadedOnce && isPageActive && !isRequesting && this.data.courseId) {
      void this.loadProgress(false);
    }
  },

  onUnload() {
    isPageActive = false;
    requestSerial += 1;
  },

  onPullDownRefresh() {
    void this.loadProgress(true);
  },

  validateCourseId(value: string) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    );
  },

  ensureAuthenticated() {
    const authState = getAuthStateSummary();

    if (authState.isAuthenticated) {
      return true;
    }

    if (this.data.courseId) {
      redirectToLogin(
        `/pages/learning/course-progress?courseId=${encodeURIComponent(this.data.courseId)}`,
      );
    } else {
      redirectToLogin('/pages/learning/index');
    }

    return false;
  },

  async loadProgress(forceRefresh = false) {
    if (!this.data.courseId) {
      wx.stopPullDownRefresh();
      return;
    }

    if (!this.ensureAuthenticated()) {
      wx.stopPullDownRefresh();
      return;
    }

    if (isRequesting) {
      wx.stopPullDownRefresh();
      return;
    }

    const currentRequestSerial = ++requestSerial;
    isRequesting = true;

    this.setData({
      state: 'loading',
      errorTitle: '',
      errorMessage: '',
      isRefreshing: forceRefresh,
    });

    try {
      const [progress, courseDetail] = await Promise.all([
        request<CourseProgressResponse>({
          url: `/courses/${this.data.courseId}/progress`,
          method: 'GET',
          authMode: 'required',
        }),
        request<CourseDetailData>({
          url: `/courses/${this.data.courseId}`,
          method: 'GET',
          authMode: 'required',
        }),
      ]);

      if (!isPageActive || currentRequestSerial !== requestSerial) {
        return;
      }

      const mapped = this.mapCourseState(this.data.courseId, progress, courseDetail);

      this.setData({
        state: 'success',
        errorTitle: '',
        errorMessage: '',
        isRefreshing: false,
        isPrimaryActionLoading: false,
        course: mapped.course,
        chapters: mapped.chapters,
        hasChapters: mapped.chapters.length > 0,
      });

      hasLoadedOnce = true;
    } catch (error) {
      if (!isPageActive || currentRequestSerial !== requestSerial) {
        return;
      }

      const readable = this.getReadableError(error);

      this.setData({
        state: readable.state,
        errorTitle: readable.title,
        errorMessage: readable.message,
        course: null,
        chapters: [],
        hasChapters: false,
        isRefreshing: false,
        isPrimaryActionLoading: false,
      });

      hasLoadedOnce = true;
    } finally {
      isRequesting = false;
      wx.stopPullDownRefresh();
    }
  },

  handleRetry() {
    if (!this.data.courseId) {
      return;
    }

    void this.loadProgress(false);
  },

  handleBack() {
    if (getCurrentPages().length > 1) {
      wx.navigateBack({
        delta: 1,
      });
      return;
    }

    wx.reLaunch({
      url: '/pages/learning/index',
    });
  },

  handlePrimaryAction() {
    if (
      !this.data.course ||
      this.data.isPrimaryActionLoading ||
      !this.data.course.primaryActionChapterId
    ) {
      if (!this.data.course?.primaryActionChapterId) {
        wx.showToast({
          title: '暂无可学习章节',
          icon: 'none',
        });
      }
      return;
    }

    this.setData({
      isPrimaryActionLoading: true,
    });

    wx.navigateTo({
      url: `/pages/chapter/detail?chapterId=${encodeURIComponent(
        this.data.course.primaryActionChapterId,
      )}`,
      complete: () => {
        if (!isPageActive) {
          return;
        }

        this.setData({
          isPrimaryActionLoading: false,
        });
      },
    });
  },

  handleChapterTap(
    event: WechatMiniprogram.BaseEvent<{
      chapterId?: string;
      courseId?: string;
    }>,
  ) {
    const chapterId = event.currentTarget.dataset.chapterId;

    if (!isNonEmptyString(chapterId)) {
      wx.showToast({
        title: '当前章节参数无效',
        icon: 'none',
      });
      return;
    }

    wx.navigateTo({
      url: `/pages/chapter/detail?chapterId=${encodeURIComponent(chapterId)}`,
    });
  },

  handleOpenCourseDetail() {
    if (!this.data.courseId) {
      return;
    }

    wx.navigateTo({
      url: `/pages/course/detail?courseId=${encodeURIComponent(this.data.courseId)}`,
    });
  },

  mapCourseState(
    courseId: string,
    progress: CourseProgressResponse,
    courseDetail: CourseDetailData,
  ) {
    const progressPercent = clampProgressPercent(progress.progressPercent);
    const totalChapterCount =
      progress.totalChapterCount < 0 ? 0 : progress.totalChapterCount;
    const completedChapterCount =
      progress.completedChapterCount < 0 ? 0 : progress.completedChapterCount;
    const primaryActionChapterId = this.selectPrimaryChapterId(progress);
    const chapters = this.buildChapterCards(progress.chapters, primaryActionChapterId);

    return {
      course: {
        courseId,
        courseName: courseDetail.title,
        coverUrl: courseDetail.coverUrl,
        progressPercentClamped: progressPercent,
        progressPercentText: `${progressPercent}%`,
        completedChapterText: `${completedChapterCount} / ${totalChapterCount} 章节`,
        statusText: this.getStatusText(progress.status),
        statusClassName: this.getStatusClassName(progress.status),
        lastLearnedChapterText: progress.lastLearnedChapter
          ? progress.lastLearnedChapter.title
          : '暂无最近学习章节',
        lastLearnedAtText: formatLearningTimestamp(progress.lastLearnedAt),
        startedAtText: formatLearningTimestamp(progress.startedAt),
        completedAtText: formatLearningTimestamp(progress.completedAt),
        primaryActionText: this.getPrimaryActionText(progress.status),
        primaryActionDisabled: primaryActionChapterId.length === 0,
        primaryActionChapterId,
        coverFallbackText: formatCoverFallback(courseDetail.title),
      },
      chapters,
    };
  },

  buildChapterCards(
    chapters: CourseProgressChapter[],
    targetChapterId: string,
  ) {
    return [...chapters]
      .map((chapter, index) => ({
        ...chapter,
        __index: index,
      }))
      .sort((left, right) => {
        const leftOrder = Number.isFinite(left.sortOrder)
          ? left.sortOrder
          : Number.MAX_SAFE_INTEGER;
        const rightOrder = Number.isFinite(right.sortOrder)
          ? right.sortOrder
          : Number.MAX_SAFE_INTEGER;

        if (leftOrder !== rightOrder) {
          return leftOrder - rightOrder;
        }

        return left.__index - right.__index;
      })
      .map((chapter, index) => ({
        chapterId: chapter.chapterId,
        title: chapter.title,
        sortOrder: chapter.sortOrder,
        status: chapter.status,
        startedAt: chapter.startedAt,
        completedAt: chapter.completedAt,
        indexText: `第 ${index + 1} 节`,
        titleText: chapter.title.trim() || '未命名章节',
        statusText: this.getStatusText(chapter.status),
        statusClassName: this.getStatusClassName(chapter.status),
        startedAtText: formatLearningTimestamp(chapter.startedAt),
        completedAtText: formatLearningTimestamp(chapter.completedAt),
        isActionable: isNonEmptyString(chapter.chapterId),
        isCurrentTarget: chapter.chapterId === targetChapterId,
      }));
  },

  selectPrimaryChapterId(progress: CourseProgressResponse) {
    if (progress.lastLearnedChapter?.chapterId) {
      return progress.lastLearnedChapter.chapterId;
    }

    const firstIncompleteChapter = progress.chapters.find(
      (chapter) => chapter.status !== 'COMPLETED' && isNonEmptyString(chapter.chapterId),
    );

    if (firstIncompleteChapter) {
      return firstIncompleteChapter.chapterId;
    }

    const sortedChapters = [...progress.chapters]
      .filter((chapter) => isNonEmptyString(chapter.chapterId))
      .sort((left, right) => {
        const leftOrder = Number.isFinite(left.sortOrder)
          ? left.sortOrder
          : Number.MAX_SAFE_INTEGER;
        const rightOrder = Number.isFinite(right.sortOrder)
          ? right.sortOrder
          : Number.MAX_SAFE_INTEGER;

        if (leftOrder !== rightOrder) {
          return leftOrder - rightOrder;
        }

        return left.chapterId.localeCompare(right.chapterId);
      })
    const lastChapter =
      sortedChapters.length > 0
        ? sortedChapters[sortedChapters.length - 1]
        : null;

    return lastChapter?.chapterId ?? '';
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

  getPrimaryActionText(status: LearningStatus) {
    if (status === 'COMPLETED') {
      return '再次查看';
    }

    if (status === 'LEARNING') {
      return '继续学习';
    }

    return '开始学习';
  },

  getReadableError(error: unknown) {
    if (error instanceof RequestError) {
      if (error.code === 'COURSE_NOT_FOUND') {
        return {
          title: '课程不存在或不可访问',
          message: '当前课程不存在，或你暂时没有权限查看该课程的学习进度。',
          state: 'notFound' as const,
        };
      }

      if (error.code === 'INVALID_PARAMETER') {
        return {
          title: '课程参数无效',
          message: '当前课程参数无效，无法读取学习进度。',
          state: 'invalid' as const,
        };
      }

      if (error.code === 'NETWORK_ERROR') {
        return {
          title: '网络请求失败',
          message: error.message,
          state: 'error' as const,
        };
      }

      return {
        title: '课程进度加载失败',
        message: error.message,
        state: 'error' as const,
      };
    }

    if (error instanceof Error) {
      return {
        title: '课程进度加载失败',
        message: error.message,
        state: 'error' as const,
      };
    }

    return {
      title: '课程进度加载失败',
      message: '请稍后重试。',
      state: 'error' as const,
    };
  },
});
