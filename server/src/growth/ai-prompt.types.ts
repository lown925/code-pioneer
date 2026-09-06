export type GrowthAiPromptResponse = {
  prompt: string;
  mode: 'GENERAL';
};

export type GrowthAiPromptContext = {
  gradeLabel?: string;
  professionalTrackName?: string;
  careerDirectionLabel?: string;
  technicalInterests?: string[];
  completedCourses: string[];
  learningCourses: Array<{
    title: string;
    progressPercent?: number;
  }>;
  learningSummary?: {
    completedCourseCount: number;
    learningCourseCount: number;
  };
  quizSummary?: {
    completedAttempts: number;
    answeredQuestions: number;
    correctQuestions: number;
    accuracyPercent?: number;
  };
  practiceSummary?: {
    completedAttempts: number;
    answeredQuestions: number;
    correctQuestions: number;
    accuracyPercent?: number;
  };
  weakAreas: Array<{
    courseTitle?: string;
    chapterTitle?: string;
    errorCount?: number;
  }>;
};
