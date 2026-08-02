import type {
  ChapterContentBlock,
  ChapterDetailData,
  CourseChapter,
  CourseDetailData,
} from '../../types/course';
import { getAuthStateSummary, redirectToLogin } from '../../utils/auth';
import { formatMinutes } from '../../utils/course';
import { RequestError, request } from '../../utils/request';

type PageState = 'loading' | 'success' | 'error';

type ChapterCatalogItem = CourseChapter & {
  estimatedMinutesText: string;
  isCurrent: boolean;
};

type RenderBlock = {
  id: string;
  type: Exclude<ChapterContentBlock['type'], 'QUESTION'>;
  headingLevel: number;
  text: string;
  title: string;
  description: string;
  language: string;
  code: string;
  caption: string;
  imageUrl: string;
  imageAlt: string;
};

type ChapterDetailPageData = {
  state: PageState;
  errorMessage: string;
  chapterId: string;
  courseId: string;
  courseTitle: string;
  title: string;
  summary: string;
  estimatedMinutesText: string;
  chapterPositionText: string;
  learningStatus: ChapterDetailData['learningStatus'];
  learningStatusText: string;
  learningStatusClassName: string;
  primaryActionText: string;
  primaryActionDescription: string;
  isPrimaryActionDisabled: boolean;
  hasQuiz: boolean;
  isAuthenticated: boolean;
  isActionLoading: boolean;
  contentBlocks: RenderBlock[];
  chapters: ChapterCatalogItem[];
  showCatalog: boolean;
  previousChapterId: string;
  nextChapterId: string;
  previousChapterTitle: string;
  nextChapterTitle: string;
};

