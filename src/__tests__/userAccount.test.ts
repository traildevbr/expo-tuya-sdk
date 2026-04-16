/**
 * Contract tests for the UserAccount module.
 *
 * These tests verify that:
 * 1. The TypeScript interface declares all expected methods
 * 2. The iOS (Swift) implementation contains all expected AsyncFunction/Function definitions
 * 3. The Android (Kotlin) implementation contains all expected AsyncFunction/Function definitions
 * 4. The public exports from src/index.ts are correct
 *
 * This catches regressions like a method being removed or renamed on one platform.
 */

import * as fs from 'fs';
import * as path from 'path';

// ─── Expected method contracts ──────────────────────────────────────────────

const ASYNC_METHODS = [
    // Phone registration & login
    'getWhiteListWhoCanSendMobileCode',
    'sendVerifyCode',
    'checkVerifyCode',
    'registerWithPhone',
    'loginWithPhone',
    'loginWithPhoneCode',
    'resetPasswordWithPhone',

    // Email binding
    'sendBindingVerificationCodeWithEmail',
    'bindEmail',

    // Email registration & login
    'registerWithEmail',
    'loginWithEmail',
    'loginWithEmailCode',
    'resetPasswordWithEmail',

    // Phone binding
    'sendBindVerifyCodeWithPhone',
    'bindPhone',

    // UID login
    'loginOrRegisterWithUid',

    // Third-party login
    'loginWithFacebook',
    'loginWithTwitter',
    'loginWithAuth2',
    'loginWithWechat',
    'loginWithQQ',

    // Anonymous account
    'registerAnonymous',
    'deleteAnonymousAccount',
    'usernameBinding',

    // Account management
    'updateTempUnit',
    'updateNickname',
    'updateTimeZone',
    'changeBindAccount',
    'logout',
    'cancelAccount',
] as const;

const SYNC_METHODS = ['updateLocation'] as const;

const ALL_METHODS = [...ASYNC_METHODS, ...SYNC_METHODS];

// ─── Helpers ────────────────────────────────────────────────────────────────

function readFileContent(relativePath: string): string {
    const fullPath = path.resolve(__dirname, '..', '..', relativePath);
    return fs.readFileSync(fullPath, 'utf-8');
}

// ─── TypeScript interface tests ─────────────────────────────────────────────

describe('UserAccountModule TypeScript interface', () => {
    let tsContent: string;

    beforeAll(() => {
        tsContent = readFileContent('src/UserAccountModule.ts');
    });

    it.each(ALL_METHODS)('declares method "%s"', (method) => {
        // Match method declaration like: methodName( or methodName():
        const pattern = new RegExp(`\\b${method}\\s*\\(`);
        expect(tsContent).toMatch(pattern);
    });

    it('exports the module as default via requireNativeModule', () => {
        expect(tsContent).toContain("requireNativeModule<UserAccountModule>('ExpoTuyaUserAccount')");
    });

    it('imports UserAccountModuleEvents from types', () => {
        expect(tsContent).toContain("import { UserAccountModuleEvents } from './UserAccount.types'");
    });
});

// ─── iOS Swift implementation tests ─────────────────────────────────────────

describe('UserAccountModule iOS (Swift) implementation', () => {
    let swiftContent: string;

    beforeAll(() => {
        swiftContent = readFileContent('ios/UserAccountModule.swift');
    });

    it('registers the module with the correct name', () => {
        expect(swiftContent).toContain('Name("ExpoTuyaUserAccount")');
    });

    it('declares the onSessionInvalid event', () => {
        expect(swiftContent).toContain('Events("onSessionInvalid")');
    });

    it.each([...ASYNC_METHODS])('implements AsyncFunction "%s"', (method) => {
        expect(swiftContent).toContain(`AsyncFunction("${method}")`);
    });

    it.each([...SYNC_METHODS])('implements Function "%s"', (method) => {
        expect(swiftContent).toContain(`Function("${method}")`);
    });

    it('listens for session expiration notification', () => {
        expect(swiftContent).toContain('ThingSmartUserNotificationUserSessionInvalid');
    });

    it('sends onSessionInvalid event on session expiration', () => {
        expect(swiftContent).toContain('sendEvent("onSessionInvalid")');
    });
});

// ─── Android Kotlin implementation tests ────────────────────────────────────

