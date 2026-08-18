import type { GrowthOverviewResponse, GrowthRange } from "../types/growth";
import { request } from "./request";

export function fetchGrowthOverview(range: GrowthRange = "7d") {
  return request<GrowthOverviewResponse>({
    url: "/growth/overview",
    method: "GET",
    authMode: "required",
    data: { range },
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
