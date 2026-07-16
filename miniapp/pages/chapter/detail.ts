import type {
  ChapterContentBlock,
  ChapterDetailData,
  CourseChapter,
  CourseDetailData,
} from '../../types/course';
import { formatMinutes } from '../../utils/course';
import { request } from '../../utils/request';

type PageState = 'loading' | 'success' | 'error';

type ChapterCatalogItem = CourseChapter & {
  estimatedMinutesText: string;
  isCurrent: boolean;
};

type RenderBlock = {
  id: string;
  type: ChapterContentBlock['type'];
  headingLevel: number;
  text: string;
  title: string;
  description: string;
  language: string;
  code: string;
  caption: string;
  imageUrl: string;
  imageAlt: string;
  questionId: string;
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

function getHeadingLevel(value: unknown) {
  return value === 2 || value === 3 ? value : 1;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeBlock(block: ChapterContentBlock): RenderBlock | null {
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
    questionId: '',
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
      return language && code
        ? {
            ...baseBlock,
            language,
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
    case 'QUESTION': {
      const questionId = getOptionalString(block.content.questionId);
      return questionId
        ? {
            ...baseBlock,
            questionId,
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

  return `第 ${currentIndex + 1} 节 / 共 ${chapters.length} 节`;
}

function getChapterTitleById(chapters: ChapterCatalogItem[], chapterId: string) {
  return chapters.find((chapter) => chapter.id === chapterId)?.title ?? '';
}

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
    contentBlocks: [],
    chapters: [],
    showCatalog: false,
    previousChapterId: '',
    nextChapterId: '',
    previousChapterTitle: '',
    nextChapterTitle: '',
  },

  onLoad(query) {
    const chapterId = query.chapterId;

    if (!chapterId || typeof chapterId !== 'string') {
      wx.showToast({
        title: '缺少章节参数',
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

  async loadChapterDetail(chapterId = this.data.chapterId) {
    this.setData({
      state: 'loading',
      errorMessage: '',
      showCatalog: false,
    });

    try {
      const chapter = await request<ChapterDetailData>({
        url: `/chapters/${chapterId}`,
      });
      const course = await request<CourseDetailData>({
        url: `/courses/${chapter.courseId}`,
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
    } catch (error) {
      this.setData({
        state: 'error',
        errorMessage:
          error instanceof Error ? error.message : '章节详情加载失败，请稍后重试',
      });
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
      url: '/pages/home/index',
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
      url: `/pages/chapter/detail?chapterId=${chapterId}`,
    });
  },

  handleNavigatePrevious() {
    if (!this.data.previousChapterId) {
      return;
    }

    wx.redirectTo({
      url: `/pages/chapter/detail?chapterId=${this.data.previousChapterId}`,
    });
  },

  handleNavigateNext() {
    if (!this.data.nextChapterId) {
      return;
    }

    wx.redirectTo({
      url: `/pages/chapter/detail?chapterId=${this.data.nextChapterId}`,
    });
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
