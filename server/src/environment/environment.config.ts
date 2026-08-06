import { isAbsolute, resolve } from 'path';

export type AppEnvironment = 'development' | 'trial' | 'production' | 'test';

export type ClientEnvironment = 'develop' | 'trial' | 'release';

type EnvironmentSource = Record<string, string | undefined>;

export type RuntimeEnvironmentConfig = {
  appEnvironment: AppEnvironment;
  expectedClientEnvironment: ClientEnvironment | null;
  allowedClientEnvironments: ClientEnvironment[];
  dataNamespace: string;
  uploadStorageRoot: string;
  appVersion: string;
};

const DEFAULT_DATA_NAMESPACE = 'code_pioneer';
const APP_ENVIRONMENTS = new Set<AppEnvironment>([
  'development',
  'trial',
  'production',
  'test',
]);
const DATA_NAMESPACE_PATTERN = /^[a-z_][a-z0-9_]*$/i;
const CLIENT_ENVIRONMENTS = new Set<ClientEnvironment>([
  'develop',
  'trial',
  'release',
]);

function normalizedValue(value: string | undefined) {
  return value?.trim() ?? '';
}

function isEnabled(value: string | undefined) {
  return ['true', '1', 'yes'].includes(normalizedValue(value).toLowerCase());
}

function isExternalEnvironment(appEnvironment: AppEnvironment) {
  return appEnvironment === 'trial' || appEnvironment === 'production';
}

export function resolveAppEnvironment(
  environment: EnvironmentSource = process.env,
): AppEnvironment {
  const configuredEnvironment = normalizedValue(environment.APP_ENV);

  if (configuredEnvironment) {
    if (!APP_ENVIRONMENTS.has(configuredEnvironment as AppEnvironment)) {
      throw new Error(
        `APP_ENV must be one of development, trial, production, or test; received ${configuredEnvironment}.`,
      );
    }

    return configuredEnvironment as AppEnvironment;
  }

  if (environment.NODE_ENV === 'test') {
    return 'test';
  }

  if (environment.NODE_ENV === 'production') {
    return 'production';
  }

  return 'development';
}

export function getExpectedClientEnvironment(
  appEnvironment = resolveAppEnvironment(),
): ClientEnvironment | null {
  if (appEnvironment === 'development') {
    return 'develop';
  }

  if (appEnvironment === 'trial') {
    return 'trial';
  }

  if (appEnvironment === 'production') {
    return 'release';
  }

  return null;
}

export function getDataNamespace(environment: EnvironmentSource = process.env) {
  const dataNamespace =
    normalizedValue(environment.DATA_NAMESPACE) || DEFAULT_DATA_NAMESPACE;

  if (!DATA_NAMESPACE_PATTERN.test(dataNamespace)) {
    throw new Error(
      'DATA_NAMESPACE must be a valid PostgreSQL identifier containing only letters, numbers, and underscores.',
    );
  }

  return dataNamespace;
}

export function getUploadStorageRoot(
  environment: EnvironmentSource = process.env,
) {
  const configuredRoot = normalizedValue(environment.UPLOAD_STORAGE_ROOT);

  return resolve(configuredRoot || resolve(process.cwd(), 'public', 'uploads'));
}

export function getAppVersion(environment: EnvironmentSource = process.env) {
  return normalizedValue(environment.APP_VERSION) || 'development';
}

export function getAllowedClientEnvironments(
  environment: EnvironmentSource = process.env,
  appEnvironment = resolveAppEnvironment(environment),
) {
  const expected = getExpectedClientEnvironment(appEnvironment);
  const configured = normalizedValue(environment.ALLOWED_CLIENT_ENVIRONMENTS);

  if (!configured) {
    return expected ? [expected] : [];
  }

  const values = [
    ...new Set(configured.split(',').map((value) => value.trim())),
  ];

  if (
    values.length === 0 ||
    values.some(
      (value): value is string =>
        !CLIENT_ENVIRONMENTS.has(value as ClientEnvironment),
    )
  ) {
    throw new Error(
      'ALLOWED_CLIENT_ENVIRONMENTS must contain only develop, trial, or release.',
    );
  }

  return values as ClientEnvironment[];
}

