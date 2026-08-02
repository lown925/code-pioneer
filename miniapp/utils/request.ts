import type { RefreshResponseData } from '../types/auth';
import {
  clearAuthSession,
  getAccessToken,
  getRefreshToken,
  hasRefreshToken,
  redirectToLogin,
  saveRefreshedSession,
  shouldRefreshAccessToken,
} from './auth';
import {
  API_BASE_URL,
  CURRENT_ENV_VERSION,
  getApiConfigurationErrorMessage,
  hasApiConfigurationError,
} from './config';

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
type AuthMode = 'auto' | 'required' | 'none';

type RequestOptions = {
  url: string;
  method?: RequestMethod;
  data?: WechatMiniprogram.IAnyObject;
  authMode?: AuthMode;
  retryOnAuthFailure?: boolean;
  disableAuthRedirect?: boolean;
  headers?: Record<string, string>;
};

type UploadFileOptions = {
  url: string;
  filePath: string;
  name?: string;
  formData?: WechatMiniprogram.IAnyObject;
  authMode?: AuthMode;
  retryOnAuthFailure?: boolean;
  disableAuthRedirect?: boolean;
  headers?: Record<string, string>;
};

type ApiSuccess<T> = {
  success: true;
  data: T;
  message?: string;
  requestId?: string;
};

type ApiFailureEnvelope = {
  success: false;
  error?: {
    code?: string;
    message?: string;
  };
  message?: string;
  requestId?: string;
};

type NestExceptionPayload = {
  statusCode?: number;
  message?: string | string[];
  error?: string;
};

type InternalRequestOptions = RequestOptions & {
  method: RequestMethod;
  authMode: AuthMode;
  retryOnAuthFailure: boolean;
  disableAuthRedirect: boolean;
};

type InternalUploadFileOptions = UploadFileOptions & {
  authMode: AuthMode;
  retryOnAuthFailure: boolean;
  disableAuthRedirect: boolean;
};

type AuthFailureOptions = {
  authMode: AuthMode;
  disableAuthRedirect: boolean;
};

const DEFAULT_TIMEOUT_MS = 10000;
const CLIENT_ENVIRONMENT_HEADER = {
  'X-Client-Environment': CURRENT_ENV_VERSION,
};

let refreshPromise: Promise<string> | null = null;

function getAppApiBaseUrl() {
  try {
    return getApp<IAppOption>().globalData.apiBaseUrl || API_BASE_URL;
  } catch {
    return API_BASE_URL;
  }
}

function toAbsoluteUrl(url: string) {
  if (/^https?:\/\//.test(url)) {
    return url;
  }

  return `${getAppApiBaseUrl()}${url}`;
}

function normalizeApiPath(url: string) {
  if (/^https?:\/\//.test(url)) {
    return url.replace(getAppApiBaseUrl(), '');
  }

  return url;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function pickMessage(value: unknown) {
  if (Array.isArray(value)) {
    return typeof value[0] === 'string' ? value[0] : '';
  }

  return typeof value === 'string' ? value : '';
}

function isLoginRequest(url: string) {
  return normalizeApiPath(url) === '/auth/wechat-login';
}

function isRefreshRequest(url: string) {
  return normalizeApiPath(url) === '/auth/refresh';
}

function isLogoutRequest(url: string) {
  return normalizeApiPath(url) === '/auth/logout';
}

function shouldHandleForbiddenAsAuthError(code: string) {
  return code === 'USER_DELETED' || code === 'USER_DISABLED';
}

function shouldRedirectAfterAuthFailure(options: AuthFailureOptions) {
  return options.authMode === 'required' && !options.disableAuthRedirect;
}

export class RequestError extends Error {
  statusCode: number;
  code: string;
  requestId: string;
  details: unknown;

  constructor(options: {
    message: string;
    code?: string;
    statusCode?: number;
    requestId?: string;
    details?: unknown;
  }) {
    super(options.message);
    this.name = 'RequestError';
    this.statusCode = options.statusCode ?? 0;
    this.code = options.code ?? '';
    this.requestId = options.requestId ?? '';
    this.details = options.details;
  }
}

function toRequestError(statusCode: number, payload: unknown) {
  if (isObject(payload) && payload.success === false) {
    const envelope = payload as ApiFailureEnvelope;
    const code = envelope.error?.code || envelope.error?.message || envelope.message || '';
    const message =
      envelope.error?.message ||
      envelope.message ||
      `Request failed with status ${statusCode}`;

    return new RequestError({
      statusCode,
      code,
      message,
      requestId: envelope.requestId,
      details: payload,
    });
  }

  if (isObject(payload) && typeof payload.statusCode === 'number') {
    const nestPayload = payload as NestExceptionPayload;
    const message =
      pickMessage(nestPayload.message) ||
      nestPayload.error ||
      `Request failed with status ${statusCode}`;

    return new RequestError({
      statusCode,
      code: pickMessage(nestPayload.message),
      message,
      details: payload,
    });
  }

  if (typeof payload === 'string') {
    return new RequestError({
      statusCode,
      code: payload,
      message: payload,
      details: payload,
    });
  }

  return new RequestError({
    statusCode,
    message: `Request failed with status ${statusCode}`,
    details: payload,
  });
}

function buildHeaders(options: InternalRequestOptions) {
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    ...options.headers,
    ...CLIENT_ENVIRONMENT_HEADER,
  };

  if (options.authMode !== 'none') {
    const accessToken = getAccessToken();

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }
  }

  return headers;
}

