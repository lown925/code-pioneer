import { registerThemedPage } from '../../utils/theme-page';
import type {
  WrongQuestionDetail,
  WrongQuestionDetailResponse,
  WrongQuestionOption,
  WrongQuestionSource,
} from '../../types/wrong-question';
import type {
  BattleContentBlock,
  BattleQuestionOptionSnapshotResponse,
} from '../../types/battle';
import { getAuthStateSummary, redirectToLogin } from '../../utils/auth';
import { formatLearningTimestamp } from '../../utils/time';
import {
  formatWrongQuestionCount,
  formatWrongQuestionSource,
  formatWrongQuestionType,
  getWrongQuestionOptionLabel,
  getWrongQuestionSourceClassName,
  normalizeWrongQuestionSource,
} from '../../utils/wrong-question';
import { request, RequestError } from '../../utils/request';

type PageState =
  | 'loading'
  | 'success'
  | 'invalid'
  | 'notFound'
  | 'error'
  | 'unauthorized';

type ViewBlock = BattleContentBlock & {
  blockKey: string;
  imageFailed: boolean;
  altText: string;
};

type WrongQuestionOptionCard = WrongQuestionOption & {
  labelText: string;
  contentText: string;
  isCorrect: boolean;
  statusText: string;
  statusClassName: string;
};

type BattleOptionCard = {
  optionId: string;
  labelText: string;
  blocks: ViewBlock[];
  isCorrect: boolean;
  isMyAnswer: boolean;
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
  learningMyAnswerText: string;
  isLearningTextQuestion: boolean;
  isLearningCodeFill: boolean;
  options: WrongQuestionOptionCard[];
  hasCourseEntry: boolean;
  hasChapterEntry: boolean;
  answerUnavailableText: string;
  isBattleSource: boolean;
  battleCompletedAtText: string;
  battleOpponentText: string;
  battleStemBlocks: ViewBlock[];
  battleOptions: BattleOptionCard[];
  battleMyAnswerLabel: string;
  battleMyAnswerText: string;
  battleMyAnswerBlocks: ViewBlock[];
  battleCorrectAnswerLabel: string;
  battleCorrectAnswerText: string;
  battleCorrectAnswerBlocks: ViewBlock[];
  battleExplanationBlocks: ViewBlock[];
  hasBattleExplanation: boolean;
  battleKnowledgeHintText: string;
};

