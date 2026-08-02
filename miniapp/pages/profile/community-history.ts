import type {
  CommunityHistoryListItem,
  CommunityHistoryResponse,
} from '../../types/community';
import { getAuthStateSummary, redirectToLogin } from '../../utils/auth';
import {
  bumpCommunityHistoryVersion,
  clearMyCommunityHistory,
  deleteMyCommunityHistoryItem,
  fetchMyCommunityHistory,
  formatCommunityTimestamp,
  getCommunityErrorMessage,
  getCommunityVersionSnapshot,
} from '../../utils/community';

type PageState = 'loading' | 'success' | 'empty' | 'error' | 'unauthorized';

type HistoryCard = CommunityHistoryListItem & {
  authorName: string;
  previewText: string;
  lastViewedAtText: string;
  personalViewCountText: string;
};

type HistoryPageData = {
  state: PageState;
  errorMessage: string;
  items: HistoryCard[];
  nextCursor: string;
  hasMore: boolean;
  isLoadingMore: boolean;
  isClearing: boolean;
};

type HistoryPageMethods = {
  ensureAuthenticated(): boolean;
  loadList(options: { replace: boolean }): Promise<void>;
  handleRetry(): void;
  handleOpenDetail(
    event: WechatMiniprogram.BaseEvent<{ postId?: string }>,
  ): void;
  handleDeleteItem(
    event: WechatMiniprogram.BaseEvent<{ postId?: string }>,
  ): void;
  handleClearAll(): void;
};

const PAGE_LIMIT = 10;

let isPageActive = false;
let requestSerial = 0;
let lastSeenHistoryVersion = 0;
let lastSeenContentVersion = 0;

Page<HistoryPageData, HistoryPageMethods>({
  data: {
    state: 'loading',
    errorMessage: '',
    items: [],
    nextCursor: '',
    hasMore: false,
    isLoadingMore: false,
    isClearing: false,
  },

  onLoad() {
    isPageActive = true;
    const snapshot = getCommunityVersionSnapshot();
    lastSeenHistoryVersion = snapshot.historyVersion;
    lastSeenContentVersion = snapshot.contentVersion;

    if (!this.ensureAuthenticated()) {
      return;
    }

    void this.loadList({ replace: true });
  },

  onShow() {
    isPageActive = true;

    if (!this.ensureAuthenticated()) {
      return;
    }

    const snapshot = getCommunityVersionSnapshot();

    if (
      snapshot.historyVersion !== lastSeenHistoryVersion ||
      snapshot.contentVersion !== lastSeenContentVersion
    ) {
      lastSeenHistoryVersion = snapshot.historyVersion;
      lastSeenContentVersion = snapshot.contentVersion;
      void this.loadList({ replace: true });
    }
  },

  onUnload() {
    isPageActive = false;
    requestSerial += 1;
  },

  onReachBottom() {
    if (!this.data.hasMore || !this.data.nextCursor || this.data.isLoadingMore) {
      return;
    }

    void this.loadList({ replace: false });
  },

  ensureAuthenticated() {
    if (getAuthStateSummary().isAuthenticated) {
      return true;
    }

    this.setData({
      state: 'unauthorized',
      errorMessage: '请先登录后查看浏览历史',
    });
    redirectToLogin('/pages/profile/community-history');
    return false;
  },

  async loadList({ replace }: { replace: boolean }) {
    const currentSerial = ++requestSerial;

    if (replace) {
      this.setData({
        state: 'loading',
        errorMessage: '',
        items: [],
        nextCursor: '',
        hasMore: false,
        isLoadingMore: false,
      });
    } else {
      this.setData({
        isLoadingMore: true,
      });
    }

    try {
      const response = await fetchMyCommunityHistory({
        cursor: replace ? undefined : this.data.nextCursor,
        limit: PAGE_LIMIT,
      });

      if (!isPageActive || currentSerial !== requestSerial) {
        return;
      }

      const mappedItems = response.items.map((item: CommunityHistoryListItem) => ({
        ...item,
        authorName: item.post.author.nickname?.trim() || '社区用户',
        previewText: item.post.contentPreview,
        lastViewedAtText: formatCommunityTimestamp(item.lastViewedAt),
        personalViewCountText: String(Math.max(0, item.personalViewCount)),
      }));
      const items = replace ? mappedItems : [...this.data.items, ...mappedItems];

      this.setData({
        state: items.length > 0 ? 'success' : 'empty',
        errorMessage: '',
        items,
        nextCursor: response.nextCursor ?? '',
        hasMore: response.hasMore,
        isLoadingMore: false,
      });
    } catch (error) {
      if (!isPageActive || currentSerial !== requestSerial) {
        return;
      }

      this.setData({
        state: 'error',
        errorMessage: getCommunityErrorMessage(error, '浏览历史加载失败，请稍后重试'),
        isLoadingMore: false,
      });
    }
  },

  handleRetry() {
    if (!this.ensureAuthenticated()) {
      return;
    }

    void this.loadList({ replace: true });
  },

  handleOpenDetail(
    event: WechatMiniprogram.BaseEvent<{ postId?: string }>,
  ) {
    const postId = event.currentTarget.dataset.postId;

    if (!postId) {
      wx.showToast({
        title: '帖子参数无效',
        icon: 'none',
      });
      return;
    }

    wx.navigateTo({
      url: `/pages/community/detail?postId=${encodeURIComponent(postId)}`,
    });
  },

  handleDeleteItem(
    event: WechatMiniprogram.BaseEvent<{ postId?: string }>,
  ) {
    const postId = event.currentTarget.dataset.postId;

    if (!postId) {
      return;
    }

    wx.showModal({
      content: '确认删除这条浏览历史吗？',
      confirmText: '删除',
      cancelText: '取消',
      success: async (result) => {
        if (!result.confirm) {
          return;
        }

        try {
          await deleteMyCommunityHistoryItem(postId);

          bumpCommunityHistoryVersion();

          if (!isPageActive) {
            return;
          }

          wx.showToast({
            title: '已删除',
            icon: 'none',
          });

          void this.loadList({ replace: true });
        } catch (error) {
          wx.showToast({
            title: getCommunityErrorMessage(error, '删除失败，请稍后重试'),
            icon: 'none',
          });
        }
      },
    });
  },

  handleClearAll() {
    if (this.data.isClearing || this.data.items.length === 0) {
      return;
    }

    wx.showModal({
      content: '确认清空全部社区浏览历史吗？此操作不会影响帖子的公开浏览数。',
      confirmText: '确认清空',
      cancelText: '取消',
      success: async (result) => {
        if (!result.confirm) {
          return;
        }

        this.setData({
          isClearing: true,
        });

        try {
          await clearMyCommunityHistory();

          bumpCommunityHistoryVersion();

          if (!isPageActive) {
            return;
          }

          wx.showToast({
            title: '已清空历史',
            icon: 'none',
          });

          await this.loadList({ replace: true });
        } catch (error) {
          wx.showToast({
            title: getCommunityErrorMessage(error, '清空失败，请稍后重试'),
            icon: 'none',
          });
        } finally {
          if (isPageActive) {
            this.setData({
              isClearing: false,
            });
          }
        }
      },
    });
  },
});
