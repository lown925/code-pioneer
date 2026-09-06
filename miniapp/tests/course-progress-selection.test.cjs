'use strict';

const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const Module = require('node:module');
const typescript = require('../../server/node_modules/typescript');

const pagePath = resolve(__dirname, '../pages/learning/course-progress.ts');
const compiledPage = typescript.transpileModule(
  readFileSync(pagePath, 'utf8'),
  {
    compilerOptions: {
      module: typescript.ModuleKind.CommonJS,
      target: typescript.ScriptTarget.ES2020,
      strict: true,
    },
  },
).outputText;

let pageDefinition;
global.Page = (definition) => {
  pageDefinition = definition;
};
global.wx = {};

const originalLoad = Module._load;
Module._load = function load(request, parent, isMain) {
  if (request.endsWith('/theme-page')) {
    return {
      registerThemedPage: (definition) => global.Page(definition),
    };
  }
  if (request.endsWith('/auth')) {
    return { getAuthStateSummary: () => null, redirectToLogin: () => {} };
  }
  if (request.endsWith('/request')) {
    return { request: async () => ({}), RequestError: class RequestError extends Error {} };
  }
  if (request.endsWith('/time')) {
    return { formatLearningTimestamp: () => '' };
  }
  return originalLoad.call(this, request, parent, isMain);
};

try {
  const pageModule = new Module(pagePath, module);
  pageModule.filename = pagePath;
  pageModule.paths = Module._nodeModulePaths(resolve(pagePath, '..'));
  pageModule._compile(compiledPage, pagePath);
} finally {
  Module._load = originalLoad;
}

assert.ok(pageDefinition);
const selectPrimaryChapterId = pageDefinition.selectPrimaryChapterId;

function chapter(chapterId, sortOrder, status = 'NOT_STARTED') {
  return {
    chapterId,
    title: chapterId,
    sortOrder,
    status,
    startedAt: null,
    lastLearnedAt: null,
    completedAt: status === 'COMPLETED' ? '2026-08-18T04:00:00.000Z' : null,
    hasQuiz: false,
    quizCompleted: false,
  };
}

function progress(chapters, lastChapterId) {
  return {
    courseId: 'course-1',
    status: 'LEARNING',
    progressPercent: 50,
    completedChapterCount: chapters.filter((item) => item.status === 'COMPLETED').length,
    totalChapterCount: chapters.length,
    startedAt: null,
    lastLearnedAt: null,
    completedAt: null,
    lastLearnedChapter: lastChapterId ? { chapterId: lastChapterId, title: lastChapterId } : null,
    chapters,
  };
}

const tests = [
  ['continues a recent incomplete chapter', () => {
    const chapters = [chapter('chapter-1', 1, 'LEARNING'), chapter('chapter-2', 2)];
    assert.equal(selectPrimaryChapterId(progress(chapters, 'chapter-1')), 'chapter-1');
  }],
  ['moves after a completed recent chapter', () => {
    const chapters = [chapter('chapter-1', 1, 'COMPLETED'), chapter('chapter-2', 2)];
    assert.equal(selectPrimaryChapterId(progress(chapters, 'chapter-1')), 'chapter-2');
  }],
  ['falls back to the first incomplete chapter when later chapters are complete', () => {
    const chapters = [
      chapter('chapter-1', 1),
      chapter('chapter-2', 2, 'COMPLETED'),
      chapter('chapter-3', 3, 'COMPLETED'),
    ];
    assert.equal(selectPrimaryChapterId(progress(chapters, 'chapter-3')), 'chapter-1');
  }],
  ['uses the first incomplete chapter when recent chapter is invalid', () => {
    const chapters = [chapter('chapter-1', 1), chapter('chapter-2', 2, 'COMPLETED')];
    assert.equal(selectPrimaryChapterId(progress(chapters, 'missing')), 'chapter-1');
  }],
  ['keeps the last chapter as the completed-course view target', () => {
    const chapters = [chapter('chapter-2', 2, 'COMPLETED'), chapter('chapter-1', 1, 'COMPLETED')];
    assert.equal(selectPrimaryChapterId(progress(chapters, 'chapter-1')), 'chapter-2');
  }],
];

let failures = 0;
for (const [name, run] of tests) {
  try {
    run();
    process.stdout.write(`PASS ${name}\n`);
  } catch (error) {
    failures += 1;
    process.stderr.write(`FAIL ${name}\n${error.stack || error}\n`);
  }
}

if (failures > 0) {
  process.exitCode = 1;
} else {
  process.stdout.write(`Course progress selection tests passed: ${tests.length}\n`);
}
