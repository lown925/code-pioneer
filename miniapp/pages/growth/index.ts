import { registerThemedPage } from "../../utils/theme-page";
import type {
  GrowthChapterPerformance,
  GrowthOverviewResponse,
  GrowthProfileSummary,
  GrowthRange,
  GrowthRecommendation,
  GrowthRatingTrendPoint,
  GrowthTrendPoint,
} from "../../types/growth";
import { getAuthStateSummary, redirectToLogin } from "../../utils/auth";
import {
  CAREER_DIRECTION_OPTIONS,
  GRADE_OPTIONS,
  LEARNING_DIRECTION_OPTIONS,
  MAJOR_OPTIONS,
  TECHNICAL_INTEREST_OPTIONS,
  getGrowthValueLabel,
} from "../../utils/growth-profile";
import {
  fetchGrowthOverview,
  formatGrowthPercent,
  isAllowedGrowthTargetPath,
} from "../../utils/growth";
import { getUserErrorMessage } from "../../utils/user";

type GrowthPageState = "guest" | "loading" | "success" | "error";

type GrowthActivityItem = {
  label: string;
  value: string;
  detail: string;
};

type GrowthChapterView = GrowthChapterPerformance & {
  scoreText: string;
  sampleText: string;
  statusText: string;
  barWidth: string;
  isBarEmpty: boolean;
};

type GrowthRecommendationView = GrowthRecommendation & {
  priorityText: string;
};

type GrowthRatingView = GrowthRatingTrendPoint & {
  dateText: string;
  ratingText: string;
  deltaText: string;
  deltaClass: "up" | "down" | "flat";
  barWidth: string;
};

type GrowthPageData = {
  state: GrowthPageState;
  errorMessage: string;
  overview: GrowthOverviewResponse | null;
  profile: GrowthProfileSummary | null;
  range: GrowthRange;
  rangeText: string;
  isRefreshing: boolean;
  dataStateText: string;
  activityItems: GrowthActivityItem[];
  chapterItems: GrowthChapterView[];
  trend: GrowthTrendPoint[];
  recommendations: GrowthRecommendationView[];
  hasRecommendations: boolean;
  hasActivityData: boolean;
  hasPerformanceData: boolean;
  hasQuizData: boolean;
  hasPracticeData: boolean;
  hasChapterData: boolean;
  hasTrendData: boolean;
  hasWrongData: boolean;
  hasBattleData: boolean;
  hasRatingTrend: boolean;
  profileMajorText: string;
  profileGradeText: string;
  profileDirectionText: string;
  profileInterestTexts: string[];
  profileCareerText: string;
  profileActionText: string;
  quizAttemptText: string;
  quizAnsweredText: string;
  quizCorrectText: string;
  quizAccuracyText: string;
  practiceAttemptText: string;
  practiceCompletedText: string;
  practiceAnsweredText: string;
  practiceCorrectText: string;
  practiceAccuracyText: string;
  wrongQuestionText: string;
  wrongAttemptText: string;
  repeatedWrongText: string;
  pythonRatingText: string;
  rankedBattleText: string;
  trainingBattleText: string;
  friendBattleText: string;
  ratingTrend: GrowthRatingView[];
};

type GrowthPageMethods = {
  loadOverview(): Promise<void>;
  handleLogin(): void;
  handleRetry(): void;
  handleEditProfile(): void;
  handleRangeChange(
    event: WechatMiniprogram.BaseEvent<{ range?: GrowthRange }>,
  ): void;
  handleRecommendationTap(
    event: WechatMiniprogram.BaseEvent<{ path?: string }>,
  ): void;
  applyOverview(overview: GrowthOverviewResponse): void;
};

let isPageActive = false;
let requestSerial = 0;

const RANGE_LABELS: Record<GrowthRange, string> = {
  "7d": "最近 7 天",
  "30d": "最近 30 天",
};

function statusText(status: GrowthChapterPerformance["status"]) {
  switch (status) {
    case "NOT_STARTED":
      return "尚未开始";
    case "NO_SAMPLE":
      return "暂无答题样本";
    case "INSUFFICIENT_SAMPLE":
      return "样本不足";
    case "ASSESSED":
      return "可评估";
    default:
      return "暂无数据";
  }
}

function dataStateText(state: GrowthOverviewResponse["dataState"]) {
  switch (state) {
    case "READY":
      return "分析已建立";
    case "PARTIAL":
      return "数据正在积累";
    case "NO_DATA":
      return "等待学习数据";
    default:
      return "等待学习数据";
  }
}

function priorityText(priority: GrowthRecommendation["priority"]) {
  switch (priority) {
    case "HIGH":
      return "优先";
    case "MEDIUM":
      return "建议";
    case "LOW":
      return "探索";
    default:
      return "建议";
  }
}

