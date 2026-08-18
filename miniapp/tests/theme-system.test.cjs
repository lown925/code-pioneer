'use strict';

const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const Module = require('node:module');
const typescript = require('../../server/node_modules/typescript');

const miniappRoot = resolve(__dirname, '..');
const repositoryRoot = resolve(miniappRoot, '..');
const themePath = resolve(miniappRoot, 'utils/theme.ts');
const compiledThemeModule = typescript.transpileModule(
  readFileSync(themePath, 'utf8'),
  {
    compilerOptions: {
      module: typescript.ModuleKind.CommonJS,
      target: typescript.ScriptTarget.ES2020,
      strict: true,
    },
  },
).outputText;

function createThemeHarness({ storage = new Map(), systemTheme = 'light', getAppThrows = false } = {}) {
  const nativeCalls = [];
  const app = { globalData: {} };
  let themeListener = null;
  let activeSystemTheme = systemTheme;

  global.wx = {
    getStorageSync(key) {
      return storage.get(key);
    },
    setStorageSync(key, value) {
      storage.set(key, value);
    },
    getSystemInfoSync() {
      return { theme: activeSystemTheme };
    },
    onThemeChange(listener) {
      themeListener = listener;
    },
    offThemeChange(listener) {
      if (themeListener === listener) {
        themeListener = null;
      }
    },
    setNavigationBarColor(options) {
      nativeCalls.push(['navigation', options]);
    },
    setBackgroundColor(options) {
      nativeCalls.push(['background', options]);
    },
    setTabBarStyle(options) {
      nativeCalls.push(['tabBar', options]);
    },
  };
  global.getApp = () => {
    if (getAppThrows) {
      throw new Error('App is unavailable');
    }

    return app;
  };

  const themeModule = new Module(themePath, module);
  themeModule.filename = themePath;
  themeModule.paths = Module._nodeModulePaths(resolve(themePath, '..'));
  themeModule._compile(compiledThemeModule, themePath);

  return {
    app,
    emitSystemTheme(theme) {
      activeSystemTheme = theme;
      themeListener?.({ theme });
    },
    nativeCalls,
    storage,
    theme: themeModule.exports,
  };
}

const tests = [];

function test(name, run) {
  tests.push({ name, run });
}

test('defaults to system and resolves a light system theme', () => {
  const harness = createThemeHarness({ systemTheme: 'light' });
  const { theme } = harness;

  assert.deepEqual(theme.initializeTheme(), {
    mode: 'system',
    resolvedTheme: 'light',
  });
  assert.equal(harness.app.globalData.themeMode, 'system');
  assert.equal(harness.app.globalData.resolvedTheme, 'light');
  assert.equal(harness.nativeCalls.length, 3);
});

test('resolves system mode to dark when WeChat is dark', () => {
  const harness = createThemeHarness({ systemTheme: 'dark' });

  assert.deepEqual(harness.theme.getThemeSnapshot(), {
    mode: 'system',
    resolvedTheme: 'dark',
  });
});

test('falls back to system when stored data is invalid', () => {
  const storage = new Map([['code-pioneer.theme.mode', 'invalid-mode']]);
  const harness = createThemeHarness({ storage, systemTheme: 'dark' });

  assert.deepEqual(harness.theme.getThemeSnapshot(), {
    mode: 'system',
    resolvedTheme: 'dark',
  });
});

test('keeps a manual light selection when the system changes', () => {
  const harness = createThemeHarness({ systemTheme: 'dark' });
  const { theme } = harness;

  assert.deepEqual(theme.setThemeMode('light'), {
    mode: 'light',
    resolvedTheme: 'light',
  });
  harness.emitSystemTheme('dark');
  assert.equal(theme.getResolvedTheme(), 'light');
  assert.equal(harness.storage.get(theme.THEME_STORAGE_KEY), 'light');
});

test('keeps a manual dark selection when the system changes', () => {
  const harness = createThemeHarness({ systemTheme: 'light' });
  const { theme } = harness;

  theme.setThemeMode('dark');
  harness.emitSystemTheme('light');
  assert.deepEqual(theme.getThemeSnapshot(), {
    mode: 'dark',
    resolvedTheme: 'dark',
  });
});

