interface IAppOption {
  globalData: {
    apiBaseUrl: string;
    apiConfigErrorMessage: string;
    authState: import('../types/auth').AppAuthStateSummary;
    envVersion: import('../types/auth').MiniProgramEnvVersion;
  };
}
