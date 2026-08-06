import type { NextFunction, Request, Response } from 'express';
import {
  isClientEnvironmentCompatible,
  type RuntimeEnvironmentConfig,
} from './environment.config';

const CLIENT_ENVIRONMENT_HEADER = 'x-client-environment';

export function createEnvironmentMiddleware(
  environmentConfig: RuntimeEnvironmentConfig,
) {
  return (request: Request, response: Response, next: NextFunction) => {
    response.setHeader('X-App-Environment', environmentConfig.appEnvironment);

    const headerValue = request.headers[CLIENT_ENVIRONMENT_HEADER];
    const clientEnvironment = Array.isArray(headerValue)
      ? headerValue[0]
      : headerValue;

    if (
      isClientEnvironmentCompatible(
        environmentConfig.appEnvironment,
        clientEnvironment,
        environmentConfig.allowedClientEnvironments,
      )
    ) {
      next();
      return;
    }

    response.status(409).json({
      success: false,
      error: {
        code: 'ENVIRONMENT_MISMATCH',
        message: '当前小程序环境与服务端环境不匹配，请检查 API 配置。',
      },
    });
  };
}
