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
    return 'Guest';
  }

  if (user.status === 'DISABLED') {
    return 'Disabled';
  }

  if (user.status === 'DELETED') {
    return 'Deleted';
  }

  return 'Normal';
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof RequestError || error instanceof Error) {
    return error.message || fallback;
  }

  return fallback;
}

Page<ProfilePageData>({
  data: {
    isAuthenticated: false,
    user: null,
    displayName: 'Guest User',
    statusText: 'Guest',
    isLoggingOut: false,
    showMockHint: false,
  },

  onShow() {
    const authState = getAuthStateSummary();
    const user = authState.user;

    this.setData({
      isAuthenticated: authState.isAuthenticated,
      user,
      displayName: user?.nickname?.trim() || 'WeChat User',
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
      wx.showToast({
        title: getErrorMessage(error, 'Logout failed. Local auth has been cleared.'),
        icon: 'none',
      });
    } finally {
      clearAuthSession();
      const authState = getAuthStateSummary();

      this.setData({
        isAuthenticated: authState.isAuthenticated,
        user: authState.user,
        displayName: 'Guest User',
        statusText: 'Guest',
        isLoggingOut: false,
      });
      wx.showToast({
        title: 'Logged out.',
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
