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

function decodeQueryValue(value: string) {
  try {
    return decodeURIComponent(value).trim();
  } catch {
    return value.trim();
  }
}

function isDatabaseErrorMessage(message: string) {
  const normalized = message.toLowerCase();

  return (
    normalized.includes('database') ||
    normalized.includes('prisma') ||
    normalized.includes('connect') ||
    normalized.includes('econnrefused') ||
    normalized.includes("can't reach database") ||
    normalized.includes('cant reach database') ||
    normalized.includes('timeout')
  );
}

function isAuthConfigErrorMessage(message: string) {
  return message.toLowerCase().includes('not configured for authentication');
}

function isWechatConfigErrorMessage(message: string) {
  const normalized = message.toLowerCase();

  return normalized.includes('wechat') && normalized.includes('not configured');
}

function getReadableLoginError(error: unknown, isMockLogin: boolean) {
  if (error instanceof RequestError) {
    if (error.code === 'NETWORK_ERROR') {
      return '网络请求失败，请确认后端服务已启动且开发者工具可访问本地接口';
    }

    if (error.message === 'Mock login is disabled') {
      return '当前环境未开启模拟登录';
    }

    if (isWechatConfigErrorMessage(error.message)) {
      return '当前未配置正式微信登录，请使用开发环境模拟登录';
    }

    if (isAuthConfigErrorMessage(error.message)) {
      return '本地认证配置不完整，请检查后端环境变量';
    }

    if (isDatabaseErrorMessage(error.message)) {
      return '数据库暂时不可用，请稍后重试';
    }

    if (error.statusCode === 401 || error.code === 'UNAUTHORIZED') {
      return '当前登录状态不可用，请稍后重试';
    }

    return isMockLogin ? '模拟登录失败，请稍后重试' : '登录失败，请稍后重试';
  }

  if (error instanceof Error) {
    return error.message || '登录失败，请稍后重试';
  }

  return isMockLogin ? '模拟登录失败，请稍后重试' : '登录失败，请稍后重试';
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

          reject(new Error('未获取到微信登录凭证，请稍后重试'));
        },
        fail: () => {
          reject(new Error('获取微信登录凭证失败，请检查开发者工具登录环境'));
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
    mockOpenId: 'test-openid-dev-user-001',
    redirectPath: '',
    showMockLogin: false,
  },

  onLoad(query) {
    const redirectPath =
      typeof query.redirect === 'string' && query.redirect.trim().length > 0
        ? decodeQueryValue(query.redirect)
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
        title: data.isNewUser ? '登录成功，欢迎使用' : '登录成功',
        icon: 'none',
      });
      finishLoginNavigation(this.data.redirectPath);
    } catch (error) {
      this.setData({
        errorMessage: getReadableLoginError(error, false),
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
        errorMessage: '请输入开发环境模拟用户标识',
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
        title: '模拟登录成功',
        icon: 'none',
      });
      finishLoginNavigation(this.data.redirectPath);
    } catch (error) {
      this.setData({
        errorMessage: getReadableLoginError(error, true),
      });
    } finally {
      this.setData({
        isMockSubmitting: false,
      });
    }
  },
});
