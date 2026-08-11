import type { CurrentUserProfile } from '../../types/user';
import { getAuthStateSummary, redirectToLogin } from '../../utils/auth';
import {
  CAREER_DIRECTION_OPTIONS,
  GRADE_OPTIONS,
  LEARNING_DIRECTION_OPTIONS,
  MAJOR_OPTIONS,
  TECHNICAL_INTEREST_OPTIONS,
  getGrowthValueLabel,
} from '../../utils/growth-profile';
import { fetchCurrentUserProfile, getUserErrorMessage } from '../../utils/user';

type GrowthPageState = 'guest' | 'loading' | 'success' | 'error';

type GrowthPageData = {
  state: GrowthPageState;
  errorMessage: string;
  profile: CurrentUserProfile | null;
  majorText: string;
  gradeText: string;
  learningDirectionText: string;
  technicalInterestTexts: string[];
  careerDirectionText: string;
  isCoreProfileComplete: boolean;
  profileActionText: string;
};

type GrowthPageMethods = {
  loadProfile(): Promise<void>;
  handleLogin(): void;
  handleRetry(): void;
  handleEditProfile(): void;
  applyProfile(profile: CurrentUserProfile): void;
};

let isPageActive = false;
let requestSerial = 0;

Page<GrowthPageData, GrowthPageMethods>({
  data: {
    state: 'loading',
    errorMessage: '',
    profile: null,
    majorText: '未设置',
    gradeText: '未设置',
    learningDirectionText: '未设置',
    technicalInterestTexts: [],
    careerDirectionText: '未设置',
    isCoreProfileComplete: false,
    profileActionText: '完善学习画像',
  },

  onShow() {
    isPageActive = true;
    void this.loadProfile();
  },

  onUnload() {
    isPageActive = false;
    requestSerial += 1;
  },

  onPullDownRefresh() {
    void this.loadProfile().finally(() => wx.stopPullDownRefresh());
  },

  async loadProfile() {
    if (!getAuthStateSummary().isAuthenticated) {
      this.setData({
        state: 'guest',
        errorMessage: '',
        profile: null,
      });
      return;
    }

    const currentSerial = ++requestSerial;
    this.setData({ state: 'loading', errorMessage: '' });

    try {
      const profile = await fetchCurrentUserProfile();

      if (!isPageActive || currentSerial !== requestSerial) {
        return;
      }

      this.applyProfile(profile);
    } catch (error) {
      if (!isPageActive || currentSerial !== requestSerial) {
        return;
      }

      this.setData({
        state: 'error',
        errorMessage: getUserErrorMessage(
          error,
          '成长画像加载失败，请稍后重试',
        ),
        profile: null,
      });
    }
  },

  handleLogin() {
    redirectToLogin('/pages/growth/index');
  },

  handleRetry() {
    void this.loadProfile();
  },

  handleEditProfile() {
    wx.navigateTo({
      url: '/pages/growth/profile',
    });
  },

  applyProfile(profile: CurrentUserProfile) {
    const isCoreProfileComplete = Boolean(
      profile.major && profile.grade && profile.learningDirection,
    );

    this.setData({
      state: 'success',
      errorMessage: '',
      profile,
      majorText: getGrowthValueLabel(profile.major, MAJOR_OPTIONS),
      gradeText: getGrowthValueLabel(profile.grade, GRADE_OPTIONS),
      learningDirectionText: getGrowthValueLabel(
        profile.learningDirection,
        LEARNING_DIRECTION_OPTIONS,
      ),
      technicalInterestTexts: profile.technicalInterests.map((value: string) =>
        getGrowthValueLabel(value, TECHNICAL_INTEREST_OPTIONS),
      ),
      careerDirectionText: getGrowthValueLabel(
        profile.careerDirection,
        CAREER_DIRECTION_OPTIONS,
      ),
      isCoreProfileComplete,
      profileActionText: isCoreProfileComplete
        ? '编辑学习画像'
        : '完善学习画像',
    });
  },
});
