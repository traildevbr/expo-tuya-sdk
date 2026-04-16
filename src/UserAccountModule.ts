import { NativeModule, requireNativeModule } from 'expo';

import { UserAccountModuleEvents } from './UserAccount.types';

declare class UserAccountModule extends NativeModule<UserAccountModuleEvents> {
    /**
     * Query areas where the SMS verification code service is available.
     * Returns a comma-separated string of region codes.
     */
    getWhiteListWhoCanSendMobileCode(): Promise<string>;

    /**
     * Send a verification code to a mobile phone number.
     * @param userName - The mobile phone number.
     * @param region - The region code (from getWhiteListWhoCanSendMobileCode or regionList).
     * @param countryCode - The country code, e.g. "86".
     * @param type - 1: register, 2: login, 3: reset password.
     */
    sendVerifyCode(
        userName: string,
        region: string,
        countryCode: string,
        type: number
    ): Promise<void>;

    /**
     * Verify a verification code.
     * @param userName - The mobile phone number or email.
     * @param region - The region code. Pass empty string for default.
     * @param countryCode - The country code, e.g. "86".
     * @param code - The verification code received.
     * @param type - 1: register, 2: login, 3: reset password.
     */
    checkVerifyCode(
        userName: string,
        region: string,
        countryCode: string,
        code: string,
        type: number
    ): Promise<boolean>;

    /**
     * Register a new account with a mobile phone number.
     * Requires a verification code sent via sendVerifyCode with type 1.
     * @param countryCode - The country code, e.g. "86".
     * @param phoneNumber - The mobile phone number.
     * @param password - The password.
     * @param code - The verification code.
     */
    registerWithPhone(
        countryCode: string,
        phoneNumber: string,
        password: string,
        code: string
    ): Promise<void>;

    /**
     * Log in with a mobile phone number and password.
     * @param countryCode - The country code, e.g. "86".
     * @param phoneNumber - The mobile phone number.
     * @param password - The password.
     */
    loginWithPhone(
        countryCode: string,
        phoneNumber: string,
        password: string
    ): Promise<void>;

    /**
     * Log in with a mobile phone number and verification code.
     * Requires a verification code sent via sendVerifyCode with type 2.
     * @param phoneNumber - The mobile phone number.
     * @param countryCode - The country code, e.g. "86".
     * @param code - The verification code.
     */
    loginWithPhoneCode(
        phoneNumber: string,
        countryCode: string,
        code: string
    ): Promise<void>;

    /**
     * Reset the password for an account registered with a mobile phone number.
     * Requires a verification code sent via sendVerifyCode with type 3.
     * @param countryCode - The country code, e.g. "86".
     * @param phoneNumber - The mobile phone number.
     * @param newPassword - The new password.
     * @param code - The verification code.
     */
    resetPasswordWithPhone(
        countryCode: string,
        phoneNumber: string,
        newPassword: string,
        code: string
    ): Promise<void>;

    /**
     * Send a verification code to bind an email address to the current account.
     * @param email - The email address.
     * @param countryCode - The country code, e.g. "86".
     */
    sendBindingVerificationCodeWithEmail(
        email: string,
        countryCode: string
    ): Promise<void>;

    /**
     * Bind an email address to the current account.
     * @param email - The email address.
     * @param countryCode - The country code, e.g. "86".
     * @param code - The verification code.
     * @param sId - The session ID (from the logged-in user object).
     */
    bindEmail(
        email: string,
        countryCode: string,
        code: string,
        sId: string
    ): Promise<void>;

    // ─── Email-based registration and login ─────────────────────────────

    /**
     * Register a new account with an email address.
     * Requires a verification code sent via sendVerifyCode with type 1.
     * @param countryCode - The country code, e.g. "86".
     * @param email - The email address.
     * @param password - The password.
     * @param code - The verification code.
     */
    registerWithEmail(
        countryCode: string,
        email: string,
        password: string,
        code: string
    ): Promise<void>;

    /**
     * Log in with an email address and password.
     * @param countryCode - The country code, e.g. "86".
     * @param email - The email address.
     * @param password - The password.
     */
    loginWithEmail(
        countryCode: string,
        email: string,
        password: string
    ): Promise<void>;

    /**
     * Log in with an email address and verification code.
     * Requires a verification code sent via sendVerifyCode with type 2.
     * @param email - The email address.
     * @param countryCode - The country code, e.g. "86".
     * @param code - The verification code.
     */
    loginWithEmailCode(
        email: string,
        countryCode: string,
        code: string
    ): Promise<void>;

    /**
     * Reset the password for an account registered with an email address.
     * Requires a verification code sent via sendVerifyCode with type 3.
     * @param countryCode - The country code, e.g. "86".
     * @param email - The email address.
     * @param newPassword - The new password.
     * @param code - The verification code.
     */
    resetPasswordWithEmail(
        countryCode: string,
        email: string,
        newPassword: string,
        code: string
    ): Promise<void>;

    // ─── Phone binding ──────────────────────────────────────────────────

