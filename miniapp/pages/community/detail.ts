import type {
  CommunityComment,
  CommunityPostContentBlock,
  CommunityPostDetail,
} from '../../types/community';
import { getAuthStateSummary, redirectToLogin } from '../../utils/auth';
import {
  bumpCommunityCollectionVersion,
  bumpCommunityContentVersion,
  bumpCommunityHistoryVersion,
  createCommunityComment,
  deleteCommunityPost,
  favoriteCommunityPost,
  fetchCommunityComments,
  fetchCommunityPostDetail,
  formatCommunityTimestamp,
  getCommunityErrorMessage,
  isUuid,
  likeCommunityPost,
  unlikeCommunityPost,
  unfavoriteCommunityPost,
} from '../../utils/community';
import { RequestError } from '../../utils/request';

type DetailState = 'loading' | 'success' | 'error';

type CommunityDetailBlock = {
  blockKey: string;
  type: CommunityPostContentBlock['type'];
  text: string;
  code: string;
  language: string;
  objectKey: string;
  url: string;
  imageLoadFailed: boolean;
};

type CommunityDetailCard = Omit<CommunityPostDetail, 'contentBlocks'> & {
  contentBlocks: CommunityDetailBlock[];
  authorName: string;
  authorInitial: string;
  createdAtText: string;
  favoriteCountText: string;
  commentCountText: string;
  viewCountText: string;
  likeCountText: string;
};

type CommunityCommentCard = CommunityComment & {
  authorName: string;
  authorInitial: string;
  createdAtText: string;
};

type CommunityDetailPageData = {
  state: DetailState;
  postId: string;
  errorMessage: string;
  post: CommunityDetailCard | null;
  comments: CommunityCommentCard[];
  commentsErrorMessage: string;
  isCommentsLoading: boolean;
  commentDraft: string;
  commentCountText: string;
  isCommentSubmitting: boolean;
  isFavoriteSubmitting: boolean;
  isLikeSubmitting: boolean;
  isDeleting: boolean;
};

type CommunityDetailPageMethods = {
  loadDetail(): Promise<void>;
  loadComments(): Promise<void>;
  handleRetry(): void;
  handleOpenAuthorProfile(
    event: WechatMiniprogram.BaseEvent<{ userId?: string }>,
  ): void;
  handleFavoriteToggle(): Promise<void>;
  handleLikeToggle(): Promise<void>;
  handleDelete(): void;
  confirmDelete(): Promise<void>;
  handleCommentInput(
    event: WechatMiniprogram.CustomEvent<{ value?: string }>,
  ): void;
  handleCommentSubmit(): Promise<void>;
  handlePreviewImage(
    event: WechatMiniprogram.BaseEvent<{ url?: string }>,
  ): void;
  handleCopyCode(
    event: WechatMiniprogram.BaseEvent<{ blockIndex?: number }>,
  ): void;
  handleContentImageError(
    event: WechatMiniprogram.BaseEvent<{ blockIndex?: number }>,
  ): void;
  mapContentBlock(
    item: CommunityPostContentBlock,
    index: number,
  ): CommunityDetailBlock;
  mapCommentCard(item: CommunityComment): CommunityCommentCard;
};

let isPageActive = false;
let detailRequestSerial = 0;
let commentRequestSerial = 0;
let hasBumpedHistoryVersion = false;

