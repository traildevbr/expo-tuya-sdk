/**
 * Contract tests for the HomeManagement module.
 * Verifies TS interface, iOS Swift, and Android Kotlin implementations match.
 */

import * as fs from 'fs';
import * as path from 'path';

const ASYNC_METHODS = [
    'createHome',
    'queryHomeList',
    'getHomeDetail',
    'getHomeLocalCache',
    'updateHome',
    'dismissHome',
    'getHomeWeatherSketch',
    'getHomeWeatherDetail',
    'sortDeviceOrGroup',
    'addRoom',
    'removeRoom',
    'sortRoomList',
    'updateRoomName',
    'addDeviceToRoom',
    'removeDeviceFromRoom',
    'addGroupToRoom',
    'removeGroupFromRoom',
    'saveBatchRoomRelation',
    'addMember',
    'removeMember',
    'queryMemberList',
    'updateMember',
    'getInvitationCode',
    'joinHomeWithInvitationCode',
    'cancelInvitation',
    'processInvitation',
    'getInvitationList',
    'updateInvitedMember',
] as const;

const EVENTS = [
    'onHomeAdded',
    'onHomeRemoved',
    'onHomeInfoChanged',
    'onHomeInvite',
    'onServerConnectSuccess',
    'onDeviceAdded',
    'onDeviceRemoved',
    'onGroupAdded',
    'onGroupRemoved',
] as const;

function readFileContent(relativePath: string): string {
    const fullPath = path.resolve(__dirname, '..', '..', relativePath);
    return fs.readFileSync(fullPath, 'utf-8');
}

// ─── TypeScript interface ───────────────────────────────────────────────────

describe('HomeManagementModule TypeScript interface', () => {
    let tsContent: string;

    beforeAll(() => {
        tsContent = readFileContent('src/HomeManagementModule.ts');
    });

    it.each([...ASYNC_METHODS])('declares method "%s"', (method) => {
        expect(tsContent).toMatch(new RegExp(`\\b${method}\\s*\\(`));
    });

    it('exports via requireNativeModule with correct name', () => {
        expect(tsContent).toContain(
            "requireNativeModule<HomeManagementModule>('ExpoTuyaHomeManagement')"
        );
    });
});

// ─── iOS Swift ──────────────────────────────────────────────────────────────

describe('HomeManagementModule iOS (Swift)', () => {
    let swiftContent: string;

    beforeAll(() => {
        swiftContent = readFileContent('ios/HomeManagementModule.swift');
    });

    it('registers the module with the correct name', () => {
        expect(swiftContent).toContain('Name("ExpoTuyaHomeManagement")');
    });

    it.each([...ASYNC_METHODS])('implements AsyncFunction "%s"', (method) => {
        expect(swiftContent).toContain(`AsyncFunction("${method}")`);
    });

    it.each([...EVENTS])('declares event "%s"', (event) => {
        expect(swiftContent).toContain(`"${event}"`);
    });
});

// ─── Android Kotlin ─────────────────────────────────────────────────────────

describe('HomeManagementModule Android (Kotlin)', () => {
    let kotlinContent: string;

    beforeAll(() => {
        kotlinContent = readFileContent(
            'android/src/main/java/expo/modules/tuyasdk/HomeManagementModule.kt'
        );
    });

    it('registers the module with the correct name', () => {
        expect(kotlinContent).toContain('Name("ExpoTuyaHomeManagement")');
    });

    it.each([...ASYNC_METHODS])('implements AsyncFunction "%s"', (method) => {
        expect(kotlinContent).toContain(`AsyncFunction("${method}")`);
    });

    it.each([...EVENTS])('declares event "%s"', (event) => {
        expect(kotlinContent).toContain(`"${event}"`);
    });
});

// ─── Cross-platform parity ──────────────────────────────────────────────────

describe('HomeManagement cross-platform parity', () => {
    let swiftContent: string;
    let kotlinContent: string;

    beforeAll(() => {
        swiftContent = readFileContent('ios/HomeManagementModule.swift');
        kotlinContent = readFileContent(
            'android/src/main/java/expo/modules/tuyasdk/HomeManagementModule.kt'
        );
    });

    it('both platforms implement the same set of AsyncFunctions', () => {
        const swiftMethods = [...swiftContent.matchAll(/AsyncFunction\("(\w+)"\)/g)].map((m) => m[1]);
        const kotlinMethods = [...kotlinContent.matchAll(/AsyncFunction\("(\w+)"\)/g)].map(
            (m) => m[1]
        );
        expect(swiftMethods.sort()).toEqual(kotlinMethods.sort());
    });
});

// ─── Public exports ─────────────────────────────────────────────────────────

describe('HomeManagement exports', () => {
    let indexContent: string;

    beforeAll(() => {
        indexContent = readFileContent('src/index.ts');
    });

    it('exports HomeManagement from HomeManagementModule', () => {
        expect(indexContent).toContain(
            "export { default as HomeManagement } from './HomeManagementModule'"
        );
    });

    it('exports HomeManagement types', () => {
        expect(indexContent).toContain("export * from './HomeManagement.types'");
    });
});

// ─── Types ──────────────────────────────────────────────────────────────────

describe('HomeManagement types', () => {
    let typesContent: string;

    beforeAll(() => {
        typesContent = readFileContent('src/HomeManagement.types.ts');
    });

    it.each(['HomeBean', 'WeatherSketch', 'WeatherDetail', 'WeatherUnits', 'HomeManagementModuleEvents', 'MemberBean', 'AddMemberParams', 'UpdateMemberParams', 'InvitationRecord'])(
        'exports type "%s"',
        (typeName) => {
            expect(typesContent).toContain(`export type ${typeName}`);
        }
    );
});
