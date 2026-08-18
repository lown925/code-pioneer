import type { CourseListData, CourseListItem } from "../types/course";
import type {
  GrowthCourseRecommendation,
  GrowthLearningGoal,
  GrowthOverviewResponse,
  GrowthProfileSummary,
  GrowthRange,
} from "../types/growth";
import { request } from "./request";
import {
  TECHNICAL_INTEREST_OPTIONS,
  getGrowthValueLabel,
} from "./growth-profile";

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
  return [course.language, course.slug, course.title]
    .filter((value): value is string => Boolean(value))
    .flatMap((value) =>
      value
        .split(/[^\p{L}\p{N}]+/u)
        .map(normalizeIdentityToken)
        .filter(Boolean),
    );
}

export function buildGrowthCourseRecommendations(
  profile: GrowthProfileSummary,
  courses: CourseListItem[],
): GrowthCourseRecommendation[] {
  const interests = (profile.technicalInterests ?? [])
    .map((value) => getGrowthValueLabel(value, TECHNICAL_INTEREST_OPTIONS))
    .map(normalizeIdentityToken)
    .filter(Boolean);
  const seen = new Set<string>();

  return courses
    .filter((course) => {
      const tokens = courseIdentityTokens(course);
      return interests.some((interest) => tokens.includes(interest));
    })
    .filter((course) => {
      if (seen.has(course.id)) return false;
      seen.add(course.id);
      return true;
    })
    .slice(0, 3)
    .map((course) => {
      const interest = interests.find((value) =>
        courseIdentityTokens(course).includes(value),
      );
      const label =
        profile.technicalInterests
          .map((value) =>
            getGrowthValueLabel(value, TECHNICAL_INTEREST_OPTIONS),
          )
          .find((value) => normalizeIdentityToken(value) === interest) ??
        interest ??
        "技术兴趣";
      return {
        courseId: course.id,
        courseTitle: course.title,
        reason: `结合你的 ${label} 技术兴趣推荐`,
        targetPath: `/pages/course/detail?courseId=${encodeURIComponent(course.id)}`,
      };
    });
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
