import { initializeAuthState } from './utils/auth';
import {
  API_BASE_URL,
  API_CONFIG_ERROR_MESSAGE,
  CURRENT_ENV_VERSION,
} from './utils/config';

App<IAppOption>({
  onLaunch() {
    const authState = initializeAuthState();

    this.globalData.authState = authState;
    this.globalData.envVersion = CURRENT_ENV_VERSION;
    this.globalData.apiConfigErrorMessage = API_CONFIG_ERROR_MESSAGE;

    if (API_CONFIG_ERROR_MESSAGE) {
      (
        wx as unknown as {
          showModal: (options: {
            title: string;
            content: string;
            showCancel: boolean;
            confirmText: string;
          }) => void;
        }
      ).showModal({
        title: '环境配置错误',
        content: API_CONFIG_ERROR_MESSAGE,
        showCancel: false,
        confirmText: '知道了',
      });
    }
  },

  globalData: {
    apiBaseUrl: API_BASE_URL,
    apiConfigErrorMessage: API_CONFIG_ERROR_MESSAGE,
    authState: {
      isReady: false,
      isAuthenticated: false,
      user: null,
      envVersion: CURRENT_ENV_VERSION,
    },
    envVersion: CURRENT_ENV_VERSION,
  },
});