function chapterView(chapter: GrowthChapterPerformance): GrowthChapterView {
  const score = chapter.masteryScore ?? chapter.accuracy;
  const isBarEmpty = score === null || chapter.status !== "ASSESSED";

  return {
    ...chapter,
    scoreText: score === null ? "暂无数据" : `${Math.round(score)}%`,
    sampleText: `${chapter.answeredCount} 题`,
    statusText: statusText(chapter.status),
    barWidth: score === null ? "0%" : `${Math.max(4, Math.min(100, score))}%`,
    isBarEmpty,
  };
}

function ratingTrendView(points: GrowthRatingTrendPoint[]): GrowthRatingView[] {
  if (points.length === 0) {
    return [];
  }

  const values = points.flatMap((point) => [
    point.ratingBefore,
    point.ratingAfter,
  ]);
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  const span = Math.max(1, maximum - minimum);

  return points.map((point) => {
    const deltaClass =
      point.ratingDelta > 0 ? "up" : point.ratingDelta < 0 ? "down" : "flat";
    const barWidth = `${Math.round(20 + ((point.ratingAfter - minimum) / span) * 80)}%`;

    return {
      ...point,
      dateText: point.createdAt.slice(5, 10),
      ratingText: String(point.ratingAfter),
      deltaText:
        point.ratingDelta > 0
          ? `+${point.ratingDelta}`
          : String(point.ratingDelta),
      deltaClass,
      barWidth,
    };
  });
}

