import { existsSync, readFileSync } from 'fs';
import { dirname, parse, resolve } from 'path';

const CONTENT_DIRECTORY = ['docs', 'python-chapter'] as const;

export function resolveSeedDocumentPath(fileName: string): string {
  let currentDirectory = __dirname;
  const filesystemRoot = parse(currentDirectory).root;

  while (true) {
    const candidate = resolve(
      currentDirectory,
      ...CONTENT_DIRECTORY,
      fileName,
    );
    if (existsSync(candidate)) {
      return candidate;
    }

    if (currentDirectory === filesystemRoot) {
      break;
    }
    currentDirectory = dirname(currentDirectory);
  }

  throw new Error(
    `Seed document not found: ${CONTENT_DIRECTORY.join('/')}/${fileName}`,
  );
}

export function readSeedDocument(fileName: string): string {
  return readFileSync(resolveSeedDocumentPath(fileName), 'utf8');
}