function sanitizeRequestData(
  data: WechatMiniprogram.IAnyObject | undefined,
) {
  if (!data) {
    return undefined;
  }

  const sanitizedEntries = Object.entries(data).filter(
    ([, value]) => value !== undefined,
  );

  if (sanitizedEntries.length === 0) {
    return undefined;
  }

  return Object.fromEntries(sanitizedEntries) as WechatMiniprogram.IAnyObject;
}

function handleTerminalAuthFailure(options: AuthFailureOptions) {
  clearAuthSession();

  if (shouldRedirectAfterAuthFailure(options)) {
    redirectToLogin();
  }
}

function sendRequest<T>(
  options: InternalRequestOptions,
  headers: Record<string, string>,
) {
  return new Promise<T>((resolve, reject) => {
    if (hasApiConfigurationError()) {
      reject(
        new RequestError({
          code: 'API_CONFIG_INVALID',
          message: getApiConfigurationErrorMessage(),
        }),
      );
      return;
    }

    wx.request<ApiSuccess<T> | ApiFailureEnvelope | NestExceptionPayload>({
      url: toAbsoluteUrl(options.url),
      method: options.method,
      data: sanitizeRequestData(options.data),
      header: headers,
      timeout: DEFAULT_TIMEOUT_MS,
      success: (response) => {
        const payload = response.data;

        if (
          response.statusCode >= 200 &&
          response.statusCode < 300 &&
          isObject(payload) &&
          'success' in payload &&
          payload.success === true
        ) {
          resolve((payload as ApiSuccess<T>).data);
          return;
        }

        reject(toRequestError(response.statusCode, payload));
      },
      fail: () => {
        reject(
          new RequestError({
            code: 'NETWORK_ERROR',
            message:
              'Network request failed. Please confirm the backend is reachable from WeChat devtools.',
          }),
        );
      },
    });
  });
}

