import { Buffer } from 'buffer';

type CursorPayload = {
  id: string;
};

export function encodeCommunityCursor(payload: CursorPayload) {
  return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
}

export function decodeCommunityCursor(cursor: string | undefined | null) {
  if (!cursor) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(cursor, 'base64url').toString('utf8'),
    ) as Partial<CursorPayload>;

    if (typeof payload.id !== 'string' || payload.id.trim().length === 0) {
      return null;
    }

    return {
      id: payload.id,
    };
  } catch {
    return null;
  }
}

export function trimCommunityText(value: string) {
  return value.trim();
}

export function previewCommunityText(value: string, maxLength = 120) {
  const trimmed = value.trim();

  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return `${trimmed.slice(0, maxLength)}...`;
}

export function toCommunityImagePreview(urls: string[], limit = 3) {
  return urls.slice(0, limit);
}
