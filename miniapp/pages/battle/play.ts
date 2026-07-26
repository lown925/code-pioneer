import type {
  BattleAnswerSubmissionResponse,
  BattleContentBlock,
  BattleQuestionItemResponse,
  BattleQuestionOptionSnapshotResponse,
  BattleQuestionsResponse,
  BattleResultResponse,
  BattleSubmitActionResponse,
  BattleSubmittedAnswerResponse,
} from '../../types/battle';
import { getAuthStateSummary, redirectToLogin } from '../../utils/auth';
import {
  formatBattleDuration,
  generateBattleClientRequestId,
} from '../../utils/battle';
import { request, RequestError } from '../../utils/request';

declare function clearTimeout(timeoutId: number): void;

type PlayPageState =
  | 'LOADING'
  | 'COUNTDOWN'
  | 'PLAYING'
  | 'SUBMITTING'
  | 'WAITING_SETTLEMENT'
  | 'COMPLETED'
  | 'ERROR';

type QuestionType = 'SINGLE_CHOICE' | 'CODE_FILL';

type ViewBlock = BattleContentBlock & {
  blockKey: string;
  imageFailed: boolean;
  altText: string;
};

type OptionCard = {
  optionId: string;
  optionLabel: string;
  blocks: ViewBlock[];
  isSelected: boolean;
  isSubmittedSelected: boolean;
};

type QuestionCard = {
  battleQuestionId: string;
  orderIndex: number;
  questionNumberText: string;
  questionType: QuestionType;
  questionTypeText: string;
  difficultyText: string;
  stem: ViewBlock[];
  options: OptionCard[];
  programmingLanguage: string;
  answered: boolean;
  submittedAtText: string;
  submittedAnswerOptionId: string;
  submittedAnswerValue: string;
  draftOptionId: string;
  draftValue: string;
  navStatus: 'current' | 'submitted' | 'pending';
  navLabel: string;
  pendingClientRequestId: string;
  pendingDraftSignature: string;
  submitErrorMessage: string;
};

type PlayPageData = {
  battleId: string;
  isValidBattleId: boolean;
  state: PlayPageState;
  titleText: string;
  descriptionText: string;
  errorMessage: string;
  remainingTimeText: string;
  countdownText: string;
  currentQuestionIndex: number;
  questionCountText: string;
  submitButtonText: string;
  submitBattleButtonText: string;
  forfeitButtonText: string;
  isBattleActionPending: boolean;
  questions: QuestionCard[];
};

