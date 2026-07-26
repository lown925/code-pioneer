function normalizeNumber(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, value);
}

export function formatBattleNickname(nickname: string | null | undefined) {
  const trimmed = nickname?.trim();

  return trimmed ? trimmed : '匿名用户';
}

export function formatBattleInitial(nickname: string | null | undefined) {
  return formatBattleNickname(nickname).slice(0, 1);
}

export function formatBattleRating(rating: number | null | undefined) {
  return String(Math.round(normalizeNumber(rating ?? 0)));
}

export function formatBattleRank(rank: number | null | undefined) {
  if (!Number.isFinite(rank) || !rank || rank <= 0) {
    return '未上榜';
  }

  return `第 ${Math.floor(rank)} 名`;
}

export function formatBattleWinRate(winRate: number | null | undefined) {
  const normalized = normalizeNumber(winRate ?? 0);

  if (normalized === 0) {
    return '0%';
  }

  return `${Number(normalized.toFixed(1))}%`;
}

export function formatBattleRecord(
  wins: number,
  losses: number,
  draws: number,
) {
  return `胜 ${Math.max(0, wins)} / 负 ${Math.max(0, losses)} / 平 ${Math.max(0, draws)}`;
}

export function formatBattleDuration(totalSeconds: number) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

let battleClientRequestSequence = 0;

function toHex(bytes: Uint8Array) {
  return Array.from(bytes)
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('');
}

function createBattleEntropyHex() {
  const randomProvider = (wx as unknown as {
    getRandomValues?: (array: Uint8Array) => Uint8Array;
  }).getRandomValues;

  if (typeof randomProvider === 'function') {
    const bytes = new Uint8Array(8);
    randomProvider(bytes);
    return toHex(bytes);
  }

  battleClientRequestSequence += 1;
  return `${Date.now().toString(16)}${battleClientRequestSequence.toString(16).padStart(4, '0')}`;
}

export function generateBattleClientRequestId(prefix = 'battle-answer') {
  battleClientRequestSequence += 1;

  return [
    prefix,
    Date.now().toString(36),
    battleClientRequestSequence.toString(36),
    createBattleEntropyHex(),
  ].join('-');
}
