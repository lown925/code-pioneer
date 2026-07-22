export const API_BASE_URL = 'http://127.0.0.1:3000/api/v1';

export const LOGIN_PAGE_PATH = '/pages/auth/login';
export const PROFILE_PAGE_PATH = '/pages/profile/index';

const TAB_BAR_PATHS = new Set([
  '/pages/home/index',
  '/pages/battle/index',
  '/pages/community/index',
  '/pages/profile/index',
]);

export function normalizePagePath(path: string) {
  if (!path) {
    return PROFILE_PAGE_PATH;
  }

  return path.startsWith('/') ? path : `/${path}`;
}

export function isTabBarPage(path: string) {
  const normalized = normalizePagePath(path);
  const [pagePath] = normalized.split('?');

  return TAB_BAR_PATHS.has(pagePath);
}