    /**
     * Send a verification code to bind a phone number to the current account.
     * @param countryCode - The country code, e.g. "86".
     * @param phoneNumber - The mobile phone number.
     */
    sendBindVerifyCodeWithPhone(
        countryCode: string,
        phoneNumber: string
    ): Promise<void>;

    /**
     * Bind a phone number to the current account.
     * @param countryCode - The country code, e.g. "86".
     * @param phoneNumber - The mobile phone number.
     * @param code - The verification code.
     */
    bindPhone(
        countryCode: string,
        phoneNumber: string,
        code: string
    ): Promise<void>;

    // ─── UID-based login ────────────────────────────────────────────────

    /**
     * Login or register with a UID from your own user system.
     * If the account exists, logs in. If not, registers and logs in.
     * @param countryCode - The country code, e.g. "86".
     * @param uid - The unique user identifier from your system.
     * @param password - A random identifier matching the account (not the user's actual password).
     * @param createHome - Whether to create a default home.
     */
    loginOrRegisterWithUid(
        countryCode: string,
        uid: string,
        password: string,
        createHome: boolean
    ): Promise<any>;

    // ─── Third-party login ──────────────────────────────────────────────

    /**
     * Login with a Facebook account.
     * @param countryCode - The country code, e.g. "86".
     * @param token - The token granted by Facebook.
     */
    loginWithFacebook(countryCode: string, token: string): Promise<void>;

    /**
     * Login with a Twitter account.
     * @param countryCode - The country code, e.g. "86".
     * @param key - The key granted by Twitter.
     * @param secret - The secret granted by Twitter.
     */
    loginWithTwitter(
        countryCode: string,
        key: string,
        secret: string
    ): Promise<void>;

    /**
     * Login with OAuth 2.0 (generic method for Apple, Google, LINE, etc.).
     * @param type - The provider type: "ap" (Apple), "gg" (Google), "line" (LINE), "tw" (Twitter), "wx" (WeChat), "qq" (QQ), "" (Tuya UID).
     * @param countryCode - The country code, e.g. "86".
     * @param accessToken - The token/idToken granted by the provider.
     * @param extraInfo - Additional info required by the provider (e.g. { pubVersion: 1 } for Google).
     */
    loginWithAuth2(
        type: string,
        countryCode: string,
        accessToken: string,
        extraInfo: Record<string, any>
    ): Promise<void>;

    /**
     * Login with a WeChat account.
     * @param countryCode - The country code, e.g. "86".
     * @param code - The code granted by WeChat.
     */
    loginWithWechat(countryCode: string, code: string): Promise<void>;

    /**
     * Login with a Tencent QQ account.
     * @param countryCode - The country code, e.g. "86".
     * @param userId - The QQ user ID (open ID).
     * @param accessToken - The access token granted by QQ.
     */
    loginWithQQ(
        countryCode: string,
        userId: string,
        accessToken: string
    ): Promise<void>;

    // ─── Anonymous account ──────────────────────────────────────────────

    /**
     * Register and login with an anonymous account.
     * @param countryCode - The country code, e.g. "1".
     * @param userName - A nickname for the anonymous account (e.g. device name).
     */
    registerAnonymous(countryCode: string, userName: string): Promise<void>;

    /**
     * Delete an anonymous account. The account is removed immediately.
     */
    deleteAnonymousAccount(): Promise<void>;

    /**
     * Bind a phone number or email to an anonymous account, converting it to a normal account.
     * Requires a verification code sent via sendVerifyCode first.
     * @param countryCode - The country code, e.g. "1".
     * @param userName - The phone number or email to bind.
     * @param code - The verification code.
     * @param password - The password to set for the account.
     */
    usernameBinding(
        countryCode: string,
        userName: string,
        code: string,
        password: string
    ): Promise<void>;

    // ─── Account management ─────────────────────────────────────────────

    /**
     * Set the temperature unit for the user.
     * @param tempUnit - 1 for °C, 2 for °F.
     */
    updateTempUnit(tempUnit: number): Promise<void>;

    /**
     * Update the user's nickname.
     * @param nickname - The new nickname.
     */
    updateNickname(nickname: string): Promise<void>;

    /**
     * Update the user's time zone.
     * @param timeZoneId - The time zone ID, e.g. "Asia/Shanghai".
     */
    updateTimeZone(timeZoneId: string): Promise<void>;

    /**
     * Update the user's location coordinates.
     * @param latitude - The latitude.
     * @param longitude - The longitude.
     */
    updateLocation(latitude: number, longitude: number): void;

    /**
     * Change the phone number or email bound to the account.
     * Requires a verification code sent beforehand.
     * @param account - The new phone number or email.
     * @param countryCode - The country code, e.g. "86".
     * @param code - The verification code.
     */
    changeBindAccount(
        account: string,
        countryCode: string,
        code: string
    ): Promise<void>;

    /**
     * Log out of the current account.
     */
    logout(): Promise<void>;

    /**
     * Deactivate/delete the current account.
     * The account is permanently deleted 7 days after this request
     * unless the user logs in again during that period.
     */
    cancelAccount(): Promise<void>;
}

export default requireNativeModule<UserAccountModule>('ExpoTuyaUserAccount');
