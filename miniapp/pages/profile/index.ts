import type { AuthUserProfile } from '../../types/auth';
import type { BattleProfileResponse } from '../../types/battle';
import type {
  CommunityPostDetail,
  CommunitySummaryResponse,
} from '../../types/community';
import type { WrongQuestionStatisticsResponse } from '../../types/wrong-question';
import {
  clearAuthSession,
  getAuthStateSummary,
  isDevelopmentEnvironment,
  redirectToLogin,
} from '../../utils/auth';
import {
  fetchMyCommunityPosts,
  fetchMyCommunitySummary,
  formatCommunityTimestamp,
  getCommunityErrorMessage,
} from '../../utils/community';
import { request, RequestError } from '../../utils/request';
import { fetchUserProfile } from '../../utils/user';

type ProfileMetricKey =
  | 'battleHistory'
  | 'wrongQuestion'
  | 'favorite'
  | 'history';

type ProfileMetricCard = {
  key: ProfileMetricKey;
  title: string;
  valueText: string;
  helperText: string;
};

type ProfilePostCard = CommunityPostDetail & {
  createdAtText: string;
  favoriteCountText: string;
  commentCountText: string;
  viewCountText: string;
  categoryText: string;
};

type ProfileBattleSummary = {
  totalBattlesText: string;
  ratingText: string;
  recordText: string;
};

type ProfileCommunitySummary = {
  favoriteCountText: string;
  historyCountText: string;
  postCountText: string;
};

type ProfileWrongQuestionSummary = {
  totalWrongQuestionsText: string;
};

type ProfilePageData = {
  isAuthenticated: boolean;
  user: AuthUserProfile | null;
  displayName: string;
  profileInitial: string;
  isLoggingOut: boolean;
  showMockHint: boolean;
  followingCountText: string;
  followerCountText: string;
  battleSummary: ProfileBattleSummary | null;
  communitySummary: ProfileCommunitySummary | null;
  wrongQuestionSummary: ProfileWrongQuestionSummary | null;
  metrics: ProfileMetricCard[];
  isOverviewLoading: boolean;
  overviewErrorMessage: string;
  isPostsLoading: boolean;
  postsErrorMessage: string;
  postItems: ProfilePostCard[];
};

type ProfilePageMethods = {
  syncAuthState(): boolean;
  loadPageData(): Promise<void>;
  loadOverview(): Promise<void>;
  loadPosts(): Promise<void>;
  updateMetrics(): void;
  handleLogin(): void;
  handleOverviewRetry(): void;
  handlePostsRetry(): void;
  handleFollowEntry(): void;
  handleFansEntry(): void;
  handleMetricTap(
    event: WechatMiniprogram.BaseEvent<{ metricKey?: ProfileMetricKey }>,
  ): void;
  handleOpenAllPosts(): void;
  handleOpenPostDetail(
    event: WechatMiniprogram.BaseEvent<{ postId?: string }>,
  ): void;
  handleLearningEntry(): void;
  handleEditProfile(): void;
  handleLogout(): Promise<void>;
  mapBattleSummary(data: BattleProfileResponse): ProfileBattleSummary;
  mapCommunitySummary(data: CommunitySummaryResponse): ProfileCommunitySummary;
  mapWrongQuestionSummary(
    data: WrongQuestionStatisticsResponse,
  ): ProfileWrongQuestionSummary;
  mapPostCard(item: CommunityPostDetail): ProfilePostCard;
};

const PROFILE_POST_LIMIT = 3;

let isPageActive = false;
let overviewRequestSerial = 0;
let postsRequestSerial = 0;

function getDisplayName(user: AuthUserProfile | null) {
  return user?.nickname?.trim() || '微信用户';
}

function getProfileInitial(user: AuthUserProfile | null) {
  return getDisplayName(user).slice(0, 1) || '我';
}

function formatCount(value: number) {
  return String(Math.max(0, Math.floor(value)));
}

function formatBattleRecord(data: BattleProfileResponse) {
  return `胜 ${Math.max(0, data.wins)} / 负 ${Math.max(0, data.losses)} / 平 ${Math.max(0, data.draws)}`;
}

function getLogoutErrorMessage(error: unknown) {
  if (error instanceof RequestError || error instanceof Error) {
    return '退出接口调用失败，已清理本地登录态';
  }

  return '退出接口调用失败，已清理本地登录态';
}

