import type { CourseListData } from "../types/course";
import type {
  GrowthLearningGoal,
  GrowthOverviewResponse,
  GrowthRange,
} from "../types/growth";
import { request } from "./request";

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
    /^\/pages\/chapter\/detail\?chapterId=[^&?#]+$/.test(path) ||
    /^\/pages\/learning\/course-progress\?courseId=[^&?#]+$/.test(path)
  );
}
