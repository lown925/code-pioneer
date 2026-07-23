import type {
  WrongQuestionDetail,
  WrongQuestionDetailResponse,
  WrongQuestionOption,
} from '../../types/wrong-question';
import { getAuthStateSummary, redirectToLogin } from '../../utils/auth';
import { formatLearningTimestamp } from '../../utils/time';
import {
  formatWrongQuestionCount,
  formatWrongQuestionSource,
  formatWrongQuestionType,
  getWrongQuestionOptionLabel,
  getWrongQuestionSourceClassName,
} from '../../utils/wrong-question';
import { request, RequestError } from '../../utils/request';

type PageState = 'loading' | 'success' | 'invalid' | 'notFound' | 'error' | 'unauthorized';

type WrongQuestionOptionCard = WrongQuestionOption & {
  labelText: string;
  contentText: string;
  isCorrect: boolean;
  statusText: string;
  statusClassName: string;
};

type WrongQuestionDetailCard = WrongQuestionDetail & {
  sourceText: string;
  sourceClassName: string;
  questionTypeText: string;
  contentText: string;
  explanationText: string;
  wrongCountText: string;
  lastWrongAtText: string;
  correctAnswerText: string;
  options: WrongQuestionOptionCard[];
  hasCourseEntry: boolean;
  hasChapterEntry: boolean;
  answerUnavailableText: string;
};

type WrongQuestionDetailPageData = {
  state: PageState;
  errorTitle: string;
  errorMessage: string;
  questionId: string;
  isReloading: boolean;
  detail: WrongQuestionDetailCard | null;
};

