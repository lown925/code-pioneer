import type {
  BattleEndReason,
  BattleMode,
  BattleResult,
  BattleResultResponse,
} from '../../types/battle';
import { getAuthStateSummary, redirectToLogin } from '../../utils/auth';
import {
  formatBattleInitial,
  formatBattleNickname,
  formatBattleRating,
  formatBattleSkill,
  getBattleErrorMessage,
} from '../../utils/battle';
import { request, RequestError } from '../../utils/request';

declare function clearTimeout(timeoutId: number): void;

type ResultPageState = 'LOADING' | 'WAITING' | 'SUCCESS' | 'ERROR';

type ResultPageData = {
  battleId: string;
  isValidBattleId: boolean;
  state: ResultPageState;
  titleText: string;
  descriptionText: string;
  errorMessage: string;
  modeText: string;
  skillText: string;
  statusText: string;
  resultText: string;
  resultHintText: string;
  resultBadgeClassName: string;
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
  completedAtText: string;
  endReasonText: string;
  isTrainingMode: boolean;
};

type ResultPageMethods = {
  ensureAuthenticated(): boolean;
  loadResult(): Promise<void>;
  startPolling(): void;
  stopPolling(): void;
  handleRetry(): void;
  handleBackHome(): void;
  handleReplay(): void;
  getPendingTitle(status: 'COUNTDOWN' | 'IN_PROGRESS' | 'SETTLING'): string;
  getPendingDescription(
    status: 'COUNTDOWN' | 'IN_PROGRESS' | 'SETTLING',
  ): string;
  getStatusText(
    status: 'COUNTDOWN' | 'IN_PROGRESS' | 'SETTLING' | 'COMPLETED',
    completed: boolean,
  ): string;
  getModeText(mode: BattleMode): string;
  getResultMeta(result: BattleResult): {
    resultText: string;
    resultHintText: string;
    resultBadgeClassName: string;
  };
  getEndReasonText(endReason: BattleEndReason | null): string;
  formatCompletedAt(value: string): string;
  formatRatingDelta(value: number): string;
  getReadableError(error: unknown): string;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const RESULT_POLL_MS = 1800;

let isPageActive = false;
let hasLoadedOnce = false;
let requestSerial = 0;
let pollTimer: number | null = null;
let isResultRequesting = false;

Page<ResultPageData, ResultPageMethods>({
  data: {
    battleId: '',
    isValidBattleId: false,
    state: 'LOADING',
    titleText: '正在获取 Battle 结果',
    descriptionText: '系统正在同步本场对战的结算结果，请稍候。',
    errorMessage: '',
    modeText: '',
    skillText: '',
    statusText: '',
    resultText: '',
    resultHintText: '',
    resultBadgeClassName: 'result-badge-waiting',
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
    completedAtText: '',
    endReasonText: '',
    isTrainingMode: false,
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
      titleText: isValidBattleId ? '正在获取 Battle 结果' : 'battleId 无效',
      descriptionText: isValidBattleId
        ? '系统正在同步本场对战的结算结果，请稍候。'
        : '当前页面没有收到合法的 Battle 标识。',
      errorMessage: '',
    });

    if (!isValidBattleId) {
      return;
    }

    void this.loadResult();
  },

  onShow() {
    isPageActive = true;

    if (hasLoadedOnce && this.data.isValidBattleId) {
      void this.loadResult();
    }
  },

  onHide() {
    this.stopPolling();
  },

  onUnload() {
    isPageActive = false;
    requestSerial += 1;
    this.stopPolling();
  },

  onPullDownRefresh() {
    void this.loadResult().finally(() => {
      wx.stopPullDownRefresh();
    });
  },

  ensureAuthenticated() {
    if (getAuthStateSummary().isAuthenticated) {
      return true;
    }

    if (this.data.isValidBattleId) {
      redirectToLogin(
        `/pages/battle/result?battleId=${encodeURIComponent(this.data.battleId)}`,
      );
    } else {
      redirectToLogin('/pages/battle/index');
    }

    return false;
  },

  async loadResult() {
    if (
      !this.data.isValidBattleId ||
      !this.ensureAuthenticated() ||
      isResultRequesting
    ) {
      return;
    }

    const currentRequestSerial = ++requestSerial;
    isResultRequesting = true;

    if (!hasLoadedOnce) {
      this.setData({
        state: 'LOADING',
        titleText: '正在获取 Battle 结果',
        descriptionText: '系统正在同步本场对战的结算结果，请稍候。',
        errorMessage: '',
      });
    }

    try {
      const response = await request<BattleResultResponse>({
        url: `/battles/${encodeURIComponent(this.data.battleId)}/result`,
        method: 'GET',
        authMode: 'required',
      });

      if (!isPageActive || currentRequestSerial !== requestSerial) {
        return;
      }

      this.stopPolling();

      if (!response.completed) {
        this.setData({
          state: 'WAITING',
          titleText: this.getPendingTitle(response.status),
          descriptionText: this.getPendingDescription(response.status),
          errorMessage: '',
          modeText: this.getModeText(response.mode),
          skillText: formatBattleSkill(response.skill),
          statusText: this.getStatusText(response.status, false),
          resultText: '等待结算',
          resultHintText: '结果准备完成后会自动刷新展示。',
          resultBadgeClassName: 'result-badge-waiting',
          isTrainingMode: response.mode === 'TRAINING',
        });

        this.startPolling();
        return;
      }

      const resultMeta = this.getResultMeta(response.result);
      const isTrainingMode = response.mode === 'TRAINING';

      this.setData({
        state: 'SUCCESS',
        titleText: resultMeta.resultText,
        descriptionText: isTrainingMode
          ? '本场单人训练已完成，答题记录会进入 Battle 历史，且不会改变 Rating。'
          : '本场对战的分数、胜负和 rating 变化均以服务端结算结果为准。',
        errorMessage: '',
        modeText: this.getModeText(response.mode),
        skillText: formatBattleSkill(response.skill),
        statusText: this.getStatusText(response.status, true),
        resultText: resultMeta.resultText,
        resultHintText: resultMeta.resultHintText,
        resultBadgeClassName: resultMeta.resultBadgeClassName,
        myScoreText: String(response.myScore),
        opponentScoreText:
          response.opponentScore === null ? '—' : String(response.opponentScore),
        myCorrectCountText: String(response.myCorrectCount),
        myWrongCountText: String(response.myWrongCount),
        myUnansweredCountText: String(response.myUnansweredCount),
        opponentCorrectCountText:
          response.opponentCorrectCount === null
            ? '—'
            : String(response.opponentCorrectCount),
        opponentWrongCountText:
          response.opponentWrongCount === null
            ? '—'
            : String(response.opponentWrongCount),
        opponentUnansweredCountText:
          response.opponentUnansweredCount === null
            ? '—'
            : String(response.opponentUnansweredCount),
        ratingBeforeText: formatBattleRating(response.ratingBefore),
        ratingDeltaText: this.formatRatingDelta(response.ratingDelta),
        ratingAfterText: formatBattleRating(response.ratingAfter),
        opponentNicknameText: response.opponent
          ? formatBattleNickname(response.opponent.nickname)
          : '',
        opponentAvatarUrl: response.opponent?.avatarUrl ?? '',
        opponentAvatarFallbackText: response.opponent
          ? formatBattleInitial(response.opponent.nickname)
          : '',
        completedAtText: this.formatCompletedAt(response.completedAt),
        endReasonText: this.getEndReasonText(response.endReason),
        isTrainingMode,
      });
    } catch (error) {
      if (!isPageActive || currentRequestSerial !== requestSerial) {
        return;
      }

      if (
        error instanceof RequestError &&
        error.code === 'BATTLE_NOT_STARTED'
      ) {
        this.setData({
          state: 'WAITING',
          titleText: '对战尚未结束',
          descriptionText: '当前对战还没有进入可查看结果的阶段，页面会自动轮询最新状态。',
          errorMessage: '',
          statusText: '未开始结算',
          resultText: '等待结算',
          resultHintText: '结果准备完成后会自动刷新展示。',
          resultBadgeClassName: 'result-badge-waiting',
        });
        this.startPolling();
        return;
      }

      this.stopPolling();
      this.setData({
        state: 'ERROR',
        titleText: '结果获取失败',
        descriptionText: '你可以重新查询服务端结算结果，或先返回 Battle 首页。',
        errorMessage: this.getReadableError(error),
      });
    } finally {
      isResultRequesting = false;
      hasLoadedOnce = true;
    }
  },

  startPolling() {
    this.stopPolling();

    if (!isPageActive || this.data.state !== 'WAITING') {
      return;
    }

    pollTimer = setTimeout(() => {
      pollTimer = null;

      if (!isPageActive) {
        return;
      }

      void this.loadResult();
    }, RESULT_POLL_MS) as unknown as number;
  },

  stopPolling() {
    if (pollTimer !== null) {
      clearTimeout(pollTimer);
      pollTimer = null;
    }
  },

  handleRetry() {
    void this.loadResult();
  },

  handleBackHome() {
    wx.switchTab({
      url: '/pages/battle/index',
    });
  },

  handleReplay() {
    if (!this.data.isValidBattleId) {
      wx.switchTab({
        url: '/pages/battle/index',
      });
      return;
    }

    wx.navigateTo({
      url: `/pages/battle/history-detail?battleId=${encodeURIComponent(this.data.battleId)}`,
    });
  },

  getPendingTitle(status: 'COUNTDOWN' | 'IN_PROGRESS' | 'SETTLING') {
    if (status === 'COUNTDOWN') {
      return '对战尚未正式开始';
    }

    if (status === 'IN_PROGRESS') {
      return '对战进行中';
    }

    return '等待结算中';
  },

  getPendingDescription(status: 'COUNTDOWN' | 'IN_PROGRESS' | 'SETTLING') {
    if (status === 'COUNTDOWN') {
      return '当前对战还在共享倒计时阶段，整场结算结果会在对战结束后提供。';
    }

    if (status === 'IN_PROGRESS') {
      return '当前对战还在进行中，结果会在交卷、认输或超时结算后自动展示。';
    }

    return '服务端正在整理本场结算结果，完成后会自动刷新当前页面。';
  },

  getStatusText(
    status: 'COUNTDOWN' | 'IN_PROGRESS' | 'SETTLING' | 'COMPLETED',
    completed: boolean,
  ) {
    if (completed) {
      return '已完成';
    }

    if (status === 'COUNTDOWN') {
      return '倒计时中';
    }

    if (status === 'IN_PROGRESS') {
      return '进行中';
    }

    if (status === 'SETTLING') {
      return '结算中';
    }

    return '处理中';
  },

  getModeText(mode: BattleMode) {
    if (mode === 'FRIEND') {
      return '好友对战';
    }

    if (mode === 'RANKED') {
      return '排位对战';
    }

    if (mode === 'TRAINING') {
      return '单人训练';
    }

    return '未知模式';
  },

  getResultMeta(result: BattleResult) {
    if (result === 'NONE') {
      return {
        resultText: '训练完成',
        resultHintText: '本场训练不计 Rating，答错题目仍会进入错题记录。',
        resultBadgeClassName: 'result-badge-draw',
      };
    }

    if (result === 'WIN') {
      return {
        resultText: '胜利',
        resultHintText: '你在这场 Battle 中取得了胜利。',
        resultBadgeClassName: 'result-badge-win',
      };
    }

    if (result === 'LOSS') {
      return {
        resultText: '失利',
        resultHintText: '本场 Battle 已结束，本次结果为失利。',
        resultBadgeClassName: 'result-badge-loss',
      };
    }

    return {
      resultText: '平局',
      resultHintText: '本场 Battle 双方战成平局。',
      resultBadgeClassName: 'result-badge-draw',
    };
  },

  getEndReasonText(endReason: BattleEndReason | null) {
    if (endReason === 'USER_FORFEIT') {
      return '认输结束';
    }

    if (endReason === 'MATCH_TIMEOUT') {
      return '超时结算';
    }

    if (endReason === 'SYSTEM_CANCELLED') {
      return '系统取消';
    }

    if (endReason === 'EXPIRED') {
      return '房间过期';
    }

    return '正常结束';
  },

  formatCompletedAt(value: string) {
    const timestamp = Date.parse(value);

    if (!Number.isFinite(timestamp)) {
      return '结算时间未知';
    }

    const date = new Date(timestamp);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${month}-${day} ${hours}:${minutes}:${seconds}`;
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
          `/pages/battle/result?battleId=${encodeURIComponent(this.data.battleId)}`,
        );
        return '登录状态已失效，请重新登录后再查看 Battle 结果。';
      }
    }

    return getBattleErrorMessage(
      error,
      {
        unauthorized: '登录状态已失效，请重新登录后再查看 Battle 结果。',
        network: '网络连接失败，请确认后端服务已启动后重试。',
        fallback: 'Battle 结果获取失败，请稍后重试。',
      },
      {
        BATTLE_NOT_PARTICIPANT:
          '你不是这场对战的参与者，无法查看 Battle 结果。',
        BATTLE_SETTLEMENT_DATA_INVALID:
          '当前对战尚未生成有效结算数据，请稍后再试。',
        BATTLE_ALREADY_COMPLETED: '本场 Battle 已完成，正在同步最终结果。',
        BATTLE_INVALID_STATUS:
          '当前结算状态已变化，请重新同步服务端状态后再继续查看。',
      },
    );
  },
});
