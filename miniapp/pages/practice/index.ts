import type {
  PracticeAnswerResponse,
  PracticeAttemptResponse,
  PracticeQuestion,
  PracticeTarget,
  PracticeTargetsResponse,
} from "../../types/practice";
import type { BattleContentBlock } from "../../types/battle";
import { redirectToLogin } from "../../utils/auth";
import { getBattleErrorMessage } from "../../utils/battle";
import { request } from "../../utils/request";

type PageState =
  | "LOADING"
  | "SETUP"
  | "STARTING"
  | "PLAYING"
  | "SUBMITTING"
  | "COMPLETED"
  | "ERROR";
type OptionView = PracticeQuestion["options"][number] & {
  label: string;
  statusClassName: string;
};

type PracticeBlockView = BattleContentBlock & {
  blockKey: string;
  imageFailed: boolean;
  altText: string;
};

type PracticePageData = {
  state: PageState;
  errorMessage: string;
  targets: PracticeTarget[];
  selectedCourseId: string;
  selectedQuestionCount: number;
  questionCounts: number[];
  attemptId: string;
  courseTitle: string;
  questions: PracticeQuestion[];
  currentIndex: number;
  currentQuestion: PracticeQuestion | null;
  currentStemBlocks: PracticeBlockView[];
  currentOptions: OptionView[];
  selectedOptionId: string;
  answerText: string;
  isTextQuestion: boolean;
  isCodeFill: boolean;
  answerMaxLength: number;
  correctOptionId: string;
  correctAnswerText: string;
  answerResult: PracticeAnswerResponse | null;
  progressText: string;
  correctCount: number;
  wrongCount: number;
};

const QUESTION_COUNTS = [5, 10, 20];
let isPageActive = false;
let isSubmitting = false;

