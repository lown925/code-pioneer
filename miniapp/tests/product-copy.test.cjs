'use strict';

const assert = require('node:assert/strict');
const { readFileSync, readdirSync, statSync } = require('node:fs');
const { extname, resolve } = require('node:path');
const typescript = require('../../server/node_modules/typescript');

const miniappRoot = resolve(__dirname, '..');
const pageRoots = [resolve(miniappRoot, 'pages'), resolve(miniappRoot, 'components')];

function walk(directory) {
  return readdirSync(directory).flatMap((name) => {
    const target = resolve(directory, name);
    return statSync(target).isDirectory() ? walk(target) : [target];
  });
}

function read(relativePath) {
  return readFileSync(resolve(miniappRoot, relativePath), 'utf8');
}

function getVisibleWxmlText(source) {
  return source
    .replace(/<!--[^]*?-->/g, ' ')
    .replace(/\{\{[^]*?\}\}/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ');
}

function getNavigationTitles() {
  const titles = [JSON.parse(read('app.json')).window.navigationBarTitleText];
  for (const file of walk(resolve(miniappRoot, 'pages'))) {
    if (extname(file) !== '.json') continue;
    const config = JSON.parse(readFileSync(file, 'utf8'));
    if (typeof config.navigationBarTitleText === 'string') {
      titles.push(config.navigationBarTitleText);
    }
  }
  return titles;
}

function getUserFacingTsStrings() {
  const values = [];
  const testsRoot = resolve(miniappRoot, 'tests');
  for (const file of walk(miniappRoot)) {
    if (extname(file) !== '.ts' || file.startsWith(testsRoot)) continue;
    const source = typescript.createSourceFile(
      file,
      readFileSync(file, 'utf8'),
      typescript.ScriptTarget.Latest,
      true,
    );
    function addValue(value) {
      const isInternal =
        value.startsWith('/') ||
        /^(?:BATTLE|ROOM|MATCH|AI|RANKED|FRIEND|TRAINING|PRACTICE|LEARNING|TOTAL|PYTHON)(?:_[A-Z_]+)?$/.test(
          value,
        ) ||
        value.includes('/types/') ||
        value.includes('/utils/');
      if (!isInternal && /[\u3400-\u9fff]/.test(value)) values.push(value);
    }
    function visit(node) {
      if (
        typescript.isStringLiteral(node) ||
        typescript.isNoSubstitutionTemplateLiteral(node)
      ) {
        addValue(node.text);
      } else if (typescript.isTemplateExpression(node)) {
        addValue(
          [node.head.text, ...node.templateSpans.map((span) => span.literal.text)].join(
            ' ',
          ),
        );
      }
      typescript.forEachChild(node, visit);
    }
    visit(source);
  }
  return values;
}

const visibleWxmlItems = pageRoots
  .flatMap(walk)
  .filter((file) => extname(file) === '.wxml')
  .map((file) => getVisibleWxmlText(readFileSync(file, 'utf8')));
const navigationTitles = getNavigationTitles();
const userFacingTsStrings = getUserFacingTsStrings();
const userFacingCopyItems = [
  ...visibleWxmlItems,
  ...navigationTitles,
  ...userFacingTsStrings,
];
const userFacingCopy = userFacingCopyItems.join('\n');

const tests = [];
function test(name, run) {
  tests.push({ name, run });
}

test('uses the official product name', () => {
  assert.equal(JSON.parse(read('app.json')).window.navigationBarTitleText, '码战先锋');
  assert.match(read('pages/home/index.wxml'), /码战先锋/);
  assert.doesNotMatch(userFacingCopy, /码站先锋|代码先锋|Code[ -]?Pioneer|CodePioneer/i);
});

test('uses Chinese product names in visible templates and titles', () => {
  for (const expected of [
    '对战',
    '积分',
    '章节测验',
    '练习室',
    '成长',
    '随机匹配',
    '好友对战',
    '训练',
    '电脑对战',
    '学习',
    '我的',
  ]) {
    assert.match(userFacingCopy, new RegExp(expected), `missing product copy: ${expected}`);
  }
});

test('removes legacy English and matchmaking labels from user copy', () => {
  const forbidden = [
    /BATTLE V1/i,
    /RANKED MATCHMAKING/i,
    /真人(?:随机)?匹配/,
    /好友房/,
    /排位(?:匹配|对战|胜负)/,
    /AI 对战/i,
    /AI Battle/i,
    /\bBot\b/i,
    /总榜 Rating/i,
    /当前 Rating/i,
    /Battle History/i,
    /Battle Result/i,
    /\bQuiz\b/i,
    /\bPractice\b/i,
    /\bGrowth\b/i,
  ];
  for (const pattern of forbidden) {
    assert.doesNotMatch(userFacingCopy, pattern, `legacy copy found: ${pattern}`);
  }
});

test('does not expose internal identifiers in explicit user copy', () => {
  const rawPattern =
    /\b(?:BATTLE|ROOM|MATCH|AI)_[A-Z_]+\b|battleId 无效|participantStatus|serverTime|startedAt/;
  for (const value of userFacingCopyItems) {
    assert.doesNotMatch(value, rawPattern, `raw copy found: ${value}`);
  }
});

test('uses unified labels on key battle and growth surfaces', () => {
  assert.doesNotMatch(read('pages/battle/index.wxml'), /BATTLE V1|>Rating</);
  assert.match(read('pages/battle/matchmaking.wxml'), /随机匹配/);
  assert.match(read('pages/battle/friend-room.wxml'), /创建好友对战/);
  assert.match(read('pages/battle/room.wxml'), /对战方向/);
  assert.match(read('pages/growth/index.wxml'), /章节测验/);
  assert.match(read('pages/growth/index.wxml'), /积分趋势/);
  assert.match(read('components/growth-line-chart/index.wxml'), /练习室/);
});

let failures = 0;
for (const { name, run } of tests) {
  try {
    run();
    process.stdout.write(`PASS ${name}\n`);
  } catch (error) {
    failures += 1;
    process.stderr.write(`FAIL ${name}\n${error.stack || error}\n`);
  }
}

if (failures > 0) process.exitCode = 1;
else process.stdout.write(`Product copy tests passed: ${tests.length}\n`);
