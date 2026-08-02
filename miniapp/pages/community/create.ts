import type {
  CommunityCategory,
  CommunityCategoryKey,
  CommunityUploadedImage,
} from '../../types/community';
import { getAuthStateSummary, redirectToLogin } from '../../utils/auth';
import {
  bumpCommunityContentVersion,
  createCommunityPost,
  fetchCommunityCategories,
  getCommunityErrorMessage,
  normalizeCommunityCategoryKey,
  uploadCommunityImage,
} from '../../utils/community';

type CategoryFilter = {
  key: CommunityCategoryKey;
  label: string;
};

type UploadedImageCard = CommunityUploadedImage & {
  localPath: string;
  isUploading: boolean;
};

type CommunityCreatePageData = {
  categories: CategoryFilter[];
  selectedCategoryKey: CommunityCategoryKey | '';
  title: string;
  content: string;
  titleCountText: string;
  contentCountText: string;
  isSubmitting: boolean;
  isLoadingCategories: boolean;
  loadErrorMessage: string;
  images: UploadedImageCard[];
  imageCountText: string;
  isUploadingImages: boolean;
};

type CommunityCreatePageMethods = {
  ensureAuthenticated(): boolean;
  loadCategories(): Promise<void>;
  handleBack(): void;
  handleRetry(): void;
  handleCategoryTap(
    event: WechatMiniprogram.BaseEvent<{ categoryKey?: string }>,
  ): void;
  handleTitleInput(
    event: WechatMiniprogram.CustomEvent<{ value?: string }>,
  ): void;
  handleContentInput(
    event: WechatMiniprogram.CustomEvent<{ value?: string }>,
  ): void;
  handleChooseImages(): Promise<void>;
  handleRemoveImage(
    event: WechatMiniprogram.BaseEvent<{ index?: number }>,
  ): void;
  handlePreviewImage(
    event: WechatMiniprogram.BaseEvent<{ index?: number }>,
  ): void;
  handleSubmit(): Promise<void>;
  updateImageSummary(images: UploadedImageCard[]): void;
  hasDraft(): boolean;
};

const MAX_IMAGE_COUNT = 6;

let isPageActive = false;
let requestSerial = 0;

