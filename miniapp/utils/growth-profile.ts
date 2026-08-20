export type GrowthProfileOption = {
  code: string;
  label: string;
};

export const MAJOR_OPTIONS: GrowthProfileOption[] = [
  { code: "major.data_science_big_data", label: "数据科学与大数据技术" },
  { code: "major.computer_science", label: "计算机科学与技术" },
  { code: "major.software_engineering", label: "软件工程" },
  { code: "major.artificial_intelligence", label: "人工智能" },
  { code: "major.big_data_management", label: "大数据管理与应用" },
  { code: "major.information_management", label: "信息管理与信息系统" },
];

export const GRADE_OPTIONS: GrowthProfileOption[] = [
  { code: "grade.freshman", label: "大一" },
  { code: "grade.sophomore", label: "大二" },
  { code: "grade.junior", label: "大三" },
  { code: "grade.senior", label: "大四" },
  { code: "grade.vocational", label: "专科" },
  { code: "grade.postgraduate", label: "研究生" },
  { code: "grade.working", label: "在职学习" },
];

export const LEARNING_DIRECTION_OPTIONS: GrowthProfileOption[] = [
  { code: "direction.frontend", label: "前端开发" },
  { code: "direction.backend", label: "后端开发" },
  { code: "direction.data_analysis", label: "数据分析" },
  { code: "direction.database", label: "数据库" },
  { code: "direction.ai_ml", label: "人工智能 / 机器学习" },
  { code: "direction.cybersecurity", label: "网络安全" },
  { code: "direction.systems", label: "系统与运维" },
  { code: "direction.big_data", label: "大数据处理" },
];

export const TECHNICAL_INTEREST_OPTIONS: GrowthProfileOption[] = [
  { code: "interest.python", label: "Python" },
  { code: "interest.javascript", label: "JavaScript" },
  { code: "interest.java", label: "Java" },
  { code: "interest.sql", label: "SQL" },
  { code: "interest.data_visualization", label: "数据可视化" },
  { code: "interest.database", label: "数据库" },
  { code: "interest.algorithm", label: "算法" },
  { code: "interest.web", label: "Web 开发" },
  { code: "interest.ai_ml", label: "AI / ML" },
  { code: "interest.linux", label: "Linux" },
  { code: "interest.system", label: "系统" },
  { code: "interest.operations", label: "运维" },
  { code: "interest.backend", label: "后端开发" },
  { code: "interest.data_processing", label: "数据处理" },
  { code: "interest.data_analysis", label: "数据分析" },
  { code: "interest.distributed_computing", label: "分布式计算" },
  { code: "interest.spark", label: "Spark" },
  { code: "interest.network", label: "网络" },
  { code: "interest.network_security", label: "网络安全基础" },
  { code: "interest.operating_system", label: "操作系统" },
  { code: "interest.computer_foundations", label: "计算机基础" },
  { code: "interest.software_development", label: "软件开发" },
  { code: "interest.project_development", label: "项目开发" },
  { code: "interest.teamwork", label: "团队协作" },
];

export const CAREER_DIRECTION_OPTIONS: GrowthProfileOption[] = [
  { code: "career.frontend_engineer", label: "前端工程师" },
  { code: "career.backend_engineer", label: "后端工程师" },
  { code: "career.data_analyst", label: "数据分析师" },
  { code: "career.algorithm_engineer", label: "算法工程师" },
  { code: "career.test_engineer", label: "测试工程师" },
  { code: "career.database_engineer", label: "数据库工程师" },
];

const CUSTOM_VALUE_PREFIX = "custom:";

export function buildCustomGrowthValue(value: string) {
  const normalized = value
    .trim()
    .replace(/^custom:/i, "")
    .trim();

  return normalized ? `${CUSTOM_VALUE_PREFIX}${normalized}` : "";
}

export function getCustomGrowthValue(value: string | null | undefined) {
  if (!value?.startsWith(CUSTOM_VALUE_PREFIX)) {
    return "";
  }

  return value.slice(CUSTOM_VALUE_PREFIX.length).trim();
}

export function getGrowthValueLabel(
  value: string | null | undefined,
  options: GrowthProfileOption[],
) {
  if (!value) {
    return "未设置";
  }

  const preset = options.find((option) => option.code === value);

  if (preset) {
    return preset.label;
  }

  return getCustomGrowthValue(value) || value;
}

export function resolveSingleGrowthValue(
  value: string | null | undefined,
  options: GrowthProfileOption[],
) {
  if (!value) {
    return { selectedCode: "", customValue: "" };
  }

  if (options.some((option) => option.code === value)) {
    return { selectedCode: value, customValue: "" };
  }

  return {
    selectedCode: "",
    customValue: getCustomGrowthValue(value) || value,
  };
}

export function dedupeGrowthValues(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}
