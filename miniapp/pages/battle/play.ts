import type {
  BattleAnswerSubmissionResponse,
  BattleContentBlock,
  BattleParticipantSummary,
  BattleQuestionItemResponse,
  BattleQuestionOptionSnapshotResponse,
  BattleQuestionsResponse,
  BattleRoomDetailResponse,
  PendingBattleResultResponse,
  BattleResultResponse,
  BattleSubmitActionResponse,
  BattleSubmittedAnswerResponse,
} from '../../types/battle';
import { getAuthStateSummary, redirectToLogin } from '../../utils/auth';
import {
  formatBattleDuration,
  formatBattleInitial,
  formatBattleNickname,
  generateBattleClientRequestId,
  getBattleErrorMessage,
  showBattleConfirmModal,
} from '../../utils/battle';
import { request, RequestError } from '../../utils/request';
import { registerThemedPage } from '../../utils/theme-page';
import type { ResolvedTheme, ThemeMode } from '../../utils/theme';

declare function clearTimeout(timeoutId: number): void;

type PlayPageState =
  'LOADING' | 'COUNTDOWN' | 'PLAYING' | 'WAITING_SETTLEMENT' | 'COMPLETED' | 'ERROR';

type QuestionType = 'SINGLE_CHOICE' | 'CODE_FILL';
type QuestionSyncState = 'idle' | 'saving' | 'error' | 'saved';
type QuestionOverviewState = 'current' | 'answered' | 'pending';

type BattlePlayerCard = {
  nicknameText: string;
  avatarUrl: string;
  avatarFallbackText: string;
  ratingText: string;
};

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
};

type QuestionCard = {
  battleQuestionId: string;
  orderIndex: number;
  questionType: QuestionType;
  questionTypeText: string;
  difficultyText: string;
  stem: ViewBlock[];
  options: OptionCard[];
  programmingLanguage: string;
  answered: boolean;
  submittedAtText: string;
  savedAnswerOptionId: string;
  savedAnswerValue: string;
  draftOptionId: string;
  draftValue: string;
  answerVersion: number;
  savedAnswerVersion: number;
  inFlightAnswerVersion: number;
  pendingClientRequestId: string;
  pendingRequestVersion: number;
  syncState: QuestionSyncState;
  syncErrorMessage: string;
  syncStatusText: string;
  overviewStatus: QuestionOverviewState;
  navLabel: string;
};

type PlayPageData = {
  navTopPadding: number;
  navBarHeight: number;
  themeMode: ThemeMode;
  resolvedTheme: ResolvedTheme;
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
  submitBattleButtonText: string;
  forfeitButtonText: string;
  isBattleActionPending: boolean;
  participantStatus: string | null;
  isParticipantLocked: boolean;
  isTrainingMode: boolean;
  totalQuestionsText: string;
  myAnsweredCount: number;
  opponentAnsweredCount: number | null;
  myProgressText: string;
  opponentProgressText: string;
  myProgressStyle: string;
  opponentProgressStyle: string;
  hasProgressActivity: boolean;
  mySubmittedText: string;
  opponentSubmittedText: string;
  myPlayer: BattlePlayerCard | null;
  opponentPlayer: BattlePlayerCard | null;
  isOverviewOpen: boolean;
  questions: QuestionCard[];
};

type PlayPageMethods = {
  ensureAuthenticated(): boolean;
  loadPlayerContext(): Promise<void>;
  applyPlayerContext(payload: BattleRoomDetailResponse): void;
  mapPlayer(participant: BattleParticipantSummary | null): BattlePlayerCard | null;
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
  startResultPolling(): void;
  stopResultPolling(): void;
  stopAllQuestionDebounceTimers(): void;
  updateTimeDisplay(): void;
  loadResultStatus(options?: { preservePlaying?: boolean }): Promise<void>;
  setPendingProgress(response: PendingBattleResultResponse): void;
  enterWaitingSettlement(descriptionText: string, errorMessage?: string): void;
  navigateToResult(autoNavigate?: boolean): void;
  handleRetry(): void;
  handleBackRoom(): void;
  handlePrevQuestion(): void;
  handleNextQuestion(): void;
  handleSelectQuestion(event: WechatMiniprogram.BaseEvent<{ index?: number }>): void;
  handleOpenOverview(): void;
  handleCloseOverview(): void;
  handleOverviewPanelTap(): void;
  handleOverviewSelectQuestion(event: WechatMiniprogram.BaseEvent<{ index?: number }>): void;
  handleOverviewSubmit(): void;
  handleOverviewForfeit(): void;
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
  handleRetryQuestionSync(
    event: WechatMiniprogram.BaseEvent<{
      questionId?: string;
    }>,
  ): void;
  handleSubmitBattle(): void;
  submitBattle(): Promise<void>;
  flushPendingQuestionSaves(): Promise<void>;
  handleForfeitBattle(): void;
  forfeitBattle(): Promise<void>;
  scheduleQuestionSync(questionId: string, immediate?: boolean): void;
  executeQuestionSync(questionId: string): Promise<void>;
  buildAnswerPayload(question: QuestionCard): { optionId: string } | { value: string } | null;
  hasAnswerDraft(question: QuestionCard): boolean;
  hasUnsyncedDraft(question: QuestionCard): boolean;
  isQuestionEditable(question: QuestionCard): boolean;
  getQuestionSyncLabel(question: QuestionCard): string;
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
  mapQuestion(item: BattleQuestionItemResponse, previous: QuestionCard | null): QuestionCard;
  mapBlocks(
    blocks: BattleContentBlock[],
    keyPrefix: string,
    previousBlocks?: ViewBlock[],
  ): ViewBlock[];
  mapOptions(
    options: BattleQuestionOptionSnapshotResponse[],
    questionId: string,
    draftOptionId: string,
    previousQuestion: QuestionCard | null,
  ): OptionCard[];
  getCurrentQuestion(): QuestionCard | null;
  replaceQuestion(question: QuestionCard): void;
  rebuildQuestionStatuses(questions: QuestionCard[], currentQuestionIndex: number): QuestionCard[];
  updateQuestionDraft(questionId: string, updater: (question: QuestionCard) => QuestionCard): void;
  findQuestion(questionId: string): QuestionCard | null;
  getReadableError(error: unknown, fallback: string): string;
  mapPlayState(payload: BattleQuestionsResponse): PlayPageState;
  getQuestionTypeText(type: QuestionType): string;
  getDifficultyText(difficulty: string | null): string;
  normalizeSubmittedAnswer(answer: BattleSubmittedAnswerResponse | null): {
    savedAnswerOptionId: string;
    savedAnswerValue: string;
  };
};

