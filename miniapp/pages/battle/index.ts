import { registerThemedPage } from '../../utils/theme-page';
import type {
  BattleLeaderboardItem,
  BattleLeaderboardResponse,
  BattleProfileResponse,
} from '../../types/battle';
import { getAuthStateSummary, redirectToLogin } from '../../utils/auth';
import {
  formatBattleInitial,
  formatBattleNickname,
  formatBattleRank,
  formatBattleRating,
  formatBattleStarDisplay,
  getBattleErrorMessage,
} from '../../utils/battle';
import { request } from '../../utils/request';
import type { CourseCapabilityResponse, ProfessionalTrack } from '../../types/course-capability';
import {
  fetchActiveBattle,
  getActiveBattlePresentation,
  guardBattleEntry,
  navigateToActiveBattle,
  type ActiveBattlePresentation,
} from '../../utils/battle-active-recovery';

type PageState = 'guest' | 'loading' | 'success' | 'empty' | 'error';
type LeaderboardScope = string;
type TrackOption = ProfessionalTrack & { courseCountText: string; questionCountText: string };

type LeaderboardRow = {
  rank: number;
  userId: string;
  avatarUrl: string | null;
  nicknameText: string;
  avatarFallbackText: string;
  rankText: string;
  ratingText: string;
  totalBattlesText: string;
  starSlots: ReturnType<typeof formatBattleStarDisplay>['starSlots'];
  starAriaLabel: string;
  winRateText: string;
  rankClassName: string;
  isCurrentUser: boolean;
};

type MyRankCard = {
  avatarUrl: string | null;
  avatarFallbackText: string;
  nicknameText: string;
  rankText: string;
  ratingText: string;
  totalBattlesText: string;
  starSlots: ReturnType<typeof formatBattleStarDisplay>['starSlots'];
  starAriaLabel: string;
};

type BattlePageData = {
  state: PageState;
  isAuthenticated: boolean;
  errorMessage: string;
  rankings: LeaderboardRow[];
  myRank: MyRankCard | null;
  leaderboardScope: LeaderboardScope;
  leaderboardTitle: string;
  leaderboardSubtitle: string;
  leaderboardRatingLabel: string;
  leaderboardBattlesLabel: string;
  activeBattle: ActiveBattlePresentation | null;
  isCheckingBattleEntry: boolean;
  tracks: TrackOption[];
  selectedTrackKey: string;
};

type BattlePageMethods = {
  syncAuthState(): boolean;
  loadBattleHome(): Promise<void>;
  handleLogin(): void;
  handleRetry(): void;
  handleRandomMatch(): void;
  handleFriendBattle(): void;
  handleHistory(): void;
  handleRecoverBattle(): void;
  handleLeaderboardScopeChange(
    event: WechatMiniprogram.BaseEvent<{ scope?: LeaderboardScope }>,
  ): void;
  openBattlePage(path: string, guardActiveBattle?: boolean): Promise<void>;
  mapLeaderboardItem(item: BattleLeaderboardItem): LeaderboardRow;
  mapMyRank(profile: BattleProfileResponse, leaderboard: BattleLeaderboardResponse): MyRankCard;
  getReadableErrorMessage(error: unknown): string;
};

const LEADERBOARD_LIMIT = 20;

let isPageActive = false;
let isRequesting = false;
let requestSerial = 0;

