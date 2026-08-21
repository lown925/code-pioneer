import { registerThemedPage } from "../../utils/theme-page";
import type {
  GrowthBattleSkillSummary,
  GrowthBattleTrackSummary,
  GrowthChapterPerformance,
  GrowthNextCourseRecommendation,
  GrowthProfessionalRouteNode,
  GrowthLearningGoal,
  GrowthOverviewResponse,
  GrowthProfileSummary,
  GrowthRange,
  GrowthRecommendation,
  GrowthTrendPoint,
  GrowthWrongArea,
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
  cancelGrowthGoal,
  createGrowthGoal,
  fetchGrowthCourses,
  formatGrowthPercent,
  isAllowedGrowthTargetPath,
  updateGrowthGoal,
} from "../../utils/growth";
import type { CourseListItem } from "../../types/course";
import { getUserErrorMessage } from "../../utils/user";

type GrowthPageState = "guest" | "loading" | "success" | "error";

type GrowthChapterView = GrowthChapterPerformance & {
  scoreText: string;
  sampleText: string;
  statusText: string;
  barWidth: string;
};

type GrowthRecommendationView = GrowthRecommendation & {
  priorityText: string;
};

type GrowthWrongAreaView = GrowthWrongArea & {
  wrongText: string;
  barWidth: string;
};

type GrowthCourseOption = { id: string; title: string };
type RatingChartPoint = { label: string; value: number | null };

type GrowthPageData = {
  state: GrowthPageState;
  errorMessage: string;
  overview: GrowthOverviewResponse | null;
  profile: GrowthProfileSummary | null;
  range: GrowthRange;
  rangeText: string;
  isRefreshing: boolean;
  chapterItems: GrowthChapterView[];
  trend: GrowthTrendPoint[];
  recommendations: GrowthRecommendationView[];
  hasRecommendations: boolean;
  continueLearning: GrowthOverviewResponse["learning"]["continueLearning"];
  nextRecommendation: GrowthNextCourseRecommendation | null;
  professionalRoute: GrowthProfessionalRouteNode[];
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
  rankedBattleText: string;
  trainingBattleText: string;
  friendBattleText: string;
  goal: GrowthLearningGoal | null;
  goalProgressWidth: string;
  goalTargetText: string;
  goalStatusText: string;
  goalPaceText: string;
  goalRemainingText: string;
  goalCadenceText: string;
  goalEditorOpen: boolean;
  isGoalSaving: boolean;
  goalCourses: GrowthCourseOption[];
  goalCourseLabels: string[];
  goalCourseIndex: number;
  goalFormCourseId: string;
  goalFormTargetDate: string;
  wrongCourseFilters: GrowthCourseOption[];
  selectedWrongCourseId: string;
  wrongAreaItems: GrowthWrongAreaView[];
  selectedSkillCode: string;
  selectedSkill: GrowthBattleSkillSummary | null;
  skillItems: GrowthBattleSkillSummary[];
  selectedTrackKey: string;
  selectedTrack: GrowthBattleTrackSummary | null;
  trackItems: GrowthBattleTrackSummary[];
  ratingChartPoints: RatingChartPoint[];
  currentRatingText: string;
  highestRatingText: string;
  ratingNetChangeText: string;
  ratingEmptyText: string;
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
  handleSkillChange(
    event: WechatMiniprogram.BaseEvent<{ code?: string }>,
  ): void;
  handleTrackChange(
    event: WechatMiniprogram.BaseEvent<{ trackKey?: string }>,
  ): void;
  handleWrongCourseChange(
    event: WechatMiniprogram.BaseEvent<{ courseId?: string }>,
  ): void;
  openGoalEditor(): Promise<void>;
  closeGoalEditor(): void;
  handleGoalCourseChange(
    event: WechatMiniprogram.CustomEvent<{ value?: number }>,
  ): void;
  handleGoalDateChange(
    event: WechatMiniprogram.CustomEvent<{ value?: string }>,
  ): void;
  saveGoal(): Promise<void>;
  handleCancelGoal(): void;
  handleContinueGoal(): void;
  stopGoalModalTap(event: WechatMiniprogram.CustomEvent): void;
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

  return {
    ...chapter,
    scoreText: score === null ? "暂无数据" : `${Math.round(score)}%`,
    sampleText: `${chapter.answeredCount} 题`,
    statusText: statusText(chapter.status),
    barWidth: score === null ? "0%" : `${Math.max(4, Math.min(100, score))}%`,
  };
}

function tomorrowDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function buildGoalDateText(goal: GrowthLearningGoal | null) {
  return goal
    ? `${goal.targetDate.slice(0, 4)}年${Number(goal.targetDate.slice(5, 7))}月${Number(goal.targetDate.slice(8, 10))}日`
    : "";
}

function buildGoalStatusText(goal: GrowthLearningGoal | null) {
  if (!goal) return "";
  if (goal.status === "COMPLETED") return "目标已完成";
  if (goal.paceStatus === "BEHIND") return "需要加快进度";
  if (goal.paceStatus === "AHEAD") return "进度领先";
  return "进度正常";
}

function buildGoalPaceText(goal: GrowthLearningGoal | null) {
  if (!goal) return "";
  if (goal.status === "COMPLETED") return "课程章节已全部完成";
  if (goal.paceStatus === "BEHIND") return "当前进度落后于计划";
  if (goal.paceStatus === "AHEAD") return "当前进度领先于计划";
  return "当前进度与计划一致";
}

function buildGoalCadenceText(goal: GrowthLearningGoal | null) {
  if (!goal || goal.status === "COMPLETED") return "";
  if (goal.requiredChaptersPerWeek === null)
    return `截止今天还需完成 ${goal.remainingChapters} 个章节`;
  return `建议本周完成约 ${Math.max(1, Math.ceil(goal.requiredChaptersPerWeek))} 个章节`;
}

function buildWrongAreaViews(areas: GrowthWrongArea[], courseId: string) {
  const filtered =
    courseId === "ALL"
      ? areas
      : areas.filter((item) => item.courseId === courseId);
  const top = filtered.slice(0, 5);
  const maximum = Math.max(1, ...top.map((item) => item.wrongCount));
  return top.map((item) => ({
    ...item,
    wrongText: `${item.wrongCount} 次错误`,
    barWidth: `${Math.max(8, Math.round((item.wrongCount / maximum) * 100))}%`,
  }));
}

function buildRatingChartPoints(
  skill: Pick<GrowthBattleSkillSummary, "ratingTrend"> | GrowthBattleTrackSummary | null,
) {
  return (skill?.ratingTrend ?? []).map((item, index) => ({
    label: String(index + 1),
    value: item.ratingAfter,
  }));
}

