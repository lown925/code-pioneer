export type PublicApiEnvironmentConfig = {
  trialApiBaseUrl: string;
  releaseApiBaseUrl: string;
};

// 体验版和正式版使用公开的 HTTPS API 域名即可，不应依赖本地 storage 注入。
// 这里不得放置任何密钥、AppSecret、数据库密码或服务端凭据。
export const PUBLIC_API_ENVIRONMENT_CONFIG: PublicApiEnvironmentConfig = {
  trialApiBaseUrl: 'https://test-api.example.com/api/v1',
  releaseApiBaseUrl: 'https://api.example.com/api/v1',
};
