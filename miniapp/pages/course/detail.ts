import type { CourseDetailData, CourseChapter } from '../../types/course';
import {
  formatDifficulty,
  formatMinutes,
  normalizeLearningObjectives,
} from '../../utils/course';
import { request } from '../../utils/request';

type PageState = 'loading' | 'success' | 'error';

type ChapterCard = CourseChapter & {
  estimatedMinutesText: string;
};

type CourseDetailPageData = {
  state: PageState;
  errorMessage: string;
  courseId: string;
  title: string;
  summary: string;
  description: string;
  difficultyText: string;
  estimatedMinutesText: string;
  targetAudience: string;
  learnerCount: number;
  progressPercent: number;
  learningObjectives: string[];
  chapters: ChapterCard[];
};

Page<CourseDetailPageData>({
  data: {
    state: 'loading',
    errorMessage: '',
    courseId: '',
    title: '',
    summary: '',
    description: '',
    difficultyText: '',
    estimatedMinutesText: '',
    targetAudience: '',
    learnerCount: 0,
    progressPercent: 0,
    learningObjectives: [],
    chapters: [],
  },

  onLoad(query) {
    const courseId = query.courseId;

    if (!courseId || typeof courseId !== 'string') {
      wx.showToast({
        title: '缺少课程参数',
        icon: 'none',
      });

      setTimeout(() => {
        wx.navigateBack({
          delta: 1,
        });
      }, 400);

      return;
    }

    this.setData({
      courseId,
    });

    void this.loadCourseDetail(courseId);
  },

  async loadCourseDetail(courseId = this.data.courseId) {
    this.setData({
      state: 'loading',
      errorMessage: '',
    });

    try {
      const result = await request<CourseDetailData>({
        url: `/courses/${courseId}`,
      });

      this.setData({
        state: 'success',
        title: result.title,
        summary: result.summary,
        description: result.description ?? '',
        difficultyText: formatDifficulty(result.difficulty),
        estimatedMinutesText: formatMinutes(result.estimatedMinutes),
        targetAudience: result.targetAudience ?? '暂未填写适合人群',
        learnerCount: result.learnerCount,
        progressPercent: result.progressPercent,
        learningObjectives: normalizeLearningObjectives(result.learningObjectives),
        chapters: result.chapters.map((chapter) => ({
          ...chapter,
          estimatedMinutesText: formatMinutes(chapter.estimatedMinutes),
        })),
      });
    } catch (error) {
      this.setData({
        state: 'error',
        errorMessage:
          error instanceof Error ? error.message : '课程详情加载失败，请稍后重试',
      });
    }
  },

  handleRetry() {
    void this.loadCourseDetail();
  },

  handleChapterTap(event: WechatMiniprogram.BaseEvent) {
    const chapterId = event.currentTarget.dataset.chapterId;

    if (!chapterId || typeof chapterId !== 'string') {
      return;
    }

    wx.navigateTo({
      url: `/pages/chapter/detail?chapterId=${chapterId}`,
    });
  },
});
