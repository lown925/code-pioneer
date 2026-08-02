import type { LearningCourseItem, LearningListResponse } from '../../types/learning';
import { redirectToLogin } from '../../utils/auth';
import { request } from '../../utils/request';

type CourseView = LearningCourseItem & {
  progressText: string;
  chapterText: string;
  coverText: string;
  coverFailed: boolean;
  statusText: string;
};

type PageState = 'loading' | 'success' | 'empty' | 'error';

type MyCoursesPageData = {
  state: PageState;
  errorMessage: string;
  loadMoreErrorMessage: string;
  courses: CourseView[];
  page: number;
  totalPages: number;
  hasMore: boolean;
  isLoadingMore: boolean;
};

const PAGE_SIZE = 20;
let isPageActive = false;
let isRequesting = false;
let requestSerial = 0;

Page<MyCoursesPageData>({
  data: {
    state: 'loading',
    errorMessage: '',
    loadMoreErrorMessage: '',
    courses: [],
    page: 1,
    totalPages: 0,
    hasMore: false,
    isLoadingMore: false,
  },

  onLoad() {
    isPageActive = true;
  },

  onShow() {
    isPageActive = true;
    void this.loadCourses(1, true);
  },

  onUnload() {
    isPageActive = false;
    requestSerial += 1;
  },

  onPullDownRefresh() {
    void this.loadCourses(1, true).finally(() => wx.stopPullDownRefresh());
  },

  onReachBottom() {
    if (this.data.hasMore && !isRequesting) {
      void this.loadCourses(this.data.page + 1, false);
    }
  },

  async loadCourses(page = 1, replace = true) {
    if (isRequesting) {
      return;
    }

    const currentSerial = ++requestSerial;
    isRequesting = true;
    this.setData(
      replace
        ? {
            state: 'loading',
            errorMessage: '',
            loadMoreErrorMessage: '',
            isLoadingMore: false,
          }
        : { isLoadingMore: true, loadMoreErrorMessage: '' },
    );

    try {
      const response = await request<LearningListResponse>({
        url: '/users/me/learning',
        method: 'GET',
        data: { page, pageSize: PAGE_SIZE },
        authMode: 'required',
      });

      if (!isPageActive || currentSerial !== requestSerial) {
        return;
      }

      const nextCourses = response.items.map((item) => this.mapCourse(item));
      const courses = replace
        ? nextCourses
        : [...this.data.courses, ...nextCourses];

      this.setData({
        state: courses.length > 0 ? 'success' : 'empty',
        errorMessage: '',
        loadMoreErrorMessage: '',
        courses,
        page: response.pagination.page,
        totalPages: response.pagination.totalPages,
        hasMore: response.pagination.page < response.pagination.totalPages,
        isLoadingMore: false,
      });
    } catch {
      if (!isPageActive || currentSerial !== requestSerial) {
        return;
      }

      if (replace) {
        this.setData({
          state: 'error',
          errorMessage: '我的课程加载失败，请稍后重试。',
          courses: [],
          hasMore: false,
          isLoadingMore: false,
        });
      } else {
        this.setData({
          loadMoreErrorMessage: '更多课程加载失败，请重试。',
          isLoadingMore: false,
        });
      }
    } finally {
      isRequesting = false;
    }
  },

  mapCourse(item: LearningCourseItem): CourseView {
    return {
      ...item,
      progressText: `${Math.max(0, Math.min(100, Math.round(item.progressPercent)))}%`,
      chapterText: `${Math.max(0, item.completedChapterCount)} / ${Math.max(0, item.totalChapterCount)} 章节`,
      coverText: (item.courseName.trim() || '课程').slice(0, 2),
      coverFailed: false,
      statusText: item.status === 'COMPLETED' ? '重新查看' : '继续学习',
    };
  },

  handleRetry() {
    void this.loadCourses(1, true);
  },

  handleLoadMoreRetry() {
    void this.loadCourses(this.data.page + 1, false);
  },

  handleChoose() {
    wx.navigateTo({ url: '/pages/course/list?mode=select' });
  },

  handleCourseTap(
    event: WechatMiniprogram.BaseEvent<{ courseId?: string }>,
  ) {
    const courseId = event.currentTarget.dataset.courseId;

    if (!courseId) {
      return;
    }

    wx.navigateTo({
      url: `/pages/learning/course-progress?courseId=${encodeURIComponent(courseId)}`,
    });
  },

  handleCoverError(
    event: WechatMiniprogram.BaseEvent<{ courseId?: string }>,
  ) {
    const courseId = event.currentTarget.dataset.courseId;

    if (!courseId) {
      return;
    }

    this.setData({
      courses: this.data.courses.map((course) =>
        course.courseId === courseId
          ? { ...course, coverFailed: true }
          : course,
      ),
    });
  },

  handleLogin() {
    redirectToLogin('/pages/learning/my-courses');
  },
});
