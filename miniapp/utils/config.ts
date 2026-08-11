import { PUBLIC_API_ENVIRONMENT_CONFIG } from "./public-env";

type MiniProgramEnvVersion = "develop" | "trial" | "release" | "unknown";

type ApiEnvironmentConfig = {
  localApiBaseUrl: string;
  trialApiBaseUrl: string;
  releaseApiBaseUrl: string;
};

type ResolvedApiConfig = {
  envVersion: MiniProgramEnvVersion;
  apiBaseUrl: string;
  configErrorMessage: string;
};

const DEFAULT_ENVIRONMENT_CONFIG: ApiEnvironmentConfig = {
  localApiBaseUrl: PUBLIC_API_ENVIRONMENT_CONFIG.developApiBaseUrl,
  trialApiBaseUrl: PUBLIC_API_ENVIRONMENT_CONFIG.trialApiBaseUrl,
  releaseApiBaseUrl: PUBLIC_API_ENVIRONMENT_CONFIG.releaseApiBaseUrl,
};

const RUNTIME_CONFIG_STORAGE_KEY = "code-pioneer.develop.runtime.api-config.v2";
const LEGACY_RUNTIME_CONFIG_STORAGE_KEYS = [
  "code-pioneer.runtime.api-config",
  "code-pioneer.develop.runtime.api-config",
];

export const LOGIN_PAGE_PATH = "/pages/auth/login";
export const DEFAULT_TAB_PAGE_PATH = "/pages/battle/index";

const TAB_BAR_PATHS = new Set([
  "/pages/battle/index",
  "/pages/learning/index",
  "/pages/profile/index",
]);

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeUrl(value: string | null | undefined) {
  return typeof value === "string" ? value.trim().replace(/\/+$/, "") : "";
}

function isLocalAddress(url: string) {
  return /\/\/(localhost|127\.0\.0\.1)(?::\d+)?\//i.test(url);
}

function parseApiUrl(url: string) {
  const match = /^(https?):\/\/([^/?#]+)(\/[^?#]*)?(?:[?#].*)?$/i.exec(url);

  if (!match) {
    return null;
  }

  return {
    protocol: `${match[1].toLowerCase()}:`,
    host: match[2],
    pathname: match[3] || "/",
  };
}

function readRuntimeConfigOverride() {
  try {
    // The unscoped key was used by an older build and may keep an obsolete host alive.
    LEGACY_RUNTIME_CONFIG_STORAGE_KEYS.forEach((key) => {
      wx.removeStorageSync(key);
    });
    const value = wx.getStorageSync(RUNTIME_CONFIG_STORAGE_KEY);

    if (!isObject(value)) {
      return null;
    }

    const localApiBaseUrl = normalizeUrl(value.localApiBaseUrl as string);

    if (
      !localApiBaseUrl ||
      validateApiBaseUrl("develop", localApiBaseUrl).length > 0
    ) {
      wx.removeStorageSync(RUNTIME_CONFIG_STORAGE_KEY);
      return null;
    }

    return { localApiBaseUrl };
  } catch {
    return null;
  }
}

function getEnvironmentConfig(): ApiEnvironmentConfig {
  const override = readRuntimeConfigOverride();

  return {
    localApiBaseUrl:
      override?.localApiBaseUrl || DEFAULT_ENVIRONMENT_CONFIG.localApiBaseUrl,
    trialApiBaseUrl: DEFAULT_ENVIRONMENT_CONFIG.trialApiBaseUrl,
    releaseApiBaseUrl: DEFAULT_ENVIRONMENT_CONFIG.releaseApiBaseUrl,
  };
}

export function getMiniProgramEnvVersion(): MiniProgramEnvVersion {
  try {
    const accountInfo = wx.getAccountInfoSync();
    const envVersion = accountInfo.miniProgram.envVersion;

    if (
      envVersion === "develop" ||
      envVersion === "trial" ||
      envVersion === "release"
    ) {
      return envVersion;
    }
  } catch {
    return "unknown";
  }

  return "unknown";
}

function validateApiBaseUrl(
  envVersion: MiniProgramEnvVersion,
  apiBaseUrl: string,
) {
  if (envVersion === "unknown") {
    return "无法识别当前小程序环境，请在微信开发者工具或体验版环境中重新启动。";
  }

  const normalized = normalizeUrl(apiBaseUrl);

  if (!normalized) {
    if (envVersion === "trial") {
      return "当前未配置体验版测试 API 地址，请先配置 trial 环境 HTTPS 接口地址。";
    }

    if (envVersion === "release") {
      return "当前未配置正式环境 API 地址，请先配置 release 环境 HTTPS 接口地址。";
    }

    return "当前未配置开发环境 API 地址，请检查小程序环境配置。";
  }

  const parsed = parseApiUrl(normalized);

  if (!parsed || !["http:", "https:"].includes(parsed.protocol)) {
    return "API 地址格式无效，请使用完整的 http:// 或 https:// 地址。";
  }

  if (parsed.pathname !== "/api/v1") {
    return "API 地址必须且只能包含一次 /api/v1 路径。";
  }

  if (
    normalized.includes("siteapi") ||
    /\/api\/v1\/api\/v1/i.test(normalized)
  ) {
    return "API 地址存在错误拼接，请检查域名与 /api/v1 路径。";
  }

  if (envVersion === "develop") {
    return "";
  }

  if (isLocalAddress(normalized)) {
    return `${envVersion} 环境禁止使用 localhost 或 127.0.0.1 作为 API 地址。`;
  }

  if (parsed.protocol !== "https:") {
    return `${envVersion} 环境必须使用 HTTPS API 地址。`;
  }

  return "";
}

export function resolveApiConfig(): ResolvedApiConfig {
  const envVersion = getMiniProgramEnvVersion();
  const environmentConfig = getEnvironmentConfig();

  const apiBaseUrl =
    envVersion === "trial"
      ? environmentConfig.trialApiBaseUrl
      : envVersion === "release"
        ? environmentConfig.releaseApiBaseUrl
        : envVersion === "develop"
          ? environmentConfig.localApiBaseUrl
          : "";

  return {
    envVersion,
    apiBaseUrl: normalizeUrl(apiBaseUrl),
    configErrorMessage: validateApiBaseUrl(envVersion, apiBaseUrl),
  };
}

const resolvedApiConfig = resolveApiConfig();

export const CURRENT_ENV_VERSION = resolvedApiConfig.envVersion;
export const API_BASE_URL = resolvedApiConfig.apiBaseUrl;
export const API_CONFIG_ERROR_MESSAGE = resolvedApiConfig.configErrorMessage;

export function getEnvironmentStorageKey(key: string) {
  return `code-pioneer.${CURRENT_ENV_VERSION}.${key}`;
}

export function hasApiConfigurationError() {
  return API_CONFIG_ERROR_MESSAGE.length > 0;
}

export function getApiConfigurationErrorMessage() {
  return API_CONFIG_ERROR_MESSAGE;
}

export function getApiHost() {
  return parseApiUrl(API_BASE_URL)?.host || "未解析";
}

export function normalizePagePath(path: string) {
  if (!path) {
    return DEFAULT_TAB_PAGE_PATH;
  }

  return path.startsWith("/") ? path : `/${path}`;
}

export function isTabBarPage(path: string) {
  const normalized = normalizePagePath(path);
  const [pagePath] = normalized.split("?");

  return TAB_BAR_PATHS.has(pagePath);
}
