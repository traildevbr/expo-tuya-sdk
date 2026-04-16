import { NativeModule, requireNativeModule } from 'expo';

import { ExpoTuyaSdkModuleEvents } from './ExpoTuyaSdk.types';

declare class ExpoTuyaSdkModule extends NativeModule<ExpoTuyaSdkModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

export default requireNativeModule<ExpoTuyaSdkModule>('ExpoTuyaSdk');