Page<CommunityCreatePageData, CommunityCreatePageMethods>({
  data: {
    categories: [],
    selectedCategoryKey: '',
    title: '',
    content: '',
    titleCountText: '0 / 80',
    contentCountText: '0 / 4000',
    isSubmitting: false,
    isLoadingCategories: true,
    loadErrorMessage: '',
    images: [],
    imageCountText: `0 / ${MAX_IMAGE_COUNT}`,
    isUploadingImages: false,
  },

  onLoad() {
    isPageActive = true;

    if (!this.ensureAuthenticated()) {
      return;
    }

    void this.loadCategories();
  },

  onShow() {
    isPageActive = true;

    if (
      this.ensureAuthenticated() &&
      this.data.categories.length === 0 &&
      !this.data.isLoadingCategories
    ) {
      void this.loadCategories();
    }
  },

  onUnload() {
    isPageActive = false;
    requestSerial += 1;
  },

  ensureAuthenticated() {
    if (getAuthStateSummary().isAuthenticated) {
      return true;
    }

    redirectToLogin('/pages/community/create');
    return false;
  },

  async loadCategories() {
    const currentSerial = ++requestSerial;

    this.setData({
      isLoadingCategories: true,
      loadErrorMessage: '',
    });

    try {
      const response = await fetchCommunityCategories();

      if (!isPageActive || currentSerial !== requestSerial) {
        return;
      }

      this.setData({
        categories: response.items.map((category: CommunityCategory) => ({
          key: category.key,
          label: category.name,
        })),
        selectedCategoryKey:
          response.items[0]?.key ?? this.data.selectedCategoryKey,
        isLoadingCategories: false,
        loadErrorMessage: '',
      });
    } catch (error) {
      if (!isPageActive || currentSerial !== requestSerial) {
        return;
      }

      this.setData({
        isLoadingCategories: false,
        loadErrorMessage: getCommunityErrorMessage(
          error,
          '发帖分区加载失败，请稍后重试',
        ),
      });
    }
  },

  handleBack() {
    if (!this.hasDraft()) {
      wx.navigateBack({
        delta: 1,
      });
      return;
    }

    wx.showModal({
      content: '当前还有未发布的内容，离开后将不会保存，是否继续？',
      confirmText: '继续离开',
      cancelText: '继续编辑',
      success: (result) => {
        if (result.confirm) {
          wx.navigateBack({
            delta: 1,
          });
        }
      },
    });
  },

  handleRetry() {
    if (!this.ensureAuthenticated()) {
      return;
    }

    void this.loadCategories();
  },

  handleCategoryTap(
    event: WechatMiniprogram.BaseEvent<{ categoryKey?: string }>,
  ) {
    const categoryKey = normalizeCommunityCategoryKey(
      event.currentTarget.dataset.categoryKey,
    );

    if (!categoryKey || categoryKey === this.data.selectedCategoryKey) {
      return;
    }

    this.setData({
      selectedCategoryKey: categoryKey,
    });
  },

  handleTitleInput(
    event: WechatMiniprogram.CustomEvent<{ value?: string }>,
  ) {
    const title = event.detail.value ?? '';

    this.setData({
      title,
      titleCountText: `${title.trim().length} / 80`,
    });
  },

  handleContentInput(
    event: WechatMiniprogram.CustomEvent<{ value?: string }>,
  ) {
    const content = event.detail.value ?? '';

    this.setData({
      content,
      contentCountText: `${content.trim().length} / 4000`,
    });
  },

  async handleChooseImages() {
    if (!this.ensureAuthenticated() || this.data.isUploadingImages) {
      return;
    }

    const remainingCount = MAX_IMAGE_COUNT - this.data.images.length;

    if (remainingCount <= 0) {
      wx.showToast({
        title: `最多上传 ${MAX_IMAGE_COUNT} 张图片`,
        icon: 'none',
      });
      return;
    }

    try {
      const chooseResult = await new Promise<{
        tempFilePaths: string[];
      }>(
        (resolve, reject) => {
          wx.chooseImage({
            count: remainingCount,
            sizeType: ['compressed'],
            sourceType: ['album', 'camera'],
            success: resolve,
            fail: reject,
          });
        },
      );

      if (!chooseResult.tempFilePaths.length) {
        return;
      }

      this.setData({
        isUploadingImages: true,
      });

      const uploadedImages: UploadedImageCard[] = [];

      for (const filePath of chooseResult.tempFilePaths) {
        if (!filePath) {
          continue;
        }

        const response = await uploadCommunityImage(filePath);

        if (!isPageActive) {
          return;
        }

        uploadedImages.push({
          ...response.image,
          localPath: filePath,
          isUploading: false,
        });
      }

      if (!isPageActive) {
        return;
      }

      const nextImages = [...this.data.images, ...uploadedImages];

      this.setData({
        images: nextImages,
        isUploadingImages: false,
      });
      this.updateImageSummary(nextImages);
    } catch (error) {
      if (!isPageActive) {
        return;
      }

      this.setData({
        isUploadingImages: false,
      });

      const err = error as { errMsg?: string } | undefined;

      if (err?.errMsg?.includes('cancel')) {
        return;
      }

      wx.showToast({
        title: getCommunityErrorMessage(error, '图片上传失败，请稍后重试'),
        icon: 'none',
      });
    }
  },

  handleRemoveImage(
    event: WechatMiniprogram.BaseEvent<{ index?: number }>,
  ) {
    const index = Number(event.currentTarget.dataset.index);

    if (!Number.isInteger(index) || index < 0 || index >= this.data.images.length) {
      return;
    }

    const nextImages = this.data.images.filter((_, current) => current !== index);

    this.setData({
      images: nextImages,
    });
    this.updateImageSummary(nextImages);
  },

  handlePreviewImage(
    event: WechatMiniprogram.BaseEvent<{ index?: number }>,
  ) {
    const index = Number(event.currentTarget.dataset.index);

    if (!Number.isInteger(index) || index < 0 || index >= this.data.images.length) {
      return;
    }

    const urls = this.data.images.map((item) => item.localPath || item.url);
    const current = urls[index];

    if (!current) {
      return;
    }

    wx.previewImage({
      current,
      urls,
    });
  },

  async handleSubmit() {
    if (
      !this.ensureAuthenticated() ||
      this.data.isSubmitting ||
      this.data.isUploadingImages
    ) {
      return;
    }

    const title = this.data.title.trim();
    const content = this.data.content.trim();
    const categoryKey = this.data.selectedCategoryKey;

    if (!categoryKey) {
      wx.showToast({
        title: '请选择分区',
        icon: 'none',
      });
      return;
    }

    if (title.length < 2 || title.length > 80) {
      wx.showToast({
        title: '标题需要 2 到 80 个字',
        icon: 'none',
      });
      return;
    }

    if (content.length < 1 || content.length > 4000) {
      wx.showToast({
        title: '正文需要 1 到 4000 个字',
        icon: 'none',
      });
      return;
    }

    this.setData({
      isSubmitting: true,
    });

    try {
      const response = await createCommunityPost({
        categoryKey,
        title,
        content,
        images: this.data.images.map((image) => ({
          objectKey: image.objectKey,
          url: image.url,
        })),
      });

      bumpCommunityContentVersion();

      wx.showToast({
        title: '发布成功',
        icon: 'none',
      });

      wx.redirectTo({
        url: `/pages/community/detail?postId=${encodeURIComponent(response.postId)}`,
      });
    } catch (error) {
      if (!isPageActive) {
        return;
      }

      wx.showToast({
        title: getCommunityErrorMessage(error, '发帖失败，请稍后重试'),
        icon: 'none',
      });

      this.setData({
        isSubmitting: false,
      });
      return;
    }

    if (isPageActive) {
      this.setData({
        isSubmitting: false,
      });
    }
  },

  updateImageSummary(images: UploadedImageCard[]) {
    this.setData({
      imageCountText: `${images.length} / ${MAX_IMAGE_COUNT}`,
    });
  },

  hasDraft() {
    return Boolean(
      this.data.title.trim() ||
        this.data.content.trim() ||
        this.data.images.length > 0,
    );
  },
});
