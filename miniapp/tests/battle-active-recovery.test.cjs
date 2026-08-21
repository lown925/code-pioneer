const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const Module = require('node:module');
const typescript = require('../../server/node_modules/typescript');

const miniappRoot = resolve(__dirname, '..');
const read = (path) => readFileSync(resolve(miniappRoot, path), 'utf8');
const recoveryPath = resolve(miniappRoot, 'utils/battle-active-recovery.ts');
const recoverySource = readFileSync(recoveryPath, 'utf8');
const compiledRecovery = typescript.transpileModule(recoverySource, {
  compilerOptions: {
    module: typescript.ModuleKind.CommonJS,
    target: typescript.ScriptTarget.ES2020,
    strict: true,
  },
}).outputText;

class MockRequestError extends Error {
  constructor(code) {
    super(code);
    this.code = code;
    this.statusCode = code === 'BATTLE_ALREADY_ACTIVE' ? 409 : 500;
  }
}

function loadRecoveryModule() {
  const requests = [];
  const modals = [];
  const navigations = [];
  let activeBattle = null;
  const recoveryModule = new Module(recoveryPath, module);
  recoveryModule.filename = recoveryPath;
  recoveryModule.paths = Module._nodeModulePaths(resolve(recoveryPath, '..'));
  recoveryModule.require = (request) => {
    if (request === './battle') {
      return {
        formatBattleSkill(skill) {
          return skill === 'PYTHON' ? 'Python' : skill || '历史对战';
        },
        async showBattleConfirmModal(options) {
          modals.push(options);
          return { confirm: true, cancel: false };
        },
      };
    }
    if (request === './request') {
      return {
        async request(options) {
          requests.push(options);
          return activeBattle;
        },
        RequestError: MockRequestError,
      };
    }
    return Module.prototype.require.call(recoveryModule, request);
  };
  const previousWx = global.wx;
  global.wx = {
    navigateTo(options) {
      navigations.push(options.url);
    },
    showToast() {},
  };
  recoveryModule._compile(compiledRecovery, recoveryPath);

  return {
    api: recoveryModule.exports,
    requests,
    modals,
    navigations,
    setActiveBattle(value) {
      activeBattle = value;
    },
    restore() {
      global.wx = previousWx;
    },
  };
}

function battle(overrides = {}) {
  return {
    battleId: '11111111-1111-4111-8111-111111111111',
    mode: 'RANKED',
    roomStatus: 'IN_PROGRESS',
    participantStatus: 'PLAYING',
    skillCode: 'PYTHON',
    skillName: 'Python',
    invitationToken: null,
    inviteCode: null,
    recoveryTarget: 'PLAY',
    readOnly: false,
    serverTime: '2026-08-20T08:00:00.000Z',
    ...overrides,
  };
}

const tests = [];
function test(name, run) {
  tests.push({ name, run });
}

test('maps Room, Play, submitted Play, and Result without exposing enums', () => {
  const harness = loadRecoveryModule();
  try {
    assert.equal(
      harness.api.getActiveBattleRoute(
        battle({ recoveryTarget: 'ROOM', roomStatus: 'READY' }),
      ),
      '/pages/battle/room?battleId=11111111-1111-4111-8111-111111111111',
    );
    assert.equal(
      harness.api.getActiveBattleRoute(battle()),
      '/pages/battle/play?battleId=11111111-1111-4111-8111-111111111111',
    );
    assert.equal(
      harness.api.getActiveBattlePresentation(
        battle({ participantStatus: 'SUBMITTED', readOnly: true }),
      ).actionText,
      '等待结果',
    );
    assert.equal(
      harness.api.getActiveBattleRoute(
        battle({ recoveryTarget: 'RESULT', roomStatus: 'COMPLETED', readOnly: true }),
      ),
      '/pages/battle/result?battleId=11111111-1111-4111-8111-111111111111',
    );
  } finally {
    harness.restore();
  }
});

test('restores friend room identity needed for explicit leave semantics', () => {
  const harness = loadRecoveryModule();
  try {
    assert.equal(
      harness.api.getActiveBattleRoute(
        battle({
          mode: 'FRIEND',
          recoveryTarget: 'ROOM',
          roomStatus: 'WAITING',
          invitationToken: 'private-token',
          inviteCode: 'ABC234',
        }),
      ),
      '/pages/battle/room?battleId=11111111-1111-4111-8111-111111111111&invitationToken=private-token&inviteCode=ABC234',
    );
  } finally {
    harness.restore();
  }
});

