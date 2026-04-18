import { NativeModule, requireNativeModule } from 'expo';

import {
    DevicePairingModuleEvents,
} from './DevicePairing.types';

declare class DevicePairingModule extends NativeModule<DevicePairingModuleEvents> {
    // ─── Token ──────────────────────────────────────────────────────────

    /**
     * Fetch a pairing token from the cloud. Must be called before starting pairing.
     * The token is valid for 10 minutes and expires immediately after a device is paired.
     * @param homeId - The ID of the home to bind the device to.
     * @returns The pairing token string.
     */
    getPairingToken(homeId: number): Promise<string>;

    // ─── EZ Mode (SmartConfig) ──────────────────────────────────────────

    /**
     * Start scanning for devices in EZ (SmartConfig) mode.
     * The module will emit `onDeviceFound` events as devices are discovered.
     * @param ssid - The Wi-Fi network name.
     * @param password - The Wi-Fi network password.
     * @param token - The pairing token from getPairingToken().
     * @param timeoutMs - Scan timeout in milliseconds.
     */
    startEzScan(
        ssid: string,
        password: string,
        token: string,
        timeoutMs: number
    ): Promise<void>;

    /**
     * Stop an ongoing EZ mode scan.
     */
    stopEzScan(): Promise<void>;

    /**
     * Start pairing a device directly in EZ mode (without prior scan).
     * Emits `onDeviceFound`, `onDeviceBind`, `onPairingSuccess`, or `onPairingError`.
     * @param ssid - The Wi-Fi network name.
     * @param password - The Wi-Fi network password.
     * @param token - The pairing token from getPairingToken().
     * @param timeoutSeconds - Pairing timeout in seconds.
     */
    startEzPairing(
        ssid: string,
        password: string,
        token: string,
        timeoutSeconds: number
    ): Promise<void>;

    /**
     * Stop an ongoing EZ mode pairing.
     */
    stopEzPairing(): Promise<void>;
}

export default requireNativeModule<DevicePairingModule>('ExpoTuyaDevicePairing');
