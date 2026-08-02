const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const serverRoot = path.resolve(__dirname, '..');
const outDir = path.join(serverRoot, '.seed-dist');
const tscBin = path.join(
  serverRoot,
  'node_modules',
  'typescript',
  'bin',
  'tsc',
);
const compiledEntry = path.join(outDir, 'scripts', 'seed-content.js');

try {
  execFileSync(process.execPath, [tscBin, '-p', 'tsconfig.seed.json'], {
    cwd: serverRoot,
    stdio: 'inherit',
  });

  execFileSync(process.execPath, [compiledEntry], {
    cwd: serverRoot,
    stdio: 'inherit',
    env: process.env,
  });
} finally {
  fs.rmSync(outDir, { recursive: true, force: true });
}
