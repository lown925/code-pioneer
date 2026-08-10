export type PublicApiEnvironmentConfig = {
  developApiBaseUrl: string;
  trialApiBaseUrl: string;
  releaseApiBaseUrl: string;
};

// API 域名是公开配置。此文件不得包含 AppSecret、数据库密码或服务端凭据。
// 当前联调阶段三个小程序版本共用 Sealos 后端，后续可在这里分别绑定环境域名。
export const PUBLIC_API_ENVIRONMENT_CONFIG: PublicApiEnvironmentConfig = {
  developApiBaseUrl: "https://nzuzsqrzzsuj.sealoshzh.site/api/v1",
  trialApiBaseUrl: "https://nzuzsqrzzsuj.sealoshzh.site/api/v1",
  releaseApiBaseUrl: "https://nzuzsqrzzsuj.sealoshzh.site/api/v1",
};