registerThemedPage<BattlePageData, BattlePageMethods>({
  data: {
    state: 'guest',
    isAuthenticated: false,
    errorMessage: '',
    rankings: [],
    myRank: null,
    leaderboardScope: '',
    leaderboardTitle: '大数据专业榜',
    leaderboardSubtitle: '按大数据专业对战积分排名',
    leaderboardRatingLabel: '大数据积分',
    leaderboardBattlesLabel: '大数据场次',
    activeBattle: null,
    isCheckingBattleEntry: false,
    tracks: [],
    selectedTrackKey: '',
  },

  onLoad() {
    isPageActive = true;
    void this.loadBattleHome();
  },

  onShow() {
    isPageActive = true;
    void this.loadBattleHome();
  },

  onUnload() {
    isPageActive = false;
    requestSerial += 1;
  },

  onPullDownRefresh() {
    void this.loadBattleHome().finally(() => {
      wx.stopPullDownRefresh();
    });
  },

  syncAuthState() {
    const isAuthenticated = getAuthStateSummary().isAuthenticated;

    this.setData({
      isAuthenticated,
    });

    return isAuthenticated;
  },

  async loadBattleHome() {
    if (!this.syncAuthState()) {
      if (!isPageActive) {
        return;
      }

      this.setData({
        state: 'guest',
        errorMessage: '',
        rankings: [],
        myRank: null,
        activeBattle: null,
      });
      return;
    }

    if (isRequesting) {
      return;
    }

    const currentRequestSerial = ++requestSerial;
    isRequesting = true;

    this.setData({
      state: 'loading',
      errorMessage: '',
    });

    try {
      const activeBattle = await fetchActiveBattle().catch(() => null);

      if (!isPageActive || currentRequestSerial !== requestSerial) {
        return;
      }

      this.setData({
        activeBattle: activeBattle
          ? getActiveBattlePresentation(activeBattle)
          : null,
      });

      const [profile, capabilities] = await Promise.all([
        request<BattleProfileResponse>({
          url: '/battles/profile',
          method: 'GET',
          authMode: 'required',
        }),
        request<CourseCapabilityResponse>({ url: '/course-capabilities', method: 'GET', authMode: 'auto' }),
      ]);

      const trackOptions = capabilities.tracks.map((track) => {
        const courses = capabilities.items.filter(
          (course) => course.professionalTracks.includes(track.trackKey) && course.supportsBattle,
        );
        return {
          ...track,
          courseCountText: `${courses.length} 门课程`,
          questionCountText: `${courses.reduce((sum, course) => sum + course.battleQuestionCount, 0)} 道题`,
        };
      });
      const selectedTrackKey = trackOptions.some((track) => track.trackKey === this.data.selectedTrackKey)
        ? this.data.selectedTrackKey
        : profile.defaultTrackKey && trackOptions.some((track) => track.trackKey === profile.defaultTrackKey)
          ? profile.defaultTrackKey
          : trackOptions[0]?.trackKey ?? 'big-data';
      const selectedTrack = trackOptions.find((track) => track.trackKey === selectedTrackKey);
      const leaderboard = await request<BattleLeaderboardResponse>({
        url: '/battles/leaderboard',
        method: 'GET',
        data: { page: 1, pageSize: LEADERBOARD_LIMIT, professionalTrackKey: selectedTrackKey },
        authMode: 'required',
      });

      if (!isPageActive || currentRequestSerial !== requestSerial) {
        return;
      }

      const rankings = leaderboard.items
        .slice(0, LEADERBOARD_LIMIT)
        .map((item) => this.mapLeaderboardItem(item));

      this.setData({
        state: rankings.length > 0 ? 'success' : 'empty',
        errorMessage: '',
        rankings,
        myRank: this.mapMyRank(profile, leaderboard),
        tracks: trackOptions,
        selectedTrackKey,
        leaderboardScope: selectedTrackKey,
        leaderboardTitle: `${selectedTrack?.shortName ?? '专业'}专业榜`,
        leaderboardSubtitle: `按${selectedTrack?.shortName ?? '所选专业方向'}对战积分排名`,
        leaderboardRatingLabel: `${selectedTrack?.shortName ?? '专业'}积分`,
        leaderboardBattlesLabel: `${selectedTrack?.shortName ?? '专业'}场次`,
        activeBattle: activeBattle
          ? getActiveBattlePresentation(activeBattle)
          : null,
      });
    } catch (error) {
      if (!isPageActive || currentRequestSerial !== requestSerial) {
        return;
      }

      this.setData({
        state: 'error',
        errorMessage: this.getReadableErrorMessage(error),
        rankings: [],
        myRank: null,
      });
    } finally {
      isRequesting = false;
    }
  },

  handleLogin() {
    redirectToLogin('/pages/battle/index');
  },

  handleRetry() {
    void this.loadBattleHome();
  },

  handleRandomMatch() {
    void this.openBattlePage('/pages/battle/matchmaking', true);
  },

  handleFriendBattle() {
    void this.openBattlePage('/pages/battle/friend-room', true);
  },

  handleHistory() {
    void this.openBattlePage('/pages/battle/history');
  },

  handleRecoverBattle() {
    if (this.data.activeBattle) {
      navigateToActiveBattle(this.data.activeBattle.battle);
    }
  },

  handleLeaderboardScopeChange(event: WechatMiniprogram.BaseEvent<{ scope?: LeaderboardScope }>) {
    const scope = event.currentTarget.dataset.scope;

    if (!scope || scope === this.data.leaderboardScope || isRequesting) {
      return;
    }

    this.setData({
      leaderboardScope: scope,
      selectedTrackKey: scope,
      leaderboardTitle: '专业榜',
      leaderboardSubtitle: '按所选专业方向对战积分排名',
      leaderboardRatingLabel: '专业积分',
      leaderboardBattlesLabel: '专业场次',
      myRank: null,
    });
    void this.loadBattleHome();
  },

  async openBattlePage(path: string, guardActiveBattle = false) {
    if (!this.data.isAuthenticated) {
      redirectToLogin('/pages/battle/index');
      return;
    }

    if (guardActiveBattle) {
      if (this.data.isCheckingBattleEntry) {
        return;
      }

      this.setData({ isCheckingBattleEntry: true });
      const canContinue = await guardBattleEntry();
      this.setData({ isCheckingBattleEntry: false });

      if (!canContinue) {
        return;
      }
    }

    wx.navigateTo({
      url: path,
    });
  },

  mapLeaderboardItem(item: BattleLeaderboardItem) {
    const currentUserId = getAuthStateSummary().user?.id ?? '';

    return {
      rank: item.rank,
      userId: item.userId,
      avatarUrl: item.avatarUrl,
      nicknameText: formatBattleNickname(item.nickname),
      avatarFallbackText: formatBattleInitial(item.nickname),
      rankText: formatBattleRank(item.rank),
      ratingText: formatBattleRating(item.rating),
      totalBattlesText: String(Math.max(0, item.rankedBattles)),
      ...formatBattleStarDisplay(item.star),
      winRateText: `${item.winRate.toFixed(1)}%`,
      rankClassName: item.rank <= 3 ? `rank-${item.rank}` : 'rank-default',
      isCurrentUser: item.userId === currentUserId,
    };
  },

  mapMyRank(profile: BattleProfileResponse, leaderboard: BattleLeaderboardResponse) {
    const user = getAuthStateSummary().user;
    const currentItem = leaderboard.items.find((item) => item.userId === user?.id);
    const rating = leaderboard.myRating;
    const totalBattles = currentItem
      ? Math.max(0, currentItem.wins) +
        Math.max(0, currentItem.losses) +
        Math.max(0, currentItem.draws)
      : 0;

    const star = currentItem?.star ?? null;

    return {
      avatarUrl: user?.avatarUrl ?? null,
      avatarFallbackText: formatBattleInitial(user?.nickname ?? null),
      nicknameText: user?.nickname?.trim() || '微信用户',
      rankText: formatBattleRank(leaderboard.myRank),
      ratingText: rating === null ? '未定级' : formatBattleRating(rating),
      totalBattlesText: String(totalBattles),
      ...formatBattleStarDisplay(star),
    };
  },

  getReadableErrorMessage(error: unknown) {
    return getBattleErrorMessage(error, {
      unauthorized: '登录状态已失效，请重新登录后查看对战排行。',
      network: '网络连接失败，请检查网络后重试。',
      fallback: '对战首页加载失败，请稍后重试。',
    });
  },
});
