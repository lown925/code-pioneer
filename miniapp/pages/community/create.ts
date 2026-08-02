import type {
  CommunityCategory,
  CommunityCategoryKey,
  CommunityPostContentBlock,
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

type EditorBlock = {
  id: string;
  type: 'TEXT' | 'IMAGE' | 'CODE';
  text: string;
  code: string;
  language: string;
  image: CommunityUploadedImage | null;
  localPath: string;
  isUploading: boolean;
  uploadError: string;
};

type CommunityCreatePageData = {
  categories: CategoryFilter[];
  selectedCategoryKey: CommunityCategoryKey | '';
  title: string;
  titleCountText: string;
  editorBlocks: EditorBlock[];
  contentCountText: string;
  imageCountText: string;
  isSubmitting: boolean;
  isLoadingCategories: boolean;
  loadErrorMessage: string;
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
  handleBlockTextInput(
    event: WechatMiniprogram.CustomEvent<{ value?: string }>,
  ): void;
  handleBlockCodeInput(
    event: WechatMiniprogram.CustomEvent<{ value?: string }>,
  ): void;
  handleBlockLanguageInput(
    event: WechatMiniprogram.CustomEvent<{ value?: string }>,
  ): void;
  handleAddTextBlock(event: WechatMiniprogram.BaseEvent): void;
  handleAddCodeBlock(event: WechatMiniprogram.BaseEvent): void;
  handleAddImageBlock(event: WechatMiniprogram.BaseEvent): Promise<void>;
  uploadImageBlock(blockId: string, localPath: string): Promise<void>;
  handleMoveBlockUp(
    event: WechatMiniprogram.BaseEvent<{ blockId?: string }>,
  ): void;
  handleMoveBlockDown(
    event: WechatMiniprogram.BaseEvent<{ blockId?: string }>,
  ): void;
  handleRemoveBlock(
    event: WechatMiniprogram.BaseEvent<{ blockId?: string }>,
  ): void;
  handlePreviewImage(
    event: WechatMiniprogram.BaseEvent<{ blockId?: string }>,
  ): void;
  handleRetryImageUpload(
    event: WechatMiniprogram.BaseEvent<{ blockId?: string }>,
  ): Promise<void>;
  handleSubmit(): Promise<void>;
  updateEditorSummary(blocks: EditorBlock[]): void;
  hasDraft(): boolean;
};

const MAX_CONTENT_LENGTH = 20000;
const IMAGE_PICKER_BATCH_SIZE = 9;

let isPageActive = false;
let requestSerial = 0;
let editorBlockSequence = 0;

function createEditorBlock(type: EditorBlock['type']): EditorBlock {
  editorBlockSequence += 1;

  return {
    id: `community-block-${Date.now()}-${editorBlockSequence}`,
    type,
    text: '',
    code: '',
    language: '',
    image: null,
    localPath: '',
    isUploading: false,
    uploadError: '',
  };
}

function getEventBlockId(event: WechatMiniprogram.BaseEvent) {
  const value = event.currentTarget.dataset.blockId;
  return typeof value === 'string' ? value : '';
}

function insertBlocksAfter(
  blocks: EditorBlock[],
  afterBlockId: string,
  insertedBlocks: EditorBlock[],
) {
  if (!afterBlockId) {
    return [...blocks, ...insertedBlocks];
  }

  const index = blocks.findIndex((block) => block.id === afterBlockId);

  if (index < 0) {
    return [...blocks, ...insertedBlocks];
  }

  return [
    ...blocks.slice(0, index + 1),
    ...insertedBlocks,
    ...blocks.slice(index + 1),
  ];
}

Page<CommunityCreatePageData, CommunityCreatePageMethods>({
  data: {
    categories: [],
    selectedCategoryKey: '',
    title: '',
    titleCountText: '0 / 80',
    editorBlocks: [createEditorBlock('TEXT')],
    contentCountText: `0 / ${MAX_CONTENT_LENGTH}`,
    imageCountText: '0 张图片',
    isSubmitting: false,
    isLoadingCategories: true,
    loadErrorMessage: '',
    isUploadingImages: false,
  },

  onLoad() {
    isPageActive = true;

    if (this.ensureAuthenticated()) {
      void this.loadCategories();
    }
  },

  onShow() {
    isPageActive = true;
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
      wx.navigateBack();
      return;
    }

    wx.showModal({
      content: '当前内容尚未发布，离开后不会保存，是否继续？',
      confirmText: '继续离开',
      cancelText: '继续编辑',
      success: (result) => {
        if (result.confirm) {
          wx.navigateBack();
        }
      },
    });
  },

  handleRetry() {
    if (this.ensureAuthenticated()) {
      void this.loadCategories();
    }
  },

  handleCategoryTap(
    event: WechatMiniprogram.BaseEvent<{ categoryKey?: string }>,
  ) {
    const categoryKey = normalizeCommunityCategoryKey(
      event.currentTarget.dataset.categoryKey,
    );

    if (categoryKey && categoryKey !== this.data.selectedCategoryKey) {
      this.setData({ selectedCategoryKey: categoryKey });
    }
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

  handleBlockTextInput(
    event: WechatMiniprogram.CustomEvent<{ value?: string }>,
  ) {
    const blockId = getEventBlockId(event);
    const editorBlocks = this.data.editorBlocks.map((block) =>
      block.id === blockId
        ? { ...block, text: event.detail.value ?? '' }
        : block,
    );
    this.setData({ editorBlocks });
    this.updateEditorSummary(editorBlocks);
  },

  handleBlockCodeInput(
    event: WechatMiniprogram.CustomEvent<{ value?: string }>,
  ) {
    const blockId = getEventBlockId(event);
    const editorBlocks = this.data.editorBlocks.map((block) =>
      block.id === blockId
        ? { ...block, code: event.detail.value ?? '' }
        : block,
    );
    this.setData({ editorBlocks });
    this.updateEditorSummary(editorBlocks);
  },

  handleBlockLanguageInput(
    event: WechatMiniprogram.CustomEvent<{ value?: string }>,
  ) {
    const blockId = getEventBlockId(event);
    this.setData({
      editorBlocks: this.data.editorBlocks.map((block) =>
        block.id === blockId
          ? { ...block, language: event.detail.value ?? '' }
          : block,
      ),
    });
  },

  handleAddTextBlock(event: WechatMiniprogram.BaseEvent) {
    const editorBlocks = insertBlocksAfter(
      this.data.editorBlocks,
      getEventBlockId(event),
      [createEditorBlock('TEXT')],
    );
    this.setData({ editorBlocks });
  },

  handleAddCodeBlock(event: WechatMiniprogram.BaseEvent) {
    const editorBlocks = insertBlocksAfter(
      this.data.editorBlocks,
      getEventBlockId(event),
      [createEditorBlock('CODE')],
    );
    this.setData({ editorBlocks });
  },

  async handleAddImageBlock(event: WechatMiniprogram.BaseEvent) {
    if (!this.ensureAuthenticated() || this.data.isUploadingImages) {
      return;
    }

    try {
      const chooseResult = await new Promise<{ tempFilePaths: string[] }>(
        (resolve, reject) => {
          wx.chooseImage({
            count: IMAGE_PICKER_BATCH_SIZE,
            sizeType: ['compressed'],
            sourceType: ['album', 'camera'],
            success: resolve,
            fail: reject,
          });
        },
      );

      if (!chooseResult.tempFilePaths.length || !isPageActive) {
        return;
      }

      const pendingBlocks = chooseResult.tempFilePaths.map((localPath) => ({
        ...createEditorBlock('IMAGE'),
        localPath,
        isUploading: true,
      }));
      const editorBlocks = insertBlocksAfter(
        this.data.editorBlocks,
        getEventBlockId(event),
        pendingBlocks,
      );

      this.setData({
        editorBlocks,
        isUploadingImages: true,
      });
      this.updateEditorSummary(editorBlocks);

      for (const block of pendingBlocks) {
        await this.uploadImageBlock(block.id, block.localPath);
      }
    } catch (error) {
      const message = (error as { errMsg?: string } | undefined)?.errMsg;

      if (isPageActive && !message?.includes('cancel')) {
        wx.showToast({
          title: getCommunityErrorMessage(error, '图片选择失败，请重试'),
          icon: 'none',
        });
      }
    } finally {
      if (isPageActive) {
        this.setData({ isUploadingImages: false });
      }
    }
  },

  async uploadImageBlock(blockId: string, localPath: string) {
    try {
      const response = await uploadCommunityImage(localPath);

      if (!isPageActive) {
        return;
      }

      this.setData({
        editorBlocks: this.data.editorBlocks.map((block) =>
          block.id === blockId
            ? {
                ...block,
                image: response.image,
                isUploading: false,
                uploadError: '',
              }
            : block,
        ),
      });
    } catch (error) {
      if (!isPageActive) {
        return;
      }

      this.setData({
        editorBlocks: this.data.editorBlocks.map((block) =>
          block.id === blockId
            ? {
                ...block,
                isUploading: false,
                uploadError: getCommunityErrorMessage(
                  error,
                  '上传失败，点击重试',
                ),
              }
            : block,
        ),
      });
    }
  },

  handleMoveBlockUp(
    event: WechatMiniprogram.BaseEvent<{ blockId?: string }>,
  ) {
    const blockId = getEventBlockId(event);
    const index = this.data.editorBlocks.findIndex(
      (block) => block.id === blockId,
    );

    if (index <= 0) {
      return;
    }

    const editorBlocks = [...this.data.editorBlocks];
    [editorBlocks[index - 1], editorBlocks[index]] = [
      editorBlocks[index]!,
      editorBlocks[index - 1]!,
    ];
    this.setData({ editorBlocks });
  },

  handleMoveBlockDown(
    event: WechatMiniprogram.BaseEvent<{ blockId?: string }>,
  ) {
    const blockId = getEventBlockId(event);
    const index = this.data.editorBlocks.findIndex(
      (block) => block.id === blockId,
    );

    if (index < 0 || index >= this.data.editorBlocks.length - 1) {
      return;
    }

    const editorBlocks = [...this.data.editorBlocks];
    [editorBlocks[index], editorBlocks[index + 1]] = [
      editorBlocks[index + 1]!,
      editorBlocks[index]!,
    ];
    this.setData({ editorBlocks });
  },

  handleRemoveBlock(
    event: WechatMiniprogram.BaseEvent<{ blockId?: string }>,
  ) {
    const blockId = getEventBlockId(event);
    const editorBlocks = this.data.editorBlocks.filter(
      (block) => block.id !== blockId,
    );
    this.setData({ editorBlocks });
    this.updateEditorSummary(editorBlocks);
  },

  handlePreviewImage(
    event: WechatMiniprogram.BaseEvent<{ blockId?: string }>,
  ) {
    const imageBlocks = this.data.editorBlocks.filter(
      (block) => block.type === 'IMAGE' && block.localPath,
    );
    const currentBlock = imageBlocks.find(
      (block) => block.id === getEventBlockId(event),
    );

    if (!currentBlock) {
      return;
    }

    wx.previewImage({
      current: currentBlock.localPath,
      urls: imageBlocks.map((block) => block.localPath),
    });
  },

  async handleRetryImageUpload(
    event: WechatMiniprogram.BaseEvent<{ blockId?: string }>,
  ) {
    const blockId = getEventBlockId(event);
    const block = this.data.editorBlocks.find((item) => item.id === blockId);

    if (!block || !block.localPath || block.isUploading) {
      return;
    }

    this.setData({
      editorBlocks: this.data.editorBlocks.map((item) =>
        item.id === blockId
          ? { ...item, isUploading: true, uploadError: '' }
          : item,
      ),
    });
    await this.uploadImageBlock(blockId, block.localPath);
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
    const categoryKey = this.data.selectedCategoryKey;

    if (!categoryKey) {
      wx.showToast({ title: '请选择分区', icon: 'none' });
      return;
    }

    if (title.length < 2 || title.length > 80) {
      wx.showToast({ title: '标题需要 2 到 80 个字', icon: 'none' });
      return;
    }

    if (
      this.data.editorBlocks.some(
        (block) => block.type === 'IMAGE' && (block.isUploading || !block.image),
      )
    ) {
      wx.showToast({ title: '仍有图片未上传成功，请重试或删除', icon: 'none' });
      return;
    }

    const contentBlocks = this.data.editorBlocks.flatMap(
      (block): CommunityPostContentBlock[] => {
        if (block.type === 'TEXT' && block.text.trim()) {
          return [{ type: 'TEXT', text: block.text.trim() }];
        }

        if (block.type === 'CODE' && block.code.trim()) {
          return [
            {
              type: 'CODE',
              code: block.code,
              language: block.language.trim() || null,
            },
          ];
        }

        if (block.type === 'IMAGE' && block.image) {
          return [
            {
              type: 'IMAGE',
              objectKey: block.image.objectKey,
              url: block.image.url,
            },
          ];
        }

        return [];
      },
    );
    const textLength = contentBlocks.reduce((total, block) => {
      if (block.type === 'TEXT') {
        return total + block.text.length;
      }

      if (block.type === 'CODE') {
        return total + block.code.length;
      }

      return total;
    }, 0);

    if (contentBlocks.length === 0) {
      wx.showToast({ title: '请至少添加一段文字、图片或代码', icon: 'none' });
      return;
    }

    if (textLength > MAX_CONTENT_LENGTH) {
      wx.showToast({ title: '正文与代码合计不能超过 20000 字符', icon: 'none' });
      return;
    }

    this.setData({ isSubmitting: true });

    try {
      const response = await createCommunityPost({
        categoryKey,
        title,
        contentBlocks,
      });

      bumpCommunityContentVersion();
      wx.showToast({ title: '发布成功', icon: 'success' });
      wx.redirectTo({
        url: `/pages/community/detail?postId=${encodeURIComponent(response.postId)}`,
      });
    } catch (error) {
      if (isPageActive) {
        wx.showToast({
          title: getCommunityErrorMessage(error, '发帖失败，请稍后重试'),
          icon: 'none',
        });
      }
    } finally {
      if (isPageActive) {
        this.setData({ isSubmitting: false });
      }
    }
  },

  updateEditorSummary(blocks: EditorBlock[]) {
    const contentLength = blocks.reduce(
      (total, block) => total + block.text.length + block.code.length,
      0,
    );
    const imageCount = blocks.filter((block) => block.type === 'IMAGE').length;

    this.setData({
      contentCountText: `${contentLength} / ${MAX_CONTENT_LENGTH}`,
      imageCountText: `${imageCount} 张图片`,
    });
  },

  hasDraft() {
    return Boolean(
      this.data.title.trim() ||
        this.data.editorBlocks.some(
          (block) =>
            block.text.trim() || block.code.trim() || block.localPath,
        ),
    );
  },
});
