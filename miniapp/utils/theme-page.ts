import {
  getThemeSnapshot,
  subscribeTheme,
  syncSystemTheme,
  type ThemeSnapshot,
} from './theme';

type ThemePageHost = {
  setData(data: Record<string, unknown>): void;
};

type ThemePageOptions<
  TData,
  TMethods extends Record<string, (...args: any[]) => any>,
> = MiniProgramPageOptions<TData, TMethods>;

const pageSubscriptions = new WeakMap<object, () => void>();

function updatePageTheme(page: ThemePageHost, snapshot: ThemeSnapshot) {
  page.setData({
    themeMode: snapshot.mode,
    resolvedTheme: snapshot.resolvedTheme,
  });
}

export function bindThemePage(page: ThemePageHost) {
  unbindThemePage(page);

  const unsubscribe = subscribeTheme((snapshot) => {
    updatePageTheme(page, snapshot);
  });
  pageSubscriptions.set(page, unsubscribe);
}

export function refreshThemePage(page: ThemePageHost) {
  updatePageTheme(page, syncSystemTheme());
}

export function unbindThemePage(page: ThemePageHost) {
  const unsubscribe = pageSubscriptions.get(page);

  if (unsubscribe) {
    unsubscribe();
    pageSubscriptions.delete(page);
  }
}

export function registerThemedPage<
  TData,
  TMethods extends Record<string, (...args: any[]) => any> = Record<
    string,
    (...args: any[]) => any
  >,
>(
  options: ThemePageOptions<TData, TMethods>,
) {
  const initialTheme = getThemeSnapshot();
  const originalOnLoad = options.onLoad;
  const originalOnShow = options.onShow;
  const originalOnUnload = options.onUnload;

  options.data = {
    ...(options.data as object),
    themeMode: initialTheme.mode,
    resolvedTheme: initialTheme.resolvedTheme,
  } as TData;

  options.onLoad = function (
    this: ThemePageHost,
    query: Record<string, string>,
  ) {
    bindThemePage(this);
    return originalOnLoad?.call(this, query);
  };
  options.onShow = function (this: ThemePageHost) {
    refreshThemePage(this);
    return originalOnShow?.call(this);
  };
  options.onUnload = function (this: ThemePageHost) {
    unbindThemePage(this);
    return originalOnUnload?.call(this);
  };

  Page<TData, TMethods>(options);
}