type PlayPageMethods = {
  ensureAuthenticated(): boolean;
  loadQuestions(options?: { preservePosition?: boolean }): Promise<void>;
  applyQuestionResponse(
    payload: BattleQuestionsResponse,
    options?: { preservePosition?: boolean },
  ): void;
  startTimeTicker(): void;
  stopTimeTicker(): void;
  startCountdownPolling(): void;
  stopCountdownPolling(): void;
  startSettlementPolling(): void;
  stopSettlementPolling(): void;
  updateTimeDisplay(): void;
  loadResultStatus(): Promise<void>;
  enterWaitingSettlement(descriptionText: string, errorMessage?: string): void;
  navigateToResult(autoNavigate?: boolean): void;
  handleRetry(): void;
  handleBackRoom(): void;
  handlePrevQuestion(): void;
  handleNextQuestion(): void;
  handleSelectQuestion(
    event: WechatMiniprogram.BaseEvent<{ index?: number }>,
  ): void;
  handleOptionSelect(
    event: WechatMiniprogram.BaseEvent<{
      questionId?: string;
      optionId?: string;
    }>,
  ): void;
  handleCodeInput(
    event: WechatMiniprogram.CustomEvent<{
      value?: string;
    }> & {
      currentTarget: WechatMiniprogram.BaseEvent['currentTarget'] & {
        dataset: {
          questionId?: string;
        };
      };
    },
  ): void;
  handleSubmitCurrentQuestion(): void;
  handleSubmitBattle(): void;
  submitBattle(): Promise<void>;
  handleForfeitBattle(): void;
  forfeitBattle(): Promise<void>;
  submitQuestion(questionId: string): Promise<void>;
  handleImageError(
    event: WechatMiniprogram.BaseEvent<{
      questionId?: string;
      optionId?: string;
      blockKey?: string;
    }>,
  ): void;
  buildQuestions(
    items: BattleQuestionItemResponse[],
    previousQuestions: QuestionCard[],
    currentQuestionId: string,
  ): {
    questions: QuestionCard[];
    currentQuestionIndex: number;
  };
  mapQuestion(
    item: BattleQuestionItemResponse,
    previous: QuestionCard | null,
    isCurrent: boolean,
  ): QuestionCard;
  mapBlocks(
    blocks: BattleContentBlock[],
    keyPrefix: string,
    previousBlocks?: ViewBlock[],
  ): ViewBlock[];
  mapOptions(
    options: BattleQuestionOptionSnapshotResponse[],
    questionId: string,
    draftOptionId: string,
    submittedAnswerOptionId: string,
    previousQuestion: QuestionCard | null,
  ): OptionCard[];
  getCurrentQuestion(): QuestionCard | null;
  replaceQuestion(question: QuestionCard): void;
  rebuildNavStatus(
    questions: QuestionCard[],
    currentQuestionIndex: number,
  ): QuestionCard[];
  updateQuestionDraft(
    questionId: string,
    updater: (question: QuestionCard) => QuestionCard,
  ): void;
  getDraftSignature(question: QuestionCard): string;
  getReadableError(error: unknown, fallback: string): string;
  mapPlayState(payload: BattleQuestionsResponse): PlayPageState;
  getQuestionTypeText(type: QuestionType): string;
  getDifficultyText(difficulty: string | null): string;
  normalizeSubmittedAnswer(
    answer: BattleSubmittedAnswerResponse | null,
  ): {
    submittedAnswerOptionId: string;
    submittedAnswerValue: string;
  };
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TIME_TICK_MS = 500;
const COUNTDOWN_POLL_MS = 1800;
const SETTLEMENT_POLL_MS = 1800;
const CODE_FILL_MAX_LENGTH = 4000;

let isPageActive = false;
let hasLoadedOnce = false;
let requestSerial = 0;
let timeTicker: number | null = null;
let countdownPollTicker: number | null = null;
let settlementPollTicker: number | null = null;
let isQuestionsRequesting = false;
let isResultRequesting = false;
let isSubmitting = false;
let isBattleActionRequesting = false;
let serverTimeOffsetMs = 0;
let startedAtTimestampMs = 0;
let expiresAtTimestampMs = 0;
let hasRedirectedToResult = false;

function parseTimestamp(value: string | null | undefined) {
  if (!value) {
    return 0;
  }

  const timestamp = Date.parse(value);

  return Number.isFinite(timestamp) ? timestamp : 0;
}

function getServerNowMs() {
  return Date.now() + serverTimeOffsetMs;
}

function showConfirmModal(options: {
  title: string;
  content: string;
  confirmText: string;
  cancelText: string;
  confirmColor?: string;
  success: (result: { confirm: boolean; cancel: boolean }) => void;
}) {
  (
    wx as unknown as {
      showModal: (modalOptions: typeof options) => void;
    }
  ).showModal(options);
}

function formatSubmittedAtLabel(value: string | null) {
  if (!value) {
    return '';
  }

  const timestamp = Date.parse(value);

  if (!Number.isFinite(timestamp)) {
    return '已提交';
  }

  const date = new Date(timestamp);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `已提交 ${hours}:${minutes}:${seconds}`;
}

Page<PlayPageData, PlayPageMethods>({
  data: {
    battleId: '',
    isValidBattleId: false,
    state: 'LOADING',
    titleText: '正在加载题目',
    descriptionText: '系统正在同步 Battle 题目、已答状态和剩余时间。',
    errorMessage: '',
    remainingTimeText: '00:00',
    countdownText: '',
    currentQuestionIndex: 0,
    questionCountText: '0 / 0',
    submitButtonText: '确认提交',
    submitBattleButtonText: '交卷',
    forfeitButtonText: '认输',
    isBattleActionPending: false,
    questions: [],
  },

  onLoad(options) {
    isPageActive = true;
    hasRedirectedToResult = false;
    const battleId =
      typeof options?.battleId === 'string' ? options.battleId.trim() : '';
    const isValidBattleId = UUID_PATTERN.test(battleId);

    this.setData({
      battleId,
      isValidBattleId,
      state: isValidBattleId ? 'LOADING' : 'ERROR',
      titleText: isValidBattleId ? '正在加载题目' : 'battleId 无效',
      descriptionText: isValidBattleId
        ? '系统正在同步 Battle 题目、已答状态和剩余时间。'
        : '当前页面没有收到合法的 Battle 标识。',
      errorMessage: '',
    });

    if (!isValidBattleId) {
      return;
    }

    void this.loadQuestions();
  },

  onShow() {
    isPageActive = true;

    if (hasLoadedOnce && this.data.isValidBattleId) {
      if (
        this.data.state === 'WAITING_SETTLEMENT' ||
        this.data.state === 'COMPLETED'
      ) {
        void this.loadResultStatus();
      } else {
        void this.loadQuestions({
          preservePosition: true,
        });
      }
    }
  },

  onHide() {
    this.stopTimeTicker();
    this.stopCountdownPolling();
    this.stopSettlementPolling();
  },

  onUnload() {
    isPageActive = false;
    hasRedirectedToResult = false;
    requestSerial += 1;
    this.stopTimeTicker();
    this.stopCountdownPolling();
    this.stopSettlementPolling();
  },

  onPullDownRefresh() {
    const loader =
      this.data.state === 'WAITING_SETTLEMENT' ||
      this.data.state === 'COMPLETED'
        ? this.loadResultStatus()
        : this.loadQuestions({
            preservePosition: true,
          });

    void loader.finally(() => {
      wx.stopPullDownRefresh();
    });
  },

  ensureAuthenticated() {
    if (getAuthStateSummary().isAuthenticated) {
      return true;
    }

    if (this.data.isValidBattleId) {
      redirectToLogin(
        `/pages/battle/play?battleId=${encodeURIComponent(this.data.battleId)}`,
      );
    } else {
      redirectToLogin('/pages/battle/index');
    }

    return false;
  },

  async loadQuestions(options?: { preservePosition?: boolean }) {
    if (
      !this.data.isValidBattleId ||
      !this.ensureAuthenticated() ||
      isQuestionsRequesting
    ) {
      return;
    }

    const currentRequestSerial = ++requestSerial;
    isQuestionsRequesting = true;

    if (this.data.questions.length === 0) {
      this.setData({
        state: 'LOADING',
        titleText: '正在加载题目',
        descriptionText: '系统正在同步 Battle 题目、已答状态和剩余时间。',
        errorMessage: '',
      });
    }

    try {
      const response = await request<BattleQuestionsResponse>({
        url: `/battles/${encodeURIComponent(this.data.battleId)}/questions`,
        method: 'GET',
        authMode: 'required',
      });

      if (!isPageActive || currentRequestSerial !== requestSerial) {
        return;
      }

      this.applyQuestionResponse(response, {
        preservePosition: options?.preservePosition,
      });
    } catch (error) {
      if (!isPageActive || currentRequestSerial !== requestSerial) {
        return;
      }

      this.stopTimeTicker();
      this.stopCountdownPolling();

      this.setData({
        state: 'ERROR',
        titleText: '题目加载失败',
        descriptionText: '你可以重新获取服务端题目状态，或返回 Battle 房间页。',
        errorMessage: this.getReadableError(
          error,
          'Battle 题目加载失败，请稍后重试。',
        ),
      });
    } finally {
      isQuestionsRequesting = false;
      hasLoadedOnce = true;
    }
  },

  applyQuestionResponse(
    payload: BattleQuestionsResponse,
    options?: { preservePosition?: boolean },
  ) {
    serverTimeOffsetMs = parseTimestamp(payload.serverTime) - Date.now();
    startedAtTimestampMs = parseTimestamp(payload.startedAt);
    expiresAtTimestampMs = parseTimestamp(payload.expiresAt);

    const currentQuestion =
      options?.preservePosition && this.data.questions.length > 0
        ? this.data.questions[this.data.currentQuestionIndex] ?? null
        : null;
    const currentQuestionId = currentQuestion?.battleQuestionId ?? '';
    const items = Array.isArray(payload.questions) ? payload.questions : [];
    const built = this.buildQuestions(items, this.data.questions, currentQuestionId);
    const nextState = this.mapPlayState(payload);
    const currentQuestionCard =
      built.questions[built.currentQuestionIndex] ?? null;

    this.stopTimeTicker();
    this.stopCountdownPolling();
    this.stopSettlementPolling();

    this.setData({
      state: nextState,
      titleText:
        nextState === 'COUNTDOWN'
          ? '即将开始答题'
          : nextState === 'WAITING_SETTLEMENT'
            ? '等待结算中'
            : nextState === 'COMPLETED'
              ? '本场对战已结束'
              : 'Battle 答题中',
      descriptionText:
        nextState === 'COUNTDOWN'
          ? '服务端倒计时尚未结束，题目将在可作答时自动加载。'
          : nextState === 'WAITING_SETTLEMENT'
            ? '作答时间已结束，当前已停止提交，等待后续结算阶段开放。'
            : nextState === 'COMPLETED'
              ? '当前房间已经结束，本页只保留题目和已提交状态展示。'
              : '题目数据以服务端快照为准，已提交题目不会展示正确与错误。',
      errorMessage: '',
      currentQuestionIndex: built.currentQuestionIndex,
      questionCountText: currentQuestionCard
        ? `${built.currentQuestionIndex + 1} / ${built.questions.length}`
        : `0 / ${built.questions.length}`,
      submitButtonText:
        nextState === 'SUBMITTING' ? '提交中' : '确认提交',
      submitBattleButtonText: '交卷',
      forfeitButtonText: '认输',
      isBattleActionPending: false,
      questions: built.questions,
    });

    this.updateTimeDisplay();
    this.startTimeTicker();

    if (nextState === 'COUNTDOWN') {
      this.startCountdownPolling();
      return;
    }

    if (nextState === 'WAITING_SETTLEMENT') {
      this.startSettlementPolling();
      return;
    }

    if (nextState === 'COMPLETED') {
      this.navigateToResult(true);
    }
  },

  startTimeTicker() {
    this.stopTimeTicker();

    if (!isPageActive) {
      return;
    }

    const tick = () => {
      if (!isPageActive) {
        timeTicker = null;
        return;
      }

      this.updateTimeDisplay();

      if (this.data.state !== 'ERROR' && this.data.state !== 'COMPLETED') {
        timeTicker = setTimeout(tick, TIME_TICK_MS) as unknown as number;
      }
    };

    tick();
  },

  stopTimeTicker() {
    if (timeTicker !== null) {
      clearTimeout(timeTicker);
      timeTicker = null;
    }
  },

  startCountdownPolling() {
    this.stopCountdownPolling();

    if (!isPageActive || this.data.state !== 'COUNTDOWN') {
      return;
    }

    countdownPollTicker = setTimeout(() => {
      countdownPollTicker = null;

      if (!isPageActive) {
        return;
      }

      void this.loadQuestions({
        preservePosition: true,
      });
    }, COUNTDOWN_POLL_MS) as unknown as number;
  },

  stopCountdownPolling() {
    if (countdownPollTicker !== null) {
      clearTimeout(countdownPollTicker);
      countdownPollTicker = null;
    }
  },

  startSettlementPolling() {
    this.stopSettlementPolling();

    if (!isPageActive || this.data.state !== 'WAITING_SETTLEMENT') {
      return;
    }

    settlementPollTicker = setTimeout(() => {
      settlementPollTicker = null;

      if (!isPageActive) {
        return;
      }

      void this.loadResultStatus();
    }, SETTLEMENT_POLL_MS) as unknown as number;
  },

  stopSettlementPolling() {
    if (settlementPollTicker !== null) {
      clearTimeout(settlementPollTicker);
      settlementPollTicker = null;
    }
  },

  updateTimeDisplay() {
    const now = getServerNowMs();
    const remainingSeconds =
      expiresAtTimestampMs > 0
        ? Math.max(0, Math.ceil((expiresAtTimestampMs - now) / 1000))
        : 0;
    const countdownSeconds =
      startedAtTimestampMs > 0
        ? Math.max(0, Math.ceil((startedAtTimestampMs - now) / 1000))
        : 0;

    if (
      remainingSeconds <= 0 &&
      (this.data.state === 'PLAYING' || this.data.state === 'SUBMITTING')
    ) {
      this.enterWaitingSettlement(
        '作答时间已结束，当前已停止提交，正在等待服务端完成结算。',
      );
      return;
    }

    if (this.data.state === 'COUNTDOWN' && countdownSeconds <= 0) {
      this.setData({
        countdownText: '0',
      });
      void this.loadQuestions({
        preservePosition: true,
      });
      return;
    }

    this.setData({
      remainingTimeText: formatBattleDuration(remainingSeconds),
      countdownText:
        this.data.state === 'COUNTDOWN' ? String(Math.max(1, countdownSeconds)) : '',
    });
  },

  async loadResultStatus() {
    if (
      !this.data.isValidBattleId ||
      !this.ensureAuthenticated() ||
      isResultRequesting
    ) {
      return;
    }

    const currentRequestSerial = ++requestSerial;
    isResultRequesting = true;

    try {
      const response = await request<BattleResultResponse>({
        url: `/battles/${encodeURIComponent(this.data.battleId)}/result`,
        method: 'GET',
        authMode: 'required',
      });

      if (!isPageActive || currentRequestSerial !== requestSerial) {
        return;
      }

      serverTimeOffsetMs = parseTimestamp(response.serverTime) - Date.now();

      if (response.completed) {
        this.navigateToResult(true);
        return;
      }

      const waitingMessage =
        response.status === 'COUNTDOWN'
          ? '对战倒计时尚未结束，结果将在整场作答结束后生成。'
          : response.status === 'IN_PROGRESS'
            ? '当前对战仍在进行中，结果将在整场作答结束后生成。'
            : '服务端正在处理本场结算，请稍候。';

      this.enterWaitingSettlement(waitingMessage);
    } catch (error) {
      if (!isPageActive || currentRequestSerial !== requestSerial) {
        return;
      }

      if (error instanceof RequestError) {
        if (
          error.code === 'BATTLE_NOT_PARTICIPANT' ||
          error.code === 'BATTLE_NOT_FOUND' ||
          error.code === 'BATTLE_SETTLEMENT_DATA_INVALID'
        ) {
          this.stopSettlementPolling();
          this.setData({
            state: 'ERROR',
            titleText: '结果获取失败',
            descriptionText: '当前 Battle 结果无法继续同步，你可以返回房间页或稍后重试。',
            errorMessage: this.getReadableError(
              error,
              'Battle 结果暂时不可用，请稍后重试。',
            ),
            isBattleActionPending: false,
            submitBattleButtonText: '交卷',
            forfeitButtonText: '认输',
          });
          return;
        }

        if (error.code === 'BATTLE_NOT_STARTED') {
          this.enterWaitingSettlement(
            '当前对战尚未结束，结果将在整场作答完成后自动生成。',
            '',
          );
          return;
        }
      }

      this.enterWaitingSettlement(
        '服务端正在处理本场结果，你可以稍后自动重试或手动下拉刷新。',
        this.getReadableError(error, 'Battle 结果暂时不可用，请稍后重试。'),
      );
    } finally {
      isResultRequesting = false;
    }
  },

  enterWaitingSettlement(descriptionText: string, errorMessage = '') {
    this.stopTimeTicker();
    this.stopCountdownPolling();

    this.setData({
      state: 'WAITING_SETTLEMENT',
      titleText: '等待结算中',
      descriptionText,
      errorMessage,
      remainingTimeText: '00:00',
      countdownText: '',
      submitButtonText: '确认提交',
      submitBattleButtonText: '交卷',
      forfeitButtonText: '认输',
      isBattleActionPending: false,
    });

    this.startSettlementPolling();
  },

  navigateToResult(autoNavigate = false) {
    if (!this.data.isValidBattleId) {
      return;
    }

    if (autoNavigate && hasRedirectedToResult) {
      return;
    }

    hasRedirectedToResult = true;
    const url = `/pages/battle/result?battleId=${encodeURIComponent(this.data.battleId)}`;

    wx.redirectTo({
      url,
      fail: () => {
        wx.navigateTo({
          url,
        });
      },
    });
  },

  handleRetry() {
    if (
      this.data.state === 'WAITING_SETTLEMENT' ||
      this.data.state === 'COMPLETED'
    ) {
      void this.loadResultStatus();
      return;
    }

    void this.loadQuestions({
      preservePosition: true,
    });
  },

  handleBackRoom() {
    if (!this.data.isValidBattleId) {
      wx.switchTab({
        url: '/pages/battle/index',
      });
      return;
    }

    wx.navigateTo({
      url: `/pages/battle/room?battleId=${encodeURIComponent(this.data.battleId)}`,
    });
  },

  handlePrevQuestion() {
    if (this.data.currentQuestionIndex <= 0) {
      return;
    }

    const nextIndex = this.data.currentQuestionIndex - 1;
    this.setData({
      currentQuestionIndex: nextIndex,
      questionCountText: `${nextIndex + 1} / ${this.data.questions.length}`,
      questions: this.rebuildNavStatus(this.data.questions, nextIndex),
    });
  },

  handleNextQuestion() {
    if (this.data.currentQuestionIndex >= this.data.questions.length - 1) {
      return;
    }

    const nextIndex = this.data.currentQuestionIndex + 1;
    this.setData({
      currentQuestionIndex: nextIndex,
      questionCountText: `${nextIndex + 1} / ${this.data.questions.length}`,
      questions: this.rebuildNavStatus(this.data.questions, nextIndex),
    });
  },

  handleSelectQuestion(
    event: WechatMiniprogram.BaseEvent<{ index?: number }>,
  ) {
    const index = Number(event.currentTarget.dataset.index);

    if (!Number.isInteger(index) || index < 0 || index >= this.data.questions.length) {
      return;
    }

    this.setData({
      currentQuestionIndex: index,
      questionCountText: `${index + 1} / ${this.data.questions.length}`,
      questions: this.rebuildNavStatus(this.data.questions, index),
    });
  },

  handleOptionSelect(
    event: WechatMiniprogram.BaseEvent<{
      questionId?: string;
      optionId?: string;
    }>,
  ) {
    const questionId = event.currentTarget.dataset.questionId ?? '';
    const optionId = event.currentTarget.dataset.optionId ?? '';
    const currentQuestion = this.getCurrentQuestion();

    if (
      !questionId ||
      !optionId ||
      !currentQuestion ||
      currentQuestion.battleQuestionId !== questionId ||
      currentQuestion.answered ||
      this.data.state !== 'PLAYING' ||
      this.data.isBattleActionPending
    ) {
      return;
    }

    this.updateQuestionDraft(questionId, (question) => {
      const nextQuestion = {
        ...question,
        draftOptionId: optionId,
        options: question.options.map((option) => ({
          ...option,
          isSelected: option.optionId === optionId,
        })),
      };

      const signature = this.getDraftSignature(nextQuestion);

      if (signature !== question.pendingDraftSignature) {
        nextQuestion.pendingClientRequestId = '';
        nextQuestion.pendingDraftSignature = '';
        nextQuestion.submitErrorMessage = '';
      }

      return nextQuestion;
    });
  },

  handleCodeInput(
    event: WechatMiniprogram.CustomEvent<{
      value?: string;
    }> & {
      currentTarget: WechatMiniprogram.BaseEvent['currentTarget'] & {
        dataset: {
          questionId?: string;
        };
      };
    },
  ) {
    const questionId = event.currentTarget.dataset.questionId ?? '';
    const value =
      typeof event.detail?.value === 'string'
        ? event.detail.value.slice(0, CODE_FILL_MAX_LENGTH)
        : '';
    const currentQuestion = this.getCurrentQuestion();

    if (
      !questionId ||
      !currentQuestion ||
      currentQuestion.battleQuestionId !== questionId ||
      currentQuestion.answered ||
      this.data.state !== 'PLAYING' ||
      this.data.isBattleActionPending
    ) {
      return;
    }

    this.updateQuestionDraft(questionId, (question) => {
      const nextQuestion = {
        ...question,
        draftValue: value,
      };
      const signature = this.getDraftSignature(nextQuestion);

      if (signature !== question.pendingDraftSignature) {
        nextQuestion.pendingClientRequestId = '';
        nextQuestion.pendingDraftSignature = '';
        nextQuestion.submitErrorMessage = '';
      }

      return nextQuestion;
    });
  },

  handleSubmitCurrentQuestion() {
    const currentQuestion = this.getCurrentQuestion();

    if (!currentQuestion || this.data.isBattleActionPending) {
      return;
    }

    void this.submitQuestion(currentQuestion.battleQuestionId);
  },

  handleSubmitBattle() {
    if (
      this.data.isBattleActionPending ||
      isSubmitting ||
      (this.data.state !== 'PLAYING' && this.data.state !== 'SUBMITTING')
    ) {
      return;
    }

    const total = this.data.questions.length;
    const submitted = this.data.questions.filter((question) => question.answered).length;
    const unanswered = Math.max(0, total - submitted);

    showConfirmModal({
      title: '确认交卷',
      content:
        unanswered > 0
          ? `当前已提交 ${submitted} / ${total} 题，仍有 ${unanswered} 题未提交。确认后将立即结束作答并进入结算等待。`
          : `当前 ${total} 题都已提交。确认后将立即结束作答并进入结算等待。`,
      confirmText: '确认交卷',
      cancelText: '继续作答',
      success: (result) => {
        if (result.confirm) {
          void this.submitBattle();
        }
      },
    });
  },

  async submitBattle() {
    if (
      !this.ensureAuthenticated() ||
      !this.data.isValidBattleId ||
      isBattleActionRequesting ||
      isSubmitting ||
      (this.data.state !== 'PLAYING' && this.data.state !== 'SUBMITTING')
    ) {
      return;
    }

    isBattleActionRequesting = true;

    this.setData({
      isBattleActionPending: true,
      submitBattleButtonText: '交卷中',
      forfeitButtonText: '处理中',
      errorMessage: '',
    });

    try {
      const response = await request<BattleSubmitActionResponse>({
        url: `/battles/${encodeURIComponent(this.data.battleId)}/submit`,
        method: 'POST',
        authMode: 'required',
      });

      if (!isPageActive) {
        return;
      }

      serverTimeOffsetMs = parseTimestamp(response.serverTime) - Date.now();

      if (response.completed || response.roomStatus === 'COMPLETED') {
        this.navigateToResult(true);
        return;
      }

      this.enterWaitingSettlement(
        response.waitingForOpponent
          ? '你已主动交卷，正在等待对手结束作答并完成结算。'
          : '整场作答已提交，服务端正在整理本场结果。',
      );
    } catch (error) {
      if (!isPageActive) {
        return;
      }

      this.setData({
        isBattleActionPending: false,
        submitBattleButtonText: '交卷',
        forfeitButtonText: '认输',
        errorMessage: this.getReadableError(
          error,
          '主动交卷失败，请稍后重试。',
        ),
      });
    } finally {
      isBattleActionRequesting = false;
    }
  },

  handleForfeitBattle() {
    if (
      this.data.isBattleActionPending ||
      isSubmitting ||
      (this.data.state !== 'COUNTDOWN' &&
        this.data.state !== 'PLAYING' &&
        this.data.state !== 'SUBMITTING')
    ) {
      return;
    }

    showConfirmModal({
      title: '确认认输',
      content: '认输会立即判负，并结束你当前这场 Battle。确认后将直接进入结算等待。',
      confirmText: '确认认输',
      cancelText: '继续对战',
      confirmColor: '#c24343',
      success: (result) => {
        if (result.confirm) {
          void this.forfeitBattle();
        }
      },
    });
  },

  async forfeitBattle() {
    if (
      !this.ensureAuthenticated() ||
      !this.data.isValidBattleId ||
      isBattleActionRequesting ||
      isSubmitting ||
      (this.data.state !== 'COUNTDOWN' &&
        this.data.state !== 'PLAYING' &&
        this.data.state !== 'SUBMITTING')
    ) {
      return;
    }

    isBattleActionRequesting = true;

    this.setData({
      isBattleActionPending: true,
      submitBattleButtonText: '处理中',
      forfeitButtonText: '认输中',
      errorMessage: '',
    });

    try {
      const response = await request<BattleSubmitActionResponse>({
        url: `/battles/${encodeURIComponent(this.data.battleId)}/forfeit`,
        method: 'POST',
        authMode: 'required',
      });

      if (!isPageActive) {
        return;
      }

      serverTimeOffsetMs = parseTimestamp(response.serverTime) - Date.now();

      if (response.completed || response.roomStatus === 'COMPLETED') {
        this.navigateToResult(true);
        return;
      }

      this.enterWaitingSettlement('已发起认输，服务端正在处理本场结算。');
    } catch (error) {
      if (!isPageActive) {
        return;
      }

      this.setData({
        isBattleActionPending: false,
        submitBattleButtonText: '交卷',
        forfeitButtonText: '认输',
        errorMessage: this.getReadableError(
          error,
          '认输失败，请稍后重试。',
        ),
      });
    } finally {
      isBattleActionRequesting = false;
    }
  },

  async submitQuestion(questionId: string) {
    if (
      !this.ensureAuthenticated() ||
      !this.data.isValidBattleId ||
      isSubmitting ||
      this.data.isBattleActionPending ||
      (this.data.state !== 'PLAYING' && this.data.state !== 'SUBMITTING')
    ) {
      return;
    }

    const question = this.data.questions.find((item) => item.battleQuestionId === questionId);

    if (!question || question.answered) {
      return;
    }

    let answerPayload:
      | {
          optionId: string;
        }
      | {
          value: string;
        };

    if (question.questionType === 'SINGLE_CHOICE') {
      if (!question.draftOptionId) {
        wx.showToast({
          title: '请先选择一个答案',
          icon: 'none',
        });
        return;
      }

      answerPayload = {
        optionId: question.draftOptionId,
      };
    } else {
      const draftValue = question.draftValue.trim();

      if (!draftValue) {
        wx.showToast({
          title: '请先填写答案',
          icon: 'none',
        });
        return;
      }

      answerPayload = {
        value: question.draftValue,
      };
    }

    const draftSignature = this.getDraftSignature(question);
    const clientRequestId =
      question.pendingClientRequestId &&
      question.pendingDraftSignature === draftSignature
        ? question.pendingClientRequestId
        : generateBattleClientRequestId('battle-answer');

    isSubmitting = true;

    this.setData({
      state: 'SUBMITTING',
      submitButtonText: '提交中',
      errorMessage: '',
    });

    this.updateQuestionDraft(questionId, (current) => ({
      ...current,
      pendingClientRequestId: clientRequestId,
      pendingDraftSignature: draftSignature,
      submitErrorMessage: '',
    }));

    try {
      const response = await request<BattleAnswerSubmissionResponse>({
        url: `/battles/${encodeURIComponent(this.data.battleId)}/answers`,
        method: 'POST',
        authMode: 'required',
        data: {
          battleQuestionId: questionId,
          clientRequestId,
          answer: answerPayload,
        } as WechatMiniprogram.IAnyObject,
      });

      if (!isPageActive) {
        return;
      }

      serverTimeOffsetMs = parseTimestamp(response.serverTime) - Date.now();

      this.updateQuestionDraft(questionId, (current) => ({
        ...current,
        answered: true,
        submittedAtText: formatSubmittedAtLabel(response.submittedAt),
        submittedAnswerOptionId:
          current.questionType === 'SINGLE_CHOICE' ? current.draftOptionId : '',
        submittedAnswerValue:
          current.questionType === 'CODE_FILL' ? current.draftValue : '',
        pendingClientRequestId: '',
        pendingDraftSignature: '',
        submitErrorMessage: '',
        options: current.options.map((option) => ({
          ...option,
          isSelected:
            current.questionType === 'SINGLE_CHOICE' &&
            option.optionId === current.draftOptionId,
          isSubmittedSelected:
            current.questionType === 'SINGLE_CHOICE' &&
            option.optionId === current.draftOptionId,
        })),
      }));

      const nextState =
        expiresAtTimestampMs > 0 && getServerNowMs() >= expiresAtTimestampMs
          ? 'WAITING_SETTLEMENT'
          : 'PLAYING';

      this.setData({
        state: nextState,
        submitButtonText: '确认提交',
        titleText:
          nextState === 'WAITING_SETTLEMENT' ? '等待结算中' : 'Battle 答题中',
        descriptionText:
          nextState === 'WAITING_SETTLEMENT'
            ? '作答时间已结束，当前已停止提交，等待后续结算阶段开放。'
            : '题目数据以服务端快照为准，已提交题目不会展示正确与错误。',
      });
    } catch (error) {
      if (!isPageActive) {
        return;
      }

      if (error instanceof RequestError) {
        if (error.code === 'BATTLE_ANSWER_ALREADY_SUBMITTED') {
          wx.showToast({
            title: '该题已提交，正在同步状态',
            icon: 'none',
          });
          await this.loadQuestions({
            preservePosition: true,
          });
          return;
        }

        if (
          error.code === 'BATTLE_EXPIRED' ||
          error.code === 'BATTLE_SETTLEMENT_IN_PROGRESS'
        ) {
          this.enterWaitingSettlement(
            '作答时间已结束，当前已停止提交，服务端正在处理本场结算。',
            this.getReadableError(error, '作答时间已结束。'),
          );
          return;
        }

        if (error.code === 'BATTLE_ALREADY_COMPLETED') {
          this.setData({
            state: 'COMPLETED',
            titleText: '本场对战已结束',
            descriptionText: '当前房间已经结束，正在跳转 Battle 结果页。',
            submitButtonText: '确认提交',
            errorMessage: this.getReadableError(error, '本场对战已结束。'),
          });
          this.navigateToResult(true);
          return;
        }
      }

      this.updateQuestionDraft(questionId, (current) => ({
        ...current,
        submitErrorMessage: this.getReadableError(
          error,
          '当前题目提交失败，请稍后重试。',
        ),
      }));

      this.setData({
        state: 'PLAYING',
        submitButtonText: '重试提交',
      });
    } finally {
      isSubmitting = false;
    }
  },

  handleImageError(
    event: WechatMiniprogram.BaseEvent<{
      questionId?: string;
      optionId?: string;
      blockKey?: string;
    }>,
  ) {
    const questionId = event.currentTarget.dataset.questionId ?? '';
    const optionId = event.currentTarget.dataset.optionId ?? '';
    const blockKey = event.currentTarget.dataset.blockKey ?? '';

    if (!questionId || !blockKey) {
      return;
    }

    this.updateQuestionDraft(questionId, (question) => {
      const markBlockFailed = (blocks: ViewBlock[]) =>
        blocks.map((block) =>
          block.blockKey === blockKey ? { ...block, imageFailed: true } : block,
        );

      return {
        ...question,
        stem: markBlockFailed(question.stem),
        options: question.options.map((option) =>
          optionId && option.optionId === optionId
            ? {
                ...option,
                blocks: markBlockFailed(option.blocks),
              }
            : option,
        ),
      };
    });
  },

  buildQuestions(
    items: BattleQuestionItemResponse[],
    previousQuestions: QuestionCard[],
    currentQuestionId: string,
  ) {
    const previousMap = new Map(
      previousQuestions.map((question) => [question.battleQuestionId, question]),
    );
    const builtQuestions = items.map((item) =>
      this.mapQuestion(
        item,
        previousMap.get(item.battleQuestionId) ?? null,
        false,
      ),
    );

    const nextIndex = currentQuestionId
      ? Math.max(
          0,
          builtQuestions.findIndex(
            (question) => question.battleQuestionId === currentQuestionId,
          ),
        )
      : 0;

    return {
      questions: this.rebuildNavStatus(builtQuestions, nextIndex),
      currentQuestionIndex:
        builtQuestions.length === 0 ? 0 : Math.min(nextIndex, builtQuestions.length - 1),
    };
  },

  mapQuestion(
    item: BattleQuestionItemResponse,
    previous: QuestionCard | null,
    isCurrent: boolean,
  ) {
    const questionType = item.questionType as QuestionType;
    const normalizedSubmitted = this.normalizeSubmittedAnswer(item.submittedAnswer);
    const answered = item.answered;
    const draftOptionId = answered
      ? normalizedSubmitted.submittedAnswerOptionId
      : previous?.draftOptionId ?? '';
    const draftValue = answered
      ? normalizedSubmitted.submittedAnswerValue
      : previous?.draftValue ?? '';

    return {
      battleQuestionId: item.battleQuestionId,
      orderIndex: item.orderIndex,
      questionNumberText: `第 ${item.orderIndex + 1} 题`,
      questionType,
      questionTypeText: this.getQuestionTypeText(questionType),
      difficultyText: this.getDifficultyText(item.difficulty),
      stem: this.mapBlocks(
        item.stem,
        `${item.battleQuestionId}-stem`,
        previous?.stem,
      ),
      options: this.mapOptions(
        item.options,
        item.battleQuestionId,
        draftOptionId,
        normalizedSubmitted.submittedAnswerOptionId,
        previous,
      ),
      programmingLanguage: item.programmingLanguage ?? '',
      answered,
      submittedAtText: answered ? formatSubmittedAtLabel(item.submittedAt) : '',
      submittedAnswerOptionId: normalizedSubmitted.submittedAnswerOptionId,
      submittedAnswerValue: normalizedSubmitted.submittedAnswerValue,
      draftOptionId,
      draftValue,
      navStatus: isCurrent ? 'current' : answered ? 'submitted' : 'pending',
      navLabel: String(item.orderIndex + 1),
      pendingClientRequestId: answered ? '' : previous?.pendingClientRequestId ?? '',
      pendingDraftSignature: answered ? '' : previous?.pendingDraftSignature ?? '',
      submitErrorMessage: answered ? '' : previous?.submitErrorMessage ?? '',
    };
  },

  mapBlocks(
    blocks: BattleContentBlock[],
    keyPrefix: string,
    previousBlocks?: ViewBlock[],
  ) {
    const previousFailedMap = new Map(
      (previousBlocks ?? []).map((block) => [block.blockKey, block.imageFailed]),
    );

    return blocks.map((block, index) => {
      const blockKey = `${keyPrefix}-${index}`;
      const imageFailed = previousFailedMap.get(blockKey) ?? false;

      if (block.type === 'TEXT') {
        return {
          ...block,
          blockKey,
          imageFailed,
          altText: '',
        };
      }

      if (block.type === 'CODE') {
        return {
          ...block,
          blockKey,
          imageFailed,
          altText: '',
        };
      }

      return {
        ...block,
        blockKey,
        imageFailed,
        altText: block.alt?.trim() || '图片加载失败',
      };
    });
  },

  mapOptions(
    options: BattleQuestionOptionSnapshotResponse[],
    questionId: string,
    draftOptionId: string,
    submittedAnswerOptionId: string,
    previousQuestion: QuestionCard | null,
  ) {
    const previousOptionMap = new Map(
      (previousQuestion?.options ?? []).map((option) => [option.optionId, option]),
    );

    return options.map((option, index) => ({
      optionId: option.id,
      optionLabel: String.fromCharCode(65 + index),
      blocks: this.mapBlocks(
        option.blocks,
        `${questionId}-option-${option.id}`,
        previousOptionMap.get(option.id)?.blocks,
      ),
      isSelected: draftOptionId === option.id,
      isSubmittedSelected: submittedAnswerOptionId === option.id,
    }));
  },

  getCurrentQuestion() {
    return this.data.questions[this.data.currentQuestionIndex] ?? null;
  },

  replaceQuestion(question: QuestionCard) {
    const nextQuestions = this.data.questions.map((item) =>
      item.battleQuestionId === question.battleQuestionId ? question : item,
    );
    const currentQuestion =
      nextQuestions[this.data.currentQuestionIndex] ?? question;

    this.setData({
      questions: this.rebuildNavStatus(
        nextQuestions,
        this.data.currentQuestionIndex,
      ),
      questionCountText: `${this.data.currentQuestionIndex + 1} / ${nextQuestions.length}`,
      submitButtonText:
        currentQuestion.submitErrorMessage && !currentQuestion.answered
          ? '重试提交'
          : '确认提交',
    });
  },

  rebuildNavStatus(
    questions: QuestionCard[],
    currentQuestionIndex: number,
  ) {
    return questions.map((question, index) => ({
      ...question,
      navStatus:
        index === currentQuestionIndex
          ? 'current'
          : question.answered
            ? 'submitted'
            : 'pending',
    }));
  },

  updateQuestionDraft(
    questionId: string,
    updater: (question: QuestionCard) => QuestionCard,
  ) {
    const currentQuestion = this.data.questions.find(
      (item) => item.battleQuestionId === questionId,
    );

    if (!currentQuestion) {
      return;
    }

    this.replaceQuestion(updater(currentQuestion));
  },

  getDraftSignature(question: QuestionCard) {
    if (question.questionType === 'SINGLE_CHOICE') {
      return `SINGLE_CHOICE:${question.draftOptionId}`;
    }

    return `CODE_FILL:${question.draftValue}`;
  },

  getReadableError(error: unknown, fallback: string) {
    if (error instanceof RequestError) {
      if (error.statusCode === 401 || error.code === 'UNAUTHORIZED') {
        redirectToLogin(
          `/pages/battle/play?battleId=${encodeURIComponent(this.data.battleId)}`,
        );
        return '登录状态已失效，请重新登录后再继续答题。';
      }

      if (error.code === 'NETWORK_ERROR') {
        return '无法连接 Battle 答题服务，请确认后端服务已启动。';
      }

      if (error.code === 'BATTLE_ROOM_NOT_READY') {
        return '当前房间尚未进入答题阶段，请等待倒计时结束后再试。';
      }

      if (error.code === 'BATTLE_COUNTDOWN_NOT_FINISHED') {
        return '倒计时尚未结束，当前还不能正式提交答案。';
      }

      if (error.code === 'BATTLE_ANSWER_ALREADY_SUBMITTED') {
        return '当前题目已经提交，正在同步服务端状态。';
      }

      if (error.code === 'BATTLE_INVALID_ANSWER') {
        return '当前答案格式无效，请检查后重新提交。';
      }

      if (error.code === 'BATTLE_EXPIRED') {
        return '本场对战作答时间已到，当前已停止提交。';
      }

      if (error.code === 'BATTLE_SETTLEMENT_IN_PROGRESS') {
        return '当前对战正在结算中，暂时不能继续提交答案。';
      }

      if (error.code === 'BATTLE_ALREADY_COMPLETED') {
        return '当前对战已经完成，题目只保留为只读展示。';
      }

      return error.message || fallback;
    }

    if (error instanceof Error && error.message) {
      return error.message;
    }

    return fallback;
  },

  mapPlayState(payload: BattleQuestionsResponse) {
    if (payload.status === 'COUNTDOWN') {
      return 'COUNTDOWN';
    }

    if (payload.status === 'SETTLING') {
      return 'WAITING_SETTLEMENT';
    }

    if (payload.status === 'COMPLETED') {
      return 'COMPLETED';
    }

    if (
      payload.status === 'IN_PROGRESS' &&
      expiresAtTimestampMs > 0 &&
      getServerNowMs() >= expiresAtTimestampMs
    ) {
      return 'WAITING_SETTLEMENT';
    }

    return 'PLAYING';
  },

  getQuestionTypeText(type: QuestionType) {
    return type === 'SINGLE_CHOICE' ? '单选题' : '代码填空题';
  },

  getDifficultyText(difficulty: string | null) {
    if (difficulty === 'EASY') {
      return '简单';
    }

    if (difficulty === 'MEDIUM') {
      return '中等';
    }

    if (difficulty === 'HARD') {
      return '困难';
    }

    return '未知难度';
  },

  normalizeSubmittedAnswer(answer: BattleSubmittedAnswerResponse | null) {
    if (!answer) {
      return {
        submittedAnswerOptionId: '',
        submittedAnswerValue: '',
      };
    }

    if (answer.type === 'SINGLE_CHOICE') {
      return {
        submittedAnswerOptionId: answer.optionId,
        submittedAnswerValue: '',
      };
    }

    return {
      submittedAnswerOptionId: '',
      submittedAnswerValue: answer.value,
    };
  },
});
