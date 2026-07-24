import type { CourseDetailData, CourseChapter } from '../../types/course';
import {
  formatDifficulty,
  formatMinutes,
  normalizeLearningObjectives,
} from '../../utils/course';
import { RequestError, request } from '../../utils/request';

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

function isValidUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function getReadableErrorMessage(error: unknown) {
  if (error instanceof RequestError) {
    if (error.code === 'NETWORK_ERROR') {
      return '网络请求失败，请确认后端服务可用后重试';
    }

    if (error.statusCode === 404) {
      return '课程不存在或暂不可用';
    }

    return '课程详情加载失败，请稍后重试';
  }

  if (error instanceof Error) {
    return '课程详情加载失败，请稍后重试';
  }

  return '课程详情加载失败，请稍后重试';
}

function navigateBackOrCourseList() {
  if (getCurrentPages().length > 1) {
    wx.navigateBack({
      delta: 1,
    });
    return;
  }

  wx.reLaunch({
    url: '/pages/course/list',
  });
}

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
    const courseIdRaw =
      typeof query.courseId === 'string' ? decodeQueryValue(query.courseId) : '';

    if (!isNonEmptyString(courseIdRaw) || !isValidUuid(courseIdRaw)) {
      wx.showToast({
        title: '课程参数无效',
        icon: 'none',
      });

      setTimeout(() => {
        navigateBackOrCourseList();
      }, 400);

      return;
    }

    this.setData({
      courseId: courseIdRaw,
    });

    void this.loadCourseDetail(courseIdRaw);
  },

  async loadCourseDetail(courseId?: string) {
    const activeCourseId = courseId ?? this.data.courseId;

    this.setData({
      state: 'loading',
      errorMessage: '',
    });

    try {
      const result = await request<CourseDetailData>({
        url: `/courses/${activeCourseId}`,
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
        errorMessage: getReadableErrorMessage(error),
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
      url: `/pages/chapter/detail?chapterId=${encodeURIComponent(chapterId)}`,
    });
  },
});
