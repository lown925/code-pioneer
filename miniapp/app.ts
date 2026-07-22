import { initializeAuthState } from './utils/auth';
import { API_BASE_URL } from './utils/config';

App<IAppOption>({
  onLaunch() {
    const authState = initializeAuthState();

    this.globalData.authState = authState;
    this.globalData.envVersion = authState.envVersion;
  },

  globalData: {
    apiBaseUrl: API_BASE_URL,
    authState: {
      isReady: false,
      isAuthenticated: false,
      user: null,
      envVersion: 'unknown',
    },
    envVersion: 'unknown',
  },
});
