import {
  getBattleMatchmakingManager,
  type BattleMatchmakingSnapshot,
} from '../../utils/battle-matchmaking-state';
import { formatBattleDuration } from '../../utils/battle';
import { getThemeSnapshot, subscribeTheme } from '../../utils/theme';

declare function Component(options: any): void;

type FloatingData = {
  visible: boolean;
  expanded: boolean;
  status: BattleMatchmakingSnapshot['status'];
  resolvedTheme: 'light' | 'dark';
  skillName: string;
  battleId: string;
  waitedText: string;
  remainingText: string;
  waitingCountText: string;
  computerAvailable: boolean;
  reconnecting: boolean;
  lastError: string;
  isStartingComputer: boolean;
  isCancelling: boolean;
  toneClassName: string;
  compactTitle: string;
  titleText: string;
  descriptionText: string;
};

type FloatingProperties = {
  compactOnly: boolean;
};

type FloatingInstance = {
  data: FloatingData & FloatingProperties;
  setData(data: Partial<FloatingData>): void;
  applySnapshot(snapshot: BattleMatchmakingSnapshot): void;
};

const subscriptions = new WeakMap<
  object,
  { matchmaking: () => void; theme: () => void }
>();

function getPresentation(snapshot: BattleMatchmakingSnapshot) {
  if (snapshot.status === 'MATCHED') {
    return {
      toneClassName: 'floating-matched',
      compactTitle: `${snapshot.skillName} 匹配成功`,
      titleText: '匹配成功',
      descriptionText: '正在打开对战房间，请完成准备。',
    };
  }

  if (snapshot.status === 'EXPIRED') {
    return {
      toneClassName: 'floating-expired',
      compactTitle: `${snapshot.skillName} 匹配已结束`,
      titleText: '匹配已结束',
      descriptionText: snapshot.computerAvailable
        ? '本轮搜索已结束，仍可进入电脑对战或重新匹配。'
        : '本轮真人搜索已结束，可以重新开始匹配。',
    };
  }

  if (snapshot.status === 'CANCELLED') {
    return {
      toneClassName: 'floating-expired',
      compactTitle: `${snapshot.skillName} 匹配已失效`,
      titleText: '该次匹配已失效',
      descriptionText: '对战房间未在准备时间内开始，请重新匹配。',
    };
  }

  if (snapshot.status === 'ERROR') {
    return {
      toneClassName: 'floating-error',
      compactTitle: `${snapshot.skillName} 正在重新连接`,
      titleText: '匹配状态暂时不可用',
      descriptionText: '正在保留最近一次匹配状态，请稍候重试。',
    };
  }

  if (snapshot.status === 'SEARCHING_COMPUTER_AVAILABLE') {
    return {
      toneClassName: 'floating-computer',
      compactTitle: `${snapshot.skillName} 匹配中 · ${formatBattleDuration(snapshot.elapsedMs / 1000)}`,
      titleText: `${snapshot.skillName} 匹配中`,
      descriptionText: '暂时没有合适的对手，可进入电脑对战或继续等待。',
    };
  }

  return {
    toneClassName: 'floating-searching',
    compactTitle: `${snapshot.skillName} 匹配中 · ${formatBattleDuration(snapshot.elapsedMs / 1000)}`,
    titleText: `${snapshot.skillName} 匹配中`,
    descriptionText: '可以继续使用小程序，匹配会在前台持续同步。',
  };
}

function formatWaitingCount(waitingCount: number) {
  return waitingCount > 1
    ? `当前有 ${waitingCount} 位玩家正在匹配`
    : '正在寻找合适的对手';
}

Component({
  properties: {
    compactOnly: {
      type: Boolean,
      value: false,
    },
  },

  data: {
    visible: false,
    expanded: false,
    status: 'IDLE',
    resolvedTheme: getThemeSnapshot().resolvedTheme,
    skillName: 'Python',
    battleId: '',
    waitedText: '00:00',
    remainingText: '00:00',
    waitingCountText: '正在寻找合适的对手',
    computerAvailable: false,
    reconnecting: false,
    lastError: '',
    isStartingComputer: false,
    isCancelling: false,
    toneClassName: 'floating-searching',
    compactTitle: '',
    titleText: '',
    descriptionText: '',
  },

  lifetimes: {
    attached(this: FloatingInstance) {
      const existing = subscriptions.get(this);
      existing?.matchmaking();
      existing?.theme();
      const matchmaking = getBattleMatchmakingManager().subscribe((snapshot) => {
        this.applySnapshot(snapshot);
      });
      const theme = subscribeTheme((snapshot) => {
        this.setData({ resolvedTheme: snapshot.resolvedTheme });
      });
      subscriptions.set(this, { matchmaking, theme });
    },

    detached(this: FloatingInstance) {
      const existing = subscriptions.get(this);
      existing?.matchmaking();
      existing?.theme();
      subscriptions.delete(this);
    },
  },

  methods: {
    applySnapshot(this: FloatingInstance, snapshot: BattleMatchmakingSnapshot) {
      const presentation = getPresentation(snapshot);
      const visible =
        snapshot.status !== 'IDLE' && snapshot.status !== 'ENTERING_BATTLE';

      this.setData({
        visible,
        expanded: visible && !this.data.compactOnly && !snapshot.collapsed,
        status: snapshot.status,
        skillName: snapshot.skillName,
        battleId: snapshot.battleId,
        waitedText: formatBattleDuration(snapshot.elapsedMs / 1000),
        remainingText: formatBattleDuration(snapshot.remainingSearchMs / 1000),
        waitingCountText: formatWaitingCount(snapshot.waitingCount),
        computerAvailable: snapshot.computerAvailable,
        reconnecting: snapshot.reconnecting,
        lastError: snapshot.lastError,
        isStartingComputer: snapshot.isStartingComputer,
        isCancelling: snapshot.isCancelling,
        ...presentation,
      });
    },

    handleToggle(this: FloatingInstance) {
      if (!this.data.compactOnly) {
        getBattleMatchmakingManager().setCollapsed(this.data.expanded);
      }
    },

    handleContinueUsing() {
      getBattleMatchmakingManager().setCollapsed(true);
    },

    handleComputerBattle() {
      void getBattleMatchmakingManager().startComputerBattle();
    },

    handleCancel() {
      void getBattleMatchmakingManager().cancel();
    },

    handleEnterBattle() {
      getBattleMatchmakingManager().enterMatchedBattle();
    },

    handleRestart() {
      const manager = getBattleMatchmakingManager();
      const snapshot = manager.getSnapshot();
      void manager.join(snapshot.skillCode || 'PYTHON');
    },

    handleClose() {
      getBattleMatchmakingManager().dismissTerminalState();
    },

    handleRetry() {
      void getBattleMatchmakingManager().sync({ force: true });
    },
  },
});
