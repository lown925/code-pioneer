interface IAppOption {
  globalData: {
    apiBaseUrl: string;
    apiConfigErrorMessage: string;
    authState: import('../types/auth').AppAuthStateSummary;
    envVersion: import('../types/auth').MiniProgramEnvVersion;
    themeMode: import('../utils/theme').ThemeMode;
    resolvedTheme: import('../utils/theme').ResolvedTheme;
  };
}
