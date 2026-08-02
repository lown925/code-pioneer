import type {
  CommunityCategoriesResponse,
  CommunityCategory,
  CommunityCategoryKey,
  CommunityPostListItem,
  CommunityPostSort,
  CommunityPostsQuery,
  CommunityPostsResponse,
} from '../../types/community';
import { getAuthStateSummary, redirectToLogin } from '../../utils/auth';
import {
  fetchCommunityCategories,
  fetchCommunityPosts,
  formatCommunityTimestamp,
  getCommunityErrorMessage,
  getCommunityVersionSnapshot,
  normalizeCommunityCategoryKey,
} from '../../utils/community';

type PageState = 'loading' | 'success' | 'empty' | 'error';

type CategoryFilter = {
  key: CommunityCategoryKey | '';
  label: string;
};

type SortFilter = {
  key: CommunityPostSort;
  label: string;
};

type CommunityFeedCard = CommunityPostListItem & {
  authorName: string;
  authorInitial: string;
  createdAtText: string;
  favoriteCountText: string;
  likeCountText: string;
  commentCountText: string;
  viewCountText: string;
  hasImages: boolean;
};

type CommunityPageData = {
  state: PageState;
  isAuthenticated: boolean;
  errorMessage: string;
  categories: CategoryFilter[];
  selectedCategoryKey: CommunityCategoryKey | '';
  sortFilters: SortFilter[];
  selectedSort: CommunityPostSort;
  items: CommunityFeedCard[];
  nextCursor: string;
  hasMore: boolean;
  isLoadingMore: boolean;
  isRefreshing: boolean;
  categoryDescription: string;
};

type CommunityPageMethods = {
  syncAuthState(): boolean;
  loadInitialData(forceRefresh?: boolean): Promise<void>;
  loadCategories(): Promise<void>;
  loadPosts(options: { replace: boolean }): Promise<void>;
  refreshPage(): Promise<void>;
  loadMore(): Promise<void>;
  handleRetry(): void;
  handleLogin(): void;
  handleCreatePost(): void;
  handleCategoryTap(
    event: WechatMiniprogram.BaseEvent<{ categoryKey?: string }>,
  ): void;
  handleSortTap(
    event: WechatMiniprogram.BaseEvent<{ sortKey?: CommunityPostSort }>,
  ): void;
  handleOpenDetail(
    event: WechatMiniprogram.BaseEvent<{ postId?: string }>,
  ): void;
  buildQuery(): CommunityPostsQuery;
  mapCategoryFilters(categories: CommunityCategory[]): CategoryFilter[];
  mapFeedCard(item: CommunityPostListItem): CommunityFeedCard;
};

const PAGE_LIMIT = 10;

let isPageActive = false;
let categoryRequestSerial = 0;
let postRequestSerial = 0;
let lastSeenContentVersion = 0;
let lastSeenAuthState = false;