describe('UserAccountModule Android (Kotlin) implementation', () => {
    let kotlinContent: string;

    beforeAll(() => {
        kotlinContent = readFileContent(
            'android/src/main/java/expo/modules/tuyasdk/UserAccountModule.kt'
        );
    });

    it('registers the module with the correct name', () => {
        expect(kotlinContent).toContain('Name("ExpoTuyaUserAccount")');
    });

    it('declares the onSessionInvalid event', () => {
        expect(kotlinContent).toContain('Events("onSessionInvalid")');
    });

    it.each([...ASYNC_METHODS])('implements AsyncFunction "%s"', (method) => {
        expect(kotlinContent).toContain(`AsyncFunction("${method}")`);
    });

    it.each([...SYNC_METHODS])('implements Function "%s"', (method) => {
        expect(kotlinContent).toContain(`Function("${method}")`);
    });

    it('sets up session expiration listener via OnCreate', () => {
        expect(kotlinContent).toContain('setOnNeedLoginListener');
    });

    it('sends onSessionInvalid event on session expiration', () => {
        expect(kotlinContent).toContain('sendEvent("onSessionInvalid"');
    });
});

// ─── Cross-platform parity ──────────────────────────────────────────────────

describe('Cross-platform parity', () => {
    let swiftContent: string;
    let kotlinContent: string;

    beforeAll(() => {
        swiftContent = readFileContent('ios/UserAccountModule.swift');
        kotlinContent = readFileContent(
            'android/src/main/java/expo/modules/tuyasdk/UserAccountModule.kt'
        );
    });

    it('both platforms implement the same set of AsyncFunctions', () => {
        const swiftMethods = [...swiftContent.matchAll(/AsyncFunction\("(\w+)"\)/g)].map(
            (m) => m[1]
        );
        const kotlinMethods = [...kotlinContent.matchAll(/AsyncFunction\("(\w+)"\)/g)].map(
            (m) => m[1]
        );

        expect(swiftMethods.sort()).toEqual(kotlinMethods.sort());
    });

    it('both platforms implement the same set of sync Functions', () => {
        // Extract Function("...") but exclude AsyncFunction("...")
        const extractSyncFunctions = (content: string) => {
            const all = [...content.matchAll(/(?<!Async)Function\("(\w+)"\)/g)].map((m) => m[1]);
            // Filter out "Name" which also matches the pattern
            return all.filter((name) => name !== 'Name');
        };

        const swiftSync = extractSyncFunctions(swiftContent);
        const kotlinSync = extractSyncFunctions(kotlinContent);

        expect(swiftSync.sort()).toEqual(kotlinSync.sort());
    });
});

// ─── ExpoTuyaSdk main module contract ───────────────────────────────────────

describe('ExpoTuyaSdkModule TypeScript interface', () => {
    let tsContent: string;

    beforeAll(() => {
        tsContent = readFileContent('src/ExpoTuyaSdkModule.ts');
    });

    it.each(['initialize', 'isInitialized', 'setDebugMode'])('declares method "%s"', (method) => {
        const pattern = new RegExp(`\\b${method}\\s*\\(`);
        expect(tsContent).toMatch(pattern);
    });

    it('exports via requireNativeModule with correct name', () => {
        expect(tsContent).toContain("requireNativeModule<ExpoTuyaSdkModule>('ExpoTuyaSdk')");
    });
});

// ─── Public exports ─────────────────────────────────────────────────────────

describe('Public exports (src/index.ts)', () => {
    let indexContent: string;

    beforeAll(() => {
        indexContent = readFileContent('src/index.ts');
    });

    it('exports default from ExpoTuyaSdkModule', () => {
        expect(indexContent).toContain("export { default } from './ExpoTuyaSdkModule'");
    });

    it('exports UserAccount from UserAccountModule', () => {
        expect(indexContent).toContain("export { default as UserAccount } from './UserAccountModule'");
    });

    it('exports ExpoTuyaSdk types', () => {
        expect(indexContent).toContain("export * from './ExpoTuyaSdk.types'");
    });

    it('exports UserAccount types', () => {
        expect(indexContent).toContain("export * from './UserAccount.types'");
    });
});

// ─── Types ──────────────────────────────────────────────────────────────────

describe('Type definitions', () => {
    it('ExpoTuyaSdkModuleEvents has onInitSuccess and onInitFailure', () => {
        const content = readFileContent('src/ExpoTuyaSdk.types.ts');
        expect(content).toContain('onInitSuccess');
        expect(content).toContain('onInitFailure');
    });

    it('UserAccountModuleEvents has onSessionInvalid', () => {
        const content = readFileContent('src/UserAccount.types.ts');
        expect(content).toContain('onSessionInvalid');
    });
});
