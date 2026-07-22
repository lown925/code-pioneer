interface IAppOption {
  globalData: {
    apiBaseUrl: string;
    authState: import('../types/auth').AppAuthStateSummary;
    envVersion: import('../types/auth').MiniProgramEnvVersion;
  };
}