Page<CommunityPageData, CommunityPageMethods>({
  data: {
    state: 'loading',
    isAuthenticated: false,
    errorMessage: '',
    categories: [{ key: '', label: '全部' }],
    selectedCategoryKey: '',
    sortFilters: [
      { key: 'recommended', label: '推荐' },
      { key: 'latest', label: '最新' },
      { key: 'mostLiked', label: '点赞最多' },
      { key: 'mostFavorited', label: '收藏最多' },
      { key: 'mostCommented', label: '评论最多' },
    ],
    selectedSort: 'recommended',
    items: [],
    nextCursor: '',
    hasMore: false,
    isLoadingMore: false,
    isRefreshing: false,
    categoryDescription: '综合发布时间与互动质量，为你推荐值得参与的讨论。',
  },

  onLoad() {
    isPageActive = true;
    lastSeenContentVersion = getCommunityVersionSnapshot().contentVersion;
    lastSeenAuthState = this.syncAuthState();
    void this.loadInitialData(true);
  },

  onShow() {
    isPageActive = true;
    const isAuthenticated = this.syncAuthState();
    const versionSnapshot = getCommunityVersionSnapshot();

    if (
      versionSnapshot.contentVersion !== lastSeenContentVersion ||
      isAuthenticated !== lastSeenAuthState
    ) {
      lastSeenContentVersion = versionSnapshot.contentVersion;
      lastSeenAuthState = isAuthenticated;
      void this.loadPosts({ replace: true });
    }
  },

  onUnload() {
    isPageActive = false;
    categoryRequestSerial += 1;
    postRequestSerial += 1;
  },

  onPullDownRefresh() {
    void this.refreshPage();
  },

  onReachBottom() {
    void this.loadMore();
  },

  syncAuthState() {
    const isAuthenticated = getAuthStateSummary().isAuthenticated;

    if (this.data.isAuthenticated !== isAuthenticated) {
      this.setData({
        isAuthenticated,
      });
    }

    return isAuthenticated;
  },

  async loadInitialData(forceRefresh = false) {
    if (forceRefresh) {
      this.setData({
        state: 'loading',
        errorMessage: '',
      });
    }

    await this.loadCategories();
    await this.loadPosts({ replace: true });
  },

  async loadCategories() {
    const currentSerial = ++categoryRequestSerial;

    try {
      const response = await fetchCommunityCategories();

      if (!isPageActive || currentSerial !== categoryRequestSerial) {
        return;
      }

      this.setData({
        categories: this.mapCategoryFilters(response.items),
      });
    } catch (error) {
      if (!isPageActive || currentSerial !== categoryRequestSerial) {
        return;
      }

      this.setData({
        categories: [{ key: '', label: '全部' }],
        errorMessage: getCommunityErrorMessage(error, '社区分区加载失败，请稍后重试'),
        state: 'error',
      });
    }
  },

  async loadPosts({ replace }: { replace: boolean }) {
    const currentSerial = ++postRequestSerial;

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
      const response = await fetchCommunityPosts(this.buildQuery());

      if (!isPageActive || currentSerial !== postRequestSerial) {
        return;
      }

      const nextItems = response.items.map((item) => this.mapFeedCard(item));
      const items = replace ? nextItems : [...this.data.items, ...nextItems];
      const selectedCategory = this.data.categories.find(
        (category) => category.key === this.data.selectedCategoryKey,
      );

      this.setData({
        state: items.length > 0 ? 'success' : 'empty',
        errorMessage: '',
        items,
        nextCursor: response.nextCursor ?? '',
        hasMore: response.hasMore,
        isLoadingMore: false,
        isRefreshing: false,
        categoryDescription: `${selectedCategory?.label ?? '全部分区'} · ${
          this.data.sortFilters.find(
            (filter) => filter.key === this.data.selectedSort,
          )?.label ?? '推荐'
        }`,
      });

      lastSeenContentVersion = getCommunityVersionSnapshot().contentVersion;
      lastSeenAuthState = this.data.isAuthenticated;
    } catch (error) {
      if (!isPageActive || currentSerial !== postRequestSerial) {
        return;
      }

      this.setData({
        state: 'error',
        errorMessage: getCommunityErrorMessage(error, '社区帖子加载失败，请稍后重试'),
        items: replace ? [] : this.data.items,
        nextCursor: replace ? '' : this.data.nextCursor,
        hasMore: replace ? false : this.data.hasMore,
        isLoadingMore: false,
        isRefreshing: false,
      });
    }
  },

  async refreshPage() {
    this.setData({
      isRefreshing: true,
    });

    await Promise.allSettled([this.loadCategories(), this.loadPosts({ replace: true })]);

    if (isPageActive) {
      this.setData({
        isRefreshing: false,
      });
    }

    wx.stopPullDownRefresh();
  },

  async loadMore() {
    if (!this.data.hasMore || !this.data.nextCursor || this.data.isLoadingMore) {
      return;
    }

    await this.loadPosts({ replace: false });
  },

  handleRetry() {
    void this.loadInitialData(true);
  },

  handleLogin() {
    redirectToLogin('/pages/community/index');
  },

  handleCreatePost() {
    if (!this.syncAuthState()) {
      redirectToLogin('/pages/community/index');
      return;
    }

    wx.navigateTo({
      url: '/pages/community/create',
    });
  },

  handleCategoryTap(
    event: WechatMiniprogram.BaseEvent<{ categoryKey?: string }>,
  ) {
    const categoryKey = normalizeCommunityCategoryKey(
      event.currentTarget.dataset.categoryKey,
    );
    const normalizedKey =
      event.currentTarget.dataset.categoryKey === '' ? '' : categoryKey;

    if (normalizedKey === this.data.selectedCategoryKey) {
      return;
    }

    this.setData({
      selectedCategoryKey: normalizedKey,
    });

    void this.loadPosts({ replace: true });
  },

  handleSortTap(
    event: WechatMiniprogram.BaseEvent<{ sortKey?: CommunityPostSort }>,
  ) {
    const sortKey = event.currentTarget.dataset.sortKey;

    if (
      !sortKey ||
      !this.data.sortFilters.some((filter) => filter.key === sortKey) ||
      sortKey === this.data.selectedSort
    ) {
      return;
    }

    this.setData({ selectedSort: sortKey });
    void this.loadPosts({ replace: true });
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

  buildQuery() {
    const query: CommunityPostsQuery = {
      limit: PAGE_LIMIT,
      sort: this.data.selectedSort,
    };

    if (this.data.selectedCategoryKey) {
      query.categoryKey = this.data.selectedCategoryKey;
    }

    if (this.data.nextCursor) {
      query.cursor = this.data.nextCursor;
    }

    return query;
  },

  mapCategoryFilters(categories: CommunityCategory[]) {
    return [{ key: '', label: '全部' }].concat(
      categories.map((category) => ({
        key: category.key,
        label: category.name,
      })),
    );
  },

  mapFeedCard(item: CommunityPostListItem) {
    const authorName = item.author.nickname?.trim() || '社区用户';
    const authorInitial = authorName.slice(0, 1) || '互';

    return {
      ...item,
      authorName,
      authorInitial,
      createdAtText: formatCommunityTimestamp(item.createdAt),
      favoriteCountText: String(Math.max(0, item.favoriteCount)),
      likeCountText: String(Math.max(0, item.likeCount)),
      commentCountText: String(Math.max(0, item.commentCount)),
      viewCountText: String(Math.max(0, item.viewCount)),
      hasImages: item.imagePreview.length > 0,
    };
  },
});
