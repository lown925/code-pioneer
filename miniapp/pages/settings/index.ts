import { registerThemedPage } from '../../utils/theme-page';
import {
  getThemeMode,
  setThemeMode,
  type ThemeMode,
} from '../../utils/theme';

type ThemeOption = {
  mode: ThemeMode;
  title: string;
  description: string;
  isSelected: boolean;
};

type SettingsPageData = {
  selectedThemeMode: ThemeMode;
  themeOptions: ThemeOption[];
};

type SettingsPageMethods = {
  refreshThemeOptions(): void;
  handleThemeModeChange(
    event: WechatMiniprogram.BaseEvent<{ mode?: ThemeMode }>,
  ): void;
};

function buildThemeOptions(selectedThemeMode: ThemeMode): ThemeOption[] {
  return [
    {
      mode: 'system',
      title: '跟随系统',
      description: '根据微信当前的浅色或深色外观自动切换',
      isSelected: selectedThemeMode === 'system',
    },
    {
      mode: 'light',
      title: '浅色模式',
      description: '始终使用浅色界面',
      isSelected: selectedThemeMode === 'light',
    },
    {
      mode: 'dark',
      title: '深色模式',
      description: '始终使用深色界面',
      isSelected: selectedThemeMode === 'dark',
    },
  ];
}

function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'system' || value === 'light' || value === 'dark';
}

registerThemedPage<SettingsPageData, SettingsPageMethods>({
  data: {
    selectedThemeMode: 'system',
    themeOptions: buildThemeOptions('system'),
  },

  onLoad() {
    this.refreshThemeOptions();
  },

  onShow() {
    this.refreshThemeOptions();
  },

  refreshThemeOptions() {
    const selectedThemeMode = getThemeMode();

    this.setData({
      selectedThemeMode,
      themeOptions: buildThemeOptions(selectedThemeMode),
    });
  },

  handleThemeModeChange(
    event: WechatMiniprogram.BaseEvent<{ mode?: ThemeMode }>,
  ) {
    const mode = event.currentTarget.dataset.mode;

    if (!isThemeMode(mode)) {
      return;
    }

    const snapshot = setThemeMode(mode);

    this.setData({
      selectedThemeMode: snapshot.mode,
      themeOptions: buildThemeOptions(snapshot.mode),
    });
  },
});
