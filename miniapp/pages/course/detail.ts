import type { CourseDetailData, CourseChapter } from '../../types/course';
import type { CourseProgressResponse, LearningStatus } from '../../types/learning';
import { getAuthStateSummary, redirectToLogin } from '../../utils/auth';
import {
  formatDifficulty,
  formatMinutes,
  normalizeLearningObjectives,
} from '../../utils/course';
import { RequestError, request } from '../../utils/request';

type PageState = 'loading' | 'success' | 'error';

type ChapterCard = CourseChapter & {
  estimatedMinutesText: string;
  learningStatus: LearningStatus;
  learningStatusText: string;
  learningStatusClassName: string;
  startedAtText: string;
  completedAtText: string;
  quizStatusText: string;
  isLastLearned: boolean;
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
  completedChapterCount: number;
  totalChapterCount: number;
  courseStatusText: string;
  courseStatusClassName: string;
  lastLearnedChapterTitle: string;
  learningObjectives: string[];
  chapters: ChapterCard[];
  canOpenCourseProgress: boolean;
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

function getStatusText(status: LearningStatus) {
  if (status === 'COMPLETED') {
    return '已完成';
  }

  if (status === 'LEARNING') {
    return '进行中';
  }

  return '未开始';
}

function getStatusClassName(status: LearningStatus) {
  if (status === 'COMPLETED') {
    return 'status-completed';
  }

  if (status === 'LEARNING') {
    return 'status-learning';
  }

  return 'status-not-started';
}

function formatTimestamp(value: string | null) {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;
}

function navigateBackOrCourseList() {
  if (getCurrentPages().length > 1) {
    wx.navigateBack({
      delta: 1,
    });
    return;
  }

  wx.switchTab({
    url: '/pages/learning/index',
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
    completedChapterCount: 0,
    totalChapterCount: 0,
    courseStatusText: '未开始',
    courseStatusClassName: 'status-not-started',
    lastLearnedChapterTitle: '',
    learningObjectives: [],
    chapters: [],
    canOpenCourseProgress: false,
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
      const isAuthenticated = getAuthStateSummary().isAuthenticated;
      const [courseDetail, progressResult] = await Promise.all([
        request<CourseDetailData>({
          url: `/courses/${activeCourseId}`,
          authMode: 'auto',
        }),
        isAuthenticated
          ? request<CourseProgressResponse>({
              url: `/courses/${activeCourseId}/progress`,
              authMode: 'required',
            }).catch(() => null)
          : Promise.resolve(null),
      ]);
      const progressByChapterId = new Map(
        (progressResult?.chapters ?? []).map((chapter) => [chapter.chapterId, chapter]),
      );
      const lastLearnedChapterId = progressResult?.lastLearnedChapter?.chapterId ?? '';
      const totalChapterCount =
        progressResult?.totalChapterCount ?? courseDetail.chapters.length;
      const completedChapterCount = progressResult?.completedChapterCount ?? 0;
      const progressPercent = progressResult?.progressPercent ?? courseDetail.progressPercent;
      const courseStatus = progressResult?.status ?? 'NOT_STARTED';

      this.setData({
        state: 'success',
        title: courseDetail.title,
        summary: courseDetail.summary,
        description: courseDetail.description ?? '',
        difficultyText: formatDifficulty(courseDetail.difficulty),
        estimatedMinutesText: formatMinutes(courseDetail.estimatedMinutes),
        targetAudience: courseDetail.targetAudience ?? '暂未填写适合人群',
        learnerCount: courseDetail.learnerCount,
        progressPercent,
        completedChapterCount,
        totalChapterCount,
        courseStatusText: getStatusText(courseStatus),
        courseStatusClassName: getStatusClassName(courseStatus),
        lastLearnedChapterTitle: progressResult?.lastLearnedChapter?.title ?? '',
        learningObjectives: normalizeLearningObjectives(courseDetail.learningObjectives),
        chapters: courseDetail.chapters.map((chapter) => {
          const chapterProgress = progressByChapterId.get(chapter.id);
          const learningStatus = chapterProgress?.status ?? 'NOT_STARTED';

          return {
          ...chapter,
          estimatedMinutesText: formatMinutes(chapter.estimatedMinutes),
            learningStatus,
            learningStatusText: getStatusText(learningStatus),
            learningStatusClassName: getStatusClassName(learningStatus),
            startedAtText: formatTimestamp(chapterProgress?.startedAt ?? null),
            completedAtText: formatTimestamp(chapterProgress?.completedAt ?? null),
            quizStatusText: chapterProgress?.hasQuiz
              ? chapterProgress.quizCompleted
                ? '章节测验已通过'
                : '章节测验待完成'
              : '当前章节无测验',
            isLastLearned: chapter.id === lastLearnedChapterId,
          };
        }),
        canOpenCourseProgress: isAuthenticated,
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

  handleOpenCourseProgress() {
    if (!this.data.courseId) {
      return;
    }

    if (!getAuthStateSummary().isAuthenticated) {
      redirectToLogin(
        `/pages/course/detail?courseId=${encodeURIComponent(this.data.courseId)}`,
      );
      return;
    }

    wx.navigateTo({
      url: `/pages/learning/course-progress?courseId=${encodeURIComponent(this.data.courseId)}`,
    });
  },
});
