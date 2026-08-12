import type { LoginResponseData } from "../../types/auth";
import {
  finishLoginNavigation,
  getAuthStateSummary,
  isDevelopmentEnvironment,
  saveLoginSession,
} from "../../utils/auth";
import { RequestError, request } from "../../utils/request";

type LoginPageData = {
  isWechatSubmitting: boolean;
  devSubmittingAccount: DevLoginAccount | "";
  showDevLogin: boolean;
  errorMessage: string;
  redirectPath: string;
};

type DevLoginAccount = "player-a" | "player-b";

function decodeQueryValue(value: string) {
  try {
    return decodeURIComponent(value).trim();
  } catch {
    return value.trim();
  }
}

function getReadableLoginError(error: unknown) {
  if (error instanceof RequestError) {
    const messages: Record<string, string> = {
      API_CONFIG_INVALID: "当前小程序环境的 API 地址未正确配置。",
      NETWORK_UNREACHABLE: "无法连接服务器，请检查网络后重试。",
      NETWORK_DNS_ERROR: "无法解析服务器域名，请稍后重试。",
      NETWORK_TIMEOUT: "连接服务器超时，请稍后重试。",
      NETWORK_CONNECTION_RESET: "服务器连接被中断，请稍后重试。",
      WECHAT_DOMAIN_NOT_ALLOWED:
        "当前 API 域名未加入微信小程序 request 合法域名。",
      WECHAT_LOGIN_CONFIGURATION_INVALID:
        "服务端微信登录配置不完整，请联系管理员检查 AppID 与 AppSecret。",
      WECHAT_LOGIN_CODE_INVALID: "微信临时登录凭证无效，请重新点击登录。",
      WECHAT_LOGIN_UPSTREAM_FAILED: "微信登录服务暂时不可用，请稍后重试。",
      ENVIRONMENT_MISMATCH:
        "小程序版本与当前后端环境不匹配，请检查部署环境配置。",
    };

    if (messages[error.code]) {
      return messages[error.code];
    }

    if (error.statusCode === 401 || error.code === "UNAUTHORIZED") {
      return "当前登录状态不可用，请重新登录。";
    }

    if (error.statusCode >= 500) {
      return "服务端内部错误，请稍后重试。";
    }

    return "登录失败，请稍后重试";
  }

  if (error instanceof Error) {
    return error.message || "登录失败，请稍后重试";
  }

  return "登录失败，请稍后重试";
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

          reject(new Error("未获取到微信登录凭证，请稍后重试"));
        },
        fail: () => {
          reject(new Error("获取微信登录凭证失败，请检查开发者工具登录环境"));
        },
      });
    },
  );
}

function needsProfileCompletion(data: LoginResponseData) {
  return Boolean(
    data.isNewUser ||
    !data.user.nickname?.trim() ||
    !data.user.avatarUrl?.trim(),
  );
}

function openProfileOnboarding(redirectPath: string) {
  const redirectQuery = redirectPath
    ? `&redirect=${encodeURIComponent(redirectPath)}`
    : "";

  wx.redirectTo({
    url: `/pages/profile/edit?onboarding=1${redirectQuery}`,
    fail: () => {
      finishLoginNavigation(redirectPath);
    },
  });
}

function devLogin(account: DevLoginAccount) {
  return request<LoginResponseData>({
    url: "/auth/dev-login",
    method: "POST",
    data: { account },
    authMode: "none",
    retryOnAuthFailure: false,
    disableAuthRedirect: true,
  });
}

Page<LoginPageData>({
  data: {
    isWechatSubmitting: false,
    devSubmittingAccount: "",
    showDevLogin: isDevelopmentEnvironment(),
    errorMessage: "",
    redirectPath: "",
  },

  onLoad(query) {
    const redirectPath =
      typeof query.redirect === "string" && query.redirect.trim().length > 0
        ? decodeQueryValue(query.redirect)
        : "";

    this.setData({
      redirectPath,
    });
  },

  onShow() {
    const authState = getAuthStateSummary();

    if (
      authState.isAuthenticated &&
      authState.user &&
      (!authState.user.nickname?.trim() || !authState.user.avatarUrl?.trim())
    ) {
      openProfileOnboarding(this.data.redirectPath);
      return;
    }

    if (authState.isAuthenticated) {
      finishLoginNavigation(this.data.redirectPath);
    }
  },

  async handleWechatLogin() {
    if (this.data.isWechatSubmitting || this.data.devSubmittingAccount) {
      return;
    }

    this.setData({
      isWechatSubmitting: true,
      errorMessage: "",
    });

    try {
      const loginResult = await wxLogin();
      const data = await request<LoginResponseData>({
        url: "/auth/wechat-login",
        method: "POST",
        data: {
          code: loginResult.code,
        },
        authMode: "none",
        retryOnAuthFailure: false,
        disableAuthRedirect: true,
      });

      saveLoginSession(data);
      wx.showToast({
        title: data.isNewUser ? "登录成功，欢迎使用" : "登录成功",
        icon: "none",
      });
      if (needsProfileCompletion(data)) {
        openProfileOnboarding(this.data.redirectPath);
      } else {
        finishLoginNavigation(this.data.redirectPath);
      }
    } catch (error) {
      this.setData({
        errorMessage: getReadableLoginError(error),
      });
    } finally {
      this.setData({
        isWechatSubmitting: false,
      });
    }
  },

  handleDevPlayerALogin() {
    return this.handleDevLogin("player-a");
  },

  handleDevPlayerBLogin() {
    return this.handleDevLogin("player-b");
  },

  async handleDevLogin(account: DevLoginAccount) {
    if (
      !this.data.showDevLogin ||
      this.data.isWechatSubmitting ||
      this.data.devSubmittingAccount
    ) {
      return;
    }

    this.setData({
      devSubmittingAccount: account,
      errorMessage: "",
    });

    try {
      const data = await devLogin(account);

      saveLoginSession(data);
      wx.showToast({
        title: `${data.user.nickname ?? "测试玩家"}登录成功`,
        icon: "none",
      });
      finishLoginNavigation(this.data.redirectPath);
    } catch (error) {
      this.setData({
        errorMessage: getReadableLoginError(error),
      });
    } finally {
      this.setData({
        devSubmittingAccount: "",
      });
    }
  },
});
