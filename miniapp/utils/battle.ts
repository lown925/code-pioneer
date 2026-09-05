function normalizeNumber(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, value);
}

export type BattleStarSlot = {
  value: number;
  isFilled: boolean;
};

export type BattleStarDisplay = {
  starSlots: BattleStarSlot[];
  starAriaLabel: string;
};

const BATTLE_STAR_COUNT = 6;

export function formatBattleStarDisplay(
  star: number | null | undefined,
): BattleStarDisplay {
  const normalizedStar = Number.isFinite(star)
    ? Math.min(BATTLE_STAR_COUNT, Math.max(0, Math.floor(star ?? 0)))
    : 0;

  return {
    starSlots: Array.from({ length: BATTLE_STAR_COUNT }, (_, index) => ({
      value: index + 1,
      isFilled: index < normalizedStar,
    })),
    starAriaLabel: normalizedStar > 0 ? `${normalizedStar} 星` : '未定级',
  };
}

export function formatBattleNickname(nickname: string | null | undefined) {
  const trimmed = nickname?.trim();

  return trimmed ? trimmed : '匿名用户';
}

export function formatBattleInitial(nickname: string | null | undefined) {
  return formatBattleNickname(nickname).slice(0, 1);
}

type BattleOpponentIdentity =
  | {
      type: 'HUMAN';
      nickname: string | null;
      avatarUrl: string | null;
    }
  | {
      type: 'AI';
      displayName: string;
    }
  | null;

export function formatBattleOpponentIdentity(
  opponent: BattleOpponentIdentity,
  fallbackName = '单人训练',
) {
  if (!opponent) {
    return {
      nicknameText: fallbackName,
      avatarUrl: '',
      avatarFallbackText: fallbackName.slice(0, 1),
    };
  }

  if (opponent.type === 'AI') {
    const displayName = opponent.displayName.trim() || '电脑对手';

    return {
      nicknameText: displayName,
      avatarUrl: '',
      avatarFallbackText: '电',
    };
  }

  return {
    nicknameText: formatBattleNickname(opponent.nickname),
    avatarUrl: opponent.avatarUrl ?? '',
    avatarFallbackText: formatBattleInitial(opponent.nickname),
  };
}

export function formatBattleRating(rating: number | null | undefined) {
  return String(Math.round(normalizeNumber(rating ?? 0)));
}

export function formatBattleSkill(skill: string | null | undefined) {
  if (!skill) {
    return '历史对战';
  }

  if (skill === 'PYTHON') {
    return 'Python';
  }

  if (skill === 'JAVASCRIPT') {
    return 'JavaScript';
  }

  return skill;
}

export function formatBattleTrack(
  trackKey: string | null | undefined,
  identity?: { shortName?: string | null } | null,
) {
  const shortName = identity?.shortName?.trim();
  if (shortName) {
    return shortName;
  }

  const labels: Record<string, string> = {
    'big-data': '大数据',
    'computer-science': '计算机',
    'software-engineering': '软件工程',
  };

  return labels[trackKey ?? ''] ?? (trackKey?.trim() || '历史对战');
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

export function normalizeBattleInviteCode(value: string | null | undefined) {
  return (value ?? '').trim().toUpperCase();
}

type ConfirmModalOptions = {
  title: string;
  content: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: string;
};

export function showBattleConfirmModal(options: ConfirmModalOptions) {
  return new Promise<{ confirm: boolean; cancel: boolean }>((resolve) => {
    (
      wx as unknown as {
        showModal: (
          modalOptions: ConfirmModalOptions & {
            success?: (result: {
              confirm: boolean;
              cancel: boolean;
            }) => void;
            fail?: () => void;
          },
        ) => void;
      }
    ).showModal({
      ...options,
      success(result) {
        resolve(result);
      },
      fail() {
        resolve({
          confirm: false,
          cancel: true,
        });
      },
    });
  });
}

export function enableBattleLeaveAlert(message: string) {
  const leaveAlertApi = (
    wx as unknown as {
      enableAlertBeforeUnload?: (options: {
        message: string;
      }) => void;
    }
  ).enableAlertBeforeUnload;

  if (typeof leaveAlertApi !== 'function') {
    return;
  }

  leaveAlertApi({
    message,
  });
}

export function disableBattleLeaveAlert() {
  const leaveAlertApi = (
    wx as unknown as {
      disableAlertBeforeUnload?: () => void;
    }
  ).disableAlertBeforeUnload;

  if (typeof leaveAlertApi !== 'function') {
    return;
  }

  leaveAlertApi();
}

type BattleErrorMessages = {
  unauthorized: string;
  network: string;
  fallback: string;
};

type BattleErrorCodeMap = Partial<Record<string, string>>;

export function getBattleErrorMessage(
  error: unknown,
  messages: BattleErrorMessages,
  codeMap: BattleErrorCodeMap = {},
) {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code?: unknown }).code === 'string'
  ) {
    const code = (error as { code: string }).code;

    if (code === 'UNAUTHORIZED') {
      return messages.unauthorized;
    }

    if (code === 'NETWORK_ERROR') {
      return messages.network;
    }

    if (codeMap[code]) {
      return codeMap[code] as string;
    }
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'statusCode' in error &&
    (error as { statusCode?: unknown }).statusCode === 401
  ) {
    return messages.unauthorized;
  }

  return messages.fallback;
}
