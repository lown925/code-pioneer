declare namespace WechatMiniprogram {
  type IAnyObject = Record<string, unknown>;

  type LoginSuccessCallbackResult = {
    code: string;
  };

  type BaseEvent<TDataset = Record<string, unknown>> = {
    currentTarget: {
      dataset: TDataset;
    };
  };

  type CustomEvent<TDetail = Record<string, unknown>> = {
    detail: TDetail;
    currentTarget: {
      dataset: Record<string, unknown>;
    };
  };

  type RequestSuccessCallbackResult<T> = {
    statusCode: number;
    data: T;
  };

  type ShowModalSuccessCallbackResult = {
    confirm: boolean;
    cancel: boolean;
  };

  type ChooseImageSuccessCallbackResult = {
    tempFilePaths: string[];
  };

  type UploadFileSuccessCallbackResult = {
    statusCode: number;
    data: string;
  };
}

type MiniProgramPageInstance<TData, TMethods extends Record<string, (...args: any[]) => any>> = {
  data: TData;
  route?: string;
  options?: Record<string, string>;
  setData(data: Partial<TData>): void;
} & TMethods;

type MiniProgramPageOptions<
  TData,
  TMethods extends Record<string, (...args: any[]) => any>,
> = {
  data: TData;
  onLoad?(query: Record<string, string>): void;
  onShow?(): void;
  onUnload?(): void;
  onPullDownRefresh?(): void;
  [key: string]: unknown;
} & ThisType<MiniProgramPageInstance<TData, TMethods>>;

declare function Behavior<TOptions extends Record<string, unknown>>(
  options: TOptions,
): TOptions;

declare function Page<
  TData,
  TMethods extends Record<string, (...args: any[]) => any> = Record<
    string,
    (...args: any[]) => any
  >,
>(options: MiniProgramPageOptions<TData, TMethods>): void;

type MiniProgramAppOptions<TGlobalData> = {
  globalData: TGlobalData;
  onLaunch?(): void;
  onShow?(): void;
} & ThisType<{ globalData: TGlobalData }>;

declare function App<TApp extends { globalData: unknown }>(
  options: MiniProgramAppOptions<TApp['globalData']>,
): void;

declare function getApp<TApp = IAppOption>(): TApp;

declare function getCurrentPages(): Array<{
  route: string;
  options?: Record<string, string>;
}>;

declare function setTimeout(
  handler: (...args: unknown[]) => void,
  timeout?: number,
): number;

declare const wx: {
  request<T>(options: {
    url: string;
    method?: string;
    data?: unknown;
    header?: Record<string, string>;
    timeout?: number;
    success?(response: WechatMiniprogram.RequestSuccessCallbackResult<T>): void;
    fail?(): void;
    complete?(): void;
  }): void;
  login(options: {
    success?(result: WechatMiniprogram.LoginSuccessCallbackResult): void;
    fail?(): void;
  }): void;
  chooseImage(options: {
    count?: number;
    sizeType?: string[];
    sourceType?: string[];
    success?(result: WechatMiniprogram.ChooseImageSuccessCallbackResult): void;
    fail?(error: { errMsg?: string }): void;
  }): void;
  uploadFile(options: {
    url: string;
    filePath: string;
    name: string;
    formData?: Record<string, unknown>;
    header?: Record<string, string>;
    success?(result: WechatMiniprogram.UploadFileSuccessCallbackResult): void;
    fail?(): void;
  }): void;
  stopPullDownRefresh(): void;
  navigateTo(options: {
    url: string;
    fail?(): void;
    complete?(): void;
  }): void;
  redirectTo(options: {
    url: string;
    fail?(): void;
    complete?(): void;
  }): void;
  reLaunch(options: {
    url: string;
    fail?(): void;
    complete?(): void;
  }): void;
  switchTab(options: {
    url: string;
    fail?(): void;
    complete?(): void;
  }): void;
  navigateBack(options?: {
    delta?: number;
  }): void;
  showToast(options: {
    title: string;
    icon?: string;
  }): void;
  setNavigationBarTitle(options: {
    title: string;
  }): void;
  showModal(options: {
    title?: string;
    content: string;
    showCancel?: boolean;
    cancelText?: string;
    cancelColor?: string;
    confirmText?: string;
    confirmColor?: string;
    success?(result: WechatMiniprogram.ShowModalSuccessCallbackResult): void;
    fail?(): void;
    complete?(): void;
  }): void;
  previewImage(options: {
    current?: string;
    urls: string[];
  }): void;
  setClipboardData(options: {
    data: string;
    success?(): void;
    fail?(): void;
  }): void;
  getStorageSync(key: string): unknown;
  setStorageSync(key: string, value: unknown): void;
  getSystemInfoSync(): {
    theme?: string;
    statusBarHeight?: number;
  };
  onThemeChange(listener: (result: { theme?: string }) => void): void;
  offThemeChange(listener: (result: { theme?: string }) => void): void;
  setNavigationBarColor(options: {
    frontColor: string;
    backgroundColor: string;
    animation?: {
      duration?: number;
      timingFunc?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
    };
  }): void;
  setBackgroundColor(options: {
    backgroundColor: string;
    backgroundColorTop?: string;
    backgroundColorBottom?: string;
  }): void;
  setTabBarStyle(options: {
    color: string;
    selectedColor: string;
    backgroundColor: string;
    borderStyle?: 'black' | 'white';
  }): void;
  setTabBarItem(options: {
    index: number;
    iconPath: string;
    selectedIconPath: string;
  }): void;
  nextTick(callback: () => void): void;
  removeStorageSync(key: string): void;
  getAccountInfoSync(): {
    miniProgram: {
      envVersion: 'develop' | 'trial' | 'release';
    };
  };
};
