import type { LearningCourseItem, LearningListResponse } from '../../types/learning';
import { getAuthStateSummary, redirectToLogin } from '../../utils/auth';
import { getBattleErrorMessage } from '../../utils/battle';
import { request } from '../../utils/request';

type PageState = 'guest' | 'loading' | 'success' | 'empty' | 'error';

type LearningCourseCard = {
  courseId: string;
  courseName: string;
  coverUrl: string | null;
  coverFailed: boolean;
  coverFallbackText: string;
  chapterText: string;
  progressPercent: number;
  progressText: string;
  statusText: string;
};

type LearningPageData = {
  state: PageState;
  errorMessage: string;
  courses: LearningCourseCard[];
  totalCourses: number;
};

type LearningPageMethods = {
  loadCourses(): Promise<void>;
  handleRetry(): void;
  handleLogin(): void;
  handleCourseTap(event: WechatMiniprogram.BaseEvent<{ courseId?: string }>): void;
  handleCoverError(event: WechatMiniprogram.BaseEvent<{ courseId?: string }>): void;
  handleViewMore(): void;
  handleChooseCourse(): void;
  handlePracticeRoom(): void;
  handleWrongQuestions(): void;
  mapCourse(item: LearningCourseItem): LearningCourseCard;
};

const HOME_COURSE_LIMIT = 4;
let isPageActive = false;
let isRequesting = false;
let requestSerial = 0;

Page<LearningPageData, LearningPageMethods>({
  data: {
    state: 'loading',
    errorMessage: '',
    courses: [],
    totalCourses: 0,
  },

  onLoad() {
    isPageActive = true;
    void this.loadCourses();
  },

  onShow() {
    isPageActive = true;
    void this.loadCourses();
  },

  onUnload() {
    isPageActive = false;
    requestSerial += 1;
  },

  onPullDownRefresh() {
    void this.loadCourses().finally(() => wx.stopPullDownRefresh());
  },

  async loadCourses() {
    if (!getAuthStateSummary().isAuthenticated) {
      this.setData({ state: 'guest', errorMessage: '', courses: [], totalCourses: 0 });
      return;
    }

    if (isRequesting) {
      return;
    }

    const currentSerial = ++requestSerial;
    isRequesting = true;
    this.setData({ state: 'loading', errorMessage: '' });

    try {
      const response = await request<LearningListResponse>({
        url: '/users/me/learning',
        method: 'GET',
        data: { page: 1, pageSize: HOME_COURSE_LIMIT },
        authMode: 'required',
      });

      if (!isPageActive || currentSerial !== requestSerial) {
        return;
      }

      const courses = response.items.slice(0, HOME_COURSE_LIMIT).map((item) => this.mapCourse(item));
      this.setData({
        state: courses.length > 0 ? 'success' : 'empty',
        errorMessage: '',
        courses,
        totalCourses: Math.max(0, response.pagination.total),
      });
    } catch (error) {
      if (!isPageActive || currentSerial !== requestSerial) {
        return;
      }

      this.setData({
        state: 'error',
        errorMessage: getBattleErrorMessage(error, {
          unauthorized: '登录状态已失效，请重新登录。',
          network: '网络连接失败，请检查网络后重试。',
          fallback: '学习课程加载失败，请稍后重试。',
        }),
        courses: [],
        totalCourses: 0,
      });
    } finally {
      isRequesting = false;
    }
  },

  handleRetry() {
    void this.loadCourses();
  },

  handleLogin() {
    redirectToLogin('/pages/learning/index');
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

  handleViewMore() {
    if (!getAuthStateSummary().isAuthenticated) {
      this.handleLogin();
      return;
    }

    wx.navigateTo({ url: '/pages/learning/my-courses' });
  },

  handleChooseCourse() {
    wx.navigateTo({ url: '/pages/course/list?mode=select' });
  },

  handlePracticeRoom() {
    if (!getAuthStateSummary().isAuthenticated) {
      this.handleLogin();
      return;
    }

    wx.navigateTo({ url: '/pages/practice/index' });
  },

  handleWrongQuestions() {
    if (!getAuthStateSummary().isAuthenticated) {
      this.handleLogin();
      return;
    }

    wx.navigateTo({ url: '/pages/wrong-question/index' });
  },

  mapCourse(item: LearningCourseItem) {
    const progressPercent = Math.max(0, Math.min(100, Math.round(item.progressPercent)));
    const courseName = item.courseName.trim() || '未命名课程';

    return {
      courseId: item.courseId,
      courseName,
      coverUrl: item.coverUrl,
      coverFailed: false,
      coverFallbackText: courseName.slice(0, 2),
      chapterText: `共 ${Math.max(0, item.totalChapterCount)} 节`,
      progressPercent,
      progressText: `${progressPercent}%`,
      statusText: item.status === 'COMPLETED' ? '已完成' : progressPercent > 0 ? '继续学习' : '开始学习',
    };
  },
});
