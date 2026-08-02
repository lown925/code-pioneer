import type { CommunityMyPostsResponse, CommunityPostDetail } from '../../types/community';
import { getAuthStateSummary, redirectToLogin } from '../../utils/auth';
import {
  fetchMyCommunityPosts,
  formatCommunityTimestamp,
  getCommunityErrorMessage,
  getCommunityStatusLabel,
  getCommunityVersionSnapshot,
} from '../../utils/community';

type PageState = 'loading' | 'success' | 'empty' | 'error' | 'unauthorized';

type CommunityMyPostCard = CommunityPostDetail & {
  authorName: string;
  createdAtText: string;
  statusText: string;
  favoriteCountText: string;
  viewCountText: string;
};

type CommunityPostsPageData = {
  state: PageState;
  errorMessage: string;
  items: CommunityMyPostCard[];
  nextCursor: string;
  hasMore: boolean;
  isLoadingMore: boolean;
};

type CommunityPostsPageMethods = {
  ensureAuthenticated(): boolean;
  loadList(options: { replace: boolean }): Promise<void>;
  handleRetry(): void;
  handleOpenDetail(
    event: WechatMiniprogram.BaseEvent<{ postId?: string }>,
  ): void;
};

const PAGE_LIMIT = 10;

let isPageActive = false;
let requestSerial = 0;
let lastSeenContentVersion = 0;

Page<CommunityPostsPageData, CommunityPostsPageMethods>({
  data: {
    state: 'loading',
    errorMessage: '',
    items: [],
    nextCursor: '',
    hasMore: false,
    isLoadingMore: false,
  },

  onLoad() {
    isPageActive = true;
    lastSeenContentVersion = getCommunityVersionSnapshot().contentVersion;

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

    const { contentVersion } = getCommunityVersionSnapshot();

    if (contentVersion !== lastSeenContentVersion) {
      lastSeenContentVersion = contentVersion;
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
      errorMessage: '请先登录后查看自己的帖子',
    });
    redirectToLogin('/pages/profile/community-posts');
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
      const response = await fetchMyCommunityPosts({
        cursor: replace ? undefined : this.data.nextCursor,
        limit: PAGE_LIMIT,
      });

      if (!isPageActive || currentSerial !== requestSerial) {
        return;
      }

      const mappedItems = response.items.map((item: CommunityPostDetail) => {
        const authorName = item.author.nickname?.trim() || '社区用户';

        return {
          ...item,
          authorName,
          createdAtText: formatCommunityTimestamp(item.createdAt),
          statusText: getCommunityStatusLabel(item.status),
          favoriteCountText: String(Math.max(0, item.favoriteCount)),
          viewCountText: String(Math.max(0, item.viewCount)),
        };
      });
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
        errorMessage: getCommunityErrorMessage(error, '我的帖子加载失败，请稍后重试'),
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
});
