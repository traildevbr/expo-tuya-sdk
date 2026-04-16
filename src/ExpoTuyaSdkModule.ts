import { NativeModule, requireNativeModule } from 'expo';

import { ExpoTuyaSdkModuleEvents } from './ExpoTuyaSdk.types';

declare class ExpoTuyaSdkModule extends NativeModule<ExpoTuyaSdkModuleEvents> {
  /**
   * Initialize the Tuya SDK. Keys are read from native config
   * (Info.plist on iOS, AndroidManifest.xml on Android),
   * injected automatically by the Config Plugin.
   */
  initialize(): Promise<void>;

  /** Check whether the SDK has been initialized. */
  isInitialized(): boolean;

  /** Enable or disable debug mode for the Tuya SDK. */
  setDebugMode(enabled: boolean): void;
}

export default requireNativeModule<ExpoTuyaSdkModule>('ExpoTuyaSdk');
