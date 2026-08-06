import type { NextFunction, Request, Response } from 'express';
import { createEnvironmentMiddleware } from './environment.middleware';

function makeResponse() {
  const response = {
    setHeader: jest.fn(),
    status: jest.fn(),
    json: jest.fn(),
  };

  response.status.mockReturnValue(response);

  return response;
}

describe('environment middleware', () => {
  const environmentConfig = {
    appEnvironment: 'trial' as const,
    expectedClientEnvironment: 'trial' as const,
    allowedClientEnvironments: ['trial' as const],
    dataNamespace: 'code_pioneer',
    uploadStorageRoot: 'C:\\data\\trial\\uploads',
    appVersion: '1.0.0-rc.1',
  };

  it('accepts the matching miniapp environment', () => {
    const middleware = createEnvironmentMiddleware(environmentConfig);
    const request = {
      headers: {
        'x-client-environment': 'trial',
      },
    } as Request;
    const response = makeResponse();
    const next = jest.fn() as NextFunction;

    middleware(request, response as unknown as Response, next);

    expect(response.setHeader).toHaveBeenCalledWith(
      'X-App-Environment',
      'trial',
    );
    expect(next).toHaveBeenCalledTimes(1);
    expect(response.status).not.toHaveBeenCalled();
  });

  it('rejects a miniapp connected to the wrong backend environment', () => {
    const middleware = createEnvironmentMiddleware(environmentConfig);
    const request = {
      headers: {
        'x-client-environment': 'release',
      },
    } as Request;
    const response = makeResponse();
    const next = jest.fn() as NextFunction;

    middleware(request, response as unknown as Response, next);

    expect(next).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(409);
    expect(response.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: 'ENVIRONMENT_MISMATCH',
        message: '当前小程序环境与服务端环境不匹配，请检查 API 配置。',
      },
    });
  });

  it('allows internal and legacy requests without an environment header', () => {
    const middleware = createEnvironmentMiddleware(environmentConfig);
    const request = { headers: {} } as Request;
    const response = makeResponse();
    const next = jest.fn() as NextFunction;

    middleware(request, response as unknown as Response, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(response.status).not.toHaveBeenCalled();
  });

  it('accepts explicitly allowed miniapp environments on a shared backend', () => {
    const middleware = createEnvironmentMiddleware({
      ...environmentConfig,
      allowedClientEnvironments: ['develop', 'trial', 'release'],
    });
    const request = {
      headers: {
        'x-client-environment': 'develop',
      },
    } as Request;
    const response = makeResponse();
    const next = jest.fn() as NextFunction;

    middleware(request, response as unknown as Response, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(response.status).not.toHaveBeenCalled();
  });
});
