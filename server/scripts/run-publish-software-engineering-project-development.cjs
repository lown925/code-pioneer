const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const serverRoot = path.resolve(__dirname, '..');
const outDir = path.join(serverRoot, '.seed-dist');
const tscBin = path.join(serverRoot, 'node_modules', 'typescript', 'bin', 'tsc');
const compiledEntry = path.join(outDir, 'scripts', 'publish-software-engineering-project-development.js');
try {
  execFileSync(process.execPath, [tscBin, '-p', 'tsconfig.seed.json'], { cwd: serverRoot, stdio: 'inherit' });
  execFileSync(process.execPath, [compiledEntry, ...process.argv.slice(2)], { cwd: serverRoot, stdio: 'inherit', env: process.env });
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`software-engineering-project-development publisher failed: ${message}`);
  process.exitCode = typeof error.status === 'number' && error.status > 0 ? error.status : 1;
} finally {
  fs.rmSync(outDir, { recursive: true, force: true });
}
