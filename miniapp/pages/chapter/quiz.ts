import type { BattleContentBlock } from "../../types/battle";
import type {
  ChapterQuizData,
  ChapterQuizQuestion,
  ChapterQuizOption,
  SubmitChapterQuizAnswer,
  SubmitChapterQuizResponse,
  SubmitChapterQuizResult,
} from "../../types/quiz";
import { getAuthStateSummary, redirectToLogin } from "../../utils/auth";
import { RequestError, request } from "../../utils/request";

type PageState = "loading" | "ready" | "submitting" | "submitted" | "error";

type ViewBlock = BattleContentBlock & {
  blockKey: string;
  imageFailed: boolean;
  altText: string;
};

type QuizQuestionOptionCard = {
  optionId: string;
  content: string;
  contentBlocks: ViewBlock[];
  order: number;
  label: string;
  isSelected: boolean;
  isCorrect: boolean;
  isWrongSelection: boolean;
};

type QuizQuestionResultCard = {
  isAnswered: boolean;
  isCorrect: boolean;
  resultText: string;
  resultClassName: string;
  correctAnswerText: string;
  explanationBlocks: ViewBlock[];
  hasExplanation: boolean;
};

type QuizQuestionCard = {
  questionId: string;
  type: string;
  content: string;
  stemBlocks: ViewBlock[];
  scoreText: string;
  indexText: string;
  options: QuizQuestionOptionCard[];
  isTextQuestion: boolean;
  isCodeFill: boolean;
  answerText: string;
  answerMaxLength: number;
  inputPlaceholder: string;
  selectedOptionId: string;
  result: QuizQuestionResultCard | null;
};

type ChapterQuizPageData = {
  state: PageState;
  chapterId: string;
  title: string;
  description: string;
  attemptSummaryText: string;
  summaryText: string;
  scoreSummaryText: string;
  feedbackHintText: string;
  questions: QuizQuestionCard[];
  errorMessage: string;
  isSubmitDisabled: boolean;
  submitButtonText: string;
};

function decodeQueryValue(value: string) {
  try {
    return decodeURIComponent(value).trim();
  } catch {
    return value.trim();
  }
}

function isValidUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function buildOptionLabel(index: number) {
  return String.fromCharCode(65 + index);
}

function mapBlocks(
  blocks: BattleContentBlock[],
  keyPrefix: string,
): ViewBlock[] {
  return blocks.map((block, index) => ({
    ...block,
    blockKey: `${keyPrefix}-${index}`,
    imageFailed: false,
    altText: block.type === "IMAGE" ? block.alt?.trim() || "图片加载失败" : "",
  }));
}

function resolveExplanationBlocks(
  question: ChapterQuizQuestion,
  result: SubmitChapterQuizResult,
) {
  if (result.explanationBlocks?.length) {
    return result.explanationBlocks;
  }

  const resultExplanation = result.explanation?.trim();
  if (resultExplanation) {
    return [{ type: "TEXT" as const, text: resultExplanation }];
  }

  if (question.explanationBlocks?.length) {
    return question.explanationBlocks;
  }

  const questionExplanation = question.explanation?.trim();
  return questionExplanation
    ? [{ type: "TEXT" as const, text: questionExplanation }]
    : [];
}

function formatOptionText(option: ChapterQuizOption, optionIndex: number) {
  if (option.content.trim()) {
    return `${buildOptionLabel(optionIndex)}. ${option.content.trim()}`;
  }

  return `选项 ${buildOptionLabel(optionIndex)}`;
}

function getReadableQuizError(error: unknown) {
  if (error instanceof RequestError) {
    if (error.code === "NETWORK_ERROR") {
      return "网络请求失败，请确认后端服务可用后再试。";
    }

    if (error.code === "CHAPTER_NOT_FOUND") {
      return "当前章节不存在或暂未发布。";
    }

    if (error.code === "QUIZ_NOT_FOUND") {
      return "当前章节还没有可用测验。";
    }

    if (
      error.code === "QUIZ_NOT_READY" ||
      error.code === "QUIZ_NOT_PUBLISHED"
    ) {
      return "当前章节测验暂未准备完成，请稍后再试。";
    }
  }

  return "章节测验加载失败，请稍后重试。";
}

