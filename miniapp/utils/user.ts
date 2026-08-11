import type {
  CurrentUserProfile,
  PublicUserProfileResponse,
  UpdateCurrentUserInput,
  UpdateCurrentUserResponse,
  UserAvatarUploadResponse,
  UserFollowListMode,
  UserFollowListResponse,
  UserFollowMutationResponse,
} from '../types/user';
import { RequestError, request, uploadFile } from './request';

export function uploadCurrentUserAvatar(filePath: string) {
  return uploadFile<UserAvatarUploadResponse>({
    url: '/users/me/avatar',
    filePath,
    authMode: 'required',
  });
}

export function fetchCurrentUserProfile() {
  return request<CurrentUserProfile>({
    url: '/users/me',
    method: 'GET',
    authMode: 'required',
  });
}

export function updateCurrentUser(data: UpdateCurrentUserInput) {
  return request<UpdateCurrentUserResponse>({
    url: '/users/me',
    method: 'PATCH',
    authMode: 'required',
    data,
  });
}

export function fetchUserProfile(userId: string) {
  return request<PublicUserProfileResponse>({
    url: `/users/${userId}/profile`,
    authMode: 'auto',
  });
}

export function followUser(userId: string) {
  return request<UserFollowMutationResponse>({
    url: `/users/${userId}/follow`,
    method: 'POST',
    authMode: 'required',
  });
}

export function unfollowUser(userId: string) {
  return request<UserFollowMutationResponse>({
    url: `/users/${userId}/follow`,
    method: 'DELETE',
    authMode: 'required',
  });
}

export function fetchUserFollowList(options: {
  userId: string;
  mode: UserFollowListMode;
  page: number;
  pageSize: number;
}) {
  return request<UserFollowListResponse>({
    url: `/users/${options.userId}/${options.mode}`,
    authMode: 'auto',
    data: {
      page: options.page,
      pageSize: options.pageSize,
    },
  });
}

export function getUserErrorMessage(
  error: unknown,
  fallback = '加载失败，请稍后重试',
) {
  if (error instanceof RequestError) {
    if (error.code === 'NETWORK_ERROR') {
      return '网络连接失败，请确认服务可用后重试';
    }

    if (error.code === 'API_CONFIG_INVALID') {
      return error.message || '当前环境接口配置有误';
    }

    if (error.statusCode === 401 || error.code === 'UNAUTHORIZED') {
      return '登录状态已失效，请重新登录后再试';
    }

    if (error.code === 'USER_NOT_FOUND') {
      return '用户不存在或已不可见';
    }

    if (error.code === 'USER_FOLLOW_SELF_NOT_ALLOWED') {
      return '不能关注自己';
    }

    return fallback;
  }

  return fallback;
}
