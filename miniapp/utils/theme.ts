export type ThemeMode = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

export type ThemeChartPalette = {
  background: string;
  grid: string;
  label: string;
  quiz: string;
  practice: string;
};

export type ThemeSnapshot = {
  mode: ThemeMode;
  resolvedTheme: ResolvedTheme;
};

type ThemeListener = (snapshot: ThemeSnapshot) => void;

type ThemeApi = {
  getSystemInfoSync?: () => { theme?: string };
  getStorageSync?: (key: string) => unknown;
  setStorageSync?: (key: string, value: unknown) => void;
  onThemeChange?: (listener: (result: { theme?: string }) => void) => void;
  offThemeChange?: (listener: (result: { theme?: string }) => void) => void;
  setNavigationBarColor?: (options: {
    frontColor: string;
    backgroundColor: string;
    animation?: {
      duration?: number;
      timingFunc?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
    };
  }) => void;
  setBackgroundColor?: (options: {
    backgroundColor: string;
    backgroundColorTop?: string;
    backgroundColorBottom?: string;
  }) => void;
  setTabBarStyle?: (options: {
    color: string;
    selectedColor: string;
    backgroundColor: string;
    borderStyle?: 'black' | 'white';
  }) => void;
  setTabBarItem?: (options: {
    index: number;
    iconPath: string;
    selectedIconPath: string;
  }) => void;
  nextTick?: (callback: () => void) => void;
};

type TabBarIconSet = {
  light: {
    iconPath: string;
    selectedIconPath: string;
  };
  dark: {
    iconPath: string;
    selectedIconPath: string;
  };
};

const STORAGE_KEY = 'code-pioneer.theme.mode';
const TAB_BAR_ICON_SETS: TabBarIconSet[] = [
  {
    light: {
      iconPath: 'assets/tab-battle-light.png',
      selectedIconPath: 'assets/tab-battle-light-selected.png',
    },
    dark: {
      iconPath: 'assets/tab-battle-dark.png',
      selectedIconPath: 'assets/tab-battle-dark-selected.png',
    },
  },
  {
    light: {
      iconPath: 'assets/tab-learning-light.png',
      selectedIconPath: 'assets/tab-learning-light-selected.png',
    },
    dark: {
      iconPath: 'assets/tab-learning-dark.png',
      selectedIconPath: 'assets/tab-learning-dark-selected.png',
    },
  },
  {
    light: {
      iconPath: 'assets/tab-growth-light.png',
      selectedIconPath: 'assets/tab-growth-light-selected.png',
    },
    dark: {
      iconPath: 'assets/tab-growth-dark.png',
      selectedIconPath: 'assets/tab-growth-dark-selected.png',
    },
  },
  {
    light: {
      iconPath: 'assets/tab-profile-light.png',
      selectedIconPath: 'assets/tab-profile-light-selected.png',
    },
    dark: {
      iconPath: 'assets/tab-profile-dark.png',
      selectedIconPath: 'assets/tab-profile-dark-selected.png',
    },
  },
];
const listeners = new Set<ThemeListener>();

let initialized = false;
let themeMode: ThemeMode = 'system';
let systemTheme: ResolvedTheme = 'light';
let resolvedTheme: ResolvedTheme = 'light';
let systemThemeListener: ((result: { theme?: string }) => void) | null = null;

function getThemeApi(): ThemeApi | null {
  return (globalThis as unknown as { wx?: ThemeApi }).wx ?? null;
}

function normalizeThemeMode(value: unknown): ThemeMode {
  return value === 'light' || value === 'dark' || value === 'system'
    ? value
    : 'system';
}

export function normalizeResolvedTheme(value: unknown): ResolvedTheme {
  return value === 'dark' ? 'dark' : 'light';
}

function readSystemTheme(): ResolvedTheme {
  try {
    return normalizeResolvedTheme(getThemeApi()?.getSystemInfoSync?.().theme);
  } catch {
    return 'light';
  }
}

function readStoredThemeMode(): ThemeMode {
  try {
    return normalizeThemeMode(getThemeApi()?.getStorageSync?.(STORAGE_KEY));
  } catch {
    return 'system';
  }
}

function persistThemeMode(mode: ThemeMode) {
  try {
    getThemeApi()?.setStorageSync?.(STORAGE_KEY, mode);
  } catch {
    // A local storage failure must not prevent the current session from changing theme.
  }
}

function updateAppGlobalData(snapshot: ThemeSnapshot) {
  try {
    const app = getApp<{
      globalData?: {
        themeMode?: ThemeMode;
        resolvedTheme?: ResolvedTheme;
      };
    }>();

    if (app?.globalData) {
      app.globalData.themeMode = snapshot.mode;
      app.globalData.resolvedTheme = snapshot.resolvedTheme;
    }
  } catch {
    // App may not be available while the utility is being unit tested.
  }
}

