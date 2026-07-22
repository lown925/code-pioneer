import type { LoginResponseData } from '../../types/auth';
import {
  finishLoginNavigation,
  getAuthStateSummary,
  isDevelopmentEnvironment,
  saveLoginSession,
} from '../../utils/auth';
import { RequestError, request } from '../../utils/request';

type LoginPageData = {
  isWechatSubmitting: boolean;
  isMockSubmitting: boolean;
  errorMessage: string;
  mockOpenId: string;
  redirectPath: string;
  showMockLogin: boolean;
};

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof RequestError || error instanceof Error) {
    return error.message || fallback;
  }

  return fallback;
}

function wxLogin() {
  return new Promise<WechatMiniprogram.LoginSuccessCallbackResult>(
    (resolve, reject) => {
      wx.login({
        success: (result) => {
          if (result.code) {
            resolve(result);
            return;
          }

          reject(new Error('WeChat login code is empty. Please try again.'));
        },
        fail: () => {
          reject(
            new Error(
              'Failed to get the WeChat login code. Please check the devtools environment.',
            ),
          );
        },
      });
    },
  );
}

Page<LoginPageData>({
  data: {
    isWechatSubmitting: false,
    isMockSubmitting: false,
    errorMessage: '',
    mockOpenId: 'mock-openid-dev-user-001',
    redirectPath: '',
    showMockLogin: false,
  },

  onLoad(query) {
    const redirectPath =
      typeof query.redirect === 'string' && query.redirect.trim().length > 0
        ? decodeURIComponent(query.redirect)
        : '';

    this.setData({
      redirectPath,
      showMockLogin: isDevelopmentEnvironment(),
    });
  },

  onShow() {
    if (getAuthStateSummary().isAuthenticated) {
      finishLoginNavigation(this.data.redirectPath);
    }
  },

  handleMockOpenIdInput(
    event: WechatMiniprogram.CustomEvent<{ value?: string }>,
  ) {
    this.setData({
      mockOpenId: event.detail.value ?? '',
    });
  },

  async handleWechatLogin() {
    if (this.data.isWechatSubmitting || this.data.isMockSubmitting) {
      return;
    }

    this.setData({
      isWechatSubmitting: true,
      errorMessage: '',
    });

    try {
      const loginResult = await wxLogin();
      const data = await request<LoginResponseData>({
        url: '/auth/wechat-login',
        method: 'POST',
        data: {
          code: loginResult.code,
        },
        authMode: 'none',
        retryOnAuthFailure: false,
        disableAuthRedirect: true,
      });

      saveLoginSession(data);
      wx.showToast({
        title: data.isNewUser ? 'Login succeeded. Welcome.' : 'Login succeeded.',
        icon: 'none',
      });
      finishLoginNavigation(this.data.redirectPath);
    } catch (error) {
      this.setData({
        errorMessage: getErrorMessage(
          error,
          'Login failed. Please try again later.',
        ),
      });
    } finally {
      this.setData({
        isWechatSubmitting: false,
      });
    }
  },

  async handleMockLogin() {
    if (
      !this.data.showMockLogin ||
      this.data.isWechatSubmitting ||
      this.data.isMockSubmitting
    ) {
      return;
    }

    const mockOpenId = this.data.mockOpenId.trim();

    if (!mockOpenId) {
      this.setData({
        errorMessage: 'Please enter a mockOpenId for development login.',
      });
      return;
    }

    this.setData({
      isMockSubmitting: true,
      errorMessage: '',
    });

    try {
      const data = await request<LoginResponseData>({
        url: '/auth/wechat-login',
        method: 'POST',
        data: {
          code: 'mock-login-placeholder',
          mockOpenId,
        },
        authMode: 'none',
        retryOnAuthFailure: false,
        disableAuthRedirect: true,
      });

      saveLoginSession(data);
      wx.showToast({
        title: 'Mock login succeeded.',
        icon: 'none',
      });
      finishLoginNavigation(this.data.redirectPath);
    } catch (error) {
      this.setData({
        errorMessage: getErrorMessage(
          error,
          'Mock login failed. Please verify the backend dev auth config.',
        ),
      });
    } finally {
      this.setData({
        isMockSubmitting: false,
      });
    }
  },
});
