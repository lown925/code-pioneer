'use strict';

const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');

const miniappRoot = resolve(__dirname, '..');
const read = (path) => readFileSync(resolve(miniappRoot, path), 'utf8');
const componentScript = read('components/battle-match-floating/index.ts');
const componentTemplate = read('components/battle-match-floating/index.wxml');
const componentStyle = read('components/battle-match-floating/index.wxss');
const matchmakingScript = read('pages/battle/matchmaking.ts');
const matchmakingTemplate = read('pages/battle/matchmaking.wxml');
const appScript = read('app.ts');

const tests = [];
function test(name, run) { tests.push({ name, run }); }

test('renders pre-unlock searching without a computer button', () => {
  assert.match(componentTemplate, /status === 'SEARCHING'/);
  assert.match(componentTemplate, /继续使用小程序/);
  const searchingBlock = componentTemplate.split("status === 'SEARCHING'")[1].split('wx:elif')[0];
  assert.doesNotMatch(searchingBlock, /电脑对战/);
});

test('renders persistent computer, matched, expired, reconnecting, and cancel actions', () => {
  assert.match(componentTemplate, /SEARCHING_COMPUTER_AVAILABLE/);
  assert.match(componentTemplate, /电脑对战/);
  assert.match(componentTemplate, /继续等待/);
  assert.match(componentTemplate, /取消匹配/);
  assert.match(componentTemplate, /status === 'MATCHED'/);
  assert.match(componentTemplate, /进入对战/);
  assert.match(componentTemplate, /status === 'EXPIRED'/);
  assert.match(componentTemplate, /重新匹配/);
  assert.match(componentTemplate, /正在重新连接/);
  assert.match(componentScript, /computerAvailable: snapshot\.computerAvailable/);
});

test('supports collapse, compact-only question pages, light, and dark themes', () => {
  assert.match(componentScript, /setCollapsed/);
  assert.match(componentScript, /compactOnly/);
  assert.match(componentTemplate, /theme-\{\{resolvedTheme\}\}/);
  assert.match(componentStyle, /theme-dark/);
  assert.match(read('pages/chapter/quiz.wxml'), /battle-match-floating compact-only/);
  assert.match(read('pages/practice/index.wxml'), /battle-match-floating compact-only/);
});

test('covers primary pages but stays absent from Room, Play, and Result', () => {
  const covered = [
    'pages/battle/index.wxml',
    'pages/learning/index.wxml',
    'pages/course/list.wxml',
    'pages/course/detail.wxml',
    'pages/growth/index.wxml',
    'pages/profile/index.wxml',
  ];
  covered.forEach((path) => assert.match(read(path), /<battle-match-floating/));
  ['pages/battle/room.wxml', 'pages/battle/play.wxml', 'pages/battle/result.wxml']
    .forEach((path) => assert.doesNotMatch(read(path), /battle-match-floating/));
});

test('migrates matchmaking page to manager and removes old Training fallback', () => {
  assert.match(matchmakingScript, /getBattleMatchmakingManager/);
  assert.doesNotMatch(matchmakingScript, /setTimeout|startPolling|pollTimer|TRAINING_UNLOCK_MS/);
  assert.doesNotMatch(matchmakingScript, /\/battles\/training/);
  assert.doesNotMatch(matchmakingTemplate, /单人训练|Training fallback/);
  assert.match(matchmakingTemplate, /电脑对战/);
  assert.match(matchmakingTemplate, /\{\{waitingCountText\}\}/);
  assert.match(matchmakingScript, /当前 \$\{snapshot\.waitingCount\} 人活跃匹配/);
});

test('uses App lifecycle without cancelling on hide', () => {
  assert.match(appScript, /initializeBattleMatchmakingManager/);
  assert.match(appScript, /recoverBattleMatchmaking/);
  assert.match(appScript, /onHide\(\)[\s\S]*pauseBattleMatchmaking/);
  assert.doesNotMatch(appScript, /onHide\(\)[\s\S]*cancel/);
});

test('uses only product copy for computer battles', () => {
  assert.doesNotMatch(componentTemplate, /AI 对战|AI Battle|Bot/i);
  assert.doesNotMatch(matchmakingTemplate, /AI 对战|AI Battle|Bot/i);
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
if (failures > 0) process.exitCode = 1;
else process.stdout.write(`Floating matchmaking tests passed: ${tests.length}\n`);