test('blocks new battle entry only for unfinished battles', async () => {
  const harness = loadRecoveryModule();
  try {
    harness.setActiveBattle(battle());
    assert.equal(await harness.api.guardBattleEntry(), false);
    assert.equal(harness.requests[0].url, '/battles/active');
    assert.equal(harness.modals[0].title, '你还有一场未结束的对战');
    assert.equal(harness.modals[0].confirmText, '返回当前对战');
    assert.equal(harness.navigations[0], '/pages/battle/play?battleId=11111111-1111-4111-8111-111111111111');

    harness.setActiveBattle(
      battle({ recoveryTarget: 'RESULT', roomStatus: 'COMPLETED', readOnly: true }),
    );
    assert.equal(await harness.api.guardBattleEntry(), true);
  } finally {
    harness.restore();
  }
});

test('catches BATTLE_ALREADY_ACTIVE and routes through recovery UI', async () => {
  const harness = loadRecoveryModule();
  try {
    harness.setActiveBattle(battle({ mode: 'AI' }));
    assert.equal(
      await harness.api.handleBattleAlreadyActive(
        new MockRequestError('BATTLE_ALREADY_ACTIVE'),
      ),
      true,
    );
    assert.equal(harness.modals.length, 1);
    assert.doesNotMatch(harness.modals[0].title, /BATTLE_ALREADY_ACTIVE/);
  } finally {
    harness.restore();
  }
});

test('renders the current battle card with product copy', () => {
  const script = read('pages/battle/index.ts');
  const template = read('pages/battle/index.wxml');

  assert.match(script, /fetchActiveBattle/);
  assert.match(script, /handleRecoverBattle/);
  assert.match(template, /当前对战/);
  assert.match(template, /activeBattle\.actionText/);
  assert.doesNotMatch(template, /battleId|BATTLE_ALREADY_ACTIVE|SUBMITTED|IN_PROGRESS/);
});

test('keeps normal navigation separate from explicit cancellation and forfeit', () => {
  const roomScript = read('pages/battle/room.ts');
  const roomTemplate = read('pages/battle/room.wxml');
  const playScript = read('pages/battle/play.ts');

  const roomBack = roomScript.match(/async handleNavBack\(\) \{([\s\S]*?)\n  \},/)[1];
  assert.match(roomBack, /navigateHome/);
  assert.doesNotMatch(roomBack, /cancelFriendRoom|confirmCancelAndLeave/);
  assert.match(roomScript, /onShow\(\)[\s\S]*autoNavigate: false/);
  assert.match(
    roomScript,
    /state === 'IN_PROGRESS'[\s\S]*if \(options\?\.autoNavigate\)/,
  );
  assert.match(roomTemplate, /bindtap="handleLeaveRoom"/);
  assert.match(roomScript, /handleLeaveRoom[\s\S]*confirmCancelAndLeave/);
  assert.match(roomScript, /离开后将无法继续本场对战/);

  const playBack = playScript.match(/handleBackRoom\(\) \{([\s\S]*?)\n  \},/)[1];
  assert.doesNotMatch(playBack, /forfeitBattle/);
  assert.match(playScript, /handleForfeitBattle[\s\S]*确认认输/);
});

test('removes duplicate matchmaking card and visible HTML entities', () => {
  const matchmaking = read('pages/battle/matchmaking.wxml');
  const room = read('pages/battle/room.wxml');
  const friendRoom = read('pages/battle/friend-room.wxml');

  assert.doesNotMatch(matchmaking, /class="section-card rating-card"/);
  assert.doesNotMatch(matchmaking, /\{\{selectedSkillName \|\| 'Python'\}\} 匹配中/);
  assert.match(matchmaking, /已等待/);
  assert.match(matchmaking, /剩余搜索时间/);
  assert.match(matchmaking, /电脑对战/);
  [room, friendRoom].forEach((template) => {
    assert.doesNotMatch(template, /&lt;|&gt;|&amp;/);
    assert.match(template, /custom-nav-back-icon">‹</);
  });
});

test('recovers active battles opened through a friend invitation preview', () => {
  const friendRoomScript = read('pages/battle/friend-room.ts');

  assert.match(
    friendRoomScript,
    /cannotJoinReason === 'BATTLE_ALREADY_ACTIVE'[\s\S]*showActiveBattleRecovery/,
  );
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
  else process.stdout.write(`Active battle recovery tests passed: ${tests.length}\n`);
})();
