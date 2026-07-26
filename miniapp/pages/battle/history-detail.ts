import type {
  BattleContentBlock,
  BattleHistoryDetailResponse,
  BattleHistoryQuestionResponse,
  BattleQuestionOptionSnapshotResponse,
} from '../../types/battle';
import { getAuthStateSummary, redirectToLogin } from '../../utils/auth';
import {
  formatBattleDuration,
  formatBattleInitial,
  formatBattleNickname,
  formatBattleRating,
} from '../../utils/battle';
import { request, RequestError } from '../../utils/request';

type DetailPageState = 'LOADING' | 'SUCCESS' | 'ERROR';

type ViewBlock = BattleContentBlock & {
  blockKey: string;
  imageFailed: boolean;
  altText: string;
};

type OptionReviewCard = {
  optionId: string;
  optionLabel: string;
  blocks: ViewBlock[];
  isCorrectOption: boolean;
  isMyOption: boolean;
};

type QuestionReviewCard = {
  battleQuestionSnapshotId: string;
  questionNumberText: string;
  questionTypeText: string;
  difficultyText: string;
  resultText: string;
  resultClassName: string;
  scoreDeltaText: string;
  stem: ViewBlock[];
  options: OptionReviewCard[];
  myAnswerLabel: string;
  myAnswerText: string;
  myAnswerBlocks: ViewBlock[];
  myAnswerSubmittedAtText: string;
  myAnswerTimeSpentText: string;
  correctAnswerLabel: string;
  correctAnswerText: string;
  correctAnswerBlocks: ViewBlock[];
  explanation: ViewBlock[];
  hasExplanation: boolean;
  courseId: string;
  courseTitle: string;
  chapterId: string;
  chapterTitle: string;
  canOpenCourse: boolean;
  canOpenChapter: boolean;
  knowledgeHintText: string;
};

type DetailPageData = {
  battleId: string;
  isValidBattleId: boolean;
  state: DetailPageState;
  titleText: string;
  descriptionText: string;
  errorMessage: string;
  modeText: string;
  statusText: string;
  resultText: string;
  resultBadgeClassName: string;
  completedAtText: string;
  startedAtText: string;
  durationText: string;
  endReasonText: string;
  myScoreText: string;
  opponentScoreText: string;
  myCorrectCountText: string;
  myWrongCountText: string;
  myUnansweredCountText: string;
  opponentCorrectCountText: string;
  opponentWrongCountText: string;
  opponentUnansweredCountText: string;
  ratingBeforeText: string;
  ratingDeltaText: string;
  ratingAfterText: string;
  opponentNicknameText: string;
  opponentAvatarUrl: string;
  opponentAvatarFallbackText: string;
  questions: QuestionReviewCard[];
};

