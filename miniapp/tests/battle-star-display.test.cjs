'use strict';

const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const Module = require('node:module');
const typescript = require('../../server/node_modules/typescript');

const utilityPath = resolve(__dirname, '../utils/battle.ts');
const compiledUtilityModule = typescript.transpileModule(
  readFileSync(utilityPath, 'utf8'),
  {
    compilerOptions: {
      module: typescript.ModuleKind.CommonJS,
      target: typescript.ScriptTarget.ES2020,
      strict: true,
    },
  },
).outputText;
const utilityModule = new Module(utilityPath, module);
utilityModule.filename = utilityPath;
utilityModule.paths = Module._nodeModulePaths(resolve(utilityPath, '..'));
utilityModule._compile(compiledUtilityModule, utilityPath);

const { formatBattleStarDisplay } = utilityModule.exports;

const threeStars = formatBattleStarDisplay(3);
assert.equal(threeStars.starAriaLabel, '3 星');
assert.deepEqual(
  threeStars.starSlots.map((slot) => slot.isFilled),
  [true, true, true, false, false, false],
);

const unranked = formatBattleStarDisplay(null);
assert.equal(unranked.starAriaLabel, '未定级');
assert.equal(unranked.starSlots.length, 6);
assert.ok(unranked.starSlots.every((slot) => !slot.isFilled));

const maximum = formatBattleStarDisplay(99);
assert.equal(maximum.starAriaLabel, '6 星');
assert.ok(maximum.starSlots.every((slot) => slot.isFilled));

process.stdout.write('Battle star display tests passed: 3\n');
