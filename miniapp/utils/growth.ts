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
  LEARNING_DIRECTION_OPTIONS,
  MAJOR_OPTIONS,
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

type RecommendationRule = {
  majors: string[];
  interests: string[];
  directions: string[];
  prerequisites: string[];
};

const COURSE_RECOMMENDATION_RULES: Record<string, RecommendationRule> = {
  "python-basic": {
    majors: [
      "major.computer_science",
      "major.software_engineering",
      "major.data_science_big_data",
      "major.big_data_management",
    ],
    interests: ["python", "software-development", "data-processing"],
    directions: [
      "direction.backend",
      "direction.data_analysis",
      "direction.big_data",
    ],
    prerequisites: [],
  },
  "data-structures-algorithms": {
    majors: [
      "major.computer_science",
      "major.software_engineering",
      "major.data_science_big_data",
      "major.big_data_management",
    ],
    interests: [
      "algorithm",
      "computer-foundations",
      "software-development",
      "backend",
      "data-processing",
    ],
    directions: [
      "direction.backend",
      "direction.data_analysis",
      "direction.big_data",
    ],
    prerequisites: ["python-basic"],
  },
  "linux-fundamentals": {
    majors: [
      "major.computer_science",
      "major.software_engineering",
      "major.data_science_big_data",
      "major.big_data_management",
    ],
    interests: ["linux", "system", "operations", "backend", "big-data"],
    directions: [
      "direction.backend",
      "direction.systems",
      "direction.big_data",
    ],
    prerequisites: ["python-basic"],
  },
  "database-sql-fundamentals": {
    majors: [
      "major.computer_science",
      "major.software_engineering",
      "major.data_science_big_data",
      "major.big_data_management",
    ],
    interests: [
      "database",
      "backend",
      "data-analysis",
      "data-processing",
      "sql",
    ],
    directions: [
      "direction.backend",
      "direction.database",
      "direction.data_analysis",
      "direction.big_data",
    ],
    prerequisites: ["python-basic"],
  },
  "java-object-oriented-programming": {
    majors: ["major.software_engineering", "major.computer_science"],
    interests: ["java", "backend", "software-development"],
    directions: ["direction.backend"],
    prerequisites: ["data-structures-algorithms"],
  },
  "computer-networks-fundamentals": {
    majors: ["major.computer_science", "major.software_engineering"],
    interests: ["network", "system", "backend", "network-security"],
    directions: [
      "direction.systems",
      "direction.backend",
      "direction.cybersecurity",
    ],
    prerequisites: ["linux-fundamentals"],
  },
  "computer-architecture-operating-systems": {
    majors: ["major.computer_science"],
    interests: ["operating-system", "system", "computer-foundations"],
    directions: ["direction.systems"],
    prerequisites: ["data-structures-algorithms"],
  },
  "software-engineering-project-development": {
    majors: ["major.software_engineering"],
    interests: [
      "software-development",
      "project-development",
      "backend",
      "teamwork",
    ],
    directions: ["direction.backend"],
    prerequisites: ["data-structures-algorithms", "database-sql-fundamentals"],
  },
  "big-data-fundamentals": {
    majors: ["major.data_science_big_data", "major.big_data_management"],
    interests: ["data-processing", "distributed-computing", "data-analysis"],
    directions: ["direction.big_data", "direction.data_analysis"],
    prerequisites: [
      "python-basic",
      "linux-fundamentals",
      "database-sql-fundamentals",
    ],
  },
  "spark-data-processing": {
    majors: ["major.data_science_big_data", "major.big_data_management"],
    interests: [
      "spark",
      "data-processing",
      "distributed-computing",
      "data-analysis",
    ],
    directions: ["direction.big_data", "direction.data_analysis"],
    prerequisites: ["python-basic", "big-data-fundamentals"],
  },
};

