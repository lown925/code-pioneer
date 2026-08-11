import type { PublicUserProfileResponse } from '../../types/user';
import { getAuthStateSummary, redirectToLogin } from '../../utils/auth';
import { isUuid } from '../../utils/validation';
import {
  fetchUserProfile,
  followUser,
  getUserErrorMessage,
  unfollowUser,
} from '../../utils/user';

type PageState = 'loading' | 'success' | 'error';

type UserProfilePageData = {
  state: PageState;
  userId: string;
  errorMessage: string;
  profile: PublicUserProfileResponse | null;
  displayName: string;
  profileInitial: string;
  isFollowSubmitting: boolean;
};

type UserProfilePageMethods = {
  loadProfile(): Promise<void>;
  handleRetry(): void;
  handleFollowToggle(): void;
  confirmUnfollow(): Promise<void>;
  handleOpenFollowing(): void;
  handleOpenFollowers(): void;
};

let isPageActive = false;
let requestSerial = 0;

function getDisplayName(profile: PublicUserProfileResponse | null) {
  return profile?.nickname?.trim() || '微信用户';
}

function getProfileInitial(profile: PublicUserProfileResponse | null) {
  return getDisplayName(profile).slice(0, 1) || '人';
}

Page<UserProfilePageData, UserProfilePageMethods>({
  data: {
    state: 'loading',
    userId: '',
    errorMessage: '',
    profile: null,
    displayName: '微信用户',
    profileInitial: '人',
    isFollowSubmitting: false,
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

  handleFollowToggle() {
    const profile = this.data.profile;

    if (!profile || profile.viewerIsSelf || this.data.isFollowSubmitting) {
      return;
    }

    if (!getAuthStateSummary().isAuthenticated) {
      redirectToLogin(
        `/pages/profile/user-profile?userId=${encodeURIComponent(profile.userId)}`,
      );
      return;
    }

    if (profile.viewerHasFollowed) {
      wx.showModal({
        title: '取消关注',
        content: `确定不再关注“${this.data.displayName}”吗？`,
        confirmText: '取消关注',
        cancelText: '再想想',
        success: (result) => {
          if (result.confirm) {
            void this.confirmUnfollow();
          }
        },
      });
      return;
    }

    this.setData({
      isFollowSubmitting: true,
    });

    void followUser(profile.userId)
      .then(() => {
        if (!isPageActive) {
          return;
        }

        this.setData({
          isFollowSubmitting: false,
          profile: this.data.profile
            ? {
                ...this.data.profile,
                viewerHasFollowed: true,
                followerCount: this.data.profile.followerCount + 1,
              }
            : null,
        });
        wx.showToast({
          title: '已关注',
          icon: 'none',
        });
      })
      .catch((error) => {
        if (!isPageActive) {
          return;
        }

        this.setData({
          isFollowSubmitting: false,
        });
        wx.showToast({
          title: getUserErrorMessage(error, '关注失败，请稍后重试'),
          icon: 'none',
        });
      });
  },

  async confirmUnfollow() {
    const profile = this.data.profile;

    if (!profile || this.data.isFollowSubmitting) {
      return;
    }

    this.setData({
      isFollowSubmitting: true,
    });

    try {
      await unfollowUser(profile.userId);

      if (!isPageActive) {
        return;
      }

      this.setData({
        isFollowSubmitting: false,
        profile: this.data.profile
          ? {
              ...this.data.profile,
              viewerHasFollowed: false,
              followerCount: Math.max(0, this.data.profile.followerCount - 1),
            }
          : null,
      });
      wx.showToast({
        title: '已取消关注',
        icon: 'none',
      });
    } catch (error) {
      if (!isPageActive) {
        return;
      }

      this.setData({
        isFollowSubmitting: false,
      });
      wx.showToast({
        title: getUserErrorMessage(error, '取消关注失败，请稍后重试'),
        icon: 'none',
      });
    }
  },

  handleOpenFollowing() {
    const profile = this.data.profile;

    if (!profile) {
      return;
    }

    wx.navigateTo({
      url: `/pages/profile/follow-list?userId=${encodeURIComponent(profile.userId)}&mode=following`,
    });
  },

  handleOpenFollowers() {
    const profile = this.data.profile;

    if (!profile) {
      return;
    }

    wx.navigateTo({
      url: `/pages/profile/follow-list?userId=${encodeURIComponent(profile.userId)}&mode=followers`,
    });
  },
});
