import { NativeModule, requireNativeModule } from 'expo';

import {
    HomeBean,
    WeatherSketch,
    WeatherDetail,
    WeatherUnits,
    HomeManagementModuleEvents,
    MemberBean,
    AddMemberParams,
    UpdateMemberParams,
    InvitationRecord,
} from './HomeManagement.types';

declare class HomeManagementModule extends NativeModule<HomeManagementModuleEvents> {
    // ─── Home Manager ───────────────────────────────────────────────────

    /**
     * Create a new home.
     * @param name - Home name (max 25 chars).
     * @param lon - Longitude (0 if not needed).
     * @param lat - Latitude (0 if not needed).
     * @param geoName - Address/location name.
     * @param rooms - List of room names.
     * @returns The homeId of the created home.
     */
    createHome(
        name: string,
        lon: number,
        lat: number,
        geoName: string,
        rooms: string[]
    ): Promise<number>;

    /**
     * Query the list of homes for the current user.
     */
    queryHomeList(): Promise<HomeBean[]>;

    // ─── Home Instance ──────────────────────────────────────────────────

    /**
     * Get the full details of a home (devices, groups, rooms, etc.).
     * @param homeId - The home ID.
     */
    getHomeDetail(homeId: number): Promise<HomeBean>;

    /**
     * Get cached/offline home details.
     * @param homeId - The home ID.
     */
    getHomeLocalCache(homeId: number): Promise<HomeBean>;

    /**
     * Update home information.
     * @param homeId - The home ID.
     * @param name - New home name.
     * @param lon - Longitude.
     * @param lat - Latitude.
     * @param geoName - Address/location name.
     * @param rooms - List of room names.
     */
    updateHome(
        homeId: number,
        name: string,
        lon: number,
        lat: number,
        geoName: string,
        rooms: string[]
    ): Promise<void>;

    /**
     * Dismiss (delete) a home.
     * @param homeId - The home ID.
     */
    dismissHome(homeId: number): Promise<void>;

    // ─── Weather ────────────────────────────────────────────────────────

    /**
     * Get weather overview for the home's location.
     * @param homeId - The home ID.
     */
    getHomeWeatherSketch(homeId: number): Promise<WeatherSketch>;

    /**
     * Get detailed weather for the home's location.
     * @param homeId - The home ID.
     * @param limit - Max number of weather metrics to return.
     * @param units - Unit preferences (tempUnit, pressureUnit, windspeedUnit).
     */
    getHomeWeatherDetail(
        homeId: number,
        limit: number,
        units: WeatherUnits
    ): Promise<WeatherDetail[]>;

    // ─── Sorting ────────────────────────────────────────────────────────

    /**
     * Sort devices and groups in a home.
     * @param homeId - The home ID.
     * @param orderList - Array of { bizId: string, bizType: string }.
     *   bizType: "6" for device, "5" for group.
     */
    sortDeviceOrGroup(
        homeId: number,
        orderList: Array<{ bizId: string; bizType: string }>
    ): Promise<void>;

    // ─── Room Management ────────────────────────────────────────────────

    /**
     * Add a room to a home.
     * @param homeId - The home ID.
     * @param name - The room name.
     */
    addRoom(homeId: number, name: string): Promise<number>;

    /**
     * Remove a room from a home.
     * @param homeId - The home ID.
     * @param roomId - The room ID.
     */
    removeRoom(homeId: number, roomId: number): Promise<void>;

    /**
     * Sort rooms in a home.
     * @param homeId - The home ID.
     * @param roomIds - Ordered list of room IDs.
     */
    sortRoomList(homeId: number, roomIds: number[]): Promise<void>;

    /**
     * Rename a room.
     * @param roomId - The room ID.
     * @param name - The new room name.
     */
    updateRoomName(roomId: number, name: string): Promise<void>;

    /**
     * Add a device to a room.
     * @param roomId - The room ID.
     * @param devId - The device ID.
     */
    addDeviceToRoom(roomId: number, devId: string): Promise<void>;

    /**
     * Remove a device from a room.
     * @param roomId - The room ID.
     * @param devId - The device ID.
     */
    removeDeviceFromRoom(roomId: number, devId: string): Promise<void>;

    /**
     * Add a group to a room.
     * @param roomId - The room ID.
     * @param groupId - The group ID.
     */
    addGroupToRoom(roomId: number, groupId: string): Promise<void>;

    /**
     * Remove a group from a room.
     * @param roomId - The room ID.
     * @param groupId - The group ID.
     */
    removeGroupFromRoom(roomId: number, groupId: string): Promise<void>;

    /**
     * Batch update room-device/group mappings.
     * @param roomId - The room ID.
     * @param deviceGroupIds - List of device IDs or group IDs.
     */
    saveBatchRoomRelation(roomId: number, deviceGroupIds: string[]): Promise<void>;

    // ─── Member Management ────────────────────────────────────────────

    /**
     * Add a member to a home.
     * @param params - Member info (homeId, nickName, account, countryCode, role, autoAccept).
     */
    addMember(params: AddMemberParams): Promise<MemberBean>;

    /**
     * Remove a member from a home.
     * @param memberId - The member ID.
     */
    removeMember(memberId: number): Promise<void>;

    /**
     * Query the list of members in a home.
     * @param homeId - The home ID.
     */
    queryMemberList(homeId: number): Promise<MemberBean[]>;

    /**
     * Update member information.
     * @param params - Updated member info (memberId, nickName, role, admin).
     */
    updateMember(params: UpdateMemberParams): Promise<void>;

    /**
     * Get an invitation code/message for a home.
     * @param homeId - The home ID.
     */
    getInvitationCode(homeId: number): Promise<string>;

    /**
     * Join a home using an invitation code.
     * @param invitationCode - The invitation code.
     */
    joinHomeWithInvitationCode(invitationCode: string): Promise<void>;

    /**
     * Cancel/revoke an invitation.
     * @param invitationId - The invitation ID.
     */
    cancelInvitation(invitationId: number): Promise<void>;

    /**
     * Accept or decline an invitation to join a home.
     * @param homeId - The home ID.
     * @param accept - true to accept, false to decline.
     */
    processInvitation(homeId: number, accept: boolean): Promise<void>;

    /**
     * Query invitation records for a home.
     * @param homeId - The home ID.
     */
    getInvitationList(homeId: number): Promise<InvitationRecord[]>;

    /**
     * Update invitee information (name, role).
     * @param invitationId - The invitation ID.
     * @param name - The new name.
     * @param role - The new role.
     */
    updateInvitedMember(invitationId: number, name: string, role: number): Promise<void>;
}

export default requireNativeModule<HomeManagementModule>('ExpoTuyaHomeManagement');