type WrongQuestionDetailPageMethods = {
  validateQuestionId(value: string): boolean;
  ensureAuthenticated(): boolean;
  buildRedirectPath(): string;
  loadDetail(): Promise<void>;
  handleRetry(): void;
  handleBack(): void;
  handleOpenCourseDetail(): void;
  handleOpenChapterDetail(): void;
  mapDetail(data: WrongQuestionDetailResponse): WrongQuestionDetailCard;
  formatCorrectAnswer(
    options: WrongQuestionOptionCard[],
    correctOptionId: string,
  ): string;
  getReadableError(error: unknown): {
    title: string;
    message: string;
    state: PageState;
  };
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

function buildUuidRegExp() {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
}

let isPageActive = false;
let requestSerial = 0;
let requestCount = 0;

Page<WrongQuestionDetailPageData, WrongQuestionDetailPageMethods>({
  data: {
    state: 'loading',
    errorTitle: '',
    errorMessage: '',
    questionId: '',
    isReloading: false,
    detail: null,
  },

  onLoad(query) {
    isPageActive = true;

    const questionIdRaw =
      typeof query.questionId === 'string' ? decodeQueryValue(query.questionId) : '';

    if (!isNonEmptyString(questionIdRaw) || !this.validateQuestionId(questionIdRaw)) {
      this.setData({
        state: 'invalid',
        errorTitle: '题目参数无效',
        errorMessage: '当前题目参数无效，无法查看错题详情。',
        questionId: '',
        detail: null,
      });
      return;
    }

    this.setData({
      questionId: questionIdRaw,
      state: 'loading',
      errorTitle: '',
      errorMessage: '',
      detail: null,
      isReloading: false,
    });

    void this.loadDetail();
  },

  onUnload() {
    isPageActive = false;
    requestSerial += 1;
  },

  onPullDownRefresh() {
    void this.loadDetail();
  },

  validateQuestionId(value: string) {
    return buildUuidRegExp().test(value);
  },

  ensureAuthenticated() {
    const authState = getAuthStateSummary();

    if (authState.isAuthenticated) {
      return true;
    }

    this.setData({
      state: 'unauthorized',
      errorTitle: '登录已失效',
      errorMessage: '请先登录后再查看错题详情。',
    });

    redirectToLogin(this.buildRedirectPath());
    return false;
  },

  buildRedirectPath() {
    if (!this.data.questionId) {
      return '/pages/wrong-question/index';
    }

    return `/pages/wrong-question/detail?questionId=${encodeURIComponent(this.data.questionId)}`;
  },

  async loadDetail() {
    if (!this.data.questionId) {
      wx.stopPullDownRefresh();
      return;
    }

    if (!this.ensureAuthenticated()) {
      wx.stopPullDownRefresh();
      return;
    }

    if (requestCount > 0) {
      wx.stopPullDownRefresh();
      return;
    }

    const currentRequestSerial = ++requestSerial;
    requestCount += 1;

    this.setData({
      state: 'loading',
      errorTitle: '',
      errorMessage: '',
      isReloading: true,
    });

    try {
      const response = await request<WrongQuestionDetailResponse>({
        url: `/users/me/wrong-questions/${encodeURIComponent(this.data.questionId)}`,
        method: 'GET',
        authMode: 'required',
      });

      if (!isPageActive || currentRequestSerial !== requestSerial) {
        return;
      }

      this.setData({
        state: 'success',
        errorTitle: '',
        errorMessage: '',
        detail: this.mapDetail(response),
        isReloading: false,
      });
    } catch (error) {
      if (!isPageActive || currentRequestSerial !== requestSerial) {
        return;
      }

      const readable = this.getReadableError(error);

      this.setData({
        state: readable.state,
        errorTitle: readable.title,
        errorMessage: readable.message,
        detail: null,
        isReloading: false,
      });
    } finally {
      requestCount = Math.max(0, requestCount - 1);
      wx.stopPullDownRefresh();
    }
  },

  handleRetry() {
    void this.loadDetail();
  },

  handleBack() {
    if (getCurrentPages().length > 1) {
      wx.navigateBack({
        delta: 1,
      });
      return;
    }

    wx.reLaunch({
      url: '/pages/wrong-question/index',
    });
  },

  handleOpenCourseDetail() {
    if (!this.data.detail?.courseId) {
      return;
    }

    wx.navigateTo({
      url: `/pages/course/detail?courseId=${encodeURIComponent(this.data.detail.courseId)}`,
    });
  },

  handleOpenChapterDetail() {
    if (!this.data.detail?.chapterId) {
      return;
    }

    wx.navigateTo({
      url: `/pages/chapter/detail?chapterId=${encodeURIComponent(this.data.detail.chapterId)}`,
    });
  },

  mapDetail(data: WrongQuestionDetailResponse) {
    const options = data.options
      .slice()
      .sort((left, right) => left.order - right.order)
      .map((option, index) => {
        const isCorrect = option.optionId === data.correctOptionId;

        return {
          ...option,
          labelText: getWrongQuestionOptionLabel(index),
          contentText: option.content.trim() || '选项内容暂缺',
          isCorrect,
          statusText: isCorrect ? '正确答案' : '选项',
          statusClassName: isCorrect ? 'option-tag-correct' : 'option-tag-normal',
        };
      });

    return {
      ...data,
      sourceText: formatWrongQuestionSource('LEARNING'),
      sourceClassName: getWrongQuestionSourceClassName('LEARNING'),
      questionTypeText: formatWrongQuestionType(data.questionType),
      contentText: data.content.trim() || '题干内容暂缺',
      explanationText: data.explanation?.trim() || '暂无解析',
      wrongCountText: formatWrongQuestionCount(data.wrongCount),
      lastWrongAtText: formatLearningTimestamp(data.lastWrongAt),
      correctAnswerText: this.formatCorrectAnswer(options, data.correctOptionId),
      options,
      hasCourseEntry: isNonEmptyString(data.courseId),
      hasChapterEntry: isNonEmptyString(data.chapterId),
      answerUnavailableText: '当前接口暂未提供该题的原始作答记录',
    };
  },

  formatCorrectAnswer(options: WrongQuestionOptionCard[], correctOptionId: string) {
    const option = options.find((item) => item.optionId === correctOptionId);

    if (!option) {
      return '当前接口暂未提供可展示的正确答案';
    }

    return `${option.labelText}. ${option.contentText}`;
  },

  getReadableError(error: unknown) {
    if (error instanceof RequestError) {
      if (error.code === 'WRONG_QUESTION_NOT_FOUND' || error.statusCode === 404) {
        return {
          title: '错题不存在',
          message: '当前错题不存在，或你暂时没有权限查看该记录。',
          state: 'notFound' as const,
        };
      }

      if (error.code === 'INVALID_PARAMETER') {
        return {
          title: '题目参数无效',
          message: '当前题目参数无效，无法查看错题详情。',
          state: 'invalid' as const,
        };
      }

      if (error.statusCode === 401 || error.code === 'UNAUTHORIZED') {
        return {
          title: '登录已失效',
          message: '登录状态已失效，请重新登录后再查看错题详情。',
          state: 'unauthorized' as const,
        };
      }

      if (error.code === 'NETWORK_ERROR') {
        return {
          title: '加载失败',
          message: error.message,
          state: 'error' as const,
        };
      }

      return {
        title: '加载失败',
        message: error.message,
        state: 'error' as const,
      };
    }

    if (error instanceof Error) {
      return {
        title: '加载失败',
        message: error.message,
        state: 'error' as const,
      };
    }

    return {
      title: '加载失败',
      message: '请稍后重试。',
      state: 'error' as const,
    };
  },
});