function validateDatabaseConfiguration(
  environment: EnvironmentSource,
  appEnvironment: AppEnvironment,
  dataNamespace: string,
) {
  const databaseUrl = normalizedValue(environment.DATABASE_URL);

  if (!databaseUrl) {
    if (isExternalEnvironment(appEnvironment)) {
      throw new Error(
        `DATABASE_URL is required for APP_ENV=${appEnvironment}.`,
      );
    }

    return;
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(databaseUrl);
  } catch {
    throw new Error('DATABASE_URL must be a valid PostgreSQL URL.');
  }

  if (!['postgres:', 'postgresql:'].includes(parsedUrl.protocol)) {
    throw new Error('DATABASE_URL must use the postgresql:// protocol.');
  }

  const configuredSchema = normalizedValue(
    parsedUrl.searchParams.get('schema') ?? undefined,
  );

  if (
    isExternalEnvironment(appEnvironment) &&
    configuredSchema !== dataNamespace
  ) {
    throw new Error(
      `DATABASE_URL schema must match DATA_NAMESPACE (${dataNamespace}) for APP_ENV=${appEnvironment}.`,
    );
  }
}

function validateExternalEnvironment(
  environment: EnvironmentSource,
  appEnvironment: AppEnvironment,
) {
  if (!isExternalEnvironment(appEnvironment)) {
    return;
  }

  if (!normalizedValue(environment.DATA_NAMESPACE)) {
    throw new Error(
      `DATA_NAMESPACE is required for APP_ENV=${appEnvironment}.`,
    );
  }

  if (!normalizedValue(environment.UPLOAD_STORAGE_ROOT)) {
    throw new Error(
      `UPLOAD_STORAGE_ROOT is required for APP_ENV=${appEnvironment}.`,
    );
  }

  if (!isAbsolute(normalizedValue(environment.UPLOAD_STORAGE_ROOT))) {
    throw new Error(
      `UPLOAD_STORAGE_ROOT must be an absolute path for APP_ENV=${appEnvironment}.`,
    );
  }

  if (isEnabled(environment.AUTH_MOCK_ENABLED)) {
    throw new Error(
      `AUTH_MOCK_ENABLED must be false for APP_ENV=${appEnvironment}.`,
    );
  }

  const publicBaseUrl = normalizedValue(environment.PUBLIC_BASE_URL);

  if (!publicBaseUrl) {
    throw new Error(
      `PUBLIC_BASE_URL is required for APP_ENV=${appEnvironment}.`,
    );
  }

  let parsedPublicBaseUrl: URL;

  try {
    parsedPublicBaseUrl = new URL(publicBaseUrl);
  } catch {
    throw new Error('PUBLIC_BASE_URL must be a valid HTTPS URL.');
  }

  if (parsedPublicBaseUrl.protocol !== 'https:') {
    throw new Error(
      `PUBLIC_BASE_URL must use HTTPS for APP_ENV=${appEnvironment}.`,
    );
  }
}

export function validateEnvironmentConfiguration(
  environment: EnvironmentSource = process.env,
): RuntimeEnvironmentConfig {
  const appEnvironment = resolveAppEnvironment(environment);
  const dataNamespace = getDataNamespace(environment);

  validateExternalEnvironment(environment, appEnvironment);
  validateDatabaseConfiguration(environment, appEnvironment, dataNamespace);

  return {
    appEnvironment,
    expectedClientEnvironment: getExpectedClientEnvironment(appEnvironment),
    allowedClientEnvironments: getAllowedClientEnvironments(
      environment,
      appEnvironment,
    ),
    dataNamespace,
    uploadStorageRoot: getUploadStorageRoot(environment),
    appVersion: getAppVersion(environment),
  };
}

export function isClientEnvironmentCompatible(
  appEnvironment: AppEnvironment,
  clientEnvironment: string | undefined,
  allowedClientEnvironments?: ClientEnvironment[],
) {
  if (!clientEnvironment) {
    return true;
  }

  const expectedClientEnvironment =
    getExpectedClientEnvironment(appEnvironment);
  const allowed =
    allowedClientEnvironments ??
    (expectedClientEnvironment ? [expectedClientEnvironment] : []);

  return (
    expectedClientEnvironment === null ||
    allowed.includes(clientEnvironment as ClientEnvironment)
  );
}
