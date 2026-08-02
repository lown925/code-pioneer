import type {
  CommunityCategoriesResponse,
  CommunityCommentsResponse,
  CommunityCreateCommentResponse,
  CommunityCreatePostResponse,
  CommunityCursorQuery,
  CommunityDeleteHistoryResponse,
  CommunityDeletePostResponse,
  CommunityFavoriteMutationResponse,
  CommunityFavoritesResponse,
  CommunityHistoryResponse,
  CommunityMyPostsQuery,
  CommunityMyPostsResponse,
  CommunityPostImage,
  CommunityPostListItem,
  CommunityPostDetail,
  CommunityPostStatus,
  CommunityPostsQuery,
  CommunityPostsResponse,
  CommunitySummaryResponse,
  CommunityUploadImageResponse,
  CommunityCategoryKey,
} from '../types/community';
import { RequestError, getApiBaseUrl, request, uploadFile } from './request';
import { formatLearningTimestamp } from './time';

const COMMUNITY_CONTENT_VERSION_KEY = 'code-pioneer.community.version.content';
const COMMUNITY_COLLECTION_VERSION_KEY =
  'code-pioneer.community.version.collection';
const COMMUNITY_HISTORY_VERSION_KEY = 'code-pioneer.community.version.history';

function readVersion(key: string) {
  try {
    const value = wx.getStorageSync(key);

    return typeof value === 'number' && Number.isFinite(value) ? value : 0;
  } catch {
    return 0;
  }
}

function writeVersion(key: string, value: number) {
  try {
    wx.setStorageSync(key, value);
  } catch {
    // Ignore transient storage issues for UI-only refresh signals.
  }
}

function bumpVersion(key: string) {
  const nextValue = Date.now();
  writeVersion(key, nextValue);
  return nextValue;
}

export function getCommunityVersionSnapshot() {
  return {
    contentVersion: readVersion(COMMUNITY_CONTENT_VERSION_KEY),
    collectionVersion: readVersion(COMMUNITY_COLLECTION_VERSION_KEY),
    historyVersion: readVersion(COMMUNITY_HISTORY_VERSION_KEY),
  };
}

export function bumpCommunityContentVersion() {
  return bumpVersion(COMMUNITY_CONTENT_VERSION_KEY);
}

export function bumpCommunityCollectionVersion() {
  return bumpVersion(COMMUNITY_COLLECTION_VERSION_KEY);
}

export function bumpCommunityHistoryVersion() {
  return bumpVersion(COMMUNITY_HISTORY_VERSION_KEY);
}

export function fetchCommunityCategories() {
  return request<CommunityCategoriesResponse>({
    url: '/community/categories',
  });
}

export function fetchCommunityPosts(query: CommunityPostsQuery) {
  return request<CommunityPostsResponse>({
    url: '/community/posts',
    data: query as WechatMiniprogram.IAnyObject,
  }).then((response) => ({
    ...response,
    items: response.items.map((item) => normalizeCommunityPostListItem(item)),
  }));
}

export function createCommunityPost(data: {
  categoryKey: CommunityCategoryKey;
  title: string;
  content: string;
  images?: Array<{
    objectKey: string;
    url: string;
  }>;
}) {
  return request<CommunityCreatePostResponse>({
    url: '/community/posts',
    method: 'POST',
    authMode: 'required',
    data: data as WechatMiniprogram.IAnyObject,
  });
}

export function uploadCommunityImage(filePath: string) {
  return uploadFile<CommunityUploadImageResponse>({
    url: '/community/images',
    filePath,
    authMode: 'required',
  }).then((response) => ({
    image: {
      ...response.image,
      url: normalizeCommunityAssetUrl(response.image.url),
    },
  }));
}

export function fetchCommunityPostDetail(postId: string) {
  return request<CommunityPostDetail>({
    url: `/community/posts/${postId}`,
  }).then((response) => normalizeCommunityPostDetail(response));
}

export function fetchCommunityComments(postId: string) {
  return request<CommunityCommentsResponse>({
    url: `/community/posts/${postId}/comments`,
  });
}

export function createCommunityComment(postId: string, content: string) {
  return request<CommunityCreateCommentResponse>({
    url: `/community/posts/${postId}/comments`,
    method: 'POST',
    authMode: 'required',
    data: {
      content,
    },
  });
}

export function deleteCommunityPost(postId: string) {
  return request<CommunityDeletePostResponse>({
    url: `/community/posts/${postId}`,
    method: 'DELETE',
    authMode: 'required',
  });
}

export function favoriteCommunityPost(postId: string) {
  return request<CommunityFavoriteMutationResponse>({
    url: `/community/posts/${postId}/favorite`,
    method: 'POST',
    authMode: 'required',
  });
}

export function unfavoriteCommunityPost(postId: string) {
  return request<CommunityFavoriteMutationResponse>({
    url: `/community/posts/${postId}/favorite`,
    method: 'DELETE',
    authMode: 'required',
  });
}

export function fetchMyCommunityFavorites(query: CommunityCursorQuery) {
  return request<CommunityFavoritesResponse>({
    url: '/users/me/community/favorites',
    authMode: 'required',
    data: query as WechatMiniprogram.IAnyObject,
  }).then((response) => ({
    ...response,
    items: response.items.map((item) => ({
      ...item,
      post: normalizeCommunityPostListItem(item.post),
    })),
  }));
}

