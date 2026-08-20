import { existsSync, readFileSync } from 'fs';
import { dirname, parse, resolve } from 'path';

const DEFAULT_CONTENT_DIRECTORY = ['docs', 'python-chapter'] as const;

export function resolveSeedDocumentPath(
  fileName: string,
  contentDirectory: readonly string[] = DEFAULT_CONTENT_DIRECTORY,
): string {
  let currentDirectory = __dirname;
  const filesystemRoot = parse(currentDirectory).root;

  while (true) {
    const candidate = resolve(
      currentDirectory,
      ...contentDirectory,
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
    `Seed document not found: ${contentDirectory.join('/')}/${fileName}`,
  );
}

export function readSeedDocument(
  fileName: string,
  contentDirectory?: readonly string[],
): string {
  return readFileSync(
    resolveSeedDocumentPath(fileName, contentDirectory),
    'utf8',
  );
}