function getReadableSubmitError(error: unknown) {
  if (error instanceof RequestError) {
    if (error.code === "NETWORK_ERROR") {
      return "网络异常，测验提交失败，请稍后重试。";
    }

    if (error.code === "QUIZ_ANSWER_INCOMPLETE") {
      return "请先完成全部题目后再提交测验。";
    }

    if (
      error.code === "QUIZ_OPTION_INVALID" ||
      error.code === "QUIZ_QUESTION_INVALID"
    ) {
      return "当前题目选项已失效，请刷新后重新作答。";
    }

    if (error.code === "CHAPTER_NOT_STARTED") {
      return "请先进入章节开始学习，再参加本章测验。";
    }

    if (
      error.code === "QUIZ_NOT_READY" ||
      error.code === "QUIZ_NOT_PUBLISHED"
    ) {
      return "当前章节测验暂未准备完成，请稍后再试。";
    }
  }

  return "章节测验提交失败，请稍后重试。";
}

function getReadableCompleteError(error: unknown) {
  if (error instanceof RequestError) {
    if (error.code === "CHAPTER_QUIZ_NOT_SUBMITTED") {
      return "请先提交本章测验，再同步章节完成状态。";
    }

    if (error.code === "CHAPTER_NOT_STARTED") {
      return "测验已提交，请重新进入章节后再同步完成状态。";
    }

    if (
      error.code === "QUIZ_NOT_PUBLISHED" ||
      error.code === "QUIZ_NOT_READY"
    ) {
      return "当前章节测验暂未准备完成，请稍后再试。";
    }
  }

  return "测验已提交，但章节进度同步失败，请返回章节页刷新后查看。";
}

let isPageActive = false;
let latestQuizData: ChapterQuizData | null = null;
let latestSubmitResult: SubmitChapterQuizResponse | null = null;
type QuizAnswerDraft = { selectedOptionId: string; answerText: string };
let selectedAnswers: Record<string, QuizAnswerDraft> = {};

function buildResultMap(result: SubmitChapterQuizResponse | null) {
  if (!result) {
    return new Map<string, SubmitChapterQuizResult>();
  }

  return new Map(result.results.map((item) => [item.questionId, item]));
}

function normalizeQuestion(
  question: ChapterQuizQuestion,
  index: number,
  selectedOptionId: string,
  answerText: string,
  result: SubmitChapterQuizResult | null,
): QuizQuestionCard {
  const sortedOptions = [...question.options].sort(
    (left, right) => left.order - right.order,
  );
  const correctOption = result
    ? (sortedOptions.find(
        (option) => option.optionId === result.correctOptionId,
      ) ?? null)
    : null;
  const isTextQuestion =
    question.type === "FILL_BLANK" || question.type === "CODE_FILL";
  const mappedStemBlocks = mapBlocks(
    question.stemBlocks,
    `${question.questionId}-stem`,
  );
  const stemBlocks =
    mappedStemBlocks.length === 1 &&
    mappedStemBlocks[0]?.type === "TEXT" &&
    mappedStemBlocks[0].text?.trim() === question.content.trim()
      ? []
      : mappedStemBlocks;
  const explanationBlocks = result
    ? resolveExplanationBlocks(question, result)
    : [];

  return {
    questionId: question.questionId,
    type: question.type,
    content: question.content,
    stemBlocks,
    scoreText: `${question.score} 分`,
    indexText: `第 ${index + 1} 题`,
    isTextQuestion,
    isCodeFill: question.type === "CODE_FILL",
    answerText,
    answerMaxLength: question.type === "CODE_FILL" ? 4000 : 500,
    inputPlaceholder:
      question.type === "CODE_FILL" ? "请输入需要填入的代码" : "请输入答案",
    selectedOptionId,
    options: sortedOptions.map((option, optionIndex) => {
      const isSelected = option.optionId === selectedOptionId;
      const isCorrect = result
        ? option.optionId === result.correctOptionId
        : false;

      return {
        optionId: option.optionId,
        content: option.content,
        contentBlocks: mapBlocks(
          option.contentBlocks,
          `${question.questionId}-option-${option.optionId}`,
        ),
        order: option.order,
        label: buildOptionLabel(optionIndex),
        isSelected,
        isCorrect,
        isWrongSelection: Boolean(result && isSelected && !isCorrect),
      };
    }),
    result: result
      ? {
          isAnswered: Boolean(result.selectedOptionId || result.answerText),
          isCorrect: result.isCorrect,
          resultText: result.isCorrect ? "回答正确" : "回答错误",
          resultClassName: result.isCorrect ? "result-correct" : "result-wrong",
          correctAnswerText: result.acceptedAnswers?.length
            ? result.acceptedAnswers.join(" / ")
            : correctOption
              ? formatOptionText(
                  correctOption,
                  sortedOptions.findIndex(
                    (option) => option.optionId === correctOption.optionId,
                  ),
                )
              : "当前接口未返回可展示的标准答案",
          explanationBlocks: mapBlocks(
            explanationBlocks,
            `${question.questionId}-explanation`,
          ),
          hasExplanation: explanationBlocks.length > 0,
        }
      : null,
  };
}

