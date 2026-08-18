import { registerThemedPage } from '../../utils/theme-page';
import type { CourseListData, CourseListItem } from '../../types/course';
import { formatDifficulty, formatMinutes } from '../../utils/course';
import { request } from '../../utils/request';

type PageState = 'loading' | 'success' | 'empty' | 'error';

type HomePageData = {
  state: PageState;
  errorMessage: string;
  recommendedCourses: Array<
    CourseListItem & {
      difficultyText: string;
      estimatedMinutesText: string;
    }
  >;
};

registerThemedPage<HomePageData>({
  data: {
    state: 'loading',
    errorMessage: '',
    recommendedCourses: [],
  },

  onLoad() {
    void this.loadCourses();
  },

  onPullDownRefresh() {
    void this.loadCourses(true);
  },

  async loadCourses(fromPullDown = false) {
    this.setData({
      state: 'loading',
      errorMessage: '',
    });

    try {
      const result = await request<CourseListData>({
        url: '/courses',
      });

      const recommendedCourses = result.items.map((course) => ({
        ...course,
        difficultyText: formatDifficulty(course.difficulty),
        estimatedMinutesText: formatMinutes(course.estimatedMinutes),
      }));

      this.setData({
        state: recommendedCourses.length > 0 ? 'success' : 'empty',
        recommendedCourses,
      });
    } catch (error) {
      this.setData({
        state: 'error',
        errorMessage: error instanceof Error ? error.message : '课程加载失败，请稍后重试',
      });
    } finally {
      if (fromPullDown) {
        wx.stopPullDownRefresh();
      }
    }
  },

  handleRetry() {
    void this.loadCourses();
  },

  openCourseList() {
    wx.navigateTo({
      url: '/pages/course/list',
    });
  },

  openCourseDetail(event: WechatMiniprogram.BaseEvent<{ courseId: string }>) {
    const { courseId } = event.currentTarget.dataset;

    wx.navigateTo({
      url: `/pages/course/detail?courseId=${courseId}`,
    });
  },
});