type QuestionSyncRuntime = {
  debounceTimer: number | null;
  inFlight: boolean;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TIME_TICK_MS = 500;
const COUNTDOWN_POLL_MS = 1800;
const SETTLEMENT_POLL_MS = 1800;
const RESULT_POLL_MS = 1800;
const CODE_FILL_MAX_LENGTH = 4000;
const CODE_FILL_AUTOSAVE_DELAY_MS = 650;
const BATTLE_NATIVE_COLOR_TOKENS = {
  success: '#10B981',
  danger: '#EF4444',
} as const;

let isPageActive = false;
let isPageVisible = false;
let hasLoadedOnce = false;
let hasLoadedPlayerContext = false;
let requestSerial = 0;
let playerContextRequestSerial = 0;
let timeTicker: number | null = null;
let countdownPollTicker: number | null = null;
let settlementPollTicker: number | null = null;
let resultPollTicker: number | null = null;
let isQuestionsRequesting = false;
let isResultRequesting = false;
let isPlayerContextRequesting = false;
let isBattleActionRequesting = false;
let serverTimeOffsetMs = 0;
let startedAtTimestampMs = 0;
let expiresAtTimestampMs = 0;
let hasRedirectedToResult = false;
const questionSyncRuntimeMap = new Map<string, QuestionSyncRuntime>();

function getNavigationMetrics() {
  const systemInfo = (
    wx as unknown as {
      getSystemInfoSync: () => {
        statusBarHeight?: number;
      };
    }
  ).getSystemInfoSync();
  const statusBarHeight = systemInfo.statusBarHeight ?? 20;
  const menuButtonGetter = (
    wx as unknown as {
      getMenuButtonBoundingClientRect?: () => {
        top: number;
        height: number;
      };
    }
  ).getMenuButtonBoundingClientRect;
  const menuButtonRect = typeof menuButtonGetter === 'function' ? menuButtonGetter() : null;

  if (!menuButtonRect) {
    return {
      navTopPadding: statusBarHeight,
      navBarHeight: 44,
    };
  }

  return {
    navTopPadding: statusBarHeight,
    navBarHeight: Math.max(44, menuButtonRect.height + (menuButtonRect.top - statusBarHeight) * 2),
  };
}

function calculateProgressPresentation(
  myAnsweredCount: number,
  opponentAnsweredCount: number | null,
  totalQuestions: number,
  isTrainingMode: boolean,
) {
  const normalizedTotal = Math.max(0, totalQuestions);
  const normalizedMy = Math.max(0, myAnsweredCount);
  const normalizedOpponent = Math.max(0, opponentAnsweredCount ?? 0);

  if (isTrainingMode) {
    const completionPercent =
      normalizedTotal === 0 ? 0 : Math.min(100, (normalizedMy / normalizedTotal) * 100);

    return {
      myProgressStyle: `width: ${completionPercent.toFixed(2)}%;`,
      opponentProgressStyle: 'width: 0%;',
      hasProgressActivity: normalizedMy > 0,
    };
  }

  const combinedAnsweredCount = normalizedMy + normalizedOpponent;
  const myShare = combinedAnsweredCount === 0 ? 0 : (normalizedMy / combinedAnsweredCount) * 100;
  const opponentShare = combinedAnsweredCount === 0 ? 0 : 100 - myShare;

  return {
    myProgressStyle: `width: ${myShare.toFixed(2)}%;`,
    opponentProgressStyle: `width: ${opponentShare.toFixed(2)}%;`,
    hasProgressActivity: combinedAnsweredCount > 0,
  };
}

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

function getQuestionRuntime(questionId: string) {
  const existing = questionSyncRuntimeMap.get(questionId);

  if (existing) {
    return existing;
  }

  const created: QuestionSyncRuntime = {
    debounceTimer: null,
    inFlight: false,
  };
  questionSyncRuntimeMap.set(questionId, created);
  return created;
}

function clearQuestionRuntime(questionId: string) {
  const runtime = questionSyncRuntimeMap.get(questionId);

  if (!runtime) {
    return;
  }

  if (runtime.debounceTimer !== null) {
    clearTimeout(runtime.debounceTimer);
  }

  questionSyncRuntimeMap.delete(questionId);
}

function formatSubmittedAtLabel(value: string | null) {
  if (!value) {
    return '';
  }

  const timestamp = Date.parse(value);

  if (!Number.isFinite(timestamp)) {
    return '已保存';
  }

  const date = new Date(timestamp);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `已保存 ${hours}:${minutes}:${seconds}`;
}

function wait(delayMs: number) {
  return new Promise<void>((resolve) => {
    setTimeout(() => resolve(), delayMs);
  });
}

registerThemedPage<PlayPageData, PlayPageMethods>({
  data: {
    navTopPadding: 0,
    navBarHeight: 44,
    themeMode: 'system',
    resolvedTheme: 'light',
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
    submitBattleButtonText: '交卷',
    forfeitButtonText: '认输',
    isBattleActionPending: false,
    participantStatus: null,
    isParticipantLocked: false,
    isTrainingMode: false,
    totalQuestionsText: '0',
    myAnsweredCount: 0,
    opponentAnsweredCount: 0,
    myProgressText: '0 / 0',
    opponentProgressText: '0 / 0',
    myProgressStyle: 'width: 0%;',
    opponentProgressStyle: 'width: 0%;',
    hasProgressActivity: false,
    mySubmittedText: '作答中',
    opponentSubmittedText: '作答中',
    myPlayer: null,
    opponentPlayer: null,
    isOverviewOpen: false,
    questions: [],
  },

  onLoad(options) {
    isPageActive = true;
    isPageVisible = true;
    hasRedirectedToResult = false;
    hasLoadedPlayerContext = false;
    const navigationMetrics = getNavigationMetrics();
    const currentUser = getAuthStateSummary().user;
    const battleId = typeof options?.battleId === 'string' ? options.battleId.trim() : '';
    const isValidBattleId = UUID_PATTERN.test(battleId);

    this.setData({
      ...navigationMetrics,
      battleId,
      isValidBattleId,
      state: isValidBattleId ? 'LOADING' : 'ERROR',
      titleText: isValidBattleId ? '正在加载题目' : 'battleId 无效',
      descriptionText: isValidBattleId
        ? '系统正在同步 Battle 题目、已答状态和剩余时间。'
        : '当前页面没有收到合法的 Battle 标识。',
      errorMessage: '',
      myPlayer: currentUser
        ? {
            nicknameText: formatBattleNickname(currentUser.nickname),
            avatarUrl: currentUser.avatarUrl ?? '',
            avatarFallbackText: formatBattleInitial(currentUser.nickname),
            ratingText: '',
          }
        : null,
    });

    if (!isValidBattleId) {
      return;
    }

    void this.loadQuestions();
  },

  onShow() {
    isPageVisible = true;
    isPageActive = true;

    if (hasLoadedOnce && this.data.isValidBattleId) {
      if (this.data.state === 'WAITING_SETTLEMENT' || this.data.state === 'COMPLETED') {
        void this.loadResultStatus();
      } else {
        void this.loadQuestions({
          preservePosition: true,
        });
      }
    }
  },

  onHide() {
    isPageVisible = false;
    if (this.data.isOverviewOpen) {
      this.setData({ isOverviewOpen: false });
    }
    this.stopTimeTicker();
    this.stopCountdownPolling();
    this.stopSettlementPolling();
    this.stopResultPolling();
    this.stopAllQuestionDebounceTimers();
  },

  onUnload() {
    isPageVisible = false;
    isPageActive = false;
    hasRedirectedToResult = false;
    hasLoadedPlayerContext = false;
    requestSerial += 1;
    playerContextRequestSerial += 1;
    this.stopTimeTicker();
    this.stopCountdownPolling();
    this.stopSettlementPolling();
    this.stopResultPolling();
    this.stopAllQuestionDebounceTimers();
    questionSyncRuntimeMap.clear();
  },

  onPullDownRefresh() {
    const loader =
      this.data.state === 'WAITING_SETTLEMENT' || this.data.state === 'COMPLETED'
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
      redirectToLogin(`/pages/battle/play?battleId=${encodeURIComponent(this.data.battleId)}`);
    } else {
      redirectToLogin('/pages/battle/index');
    }

    return false;
  },

  async loadPlayerContext() {
    if (
      !this.data.isValidBattleId ||
      !this.ensureAuthenticated() ||
      hasLoadedPlayerContext ||
      isPlayerContextRequesting
    ) {
      return;
    }

    const currentRequestSerial = ++playerContextRequestSerial;
    isPlayerContextRequesting = true;

    try {
      const response = await request<BattleRoomDetailResponse>({
        url: `/battles/${encodeURIComponent(this.data.battleId)}`,
        method: 'GET',
        authMode: 'required',
      });

      if (!isPageActive || currentRequestSerial !== playerContextRequestSerial) {
        return;
      }

      this.applyPlayerContext(response);
      if (
        response.status === 'COMPLETED' ||
        response.currentParticipantStatus === 'COMPLETED'
      ) {
        this.setData({
          state: 'COMPLETED',
          titleText: '本场对战已结束',
          descriptionText: '当前对局已经完成，正在进入结果页。',
          participantStatus: 'COMPLETED',
          isParticipantLocked: true,
        });
        this.navigateToResult(true);
        return;
      }
      hasLoadedPlayerContext = true;
    } catch {
      // Player metadata is optional; the question flow remains authoritative.
    } finally {
      isPlayerContextRequesting = false;
    }
  },

  applyPlayerContext(payload: BattleRoomDetailResponse) {
    const currentUserId = getAuthStateSummary().user?.id ?? '';
    const participants = [...payload.participants].sort((left, right) => left.seat - right.seat);
    const myParticipant =
      participants.find((participant) => participant.userId === currentUserId) ?? null;
    const opponentParticipant =
      payload.mode === 'TRAINING'
        ? null
        : (participants.find((participant) => participant.userId !== currentUserId) ?? null);
    const aiOpponent =
      payload.mode === 'AI' && payload.opponent
        ? {
            nicknameText: payload.opponent.displayName,
            avatarUrl: '',
            avatarFallbackText: '电',
            ratingText: '电脑对手',
          }
        : null;

    this.setData({
      myPlayer: this.mapPlayer(myParticipant) ?? this.data.myPlayer,
      opponentPlayer: aiOpponent ?? this.mapPlayer(opponentParticipant),
      isTrainingMode: payload.mode === 'TRAINING',
      participantStatus: payload.currentParticipantStatus,
      isParticipantLocked:
        payload.currentParticipantStatus === 'SUBMITTED' ||
        payload.currentParticipantStatus === 'FORFEITED' ||
        payload.currentParticipantStatus === 'COMPLETED',
    });
  },

  mapPlayer(participant: BattleParticipantSummary | null) {
    if (!participant) {
      return null;
    }

    const extendedParticipant = participant as BattleParticipantSummary & {
      rating?: unknown;
      skillRating?: unknown;
    };
    const rating =
      typeof extendedParticipant.skillRating === 'number'
        ? extendedParticipant.skillRating
        : typeof extendedParticipant.rating === 'number'
          ? extendedParticipant.rating
          : null;

    return {
      nicknameText: formatBattleNickname(participant.nickname),
      avatarUrl: participant.avatarUrl ?? '',
      avatarFallbackText: formatBattleInitial(participant.nickname),
      ratingText: rating === null ? '' : `Rating ${rating}`,
    };
  },

  async loadQuestions(options?: { preservePosition?: boolean }) {
    if (!this.data.isValidBattleId || !this.ensureAuthenticated() || isQuestionsRequesting) {
      return;
    }

    const currentRequestSerial = ++requestSerial;
    isQuestionsRequesting = true;
    await this.loadPlayerContext();

    if (!isPageActive || this.data.state === 'COMPLETED') {
      isQuestionsRequesting = false;
      hasLoadedOnce = true;
      return;
    }

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
        descriptionText: '你可以重新获取题目，或先回到 Battle 房间。',
        errorMessage: this.getReadableError(error, 'Battle 题目加载失败，请稍后重试。'),
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
        ? (this.data.questions[this.data.currentQuestionIndex] ?? null)
        : null;
    const currentQuestionId = currentQuestion?.battleQuestionId ?? '';
    const items = Array.isArray(payload.questions) ? payload.questions : [];
    const built = this.buildQuestions(items, this.data.questions, currentQuestionId);
    const serverState = this.mapPlayState(payload);
    const participantLocked =
      this.data.isParticipantLocked ||
      this.data.participantStatus === 'SUBMITTED' ||
      this.data.participantStatus === 'FORFEITED' ||
      this.data.participantStatus === 'COMPLETED';
    const nextState =
      participantLocked && payload.status !== 'COMPLETED'
        ? 'WAITING_SETTLEMENT'
        : serverState;
    const isTrainingMode = payload.mode === 'TRAINING';
    const currentQuestionCard = built.questions[built.currentQuestionIndex] ?? null;
    const myAnsweredCount = built.questions.filter((question) => question.answered).length;
    const opponentAnsweredCount = isTrainingMode
      ? null
      : this.data.isTrainingMode
        ? 0
        : this.data.opponentAnsweredCount;
    const progressPresentation = calculateProgressPresentation(
      myAnsweredCount,
      opponentAnsweredCount,
      built.questions.length,
      isTrainingMode,
    );

    this.stopTimeTicker();
    this.stopCountdownPolling();
    this.stopSettlementPolling();
    this.stopResultPolling();

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
          ? '倒计时尚未结束，结束后会自动进入作答状态。'
          : nextState === 'WAITING_SETTLEMENT'
            ? isTrainingMode
              ? '当前已停止作答，系统正在整理单人训练结果。'
              : '当前已停止作答，系统正在等待对手或处理结算。'
            : nextState === 'COMPLETED'
              ? '当前对局已完成，正在准备跳转结果页。'
              : '选择答案后会自动暂存。交卷前会等待未完成的自动保存请求。',
      errorMessage: '',
      currentQuestionIndex: built.currentQuestionIndex,
      questionCountText: currentQuestionCard
        ? `${built.currentQuestionIndex + 1} / ${built.questions.length}`
        : `0 / ${built.questions.length}`,
      submitBattleButtonText: '交卷',
      forfeitButtonText: '认输',
      isBattleActionPending: false,
      isParticipantLocked: participantLocked,
      isTrainingMode,
      totalQuestionsText: String(built.questions.length),
      myAnsweredCount,
      opponentAnsweredCount,
      myProgressText: `${myAnsweredCount} / ${built.questions.length}`,
      ...progressPresentation,
      ...(isTrainingMode
        ? {
            opponentProgressText: '—',
            opponentSubmittedText: '—',
            opponentPlayer: null,
          }
        : {
            opponentProgressText: `${opponentAnsweredCount ?? 0} / ${built.questions.length}`,
          }),
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

    if (nextState === 'PLAYING') {
      this.startResultPolling();
      return;
    }

    if (nextState === 'COMPLETED') {
      this.navigateToResult(true);
    }
  },

  startTimeTicker() {
    this.stopTimeTicker();

    if (!isPageVisible) {
      return;
    }

    const tick = () => {
      if (!isPageVisible) {
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

    if (!isPageVisible || this.data.state !== 'COUNTDOWN') {
      return;
    }

    countdownPollTicker = setTimeout(() => {
      countdownPollTicker = null;

      if (!isPageVisible) {
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

    if (!isPageVisible || this.data.state !== 'WAITING_SETTLEMENT') {
      return;
    }

    settlementPollTicker = setTimeout(() => {
      settlementPollTicker = null;

      if (!isPageVisible) {
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

  startResultPolling() {
    this.stopResultPolling();

    if (!isPageVisible || this.data.state !== 'PLAYING') {
      return;
    }

    resultPollTicker = setTimeout(() => {
      resultPollTicker = null;

      if (!isPageVisible || this.data.state !== 'PLAYING') {
        return;
      }

      void this.loadResultStatus({ preservePlaying: true });
    }, RESULT_POLL_MS) as unknown as number;
  },

  stopResultPolling() {
    if (resultPollTicker !== null) {
      clearTimeout(resultPollTicker);
      resultPollTicker = null;
    }
  },

  stopAllQuestionDebounceTimers() {
    questionSyncRuntimeMap.forEach((runtime) => {
      if (runtime.debounceTimer !== null) {
        clearTimeout(runtime.debounceTimer);
        runtime.debounceTimer = null;
      }
    });
  },

  updateTimeDisplay() {
    const now = getServerNowMs();
    const remainingSeconds =
      expiresAtTimestampMs > 0 ? Math.max(0, Math.ceil((expiresAtTimestampMs - now) / 1000)) : 0;
    const countdownSeconds =
      startedAtTimestampMs > 0 ? Math.max(0, Math.ceil((startedAtTimestampMs - now) / 1000)) : 0;

    if (this.data.state === 'PLAYING' && remainingSeconds <= 0) {
      this.enterWaitingSettlement('作答时间已结束，当前已停止修改答案，系统正在等待结算。');
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
      countdownText: this.data.state === 'COUNTDOWN' ? String(Math.max(1, countdownSeconds)) : '',
    });
  },

  async loadResultStatus(options?: { preservePlaying?: boolean }) {
    if (!this.data.isValidBattleId || !this.ensureAuthenticated() || isResultRequesting) {
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
        const opponentForfeited =
          response.endReason === 'USER_FORFEIT' && response.result === 'WIN';
        this.stopTimeTicker();
        this.stopCountdownPolling();
        this.stopSettlementPolling();
        this.stopResultPolling();
        this.stopAllQuestionDebounceTimers();
        this.setData({
          state: 'COMPLETED',
          titleText: '本场对战已结束',
          descriptionText: opponentForfeited
            ? '对手已认输，本场已结算，正在进入结果页。'
            : '当前对局已经完成，正在进入结果页。',
          errorMessage: '',
          isBattleActionPending: false,
          participantStatus: 'COMPLETED',
          isParticipantLocked: true,
          submitBattleButtonText: '交卷',
          forfeitButtonText: '认输',
          isOverviewOpen: false,
        });
        if (opponentForfeited) {
          wx.showToast({
            title: '对手已认输，本场已结算',
            icon: 'none',
          });
        }
        this.navigateToResult(true);
        return;
      }

      this.setPendingProgress(response);

      if (options?.preservePlaying && response.status === 'IN_PROGRESS') {
        this.startResultPolling();
        return;
      }

      const waitingMessage =
        response.status === 'COUNTDOWN'
          ? '对战倒计时尚未结束，结果会在整场答题结束后生成。'
          : response.status === 'IN_PROGRESS'
            ? '当前对战仍在进行中，结果会在整场答题结束后生成。'
            : '正在处理本场结果，请稍候。';

      this.enterWaitingSettlement(waitingMessage);
    } catch (error) {
      if (!isPageActive || currentRequestSerial !== requestSerial) {
        return;
      }

      if (options?.preservePlaying && this.data.state === 'PLAYING') {
        this.startResultPolling();
        return;
      }

      this.setData({
        state: 'ERROR',
        titleText: '结果获取失败',
        descriptionText: '当前 Battle 结果无法继续同步，你可以稍后重试。',
        errorMessage: this.getReadableError(error, 'Battle 结果暂时不可用，请稍后重试。'),
        isBattleActionPending: false,
        submitBattleButtonText: '交卷',
        forfeitButtonText: '认输',
      });
    } finally {
      isResultRequesting = false;
    }
  },

  setPendingProgress(response: PendingBattleResultResponse) {
    const totalQuestions = Math.max(0, response.totalQuestions);
    const myAnsweredCount = Math.max(0, response.myAnsweredCount);
    const opponentAnsweredCount =
      response.opponentAnsweredCount === null ? null : Math.max(0, response.opponentAnsweredCount);
    const isTrainingMode = response.mode === 'TRAINING';
    const progressPresentation = calculateProgressPresentation(
      myAnsweredCount,
      opponentAnsweredCount,
      totalQuestions,
      isTrainingMode,
    );

    this.setData({
      totalQuestionsText: String(totalQuestions),
      myAnsweredCount,
      opponentAnsweredCount,
      myProgressText: `${myAnsweredCount} / ${totalQuestions}`,
      opponentProgressText:
        opponentAnsweredCount === null ? '—' : `${opponentAnsweredCount} / ${totalQuestions}`,
      ...progressPresentation,
      mySubmittedText: response.mySubmitted ? '已交卷' : '作答中',
      opponentSubmittedText:
        response.opponentSubmitted === null
          ? '—'
          : response.opponentSubmitted
            ? '已交卷'
            : '作答中',
      isTrainingMode,
      ...(response.mySubmitted
        ? { participantStatus: 'SUBMITTED', isParticipantLocked: true }
        : {}),
      ...(isTrainingMode ? { opponentPlayer: null } : {}),
    });
  },

  enterWaitingSettlement(descriptionText: string, errorMessage = '') {
    this.stopTimeTicker();
    this.stopCountdownPolling();
    this.stopResultPolling();
    this.stopAllQuestionDebounceTimers();

    this.setData({
      state: 'WAITING_SETTLEMENT',
      titleText: '等待结算中',
      descriptionText,
      errorMessage,
      isBattleActionPending: false,
      participantStatus: this.data.participantStatus ?? 'SUBMITTED',
      isParticipantLocked: true,
      submitBattleButtonText: '交卷',
      forfeitButtonText: '认输',
      isOverviewOpen: false,
    });

    this.startSettlementPolling();
  },

  navigateToResult(autoNavigate = false) {
    if (hasRedirectedToResult || !this.data.isValidBattleId) {
      return;
    }

    hasRedirectedToResult = true;

    if (!autoNavigate) {
      wx.showToast({
        title: '正在进入结果页',
        icon: 'none',
      });
    }

    wx.redirectTo({
      url: `/pages/battle/result?battleId=${encodeURIComponent(this.data.battleId)}`,
    });
  },

  handleRetry() {
    if (this.data.state === 'WAITING_SETTLEMENT' || this.data.state === 'COMPLETED') {
      void this.loadResultStatus();
      return;
    }

    void this.loadQuestions({
      preservePosition: true,
    });
  },

  handleBackRoom() {
    if (this.data.isOverviewOpen) {
      this.handleCloseOverview();
      return;
    }

    wx.switchTab({
      url: '/pages/battle/index',
    });
  },

  handlePrevQuestion() {
    if (this.data.questions.length === 0 || this.data.currentQuestionIndex <= 0) {
      return;
    }

    this.setData({
      currentQuestionIndex: this.data.currentQuestionIndex - 1,
      questions: this.rebuildQuestionStatuses(
        this.data.questions,
        this.data.currentQuestionIndex - 1,
      ),
      questionCountText: `${this.data.currentQuestionIndex} / ${this.data.questions.length}`,
    });
  },

  handleNextQuestion() {
    if (
      this.data.questions.length === 0 ||
      this.data.currentQuestionIndex >= this.data.questions.length - 1
    ) {
      return;
    }

    this.setData({
      currentQuestionIndex: this.data.currentQuestionIndex + 1,
      questions: this.rebuildQuestionStatuses(
        this.data.questions,
        this.data.currentQuestionIndex + 1,
      ),
      questionCountText: `${this.data.currentQuestionIndex + 2} / ${this.data.questions.length}`,
    });
  },

  handleSelectQuestion(event: WechatMiniprogram.BaseEvent<{ index?: number }>) {
    const nextIndex = Number(event.currentTarget.dataset.index ?? -1);

    if (!Number.isInteger(nextIndex) || nextIndex < 0 || nextIndex >= this.data.questions.length) {
      return;
    }

    this.setData({
      currentQuestionIndex: nextIndex,
      questions: this.rebuildQuestionStatuses(this.data.questions, nextIndex),
      questionCountText: `${nextIndex + 1} / ${this.data.questions.length}`,
    });
  },

  handleOpenOverview() {
    if (this.data.questions.length === 0) {
      return;
    }

    this.setData({ isOverviewOpen: true });
  },

  handleCloseOverview() {
    if (!this.data.isOverviewOpen) {
      return;
    }

    this.setData({ isOverviewOpen: false });
  },

  handleOverviewPanelTap() {
    // catchtap keeps panel interactions from closing the backdrop.
  },

  handleOverviewSelectQuestion(event: WechatMiniprogram.BaseEvent<{ index?: number }>) {
    this.handleSelectQuestion(event);
    this.handleCloseOverview();
  },

  handleOverviewSubmit() {
    this.handleCloseOverview();
    this.handleSubmitBattle();
  },

  handleOverviewForfeit() {
    this.handleCloseOverview();
    this.handleForfeitBattle();
  },

  handleOptionSelect(
    event: WechatMiniprogram.BaseEvent<{
      questionId?: string;
      optionId?: string;
    }>,
  ) {
    const questionId = event.currentTarget.dataset.questionId ?? '';
    const optionId = event.currentTarget.dataset.optionId ?? '';
    const question = this.findQuestion(questionId);

    if (!question || !optionId || !this.isQuestionEditable(question)) {
      return;
    }

    if (question.draftOptionId === optionId && question.syncState !== 'error') {
      return;
    }

    this.updateQuestionDraft(questionId, (current) => {
      const nextVersion = current.answerVersion + 1;

      return {
        ...current,
        draftOptionId: optionId,
        answerVersion: nextVersion,
        syncState: 'idle',
        syncErrorMessage: '',
        options: current.options.map((option) => ({
          ...option,
          isSelected: option.optionId === optionId,
        })),
      };
    });

    this.scheduleQuestionSync(questionId, true);
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
    const question = this.findQuestion(questionId);

    if (!question || !this.isQuestionEditable(question)) {
      return;
    }

    const nextValue = String(event.detail.value ?? '').slice(0, CODE_FILL_MAX_LENGTH);

    if (nextValue === question.draftValue && question.syncState !== 'error') {
      return;
    }

    this.updateQuestionDraft(questionId, (current) => ({
      ...current,
      draftValue: nextValue,
      answerVersion: current.answerVersion + 1,
      syncState: 'idle',
      syncErrorMessage: '',
    }));

    if (!nextValue.trim()) {
      return;
    }

    this.scheduleQuestionSync(questionId, false);
  },

  handleRetryQuestionSync(
    event: WechatMiniprogram.BaseEvent<{
      questionId?: string;
    }>,
  ) {
    const questionId = event.currentTarget.dataset.questionId ?? '';

    if (!questionId) {
      return;
    }

    this.scheduleQuestionSync(questionId, true);
  },

  handleSubmitBattle() {
    if (
      this.data.isBattleActionPending ||
      isBattleActionRequesting ||
      this.data.isParticipantLocked ||
      (this.data.state !== 'PLAYING' && this.data.state !== 'COUNTDOWN')
    ) {
      return;
    }

    const draftCount = this.data.questions.filter((question: QuestionCard) =>
      this.hasAnswerDraft(question),
    ).length;
    const unansweredCount = Math.max(0, this.data.questions.length - draftCount);

    void showBattleConfirmModal({
      title: '确认交卷',
      content: `当前已答 ${draftCount} 题，共 ${this.data.questions.length} 题。还有 ${unansweredCount} 题未作答，确认后会先等待自动保存完成，再提交整场。`,
      confirmText: '确认交卷',
      cancelText: '继续答题',
      confirmColor: BATTLE_NATIVE_COLOR_TOKENS.success,
    }).then((result) => {
      if (result.confirm) {
        void this.submitBattle();
      }
    });
  },

  async submitBattle() {
    if (
      !this.ensureAuthenticated() ||
      !this.data.isValidBattleId ||
      isBattleActionRequesting ||
      this.data.isBattleActionPending ||
      this.data.isParticipantLocked ||
      (this.data.state !== 'PLAYING' && this.data.state !== 'COUNTDOWN')
    ) {
      return;
    }

    isBattleActionRequesting = true;

    this.setData({
      isBattleActionPending: true,
      submitBattleButtonText: '处理中',
      forfeitButtonText: '认输',
      errorMessage: '',
    });

    try {
      await this.flushPendingQuestionSaves();

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
        this.setData({
          participantStatus: 'COMPLETED',
          isParticipantLocked: true,
        });
        this.navigateToResult(true);
        return;
      }

      this.setData({
        participantStatus: response.participantStatus ?? 'SUBMITTED',
        isParticipantLocked: true,
      });

      this.enterWaitingSettlement(
        response.waitingForOpponent
          ? '你已主动交卷，正在等待对手完成作答并进入结算。'
          : '整场作答已提交，正在整理本场结果。',
      );
    } catch (error) {
      if (!isPageActive) {
        return;
      }

      this.setData({
        isBattleActionPending: false,
        submitBattleButtonText: '交卷',
        forfeitButtonText: '认输',
        errorMessage: this.getReadableError(error, '主动交卷失败，请稍后重试。'),
      });
    } finally {
      isBattleActionRequesting = false;
    }
  },

  async flushPendingQuestionSaves() {
    const pendingQuestions = this.data.questions.filter((question: QuestionCard) =>
      this.hasUnsyncedDraft(question),
    );

    for (const question of pendingQuestions) {
      this.scheduleQuestionSync(question.battleQuestionId, true);
    }

    for (let attempt = 0; attempt < 60; attempt += 1) {
      const waitingForSave = this.data.questions.some(
        (question: QuestionCard) =>
          getQuestionRuntime(question.battleQuestionId).inFlight || this.hasUnsyncedDraft(question),
      );

      if (!waitingForSave) {
        break;
      }

      await wait(120);
    }

    const failedQuestion = this.data.questions.find(
      (question: QuestionCard) => question.syncState === 'error' || this.hasUnsyncedDraft(question),
    );

    if (failedQuestion) {
      throw new Error('QUESTION_SYNC_PENDING');
    }
  },

  handleForfeitBattle() {
    if (
      this.data.isBattleActionPending ||
      isBattleActionRequesting ||
      this.data.isParticipantLocked ||
      this.data.isTrainingMode ||
      (this.data.state !== 'COUNTDOWN' && this.data.state !== 'PLAYING')
    ) {
      return;
    }

    void showBattleConfirmModal({
      title: '确认认输',
      content: '认输会立即判负，并结束你当前这场 Battle。确认后将直接进入结算等待。',
      confirmText: '确认认输',
      cancelText: '继续对战',
      confirmColor: BATTLE_NATIVE_COLOR_TOKENS.danger,
    }).then((result) => {
      if (result.confirm) {
        void this.forfeitBattle();
      }
    });
  },

  async forfeitBattle() {
    if (
      !this.ensureAuthenticated() ||
      !this.data.isValidBattleId ||
      isBattleActionRequesting ||
      this.data.isBattleActionPending ||
      this.data.isParticipantLocked ||
      this.data.isTrainingMode ||
      (this.data.state !== 'COUNTDOWN' && this.data.state !== 'PLAYING')
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
        this.setData({
          participantStatus: 'COMPLETED',
          isParticipantLocked: true,
        });
        this.navigateToResult(true);
        return;
      }

      this.setData({
        participantStatus: response.participantStatus ?? 'FORFEITED',
        isParticipantLocked: true,
      });

      this.enterWaitingSettlement('已发起认输，正在处理本场结果。');
    } catch (error) {
      if (!isPageActive) {
        return;
      }

      this.setData({
        isBattleActionPending: false,
        submitBattleButtonText: '交卷',
        forfeitButtonText: '认输',
        errorMessage: this.getReadableError(error, '认输失败，请稍后重试。'),
      });
    } finally {
      isBattleActionRequesting = false;
    }
  },

  scheduleQuestionSync(questionId: string, immediate = false) {
    const question = this.findQuestion(questionId);

    if (!question || !this.isQuestionEditable(question)) {
      return;
    }

    const runtime = getQuestionRuntime(questionId);

    if (runtime.debounceTimer !== null) {
      clearTimeout(runtime.debounceTimer);
      runtime.debounceTimer = null;
    }

    if (immediate) {
      void this.executeQuestionSync(questionId);
      return;
    }

    runtime.debounceTimer = setTimeout(() => {
      runtime.debounceTimer = null;
      void this.executeQuestionSync(questionId);
    }, CODE_FILL_AUTOSAVE_DELAY_MS) as unknown as number;
  },

  async executeQuestionSync(questionId: string) {
    const question = this.findQuestion(questionId);

    if (!question || !this.isQuestionEditable(question)) {
      return;
    }

    const runtime = getQuestionRuntime(questionId);

    if (runtime.inFlight) {
      return;
    }

    const answerPayload = this.buildAnswerPayload(question);

    if (!answerPayload) {
      return;
    }

    if (question.savedAnswerVersion >= question.answerVersion && question.syncState !== 'error') {
      return;
    }

    const requestVersion = question.answerVersion;
    const clientRequestId =
      question.pendingClientRequestId && question.pendingRequestVersion === requestVersion
        ? question.pendingClientRequestId
        : generateBattleClientRequestId('battle-answer');

    runtime.inFlight = true;

    this.updateQuestionDraft(questionId, (current) => ({
      ...current,
      inFlightAnswerVersion: requestVersion,
      pendingClientRequestId: clientRequestId,
      pendingRequestVersion: requestVersion,
      syncState: 'saving',
      syncErrorMessage: '',
    }));

    try {
      const response = await request<BattleAnswerSubmissionResponse>({
        url: `/battles/${encodeURIComponent(this.data.battleId)}/answers`,
        method: 'POST',
        authMode: 'required',
        data: {
          battleQuestionId: questionId,
          clientRequestId,
          answerVersion: requestVersion,
          answer: answerPayload,
        } as WechatMiniprogram.IAnyObject,
      });

      if (!isPageActive) {
        return;
      }

      serverTimeOffsetMs = parseTimestamp(response.serverTime) - Date.now();

      this.updateQuestionDraft(questionId, (current) => {
        const nextSavedVersion = Math.max(current.savedAnswerVersion, response.answerVersion);
        const requestWasApplied = response.answerVersion >= requestVersion;
        const isChoice = current.questionType === 'SINGLE_CHOICE';

        return {
          ...current,
          answered: requestWasApplied ? true : current.answered,
          submittedAtText: requestWasApplied
            ? formatSubmittedAtLabel(response.submittedAt)
            : current.submittedAtText,
          savedAnswerOptionId:
            requestWasApplied && isChoice
              ? 'optionId' in answerPayload
                ? answerPayload.optionId
                : current.savedAnswerOptionId
              : current.savedAnswerOptionId,
          savedAnswerValue:
            requestWasApplied && !isChoice
              ? 'value' in answerPayload
                ? answerPayload.value
                : current.savedAnswerValue
              : current.savedAnswerValue,
          savedAnswerVersion: nextSavedVersion,
          inFlightAnswerVersion: 0,
          pendingClientRequestId:
            current.pendingRequestVersion === requestVersion ? '' : current.pendingClientRequestId,
          pendingRequestVersion:
            current.pendingRequestVersion === requestVersion ? 0 : current.pendingRequestVersion,
          syncState: current.answerVersion > response.answerVersion ? 'idle' : 'saved',
          syncErrorMessage: '',
        };
      });
    } catch (error) {
      if (!isPageActive) {
        return;
      }

      if (error instanceof RequestError) {
        if (error.code === 'BATTLE_PARTICIPANT_ALREADY_SUBMITTED') {
          this.enterWaitingSettlement('本场已停止作答，系统正在确认最终结果。');
          return;
        }

        if (error.code === 'BATTLE_EXPIRED' || error.code === 'BATTLE_SETTLEMENT_IN_PROGRESS') {
          this.enterWaitingSettlement(
            '作答时间已结束，当前已停止修改答案，系统正在等待结算。',
            this.getReadableError(error, '作答时间已结束。'),
          );
          return;
        }

        if (error.code === 'BATTLE_ALREADY_COMPLETED') {
          this.stopTimeTicker();
          this.stopResultPolling();
          this.stopAllQuestionDebounceTimers();
          this.setData({
            state: 'COMPLETED',
            titleText: '本场对战已结束',
            descriptionText: '当前对局已经完成，正在跳转结果页。',
            errorMessage: this.getReadableError(error, '本场对战已结束。'),
          });
          this.navigateToResult(true);
          return;
        }

        if (error.code === 'BATTLE_INVALID_STATUS') {
          this.stopTimeTicker();
          this.stopResultPolling();
          this.stopAllQuestionDebounceTimers();
          void this.loadResultStatus();
          return;
        }
      }

      this.updateQuestionDraft(questionId, (current) => ({
        ...current,
        inFlightAnswerVersion: 0,
        syncState: 'error',
        syncErrorMessage:
          error instanceof Error && error.message === 'QUESTION_SYNC_PENDING'
            ? '仍有答案未同步，请重试。'
            : this.getReadableError(error, '当前题目暂存失败，请点击重试同步。'),
      }));
    } finally {
      runtime.inFlight = false;
      const latestQuestion = this.findQuestion(questionId);

      if (
        latestQuestion &&
        this.isQuestionEditable(latestQuestion) &&
        this.hasUnsyncedDraft(latestQuestion) &&
        latestQuestion.syncState !== 'error'
      ) {
        void this.executeQuestionSync(questionId);
      }
    }
  },

  buildAnswerPayload(question: QuestionCard) {
    if (question.questionType === 'SINGLE_CHOICE') {
      if (!question.draftOptionId) {
        return null;
      }

      return {
        optionId: question.draftOptionId,
      };
    }

    if (!question.draftValue.trim()) {
      return null;
    }

    return {
      value: question.draftValue,
    };
  },

  hasAnswerDraft(question: QuestionCard) {
    if (question.questionType === 'SINGLE_CHOICE') {
      return Boolean(question.draftOptionId);
    }

    return Boolean(question.draftValue.trim());
  },

  hasUnsyncedDraft(question: QuestionCard) {
    return this.hasAnswerDraft(question) && question.answerVersion > question.savedAnswerVersion;
  },

  isQuestionEditable(question: QuestionCard) {
    return (
      this.data.state === 'PLAYING' &&
      !this.data.isBattleActionPending &&
      !this.data.isParticipantLocked &&
      this.data.participantStatus !== 'SUBMITTED' &&
      this.data.participantStatus !== 'FORFEITED' &&
      this.data.participantStatus !== 'COMPLETED'
    );
  },

  getQuestionSyncLabel(question: QuestionCard) {
    if (question.syncState === 'saving') {
      return '自动保存中';
    }

    if (question.syncState === 'error') {
      return '保存失败，可重试';
    }

    if (this.hasUnsyncedDraft(question)) {
      return '待同步';
    }

    if (question.answered) {
      return question.submittedAtText || '已保存';
    }

    return '未作答';
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
      this.mapQuestion(item, previousMap.get(item.battleQuestionId) ?? null),
    );

    const nextIndex = currentQuestionId
      ? Math.max(
          0,
          builtQuestions.findIndex((question) => question.battleQuestionId === currentQuestionId),
        )
      : 0;

    return {
      questions: this.rebuildQuestionStatuses(builtQuestions, nextIndex),
      currentQuestionIndex:
        builtQuestions.length === 0 ? 0 : Math.min(nextIndex, builtQuestions.length - 1),
    };
  },

  mapQuestion(item: BattleQuestionItemResponse, previous: QuestionCard | null) {
    const questionType = item.questionType as QuestionType;
    const normalizedSubmitted = this.normalizeSubmittedAnswer(item.submittedAnswer);
    const savedVersion = item.answerVersion ?? 0;
    const draftOptionId =
      questionType === 'SINGLE_CHOICE' ? normalizedSubmitted.savedAnswerOptionId : '';
    const draftValue = questionType === 'CODE_FILL' ? normalizedSubmitted.savedAnswerValue : '';

    return {
      battleQuestionId: item.battleQuestionId,
      orderIndex: item.orderIndex,
      questionType,
      questionTypeText: this.getQuestionTypeText(questionType),
      difficultyText: this.getDifficultyText(item.difficulty),
      stem: this.mapBlocks(item.stem, `${item.battleQuestionId}-stem`, previous?.stem),
      options: this.mapOptions(item.options, item.battleQuestionId, draftOptionId, previous),
      programmingLanguage: item.programmingLanguage ?? '',
      answered: item.answered,
      submittedAtText: item.answered ? formatSubmittedAtLabel(item.submittedAt) : '',
      savedAnswerOptionId: normalizedSubmitted.savedAnswerOptionId,
      savedAnswerValue: normalizedSubmitted.savedAnswerValue,
      draftOptionId,
      draftValue,
      answerVersion: savedVersion,
      savedAnswerVersion: savedVersion,
      inFlightAnswerVersion: 0,
      pendingClientRequestId: '',
      pendingRequestVersion: 0,
      syncState: item.answered ? 'saved' : 'idle',
      syncErrorMessage: '',
      syncStatusText: item.answered ? formatSubmittedAtLabel(item.submittedAt) : '未作答',
      overviewStatus: item.answered ? 'answered' : 'pending',
      navLabel: String(item.orderIndex + 1),
    };
  },

  mapBlocks(blocks: BattleContentBlock[], keyPrefix: string, previousBlocks?: ViewBlock[]) {
    const previousFailedMap = new Map(
      (previousBlocks ?? []).map((block: ViewBlock) => [block.blockKey, block.imageFailed]),
    );

    return blocks.map((block: BattleContentBlock, index: number) => {
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
    previousQuestion: QuestionCard | null,
  ) {
    const previousOptionMap = new Map(
      (previousQuestion?.options ?? []).map((option: OptionCard) => [option.optionId, option]),
    );

    return options.map((option: BattleQuestionOptionSnapshotResponse, index: number) => ({
      optionId: option.id,
      optionLabel: String.fromCharCode(65 + index),
      blocks: this.mapBlocks(
        option.blocks,
        `${questionId}-option-${option.id}`,
        previousOptionMap.get(option.id)?.blocks,
      ),
      isSelected: draftOptionId === option.id,
    }));
  },

  getCurrentQuestion() {
    return this.data.questions[this.data.currentQuestionIndex] ?? null;
  },

  replaceQuestion(question: QuestionCard) {
    const nextQuestions = this.data.questions.map((item: QuestionCard) =>
      item.battleQuestionId === question.battleQuestionId ? question : item,
    );

    this.setData({
      questions: this.rebuildQuestionStatuses(nextQuestions, this.data.currentQuestionIndex),
      questionCountText: `${this.data.currentQuestionIndex + 1} / ${nextQuestions.length}`,
    });
  },

  rebuildQuestionStatuses(questions: QuestionCard[], currentQuestionIndex: number) {
    return questions.map((question: QuestionCard, index: number) => {
      return {
        ...question,
        syncStatusText: this.getQuestionSyncLabel(question),
        overviewStatus:
          index === currentQuestionIndex
            ? 'current'
            : this.hasAnswerDraft(question) || question.answered
              ? 'answered'
              : 'pending',
      };
    });
  },

  updateQuestionDraft(questionId: string, updater: (question: QuestionCard) => QuestionCard) {
    const currentQuestion = this.data.questions.find(
      (item) => item.battleQuestionId === questionId,
    );

    if (!currentQuestion) {
      return;
    }

    const nextQuestion = updater(currentQuestion);

    if (nextQuestion.questionType === 'SINGLE_CHOICE') {
      nextQuestion.options = nextQuestion.options.map((option: OptionCard) => ({
        ...option,
        isSelected: option.optionId === nextQuestion.draftOptionId,
      }));
    }

    this.replaceQuestion(nextQuestion);
  },

  findQuestion(questionId: string) {
    return this.data.questions.find((item) => item.battleQuestionId === questionId) ?? null;
  },

  getReadableError(error: unknown, fallback: string) {
    if (error instanceof Error && error.message === 'QUESTION_SYNC_PENDING') {
      return '仍有题目暂存失败，请先重试失败题目，再执行交卷。';
    }

    if (error instanceof RequestError) {
      if (error.statusCode === 401 || error.code === 'UNAUTHORIZED') {
        redirectToLogin(`/pages/battle/play?battleId=${encodeURIComponent(this.data.battleId)}`);
        return '登录状态已失效，请重新登录后再继续答题。';
      }
    }

    return getBattleErrorMessage(
      error,
      {
        unauthorized: '登录状态已失效，请重新登录后再继续答题。',
        network: '网络连接失败，请确认后端服务已启动后重试。',
        fallback,
      },
      {
        BATTLE_ROOM_NOT_READY: '当前房间尚未进入答题阶段，请等待倒计时结束后再试。',
        BATTLE_COUNTDOWN_NOT_FINISHED: '倒计时尚未结束，当前还不能正式提交答案。',
        BATTLE_INVALID_ANSWER: '当前答案格式无效，请检查后重试。',
        BATTLE_EXPIRED: '本场对战作答时间已结束，当前已停止修改答案。',
        BATTLE_SETTLEMENT_IN_PROGRESS: '当前对战正在结算中，暂时不能继续修改答案。',
        BATTLE_ALREADY_COMPLETED: '当前对战已经完成，题目页面只保留只读展示。',
        BATTLE_NOT_PARTICIPANT: '你不是当前对局参与者，无法继续本场 Battle。',
        BATTLE_INVALID_STATUS: '当前对战状态已变化，请刷新后再继续操作。',
      },
    );
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

    return '未标记难度';
  },

  normalizeSubmittedAnswer(answer: BattleSubmittedAnswerResponse | null) {
    if (!answer) {
      return {
        savedAnswerOptionId: '',
        savedAnswerValue: '',
      };
    }

    if (answer.type === 'SINGLE_CHOICE') {
      return {
        savedAnswerOptionId: answer.optionId,
        savedAnswerValue: '',
      };
    }

    return {
      savedAnswerOptionId: '',
      savedAnswerValue: answer.value,
    };
  },
});
