export type DeviceBean = {
    devId: string;
    name: string;
    productId: string;
    uuid: string;
    isOnline: boolean;
};

export type PairingErrorBean = {
    errorCode: string;
    errorMsg: string;
};

export type DevicePairingModuleEvents = {
    /** A device was found during scanning. */
    onDeviceFound: (params: { devId: string }) => void;
    /** A device was successfully bound to the account. */
    onDeviceBind: (params: { devId: string }) => void;
    /** Pairing completed successfully. */
    onPairingSuccess: (params: DeviceBean) => void;
    /** Pairing failed. */
    onPairingError: (params: PairingErrorBean) => void;
    /** Pairing was limited (e.g. device already bound). */
    onPairingLimited: (params: { errorCode: string; errorMsg: string }) => void;
};
