import { NativeModule, requireNativeModule } from 'expo';

import {
    DeviceManagementModuleEvents,
    DeviceShareType,
    ShareCodeInfo,
    ShareInfo,
    ShareMember,
    ShareResType,
    ShareResult,
    ShareValidationType,
    Sharer,
    SharerDetail,
} from './DeviceManagement.types';

declare class DeviceManagementModule extends NativeModule<DeviceManagementModuleEvents> {
    // ─── Sharer APIs ─────────────────────────────────────────────────────────

    /**
     * Check whether a device or group supports sharing.
     * @param resId - Device or group ID.
     * @param resType - 1 for device, 2 for group.
     */
    supportShare(resId: string, resType: ShareResType): Promise<boolean>;

    /**
     * Get the remaining number of times a device can be shared.
     * Returns -1 if unlimited.
     * @param resId - Device or group ID.
     * @param resType - 1 for device, 2 for group.
     */
    remainingShareTimes(resId: string, resType: ShareResType): Promise<number>;

    /**
     * Share a device or group with another user by account.
     * @param resId - Device or group ID.
     * @param resType - 1 for device, 2 for group.
     * @param spaceId - Home ID of the device or group.
     * @param userAccount - Account (phone or email) of the recipient.
     */
    share(
        resId: string,
        resType: ShareResType,
        spaceId: number,
        userAccount: string
    ): Promise<ShareResult>;

    /**
     * Remove a receiver's access to a shared device or group.
     * @param memberId - Member ID of the receiver.
     * @param resId - Device or group ID.
     * @param resType - 1 for device, 2 for group.
     */
    removeReceiver(memberId: number, resId: string, resType: ShareResType): Promise<void>;

    /**
     * Get the list of receivers who have access to a shared device or group.
     * @param resId - Device or group ID.
     * @param resType - 1 for device, 2 for group.
     * @param page - Page number (1-based). Only applies to devices.
     * @param pageSize - Page size. Only applies to devices.
     */
    receivers(
        resId: string,
        resType: ShareResType,
        page: number,
        pageSize: number
    ): Promise<ShareMember[]>;

    /**
     * Update the expiration date of a share.
     * @param memberId - Member ID of the receiver.
     * @param resId - Device or group ID.
     * @param resType - 1 for device, 2 for group.
     * @param mode - 0 = forever, 1 = period.
     * @param endTime - Expiration timestamp in ms. Only used when mode = 1.
     */
    updateShareExpirationDate(
        memberId: number,
        resId: string,
        resType: ShareResType,
        mode: ShareValidationType,
        endTime: number
    ): Promise<void>;

    /**
     * Get the list of recently shared contacts.
     */
    relationMembers(): Promise<ShareMember[]>;

    /**
     * Remove a member from the recently shared contacts list.
     * @param uid - User ID of the member to remove.
     */
    removeRelationMember(uid: string): Promise<void>;

    /**
     * Generate a share code/link for a device.
     * @param resId - Device or group ID.
     * @param resType - 1 for device, 2 for group.
     * @param spaceId - Home ID.
     * @param shareType - Channel type (0=account, 3=message, 4=email, 5=copy, etc.).
     * @param shareCount - Number of valid uses for the share code.
     */
    createShareInfo(
        resId: string,
        resType: ShareResType,
        spaceId: number,
        shareType: DeviceShareType,
        shareCount: number
    ): Promise<ShareInfo>;

    // ─── Receiver APIs ───────────────────────────────────────────────────────

    /**
     * Validate a share code.
     * @param code - The share code.
     */
    validateShareCode(code: string): Promise<boolean>;

    /**
     * Get information about a share code.
     * @param code - The share code.
     */
    shareCodeInfo(code: string): Promise<ShareCodeInfo>;

    /**
     * Accept a share invitation using a share code.
     * @param code - The share code.
     */
    acceptShare(code: string): Promise<void>;

    /**
     * Remove a shared device or group (receiver removes their own access).
     * @param resId - Device or group ID.
     * @param resType - 1 for device, 2 for group.
     */
    removeShare(resId: string, resType: ShareResType): Promise<void>;

    /**
     * Get the list of users who have shared devices/groups with the current user.
     */
    sharers(): Promise<Sharer[]>;

    /**
     * Get the name of the sharer for a specific device or group.
     * @param resId - Device or group ID.
     * @param resType - 1 for device, 2 for group.
     */
    sharerName(resId: string, resType: ShareResType): Promise<string>;

    /**
     * Get detailed information about a sharer.
     * @param memberId - Member ID of the sharer.
     */
    sharerDetail(memberId: number): Promise<SharerDetail>;

    /**
     * Remove a sharer (stop receiving their shared devices).
     * @param memberId - Member ID of the sharer.
     */
    removeSharer(memberId: number): Promise<void>;

    /**
     * Update the remark name of a sharer.
     * @param memberId - Member ID of the sharer.
     * @param name - New name/remark.
     */
    updateSharer(memberId: number, name: string): Promise<void>;
}

export default requireNativeModule<DeviceManagementModule>('ExpoTuyaDeviceManagement');
