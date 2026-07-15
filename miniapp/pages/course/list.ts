import type { CourseListData, CourseListItem } from '../../types/course';
import { formatDifficulty, formatMinutes } from '../../utils/course';
import { request } from '../../utils/request';

type PageState = 'loading' | 'success' | 'empty' | 'error';

type CourseCard = CourseListItem & {
  difficultyText: string;
  estimatedMinutesText: string;
};

type CourseListPageData = {
  state: PageState;
  errorMessage: string;
  courses: CourseCard[];
  total: number;
};

Page<CourseListPageData>({
  data: {
    state: 'loading',
    errorMessage: '',
    courses: [],
    total: 0,
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

      const courses = result.items.map((course) => ({
        ...course,
        difficultyText: formatDifficulty(course.difficulty),
        estimatedMinutesText: formatMinutes(course.estimatedMinutes),
      }));

      this.setData({
        state: courses.length > 0 ? 'success' : 'empty',
        courses,
        total: result.pagination.total,
      });
    } catch (error) {
      this.setData({
        state: 'error',
        errorMessage: error instanceof Error ? error.message : '课程列表加载失败，请稍后重试',
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

  openCourseDetail(event: WechatMiniprogram.BaseEvent<{ courseId: string }>) {
    const { courseId } = event.currentTarget.dataset;

    wx.navigateTo({
      url: `/pages/course/detail?courseId=${courseId}`,
    });
  },
});