Page<ProfilePageData, ProfilePageMethods>({
  data: {
    isAuthenticated: false,
    user: null,
    displayName: '游客用户',
    profileInitial: '我',
    isLoggingOut: false,
    showMockHint: false,
    followingCountText: '0',
    followerCountText: '0',
    battleSummary: null,
    communitySummary: null,
    wrongQuestionSummary: null,
    metrics: [
      {
        key: 'battleHistory',
        title: '战绩',
        valueText: '0',
        helperText: '查看 Battle 战绩',
      },
      {
        key: 'wrongQuestion',
        title: '错题',
        valueText: '0',
        helperText: '学习与 Battle 错题',
      },
      {
        key: 'favorite',
        title: '收藏',
        valueText: '0',
        helperText: '社区收藏',
      },
      {
        key: 'history',
        title: '历史',
        valueText: '0',
        helperText: '社区浏览历史',
      },
    ],
    isOverviewLoading: false,
    overviewErrorMessage: '',
    isPostsLoading: false,
    postsErrorMessage: '',
    postItems: [],
  },

  onShow() {
    isPageActive = true;
    void this.loadPageData();
  },

  onUnload() {
    isPageActive = false;
    overviewRequestSerial += 1;
    postsRequestSerial += 1;
  },

  onPullDownRefresh() {
    void this.loadPageData().finally(() => {
      wx.stopPullDownRefresh();
    });
  },

  syncAuthState() {
    const authState = getAuthStateSummary();
    const user = authState.user;

    this.setData({
      isAuthenticated: authState.isAuthenticated,
      user,
      displayName: getDisplayName(user),
      profileInitial: getProfileInitial(user),
      showMockHint: isDevelopmentEnvironment(),
    });

    return authState.isAuthenticated;
  },

  async loadPageData() {
    const isAuthenticated = this.syncAuthState();

    if (!isAuthenticated) {
      if (isPageActive) {
        this.setData({
          battleSummary: null,
          communitySummary: null,
          wrongQuestionSummary: null,
          followingCountText: '0',
          followerCountText: '0',
          postItems: [],
          isOverviewLoading: false,
          overviewErrorMessage: '',
          isPostsLoading: false,
          postsErrorMessage: '',
        });
        this.updateMetrics();
      }
      return;
    }

    await Promise.allSettled([this.loadOverview(), this.loadPosts()]);
  },

  async loadOverview() {
    const currentSerial = ++overviewRequestSerial;
    const userId = this.data.user?.id;

    this.setData({
      isOverviewLoading: true,
      overviewErrorMessage: '',
    });

    try {
      const [battleSummary, wrongQuestionSummary, communitySummary, userProfile] =
        await Promise.all([
          request<BattleProfileResponse>({
            url: '/battles/profile',
            method: 'GET',
            authMode: 'required',
          }),
          request<WrongQuestionStatisticsResponse>({
            url: '/users/me/wrong-questions/statistics',
            method: 'GET',
            authMode: 'required',
          }),
          fetchMyCommunitySummary(),
          userId ? fetchUserProfile(userId) : Promise.resolve(null),
        ]);

      if (!isPageActive || currentSerial !== overviewRequestSerial) {
        return;
      }

      this.setData({
        isOverviewLoading: false,
        overviewErrorMessage: '',
        battleSummary: this.mapBattleSummary(battleSummary),
        wrongQuestionSummary: this.mapWrongQuestionSummary(wrongQuestionSummary),
        communitySummary: this.mapCommunitySummary(communitySummary),
        followingCountText: userProfile
          ? formatCount(userProfile.followingCount)
          : '0',
        followerCountText: userProfile
          ? formatCount(userProfile.followerCount)
          : '0',
      });
      this.updateMetrics();
    } catch (error) {
      if (!isPageActive || currentSerial !== overviewRequestSerial) {
        return;
      }

      this.setData({
        isOverviewLoading: false,
        overviewErrorMessage:
          error instanceof RequestError && error.code === 'NETWORK_ERROR'
            ? '概览加载失败，请确认后端服务可用后重试'
            : '概览加载失败，请稍后重试',
      });
    }
  },

  async loadPosts() {
    const currentSerial = ++postsRequestSerial;

    this.setData({
      isPostsLoading: true,
      postsErrorMessage: '',
    });

    try {
      const response = await fetchMyCommunityPosts({
        limit: PROFILE_POST_LIMIT,
      });

      if (!isPageActive || currentSerial !== postsRequestSerial) {
        return;
      }

      this.setData({
        isPostsLoading: false,
        postsErrorMessage: '',
        postItems: response.items.map((item) => this.mapPostCard(item)),
      });
    } catch (error) {
      if (!isPageActive || currentSerial !== postsRequestSerial) {
        return;
      }

      this.setData({
        isPostsLoading: false,
        postsErrorMessage: getCommunityErrorMessage(
          error,
          '帖子加载失败，请稍后重试',
        ),
        postItems: [],
      });
    }
  },

  updateMetrics() {
    this.setData({
      metrics: [
        {
          key: 'battleHistory',
          title: '战绩',
          valueText: this.data.battleSummary?.totalBattlesText ?? '0',
          helperText: '查看 Battle 战绩',
        },
        {
          key: 'wrongQuestion',
          title: '错题',
          valueText:
            this.data.wrongQuestionSummary?.totalWrongQuestionsText ?? '0',
          helperText: '学习与 Battle 错题',
        },
        {
          key: 'favorite',
          title: '收藏',
          valueText: this.data.communitySummary?.favoriteCountText ?? '0',
          helperText: '社区收藏',
        },
        {
          key: 'history',
          title: '历史',
          valueText: this.data.communitySummary?.historyCountText ?? '0',
          helperText: '社区浏览历史',
        },
      ],
    });
  },

  handleLogin() {
    redirectToLogin('/pages/profile/index');
  },

  handleOverviewRetry() {
    void this.loadOverview();
  },

  handlePostsRetry() {
    void this.loadPosts();
  },

  handleFollowEntry() {
    const userId = this.data.user?.id;

    if (!this.data.isAuthenticated || !userId) {
      redirectToLogin('/pages/profile/index');
      return;
    }

    wx.navigateTo({
      url: `/pages/profile/follow-list?userId=${encodeURIComponent(userId)}&mode=following`,
    });
  },

  handleFansEntry() {
    const userId = this.data.user?.id;

    if (!this.data.isAuthenticated || !userId) {
      redirectToLogin('/pages/profile/index');
      return;
    }

    wx.navigateTo({
      url: `/pages/profile/follow-list?userId=${encodeURIComponent(userId)}&mode=followers`,
    });
  },

  handleMetricTap(
    event: WechatMiniprogram.BaseEvent<{ metricKey?: ProfileMetricKey }>,
  ) {
    if (!this.data.isAuthenticated) {
      redirectToLogin('/pages/profile/index');
      return;
    }

    const metricKey = event.currentTarget.dataset.metricKey;

    if (metricKey === 'battleHistory') {
      wx.navigateTo({
        url: '/pages/battle/history',
      });
      return;
    }

    if (metricKey === 'wrongQuestion') {
      wx.navigateTo({
        url: '/pages/wrong-question/index',
      });
      return;
    }

    if (metricKey === 'favorite') {
      wx.navigateTo({
        url: '/pages/profile/community-favorites',
      });
      return;
    }

    if (metricKey === 'history') {
      wx.navigateTo({
        url: '/pages/profile/community-history',
      });
    }
  },

  handleOpenAllPosts() {
    if (!this.data.isAuthenticated) {
      redirectToLogin('/pages/profile/community-posts');
      return;
    }

    wx.navigateTo({
      url: '/pages/profile/community-posts',
    });
  },

  handleOpenPostDetail(
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

  handleLearningEntry() {
    if (!this.data.isAuthenticated) {
      redirectToLogin('/pages/learning/index');
      return;
    }

    wx.switchTab({
      url: '/pages/learning/index',
    });
  },

  handleEditProfile() {
    if (!this.data.isAuthenticated) {
      redirectToLogin('/pages/profile/index');
      return;
    }

    wx.navigateTo({
      url: '/pages/profile/edit',
    });
  },

  async handleLogout() {
    if (!this.data.isAuthenticated || this.data.isLoggingOut) {
      return;
    }

    let toastMessage = '已退出登录';

    this.setData({
      isLoggingOut: true,
    });

    try {
      await request<Record<string, never>>({
        url: '/auth/logout',
        method: 'POST',
        authMode: 'required',
        retryOnAuthFailure: false,
        disableAuthRedirect: true,
      });
    } catch (error) {
      toastMessage = getLogoutErrorMessage(error);
    } finally {
      clearAuthSession();
      this.syncAuthState();
      if (isPageActive) {
        this.setData({
          battleSummary: null,
          communitySummary: null,
          wrongQuestionSummary: null,
          followingCountText: '0',
          followerCountText: '0',
          postItems: [],
          isLoggingOut: false,
          isOverviewLoading: false,
          overviewErrorMessage: '',
          isPostsLoading: false,
          postsErrorMessage: '',
        });
        this.updateMetrics();
      }

      wx.showToast({
        title: toastMessage,
        icon: 'none',
      });
    }
  },

  mapBattleSummary(data: BattleProfileResponse) {
    return {
      totalBattlesText: formatCount(data.totalBattles),
      ratingText: formatCount(data.rating),
      recordText: formatBattleRecord(data),
    };
  },

  mapCommunitySummary(data: CommunitySummaryResponse) {
    return {
      favoriteCountText: formatCount(data.favoriteCount),
      historyCountText: formatCount(data.historyCount),
      postCountText: formatCount(data.postCount),
    };
  },

  mapWrongQuestionSummary(data: WrongQuestionStatisticsResponse) {
    return {
      totalWrongQuestionsText: formatCount(data.totalWrongQuestions),
    };
  },

  mapPostCard(item: CommunityPostDetail) {
    return {
      ...item,
      createdAtText: formatCommunityTimestamp(item.createdAt),
      favoriteCountText: formatCount(item.favoriteCount),
      commentCountText: formatCount(item.commentCount),
      viewCountText: formatCount(item.viewCount),
      categoryText: item.category.name?.trim() || '综合交流',
    };
  },
});
