type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type RequestOptions = {
  url: string;
  method?: RequestMethod;
  data?: WechatMiniprogram.IAnyObject;
};

type ApiSuccess<T> = {
  success: true;
  data: T;
  message?: string;
  requestId?: string;
};

type ApiFailure = {
  success: false;
  error?: {
    code?: string;
    message?: string;
  };
  message?: string;
  requestId?: string;
};

const API_BASE_URL = 'http://127.0.0.1:3000/api/v1';

export function request<T>({ url, method = 'GET', data }: RequestOptions) {
  return new Promise<T>((resolve, reject) => {
    wx.request<ApiSuccess<T> | ApiFailure>({
      url: `${API_BASE_URL}${url}`,
      method,
      data,
      timeout: 10000,
      success: (response) => {
        const payload = response.data;
        if (response.statusCode >= 200 && response.statusCode < 300 && payload?.success) {
          resolve(payload.data);
          return;
        }

        const message =
          payload?.success === false
            ? payload.error?.message || payload.message || '请求失败，请稍后重试'
            : `请求失败，状态码 ${response.statusCode}`;

        reject(new Error(message));
      },
      fail: () => {
        reject(new Error('网络请求失败，请确认后端服务已启动并可从微信开发者工具访问'));
      },
    });
  });
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}
