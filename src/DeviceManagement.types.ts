// ─── Resource type ──────────────────────────────────────────────────────────

/** 1 = device, 2 = group */
export type ShareResType = 1 | 2;

// ─── Share channel ──────────────────────────────────────────────────────────

export type DeviceShareType =
    | 0  // account
    | 1  // QQ
    | 2  // wechat
    | 3  // message
    | 4  // email
    | 5  // copy
    | 6  // more
    | 7; // contact

// ─── Share validation mode ───────────────────────────────────────────────────

/** 0 = forever, 1 = period */
export type ShareValidationType = 0 | 1;

// ─── Result models ───────────────────────────────────────────────────────────

export type ShareResult = {
    memberId: number;
    nickName: string;
    userName: string;
};

export type ShareInfo = {
    content: string;
    code: string;
    shortUrl: string;
};

export type ShareCodeInfo = {
    appId: string;
    resId: string;
    resType: ShareResType;
    resIcon: string;
    resName: string;
    nickName: string;
    shareSource: DeviceShareType;
    groupId: number;
};

export type ShareMember = {
    memberId: number;
    nickName: string;
    userName: string;
    iconUrl: string;
    shareMode: number;
    endTime: number;
    uid: string;
};

export type Sharer = {
    memberId: number;
    nickName: string;
    userName: string;
};

export type SharerDetail = {
    devices: SharedDevice[];
    mobile: string;
    name: string;
    remarkName: string;
};

export type SharedDevice = {
    devId: string;
    name: string;
    iconUrl: string;
};

export type DeviceManagementModuleEvents = Record<string, never>;
