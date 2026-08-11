import type { UserFollowListItem, UserFollowListMode } from '../../types/user';
import { getAuthStateSummary } from '../../utils/auth';
import { isUuid } from '../../utils/validation';
import { fetchUserFollowList, getUserErrorMessage } from '../../utils/user';

type PageState = 'loading' | 'success' | 'empty' | 'error';

type FollowListCard = UserFollowListItem & {
  displayName: string;
  profileInitial: string;
  ratingText: string;
};

type FollowListPageData = {
  state: PageState;
  userId: string;
  mode: UserFollowListMode;
  titleText: string;
  errorMessage: string;
  items: FollowListCard[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
  isLoadingMore: boolean;
};

type FollowListPageMethods = {
  loadList(options: { replace: boolean }): Promise<void>;
  handleRetry(): void;
  handleOpenUser(
    event: WechatMiniprogram.BaseEvent<{ userId?: string }>,
  ): void;
};

const PAGE_SIZE = 20;

let isPageActive = false;
let requestSerial = 0;

function getDisplayName(item: UserFollowListItem) {
  return item.nickname?.trim() || '微信用户';
}

function getProfileInitial(item: UserFollowListItem) {
  return getDisplayName(item).slice(0, 1) || '人';
}

function getModeTitle(mode: UserFollowListMode) {
  return mode === 'followers' ? '粉丝' : '关注';
}

Page<FollowListPageData, FollowListPageMethods>({
  data: {
    state: 'loading',
    userId: '',
    mode: 'following',
    titleText: '关注',
    errorMessage: '',
    items: [],
    page: 1,
    pageSize: PAGE_SIZE,
    total: 0,
    totalPages: 0,
    hasMore: false,
    isLoadingMore: false,
  },

  onLoad(query) {
    isPageActive = true;

    const userId =
      typeof query.userId === 'string' ? decodeURIComponent(query.userId) : '';
    const mode =
      query.mode === 'followers' || query.mode === 'following'
        ? query.mode
        : 'following';

    if (!isUuid(userId)) {
      this.setData({
        state: 'error',
        errorMessage: '用户参数无效，请返回后重试',
      });
      return;
    }

    const titleText = getModeTitle(mode);
    this.setData({
      userId,
      mode,
      titleText,
    });
    wx.setNavigationBarTitle({
      title: titleText,
    });

    void this.loadList({ replace: true });
  },

  onShow() {
    isPageActive = true;
  },

  onUnload() {
    isPageActive = false;
    requestSerial += 1;
  },

  onPullDownRefresh() {
    void this.loadList({ replace: true }).finally(() => {
      wx.stopPullDownRefresh();
    });
  },

  onReachBottom() {
    if (!this.data.hasMore || this.data.isLoadingMore) {
      return;
    }

    void this.loadList({ replace: false });
  },

  async loadList({ replace }: { replace: boolean }) {
    if (!this.data.userId) {
      return;
    }

    const currentSerial = ++requestSerial;
    const nextPage = replace ? 1 : this.data.page + 1;

    if (replace) {
      this.setData({
        state: 'loading',
        errorMessage: '',
        items: [],
        page: 1,
        total: 0,
        totalPages: 0,
        hasMore: false,
        isLoadingMore: false,
      });
    } else {
      this.setData({
        isLoadingMore: true,
      });
    }

    try {
      const response = await fetchUserFollowList({
        userId: this.data.userId,
        mode: this.data.mode,
        page: nextPage,
        pageSize: this.data.pageSize,
      });

      if (!isPageActive || currentSerial !== requestSerial) {
        return;
      }

      const mappedItems = response.items.map((item) => ({
        ...item,
        displayName: getDisplayName(item),
        profileInitial: getProfileInitial(item),
        ratingText: String(Math.max(0, Math.floor(item.battleRating))),
      }));
      const items = replace ? mappedItems : [...this.data.items, ...mappedItems];

      this.setData({
        state: items.length > 0 ? 'success' : 'empty',
        errorMessage: '',
        items,
        page: response.pagination.page,
        pageSize: response.pagination.pageSize,
        total: response.pagination.total,
        totalPages: response.pagination.totalPages,
        hasMore:
          response.pagination.totalPages > 0 &&
          response.pagination.page < response.pagination.totalPages,
        isLoadingMore: false,
      });
    } catch (error) {
      if (!isPageActive || currentSerial !== requestSerial) {
        return;
      }

      this.setData({
        state: 'error',
        errorMessage: getUserErrorMessage(error, `${this.data.titleText}列表加载失败，请稍后重试`),
        isLoadingMore: false,
      });
    }
  },

  handleRetry() {
    void this.loadList({ replace: true });
  },

  handleOpenUser(
    event: WechatMiniprogram.BaseEvent<{ userId?: string }>,
  ) {
    const userId = event.currentTarget.dataset.userId;

    if (!userId) {
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
});