test('updates system mode for both light-to-dark and dark-to-light changes', () => {
  const harness = createThemeHarness({ systemTheme: 'light' });
  const snapshots = [];
  const unsubscribe = harness.theme.subscribeTheme((snapshot) => {
    snapshots.push(snapshot);
  });

  harness.emitSystemTheme('dark');
  harness.emitSystemTheme('light');
  unsubscribe();

  assert.deepEqual(snapshots, [
    { mode: 'system', resolvedTheme: 'light' },
    { mode: 'system', resolvedTheme: 'dark' },
    { mode: 'system', resolvedTheme: 'light' },
  ]);
});

test('persists a manual choice across a fresh module load', () => {
  const storage = new Map();
  const first = createThemeHarness({ storage, systemTheme: 'light' });

  first.theme.setThemeMode('dark');

  const reopened = createThemeHarness({ storage, systemTheme: 'light' });
  assert.deepEqual(reopened.theme.getThemeSnapshot(), {
    mode: 'dark',
    resolvedTheme: 'dark',
  });
});

test('works without authentication or an available App instance', () => {
  const harness = createThemeHarness({ getAppThrows: true, systemTheme: 'light' });

  assert.doesNotThrow(() => harness.theme.setThemeMode('dark'));
  assert.equal(harness.theme.getResolvedTheme(), 'dark');
});

test('registers every active page and keeps Community and Follow unavailable', () => {
  const appConfig = JSON.parse(readFileSync(resolve(miniappRoot, 'app.json'), 'utf8'));

  assert.ok(appConfig.pages.includes('pages/settings/index'));
  assert.ok(appConfig.pages.every((page) => !page.startsWith('pages/community/')));
  assert.ok(appConfig.pages.every((page) => page !== 'pages/profile/follow-list'));

  appConfig.pages.forEach((page) => {
    const script = readFileSync(resolve(miniappRoot, `${page}.ts`), 'utf8');
    const template = readFileSync(resolve(miniappRoot, `${page}.wxml`), 'utf8');

    assert.match(script, /registerThemedPage/);
    assert.match(template, /theme-\{\{resolvedTheme\}\}/);
  });
});

test('uses the shared manager for Battle Play and exposes the settings flow', () => {
  const playScript = readFileSync(resolve(miniappRoot, 'pages/battle/play.ts'), 'utf8');
  const playTemplate = readFileSync(resolve(miniappRoot, 'pages/battle/play.wxml'), 'utf8');
  const profileTemplate = readFileSync(resolve(miniappRoot, 'pages/profile/index.wxml'), 'utf8');
  const settingsScript = readFileSync(resolve(miniappRoot, 'pages/settings/index.ts'), 'utf8');
  const settingsTemplate = readFileSync(resolve(miniappRoot, 'pages/settings/index.wxml'), 'utf8');

  assert.match(playScript, /registerThemedPage/);
  assert.doesNotMatch(playScript, /onThemeChange|offThemeChange|getSystemBattleTheme/);
  assert.match(playTemplate, /battle-theme-\{\{resolvedTheme\}\}/);
  assert.match(profileTemplate, /bindtap="handleSettings"/);
  assert.match(settingsTemplate, /wx:for="\{\{themeOptions\}\}"/);
  assert.match(settingsScript, /title: '跟随系统'/);
  assert.match(settingsScript, /title: '浅色模式'/);
  assert.match(settingsScript, /title: '深色模式'/);
});

let failures = 0;

tests.forEach(({ name, run }) => {
  try {
    run();
    process.stdout.write(`PASS ${name}\n`);
  } catch (error) {
    failures += 1;
    process.stderr.write(`FAIL ${name}\n${error.stack || error}\n`);
  }
});

if (failures > 0) {
  process.exitCode = 1;
} else {
  process.stdout.write(`Theme tests passed: ${tests.length}\n`);
}