registerThemedPage<GrowthPageData, GrowthPageMethods>({
  data: {
    state: "loading",
    errorMessage: "",
    overview: null,
    profile: null,
    range: "7d",
    rangeText: RANGE_LABELS["7d"],
    isRefreshing: false,
    dataStateText: "等待学习数据",
    activityItems: [],
    chapterItems: [],
    trend: [],
    recommendations: [],
    hasRecommendations: false,
    hasActivityData: false,
    hasPerformanceData: false,
    hasQuizData: false,
    hasPracticeData: false,
    hasChapterData: false,
    hasTrendData: false,
    hasWrongData: false,
    hasBattleData: false,
    hasRatingTrend: false,
    profileMajorText: "未设置",
    profileGradeText: "未设置",
    profileDirectionText: "未设置",
    profileInterestTexts: [],
    profileCareerText: "未设置",
    profileActionText: "完善学习画像",
    quizAttemptText: "0 次",
    quizAnsweredText: "0 题",
    quizCorrectText: "0 题正确",
    quizAccuracyText: "暂无数据",
    practiceAttemptText: "0 次",
    practiceCompletedText: "0 次完成",
    practiceAnsweredText: "0 题",
    practiceCorrectText: "0 题正确",
    practiceAccuracyText: "暂无数据",
    wrongQuestionText: "0 道",
    wrongAttemptText: "0 次",
    repeatedWrongText: "0 道",
    pythonRatingText: "暂无 Rating",
    rankedBattleText: "0 场",
    trainingBattleText: "0 场",
    friendBattleText: "0 场",
    ratingTrend: [],
  },

  onShow() {
    isPageActive = true;
    void this.loadOverview();
  },

  onUnload() {
    isPageActive = false;
    requestSerial += 1;
  },

  onPullDownRefresh() {
    void this.loadOverview().finally(() => wx.stopPullDownRefresh());
  },

  async loadOverview() {
    if (!getAuthStateSummary().isAuthenticated) {
      this.setData({
        state: "guest",
        errorMessage: "",
        overview: null,
        profile: null,
      });
      return;
    }

    const currentSerial = ++requestSerial;
    this.setData({
      state: this.data.overview ? "success" : "loading",
      isRefreshing: true,
      errorMessage: "",
    });

    try {
      const overview = await fetchGrowthOverview(this.data.range);

      if (!isPageActive || currentSerial !== requestSerial) {
        return;
      }

      this.applyOverview(overview);
    } catch (error) {
      if (!isPageActive || currentSerial !== requestSerial) {
        return;
      }

      this.setData({
        state: "error",
        isRefreshing: false,
        errorMessage: getUserErrorMessage(
          error,
          "成长分析加载失败，请稍后重试",
        ),
      });
    }
  },

  handleLogin() {
    redirectToLogin("/pages/growth/index");
  },

  handleRetry() {
    void this.loadOverview();
  },

  handleEditProfile() {
    wx.navigateTo({ url: "/pages/growth/profile" });
  },

  handleRangeChange(
    event: WechatMiniprogram.BaseEvent<{ range?: GrowthRange }>,
  ) {
    const range = event.currentTarget.dataset.range;
    if (range !== "7d" && range !== "30d") {
      return;
    }

    if (range === this.data.range) {
      return;
    }

    this.setData({
      range,
      rangeText: RANGE_LABELS[range],
    });
    void this.loadOverview();
  },

  handleRecommendationTap(
    event: WechatMiniprogram.BaseEvent<{ path?: string }>,
  ) {
    const path = event.currentTarget.dataset.path;
    if (!path || !isAllowedGrowthTargetPath(path)) {
      return;
    }

    if (path === "/pages/learning/index" || path === "/pages/battle/index") {
      wx.switchTab({ url: path });
      return;
    }

    wx.navigateTo({ url: path });
  },

  applyOverview(overview: GrowthOverviewResponse) {
    const profile = overview.profile;
    const chapterItems = overview.competency.chapters.map(chapterView);
    const activity = overview.activity;
    const quiz = overview.learning.quiz;
    const practice = overview.learning.practice;
    const wrongQuestions = overview.wrongQuestions;
    const battle = overview.battle;
    const ratingTrend = ratingTrendView(battle.ratingTrend);
    const activityItems = [
      activity.activeDays > 0
        ? {
            label: "活跃天数",
            value: String(activity.activeDays),
            detail: this.data.range === "7d" ? "/ 7 天" : "/ 30 天",
          }
        : null,
      activity.completedChapters > 0
        ? {
            label: "完成章节",
            value: String(activity.completedChapters),
            detail: "个章节",
          }
        : null,
      activity.quizAttempts > 0
        ? {
            label: "Quiz",
            value: String(activity.quizAttempts),
            detail: "次提交",
          }
        : null,
      activity.practiceAttempts > 0
        ? {
            label: "Practice",
            value: String(activity.practiceAttempts),
            detail: "次练习",
          }
        : null,
      activity.battleCount > 0
        ? {
            label: "Battle",
            value: String(activity.battleCount),
            detail: "场完成",
          }
        : null,
    ].filter((item): item is GrowthActivityItem => item !== null);

    this.setData({
      state: "success",
      isRefreshing: false,
      errorMessage: "",
      overview,
      profile,
      dataStateText: dataStateText(overview.dataState),
      activityItems,
      chapterItems,
      trend: overview.learning.trend,
      recommendations: overview.recommendations.map(
        (item: GrowthRecommendation) => ({
          ...item,
          priorityText: priorityText(item.priority),
        }),
      ),
      hasRecommendations: overview.recommendations.length > 0,
      hasActivityData:
        activity.activeDays > 0 ||
        activity.completedChapters > 0 ||
        activity.quizAttempts > 0 ||
        activity.practiceAttempts > 0 ||
        activity.battleCount > 0,
      hasPerformanceData:
        quiz.attemptCount > 0 ||
        practice.attemptCount > 0 ||
        chapterItems.length > 0,
      hasQuizData: quiz.attemptCount > 0 || quiz.answeredCount > 0,
      hasPracticeData: practice.attemptCount > 0 || practice.answeredCount > 0,
      hasChapterData: chapterItems.length > 0,
      hasTrendData: overview.learning.trend.some(
        (item: GrowthTrendPoint) =>
          item.quizAccuracy !== null ||
          item.practiceAccuracy !== null ||
          item.activityCount > 0,
      ),
      hasWrongData: wrongQuestions.totalWrongAttempts > 0,
      hasBattleData:
        battle.rankedBattles + battle.trainingBattles + battle.friendBattles >
        0,
      hasRatingTrend: ratingTrend.length > 0,
      profileMajorText: getGrowthValueLabel(profile.major, MAJOR_OPTIONS),
      profileGradeText: getGrowthValueLabel(profile.grade, GRADE_OPTIONS),
      profileDirectionText: getGrowthValueLabel(
        profile.learningDirection,
        LEARNING_DIRECTION_OPTIONS,
      ),
      profileInterestTexts: (profile.technicalInterests ?? []).map(
        (value: string) =>
          getGrowthValueLabel(value, TECHNICAL_INTEREST_OPTIONS),
      ),
      profileCareerText: getGrowthValueLabel(
        profile.careerDirection,
        CAREER_DIRECTION_OPTIONS,
      ),
      profileActionText: profile.isCoreProfileComplete
        ? "编辑学习画像"
        : "完善学习画像",
      quizAttemptText: `${quiz.attemptCount} 次`,
      quizAnsweredText: `${quiz.answeredCount} 题`,
      quizCorrectText: `${quiz.correctCount} 题正确`,
      quizAccuracyText: formatGrowthPercent(quiz.accuracy),
      practiceAttemptText: `${practice.attemptCount} 次尝试`,
      practiceCompletedText: `${practice.completedAttemptCount} 次完成`,
      practiceAnsweredText: `${practice.answeredCount} 题`,
      practiceCorrectText: `${practice.correctCount} 题正确`,
      practiceAccuracyText: formatGrowthPercent(practice.accuracy),
      wrongQuestionText: `${wrongQuestions.uniqueWrongQuestions} 道`,
      wrongAttemptText: `${wrongQuestions.totalWrongAttempts} 次`,
      repeatedWrongText: `${wrongQuestions.repeatedWrongQuestions} 道`,
      pythonRatingText:
        battle.currentPythonRating === null
          ? "暂无 Rating"
          : String(battle.currentPythonRating),
      rankedBattleText: `${battle.rankedBattles} 场`,
      trainingBattleText: `${battle.trainingBattles} 场`,
      friendBattleText: `${battle.friendBattles} 场`,
      ratingTrend,
    });
  },
});
