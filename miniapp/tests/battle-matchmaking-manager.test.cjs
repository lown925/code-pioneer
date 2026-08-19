'use strict';

const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const Module = require('node:module');
const typescript = require('../../server/node_modules/typescript');

const miniappRoot = resolve(__dirname, '..');
const managerPath = resolve(miniappRoot, 'utils/battle-matchmaking-state.ts');
const compiledManager = typescript.transpileModule(
  readFileSync(managerPath, 'utf8'),
  {
    compilerOptions: {
      module: typescript.ModuleKind.CommonJS,
      target: typescript.ScriptTarget.ES2020,
      strict: true,
    },
  },
).outputText;

class MockRequestError extends Error {
  constructor({ statusCode = 0, code = '', message = 'request failed' } = {}) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

function status(overrides = {}) {
  return {
    status: 'IDLE',
    battleId: null,
    searchStartedAt: null,
    expiresAt: null,
    serverTime: '2026-08-19T00:00:00.000Z',
    skill: 'PYTHON',
    waitingCount: 0,
    elapsedMs: 0,
    remainingSearchMs: 0,
    aiAvailable: false,
    ...overrides,
  };
}

function loadManagerModule() {
  const managerModule = new Module(managerPath, module);
  managerModule.filename = managerPath;
  managerModule.paths = Module._nodeModulePaths(resolve(managerPath, '..'));
  managerModule.require = (request) => {
    if (request === './auth') {
      return {
        clearAuthSession() {},
        getAuthStateSummary() {
          return { isAuthenticated: false };
        },
        redirectToLogin() {},
      };
    }
    if (request === './battle') {
      return {
        formatBattleSkill(skill) {
          return skill === 'PYTHON' ? 'Python' : skill;
        },
      };
    }
    if (request === './request') {
      return {
        request() {
          throw new Error('singleton request should not run in tests');
        },
        RequestError: MockRequestError,
      };
    }
    return Module.prototype.require.call(managerModule, request);
  };
  managerModule._compile(compiledManager, managerPath);
  return managerModule.exports;
}

function createHarness(responses = []) {
  const { BattleMatchmakingManager } = loadManagerModule();
  const requests = [];
  const navigations = [];
  const redirects = [];
  const timers = new Map();
  let nextTimerId = 1;
  let now = Date.parse('2026-08-19T00:00:00.000Z');
  let authenticated = true;
  let clearedAuth = 0;

  const dependencies = {
    async request(options) {
      requests.push(options);
      const next = responses.shift();
      if (next instanceof Error) throw next;
      if (typeof next === 'function') return next(options);
      return next ?? status();
    },
    getAuthStateSummary() {
      return { isAuthenticated: authenticated };
    },
    clearAuthSession() {
      clearedAuth += 1;
      authenticated = false;
    },
    redirectToLogin(path) {
      redirects.push(path ?? '');
    },
    navigateTo(options) {
      navigations.push(options.url);
      options.success?.();
    },
    now() {
      return now;
    },
    setTimeout(handler, delay) {
      const id = nextTimerId++;
      timers.set(id, { handler, delay });
      return id;
    },
    clearTimeout(id) {
      timers.delete(id);
    },
  };
  const manager = new BattleMatchmakingManager(dependencies);

  return {
    manager,
    requests,
    navigations,
    redirects,
    timers,
    setNow(value) {
      now = value;
    },
    setAuthenticated(value) {
      authenticated = value;
    },
    get clearedAuth() {
      return clearedAuth;
    },
  };
}

const tests = [];
function test(name, run) {
  tests.push({ name, run });
}

test('starts IDLE and joins into SEARCHING without a computer entry', async () => {
  const harness = createHarness([
    status({ status: 'SEARCHING', elapsedMs: 20_000, remainingSearchMs: 1_780_000, waitingCount: 2 }),
  ]);
  assert.equal(harness.manager.getSnapshot().status, 'IDLE');
  await harness.manager.join('PYTHON');
  const snapshot = harness.manager.getSnapshot();
  assert.equal(snapshot.status, 'SEARCHING');
  assert.equal(snapshot.computerAvailable, false);
  assert.equal(snapshot.waitingCount, 2);
  assert.equal(harness.requests[0].url, '/battles/matchmaking/join');
});

test('uses server aiAvailable and keeps it after collapse', async () => {
  const harness = createHarness([
    status({ status: 'SEARCHING', elapsedMs: 120_000, remainingSearchMs: 1_680_000, aiAvailable: true }),
  ]);
  await harness.manager.onAppShow();
  harness.manager.setCollapsed(true);
  const snapshot = harness.manager.getSnapshot();
  assert.equal(snapshot.status, 'SEARCHING_COMPUTER_AVAILABLE');
  assert.equal(snapshot.computerAvailable, true);
  assert.equal(snapshot.collapsed, true);
});

test('keeps one poller and pauses it without cancelling on app hide', async () => {
  const harness = createHarness([
    status({ status: 'SEARCHING', elapsedMs: 10_000, remainingSearchMs: 1_790_000 }),
  ]);
  await harness.manager.onAppShow();
  assert.equal([...harness.timers.values()].filter((timer) => timer.delay === 1800).length, 1);
  harness.manager.onAppHide();
  assert.equal(harness.timers.size, 0);
  assert.equal(harness.requests.some((item) => item.method === 'DELETE'), false);
});

test('recovers SEARCHING, computer available, and MATCHED from server state', async () => {
  for (const expected of [
    [status({ status: 'SEARCHING' }), 'SEARCHING'],
    [status({ status: 'SEARCHING', aiAvailable: true, elapsedMs: 130_000 }), 'SEARCHING_COMPUTER_AVAILABLE'],
    [status({ status: 'MATCHED', battleId: 'battle-human' }), 'MATCHED'],
  ]) {
    const harness = createHarness([expected[0]]);
    await harness.manager.onAppShow();
    assert.equal(harness.manager.getSnapshot().status, expected[1]);
  }
});

test('does not auto-navigate when a human match is found', async () => {
  const harness = createHarness([status({ status: 'MATCHED', battleId: 'battle-human' })]);
  await harness.manager.onAppShow();
  assert.deepEqual(harness.navigations, []);
  harness.manager.enterMatchedBattle();
  assert.deepEqual(harness.navigations, ['/pages/battle/room?battleId=battle-human']);
});

test('handles AI and HUMAN computer-switch resolutions and prevents duplicate clicks', async () => {
  for (const resolution of [
    { resolvedTo: 'AI', battleId: 'battle-ai', serverTime: '2026-08-19T00:02:01.000Z' },
    { resolvedTo: 'HUMAN', battleId: 'battle-human', serverTime: '2026-08-19T00:02:01.000Z' },
  ]) {
    let resolveRequest;
    const pending = new Promise((resolve) => { resolveRequest = resolve; });
    const harness = createHarness([
      status({ status: 'SEARCHING', aiAvailable: true, elapsedMs: 121_000 }),
      () => pending,
    ]);
    await harness.manager.onAppShow();
    const first = harness.manager.startComputerBattle();
    const second = await harness.manager.startComputerBattle();
    assert.equal(second, null);
    resolveRequest(resolution);
    assert.deepEqual(await first, resolution);
    assert.deepEqual(harness.navigations, [`/pages/battle/room?battleId=${resolution.battleId}`]);
    assert.equal(harness.requests.filter((item) => item.url === '/battles/matchmaking/ai').length, 1);
  }
});

test('active cancel calls DELETE and returns to IDLE', async () => {
  const harness = createHarness([
    status({ status: 'SEARCHING' }),
    status({ status: 'CANCELLED' }),
  ]);
  await harness.manager.onAppShow();
  await harness.manager.cancel();
  assert.equal(harness.manager.getSnapshot().status, 'IDLE');
  assert.equal(harness.requests[1].method, 'DELETE');
});

test('keeps trusted state during polling errors and never cancels the queue', async () => {
  const harness = createHarness([
    status({ status: 'SEARCHING', elapsedMs: 30_000 }),
    new MockRequestError({ code: 'NETWORK_TIMEOUT' }),
  ]);
  await harness.manager.onAppShow();
  await harness.manager.sync({ force: true });
  const snapshot = harness.manager.getSnapshot();
  assert.equal(snapshot.status, 'SEARCHING');
  assert.equal(snapshot.reconnecting, true);
  assert.equal(harness.requests.some((item) => item.method === 'DELETE'), false);
});

test('stops polling and clears sensitive state on 401', async () => {
  const harness = createHarness([
    new MockRequestError({ statusCode: 401, code: 'UNAUTHORIZED' }),
  ]);
  await harness.manager.onAppShow();
  assert.equal(harness.manager.getSnapshot().status, 'IDLE');
  assert.equal(harness.clearedAuth, 1);
  assert.equal(harness.timers.size, 0);
  assert.equal(harness.redirects.length, 1);
});

test('uses local time only for smooth display and not for computer unlock', async () => {
  const start = Date.parse('2026-08-19T00:00:00.000Z');
  const harness = createHarness([
    status({ status: 'SEARCHING', elapsedMs: 119_000, remainingSearchMs: 1_681_000, aiAvailable: false }),
  ]);
  await harness.manager.onAppShow();
  harness.setNow(start + 5_000);
  const snapshot = harness.manager.getSnapshot();
  assert.equal(snapshot.elapsedMs, 124_000);
  assert.equal(snapshot.computerAvailable, false);
  assert.equal(snapshot.status, 'SEARCHING');
});

let failures = 0;
(async () => {
  for (const { name, run } of tests) {
    try {
      await run();
      process.stdout.write(`PASS ${name}\n`);
    } catch (error) {
      failures += 1;
      process.stderr.write(`FAIL ${name}\n${error.stack || error}\n`);
    }
  }
  if (failures > 0) process.exitCode = 1;
  else process.stdout.write(`Matchmaking manager tests passed: ${tests.length}\n`);
})();