export function fetchMyCommunityHistory(query: CommunityCursorQuery) {
  return request<CommunityHistoryResponse>({
    url: '/users/me/community/history',
    authMode: 'required',
    data: query as WechatMiniprogram.IAnyObject,
  }).then((response) => ({
    ...response,
    items: response.items.map((item) => ({
      ...item,
      post: normalizeCommunityPostListItem(item.post),
    })),
  }));
}

export function deleteMyCommunityHistoryItem(postId: string) {
  return request<CommunityDeleteHistoryResponse>({
    url: `/users/me/community/history/${postId}`,
    method: 'DELETE',
    authMode: 'required',
  });
}

export function clearMyCommunityHistory() {
  return request<CommunityDeleteHistoryResponse>({
    url: '/users/me/community/history',
    method: 'DELETE',
    authMode: 'required',
  });
}

export function fetchMyCommunityPosts(query: CommunityMyPostsQuery) {
  return request<CommunityMyPostsResponse>({
    url: '/users/me/community/posts',
    authMode: 'required',
    data: query as WechatMiniprogram.IAnyObject,
  }).then((response) => ({
    ...response,
    items: response.items.map((item) => normalizeCommunityPostDetail(item)),
  }));
}

export function fetchMyCommunitySummary() {
  return request<CommunitySummaryResponse>({
    url: '/users/me/community/summary',
    authMode: 'required',
  });
}

export function formatCommunityTimestamp(value: string | null | undefined) {
  return formatLearningTimestamp(value);
}

export function normalizeCommunityCategoryKey(
  value: unknown,
): CommunityCategoryKey | '' {
  if (
    value === 'LEARNING' ||
    value === 'BATTLE' ||
    value === 'CODE_HELP' ||
    value === 'CAREER' ||
    value === 'GENERAL'
  ) {
    return value;
  }

  return '';
}

export function getCommunityStatusLabel(status: CommunityPostStatus) {
  if (status === 'HIDDEN') {
    return '已隐藏';
  }

  if (status === 'DELETED') {
    return '已删除';
  }

  return '已发布';
}

export function getCommunityErrorMessage(
  error: unknown,
  fallback = '加载失败，请稍后重试',
) {
  if (error instanceof RequestError) {
    if (error.code === 'NETWORK_ERROR') {
      return '网络连接失败，请确认服务可用后重试';
    }

    if (error.code === 'API_CONFIG_INVALID') {
      return error.message || '当前环境的接口地址配置有误';
    }

    if (error.statusCode === 401 || error.code === 'UNAUTHORIZED') {
      return '登录状态已失效，请重新登录后再试';
    }

    if (error.code === 'COMMUNITY_POST_NOT_FOUND') {
      return '帖子不存在或已被删除';
    }

    if (error.code === 'COMMUNITY_POST_FORBIDDEN') {
      return '只有作者可以删除自己的帖子';
    }

    if (error.code === 'COMMUNITY_CATEGORY_NOT_FOUND') {
      return '所选分区不存在，请重新选择';
    }

    if (error.code === 'COMMUNITY_CATEGORY_DISABLED') {
      return '当前分区暂时不支持发帖';
    }

    if (error.code === 'COMMUNITY_POST_TITLE_INVALID') {
      return '标题需要 2 到 80 个字';
    }

    if (error.code === 'COMMUNITY_POST_CONTENT_INVALID') {
      return '正文需要 1 到 4000 个字';
    }

    if (error.code === 'COMMUNITY_COMMENT_CONTENT_INVALID') {
      return '评论内容需要 1 到 1000 个字';
    }

    if (error.code === 'COMMUNITY_IMAGE_FILE_REQUIRED') {
      return '请先选择要上传的图片';
    }

    if (error.code === 'COMMUNITY_IMAGE_TYPE_INVALID') {
      return '仅支持 JPG、PNG、WebP 或 GIF 图片';
    }

    if (error.code === 'COMMUNITY_IMAGE_TOO_LARGE') {
      return '单张图片不能超过 5 MB';
    }

    if (
      error.code === 'COMMUNITY_POST_IMAGE_LIMIT_EXCEEDED' ||
      error.code === 'COMMUNITY_POST_IMAGE_INVALID'
    ) {
      return '帖子图片数据无效，请重新选择后再试';
    }

    return fallback;
  }

  if (error instanceof Error && error.message.trim()) {
    return fallback;
  }

  return fallback;
}

export function isUuid(value: string | undefined | null) {
  if (!value) {
    return false;
  }

  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function normalizeCommunityAssetUrl(url: string) {
  if (!url || /^https?:\/\//i.test(url)) {
    return url;
  }

  const apiBaseUrl = getApiBaseUrl();
  const originMatch = apiBaseUrl.match(/^(https?:\/\/[^/]+)/i);
  const origin = originMatch?.[1] ?? '';

  if (!origin) {
    return url;
  }

  return url.startsWith('/') ? `${origin}${url}` : `${origin}/${url}`;
}

function normalizeCommunityPostImages(images: CommunityPostImage[]) {
  return images.map((image) => ({
    ...image,
    url: normalizeCommunityAssetUrl(image.url),
  }));
}

function normalizeCommunityPostListItem(item: CommunityPostListItem) {
  return {
    ...item,
    imagePreview: item.imagePreview.map((url) => normalizeCommunityAssetUrl(url)),
  };
}

function normalizeCommunityPostDetail(item: CommunityPostDetail) {
  const normalizedListItem = normalizeCommunityPostListItem(item);

  return {
    ...item,
    imagePreview: normalizedListItem.imagePreview,
    images: normalizeCommunityPostImages(item.images),
  };
}
