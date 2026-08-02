import type {
  CommunityFavoriteListItem,
  CommunityFavoritesResponse,
} from '../../types/community';
import { getAuthStateSummary, redirectToLogin } from '../../utils/auth';
import {
  fetchMyCommunityFavorites,
  formatCommunityTimestamp,
  getCommunityErrorMessage,
  getCommunityVersionSnapshot,
} from '../../utils/community';

type PageState = 'loading' | 'success' | 'empty' | 'error' | 'unauthorized';

type FavoriteCard = CommunityFavoriteListItem & {
  authorName: string;
  titleText: string;
  previewText: string;
  favoritedAtText: string;
};

type FavoritesPageData = {
  state: PageState;
  errorMessage: string;
  items: FavoriteCard[];
  nextCursor: string;
  hasMore: boolean;
  isLoadingMore: boolean;
};

type FavoritesPageMethods = {
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
let lastSeenCollectionVersion = 0;
let lastSeenContentVersion = 0;

Page<FavoritesPageData, FavoritesPageMethods>({
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
    const snapshot = getCommunityVersionSnapshot();
    lastSeenCollectionVersion = snapshot.collectionVersion;
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
      snapshot.collectionVersion !== lastSeenCollectionVersion ||
      snapshot.contentVersion !== lastSeenContentVersion
    ) {
      lastSeenCollectionVersion = snapshot.collectionVersion;
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
      errorMessage: '请先登录后查看收藏',
    });
    redirectToLogin('/pages/profile/community-favorites');
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
      const response = await fetchMyCommunityFavorites({
        cursor: replace ? undefined : this.data.nextCursor,
        limit: PAGE_LIMIT,
      });

      if (!isPageActive || currentSerial !== requestSerial) {
        return;
      }

      const mappedItems = response.items.map((item: CommunityFavoriteListItem) => ({
        ...item,
        authorName: item.post.author.nickname?.trim() || '社区用户',
        titleText: item.post.title,
        previewText: item.post.contentPreview,
        favoritedAtText: formatCommunityTimestamp(item.favoritedAt),
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
        errorMessage: getCommunityErrorMessage(error, '收藏列表加载失败，请稍后重试'),
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
