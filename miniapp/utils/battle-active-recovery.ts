import type { ActiveBattleResponse } from '../types/battle';
import {
  formatBattleSkill,
  showBattleConfirmModal,
} from './battle';
import { request, RequestError } from './request';

export type ActiveBattlePresentation = {
  battle: ActiveBattleResponse;
  modeText: string;
  skillText: string;
  statusText: string;
  actionText: string;
};

export async function fetchActiveBattle() {
  return request<ActiveBattleResponse | null>({
    url: '/battles/active',
    method: 'GET',
    authMode: 'required',
  });
}

export function getActiveBattleRoute(battle: ActiveBattleResponse) {
  const battleId = encodeURIComponent(battle.battleId);

  if (battle.recoveryTarget === 'RESULT') {
    return `/pages/battle/result?battleId=${battleId}`;
  }

  if (battle.recoveryTarget === 'ROOM') {
    const query = [`battleId=${battleId}`];

    if (battle.invitationToken) {
      query.push(
        `invitationToken=${encodeURIComponent(battle.invitationToken)}`,
      );
    }

    if (battle.inviteCode) {
      query.push(`inviteCode=${encodeURIComponent(battle.inviteCode)}`);
    }

    return `/pages/battle/room?${query.join('&')}`;
  }

  return `/pages/battle/play?battleId=${battleId}`;
}

export function navigateToActiveBattle(battle: ActiveBattleResponse) {
  wx.navigateTo({
    url: getActiveBattleRoute(battle),
  });
}

export function getActiveBattlePresentation(
  battle: ActiveBattleResponse,
): ActiveBattlePresentation {
  const modeText =
    battle.mode === 'RANKED'
      ? '随机匹配'
      : battle.mode === 'FRIEND'
        ? '好友对战'
        : battle.mode === 'TRAINING'
          ? '单人训练'
          : '电脑对战';
  const statusText =
    battle.recoveryTarget === 'RESULT'
      ? '已完成'
      : battle.readOnly
        ? battle.roomStatus === 'SETTLING'
          ? '正在生成结果'
          : '已交卷'
        : battle.recoveryTarget === 'ROOM'
          ? '等待准备'
          : battle.roomStatus === 'COUNTDOWN'
            ? '即将开始'
            : '进行中';
  const actionText =
    battle.recoveryTarget === 'RESULT'
      ? '查看结果'
      : battle.recoveryTarget === 'ROOM'
        ? '返回对战房间'
        : battle.readOnly
          ? '等待结果'
          : '继续对战';

  return {
    battle,
    modeText,
    skillText: battle.skillName?.trim() || formatBattleSkill(battle.skillCode),
    statusText,
    actionText,
  };
}

export async function showActiveBattleRecovery(
  activeBattle?: ActiveBattleResponse | null,
) {
  const battle = activeBattle ?? (await fetchActiveBattle());

  if (!battle) {
    return false;
  }

  const result = await showBattleConfirmModal({
    title: '你还有一场未结束的对战',
    content: '请先返回当前对战，或在对战中选择退出。',
    confirmText: '返回当前对战',
    cancelText: '取消',
    confirmColor: '#2f6bff',
  });

  if (result.confirm) {
    navigateToActiveBattle(battle);
  }

  return true;
}

export async function guardBattleEntry() {
  try {
    const activeBattle = await fetchActiveBattle();

    if (!activeBattle) {
      return true;
    }

    if (activeBattle.recoveryTarget === 'RESULT') {
      return true;
    }

    await showActiveBattleRecovery(activeBattle);
    return false;
  } catch {
    return true;
  }
}

export async function handleBattleAlreadyActive(error: unknown) {
  if (
    !(error instanceof RequestError) ||
    error.code !== 'BATTLE_ALREADY_ACTIVE'
  ) {
    return false;
  }

  try {
    const recovered = await showActiveBattleRecovery();

    if (!recovered) {
      wx.showToast({
        title: '当前对战状态已变化，请返回对战首页重试',
        icon: 'none',
      });
    }
  } catch {
    wx.showToast({
      title: '当前对战暂时无法恢复，请稍后重试',
      icon: 'none',
    });
  }

  return true;
}
