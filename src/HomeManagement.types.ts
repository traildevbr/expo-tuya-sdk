export type HomeBean = {
    homeId: number;
    name: string;
    geoName: string;
    lon: number;
    lat: number;
    admin: boolean;
    homeStatus: number;
    role: number;
};

export type WeatherSketch = {
    condition: string;
    temp: string;
    iconUrl: string;
    inIconUrl: string;
};

export type WeatherDetail = {
    icon: string;
    name: string;
    unit: string;
    value: string;
};

export type WeatherUnits = {
    tempUnit?: number;
    pressureUnit?: number;
    windspeedUnit?: number;
};

export type HomeManagementModuleEvents = {
    onHomeAdded: (params: { homeId: number }) => void;
    onHomeRemoved: (params: { homeId: number }) => void;
    onHomeInfoChanged: (params: { homeId: number }) => void;
    onHomeInvite: (params: { homeId: number; homeName: string }) => void;
    onServerConnectSuccess: () => void;
    onDeviceAdded: (params: { homeId: number; devId: string }) => void;
    onDeviceRemoved: (params: { homeId: number; devId: string }) => void;
    onGroupAdded: (params: { homeId: number; groupId: number }) => void;
    onGroupRemoved: (params: { homeId: number; groupId: number }) => void;
};

export type MemberBean = {
    homeId: number;
    memberId: number;
    nickName: string;
    account: string;
    role: number;
    admin: boolean;
    headPic: string;
    memberStatus: number;
};

export type AddMemberParams = {
    homeId: number;
    nickName: string;
    account: string;
    countryCode: string;
    role: number;
    autoAccept: boolean;
};

export type UpdateMemberParams = {
    memberId: number;
    nickName: string;
    role: number;
    admin: boolean;
};

export type InvitationRecord = {
    invitationId: number;
    invitationCode: string;
    name: string;
    role: number;
    dealStatus: number;
};