Page<CommunityDetailPageData, CommunityDetailPageMethods>({
  data: {
    state: 'loading',
    postId: '',
    errorMessage: '',
    post: null,
    comments: [],
    commentsErrorMessage: '',
    isCommentsLoading: false,
    commentDraft: '',
    commentCountText: '0',
    isCommentSubmitting: false,
    isFavoriteSubmitting: false,
    isLikeSubmitting: false,
    isDeleting: false,
  },

  onLoad(query) {
    isPageActive = true;
    hasBumpedHistoryVersion = false;

    const postId =
      typeof query.postId === 'string' ? decodeURIComponent(query.postId) : '';

    if (!isUuid(postId)) {
      this.setData({
        state: 'error',
        errorMessage: '帖子参数无效，请返回后重试',
        postId: '',
      });
      return;
    }

    this.setData({
      postId,
    });

    void this.loadDetail();
    void this.loadComments();
  },

  onShow() {
    isPageActive = true;
  },

  onUnload() {
    isPageActive = false;
    hasBumpedHistoryVersion = false;
    detailRequestSerial += 1;
    commentRequestSerial += 1;
  },

  async loadDetail() {
    if (!this.data.postId) {
      return;
    }

    const currentSerial = ++detailRequestSerial;

    this.setData({
      state: 'loading',
      errorMessage: '',
    });

    try {
      const response = await fetchCommunityPostDetail(this.data.postId);

      if (!isPageActive || currentSerial !== detailRequestSerial) {
        return;
      }

      const authorName = response.author.nickname?.trim() || '社区用户';

      this.setData({
        state: 'success',
        errorMessage: '',
        post: {
          ...response,
          authorName,
          authorInitial: authorName.slice(0, 1) || '社',
          createdAtText: formatCommunityTimestamp(response.createdAt),
          favoriteCountText: String(Math.max(0, response.favoriteCount)),
          likeCountText: String(Math.max(0, response.likeCount)),
          commentCountText: String(Math.max(0, response.commentCount)),
          viewCountText: String(Math.max(0, response.viewCount)),
          contentBlocks: response.contentBlocks.map((block, index) =>
            this.mapContentBlock(block, index),
          ),
        },
        commentCountText: String(Math.max(0, response.commentCount)),
      });

      if (getAuthStateSummary().isAuthenticated && !hasBumpedHistoryVersion) {
        bumpCommunityHistoryVersion();
        hasBumpedHistoryVersion = true;
      }
    } catch (error) {
      if (!isPageActive || currentSerial !== detailRequestSerial) {
        return;
      }

      this.setData({
        state: 'error',
        errorMessage: getCommunityErrorMessage(
          error,
          '帖子详情加载失败，请稍后重试',
        ),
        post: null,
      });
    }
  },

  async loadComments() {
    if (!this.data.postId) {
      return;
    }

    const currentSerial = ++commentRequestSerial;

    this.setData({
      isCommentsLoading: true,
      commentsErrorMessage: '',
    });

    try {
      const response = await fetchCommunityComments(this.data.postId);

      if (!isPageActive || currentSerial !== commentRequestSerial) {
        return;
      }

      this.setData({
        comments: response.items.map((item) => this.mapCommentCard(item)),
        commentsErrorMessage: '',
        isCommentsLoading: false,
      });
    } catch (error) {
      if (!isPageActive || currentSerial !== commentRequestSerial) {
        return;
      }

      this.setData({
        comments: [],
        commentsErrorMessage: getCommunityErrorMessage(
          error,
          '评论加载失败，请稍后重试',
        ),
        isCommentsLoading: false,
      });
    }
  },

  handleRetry() {
    void this.loadDetail();
    void this.loadComments();
  },

  handleOpenAuthorProfile(
    event: WechatMiniprogram.BaseEvent<{ userId?: string }>,
  ) {
    const userId = event.currentTarget.dataset.userId;

    if (!userId || !isUuid(userId)) {
      wx.showToast({
        title: '用户参数无效',
        icon: 'none',
      });
      return;
    }

    const currentUserId = getAuthStateSummary().user?.id;

    if (currentUserId && currentUserId === userId) {
      wx.switchTab({
        url: '/pages/profile/index',
      });
      return;
    }

    wx.navigateTo({
      url: `/pages/profile/user-profile?userId=${encodeURIComponent(userId)}`,
    });
  },

  async handleFavoriteToggle() {
    const post = this.data.post;

    if (!post || this.data.isFavoriteSubmitting) {
      return;
    }

    if (!getAuthStateSummary().isAuthenticated) {
      redirectToLogin(
        `/pages/community/detail?postId=${encodeURIComponent(post.postId)}`,
      );
      return;
    }

    this.setData({
      isFavoriteSubmitting: true,
    });

    try {
      const response = post.viewerHasFavorited
        ? await unfavoriteCommunityPost(post.postId)
        : await favoriteCommunityPost(post.postId);

      if (!isPageActive) {
        return;
      }

      bumpCommunityCollectionVersion();

      this.setData({
        post: this.data.post
          ? {
              ...this.data.post,
              viewerHasFavorited: response.viewerHasFavorited,
              favoriteCount: response.favoriteCount,
              favoriteCountText: String(Math.max(0, response.favoriteCount)),
            }
          : null,
        isFavoriteSubmitting: false,
      });
    } catch (error) {
      if (!isPageActive) {
        return;
      }

      wx.showToast({
        title: getCommunityErrorMessage(error, '收藏操作失败，请稍后重试'),
        icon: 'none',
      });

      this.setData({
        isFavoriteSubmitting: false,
      });
    }
  },

  async handleLikeToggle() {
    const post = this.data.post;

    if (!post || this.data.isLikeSubmitting) {
      return;
    }

    if (!getAuthStateSummary().isAuthenticated) {
      redirectToLogin(
        `/pages/community/detail?postId=${encodeURIComponent(post.postId)}`,
      );
      return;
    }

    this.setData({ isLikeSubmitting: true });

    try {
      const response = post.viewerHasLiked
        ? await unlikeCommunityPost(post.postId)
        : await likeCommunityPost(post.postId);

      if (!isPageActive) {
        return;
      }

      bumpCommunityContentVersion();
      this.setData({
        post: this.data.post
          ? {
              ...this.data.post,
              viewerHasLiked: response.viewerHasLiked,
              likeCount: response.likeCount,
              likeCountText: String(Math.max(0, response.likeCount)),
            }
          : null,
        isLikeSubmitting: false,
      });
    } catch (error) {
      if (!isPageActive) {
        return;
      }

      wx.showToast({
        title: getCommunityErrorMessage(error, '点赞操作失败，请稍后重试'),
        icon: 'none',
      });
      this.setData({ isLikeSubmitting: false });
    }
  },

  handleCommentInput(
    event: WechatMiniprogram.CustomEvent<{ value?: string }>,
  ) {
    this.setData({
      commentDraft: event.detail.value ?? '',
    });
  },

  async handleCommentSubmit() {
    if (this.data.isCommentSubmitting || !this.data.postId) {
      return;
    }

    if (!getAuthStateSummary().isAuthenticated) {
      redirectToLogin(
        `/pages/community/detail?postId=${encodeURIComponent(this.data.postId)}`,
      );
      return;
    }

    const content = this.data.commentDraft.trim();

    if (!content) {
      wx.showToast({
        title: '请输入评论内容',
        icon: 'none',
      });
      return;
    }

    if (content.length > 1000) {
      wx.showToast({
        title: '评论内容不能超过 1000 字',
        icon: 'none',
      });
      return;
    }

    this.setData({
      isCommentSubmitting: true,
    });

    try {
      const response = await createCommunityComment(this.data.postId, content);

      if (!isPageActive) {
        return;
      }

      bumpCommunityContentVersion();

      this.setData({
        comments: [...this.data.comments, this.mapCommentCard(response.comment)],
        commentDraft: '',
        commentCountText: String(Math.max(0, response.commentCount)),
        post: this.data.post
          ? {
              ...this.data.post,
              commentCount: response.commentCount,
              commentCountText: String(Math.max(0, response.commentCount)),
            }
          : null,
        isCommentSubmitting: false,
      });

      wx.showToast({
        title: '评论已发布',
        icon: 'none',
      });
    } catch (error) {
      if (!isPageActive) {
        return;
      }

      wx.showToast({
        title: getCommunityErrorMessage(error, '评论发布失败，请稍后重试'),
        icon: 'none',
      });

      this.setData({
        isCommentSubmitting: false,
      });
    }
  },

  handleDelete() {
    const post = this.data.post;

    if (!post || !post.isAuthor || this.data.isDeleting) {
      return;
    }

    wx.showModal({
      content:
        '删除后帖子会从信息流、收藏和浏览历史中隐藏，是否继续？',
      confirmText: '确认删除',
      cancelText: '再想想',
      success: (result) => {
        if (result.confirm) {
          void this.confirmDelete();
        }
      },
    });
  },

  async confirmDelete() {
    const post = this.data.post;

    if (!post || this.data.isDeleting) {
      return;
    }

    this.setData({
      isDeleting: true,
    });

    try {
      await deleteCommunityPost(post.postId);

      bumpCommunityContentVersion();
      bumpCommunityCollectionVersion();
      bumpCommunityHistoryVersion();

      wx.showToast({
        title: '帖子已删除',
        icon: 'none',
      });

      if (getCurrentPages().length > 1) {
        wx.navigateBack({
          delta: 1,
        });
      } else {
        wx.switchTab({
          url: '/pages/community/index',
        });
      }
    } catch (error) {
      if (!isPageActive) {
        return;
      }

      const message =
        error instanceof RequestError
          ? getCommunityErrorMessage(error, '删除失败，请稍后重试')
          : '删除失败，请稍后重试';

      wx.showToast({
        title: message,
        icon: 'none',
      });

      this.setData({
        isDeleting: false,
      });
    }
  },

  handlePreviewImage(
    event: WechatMiniprogram.BaseEvent<{ url?: string }>,
  ) {
    const post = this.data.post;
    const url = event.currentTarget.dataset.url;

    if (!post || !url) {
      return;
    }

    wx.previewImage({
      current: url,
      urls: post.contentBlocks
        .filter((block) => block.type === 'IMAGE' && block.url)
        .map((block) => block.url),
    });
  },

  handleCopyCode(
    event: WechatMiniprogram.BaseEvent<{ blockIndex?: number }>,
  ) {
    const index = Number(event.currentTarget.dataset.blockIndex);
    const block = this.data.post?.contentBlocks[index];

    if (!block || block.type !== 'CODE' || !block.code) {
      wx.showToast({ title: '代码内容不可用', icon: 'none' });
      return;
    }

    wx.setClipboardData({
      data: block.code,
      success: () => {
        wx.showToast({ title: '代码已复制', icon: 'success' });
      },
    });
  },

  handleContentImageError(
    event: WechatMiniprogram.BaseEvent<{ blockIndex?: number }>,
  ) {
    const index = Number(event.currentTarget.dataset.blockIndex);
    const post = this.data.post;

    if (!post || !Number.isInteger(index) || !post.contentBlocks[index]) {
      return;
    }

    this.setData({
      post: {
        ...post,
        contentBlocks: post.contentBlocks.map((block, blockIndex) =>
          blockIndex === index ? { ...block, imageLoadFailed: true } : block,
        ),
      },
    });
  },

  mapContentBlock(item: CommunityPostContentBlock, index: number) {
    return {
      blockKey: `content-${index}-${item.type}`,
      type: item.type,
      text: item.type === 'TEXT' ? item.text : '',
      code: item.type === 'CODE' ? item.code : '',
      language:
        item.type === 'CODE' ? item.language?.trim() || '代码' : '',
      objectKey:
        item.type === 'IMAGE' ? item.objectKey?.trim() || '' : '',
      url: item.type === 'IMAGE' ? item.url : '',
      imageLoadFailed: false,
    };
  },

  mapCommentCard(item: CommunityComment) {
    const authorName = item.author.nickname?.trim() || '社区用户';

    return {
      ...item,
      authorName,
      authorInitial: authorName.slice(0, 1) || '社',
      createdAtText: formatCommunityTimestamp(item.createdAt),
    };
  },
});
