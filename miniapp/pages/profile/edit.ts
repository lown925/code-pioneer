import { registerThemedPage } from '../../utils/theme-page';
import {
  finishLoginNavigation,
  getAuthStateSummary,
  redirectToLogin,
  updateStoredUserProfile,
} from '../../utils/auth';
import { RequestError } from '../../utils/request';
import {
  updateCurrentUser,
  uploadCurrentUserAvatar,
} from '../../utils/user';

type ProfileEditPageData = {
  nickname: string;
  previewAvatarUrl: string;
  hasAvatarPreview: boolean;
  selectedAvatarPath: string;
  uploadedAvatarUrl: string;
  isSaving: boolean;
  errorMessage: string;
  onboarding: boolean;
  redirectPath: string;
};

type ProfileEditPageMethods = {
  handleChooseAvatar(
    event: WechatMiniprogram.CustomEvent<{ avatarUrl?: string }>,
  ): void;
  handleAvatarLoadError(): void;
  handleNicknameInput(
    event: WechatMiniprogram.CustomEvent<{ value?: string }>,
  ): void;
  handleSave(): Promise<void>;
  handleSkip(): void;
  leaveAfterSave(): void;
};

let isPageActive = false;

function decodeQueryValue(value: string) {
  try {
    return decodeURIComponent(value).trim();
  } catch {
    return value.trim();
  }
}

function getProfileErrorMessage(error: unknown) {
  if (error instanceof RequestError) {
    if (error.code === 'NETWORK_ERROR') {
      return '网络连接失败，资料尚未保存，请重试';
    }

    if (error.code === 'API_CONFIG_INVALID') {
      return '当前环境接口配置有误，暂时无法保存资料';
    }

    if (error.code === 'USER_AVATAR_TYPE_INVALID') {
      return '请选择 JPG、PNG 或 WebP 格式的头像';
    }

    if (error.code === 'USER_AVATAR_TOO_LARGE') {
      return '头像不能超过 2 MB，请重新选择';
    }

    if (error.code === 'USER_AVATAR_FILE_REQUIRED') {
      return '未读取到头像文件，请重新选择';
    }

    if (error.statusCode === 401 || error.code === 'UNAUTHORIZED') {
      return '登录状态已失效，请重新登录后保存';
    }

    if (error.code === 'USER_DISABLED' || error.code === 'USER_DELETED') {
      return '当前账号状态不可用，无法修改资料';
    }
  }

  return '资料保存失败，请稍后重试';
}

