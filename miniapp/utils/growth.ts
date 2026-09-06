import type { CourseListData, CourseListItem } from "../types/course";
import type {
  GrowthCourseRecommendation,
  GrowthAiPromptData,
  GrowthLearningGoal,
  GrowthOverviewResponse,
  GrowthProfileSummary,
  GrowthRange,
} from "../types/growth";
import { request } from "./request";
import {
  LEARNING_DIRECTION_OPTIONS,
  MAJOR_OPTIONS,
  TECHNICAL_INTEREST_OPTIONS,
  getGrowthValueLabel,
} from "./growth-profile";

export function fetchGrowthAiPrompt() {
  return request<GrowthAiPromptData>({
    url: "/growth/ai-prompt",
    method: "GET",
    authMode: "required",
  });
}

export function fetchGrowthOverview(range: GrowthRange = "7d") {
  return request<GrowthOverviewResponse>({
    url: "/growth/overview",
    method: "GET",
    authMode: "required",
    data: { range },
  });
}

export type GrowthGoalInput = {
  courseId: string;
  targetDate: string;
};

export function fetchCurrentGrowthGoal() {
  return request<{ goal: GrowthLearningGoal | null }>({
    url: "/growth/goals/current",
    method: "GET",
    authMode: "required",
  });
}

export function createGrowthGoal(input: GrowthGoalInput) {
  return request<{ goal: GrowthLearningGoal }>({
    url: "/growth/goals",
    method: "POST",
    authMode: "required",
    data: input,
  });
}

export function updateGrowthGoal(input: Partial<GrowthGoalInput>) {
  return request<{ goal: GrowthLearningGoal }>({
    url: "/growth/goals/current",
    method: "PATCH",
    authMode: "required",
    data: input,
  });
}

export function cancelGrowthGoal() {
  return request<{ goal: null }>({
    url: "/growth/goals/current",
    method: "DELETE",
    authMode: "required",
  });
}

export function fetchGrowthCourses() {
  return request<CourseListData>({
    url: "/courses",
    method: "GET",
    authMode: "auto",
    data: { page: 1, pageSize: 100 },
  });
}

function normalizeIdentityToken(value: string) {
  return value.trim().toLocaleLowerCase();
}

function courseIdentityTokens(course: CourseListItem) {
  return [
    course.language,
    course.implementationLanguage,
    course.slug,
    course.title,
    course.summary,
    course.subjectCategory,
    ...(course.interests ?? []),
  ]
    .filter((value): value is string => Boolean(value))
    .flatMap((value) =>
      value
        .split(/[^\p{L}\p{N}]+/u)
        .map(normalizeIdentityToken)
        .filter(Boolean),
    );
}

function recommendationTokens(value: string) {
  return value
    .trim()
    .toLocaleLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
}

export function buildGrowthCourseRecommendations(
  profile: GrowthProfileSummary,
  courses: CourseListItem[],
): GrowthCourseRecommendation[] {
  const profileTokens = [
    profile.major ?? '',
    getGrowthValueLabel(profile.major, MAJOR_OPTIONS),
    profile.learningDirection ?? '',
    getGrowthValueLabel(profile.learningDirection, LEARNING_DIRECTION_OPTIONS),
    ...(profile.technicalInterests ?? []).flatMap((value) => [
      value,
      getGrowthValueLabel(value, TECHNICAL_INTEREST_OPTIONS),
    ]),
  ].flatMap(recommendationTokens);
  const profileTokenSet = new Set(profileTokens);
  const trackKey = profile.professionalTrack?.trackKey ?? null;
  const progressBySlug = new Map(
    courses.map((course) => [course.slug, course.progressPercent]),
  );
  const completedSlugs = new Set(
    courses
      .filter((course) => course.progressPercent >= 100)
      .map((course) => course.slug),
  );
  const seen = new Set<string>();

  return courses
    .map((course) => {
      if (seen.has(course.id) || course.progressPercent >= 100) return null;
      seen.add(course.id);
      const courseTokens = courseIdentityTokens(course);
      const metadataTokens = [
        course.slug,
        course.title,
        course.summary,
        course.subjectCategory ?? course.category,
        course.language ?? '',
        course.implementationLanguage ?? '',
        ...(course.interests ?? []),
      ].flatMap(recommendationTokens);
      const interestMatch = metadataTokens.filter((token) =>
        profileTokenSet.has(token),
      ).length;
      const trackMatch = Boolean(
        trackKey && course.professionalTracks?.includes(trackKey),
      );
      if (trackKey && course.professionalTracks?.length && !trackMatch) {
        return null;
      }
      const missingPrerequisite = (course.prerequisites ?? []).find(
        (prerequisite) =>
          progressBySlug.has(prerequisite) && !completedSlugs.has(prerequisite),
      );
      if (missingPrerequisite) return null;
      const score =
        (trackMatch ? 10 : 0) +
        interestMatch * 3 +
        (course.progressPercent > 0 ? 3 : 0) +
        ((course.order ?? 0) > 0 ? 1 : 0);
      if (score === 0) return null;
      const trackLabel = profile.professionalTrack?.shortName ?? '当前专业方向';
      const reason =
        course.progressPercent > 0
          ? `你已完成 ${Math.round(course.progressPercent)}%，继续学习${trackLabel}课程路线`
          : trackMatch
            ? `结合${trackLabel}专业课程路线推荐`
            : interestMatch > 0
              ? '结合你的技术兴趣和学习方向推荐'
              : '结合当前正式课程路径推荐';
      return { course, score, reason };
    })
    .filter(
      (
        item,
      ): item is { course: CourseListItem; score: number; reason: string } =>
        item !== null,
    )
    .sort(
      (left, right) =>
        right.score - left.score ||
        left.course.progressPercent - right.course.progressPercent ||
        (left.course.order ?? 0) - (right.course.order ?? 0) ||
        left.course.slug.localeCompare(right.course.slug),
    )
    .slice(0, 3)
    .map(({ course, reason }) => ({
      courseId: course.id,
      courseTitle: course.title,
      reason,
      targetPath: `/pages/course/detail?courseId=${encodeURIComponent(course.id)}`,
    }));
}

export function formatGrowthPercent(value: number | null) {
  return value === null ? "暂无数据" : `${Math.round(value)}%`;
}

export function isAllowedGrowthTargetPath(path: string) {
  return (
    path === "/pages/learning/index" ||
    path === "/pages/practice/index" ||
    path === "/pages/wrong-question/index" ||
    path === "/pages/battle/index" ||
    path === "/pages/growth/profile" ||
    path === "/pages/course/list" ||
    /^\/pages\/chapter\/detail\?chapterId=[^&?#]+$/.test(path) ||
    /^\/pages\/course\/detail\?courseId=[^&?#]+$/.test(path) ||
    /^\/pages\/learning\/course-progress\?courseId=[^&?#]+$/.test(path)
  );
}
