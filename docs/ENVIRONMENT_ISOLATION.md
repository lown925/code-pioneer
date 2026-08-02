# Environment Isolation

## 1. What Is Isolated

Code Pioneer separates deployment environments, not every semantic product
version.

| Miniapp version | Backend `APP_ENV` | Database | Upload storage | Data purpose |
| --- | --- | --- | --- | --- |
| `develop` | `development` | Local development database | Local upload directory | Disposable development data |
| `trial` | `trial` | Dedicated trial database | Dedicated trial volume | Test accounts and acceptance data |
| `release` | `production` | Dedicated production database | Dedicated production volume | Real user data |

`V1.0 -> V1.1` normally keeps the same production database. Database changes
must be applied through reviewed migrations. Do not create a new production
database merely because the application version changes.

## 2. Isolation Boundary

Each environment must have its own:

- API deployment and public HTTPS domain.
- PostgreSQL database connection.
- Persistent upload directory or object-storage bucket.
- JWT access and refresh secrets.
- WeChat server-side credentials where separate credentials are available.
- Miniapp authentication and UI-refresh storage namespace.

The trial database must never use the production `DATABASE_URL`. Test users,
Battle records, learning records, community posts, uploads, and wrong questions
must remain in the trial environment.

## 3. Server Configuration

Development example:

```dotenv
NODE_ENV=development
APP_ENV=development
APP_VERSION=1.0.0-dev
DATA_NAMESPACE=code_pioneer
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/code_pioneer_dev?schema=code_pioneer
UPLOAD_STORAGE_ROOT=
PUBLIC_BASE_URL=http://127.0.0.1:3000
AUTH_MOCK_ENABLED=true
```

Trial example:

```dotenv
NODE_ENV=production
APP_ENV=trial
APP_VERSION=1.0.0-rc.1
DATA_NAMESPACE=code_pioneer
DATABASE_URL=postgresql://USER:PASSWORD@TRIAL_HOST:5432/code_pioneer_trial?schema=code_pioneer
UPLOAD_STORAGE_ROOT=/data/code-pioneer/trial/uploads
PUBLIC_BASE_URL=https://trial-api.example.com
AUTH_MOCK_ENABLED=false
```

Production example:

```dotenv
NODE_ENV=production
APP_ENV=production
APP_VERSION=1.0.0
DATA_NAMESPACE=code_pioneer
DATABASE_URL=postgresql://USER:PASSWORD@PROD_HOST:5432/code_pioneer_release?schema=code_pioneer
UPLOAD_STORAGE_ROOT=/data/code-pioneer/release/uploads
PUBLIC_BASE_URL=https://api.example.com
AUTH_MOCK_ENABLED=false
```

The examples contain placeholders only. Never commit passwords, AppSecret,
JWT secrets, or complete real connection strings.

The current migration history contains an older migration that uses the
standard `code_pioneer` schema explicitly. Therefore, the supported deployment
model is separate databases with `DATA_NAMESPACE=code_pioneer`. A custom schema
name requires a separately reviewed migration-baseline procedure; changing an
already applied historical migration is not allowed.

Outside development, startup fails when:

- `DATABASE_URL`, `DATA_NAMESPACE`, `UPLOAD_STORAGE_ROOT`, or
  `PUBLIC_BASE_URL` is missing.
- `DATABASE_URL?schema=` differs from `DATA_NAMESPACE`.
- `PUBLIC_BASE_URL` is not HTTPS.
- `AUTH_MOCK_ENABLED` is enabled.

## 4. Miniapp Configuration

`miniapp/utils/public-env.ts` contains public API origins only:

```ts
export const PUBLIC_API_ENVIRONMENT_CONFIG = {
  trialApiBaseUrl: 'https://trial-api.example.com/api/v1',
  releaseApiBaseUrl: 'https://api.example.com/api/v1',
};
```

API domains are public configuration, not secrets. Trial and release must not
fall back to localhost. The runtime storage override remains a development-only
convenience.

The miniapp sends `X-Client-Environment` with every request and upload. The
server returns `X-App-Environment` and rejects an explicit mismatch with
`409 ENVIRONMENT_MISMATCH`.

Local storage is namespaced as follows:

```text
code-pioneer.develop.auth.session
code-pioneer.trial.auth.session
code-pioneer.release.auth.session
```

Community refresh-version keys use the same environment prefix, so a trial
login or cache cannot be reused by the release miniapp.

## 5. Release Procedure

1. Apply migrations to the trial database.
2. Import reviewed non-user content into trial and complete acceptance testing.
3. Back up the production database.
4. Apply the same reviewed migrations to the production database.
5. Import only approved content packages. Never copy trial user or transaction
   data into production.
6. Deploy the production backend with production secrets and upload volume.
7. Publish the release miniapp configured with the production HTTPS API.
8. Verify `/api/v1/health` reports the expected environment, data namespace,
   and application version without exposing credentials.