type WrongQuestionDetailPageData = {
  state: PageState;
  errorTitle: string;
  errorMessage: string;
  questionId: string;
  source: '' | WrongQuestionSource;
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
  handleImageError(
    event: WechatMiniprogram.BaseEvent<{
      section?: string;
      blockKey?: string;
      optionId?: string;
    }>,
  ): void;
  mapDetail(data: WrongQuestionDetailResponse): WrongQuestionDetailCard;
  mapLearningOptions(data: WrongQuestionDetailResponse): WrongQuestionOptionCard[];
  mapBattleOptions(data: WrongQuestionDetailResponse): BattleOptionCard[];
  mapBlocks(blocks: BattleContentBlock[], keyPrefix: string): ViewBlock[];
  formatCorrectAnswer(
    options: WrongQuestionOptionCard[],
    correctOptionId: string | null,
  ): string;
  getBattleOptionBlocks(
    options: BattleQuestionOptionSnapshotResponse[] | null | undefined,
    optionId: string,
  ): BattleContentBlock[];
  getBattleOptionLabel(
    options: BattleQuestionOptionSnapshotResponse[] | null | undefined,
    optionId: string,
  ): string;
  updateDetail(updater: (detail: WrongQuestionDetailCard) => WrongQuestionDetailCard): void;
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

registerThemedPage<WrongQuestionDetailPageData, WrongQuestionDetailPageMethods>({
  data: {
    state: 'loading',
    errorTitle: '',
    errorMessage: '',
    questionId: '',
    source: '',
    isReloading: false,
    detail: null,
  },

  onLoad(query) {
    isPageActive = true;

    const questionIdRaw =
      typeof query.questionId === 'string' ? decodeQueryValue(query.questionId) : '';
    const source = normalizeWrongQuestionSource(query.source);

    if (!isNonEmptyString(questionIdRaw) || !this.validateQuestionId(questionIdRaw)) {
      this.setData({
        state: 'invalid',
        errorTitle: '题目参数无效',
        errorMessage: '当前题目参数无效，无法查看错题详情。',
        questionId: '',
        source,
        detail: null,
      });
      return;
    }

    this.setData({
      questionId: questionIdRaw,
      source,
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
      return this.data.source
        ? `/pages/wrong-question/index?source=${this.data.source}`
        : '/pages/wrong-question/index';
    }

    const sourceQuery = this.data.source ? `&source=${this.data.source}` : '';

    return `/pages/wrong-question/detail?questionId=${encodeURIComponent(this.data.questionId)}${sourceQuery}`;
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
        data: this.data.source
          ? ({ source: this.data.source } as WechatMiniprogram.IAnyObject)
          : undefined,
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

    const url = this.data.source
      ? `/pages/wrong-question/index?source=${this.data.source}`
      : '/pages/wrong-question/index';

    wx.reLaunch({
      url,
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

  handleImageError(
    event: WechatMiniprogram.BaseEvent<{
      section?: string;
      blockKey?: string;
      optionId?: string;
    }>,
  ) {
    const section = event.currentTarget.dataset.section ?? '';
    const blockKey = event.currentTarget.dataset.blockKey ?? '';
    const optionId = event.currentTarget.dataset.optionId ?? '';

    if (!blockKey || !this.data.detail) {
      return;
    }

    const markBlocks = (blocks: ViewBlock[]) =>
      blocks.map((block) =>
        block.blockKey === blockKey ? { ...block, imageFailed: true } : block,
      );

    this.updateDetail((detail) => {
      if (section === 'stem') {
        return {
          ...detail,
          battleStemBlocks: markBlocks(detail.battleStemBlocks),
        };
      }

      if (section === 'my-answer') {
        return {
          ...detail,
          battleMyAnswerBlocks: markBlocks(detail.battleMyAnswerBlocks),
        };
      }

      if (section === 'correct-answer') {
        return {
          ...detail,
          battleCorrectAnswerBlocks: markBlocks(detail.battleCorrectAnswerBlocks),
        };
      }

      if (section === 'explanation') {
        return {
          ...detail,
          battleExplanationBlocks: markBlocks(detail.battleExplanationBlocks),
        };
      }

      if (section === 'option') {
        return {
          ...detail,
          battleOptions: detail.battleOptions.map((option) =>
            option.optionId === optionId
              ? {
                  ...option,
                  blocks: markBlocks(option.blocks),
                }
              : option,
          ),
        };
      }

      return detail;
    });
  },

  mapDetail(data: WrongQuestionDetailResponse) {
    const source = normalizeWrongQuestionSource(data.source) || 'LEARNING';
    const isBattleSource = source === 'BATTLE';
    const learningOptions = this.mapLearningOptions(data);
    const battleOptions = isBattleSource ? this.mapBattleOptions(data) : [];

    let battleMyAnswerLabel = '我的错误作答';
    let battleMyAnswerText = '当前接口暂未提供该题的原始作答记录';
    let battleMyAnswerBlocks: ViewBlock[] = [];

    if (isBattleSource && data.latestWrongAnswer) {
      if (data.latestWrongAnswer.type === 'SINGLE_CHOICE') {
        const optionLabel = this.getBattleOptionLabel(
          data.optionSnapshots,
          data.latestWrongAnswer.optionId,
        );
        battleMyAnswerLabel = '我的错误作答';
        battleMyAnswerText = optionLabel
          ? `错误选择：${optionLabel}`
          : '已提交错误单选答案';
        battleMyAnswerBlocks = this.mapBlocks(
          this.getBattleOptionBlocks(
            data.optionSnapshots,
            data.latestWrongAnswer.optionId,
          ),
          `${data.questionId}-my-answer`,
        );
      } else if (data.latestWrongAnswer.type === 'CODE_FILL') {
        battleMyAnswerLabel = '我的错误作答';
        battleMyAnswerText = '已提交错误代码填空答案';
        battleMyAnswerBlocks = this.mapBlocks(
          [
            {
              type: 'CODE',
              code: data.latestWrongAnswer.value,
              language: data.programmingLanguage ?? undefined,
            },
          ],
          `${data.questionId}-my-answer`,
        );
      }
    }

    let battleCorrectAnswerLabel = '正确答案';
    let battleCorrectAnswerText = '';
    let battleCorrectAnswerBlocks: ViewBlock[] = [];

    if (isBattleSource && data.correctAnswer?.type === 'SINGLE_CHOICE') {
      const optionLabel = this.getBattleOptionLabel(
        data.optionSnapshots,
        data.correctAnswer.optionId,
      );
      battleCorrectAnswerText = optionLabel
        ? `正确选项：${optionLabel}`
        : '正确单选答案';
      battleCorrectAnswerBlocks = this.mapBlocks(
        this.getBattleOptionBlocks(
          data.optionSnapshots,
          data.correctAnswer.optionId,
        ),
        `${data.questionId}-correct-answer`,
      );
    } else if (isBattleSource) {
      battleCorrectAnswerLabel = '代码填空标准答案';
      battleCorrectAnswerText = '当前正式接口未返回代码填空标准答案文本';
    }

    const battleExplanationBlocks =
      isBattleSource && Array.isArray(data.explanation)
        ? this.mapBlocks(data.explanation, `${data.questionId}-explanation`)
        : [];
    const isLearningTextQuestion =
      !isBattleSource &&
      (data.questionType === 'FILL_BLANK' || data.questionType === 'CODE_FILL');
    const textCorrectAnswer =
      data.correctAnswer &&
      (data.correctAnswer.type === 'FILL_BLANK' ||
        data.correctAnswer.type === 'CODE_FILL')
        ? data.correctAnswer.acceptedAnswers.join(' / ')
        : '';
    const learningMyAnswerText =
      !isBattleSource &&
      data.latestWrongAnswer &&
      (data.latestWrongAnswer.type === 'FILL_BLANK' ||
        data.latestWrongAnswer.type === 'CODE_FILL')
        ? data.latestWrongAnswer.value || '未记录到文本作答'
        : '当前接口暂未提供该题的原始作答记录';

    return {
      ...data,
      sourceText: formatWrongQuestionSource(source),
      sourceClassName: getWrongQuestionSourceClassName(source),
      questionTypeText: formatWrongQuestionType(data.questionType),
      contentText: data.content.trim() || '题干内容暂缺',
      explanationText:
        typeof data.explanation === 'string'
          ? data.explanation.trim() || '暂无解析'
          : '暂无解析',
      wrongCountText: formatWrongQuestionCount(data.wrongCount),
      lastWrongAtText: formatLearningTimestamp(data.lastWrongAt),
      correctAnswerText:
        textCorrectAnswer ||
        this.formatCorrectAnswer(learningOptions, data.correctOptionId),
      learningMyAnswerText,
      isLearningTextQuestion,
      isLearningCodeFill: !isBattleSource && data.questionType === 'CODE_FILL',
      options: learningOptions,
      hasCourseEntry: isNonEmptyString(data.courseId),
      hasChapterEntry: isNonEmptyString(data.chapterId),
      answerUnavailableText: learningMyAnswerText,
      isBattleSource,
      battleCompletedAtText: data.battle?.completedAt
        ? formatLearningTimestamp(data.battle.completedAt)
        : formatLearningTimestamp(data.lastWrongAt),
      battleOpponentText:
        data.battle?.opponent?.nickname?.trim() || '对手信息暂缺',
      battleStemBlocks: this.mapBlocks(data.stem ?? [], `${data.questionId}-stem`),
      battleOptions,
      battleMyAnswerLabel,
      battleMyAnswerText,
      battleMyAnswerBlocks,
      battleCorrectAnswerLabel,
      battleCorrectAnswerText,
      battleCorrectAnswerBlocks,
      battleExplanationBlocks,
      hasBattleExplanation: battleExplanationBlocks.length > 0,
      battleKnowledgeHintText: '当前正式接口未返回知识点信息',
    };
  },

  mapLearningOptions(data: WrongQuestionDetailResponse) {
    return (data.options ?? [])
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
  },

  mapBattleOptions(data: WrongQuestionDetailResponse) {
    return (data.optionSnapshots ?? [])
      .slice()
      .sort((left, right) => left.orderIndex - right.orderIndex)
      .map((option, index) => ({
        optionId: option.id,
        labelText: getWrongQuestionOptionLabel(index),
        blocks: this.mapBlocks(option.blocks, `${data.questionId}-option-${option.id}`),
        isCorrect: data.correctOptionId === option.id,
        isMyAnswer:
          data.latestWrongAnswer?.type === 'SINGLE_CHOICE' &&
          data.latestWrongAnswer.optionId === option.id,
      }));
  },

  mapBlocks(blocks: BattleContentBlock[], keyPrefix: string) {
    return blocks.map((block, index) => ({
      ...block,
      blockKey: `${keyPrefix}-${index}`,
      imageFailed: false,
      altText: block.type === 'IMAGE' ? block.alt?.trim() || '图片加载失败' : '',
    }));
  },

  formatCorrectAnswer(
    options: WrongQuestionOptionCard[],
    correctOptionId: string | null,
  ) {
    if (!correctOptionId) {
      return '当前接口暂未提供可展示的正确答案';
    }

    const option = options.find((item) => item.optionId === correctOptionId);

    if (!option) {
      return '当前接口暂未提供可展示的正确答案';
    }

    return `${option.labelText}. ${option.contentText}`;
  },

  getBattleOptionBlocks(
    options: BattleQuestionOptionSnapshotResponse[] | null | undefined,
    optionId: string,
  ) {
    return options?.find((option) => option.id === optionId)?.blocks ?? [];
  },

  getBattleOptionLabel(
    options: BattleQuestionOptionSnapshotResponse[] | null | undefined,
    optionId: string,
  ) {
    const list =
      options
        ?.slice()
        .sort((left, right) => left.orderIndex - right.orderIndex) ?? [];
    const index = list.findIndex((option) => option.id === optionId);

    return index >= 0 ? getWrongQuestionOptionLabel(index) : '';
  },

  updateDetail(updater: (detail: WrongQuestionDetailCard) => WrongQuestionDetailCard) {
    if (!this.data.detail) {
      return;
    }

    this.setData({
      detail: updater(this.data.detail),
    });
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
          message: '网络连接失败，请确认后端服务已启动后重试。',
          state: 'error' as const,
        };
      }

      return {
        title: '加载失败',
        message: '错题详情加载失败，请稍后重试。',
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
