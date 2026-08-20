import type { AuthUserProfile } from '../../types/auth';
import type { BattleProfileResponse } from '../../types/battle';
import type { WrongQuestionStatisticsResponse } from '../../types/wrong-question';
import {
  clearAuthSession,
  getAuthStateSummary,
  redirectToLogin,
} from '../../utils/auth';
import { request, RequestError } from '../../utils/request';
import { registerThemedPage } from '../../utils/theme-page';

type ProfileMetricKey = 'battleHistory' | 'wrongQuestion';

type ProfileMetricCard = {
  key: ProfileMetricKey;
  title: string;
  valueText: string;
  helperText: string;
};

type ProfileBattleSummary = {
  totalBattlesText: string;
  ratingText: string;
  recordText: string;
};

type ProfileWrongQuestionSummary = {
  totalWrongQuestionsText: string;
};

type ProfilePageData = {
  isAuthenticated: boolean;
  user: AuthUserProfile | null;
  displayName: string;
  profileInitial: string;
  isLoggingOut: boolean;
  battleSummary: ProfileBattleSummary | null;
  wrongQuestionSummary: ProfileWrongQuestionSummary | null;
  metrics: ProfileMetricCard[];
  isOverviewLoading: boolean;
  overviewErrorMessage: string;
};

type ProfilePageMethods = {
  syncAuthState(): boolean;
  loadPageData(): Promise<void>;
  loadOverview(): Promise<void>;
  updateMetrics(): void;
  handleLogin(): void;
  handleOverviewRetry(): void;
  handleMetricTap(
    event: WechatMiniprogram.BaseEvent<{ metricKey?: ProfileMetricKey }>,
  ): void;
  handleLearningEntry(): void;
  handleEditProfile(): void;
  handleSettings(): void;
  handleLogout(): Promise<void>;
  mapBattleSummary(data: BattleProfileResponse): ProfileBattleSummary;
  mapWrongQuestionSummary(
    data: WrongQuestionStatisticsResponse,
  ): ProfileWrongQuestionSummary;
};

let isPageActive = false;
let overviewRequestSerial = 0;

function getDisplayName(user: AuthUserProfile | null) {
  return user?.nickname?.trim() || '微信用户';
}

function getProfileInitial(user: AuthUserProfile | null) {
  return getDisplayName(user).slice(0, 1) || '我';
}

function formatCount(value: number) {
  return String(Math.max(0, Math.floor(value)));
}

function formatBattleRecord(data: BattleProfileResponse) {
  return `胜 ${Math.max(0, data.wins)} / 负 ${Math.max(0, data.losses)} / 平 ${Math.max(0, data.draws)}`;
}

function getLogoutErrorMessage(error: unknown) {
  if (error instanceof RequestError || error instanceof Error) {
    return '退出接口调用失败，已清理本地登录态';
  }

  return '退出接口调用失败，已清理本地登录态';
}

