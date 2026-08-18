import { registerThemedPage } from '../../utils/theme-page';
import type { CurrentUserProfile } from '../../types/user';
import { getAuthStateSummary, redirectToLogin } from '../../utils/auth';
import {
  CAREER_DIRECTION_OPTIONS,
  GRADE_OPTIONS,
  LEARNING_DIRECTION_OPTIONS,
  MAJOR_OPTIONS,
  TECHNICAL_INTEREST_OPTIONS,
  buildCustomGrowthValue,
  dedupeGrowthValues,
  getGrowthValueLabel,
  resolveSingleGrowthValue,
  type GrowthProfileOption,
} from '../../utils/growth-profile';
import {
  fetchCurrentUserProfile,
  getUserErrorMessage,
  updateCurrentUser,
} from '../../utils/user';

type ProfileEditState = 'loading' | 'ready' | 'error';
type SingleProfileField =
  'major' | 'grade' | 'learningDirection' | 'careerDirection';

type SelectableGrowthOption = GrowthProfileOption & {
  selected: boolean;
};

type AdditionalInterestTag = {
  value: string;
  label: string;
};

type GrowthProfilePageData = {
  state: ProfileEditState;
  loadErrorMessage: string;
  submitErrorMessage: string;
  isSaving: boolean;
  majorOptions: GrowthProfileOption[];
  gradeOptions: GrowthProfileOption[];
  learningDirectionOptions: GrowthProfileOption[];
  technicalInterestOptions: SelectableGrowthOption[];
  careerDirectionOptions: GrowthProfileOption[];
  majorSelectedCode: string;
  majorCustomValue: string;
  gradeSelectedCode: string;
  gradeCustomValue: string;
  learningDirectionSelectedCode: string;
  learningDirectionCustomValue: string;
  careerDirectionSelectedCode: string;
  careerDirectionCustomValue: string;
  selectedTechnicalInterestCodes: string[];
  additionalInterestTags: AdditionalInterestTag[];
  technicalInterestCustomInput: string;
};

type GrowthProfilePageMethods = {
  loadProfile(): Promise<void>;
  applyProfile(profile: CurrentUserProfile): void;
  handleRetry(): void;
  handleSingleOptionTap(
    event: WechatMiniprogram.BaseEvent<{
      field?: SingleProfileField;
      code?: string;
    }>,
  ): void;
  handleSingleClear(
    event: WechatMiniprogram.BaseEvent<{ field?: SingleProfileField }>,
  ): void;
  handleMajorCustomInput(
    event: WechatMiniprogram.CustomEvent<{ value?: string }>,
  ): void;
  handleGradeCustomInput(
    event: WechatMiniprogram.CustomEvent<{ value?: string }>,
  ): void;
  handleLearningDirectionCustomInput(
    event: WechatMiniprogram.CustomEvent<{ value?: string }>,
  ): void;
  handleCareerDirectionCustomInput(
    event: WechatMiniprogram.CustomEvent<{ value?: string }>,
  ): void;
  handleTechnicalInterestTap(
    event: WechatMiniprogram.BaseEvent<{ code?: string }>,
  ): void;
  handleTechnicalInterestCustomInput(
    event: WechatMiniprogram.CustomEvent<{ value?: string }>,
  ): void;
  handleAddCustomInterest(): void;
  handleRemoveAdditionalInterest(
    event: WechatMiniprogram.BaseEvent<{ value?: string }>,
  ): void;
  handleClearTechnicalInterests(): void;
  handleSave(): Promise<void>;
};

const TECHNICAL_INTEREST_MAX_COUNT = 12;
let isPageActive = false;
let requestSerial = 0;

function mapTechnicalInterestOptions(selectedCodes: string[]) {
  const selected = new Set(selectedCodes);

  return TECHNICAL_INTEREST_OPTIONS.map((option) => ({
    ...option,
    selected: selected.has(option.code),
  }));
}

function resolveStoredSingleValue(selectedCode: string, customValue: string) {
  return selectedCode || buildCustomGrowthValue(customValue) || null;
}

