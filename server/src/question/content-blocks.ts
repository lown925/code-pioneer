import type { ContentBlock } from '../battle/battle.types';

function normalizeText(value: string) {
  return value.replace(/\r\n?/g, '\n').replace(/[ \t]+/g, ' ').trim();
}

function blockKey(block: ContentBlock) {
  if (block.type === 'TEXT') return `TEXT:${normalizeText(block.text)}`;
  if (block.type === 'CODE') return `CODE:${block.language ?? ''}:${block.code.replace(/\r\n?/g, '\n').trim()}`;
  return `IMAGE:${block.url}:${block.alt ?? ''}`;
}

export function canonicalizeQuestionBlocks(rawBlocks: unknown, prompt: string | null, includeFallbackText = true): ContentBlock[] {
  const source = Array.isArray(rawBlocks) ? rawBlocks.filter((item): item is ContentBlock => {
    if (!item || typeof item !== 'object' || !('type' in item)) return false;
    const type = (item as { type?: unknown }).type;
    return type === 'TEXT' || type === 'CODE' || type === 'IMAGE';
  }) : [];
  const result: ContentBlock[] = [];
  const seen = new Set<string>();
  for (const block of source) {
    const key = blockKey(block);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(block);
    }
  }
  if (result.length === 0 && prompt?.trim()) {
    return [{ type: 'TEXT', text: prompt }];
  }
  if (result.length > 0 && includeFallbackText && !result.some((block) => block.type === 'TEXT' && normalizeText(block.text) === normalizeText(prompt ?? '')) && prompt?.trim()) {
    return [{ type: 'TEXT', text: prompt }, ...result];
  }
  return result;
}