type DetailPageMethods = {
  ensureAuthenticated(): boolean;
  loadDetail(): Promise<void>;
  handleRetry(): void;
  handleBackResult(): void;
  handleBackHome(): void;
  handleCourseTap(
    event: WechatMiniprogram.BaseEvent<{ courseId?: string }>,
  ): void;
  handleChapterTap(
    event: WechatMiniprogram.BaseEvent<{ chapterId?: string }>,
  ): void;
  handleImageError(
    event: WechatMiniprogram.BaseEvent<{
      questionId?: string;
      optionId?: string;
      blockKey?: string;
      section?: string;
    }>,
  ): void;
  mapQuestion(question: BattleHistoryQuestionResponse): QuestionReviewCard;
  mapBlocks(
    blocks: BattleContentBlock[],
    keyPrefix: string,
    previousBlocks?: ViewBlock[],
  ): ViewBlock[];
  mapOptions(
    options: BattleQuestionOptionSnapshotResponse[],
    question: BattleHistoryQuestionResponse,
    previousQuestion?: QuestionReviewCard | null,
  ): OptionReviewCard[];
  replaceQuestion(question: QuestionReviewCard): void;
  updateQuestion(
    questionId: string,
    updater: (question: QuestionReviewCard) => QuestionReviewCard,
  ): void;
  getModeText(mode: string): string;
  getStatusText(status: string): string;
  getResultMeta(result: 'WIN' | 'LOSS' | 'DRAW'): {
    text: string;
    className: string;
  };
  getEndReasonText(endReason: string | null): string;
  getQuestionTypeText(type: string): string;
  getDifficultyText(difficulty: string | null): string;
  getQuestionResultMeta(isCorrect: boolean | null): {
    text: string;
    className: string;
  };
  findOptionLabel(
    options: BattleQuestionOptionSnapshotResponse[],
    optionId: string,
  ): string;
  findOptionBlocks(
    options: BattleQuestionOptionSnapshotResponse[],
    optionId: string,
  ): BattleContentBlock[];
  formatDateTime(value: string | null): string;
  formatTimeSpent(value: number | null): string;
  formatScoreDelta(value: number): string;
  formatRatingDelta(value: number): string;
  getReadableError(error: unknown): string;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

let isPageActive = false;
let hasLoadedOnce = false;
let requestSerial = 0;
let isRequesting = false;

Page<DetailPageData, DetailPageMethods>({
  data: {
    battleId: '',
    isValidBattleId: false,
    state: 'LOADING',
    titleText: '正在加载复盘详情',
    descriptionText: '系统正在同步本场 Battle 的题目快照、你的作答和服务端结算结果。',
    errorMessage: '',
    modeText: '',
    statusText: '',
    resultText: '',
    resultBadgeClassName: 'result-badge-draw',
    completedAtText: '',
    startedAtText: '',
    durationText: '00:00',
    endReasonText: '',
    myScoreText: '0',
    opponentScoreText: '0',
    myCorrectCountText: '0',
    myWrongCountText: '0',
    myUnansweredCountText: '0',
    opponentCorrectCountText: '0',
    opponentWrongCountText: '0',
    opponentUnansweredCountText: '0',
    ratingBeforeText: '0',
    ratingDeltaText: '0',
    ratingAfterText: '0',
    opponentNicknameText: '对手用户',
    opponentAvatarUrl: '',
    opponentAvatarFallbackText: '对',
    questions: [],
  },

  onLoad(options) {
    isPageActive = true;
    const battleId =
      typeof options?.battleId === 'string' ? options.battleId.trim() : '';
    const isValidBattleId = UUID_PATTERN.test(battleId);

    this.setData({
      battleId,
      isValidBattleId,
      state: isValidBattleId ? 'LOADING' : 'ERROR',
      titleText: isValidBattleId ? '正在加载复盘详情' : 'battleId 无效',
      descriptionText: isValidBattleId
        ? '系统正在同步本场 Battle 的题目快照、你的作答和服务端结算结果。'
        : '当前页面没有收到合法的 Battle 标识。',
      errorMessage: '',
    });

    if (!isValidBattleId) {
      return;
    }

    void this.loadDetail();
  },

  onShow() {
    isPageActive = true;

    if (hasLoadedOnce && this.data.isValidBattleId) {
      void this.loadDetail();
    }
  },

  onUnload() {
    isPageActive = false;
    requestSerial += 1;
  },

  onPullDownRefresh() {
    void this.loadDetail().finally(() => {
      wx.stopPullDownRefresh();
    });
  },

  ensureAuthenticated() {
    if (getAuthStateSummary().isAuthenticated) {
      return true;
    }

    if (this.data.isValidBattleId) {
      redirectToLogin(
        `/pages/battle/history-detail?battleId=${encodeURIComponent(this.data.battleId)}`,
      );
    } else {
      redirectToLogin('/pages/battle/history');
    }

    return false;
  },

  async loadDetail() {
    if (
      !this.data.isValidBattleId ||
      !this.ensureAuthenticated() ||
      isRequesting
    ) {
      return;
    }

    const currentRequestSerial = ++requestSerial;
    isRequesting = true;

    if (!hasLoadedOnce) {
      this.setData({
        state: 'LOADING',
        titleText: '正在加载复盘详情',
        descriptionText: '系统正在同步本场 Battle 的题目快照、你的作答和服务端结算结果。',
        errorMessage: '',
      });
    }

    try {
      const response = await request<BattleHistoryDetailResponse>({
        url: `/battles/history/${encodeURIComponent(this.data.battleId)}`,
        method: 'GET',
        authMode: 'required',
      });

      if (!isPageActive || currentRequestSerial !== requestSerial) {
        return;
      }

      const resultMeta = this.getResultMeta(response.result);
      this.setData({
        state: 'SUCCESS',
        titleText: 'Battle 复盘详情',
        descriptionText: '当前页面只展示本人的逐题作答、正确答案和解析，不展示对手逐题答案。',
        errorMessage: '',
        modeText: this.getModeText(response.mode),
        statusText: this.getStatusText(response.status),
        resultText: resultMeta.text,
        resultBadgeClassName: resultMeta.className,
        completedAtText: this.formatDateTime(response.completedAt),
        startedAtText: this.formatDateTime(response.startedAt),
        durationText: formatBattleDuration(response.durationSeconds),
        endReasonText: this.getEndReasonText(response.endReason),
        myScoreText: String(response.myScore),
        opponentScoreText: String(response.opponentScore),
        myCorrectCountText: String(response.myCorrectCount),
        myWrongCountText: String(response.myWrongCount),
        myUnansweredCountText: String(response.myUnansweredCount),
        opponentCorrectCountText: String(response.opponentCorrectCount),
        opponentWrongCountText: String(response.opponentWrongCount),
        opponentUnansweredCountText: String(response.opponentUnansweredCount),
        ratingBeforeText: formatBattleRating(response.ratingBefore),
        ratingDeltaText: this.formatRatingDelta(response.ratingDelta),
        ratingAfterText: formatBattleRating(response.ratingAfter),
        opponentNicknameText: formatBattleNickname(response.opponent.nickname),
        opponentAvatarUrl: response.opponent.avatarUrl ?? '',
        opponentAvatarFallbackText: formatBattleInitial(response.opponent.nickname),
        questions: response.questions.map((question) => this.mapQuestion(question)),
      });
    } catch (error) {
      if (!isPageActive || currentRequestSerial !== requestSerial) {
        return;
      }

      this.setData({
        state: 'ERROR',
        titleText: '复盘详情加载失败',
        descriptionText: '你可以重新获取本场 Battle 复盘，或先回到 Battle 首页。',
        errorMessage: this.getReadableError(error),
      });
    } finally {
      isRequesting = false;
      hasLoadedOnce = true;
    }
  },

  handleRetry() {
    void this.loadDetail();
  },

  handleBackResult() {
    if (!this.data.isValidBattleId) {
      wx.switchTab({
        url: '/pages/battle/index',
      });
      return;
    }

    wx.navigateTo({
      url: `/pages/battle/result?battleId=${encodeURIComponent(this.data.battleId)}`,
    });
  },

  handleBackHome() {
    wx.switchTab({
      url: '/pages/battle/index',
    });
  },

  handleCourseTap(
    event: WechatMiniprogram.BaseEvent<{ courseId?: string }>,
  ) {
    const courseId = event.currentTarget.dataset.courseId ?? '';

    if (!UUID_PATTERN.test(courseId)) {
      return;
    }

    wx.navigateTo({
      url: `/pages/course/detail?courseId=${encodeURIComponent(courseId)}`,
    });
  },

  handleChapterTap(
    event: WechatMiniprogram.BaseEvent<{ chapterId?: string }>,
  ) {
    const chapterId = event.currentTarget.dataset.chapterId ?? '';

    if (!UUID_PATTERN.test(chapterId)) {
      return;
    }

    wx.navigateTo({
      url: `/pages/chapter/detail?chapterId=${encodeURIComponent(chapterId)}`,
    });
  },

  handleImageError(
    event: WechatMiniprogram.BaseEvent<{
      questionId?: string;
      optionId?: string;
      blockKey?: string;
      section?: string;
    }>,
  ) {
    const questionId = event.currentTarget.dataset.questionId ?? '';
    const optionId = event.currentTarget.dataset.optionId ?? '';
    const blockKey = event.currentTarget.dataset.blockKey ?? '';
    const section = event.currentTarget.dataset.section ?? '';

    if (!questionId || !blockKey) {
      return;
    }

    this.updateQuestion(questionId, (question) => {
      const markBlocks = (blocks: ViewBlock[]) =>
        blocks.map((block) =>
          block.blockKey === blockKey ? { ...block, imageFailed: true } : block,
        );

      if (section === 'stem') {
        return {
          ...question,
          stem: markBlocks(question.stem),
        };
      }

      if (section === 'my-answer') {
        return {
          ...question,
          myAnswerBlocks: markBlocks(question.myAnswerBlocks),
        };
      }

      if (section === 'correct-answer') {
        return {
          ...question,
          correctAnswerBlocks: markBlocks(question.correctAnswerBlocks),
        };
      }

      if (section === 'explanation') {
        return {
          ...question,
          explanation: markBlocks(question.explanation),
        };
      }

      if (section === 'option') {
        return {
          ...question,
          options: question.options.map((option) =>
            option.optionId === optionId
              ? {
                  ...option,
                  blocks: markBlocks(option.blocks),
                }
              : option,
          ),
        };
      }

      return question;
    });
  },

  mapQuestion(question: BattleHistoryQuestionResponse) {
    const resultMeta = this.getQuestionResultMeta(question.isCorrect);
    const questionId = question.battleQuestionSnapshotId;
    const myAnswer = question.myAnswer;
    const myAnswerBlocks: BattleContentBlock[] = [];
    let myAnswerLabel = '我的作答';
    let myAnswerText = '未作答';

    if (myAnswer) {
      if (myAnswer.answer.type === 'SINGLE_CHOICE') {
        const optionLabel = this.findOptionLabel(
          question.options,
          myAnswer.answer.optionId,
        );

        myAnswerLabel = '我的作答选项';
        myAnswerText = optionLabel
          ? `已选择选项 ${optionLabel}`
          : '已提交单选答案';
        myAnswerBlocks.push(
          ...this.findOptionBlocks(question.options, myAnswer.answer.optionId),
        );
      } else {
        myAnswerLabel = '我的代码填空答案';
        myAnswerText = '已提交代码填空答案';
        myAnswerBlocks.push({
          type: 'CODE',
          code: myAnswer.answer.value,
          language: question.presentation,
        });
      }
    }

    const correctAnswerBlocks: BattleContentBlock[] = [];
    let correctAnswerLabel = '正确答案';
    let correctAnswerText = '';

    if (question.correctAnswer.type === 'SINGLE_CHOICE') {
      const optionLabel = this.findOptionLabel(
        question.options,
        question.correctAnswer.optionId,
      );
      correctAnswerText = optionLabel
        ? `正确选项 ${optionLabel}`
        : '正确单选答案';
      correctAnswerBlocks.push(
        ...this.findOptionBlocks(question.options, question.correctAnswer.optionId),
      );
    } else {
      correctAnswerLabel = '代码填空标准答案';
      correctAnswerText = '当前正式接口未返回代码填空标准答案文本';
    }

    return {
      battleQuestionSnapshotId: questionId,
      questionNumberText: `第 ${question.orderIndex + 1} 题`,
      questionTypeText: this.getQuestionTypeText(question.questionType),
      difficultyText: this.getDifficultyText(question.difficulty),
      resultText: resultMeta.text,
      resultClassName: resultMeta.className,
      scoreDeltaText: this.formatScoreDelta(question.scoreDelta),
      stem: this.mapBlocks(question.stem, `${questionId}-stem`),
      options: this.mapOptions(question.options, question),
      myAnswerLabel,
      myAnswerText,
      myAnswerBlocks: this.mapBlocks(myAnswerBlocks, `${questionId}-my-answer`),
      myAnswerSubmittedAtText: myAnswer
        ? this.formatDateTime(myAnswer.submittedAt)
        : '',
      myAnswerTimeSpentText: this.formatTimeSpent(myAnswer?.timeSpentMs ?? null),
      correctAnswerLabel,
      correctAnswerText,
      correctAnswerBlocks: this.mapBlocks(
        correctAnswerBlocks,
        `${questionId}-correct-answer`,
      ),
      explanation: this.mapBlocks(
        question.explanation ?? [],
        `${questionId}-explanation`,
      ),
      hasExplanation: Array.isArray(question.explanation) && question.explanation.length > 0,
      courseId: question.courseId ?? '',
      courseTitle: question.courseTitle ?? '',
      chapterId: question.chapterId ?? '',
      chapterTitle: question.chapterTitle ?? '',
      canOpenCourse: UUID_PATTERN.test(question.courseId ?? ''),
      canOpenChapter: UUID_PATTERN.test(question.chapterId ?? ''),
      knowledgeHintText: '当前正式接口未返回知识点信息',
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

      if (block.type === 'IMAGE') {
        return {
          ...block,
          blockKey,
          imageFailed,
          altText: block.alt?.trim() || '图片加载失败',
        };
      }

      return {
        ...block,
        blockKey,
        imageFailed,
        altText: '',
      };
    });
  },

  mapOptions(
    options: BattleQuestionOptionSnapshotResponse[],
    question: BattleHistoryQuestionResponse,
    previousQuestion?: QuestionReviewCard | null,
  ) {
    const previousOptionMap = new Map(
      (previousQuestion?.options ?? []).map((option) => [option.optionId, option]),
    );

    return options.map((option, index) => ({
      optionId: option.id,
      optionLabel: String.fromCharCode(65 + index),
      blocks: this.mapBlocks(
        option.blocks,
        `${question.battleQuestionSnapshotId}-option-${option.id}`,
        previousOptionMap.get(option.id)?.blocks,
      ),
      isCorrectOption: question.correctOptionId === option.id,
      isMyOption:
        question.myAnswer?.answer.type === 'SINGLE_CHOICE' &&
        question.myAnswer.answer.optionId === option.id,
    }));
  },

  replaceQuestion(question: QuestionReviewCard) {
    this.setData({
      questions: this.data.questions.map((item) =>
        item.battleQuestionSnapshotId === question.battleQuestionSnapshotId
          ? question
          : item,
      ),
    });
  },

  updateQuestion(
    questionId: string,
    updater: (question: QuestionReviewCard) => QuestionReviewCard,
  ) {
    const current = this.data.questions.find(
      (question) => question.battleQuestionSnapshotId === questionId,
    );

    if (!current) {
      return;
    }

    this.replaceQuestion(updater(current));
  },

  getModeText(mode: string) {
    return mode === 'FRIEND' ? '好友对战' : '排位对战';
  },

  getStatusText(status: string) {
    if (status === 'COMPLETED') {
      return '已完成';
    }

    if (status === 'SETTLING') {
      return '结算中';
    }

    return status;
  },

  getResultMeta(result: 'WIN' | 'LOSS' | 'DRAW') {
    if (result === 'WIN') {
      return {
        text: '胜利',
        className: 'result-badge-win',
      };
    }

    if (result === 'LOSS') {
      return {
        text: '失利',
        className: 'result-badge-loss',
      };
    }

    return {
      text: '平局',
      className: 'result-badge-draw',
    };
  },

  getEndReasonText(endReason: string | null) {
    if (endReason === 'USER_FORFEIT') {
      return '认输结束';
    }

    if (endReason === 'MATCH_TIMEOUT') {
      return '超时结算';
    }

    if (endReason === 'EXPIRED') {
      return '房间过期';
    }

    if (endReason === 'SYSTEM_CANCELLED') {
      return '系统取消';
    }

    return '正常结束';
  },

  getQuestionTypeText(type: string) {
    return type === 'CODE_FILL' ? '代码填空题' : '单选题';
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

  getQuestionResultMeta(isCorrect: boolean | null) {
    if (isCorrect === true) {
      return {
        text: '答对',
        className: 'result-pill-correct',
      };
    }

    if (isCorrect === false) {
      return {
        text: '答错',
        className: 'result-pill-wrong',
      };
    }

    return {
      text: '未作答',
      className: 'result-pill-unanswered',
    };
  },

  findOptionLabel(
    options: BattleQuestionOptionSnapshotResponse[],
    optionId: string,
  ) {
    const index = options.findIndex((option) => option.id === optionId);

    return index >= 0 ? String.fromCharCode(65 + index) : '';
  },

  findOptionBlocks(
    options: BattleQuestionOptionSnapshotResponse[],
    optionId: string,
  ) {
    return options.find((option) => option.id === optionId)?.blocks ?? [];
  },

  formatDateTime(value: string | null) {
    if (!value) {
      return '';
    }

    const timestamp = Date.parse(value);

    if (!Number.isFinite(timestamp)) {
      return '';
    }

    const date = new Date(timestamp);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${month}-${day} ${hours}:${minutes}:${seconds}`;
  },

  formatTimeSpent(value: number | null) {
    if (!Number.isFinite(value) || value === null || value < 0) {
      return '';
    }

    return `耗时 ${Math.max(0, Math.round(value / 1000))} 秒`;
  },

  formatScoreDelta(value: number) {
    if (value > 0) {
      return `+${value}`;
    }

    return String(value);
  },

  formatRatingDelta(value: number) {
    if (value > 0) {
      return `+${value}`;
    }

    return String(value);
  },

  getReadableError(error: unknown) {
    if (error instanceof RequestError) {
      if (error.statusCode === 401 || error.code === 'UNAUTHORIZED') {
        redirectToLogin(
          `/pages/battle/history-detail?battleId=${encodeURIComponent(this.data.battleId)}`,
        );
        return '登录状态已失效，请重新登录后再查看 Battle 复盘。';
      }

      if (error.code === 'NETWORK_ERROR') {
        return '无法连接 Battle 复盘服务，请确认后端服务已启动。';
      }

      if (error.code === 'BATTLE_HISTORY_NOT_FOUND') {
        return '当前 Battle 战绩不存在或已无法查看。';
      }

      if (error.code === 'BATTLE_HISTORY_NOT_COMPLETED') {
        return '当前 Battle 尚未形成可复盘的已完成战绩。';
      }

      if (error.code === 'BATTLE_NOT_PARTICIPANT') {
        return '你不是这场 Battle 的参与者，无法查看复盘详情。';
      }

      return error.message || 'Battle 复盘加载失败，请稍后重试。';
    }

    if (error instanceof Error && error.message) {
      return error.message;
    }

    return 'Battle 复盘加载失败，请稍后重试。';
  },
});
