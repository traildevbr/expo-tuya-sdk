import { requireNativeView } from 'expo';
import * as React from 'react';

import { ExpoTuyaSdkViewProps } from './ExpoTuyaSdk.types';

const NativeView: React.ComponentType<ExpoTuyaSdkViewProps> =
  requireNativeView('ExpoTuyaSdk');

export default function ExpoTuyaSdkView(props: ExpoTuyaSdkViewProps) {
  return <NativeView {...props} />;
}
