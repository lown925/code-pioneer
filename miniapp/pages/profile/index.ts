import type { AuthUserProfile } from '../../types/auth';
import {
  clearAuthSession,
  getAuthStateSummary,
  isDevelopmentEnvironment,
  redirectToLogin,
} from '../../utils/auth';
import { RequestError, request } from '../../utils/request';

type ProfilePageData = {
  isAuthenticated: boolean;
  user: AuthUserProfile | null;
  displayName: string;
  statusText: string;
  isLoggingOut: boolean;
  showMockHint: boolean;
};

function formatStatus(user: AuthUserProfile | null) {
  if (!user) {
    return '游客';
  }

  if (user.status === 'DISABLED') {
    return '已禁用';
  }

  if (user.status === 'DELETED') {
    return '已注销';
  }

  return '正常';
}

function getLogoutErrorMessage(error: unknown) {
  if (error instanceof RequestError) {
    return '退出接口调用失败，已清理本地登录态';
  }

  if (error instanceof Error) {
    return '退出接口调用失败，已清理本地登录态';
  }

  return '退出接口调用失败，已清理本地登录态';
}

Page<ProfilePageData>({
  data: {
    isAuthenticated: false,
    user: null,
    displayName: '游客用户',
    statusText: '游客',
    isLoggingOut: false,
    showMockHint: false,
  },

  onShow() {
    const authState = getAuthStateSummary();
    const user = authState.user;

    this.setData({
      isAuthenticated: authState.isAuthenticated,
      user,
      displayName: user?.nickname?.trim() || '微信用户',
      statusText: formatStatus(user),
      showMockHint: isDevelopmentEnvironment(),
    });
  },

  handleLogin() {
    redirectToLogin('/pages/profile/index');
  },

  handleLearningEntry() {
    if (!this.data.isAuthenticated) {
      redirectToLogin('/pages/learning/index');
      return;
    }

    wx.navigateTo({
      url: '/pages/learning/index',
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
      const authState = getAuthStateSummary();

      this.setData({
        isAuthenticated: authState.isAuthenticated,
        user: authState.user,
        displayName: '游客用户',
        statusText: '游客',
        isLoggingOut: false,
      });
      wx.showToast({
        title: toastMessage,
        icon: 'none',
      });
    }
  },

  handleWrongQuestionEntry() {
    if (!this.data.isAuthenticated) {
      redirectToLogin('/pages/wrong-question/index');
      return;
    }

    wx.navigateTo({
      url: '/pages/wrong-question/index',
    });
  },
});