function buildRatingNetChange(
  skill: Pick<GrowthBattleSkillSummary, "ratingTrend"> | GrowthBattleTrackSummary | null,
) {
  const trend = skill?.ratingTrend ?? [];
  if (trend.length === 0) return null;
  return trend[trend.length - 1].ratingAfter - trend[0].ratingBefore;
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
    chapterItems: [],
    trend: [],
    recommendations: [],
    hasRecommendations: false,
    continueLearning: null,
    nextRecommendation: null,
    professionalRoute: [],
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
    rankedBattleText: "0 场",
    trainingBattleText: "0 场",
    friendBattleText: "0 场",
    goal: null,
    goalProgressWidth: "0%",
    goalTargetText: "",
    goalStatusText: "",
    goalPaceText: "",
    goalRemainingText: "",
    goalCadenceText: "",
    goalEditorOpen: false,
    isGoalSaving: false,
    goalCourses: [],
    goalCourseLabels: [],
    goalCourseIndex: 0,
    goalFormCourseId: "",
    goalFormTargetDate: tomorrowDate(),
    wrongCourseFilters: [{ id: "ALL", title: "全部课程" }],
    selectedWrongCourseId: "ALL",
    wrongAreaItems: [],
    selectedSkillCode: "",
    selectedSkill: null,
    skillItems: [],
    selectedTrackKey: "",
    selectedTrack: null,
    trackItems: [],
    ratingChartPoints: [],
    currentRatingText: "未定级",
    highestRatingText: "暂无",
    ratingNetChangeText: "暂无",
    ratingEmptyText: "暂无该技能对战数据",
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
        goal: null,
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

  handleSkillChange(event: WechatMiniprogram.BaseEvent<{ code?: string }>) {
    const code = event.currentTarget.dataset.code;
    const skill = this.data.skillItems.find((item) => item.code === code);
    if (!skill) return;
    const ratingTrend = skill.ratingTrend ?? [];
    const netChange = buildRatingNetChange(skill);
    this.setData({
      selectedSkillCode: skill.code,
      selectedSkill: skill,
      ratingChartPoints: buildRatingChartPoints(skill),
      hasRatingTrend: ratingTrend.length > 0,
      currentRatingText:
        skill.rankedBattles > 0 && skill.rating !== null
          ? String(skill.rating)
          : "未定级",
      highestRatingText:
        skill.highestRating === null ? "暂无" : String(skill.highestRating),
      ratingNetChangeText:
        netChange === null ? "暂无" : `${netChange > 0 ? "+" : ""}${netChange}`,
      rankedBattleText: `${skill.rankedBattles} 场`,
      trainingBattleText: `${skill.trainingBattles} 场`,
      friendBattleText: `${skill.friendBattles} 场`,
      ratingEmptyText:
        skill.rankedBattles + skill.trainingBattles + skill.friendBattles === 0
          ? "暂无该技能对战数据"
          : "暂无随机匹配积分趋势",
    });
  },

  handleTrackChange(
    event: WechatMiniprogram.BaseEvent<{ trackKey?: string }>,
  ) {
    const trackKey = event.currentTarget.dataset.trackKey;
    const track = this.data.trackItems.find((item) => item.trackKey === trackKey);
    if (!track) return;
    const ratingTrend = track.ratingTrend ?? [];
    const netChange = buildRatingNetChange(track);
    this.setData({
      selectedTrackKey: track.trackKey,
      selectedTrack: track,
      ratingChartPoints: buildRatingChartPoints(track),
      hasRatingTrend: ratingTrend.length > 0,
      currentRatingText:
        track.rankedBattles > 0 && track.rating !== null
          ? String(track.rating)
          : "未定级",
      highestRatingText:
        track.highestRating === null ? "暂无" : String(track.highestRating),
      ratingNetChangeText:
        netChange === null ? "暂无" : `${netChange > 0 ? "+" : ""}${netChange}`,
      rankedBattleText: `${track.rankedBattles} 场`,
      trainingBattleText: `${track.trainingBattles} 场`,
      friendBattleText: `${track.friendBattles} 场`,
      ratingEmptyText:
        track.rankedBattles + track.trainingBattles + track.friendBattles === 0
          ? "暂无该专业对战数据"
          : "暂无专业积分趋势",
    });
  },

  handleWrongCourseChange(
    event: WechatMiniprogram.BaseEvent<{ courseId?: string }>,
  ) {
    const courseId = event.currentTarget.dataset.courseId;
    const areas = this.data.overview?.wrongQuestions.areas ?? [];
    if (courseId) {
      this.setData({
        selectedWrongCourseId: courseId,
        wrongAreaItems: buildWrongAreaViews(areas, courseId),
      });
    }
  },

  async openGoalEditor() {
    if (this.data.goalCourses.length === 0) {
      try {
        const result = await fetchGrowthCourses();
        const courses = result.items.map((item: CourseListItem) => ({
          id: item.id,
          title: item.title,
        }));
        this.setData({
          goalCourses: courses,
          goalCourseLabels: courses.map((item) => item.title),
        });
      } catch (error) {
        wx.showToast({
          title: getUserErrorMessage(error, "课程列表加载失败"),
          icon: "none",
        });
        return;
      }
    }
    const courses = this.data.goalCourses;
    if (courses.length === 0) {
      wx.showToast({ title: "暂无可学习课程", icon: "none" });
      return;
    }
    const courseId = this.data.goal?.courseId ?? courses[0].id;
    const index = Math.max(
      0,
      courses.findIndex((item) => item.id === courseId),
    );
    this.setData({
      goalEditorOpen: true,
      goalCourseIndex: index,
      goalFormCourseId: courses[index].id,
      goalFormTargetDate: this.data.goal?.targetDate ?? tomorrowDate(),
    });
  },

  closeGoalEditor() {
    if (!this.data.isGoalSaving) this.setData({ goalEditorOpen: false });
  },

  handleGoalCourseChange(
    event: WechatMiniprogram.CustomEvent<{ value?: number }>,
  ) {
    const index = Number(event.detail.value);
    const course = this.data.goalCourses[index];
    if (course)
      this.setData({ goalCourseIndex: index, goalFormCourseId: course.id });
  },

  handleGoalDateChange(
    event: WechatMiniprogram.CustomEvent<{ value?: string }>,
  ) {
    const value = String(event.detail.value ?? "");
    if (value) this.setData({ goalFormTargetDate: value });
  },

  async saveGoal() {
    if (this.data.isGoalSaving || !this.data.goalFormCourseId) return;
    this.setData({ isGoalSaving: true });
    try {
      const input = {
        courseId: this.data.goalFormCourseId,
        targetDate: this.data.goalFormTargetDate,
      };
      if (this.data.goal) await updateGrowthGoal(input);
      else await createGrowthGoal(input);
      this.setData({ goalEditorOpen: false });
      await this.loadOverview();
    } catch (error) {
      wx.showToast({
        title: getUserErrorMessage(error, "目标保存失败，请稍后重试"),
        icon: "none",
      });
    } finally {
      this.setData({ isGoalSaving: false });
    }
  },

  handleCancelGoal() {
    if (!this.data.goal || this.data.isGoalSaving) return;
    wx.showModal({
      title: "取消学习目标",
      content: "取消后不会删除课程学习记录，确定继续吗？",
      success: async (result) => {
        if (!result.confirm) return;
        this.setData({ isGoalSaving: true });
        try {
          await cancelGrowthGoal();
          await this.loadOverview();
        } catch (error) {
          wx.showToast({
            title: getUserErrorMessage(error, "目标取消失败，请稍后重试"),
            icon: "none",
          });
        } finally {
          this.setData({ isGoalSaving: false });
        }
      },
    });
  },

  handleContinueGoal() {
    const courseId = this.data.goal?.courseId;
    if (courseId)
      wx.navigateTo({
        url: `/pages/learning/course-progress?courseId=${encodeURIComponent(courseId)}`,
      });
    else wx.switchTab({ url: "/pages/learning/index" });
  },

  stopGoalModalTap(_event: WechatMiniprogram.CustomEvent) {},

  applyOverview(overview: GrowthOverviewResponse) {
    const profile = overview.profile;
    const chapterItems = overview.competency.chapters
      .filter((chapter) => chapter.status === "ASSESSED")
      .slice(0, 5)
      .map(chapterView);
    const quiz = overview.learning.quiz;
    const practice = overview.learning.practice;
    const wrongQuestions = overview.wrongQuestions;
    const battle = overview.battle;
    const skills = battle.skills ?? [];
    const tracks = battle.tracks ?? [];
    const selectedSkill =
      skills.find((item) => item.code === this.data.selectedSkillCode) ??
      skills.find((item) => item.code === battle.defaultSkillCode) ??
      skills[0] ??
      null;
    const selectedTrack =
      tracks.find((item) => item.trackKey === this.data.selectedTrackKey) ??
      tracks.find(
        (item) => item.trackKey === overview.profile.professionalTrack?.trackKey,
      ) ??
      tracks.find((item) => item.trackKey === battle.defaultTrackKey) ??
      tracks[0] ??
      null;
    const wrongAreas =
      wrongQuestions.areas ?? wrongQuestions.topWeakAreas ?? [];
    const wrongCourseFilters: GrowthCourseOption[] = [
      { id: "ALL", title: "全部课程" },
      ...wrongAreas.reduce<GrowthCourseOption[]>((items, item) => {
        if (
          item.courseId &&
          !items.some((course) => course.id === item.courseId)
        ) {
          items.push({ id: item.courseId, title: item.courseTitle });
        }
        return items;
      }, []),
    ];
    const selectedWrongCourseId = wrongCourseFilters.some(
      (item) => item.id === this.data.selectedWrongCourseId,
    )
      ? this.data.selectedWrongCourseId
      : "ALL";
    const validTrendPointCount = overview.learning.trend.filter(
      (item: GrowthTrendPoint) =>
        item.quizAccuracy !== null || item.practiceAccuracy !== null,
    ).length;

    this.setData({
      state: "success",
      isRefreshing: false,
      errorMessage: "",
      overview,
      profile,
      goal: overview.goal ?? null,
      continueLearning: overview.learning.continueLearning,
      nextRecommendation: overview.learning.nextRecommendation ?? null,
      professionalRoute: overview.learning.professionalRoute ?? [],
      chapterItems,
      trend: overview.learning.trend,
      recommendations: overview.recommendations
        .filter((item) => item.type !== "CONTINUE_COURSE")
        .map(
          (item: GrowthRecommendation) => ({
            ...item,
            priorityText: priorityText(item.priority),
          }),
        ),
      hasRecommendations: overview.recommendations.some(
        (item) => item.type !== "CONTINUE_COURSE",
      ),
      hasPerformanceData:
        quiz.attemptCount > 0 ||
        practice.attemptCount > 0 ||
        chapterItems.length > 0,
      hasQuizData: quiz.attemptCount > 0 || quiz.answeredCount > 0,
      hasPracticeData: practice.attemptCount > 0 || practice.answeredCount > 0,
      hasChapterData: chapterItems.length > 0,
      hasTrendData: validTrendPointCount >= 3,
      hasWrongData: wrongQuestions.totalWrongAttempts > 0,
      hasBattleData: tracks.length > 0 || skills.length > 0,
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
      wrongCourseFilters,
      selectedWrongCourseId,
      wrongAreaItems: buildWrongAreaViews(wrongAreas, selectedWrongCourseId),
      skillItems: skills,
      trackItems: tracks,
      goalProgressWidth: `${Math.max(0, Math.min(100, overview.goal?.progressPercent ?? 0))}%`,
      goalTargetText: buildGoalDateText(overview.goal ?? null),
      goalStatusText: buildGoalStatusText(overview.goal ?? null),
      goalPaceText: buildGoalPaceText(overview.goal ?? null),
      goalRemainingText: overview.goal
        ? `${overview.goal.completedChapters} / ${overview.goal.totalChapters} 章节 · 剩余 ${overview.goal.remainingChapters} 个章节 · ${overview.goal.remainingDays} 天`
        : "",
      goalCadenceText: buildGoalCadenceText(overview.goal ?? null),
    });

    if (selectedTrack) {
      const trackTrend = selectedTrack.ratingTrend ?? [];
      const netChange = buildRatingNetChange(selectedTrack);
      this.setData({
        selectedTrackKey: selectedTrack.trackKey,
        selectedTrack,
        ratingChartPoints: buildRatingChartPoints(selectedTrack),
        hasRatingTrend: trackTrend.length > 0,
        currentRatingText:
          selectedTrack.rankedBattles > 0 && selectedTrack.rating !== null
            ? String(selectedTrack.rating)
            : "未定级",
        highestRatingText:
          selectedTrack.highestRating === null
            ? "暂无"
            : String(selectedTrack.highestRating),
        ratingNetChangeText:
          netChange === null
            ? "暂无"
            : `${netChange > 0 ? "+" : ""}${netChange}`,
        rankedBattleText: `${selectedTrack.rankedBattles} 场`,
        trainingBattleText: `${selectedTrack.trainingBattles} 场`,
        friendBattleText: `${selectedTrack.friendBattles} 场`,
        ratingEmptyText:
          selectedTrack.rankedBattles +
            selectedTrack.trainingBattles +
            selectedTrack.friendBattles ===
          0
            ? "暂无该专业对战数据"
            : "暂无专业积分趋势",
      });
    }

    if (selectedSkill && !selectedTrack) {
      const skillTrend = selectedSkill.ratingTrend ?? [];
      const netChange = buildRatingNetChange(selectedSkill);
      this.setData({
        selectedSkillCode: selectedSkill.code,
        selectedSkill,
        ratingChartPoints: buildRatingChartPoints(selectedSkill),
        hasRatingTrend: skillTrend.length > 0,
        currentRatingText:
          selectedSkill.rankedBattles > 0 && selectedSkill.rating !== null
            ? String(selectedSkill.rating)
            : "未定级",
        highestRatingText:
          selectedSkill.highestRating === null
            ? "暂无"
            : String(selectedSkill.highestRating),
        ratingNetChangeText:
          netChange === null
            ? "暂无"
            : `${netChange > 0 ? "+" : ""}${netChange}`,
        rankedBattleText: `${selectedSkill.rankedBattles} 场`,
        trainingBattleText: `${selectedSkill.trainingBattles} 场`,
        friendBattleText: `${selectedSkill.friendBattles} 场`,
        ratingEmptyText:
          selectedSkill.rankedBattles +
            selectedSkill.trainingBattles +
            selectedSkill.friendBattles ===
          0
            ? "暂无该技能对战数据"
            : "暂无随机匹配积分趋势",
      });
    } else if (!selectedTrack) {
      this.setData({
        selectedSkill: null,
        ratingChartPoints: [],
        currentRatingText: "未定级",
      });
    }
  },
});
