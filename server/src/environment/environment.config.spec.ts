import { resolve } from 'path';
import {
  getExpectedClientEnvironment,
  isClientEnvironmentCompatible,
  resolveAppEnvironment,
  validateEnvironmentConfiguration,
} from './environment.config';

const TRIAL_ENVIRONMENT = {
  APP_ENV: 'trial',
  APP_VERSION: '1.0.0-rc.1',
  DATA_NAMESPACE: 'code_pioneer',
  DATABASE_URL:
    'postgresql://user:password@trial-db.example.com:5432/code_pioneer_trial?schema=code_pioneer',
  UPLOAD_STORAGE_ROOT: 'C:\\data\\code-pioneer\\trial\\uploads',
  PUBLIC_BASE_URL: 'https://trial-api.example.com',
  AUTH_MOCK_ENABLED: 'false',
};

describe('environment configuration', () => {
  it('uses a backward-compatible development configuration by default', () => {
    const config = validateEnvironmentConfiguration({
      NODE_ENV: 'development',
    });

    expect(config).toEqual({
      appEnvironment: 'development',
      expectedClientEnvironment: 'develop',
      dataNamespace: 'code_pioneer',
      uploadStorageRoot: resolve(process.cwd(), 'public', 'uploads'),
      appVersion: 'development',
    });
  });

  it('resolves test from NODE_ENV when APP_ENV is omitted', () => {
    expect(resolveAppEnvironment({ NODE_ENV: 'test' })).toBe('test');
  });

  it('accepts a complete trial configuration', () => {
    expect(validateEnvironmentConfiguration(TRIAL_ENVIRONMENT)).toEqual({
      appEnvironment: 'trial',
      expectedClientEnvironment: 'trial',
      dataNamespace: 'code_pioneer',
      uploadStorageRoot: resolve(TRIAL_ENVIRONMENT.UPLOAD_STORAGE_ROOT),
      appVersion: '1.0.0-rc.1',
    });
  });

  it('requires explicit data and upload isolation outside development', () => {
    expect(() =>
      validateEnvironmentConfiguration({
        ...TRIAL_ENVIRONMENT,
        DATA_NAMESPACE: '',
      }),
    ).toThrow('DATA_NAMESPACE is required');

    expect(() =>
      validateEnvironmentConfiguration({
        ...TRIAL_ENVIRONMENT,
        UPLOAD_STORAGE_ROOT: '',
      }),
    ).toThrow('UPLOAD_STORAGE_ROOT is required');
  });

  it('rejects a database schema mismatch', () => {
    expect(() =>
      validateEnvironmentConfiguration({
        ...TRIAL_ENVIRONMENT,
        DATA_NAMESPACE: 'code_pioneer_trial',
      }),
    ).toThrow('DATABASE_URL schema must match DATA_NAMESPACE');
  });

  it('rejects mock login and non-HTTPS public URLs outside development', () => {
    expect(() =>
      validateEnvironmentConfiguration({
        ...TRIAL_ENVIRONMENT,
        AUTH_MOCK_ENABLED: 'true',
      }),
    ).toThrow('AUTH_MOCK_ENABLED must be false');

    expect(() =>
      validateEnvironmentConfiguration({
        ...TRIAL_ENVIRONMENT,
        PUBLIC_BASE_URL: 'http://trial-api.example.com',
      }),
    ).toThrow('PUBLIC_BASE_URL must use HTTPS');
  });

  it('maps miniapp versions to their matching backend environments', () => {
    expect(getExpectedClientEnvironment('development')).toBe('develop');
    expect(getExpectedClientEnvironment('trial')).toBe('trial');
    expect(getExpectedClientEnvironment('production')).toBe('release');
    expect(getExpectedClientEnvironment('test')).toBeNull();

    expect(isClientEnvironmentCompatible('trial', 'trial')).toBe(true);
    expect(isClientEnvironmentCompatible('trial', 'release')).toBe(false);
    expect(isClientEnvironmentCompatible('production', 'trial')).toBe(false);
    expect(isClientEnvironmentCompatible('production', undefined)).toBe(true);
  });
});
