'use strict';

const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const Module = require('node:module');
const typescript = require('../../server/node_modules/typescript');

const chartPath = resolve(
  __dirname,
  '../components/growth-line-chart/index.ts',
);
const compiledChartModule = typescript.transpileModule(
  readFileSync(chartPath, 'utf8'),
  {
    compilerOptions: {
      module: typescript.ModuleKind.CommonJS,
      target: typescript.ScriptTarget.ES2020,
      strict: true,
    },
  },
).outputText;

const palette = {
  background: '#ffffff',
  grid: '#dddddd',
  label: '#666666',
  quiz: '#0000ff',
  practice: '#00aa00',
  rating: '#ffaa00',
};
const canvasApi = {
  getSystemInfoSync() {
    return { windowWidth: 375 };
  },
  createCanvasContext() {
    throw new Error('Canvas context was not configured');
  },
};

let componentDefinition;
global.wx = canvasApi;
global.Component = (definition) => {
  componentDefinition = definition;
};

const originalLoad = Module._load;
Module._load = function load(request, parent, isMain) {
  if (request === '../../utils/theme') {
    return { getThemeChartPalette: () => palette };
  }
  return originalLoad.call(this, request, parent, isMain);
};

try {
  const chartModule = new Module(chartPath, module);
  chartModule.filename = chartPath;
  chartModule.paths = Module._nodeModulePaths(resolve(chartPath, '..'));
  chartModule._compile(compiledChartModule, chartPath);
} finally {
  Module._load = originalLoad;
}

function createCanvasRecorder() {
  const calls = [];
  const record = (name) => (...args) => calls.push([name, ...args]);
  return {
    calls,
    context: {
      clearRect: record('clearRect'),
      setFillStyle: record('setFillStyle'),
      fillRect: record('fillRect'),
      setFontSize: record('setFontSize'),
      fillText: record('fillText'),
      setStrokeStyle: record('setStrokeStyle'),
      setLineWidth: record('setLineWidth'),
      beginPath: record('beginPath'),
      moveTo: record('moveTo'),
      lineTo: record('lineTo'),
      stroke: record('stroke'),
      arc: record('arc'),
      fill: record('fill'),
      draw: record('draw'),
    },
  };
}

function draw(data) {
  const recorder = createCanvasRecorder();
  canvasApi.createCanvasContext = () => recorder.context;
  componentDefinition.methods.drawChart.call({ data });
  return recorder.calls;
}

const tests = [];
function test(name, run) {
  tests.push({ name, run });
}

test('registers ratingPoints as an independent property', () => {
  assert.ok(componentDefinition.properties.ratingPoints);
  assert.equal(componentDefinition.properties.points.ratingPoints, undefined);
});

test('registers points as an independent property', () => {
  assert.ok(componentDefinition.properties.points);
  assert.equal(componentDefinition.properties.points.chartMode, undefined);
  assert.equal(componentDefinition.properties.points.ratingPoints, undefined);
});

test('registers chartMode as an independent property', () => {
  assert.ok(componentDefinition.properties.chartMode);
  assert.equal(componentDefinition.properties.points.chartMode, undefined);
  assert.equal(componentDefinition.properties.chartMode.value, 'learning');
});

test('rating mode draws ratingPoints without reading learning points', () => {
  const data = {
    canvasWidth: 320,
    canvasHeight: 150,
    chartMode: 'rating',
    resolvedTheme: 'light',
    ratingPoints: [
      { label: '1', value: 1000 },
      { label: '2', value: 1016 },
    ],
  };
  Object.defineProperty(data, 'points', {
    get() {
      throw new Error('rating mode read learning points');
    },
  });

  const calls = draw(data);
  assert.equal(calls.filter(([name]) => name === 'arc').length, 2);
  const labels = calls
    .filter(([name]) => name === 'fillText')
    .map(([, value]) => value);
  for (const label of ['990', '1010', '1030', '1', '2']) {
    assert.ok(labels.includes(label), `missing rating label ${label}`);
  }
  assert.ok(
    calls.some(
      ([name, value]) => name === 'setStrokeStyle' && value === palette.rating,
    ),
  );
});

test('learning mode draws points without reading ratingPoints', () => {
  const data = {
    canvasWidth: 320,
    canvasHeight: 150,
    chartMode: 'learning',
    resolvedTheme: 'light',
    points: [
      { date: '2026-08-17', quizAccuracy: 80, practiceAccuracy: 70 },
      { date: '2026-08-18', quizAccuracy: 90, practiceAccuracy: null },
    ],
  };
  Object.defineProperty(data, 'ratingPoints', {
    get() {
      throw new Error('learning mode read rating points');
    },
  });

  const calls = draw(data);
  assert.equal(calls.filter(([name]) => name === 'arc').length, 3);
  const labels = calls
    .filter(([name]) => name === 'fillText')
    .map(([, value]) => value);
  for (const label of ['0', '50', '100', '08-17', '08-18']) {
    assert.ok(labels.includes(label), `missing learning label ${label}`);
  }
  assert.ok(
    calls.some(
      ([name, value]) => name === 'setStrokeStyle' && value === palette.quiz,
    ),
  );
  assert.ok(
    calls.some(
      ([name, value]) =>
        name === 'setStrokeStyle' && value === palette.practice,
    ),
  );
});

test('keeps learning and rating data paths mutually exclusive', () => {
  assert.notEqual(
    componentDefinition.properties.points,
    componentDefinition.properties.ratingPoints,
  );
  assert.deepEqual(
    Object.keys(componentDefinition.properties).sort(),
    ['chartMode', 'points', 'ratingPoints', 'resolvedTheme'],
  );
});

for (const { name, run } of tests) {
  try {
    run();
  } catch (error) {
    process.stderr.write(`FAIL ${name}\n${error.stack}\n`);
    process.exitCode = 1;
  }
}

if (!process.exitCode) {
  process.stdout.write(`Growth line chart tests passed: ${tests.length}\n`);
}