function mapQuestions(
  questions: ChapterQuizQuestion[],
  selectedAnswersMap: Record<string, QuizAnswerDraft>,
  submitResult: SubmitChapterQuizResponse | null,
) {
  const resultMap = buildResultMap(submitResult);

  return [...questions]
    .sort((left, right) => left.order - right.order)
    .map((question, index) =>
      normalizeQuestion(
        question,
        index,
        selectedAnswersMap[question.questionId]?.selectedOptionId ?? "",
        selectedAnswersMap[question.questionId]?.answerText ?? "",
        resultMap.get(question.questionId) ?? null,
      ),
    );
}

Page<ChapterQuizPageData>({
  data: {
    state: "loading",
    chapterId: "",
    title: "",
    description: "",
    attemptSummaryText: "",
    summaryText: "",
    scoreSummaryText: "",
    feedbackHintText: "",
    questions: [],
    errorMessage: "",
    isSubmitDisabled: true,
    submitButtonText: "提交测验",
  },

  onLoad(query) {
    isPageActive = true;
    latestQuizData = null;
    latestSubmitResult = null;
    selectedAnswers = {};

    const chapterId =
      typeof query.chapterId === "string"
        ? decodeQueryValue(query.chapterId)
        : "";

    if (!chapterId || !isValidUuid(chapterId)) {
      wx.showToast({
        title: "章节参数无效",
        icon: "none",
      });

      setTimeout(() => {
        this.handleBack();
      }, 400);

      return;
    }

    this.setData({
      chapterId,
    });

    void this.loadQuiz(chapterId);
  },

  onUnload() {
    isPageActive = false;
  },

  async loadQuiz(chapterId?: string) {
    const activeChapterId = chapterId ?? this.data.chapterId;

    if (!getAuthStateSummary().isAuthenticated) {
      redirectToLogin(
        `/pages/chapter/quiz?chapterId=${encodeURIComponent(activeChapterId)}`,
      );
      return;
    }

    this.setData({
      state: "loading",
      errorMessage: "",
    });

    try {
      const quiz = await request<ChapterQuizData>({
        url: `/chapters/${activeChapterId}/quiz`,
        authMode: "required",
      });

      latestQuizData = quiz;
      latestSubmitResult = null;

      if (!isPageActive) {
        return;
      }

      this.setData({
        state: "ready",
        chapterId: quiz.chapterId,
        title: quiz.title,
        description:
          quiz.description ??
          "完成全部题目后提交，本页会直接显示每题正误、标准答案和解析。",
        attemptSummaryText: `已作答 ${quiz.attemptCount} 次${quiz.hasPassed ? "，你曾经拿到过通过分数" : ""}`,
        summaryText: `共 ${quiz.questionCount} 题，满分 ${quiz.totalScore} 分`,
        scoreSummaryText: "",
        feedbackHintText: "提交后会直接在本页显示答案与解析。",
        questions: mapQuestions(quiz.questions, selectedAnswers, null),
        isSubmitDisabled: quiz.questions.length === 0,
        submitButtonText: "提交并查看解析",
      });
    } catch (error) {
      if (!isPageActive) {
        return;
      }

      this.setData({
        state: "error",
        errorMessage: getReadableQuizError(error),
      });
    }
  },

  handleRetry() {
    void this.loadQuiz();
  },

  handleBack() {
    if (getCurrentPages().length > 1) {
      wx.navigateBack({
        delta: 1,
      });
      return;
    }

    wx.switchTab({
      url: "/pages/learning/index",
    });
  },

  handleSelectOption(event: WechatMiniprogram.BaseEvent) {
    if (this.data.state !== "ready" || !latestQuizData) {
      return;
    }

    const questionId = event.currentTarget.dataset.questionId;
    const optionId = event.currentTarget.dataset.optionId;

    if (
      typeof questionId !== "string" ||
      questionId.length === 0 ||
      typeof optionId !== "string" ||
      optionId.length === 0
    ) {
      return;
    }

    selectedAnswers = {
      ...selectedAnswers,
      [questionId]: { selectedOptionId: optionId, answerText: "" },
    };

    this.setData({
      questions: mapQuestions(latestQuizData.questions, selectedAnswers, null),
    });
  },

  handleTextAnswerInput(
    event: WechatMiniprogram.CustomEvent<{ value?: string }>,
  ) {
    if (this.data.state !== "ready" || !latestQuizData) {
      return;
    }

    const questionId = event.currentTarget.dataset.questionId;
    if (typeof questionId !== "string" || !questionId) {
      return;
    }

    selectedAnswers = {
      ...selectedAnswers,
      [questionId]: {
        selectedOptionId: "",
        answerText: event.detail.value ?? "",
      },
    };
    this.setData({
      questions: mapQuestions(latestQuizData.questions, selectedAnswers, null),
    });
  },

  handleImageError(
    event: WechatMiniprogram.BaseEvent<{
      questionId?: string;
      optionId?: string;
      blockKey?: string;
      section?: string;
    }>,
  ) {
    const questionId = event.currentTarget.dataset.questionId ?? "";
    const optionId = event.currentTarget.dataset.optionId ?? "";
    const blockKey = event.currentTarget.dataset.blockKey ?? "";
    const section = event.currentTarget.dataset.section ?? "";

    if (!questionId || !blockKey) {
      return;
    }

    const markBlocks = (blocks: ViewBlock[]) =>
      blocks.map((block) =>
        block.blockKey === blockKey ? { ...block, imageFailed: true } : block,
      );

    this.setData({
      questions: this.data.questions.map((question) => {
        if (question.questionId !== questionId) {
          return question;
        }

        if (section === "stem") {
          return {
            ...question,
            stemBlocks: markBlocks(question.stemBlocks),
          };
        }

        if (section === "option") {
          return {
            ...question,
            options: question.options.map((option) =>
              option.optionId === optionId
                ? {
                    ...option,
                    contentBlocks: markBlocks(option.contentBlocks),
                  }
                : option,
            ),
          };
        }

        if (section === "explanation" && question.result) {
          return {
            ...question,
            result: {
              ...question.result,
              explanationBlocks: markBlocks(question.result.explanationBlocks),
            },
          };
        }

        return question;
      }),
    });
  },

  async handleSubmit() {
    if (this.data.state !== "ready" || !latestQuizData) {
      return;
    }

    const sortedQuestions = [...latestQuizData.questions].sort(
      (left, right) => left.order - right.order,
    );
    const answers: SubmitChapterQuizAnswer[] = [];

    for (const question of sortedQuestions) {
      const draft = selectedAnswers[question.questionId];
      const isTextQuestion =
        question.type === "FILL_BLANK" || question.type === "CODE_FILL";

      if (
        !draft ||
        (isTextQuestion ? !draft.answerText.trim() : !draft.selectedOptionId)
      ) {
        wx.showToast({
          title: "请先完成全部题目后再提交",
          icon: "none",
        });
        return;
      }

      answers.push(
        isTextQuestion
          ? { questionId: question.questionId, answerText: draft.answerText }
          : {
              questionId: question.questionId,
              selectedOptionId: draft.selectedOptionId,
            },
      );
    }

    this.setData({
      state: "submitting",
      errorMessage: "",
      submitButtonText: "提交中...",
    });

    try {
      const result = await request<SubmitChapterQuizResponse>({
        url: `/chapters/${this.data.chapterId}/quiz/submit`,
        method: "POST",
        authMode: "required",
        data: {
          answers,
        },
      });

      latestSubmitResult = result;

      try {
        await request<Record<string, never>>({
          url: `/chapters/${this.data.chapterId}/complete`,
          method: "POST",
          authMode: "required",
        });
      } catch (error) {
        wx.showToast({
          title: getReadableCompleteError(error),
          icon: "none",
        });
      }

      if (!isPageActive || !latestQuizData) {
        return;
      }

      this.setData({
        state: "submitted",
        questions: mapQuestions(
          latestQuizData.questions,
          selectedAnswers,
          result,
        ),
        scoreSummaryText: `本次得分 ${result.score}/${result.totalScore}，正确率 ${result.scorePercent}%`,
        feedbackHintText:
          "已展示本次作答的标准答案与解析，可返回章节继续学习。",
        submitButtonText: "重新作答",
        isSubmitDisabled: false,
      });
    } catch (error) {
      if (!isPageActive) {
        return;
      }

      this.setData({
        state: "ready",
        errorMessage: getReadableSubmitError(error),
        submitButtonText: "提交并查看解析",
      });
      wx.showToast({
        title: getReadableSubmitError(error),
        icon: "none",
      });
    }
  },

  handleRestart() {
    if (!latestQuizData) {
      void this.loadQuiz();
      return;
    }

    latestSubmitResult = null;
    selectedAnswers = {};

    this.setData({
      state: "ready",
      scoreSummaryText: "",
      feedbackHintText: "提交后会直接在本页显示答案与解析。",
      questions: mapQuestions(latestQuizData.questions, selectedAnswers, null),
      submitButtonText: "提交并查看解析",
    });
  },
});
