import { registerThemedPage } from '../../utils/theme-page';
import type { PublicUserProfileResponse } from '../../types/user';
import { isUuid } from '../../utils/validation';
import { fetchUserProfile, getUserErrorMessage } from '../../utils/user';

type PageState = 'loading' | 'success' | 'error';

type UserProfilePageData = {
  state: PageState;
  userId: string;
  errorMessage: string;
  profile: PublicUserProfileResponse | null;
  displayName: string;
  profileInitial: string;
};

type UserProfilePageMethods = {
  loadProfile(): Promise<void>;
  handleRetry(): void;
};

let isPageActive = false;
let requestSerial = 0;

function getDisplayName(profile: PublicUserProfileResponse | null) {
  return profile?.nickname?.trim() || '微信用户';
}

function getProfileInitial(profile: PublicUserProfileResponse | null) {
  return getDisplayName(profile).slice(0, 1) || '人';
}

registerThemedPage<UserProfilePageData, UserProfilePageMethods>({
  data: {
    state: 'loading',
    userId: '',
    errorMessage: '',
    profile: null,
    displayName: '微信用户',
    profileInitial: '人',
  },

  onLoad(query) {
    isPageActive = true;

    const userId =
      typeof query.userId === 'string' ? decodeURIComponent(query.userId) : '';

    if (!isUuid(userId)) {
      this.setData({
        state: 'error',
        userId: '',
        errorMessage: '用户参数无效，请返回后重试',
      });
      return;
    }

    this.setData({
      userId,
    });

    void this.loadProfile();
  },

  onShow() {
    isPageActive = true;
  },

  onUnload() {
    isPageActive = false;
    requestSerial += 1;
  },

  onPullDownRefresh() {
    void this.loadProfile().finally(() => {
      wx.stopPullDownRefresh();
    });
  },

  async loadProfile() {
    if (!this.data.userId) {
      return;
    }

    const currentSerial = ++requestSerial;

    this.setData({
      state: 'loading',
      errorMessage: '',
    });

    try {
      const profile = await fetchUserProfile(this.data.userId);

      if (!isPageActive || currentSerial !== requestSerial) {
        return;
      }

      this.setData({
        state: 'success',
        errorMessage: '',
        profile,
        displayName: getDisplayName(profile),
        profileInitial: getProfileInitial(profile),
      });
    } catch (error) {
      if (!isPageActive || currentSerial !== requestSerial) {
        return;
      }

      this.setData({
        state: 'error',
        errorMessage: getUserErrorMessage(error, '用户主页加载失败，请稍后重试'),
      });
    }
  },

  handleRetry() {
    void this.loadProfile();
  },
});
