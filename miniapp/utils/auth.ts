import type {
  AppAuthStateSummary,
  AuthSession,
  AuthUserProfile,
  LoginResponseData,
  MiniProgramEnvVersion,
  RefreshResponseData,
} from '../types/auth';
import {
  LOGIN_PAGE_PATH,
  DEFAULT_TAB_PAGE_PATH,
  CURRENT_ENV_VERSION,
  getEnvironmentStorageKey,
  isTabBarPage,
  getMiniProgramEnvVersion as getConfiguredEnvVersion,
  normalizePagePath,
} from './config';

const AUTH_STORAGE_KEY = getEnvironmentStorageKey('auth.session');
const ACCESS_TOKEN_REFRESH_BUFFER_MS = 30_000;

let cachedSession: AuthSession | null | undefined;
let currentSummary: AppAuthStateSummary = {
  isReady: false,
  isAuthenticated: false,
  user: null,
  envVersion: 'unknown',
};
let loginNavigationPending = false;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isValidUser(value: unknown): value is AuthUserProfile {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const user = value as Partial<AuthUserProfile>;

  return (
    isNonEmptyString(user.id) &&
    (user.nickname === null || typeof user.nickname === 'string') &&
    (user.avatarUrl === null || typeof user.avatarUrl === 'string') &&
    typeof user.status === 'string' &&
    typeof user.experience === 'number' &&
    typeof user.battleRating === 'number' &&
    typeof user.continuousLearningDays === 'number'
  );
}

function isValidSession(value: unknown): value is AuthSession {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const session = value as Partial<AuthSession>;

  return (
    isNonEmptyString(session.accessToken) &&
    isNonEmptyString(session.refreshToken) &&
    typeof session.expiresIn === 'number' &&
    typeof session.updatedAt === 'number' &&
    (session.user === null || isValidUser(session.user))
  );
}

function readStoredSession() {
  try {
    const value = wx.getStorageSync(AUTH_STORAGE_KEY);

    return isValidSession(value) ? value : null;
  } catch {
    return null;
  }
}

function getCachedSession() {
  if (cachedSession === undefined) {
    cachedSession = readStoredSession();
  }

  return cachedSession;
}

function getCurrentPageUrl() {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];

  if (!currentPage?.route) {
    return DEFAULT_TAB_PAGE_PATH;
  }

  const path = normalizePagePath(currentPage.route);
  const options = currentPage.options ?? {};
  const query = Object.entries(options)
    .filter((entry): entry is [string, string] => typeof entry[1] === 'string')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');

  return query ? `${path}?${query}` : path;
}

function syncGlobalAuthState(summary: AppAuthStateSummary) {
  try {
    const app = getApp<IAppOption>();

    if (app?.globalData) {
      app.globalData.authState = summary;
      app.globalData.envVersion = summary.envVersion;
    }
  } catch {
    // Ignore getApp access before the app instance becomes available.
  }
}

function updateSummary(session: AuthSession | null) {
  currentSummary = {
    isReady: true,
    isAuthenticated: Boolean(session?.accessToken && session.refreshToken),
    user: session?.user ?? null,
    envVersion: getMiniProgramEnvVersion(),
  };
  syncGlobalAuthState(currentSummary);

  return currentSummary;
}

function persistSession(session: AuthSession | null) {
  cachedSession = session;

  try {
    if (session) {
      wx.setStorageSync(AUTH_STORAGE_KEY, session);
    } else {
      wx.removeStorageSync(AUTH_STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors and keep in-memory auth state in sync.
  }

  updateSummary(session);
}

export function getMiniProgramEnvVersion(): MiniProgramEnvVersion {
  return getConfiguredEnvVersion();
}

export function isDevelopmentEnvironment() {
  return CURRENT_ENV_VERSION === 'develop';
}

export function initializeAuthState() {
  const session = readStoredSession();

  cachedSession = session;

  return updateSummary(session);
}

export function getAuthStateSummary() {
  if (!currentSummary.isReady) {
    return updateSummary(getCachedSession());
  }

  return currentSummary;
}

export function getAccessToken() {
  return getCachedSession()?.accessToken ?? '';
}

export function getRefreshToken() {
  return getCachedSession()?.refreshToken ?? '';
}

export function getCurrentUser() {
  return getCachedSession()?.user ?? null;
}

export function hasRefreshToken() {
  return Boolean(getRefreshToken());
}

export function shouldRefreshAccessToken(currentTime = Date.now()) {
  const session = getCachedSession();

  if (!session?.accessToken) {
    return false;
  }

  const expiresInMs = session.expiresIn * 1000;
  const refreshBufferMs = Math.min(
    ACCESS_TOKEN_REFRESH_BUFFER_MS,
    Math.max(1_000, expiresInMs * 0.1),
  );
  const expiresAt = session.updatedAt + expiresInMs;

  return expiresAt <= currentTime + refreshBufferMs;
}

export function saveLoginSession(payload: LoginResponseData) {
  persistSession({
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
    user: payload.user,
    expiresIn: payload.expiresIn,
    updatedAt: Date.now(),
  });
}

export function saveRefreshedSession(payload: RefreshResponseData) {
  const existing = getCachedSession();

  persistSession({
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
    user: existing?.user ?? null,
    expiresIn: payload.expiresIn,
    updatedAt: Date.now(),
  });
}

export function updateStoredUserProfile(user: AuthUserProfile) {
  const existing = getCachedSession();

  if (!existing) {
    return;
  }

  persistSession({
    ...existing,
    user,
  });
}

export function clearAuthSession() {
  persistSession(null);
}

export function redirectToLogin(redirectPath?: string) {
  const currentUrl = getCurrentPageUrl();
  const [currentPagePath] = currentUrl.split('?');

  if (currentPagePath === LOGIN_PAGE_PATH || loginNavigationPending) {
    return;
  }

  const target = normalizePagePath(redirectPath || currentUrl);
  const loginUrl = `${LOGIN_PAGE_PATH}?redirect=${encodeURIComponent(target)}`;

  loginNavigationPending = true;

  wx.navigateTo({
    url: loginUrl,
    complete: () => {
      loginNavigationPending = false;
    },
    fail: () => {
      wx.reLaunch({
        url: loginUrl,
        complete: () => {
          loginNavigationPending = false;
        },
      });
    },
  });
}

export function finishLoginNavigation(redirectPath?: string) {
  const target = normalizePagePath(redirectPath || DEFAULT_TAB_PAGE_PATH);
  const [pagePath] = target.split('?');

  if (isTabBarPage(pagePath)) {
    wx.switchTab({
      url: pagePath,
    });
    return;
  }

  wx.redirectTo({
    url: target,
    fail: () => {
      wx.reLaunch({
        url: DEFAULT_TAB_PAGE_PATH,
      });
    },
  });
}
