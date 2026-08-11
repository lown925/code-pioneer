const REMOVED_COMMUNITY_PAGE_PATHS = new Set([
  '/pages/profile/community-posts',
  '/pages/profile/community-favorites',
  '/pages/profile/community-history',
]);

export function sanitizeLoginRedirectPath(
  target: string,
  fallback: string,
) {
  const [pagePath] = target.split('?');

  if (
    pagePath.startsWith('/pages/community/') ||
    REMOVED_COMMUNITY_PAGE_PATHS.has(pagePath)
  ) {
    return fallback;
  }

  return target;
}