const RECOMMENDATION_ALIASES: Record<string, string[]> = {
  computer: ["计算机", "computer"],
  "software-engineering": ["软件工程", "software engineering"],
  "big-data": ["大数据", "big data"],
  python: ["python"],
  algorithm: ["算法", "algorithm"],
  "computer-foundations": ["计算机基础", "computer foundations"],
  "software-development": ["软件开发", "软件开发", "software development"],
  "data-processing": ["数据处理", "data processing"],
  linux: ["linux"],
  system: ["系统", "system"],
  operations: ["运维", "operations"],
  backend: ["后端", "后端开发", "backend"],
  database: ["数据库", "database"],
  "data-analysis": ["数据分析", "data analysis"],
  sql: ["sql"],
  java: ["java"],
  network: ["网络", "network"],
  "network-security": ["网络安全基础", "network security"],
  "operating-system": ["操作系统", "operating system"],
  "project-development": ["项目开发", "project development"],
  teamwork: ["团队协作", "teamwork"],
  "distributed-computing": ["分布式计算", "distributed computing"],
  spark: ["spark"],
};

function recommendationTokens(value: string) {
  const normalized = normalizeIdentityToken(value);
  return [normalized, ...(RECOMMENDATION_ALIASES[normalized] ?? [])].map(
    normalizeIdentityToken,
  );
}

function hasRuleMatch(values: string[], targets: string[]) {
  return targets.some((target) => {
    const aliases = recommendationTokens(target);
    return values.some((value) =>
      aliases.includes(normalizeIdentityToken(value)),
    );
  });
}

export function buildGrowthCourseRecommendations(
  profile: GrowthProfileSummary,
  courses: CourseListItem[],
): GrowthCourseRecommendation[] {
  const interests = (profile.technicalInterests ?? []).flatMap((value) => [
    value,
    getGrowthValueLabel(value, TECHNICAL_INTEREST_OPTIONS),
  ]);
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
      const rule = COURSE_RECOMMENDATION_RULES[course.slug];
      if (!rule || seen.has(course.id) || course.progressPercent >= 100)
        return null;
      seen.add(course.id);
      const courseTokens = courseIdentityTokens(course);
      const majorMatch = hasRuleMatch(
        [
          profile.major ?? "",
          getGrowthValueLabel(profile.major, MAJOR_OPTIONS),
        ],
        rule.majors,
      );
      const interestMatch = rule.interests.filter((interest) =>
        hasRuleMatch(interests, [interest]),
      ).length;
      const directionMatch = hasRuleMatch(
        [
          profile.learningDirection ?? "",
          getGrowthValueLabel(
            profile.learningDirection,
            LEARNING_DIRECTION_OPTIONS,
          ),
        ],
        rule.directions,
      );
      const tokenMatch = rule.interests.some((interest) =>
        recommendationTokens(interest).some((token) =>
          courseTokens.includes(token),
        ),
      );
      const missingPrerequisite = rule.prerequisites.find(
        (prerequisite) =>
          progressBySlug.has(prerequisite) && !completedSlugs.has(prerequisite),
      );
      if (missingPrerequisite && missingPrerequisite !== course.slug)
        return null;
      const score =
        (majorMatch ? 6 : 0) +
        interestMatch * 5 +
        (directionMatch ? 4 : 0) +
        (tokenMatch ? 1 : 0) +
        (course.progressPercent > 0 ? 3 : 0) +
        (missingPrerequisite ? 0 : 2);
      if (score === 0) return null;
      const matchedInterest = rule.interests.find((interest) =>
        hasRuleMatch(interests, [interest]),
      );
      const label = matchedInterest
        ? getGrowthValueLabel(
            `interest.${matchedInterest.replace(/-/g, "_")}`,
            TECHNICAL_INTEREST_OPTIONS,
          )
        : "";
      const reason =
        course.progressPercent > 0
          ? `你已完成 ${Math.round(course.progressPercent)}%，继续学习${label ? `你的 ${label}方向` : "当前课程"}`
          : label
            ? `结合你的 ${label} 兴趣和学习方向推荐`
            : majorMatch
              ? "结合你的专业方向和课程路径推荐"
              : "结合当前正式课程路径推荐";
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