function getOptionalString(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0 ? value : '';
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

function getHeadingLevel(value: unknown) {
  return value === 2 || value === 3 ? value : 1;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeBlock(block: ChapterContentBlock): RenderBlock | null {
  if (block.type === 'QUESTION') {
    return null;
  }

  if (!isRecord(block.content)) {
    return null;
  }

  const baseBlock: RenderBlock = {
    id: block.id,
    type: block.type,
    headingLevel: 1,
    text: '',
    title: '',
    description: '',
    language: '',
    code: '',
    caption: '',
    imageUrl: '',
    imageAlt: '',
  };

  switch (block.type) {
    case 'TEXT': {
      const text = getOptionalString(block.content.text);
      return text ? { ...baseBlock, text } : null;
    }
    case 'HEADING': {
      const text = getOptionalString(block.content.text);
      return text
        ? {
            ...baseBlock,
            text,
            headingLevel: getHeadingLevel(block.content.level),
          }
        : null;
    }
    case 'IMAGE': {
      const imageUrl = getOptionalString(block.content.url);
      return imageUrl
        ? {
            ...baseBlock,
            imageUrl,
            imageAlt: getOptionalString(block.content.alt),
            caption: getOptionalString(block.content.caption),
          }
        : null;
    }
    case 'CODE': {
      const language = getOptionalString(block.content.language);
      const code = getOptionalString(block.content.code);
      return code
        ? {
            ...baseBlock,
            language: language || '代码',
            code,
            caption: getOptionalString(block.content.caption),
          }
        : null;
    }
    case 'TIP':
    case 'WARNING': {
      const text = getOptionalString(block.content.text);
      return text
        ? {
            ...baseBlock,
            text,
            title: getOptionalString(block.content.title),
          }
        : null;
    }
    case 'EXAMPLE': {
      const title = getOptionalString(block.content.title);
      const description = getOptionalString(block.content.description);
      const text = getOptionalString(block.content.text);
      const code = getOptionalString(block.content.code);

      return title || description || text || code
        ? {
            ...baseBlock,
            title,
            description,
            text,
            language: getOptionalString(block.content.language),
            code,
            caption: getOptionalString(block.content.caption),
          }
        : null;
    }
    default:
      return null;
  }
}

function getChapterPosition(chapters: ChapterCatalogItem[]) {
  const currentIndex = chapters.findIndex((chapter) => chapter.isCurrent);

  if (currentIndex < 0) {
    return '';
  }

  return `第 ${currentIndex + 1} 章 / 共 ${chapters.length} 章`;
}

function getChapterTitleById(chapters: ChapterCatalogItem[], chapterId: string) {
  return chapters.find((chapter) => chapter.id === chapterId)?.title ?? '';
}

function getReadableErrorMessage(error: unknown) {
  if (error instanceof RequestError) {
    if (error.code === 'NETWORK_ERROR') {
      return '网络请求失败，请确认后端服务可用后再试。';
    }

    if (error.statusCode === 404 || error.code === 'CHAPTER_NOT_FOUND') {
      return '当前章节不存在或暂未发布。';
    }

    return '章节详情加载失败，请稍后重试。';
  }

  return '章节详情加载失败，请稍后重试。';
}

function getCompletionErrorMessage(error: unknown) {
  if (error instanceof RequestError) {
    if (error.code === 'NETWORK_ERROR') {
      return '网络异常，暂时无法更新章节进度，请稍后重试。';
    }

    if (error.code === 'CHAPTER_NOT_STARTED') {
      return '请先进入章节开始学习后，再标记本章完成。';
    }

    if (error.code === 'CHAPTER_QUIZ_NOT_SUBMITTED') {
      return '请先完成章节测验并提交答案后，再计入本章进度。';
    }

    if (error.code === 'QUIZ_NOT_PUBLISHED' || error.code === 'QUIZ_NOT_READY') {
      return '当前章节测验暂未准备完成，请稍后再试。';
    }
  }

  return '章节完成状态更新失败，请稍后重试。';
}

function getLearningStatusText(status: ChapterDetailData['learningStatus']) {
  if (status === 'COMPLETED') {
    return '已完成';
  }

  if (status === 'LEARNING') {
    return '学习中';
  }

  return '未开始';
}

function getLearningStatusClassName(status: ChapterDetailData['learningStatus']) {
  if (status === 'COMPLETED') {
    return 'status-completed';
  }

  if (status === 'LEARNING') {
    return 'status-learning';
  }

  return 'status-not-started';
}

function buildPrimaryActionText(
  hasQuiz: boolean,
  status: ChapterDetailData['learningStatus'],
) {
  if (hasQuiz) {
    return status === 'COMPLETED' ? '再次参加章节测验' : '开始章节测验';
  }

  return status === 'COMPLETED' ? '本章已完成' : '标记本章完成';
}

function buildPrimaryActionDescription(
  hasQuiz: boolean,
  status: ChapterDetailData['learningStatus'],
) {
  if (hasQuiz) {
    if (status === 'COMPLETED') {
      return '你已完成本章测验，再次作答只用于复习，不会清除已完成进度。';
    }

    return '请在阅读完本章内容后参加测验。提交后会直接显示正误、答案和解析，本章也会计入学习进度。';
  }

  if (status === 'COMPLETED') {
    return '本章已计入你的学习进度，可以继续进入下一章。';
  }

  return '当前章节没有额外测验，阅读完成后可在此直接标记完成。';
}

function isPrimaryActionDisabled(
  hasQuiz: boolean,
  status: ChapterDetailData['learningStatus'],
) {
  return !hasQuiz && status === 'COMPLETED';
}

let isPageActive = false;
let hasShownOnce = false;

Page<ChapterDetailPageData>({
  data: {
    state: 'loading',
    errorMessage: '',
    chapterId: '',
    courseId: '',
    courseTitle: '',
    title: '',
    summary: '',
    estimatedMinutesText: '',
    chapterPositionText: '',
    learningStatus: 'NOT_STARTED',
    learningStatusText: '未开始',
    learningStatusClassName: 'status-not-started',
    primaryActionText: '标记本章完成',
    primaryActionDescription: '',
    isPrimaryActionDisabled: false,
    hasQuiz: false,
    isAuthenticated: false,
    isActionLoading: false,
    contentBlocks: [],
    chapters: [],
    showCatalog: false,
    previousChapterId: '',
    nextChapterId: '',
    previousChapterTitle: '',
    nextChapterTitle: '',
  },

  onLoad(query) {
    isPageActive = true;
    hasShownOnce = false;
    const chapterId =
      typeof query.chapterId === 'string' ? decodeQueryValue(query.chapterId) : '';

    if (!chapterId || !isValidUuid(chapterId)) {
      wx.showToast({
        title: '章节参数无效',
        icon: 'none',
      });

      setTimeout(() => {
        this.handleBack();
      }, 400);

      return;
    }

    this.setData({
      chapterId,
    });

    void this.loadChapterDetail(chapterId);
  },

  onShow() {
    isPageActive = true;

    if (!hasShownOnce) {
      hasShownOnce = true;
      return;
    }

    if (this.data.chapterId) {
      void this.loadChapterDetail(this.data.chapterId);
    }
  },

  onUnload() {
    isPageActive = false;
  },

  async loadChapterDetail(chapterId?: string) {
    const activeChapterId = chapterId ?? this.data.chapterId;
    const isAuthenticated = getAuthStateSummary().isAuthenticated;

    this.setData({
      state: 'loading',
      errorMessage: '',
      showCatalog: false,
      isAuthenticated,
    });

    try {
      const chapter = await request<ChapterDetailData>({
        url: `/chapters/${activeChapterId}`,
        authMode: 'auto',
      });
      const course = await request<CourseDetailData>({
        url: `/courses/${chapter.courseId}`,
        authMode: 'auto',
      });
      const chapters = course.chapters.map((item) => ({
        ...item,
        estimatedMinutesText: formatMinutes(item.estimatedMinutes),
        isCurrent: item.id === chapter.id,
      }));

      this.setData({
        state: 'success',
        chapterId: chapter.id,
        courseId: chapter.courseId,
        courseTitle: chapter.courseTitle,
        title: chapter.title,
        summary: chapter.summary ?? '',
        estimatedMinutesText: formatMinutes(chapter.estimatedMinutes),
        chapterPositionText: getChapterPosition(chapters),
        learningStatus: chapter.learningStatus,
        learningStatusText: getLearningStatusText(chapter.learningStatus),
        learningStatusClassName: getLearningStatusClassName(chapter.learningStatus),
        primaryActionText: buildPrimaryActionText(
          chapter.hasQuiz,
          chapter.learningStatus,
        ),
        primaryActionDescription: buildPrimaryActionDescription(
          chapter.hasQuiz,
          chapter.learningStatus,
        ),
        isPrimaryActionDisabled: isPrimaryActionDisabled(
          chapter.hasQuiz,
          chapter.learningStatus,
        ),
        hasQuiz: chapter.hasQuiz,
        isActionLoading: false,
        contentBlocks: chapter.contentBlocks
          .map((block) => normalizeBlock(block))
          .filter((block): block is RenderBlock => block !== null),
        chapters,
        previousChapterId: chapter.previousChapterId ?? '',
        nextChapterId: chapter.nextChapterId ?? '',
        previousChapterTitle: getChapterTitleById(
          chapters,
          chapter.previousChapterId ?? '',
        ),
        nextChapterTitle: getChapterTitleById(chapters, chapter.nextChapterId ?? ''),
      });

      if (isAuthenticated) {
        void this.ensureChapterStarted(chapter.id, chapter.learningStatus);
      }
    } catch (error) {
      if (!isPageActive) {
        return;
      }

      this.setData({
        state: 'error',
        errorMessage: getReadableErrorMessage(error),
        isActionLoading: false,
      });
    }
  },

  async ensureChapterStarted(
    chapterId: string,
    currentStatus: ChapterDetailData['learningStatus'],
  ) {
    try {
      await request<{ chapterStatus: ChapterDetailData['learningStatus'] }>({
        url: `/chapters/${chapterId}/start`,
        method: 'POST',
        authMode: 'required',
      });

      if (!isPageActive || currentStatus === 'COMPLETED') {
        return;
      }

      this.setData({
        learningStatus: 'LEARNING',
        learningStatusText: getLearningStatusText('LEARNING'),
        learningStatusClassName: getLearningStatusClassName('LEARNING'),
        primaryActionText: buildPrimaryActionText(this.data.hasQuiz, 'LEARNING'),
        primaryActionDescription: buildPrimaryActionDescription(
          this.data.hasQuiz,
          'LEARNING',
        ),
        isPrimaryActionDisabled: isPrimaryActionDisabled(
          this.data.hasQuiz,
          'LEARNING',
        ),
      });
    } catch {
      // Keep reading available even if progress writing fails.
    }
  },

  handleRetry() {
    void this.loadChapterDetail();
  },

  handleBack() {
    if (getCurrentPages().length > 1) {
      wx.navigateBack({
        delta: 1,
      });
      return;
    }

    wx.switchTab({
      url: '/pages/learning/index',
    });
  },

  toggleCatalog() {
    this.setData({
      showCatalog: !this.data.showCatalog,
    });
  },

  closeCatalog() {
    this.setData({
      showCatalog: false,
    });
  },

  noop() {},

  handleCatalogSelect(event: WechatMiniprogram.BaseEvent) {
    const chapterId = event.currentTarget.dataset.chapterId;

    if (!chapterId || typeof chapterId !== 'string') {
      return;
    }

    if (chapterId === this.data.chapterId) {
      this.closeCatalog();
      return;
    }

    wx.redirectTo({
      url: `/pages/chapter/detail?chapterId=${encodeURIComponent(chapterId)}`,
    });
  },

  handleNavigatePrevious() {
    if (!this.data.previousChapterId) {
      return;
    }

    wx.redirectTo({
      url: `/pages/chapter/detail?chapterId=${encodeURIComponent(this.data.previousChapterId)}`,
    });
  },

  handleNavigateNext() {
    if (!this.data.nextChapterId) {
      return;
    }

    wx.redirectTo({
      url: `/pages/chapter/detail?chapterId=${encodeURIComponent(this.data.nextChapterId)}`,
    });
  },

  async handlePrimaryAction() {
    if (
      !this.data.chapterId ||
      this.data.isActionLoading ||
      this.data.isPrimaryActionDisabled
    ) {
      return;
    }

    if (!this.data.isAuthenticated) {
      redirectToLogin(
        `/pages/chapter/detail?chapterId=${encodeURIComponent(this.data.chapterId)}`,
      );
      return;
    }

    if (this.data.hasQuiz) {
      wx.navigateTo({
        url: `/pages/chapter/quiz?chapterId=${encodeURIComponent(this.data.chapterId)}`,
      });
      return;
    }

    this.setData({
      isActionLoading: true,
    });

    try {
      await request<Record<string, never>>({
        url: `/chapters/${this.data.chapterId}/complete`,
        method: 'POST',
        authMode: 'required',
      });

      if (!isPageActive) {
        return;
      }

      this.setData({
        learningStatus: 'COMPLETED',
        learningStatusText: getLearningStatusText('COMPLETED'),
        learningStatusClassName: getLearningStatusClassName('COMPLETED'),
        primaryActionText: buildPrimaryActionText(this.data.hasQuiz, 'COMPLETED'),
        primaryActionDescription: buildPrimaryActionDescription(
          this.data.hasQuiz,
          'COMPLETED',
        ),
        isPrimaryActionDisabled: isPrimaryActionDisabled(
          this.data.hasQuiz,
          'COMPLETED',
        ),
      });
      wx.showToast({
        title: '本章已计入学习进度',
        icon: 'none',
      });
    } catch (error) {
      wx.showToast({
        title: getCompletionErrorMessage(error),
        icon: 'none',
      });
    } finally {
      if (!isPageActive) {
        return;
      }

      this.setData({
        isActionLoading: false,
      });
    }
  },

  handleCopyCode(event: WechatMiniprogram.BaseEvent) {
    const code = event.currentTarget.dataset.code;

    if (!code || typeof code !== 'string') {
      return;
    }

    wx.setClipboardData({
      data: code,
      success: () => {
        wx.showToast({
          title: '代码已复制',
          icon: 'none',
        });
      },
      fail: () => {
        wx.showToast({
          title: '复制失败，请重试',
          icon: 'none',
        });
      },
    });
  },

  handlePreviewImage(event: WechatMiniprogram.BaseEvent) {
    const url = event.currentTarget.dataset.url;

    if (!url || typeof url !== 'string') {
      return;
    }

    wx.previewImage({
      current: url,
      urls: [url],
    });
  },
});