async function refreshAccessToken(redirectOnFailure: boolean) {
  if (refreshPromise) {
    return refreshPromise;
  }

  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    clearAuthSession();

    if (redirectOnFailure) {
      redirectToLogin();
    }

    throw new RequestError({
      statusCode: 401,
      code: 'UNAUTHORIZED',
      message: 'Authentication is missing or expired. Please log in again.',
    });
  }

  refreshPromise = (async () => {
    try {
      const data = await sendRequest<RefreshResponseData>(
        {
          url: '/auth/refresh',
          method: 'POST',
          data: {
            refreshToken,
          },
          authMode: 'none',
          retryOnAuthFailure: false,
          disableAuthRedirect: true,
        },
        {
          'content-type': 'application/json',
          ...CLIENT_ENVIRONMENT_HEADER,
        },
      );

      saveRefreshedSession(data);

      return data.accessToken;
    } catch (error) {
      clearAuthSession();

      if (redirectOnFailure) {
        redirectToLogin();
      }

      throw error;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

async function requestInternal<T>(
  options: InternalRequestOptions,
  retryCount: number,
): Promise<T> {
  if (
    options.authMode === 'required' &&
    options.retryOnAuthFailure &&
    hasRefreshToken() &&
    !isRefreshRequest(options.url) &&
    (!getAccessToken() || shouldRefreshAccessToken())
  ) {
    await refreshAccessToken(shouldRedirectAfterAuthFailure(options));
  }

  if (options.authMode === 'required' && !getAccessToken()) {
    handleTerminalAuthFailure(options);
    throw new RequestError({
      statusCode: 401,
      code: 'UNAUTHORIZED',
      message: 'Authentication is missing or expired. Please log in again.',
    });
  }

  try {
    return await sendRequest<T>(options, buildHeaders(options));
  } catch (error) {
    if (!(error instanceof RequestError)) {
      throw error;
    }

    if (
      error.statusCode === 401 &&
      options.retryOnAuthFailure &&
      retryCount === 0 &&
      hasRefreshToken() &&
      !isLoginRequest(options.url) &&
      !isRefreshRequest(options.url) &&
      !isLogoutRequest(options.url)
    ) {
      await refreshAccessToken(shouldRedirectAfterAuthFailure(options));

      return requestInternal<T>(
        {
          ...options,
          retryOnAuthFailure: false,
        },
        retryCount + 1,
      );
    }

    if (shouldHandleForbiddenAsAuthError(error.code)) {
      handleTerminalAuthFailure(options);
    }

    throw error;
  }
}

export function request<T>(options: RequestOptions) {
  return requestInternal<T>(
    {
      method: options.method ?? 'GET',
      authMode: options.authMode ?? 'auto',
      retryOnAuthFailure: options.retryOnAuthFailure ?? true,
      disableAuthRedirect: options.disableAuthRedirect ?? false,
      ...options,
    },
    0,
  );
}

export function getApiBaseUrl() {
  return getAppApiBaseUrl();
}

function sendUploadFile<T>(options: InternalUploadFileOptions) {
  return new Promise<T>((resolve, reject) => {
    if (hasApiConfigurationError()) {
      reject(
        new RequestError({
          code: 'API_CONFIG_INVALID',
          message: getApiConfigurationErrorMessage(),
        }),
      );
      return;
    }

    const headers: Record<string, string> = {
      ...(options.headers ?? {}),
      ...CLIENT_ENVIRONMENT_HEADER,
    };

    if (options.authMode !== 'none') {
      const accessToken = getAccessToken();

      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }
    }

    wx.uploadFile({
      url: toAbsoluteUrl(options.url),
      filePath: options.filePath,
      name: options.name ?? 'file',
      formData: sanitizeRequestData(options.formData),
      header: headers,
      success: (response) => {
        let payload:
          | ApiSuccess<T>
          | ApiFailureEnvelope
          | NestExceptionPayload
          | string;

        try {
          payload =
            typeof response.data === 'string'
              ? JSON.parse(response.data)
              : response.data;
        } catch {
          payload = response.data;
        }

        if (
          response.statusCode >= 200 &&
          response.statusCode < 300 &&
          isObject(payload) &&
          'success' in payload &&
          payload.success === true
        ) {
          resolve((payload as ApiSuccess<T>).data);
          return;
        }

        reject(toRequestError(response.statusCode, payload));
      },
      fail: () => {
        reject(
          new RequestError({
            code: 'NETWORK_ERROR',
            message:
              'Network request failed. Please confirm the backend is reachable from WeChat devtools.',
          }),
        );
      },
    });
  });
}

async function uploadFileInternal<T>(
  options: InternalUploadFileOptions,
  retryCount: number,
): Promise<T> {
  if (
    options.authMode === 'required' &&
    options.retryOnAuthFailure &&
    hasRefreshToken() &&
    (!getAccessToken() || shouldRefreshAccessToken())
  ) {
    await refreshAccessToken(shouldRedirectAfterAuthFailure(options));
  }

  if (options.authMode === 'required' && !getAccessToken()) {
    handleTerminalAuthFailure(options);
    throw new RequestError({
      statusCode: 401,
      code: 'UNAUTHORIZED',
      message: 'Authentication is missing or expired. Please log in again.',
    });
  }

  try {
    return await sendUploadFile<T>(options);
  } catch (error) {
    if (!(error instanceof RequestError)) {
      throw error;
    }

    if (
      error.statusCode === 401 &&
      options.retryOnAuthFailure &&
      retryCount === 0 &&
      hasRefreshToken()
    ) {
      await refreshAccessToken(shouldRedirectAfterAuthFailure(options));

      return uploadFileInternal<T>(
        {
          ...options,
          retryOnAuthFailure: false,
        },
        retryCount + 1,
      );
    }

    if (shouldHandleForbiddenAsAuthError(error.code)) {
      handleTerminalAuthFailure(options);
    }

    throw error;
  }
}

export function uploadFile<T>(options: UploadFileOptions) {
  return uploadFileInternal<T>(
    {
      authMode: options.authMode ?? 'required',
      retryOnAuthFailure: options.retryOnAuthFailure ?? true,
      disableAuthRedirect: options.disableAuthRedirect ?? false,
      ...options,
    },
    0,
  );
}