registerThemedPage<ProfilePageData, ProfilePageMethods>({
  data: {
    isAuthenticated: false,
    user: null,
    displayName: '游客用户',
    profileInitial: '我',
    isLoggingOut: false,
    battleSummary: null,
    wrongQuestionSummary: null,
    metrics: [
      {
        key: 'battleHistory',
        title: '战绩',
        valueText: '0',
        helperText: '查看对战记录',
      },
      {
        key: 'wrongQuestion',
        title: '错题',
        valueText: '0',
        helperText: '学习与对战错题',
      },
    ],
    isOverviewLoading: false,
    overviewErrorMessage: '',
  },

  onShow() {
    isPageActive = true;
    void this.loadPageData();
  },

  onUnload() {
    isPageActive = false;
    overviewRequestSerial += 1;
  },

  onPullDownRefresh() {
    void this.loadPageData().finally(() => {
      wx.stopPullDownRefresh();
    });
  },

  syncAuthState() {
    const authState = getAuthStateSummary();
    const user = authState.user;

    this.setData({
      isAuthenticated: authState.isAuthenticated,
      user,
      displayName: getDisplayName(user),
      profileInitial: getProfileInitial(user),
    });

    return authState.isAuthenticated;
  },

  async loadPageData() {
    const isAuthenticated = this.syncAuthState();

    if (!isAuthenticated) {
      if (isPageActive) {
        this.setData({
          battleSummary: null,
          wrongQuestionSummary: null,
          isOverviewLoading: false,
          overviewErrorMessage: '',
        });
        this.updateMetrics();
      }
      return;
    }

    await this.loadOverview();
  },

  async loadOverview() {
    const currentSerial = ++overviewRequestSerial;

    this.setData({
      isOverviewLoading: true,
      overviewErrorMessage: '',
    });

    try {
      const [battleSummary, wrongQuestionSummary] = await Promise.all([
        request<BattleProfileResponse>({
          url: '/battles/profile',
          method: 'GET',
          authMode: 'required',
        }),
        request<WrongQuestionStatisticsResponse>({
          url: '/users/me/wrong-questions/statistics',
          method: 'GET',
          authMode: 'required',
        }),
      ]);

      if (!isPageActive || currentSerial !== overviewRequestSerial) {
        return;
      }

      this.setData({
        isOverviewLoading: false,
        overviewErrorMessage: '',
        battleSummary: this.mapBattleSummary(battleSummary),
        wrongQuestionSummary: this.mapWrongQuestionSummary(wrongQuestionSummary),
      });
      this.updateMetrics();
    } catch (error) {
      if (!isPageActive || currentSerial !== overviewRequestSerial) {
        return;
      }

      this.setData({
        isOverviewLoading: false,
        overviewErrorMessage:
          error instanceof RequestError && error.code === 'NETWORK_ERROR'
            ? '概览加载失败，请确认后端服务可用后重试'
            : '概览加载失败，请稍后重试',
      });
    }
  },

  updateMetrics() {
    this.setData({
      metrics: [
        {
          key: 'battleHistory',
          title: '战绩',
          valueText: this.data.battleSummary?.totalBattlesText ?? '0',
          helperText: '查看对战记录',
        },
        {
          key: 'wrongQuestion',
          title: '错题',
          valueText:
            this.data.wrongQuestionSummary?.totalWrongQuestionsText ?? '0',
          helperText: '学习与对战错题',
        },
      ],
    });
  },

  handleLogin() {
    redirectToLogin('/pages/profile/index');
  },

  handleOverviewRetry() {
    void this.loadOverview();
  },

  handleMetricTap(
    event: WechatMiniprogram.BaseEvent<{ metricKey?: ProfileMetricKey }>,
  ) {
    if (!this.data.isAuthenticated) {
      redirectToLogin('/pages/profile/index');
      return;
    }

    const metricKey = event.currentTarget.dataset.metricKey;

    if (metricKey === 'battleHistory') {
      wx.navigateTo({
        url: '/pages/battle/history',
      });
      return;
    }

    if (metricKey === 'wrongQuestion') {
      wx.navigateTo({
        url: '/pages/wrong-question/index',
      });
    }
  },

  handleLearningEntry() {
    if (!this.data.isAuthenticated) {
      redirectToLogin('/pages/learning/index');
      return;
    }

    wx.switchTab({
      url: '/pages/learning/index',
    });
  },

  handleEditProfile() {
    if (!this.data.isAuthenticated) {
      redirectToLogin('/pages/profile/index');
      return;
    }

    wx.navigateTo({
      url: '/pages/profile/edit',
    });
  },

  handleSettings() {
    wx.navigateTo({
      url: '/pages/settings/index',
    });
  },

  async handleLogout() {
    if (!this.data.isAuthenticated || this.data.isLoggingOut) {
      return;
    }

    let toastMessage = '已退出登录';

    this.setData({
      isLoggingOut: true,
    });

    try {
      await request<Record<string, never>>({
        url: '/auth/logout',
        method: 'POST',
        authMode: 'required',
        retryOnAuthFailure: false,
        disableAuthRedirect: true,
      });
    } catch (error) {
      toastMessage = getLogoutErrorMessage(error);
    } finally {
      clearAuthSession();
      this.syncAuthState();
      if (isPageActive) {
        this.setData({
          battleSummary: null,
          wrongQuestionSummary: null,
          isLoggingOut: false,
          isOverviewLoading: false,
          overviewErrorMessage: '',
        });
        this.updateMetrics();
      }

      wx.showToast({
        title: toastMessage,
        icon: 'none',
      });
    }
  },

  mapBattleSummary(data: BattleProfileResponse) {
    return {
      totalBattlesText: formatCount(data.totalBattles),
      ratingText: formatCount(data.rating),
      recordText: formatBattleRecord(data),
    };
  },

  mapWrongQuestionSummary(data: WrongQuestionStatisticsResponse) {
    return {
      totalWrongQuestionsText: formatCount(data.totalWrongQuestions),
    };
  },
});