function getSnapshot(): ThemeSnapshot {
  return {
    mode: themeMode,
    resolvedTheme,
  };
}

function notifyListeners() {
  const snapshot = getSnapshot();
  updateAppGlobalData(snapshot);
  listeners.forEach((listener) => listener(snapshot));
}

function applyNativeThemeImmediately() {
  const api = getThemeApi();

  if (!api) {
    return;
  }

  const isDark = resolvedTheme === 'dark';
  const backgroundColor = isDark ? '#0B1118' : '#F4F8FC';
  const cardColor = isDark ? '#121A24' : '#FFFFFF';
  const secondaryTextColor = isDark ? '#A8B8C9' : '#7D8AA5';
  const primaryColor = isDark ? '#60A5FA' : '#2F6BFF';

  api.setNavigationBarColor?.({
    frontColor: isDark ? '#FFFFFF' : '#000000',
    backgroundColor,
  });
  api.setBackgroundColor?.({
    backgroundColor,
    backgroundColorTop: backgroundColor,
    backgroundColorBottom: backgroundColor,
  });
  api.setTabBarStyle?.({
    color: secondaryTextColor,
    selectedColor: primaryColor,
    backgroundColor: cardColor,
    borderStyle: isDark ? 'white' : 'black',
  });
  TAB_BAR_ICON_SETS.forEach((iconSet, index) => {
    const icons = isDark ? iconSet.dark : iconSet.light;
    api.setTabBarItem?.({
      index,
      ...icons,
    });
  });
}

function applyNativeTheme() {
  applyNativeThemeImmediately();

  // Navigation can re-apply page JSON after onShow. Re-run once after render.
  getThemeApi()?.nextTick?.(() => {
    applyNativeThemeImmediately();
  });
}

function recalculateTheme(notify = true) {
  const nextResolvedTheme = themeMode === 'system' ? systemTheme : themeMode;
  const changed = resolvedTheme !== nextResolvedTheme;
  resolvedTheme = nextResolvedTheme;
  applyNativeTheme();

  if (notify || changed) {
    notifyListeners();
  } else {
    updateAppGlobalData(getSnapshot());
  }
}

function registerSystemThemeWatcher() {
  if (systemThemeListener) {
    return;
  }

  const api = getThemeApi();

  if (!api?.onThemeChange) {
    return;
  }

  systemThemeListener = (result) => {
    systemTheme = normalizeResolvedTheme(result.theme);

    if (themeMode === 'system') {
      recalculateTheme(true);
    }
  };
  api.onThemeChange(systemThemeListener);
}

export function initializeTheme(): ThemeSnapshot {
  if (!initialized) {
    initialized = true;
    themeMode = readStoredThemeMode();
    systemTheme = readSystemTheme();
    resolvedTheme = themeMode === 'system' ? systemTheme : themeMode;
    registerSystemThemeWatcher();
    applyNativeTheme();
    updateAppGlobalData(getSnapshot());
  }

  return getSnapshot();
}

export function syncSystemTheme(): ThemeSnapshot {
  initializeTheme();
  systemTheme = readSystemTheme();
  recalculateTheme(themeMode === 'system');
  return getSnapshot();
}

export function getThemeMode(): ThemeMode {
  return initializeTheme().mode;
}

export function getResolvedTheme(): ResolvedTheme {
  return initializeTheme().resolvedTheme;
}

export function getThemeSnapshot(): ThemeSnapshot {
  return initializeTheme();
}

export function setThemeMode(mode: ThemeMode): ThemeSnapshot {
  initializeTheme();
  themeMode = normalizeThemeMode(mode);
  persistThemeMode(themeMode);
  recalculateTheme(true);
  return getSnapshot();
}

export function applyTheme(): ThemeSnapshot {
  return syncSystemTheme();
}

export function watchSystemTheme() {
  initializeTheme();
  registerSystemThemeWatcher();
}

export function subscribeTheme(listener: ThemeListener) {
  initializeTheme();
  listeners.add(listener);
  listener(getSnapshot());

  return () => {
    listeners.delete(listener);
  };
}

export function getThemeChartPalette(theme: ResolvedTheme): ThemeChartPalette {
  return theme === 'dark'
    ? {
        background: '#16212e',
        grid: '#2a394a',
        label: '#a8b8c9',
        quiz: '#60a5fa',
        practice: '#34d399',
      }
    : {
        background: '#f6f9fd',
        grid: '#dce6f2',
        label: '#6e84a3',
        quiz: '#2f6bff',
        practice: '#159455',
      };
}

export { STORAGE_KEY as THEME_STORAGE_KEY };
