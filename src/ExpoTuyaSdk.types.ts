export type ExpoTuyaSdkModuleEvents = {
  onInitSuccess: () => void;
  onInitFailure: (params: { error: string }) => void;
};