registerThemedPage<ProfileEditPageData, ProfileEditPageMethods>({
  data: {
    nickname: '',
    previewAvatarUrl: '',
    hasAvatarPreview: false,
    selectedAvatarPath: '',
    uploadedAvatarUrl: '',
    isSaving: false,
    errorMessage: '',
    onboarding: false,
    redirectPath: '',
  },

  onLoad(query) {
    isPageActive = true;
    const authState = getAuthStateSummary();
    const onboarding = query.onboarding === '1';
    const redirectPath =
      typeof query.redirect === 'string' && query.redirect.trim()
        ? decodeQueryValue(query.redirect)
        : '';

    if (!authState.isAuthenticated || !authState.user) {
      redirectToLogin('/pages/profile/index');
      return;
    }

    const avatarUrl = authState.user.avatarUrl?.trim() || '';

    this.setData({
      nickname: authState.user.nickname?.trim() || '',
      previewAvatarUrl: avatarUrl,
      hasAvatarPreview: Boolean(avatarUrl),
      onboarding,
      redirectPath,
    });

    wx.setNavigationBarTitle({
      title: onboarding ? '完善个人资料' : '编辑个人资料',
    });
  },

  onUnload() {
    isPageActive = false;
  },

  handleChooseAvatar(
    event: WechatMiniprogram.CustomEvent<{ avatarUrl?: string }>,
  ) {
    if (this.data.isSaving) {
      return;
    }

    const avatarPath = event.detail.avatarUrl?.trim() || '';

    if (!avatarPath) {
      this.setData({
        errorMessage: '未读取到头像，请重新选择',
      });
      return;
    }

    this.setData({
      previewAvatarUrl: avatarPath,
      hasAvatarPreview: true,
      selectedAvatarPath: avatarPath,
      uploadedAvatarUrl: '',
      errorMessage: '',
    });
  },

  handleAvatarLoadError() {
    const selectedAvatarFailed = Boolean(this.data.selectedAvatarPath);

    this.setData({
      hasAvatarPreview: false,
      selectedAvatarPath: selectedAvatarFailed
        ? ''
        : this.data.selectedAvatarPath,
      uploadedAvatarUrl: selectedAvatarFailed
        ? ''
        : this.data.uploadedAvatarUrl,
      errorMessage: selectedAvatarFailed
        ? '头像预览失败，请重新选择'
        : '原头像加载失败，可重新选择头像',
    });
  },

  handleNicknameInput(
    event: WechatMiniprogram.CustomEvent<{ value?: string }>,
  ) {
    this.setData({
      nickname: event.detail.value ?? '',
      errorMessage: '',
    });
  },

  async handleSave() {
    if (this.data.isSaving) {
      return;
    }

    const nickname = this.data.nickname.trim();
    const authUser = getAuthStateSummary().user;

    if (!nickname || nickname.length > 30) {
      this.setData({
        errorMessage: '请输入 1 至 30 个字符的昵称',
      });
      return;
    }

    if (
      !this.data.selectedAvatarPath &&
      !this.data.uploadedAvatarUrl &&
      !authUser?.avatarUrl?.trim()
    ) {
      this.setData({
        errorMessage: '请选择一个头像后再保存',
      });
      return;
    }

    this.setData({
      isSaving: true,
      errorMessage: '',
    });

    try {
      let avatarUrl =
        this.data.uploadedAvatarUrl || authUser?.avatarUrl?.trim() || '';

      if (this.data.selectedAvatarPath && !this.data.uploadedAvatarUrl) {
        const uploadResult = await uploadCurrentUserAvatar(
          this.data.selectedAvatarPath,
        );

        if (!isPageActive) {
          return;
        }

        avatarUrl = uploadResult.avatarUrl;
        this.setData({
          uploadedAvatarUrl: avatarUrl,
        });
      }

      const updatedUser = await updateCurrentUser({
        nickname,
        avatarUrl,
      });

      if (!isPageActive) {
        return;
      }

      updateStoredUserProfile(updatedUser);
      this.setData({
        nickname: updatedUser.nickname?.trim() || nickname,
        previewAvatarUrl: updatedUser.avatarUrl?.trim() || avatarUrl,
        hasAvatarPreview: Boolean(updatedUser.avatarUrl?.trim() || avatarUrl),
        selectedAvatarPath: '',
        uploadedAvatarUrl: updatedUser.avatarUrl?.trim() || avatarUrl,
      });
      wx.showToast({
        title: '个人资料已保存',
        icon: 'success',
      });
      this.leaveAfterSave();
    } catch (error) {
      if (isPageActive) {
        this.setData({
          errorMessage: getProfileErrorMessage(error),
        });
      }
    } finally {
      if (isPageActive) {
        this.setData({
          isSaving: false,
        });
      }
    }
  },

  handleSkip() {
    if (!this.data.onboarding || this.data.isSaving) {
      return;
    }

    finishLoginNavigation(this.data.redirectPath);
  },

  leaveAfterSave() {
    if (this.data.onboarding) {
      finishLoginNavigation(this.data.redirectPath);
      return;
    }

    if (getCurrentPages().length > 1) {
      wx.navigateBack();
      return;
    }

    wx.switchTab({
      url: '/pages/profile/index',
    });
  },
});