Page<PracticePageData>({
  data: {
    state: "LOADING",
    errorMessage: "",
    targets: [],
    selectedCourseId: "",
    selectedQuestionCount: 10,
    questionCounts: QUESTION_COUNTS,
    attemptId: "",
    courseTitle: "",
    questions: [],
    currentIndex: 0,
    currentQuestion: null,
    currentStemBlocks: [],
    currentOptions: [],
    selectedOptionId: "",
    answerText: "",
    isTextQuestion: false,
    isCodeFill: false,
    answerMaxLength: 500,
    correctOptionId: "",
    correctAnswerText: "",
    answerResult: null,
    progressText: "",
    correctCount: 0,
    wrongCount: 0,
  },

  onLoad() {
    isPageActive = true;
    isSubmitting = false;
    void this.loadTargets();
  },

  onUnload() {
    isPageActive = false;
    isSubmitting = false;
  },

  async loadTargets() {
    this.setData({ state: "LOADING", errorMessage: "" });
    try {
      const response = await request<PracticeTargetsResponse>({
        url: "/practice/targets",
        method: "GET",
        authMode: "required",
      });
      if (!isPageActive) return;
      const firstTarget = response.items[0];
      this.setData({
        state: "SETUP",
        targets: response.items,
        selectedCourseId: firstTarget?.courseId ?? "",
        selectedQuestionCount: this.resolveInitialCount(
          firstTarget?.availableQuestionCount ?? 0,
        ),
      });
    } catch (error) {
      if (!isPageActive) return;
      this.setData({
        state: "ERROR",
        errorMessage: this.getError(error, "练习目标加载失败，请稍后重试。"),
      });
    }
  },

  handleCourseSelect(
    event: WechatMiniprogram.BaseEvent<{ courseId?: string }>,
  ) {
    const courseId = event.currentTarget.dataset.courseId;
    if (!courseId || this.data.state !== "SETUP") return;
    const target = this.data.targets.find((item) => item.courseId === courseId);
    this.setData({
      selectedCourseId: courseId,
      selectedQuestionCount: this.resolveInitialCount(
        target?.availableQuestionCount ?? 0,
      ),
    });
  },

  handleCountSelect(event: WechatMiniprogram.BaseEvent<{ count?: number }>) {
    const count = Number(event.currentTarget.dataset.count);
    const target = this.data.targets.find(
      (item) => item.courseId === this.data.selectedCourseId,
    );
    if (
      !QUESTION_COUNTS.includes(count) ||
      count > (target?.availableQuestionCount ?? 0)
    )
      return;
    this.setData({ selectedQuestionCount: count });
  },

  async handleStart() {
    if (!this.data.selectedCourseId || this.data.state !== "SETUP") return;
    this.setData({ state: "STARTING", errorMessage: "" });
    try {
      const response = await request<PracticeAttemptResponse>({
        url: "/practice/attempts",
        method: "POST",
        authMode: "required",
        data: {
          courseId: this.data.selectedCourseId,
          questionCount: this.data.selectedQuestionCount,
        },
      });
      if (!isPageActive) return;
      this.setData({
        state: "PLAYING",
        attemptId: response.attemptId,
        courseTitle: response.course.title,
        questions: response.questions,
        currentIndex: 0,
        correctCount: 0,
        wrongCount: 0,
      });
      this.applyQuestion(0);
    } catch (error) {
      if (!isPageActive) return;
      this.setData({
        state: "SETUP",
        errorMessage: this.getError(error, "练习创建失败，请稍后重试。"),
      });
    }
  },

  async handleOptionTap(
    event: WechatMiniprogram.BaseEvent<{ optionId?: string }>,
  ) {
    const optionId = event.currentTarget.dataset.optionId;
    const question = this.data.currentQuestion;
    if (!optionId || !question || isSubmitting || this.data.answerResult)
      return;
    await this.submitCurrentAnswer({ selectedOptionId: optionId });
  },

  handleTextInput(event: WechatMiniprogram.CustomEvent<{ value?: string }>) {
    if (!this.data.isTextQuestion || this.data.answerResult || isSubmitting)
      return;
    this.setData({ answerText: event.detail.value ?? "", errorMessage: "" });
  },

  async handleTextSubmit() {
    const answerText = this.data.answerText;
    if (!this.data.isTextQuestion || this.data.answerResult || isSubmitting)
      return;
    if (!answerText.trim()) {
      this.setData({ errorMessage: "请输入答案后再提交。" });
      return;
    }
    await this.submitCurrentAnswer({ answerText });
  },

  async submitCurrentAnswer(answer: {
    selectedOptionId?: string;
    answerText?: string;
  }) {
    const question = this.data.currentQuestion;
    if (!question || isSubmitting || this.data.answerResult) return;
    isSubmitting = true;
    this.setData({
      state: "SUBMITTING",
      selectedOptionId: answer.selectedOptionId ?? "",
      errorMessage: "",
    });
    try {
      const result = await request<PracticeAnswerResponse>({
        url: `/practice/attempts/${encodeURIComponent(this.data.attemptId)}/answers`,
        method: "POST",
        authMode: "required",
        data: { questionId: question.questionId, ...answer },
      });
      if (!isPageActive) return;
      this.setData({
        state: "PLAYING",
        answerResult: result,
        correctOptionId: result.correctOptionId ?? "",
        correctAnswerText: result.acceptedAnswers?.length
          ? result.acceptedAnswers.join(" / ")
          : this.formatCorrectAnswer(result.correctOptionId ?? ""),
        correctCount: this.data.correctCount + (result.isCorrect ? 1 : 0),
        wrongCount: this.data.wrongCount + (result.isCorrect ? 0 : 1),
      });
      this.refreshOptionStyles();
    } catch (error) {
      if (!isPageActive) return;
      this.setData({
        state: "PLAYING",
        selectedOptionId: "",
        errorMessage: this.getError(error, "答案提交失败，请重试。"),
      });
    } finally {
      isSubmitting = false;
    }
  },

  handleNext() {
    if (!this.data.answerResult) return;
    const nextIndex = this.data.currentIndex + 1;
    if (nextIndex >= this.data.questions.length) {
      this.setData({ state: "COMPLETED" });
      return;
    }
    this.applyQuestion(nextIndex);
  },

  handleRetry() {
    void this.loadTargets();
  },
  handleBackSetup() {
    this.setData({
      state: "SETUP",
      errorMessage: "",
      attemptId: "",
      questions: [],
    });
  },
  handleWrongQuestions() {
    wx.navigateTo({ url: "/pages/wrong-question/index?source=PRACTICE" });
  },
  handleBackLearning() {
    wx.switchTab({ url: "/pages/learning/index" });
  },
  handleLogin() {
    redirectToLogin("/pages/practice/index");
  },

  applyQuestion(index: number) {
    const question = this.data.questions[index] ?? null;
    const mappedBlocks = (question?.stemBlocks ?? []).map(
      (block, blockIndex) => ({
        ...block,
        blockKey: `${question?.questionId ?? "question"}-stem-${blockIndex}`,
        imageFailed: false,
        altText:
          block.type === "IMAGE" ? block.alt?.trim() || "图片加载失败" : "",
      }),
    );
    const currentStemBlocks =
      mappedBlocks.length === 1 &&
      mappedBlocks[0]?.type === "TEXT" &&
      mappedBlocks[0].text?.trim() === question?.content.trim()
        ? []
        : mappedBlocks;
    this.setData({
      currentIndex: index,
      currentQuestion: question,
      currentStemBlocks,
      currentOptions: (question?.options ?? []).map((option, optionIndex) => ({
        ...option,
        label: String.fromCharCode(65 + optionIndex),
        statusClassName: "",
      })),
      selectedOptionId: "",
      answerText: "",
      isTextQuestion:
        question?.type === "FILL_BLANK" || question?.type === "CODE_FILL",
      isCodeFill: question?.type === "CODE_FILL",
      answerMaxLength: question?.type === "CODE_FILL" ? 4000 : 500,
      correctOptionId: "",
      correctAnswerText: "",
      answerResult: null,
      errorMessage: "",
      progressText: question
        ? `第 ${index + 1} / ${this.data.questions.length} 题`
        : "",
    });
  },

  handleStemImageError(
    event: WechatMiniprogram.BaseEvent<{ blockKey?: string }>,
  ) {
    const blockKey = event.currentTarget.dataset.blockKey;
    if (typeof blockKey !== "string" || !blockKey) return;

    this.setData({
      currentStemBlocks: this.data.currentStemBlocks.map((block) =>
        block.blockKey === blockKey ? { ...block, imageFailed: true } : block,
      ),
    });
  },

  refreshOptionStyles() {
    this.setData({
      currentOptions: this.data.currentOptions.map((option) => ({
        ...option,
        statusClassName:
          option.optionId === this.data.correctOptionId
            ? "option-correct"
            : option.optionId === this.data.selectedOptionId
              ? "option-wrong"
              : "option-muted",
      })),
    });
  },

  formatCorrectAnswer(optionId: string) {
    const option = this.data.currentOptions.find(
      (item) => item.optionId === optionId,
    );
    return option ? `${option.label}. ${option.content}` : "正确选项";
  },

  resolveInitialCount(available: number) {
    return (
      [...QUESTION_COUNTS].reverse().find((count) => count <= available) ?? 0
    );
  },

  getError(error: unknown, fallback: string) {
    return getBattleErrorMessage(
      error,
      {
        unauthorized: "登录状态已失效，请重新登录。",
        network: "网络连接失败，请稍后重试。",
        fallback,
      },
      {
        PRACTICE_NOT_ENOUGH_QUESTIONS: "该课程当前题目不足，请选择较少的题量。",
        PRACTICE_ATTEMPT_COMPLETED: "本轮练习已经结束，请重新开始。",
      },
    );
  },
});