registerThemedPage<GrowthProfilePageData, GrowthProfilePageMethods>({
  data: {
    state: 'loading',
    loadErrorMessage: '',
    submitErrorMessage: '',
    isSaving: false,
    majorOptions: MAJOR_OPTIONS,
    gradeOptions: GRADE_OPTIONS,
    learningDirectionOptions: LEARNING_DIRECTION_OPTIONS,
    technicalInterestOptions: mapTechnicalInterestOptions([]),
    careerDirectionOptions: CAREER_DIRECTION_OPTIONS,
    majorSelectedCode: '',
    majorCustomValue: '',
    gradeSelectedCode: '',
    gradeCustomValue: '',
    learningDirectionSelectedCode: '',
    learningDirectionCustomValue: '',
    careerDirectionSelectedCode: '',
    careerDirectionCustomValue: '',
    selectedTechnicalInterestCodes: [],
    additionalInterestTags: [],
    technicalInterestCustomInput: '',
  },

  onLoad() {
    isPageActive = true;

    if (!getAuthStateSummary().isAuthenticated) {
      redirectToLogin('/pages/growth/profile');
      return;
    }

    void this.loadProfile();
  },

  onUnload() {
    isPageActive = false;
    requestSerial += 1;
  },

  async loadProfile() {
    const currentSerial = ++requestSerial;
    this.setData({
      state: 'loading',
      loadErrorMessage: '',
      submitErrorMessage: '',
    });

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
        loadErrorMessage: getUserErrorMessage(
          error,
          '学习画像加载失败，请稍后重试',
        ),
      });
    }
  },

  applyProfile(profile: CurrentUserProfile) {
    const major = resolveSingleGrowthValue(profile.major, MAJOR_OPTIONS);
    const grade = resolveSingleGrowthValue(profile.grade, GRADE_OPTIONS);
    const learningDirection = resolveSingleGrowthValue(
      profile.learningDirection,
      LEARNING_DIRECTION_OPTIONS,
    );
    const careerDirection = resolveSingleGrowthValue(
      profile.careerDirection,
      CAREER_DIRECTION_OPTIONS,
    );
    const presetInterestCodes = new Set(
      TECHNICAL_INTEREST_OPTIONS.map((option) => option.code),
    );
    const selectedTechnicalInterestCodes = profile.technicalInterests.filter(
      (value: string) => presetInterestCodes.has(value),
    );
    const additionalInterestTags = profile.technicalInterests
      .filter((value: string) => !presetInterestCodes.has(value))
      .map((value: string) => ({
        value,
        label: getGrowthValueLabel(value, TECHNICAL_INTEREST_OPTIONS),
      }));

    this.setData({
      state: 'ready',
      loadErrorMessage: '',
      submitErrorMessage: '',
      majorSelectedCode: major.selectedCode,
      majorCustomValue: major.customValue,
      gradeSelectedCode: grade.selectedCode,
      gradeCustomValue: grade.customValue,
      learningDirectionSelectedCode: learningDirection.selectedCode,
      learningDirectionCustomValue: learningDirection.customValue,
      careerDirectionSelectedCode: careerDirection.selectedCode,
      careerDirectionCustomValue: careerDirection.customValue,
      selectedTechnicalInterestCodes,
      technicalInterestOptions: mapTechnicalInterestOptions(
        selectedTechnicalInterestCodes,
      ),
      additionalInterestTags,
      technicalInterestCustomInput: '',
    });
  },

  handleRetry() {
    void this.loadProfile();
  },

  handleSingleOptionTap(
    event: WechatMiniprogram.BaseEvent<{
      field?: SingleProfileField;
      code?: string;
    }>,
  ) {
    if (this.data.isSaving) {
      return;
    }

    const { field, code } = event.currentTarget.dataset;

    if (!field || !code) {
      return;
    }

    if (field === 'major') {
      this.setData({
        majorSelectedCode: code,
        majorCustomValue: '',
        submitErrorMessage: '',
      });
      return;
    }

    if (field === 'grade') {
      this.setData({
        gradeSelectedCode: code,
        gradeCustomValue: '',
        submitErrorMessage: '',
      });
      return;
    }

    if (field === 'learningDirection') {
      this.setData({
        learningDirectionSelectedCode: code,
        learningDirectionCustomValue: '',
        submitErrorMessage: '',
      });
      return;
    }

    this.setData({
      careerDirectionSelectedCode: code,
      careerDirectionCustomValue: '',
      submitErrorMessage: '',
    });
  },

  handleSingleClear(
    event: WechatMiniprogram.BaseEvent<{ field?: SingleProfileField }>,
  ) {
    if (this.data.isSaving) {
      return;
    }

    const field = event.currentTarget.dataset.field;

    if (field === 'major') {
      this.setData({ majorSelectedCode: '', majorCustomValue: '' });
      return;
    }

    if (field === 'grade') {
      this.setData({ gradeSelectedCode: '', gradeCustomValue: '' });
      return;
    }

    if (field === 'learningDirection') {
      this.setData({
        learningDirectionSelectedCode: '',
        learningDirectionCustomValue: '',
      });
      return;
    }

    if (field === 'careerDirection') {
      this.setData({
        careerDirectionSelectedCode: '',
        careerDirectionCustomValue: '',
      });
    }
  },

  handleMajorCustomInput(
    event: WechatMiniprogram.CustomEvent<{ value?: string }>,
  ) {
    this.setData({
      majorSelectedCode: '',
      majorCustomValue: event.detail.value ?? '',
      submitErrorMessage: '',
    });
  },

  handleGradeCustomInput(
    event: WechatMiniprogram.CustomEvent<{ value?: string }>,
  ) {
    this.setData({
      gradeSelectedCode: '',
      gradeCustomValue: event.detail.value ?? '',
      submitErrorMessage: '',
    });
  },

  handleLearningDirectionCustomInput(
    event: WechatMiniprogram.CustomEvent<{ value?: string }>,
  ) {
    this.setData({
      learningDirectionSelectedCode: '',
      learningDirectionCustomValue: event.detail.value ?? '',
      submitErrorMessage: '',
    });
  },

  handleCareerDirectionCustomInput(
    event: WechatMiniprogram.CustomEvent<{ value?: string }>,
  ) {
    this.setData({
      careerDirectionSelectedCode: '',
      careerDirectionCustomValue: event.detail.value ?? '',
      submitErrorMessage: '',
    });
  },

  handleTechnicalInterestTap(
    event: WechatMiniprogram.BaseEvent<{ code?: string }>,
  ) {
    if (this.data.isSaving) {
      return;
    }

    const code = event.currentTarget.dataset.code;

    if (!code) {
      return;
    }

    const selected = this.data.selectedTechnicalInterestCodes;
    const alreadySelected = selected.includes(code);

    if (
      !alreadySelected &&
      selected.length + this.data.additionalInterestTags.length >=
        TECHNICAL_INTEREST_MAX_COUNT
    ) {
      this.setData({
        submitErrorMessage: `技术兴趣最多选择 ${TECHNICAL_INTEREST_MAX_COUNT} 项`,
      });
      return;
    }

    const nextSelected = alreadySelected
      ? selected.filter((value) => value !== code)
      : [...selected, code];

    this.setData({
      selectedTechnicalInterestCodes: nextSelected,
      technicalInterestOptions: mapTechnicalInterestOptions(nextSelected),
      submitErrorMessage: '',
    });
  },

  handleTechnicalInterestCustomInput(
    event: WechatMiniprogram.CustomEvent<{ value?: string }>,
  ) {
    this.setData({
      technicalInterestCustomInput: event.detail.value ?? '',
      submitErrorMessage: '',
    });
  },

  handleAddCustomInterest() {
    if (this.data.isSaving) {
      return;
    }

    const value = buildCustomGrowthValue(
      this.data.technicalInterestCustomInput,
    );

    if (!value) {
      this.setData({ submitErrorMessage: '请输入自定义技术兴趣' });
      return;
    }

    const currentValues = [
      ...this.data.selectedTechnicalInterestCodes,
      ...this.data.additionalInterestTags.map((item) => item.value),
    ];

    if (currentValues.includes(value)) {
      this.setData({ submitErrorMessage: '该技术兴趣已经添加' });
      return;
    }

    if (currentValues.length >= TECHNICAL_INTEREST_MAX_COUNT) {
      this.setData({
        submitErrorMessage: `技术兴趣最多选择 ${TECHNICAL_INTEREST_MAX_COUNT} 项`,
      });
      return;
    }

    this.setData({
      additionalInterestTags: [
        ...this.data.additionalInterestTags,
        {
          value,
          label: getGrowthValueLabel(value, TECHNICAL_INTEREST_OPTIONS),
        },
      ],
      technicalInterestCustomInput: '',
      submitErrorMessage: '',
    });
  },

  handleRemoveAdditionalInterest(
    event: WechatMiniprogram.BaseEvent<{ value?: string }>,
  ) {
    if (this.data.isSaving) {
      return;
    }

    const value = event.currentTarget.dataset.value;

    if (!value) {
      return;
    }

    this.setData({
      additionalInterestTags: this.data.additionalInterestTags.filter(
        (item) => item.value !== value,
      ),
      submitErrorMessage: '',
    });
  },

  handleClearTechnicalInterests() {
    if (this.data.isSaving) {
      return;
    }

    this.setData({
      selectedTechnicalInterestCodes: [],
      technicalInterestOptions: mapTechnicalInterestOptions([]),
      additionalInterestTags: [],
      technicalInterestCustomInput: '',
      submitErrorMessage: '',
    });
  },

  async handleSave() {
    if (this.data.isSaving || this.data.state !== 'ready') {
      return;
    }

    const technicalInterests = dedupeGrowthValues([
      ...this.data.selectedTechnicalInterestCodes,
      ...this.data.additionalInterestTags.map((item) => item.value),
    ]);

    this.setData({ isSaving: true, submitErrorMessage: '' });

    try {
      await updateCurrentUser({
        major: resolveStoredSingleValue(
          this.data.majorSelectedCode,
          this.data.majorCustomValue,
        ),
        grade: resolveStoredSingleValue(
          this.data.gradeSelectedCode,
          this.data.gradeCustomValue,
        ),
        learningDirection: resolveStoredSingleValue(
          this.data.learningDirectionSelectedCode,
          this.data.learningDirectionCustomValue,
        ),
        technicalInterests,
        careerDirection: resolveStoredSingleValue(
          this.data.careerDirectionSelectedCode,
          this.data.careerDirectionCustomValue,
        ),
      });

      if (!isPageActive) {
        return;
      }

      wx.showToast({
        title: '学习画像已保存',
        icon: 'success',
      });

      if (getCurrentPages().length > 1) {
        wx.navigateBack();
      } else {
        wx.switchTab({ url: '/pages/growth/index' });
      }
    } catch (error) {
      if (isPageActive) {
        this.setData({
          submitErrorMessage: getUserErrorMessage(
            error,
            '学习画像保存失败，请检查填写内容后重试',
          ),
        });
      }
    } finally {
      if (isPageActive) {
        this.setData({ isSaving: false });
      }
    }
  },
});
