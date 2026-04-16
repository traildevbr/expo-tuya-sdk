import {
    withInfoPlist,
    withAndroidManifest,
    withPodfile,
    withProjectBuildGradle,
    withAppBuildGradle,
} from 'expo/config-plugins';

// Import the compiled plugin (same path as app.plugin.js)
const withExpoTuyaSdk = (() => {
    const mod = require('../../plugin/build/index');
    return mod.default ?? mod;
})();

// ─── Helpers ────────────────────────────────────────────────────────────────

function createBaseConfig() {
    return {
        name: 'TestApp',
        slug: 'test-app',
        _internal: { projectRoot: '/tmp/test' },
    };
}

const IOS_PROPS = {
    ios: {
        appKey: 'ios-key-123',
        appSecret: 'ios-secret-456',
        cryptionPath: '../vendor/ios',
    },
};

const ANDROID_PROPS = {
    android: {
        appKey: 'android-key-789',
        appSecret: 'android-secret-012',
        securityAarPath: '../../vendor/android',
    },
};

const FULL_PROPS = { ...IOS_PROPS, ...ANDROID_PROPS };

// ─── Mocks ──────────────────────────────────────────────────────────────────

let infoPlistCallback: any = null;
let podfileCallback: any = null;
let androidManifestCallback: any = null;
let projectBuildGradleCallback: any = null;
let appBuildGradleCallback: any = null;

jest.mock('expo/config-plugins', () => {
    const actual = jest.requireActual('expo/config-plugins');
    return {
        ...actual,
        withInfoPlist: jest.fn((config: any, callback: any) => {
            infoPlistCallback = callback;
            return config;
        }),
        withPodfile: jest.fn((config: any, callback: any) => {
            podfileCallback = callback;
            return config;
        }),
        withAndroidManifest: jest.fn((config: any, callback: any) => {
            androidManifestCallback = callback;
            return config;
        }),
        withProjectBuildGradle: jest.fn((config: any, callback: any) => {
            projectBuildGradleCallback = callback;
            return config;
        }),
        withAppBuildGradle: jest.fn((config: any, callback: any) => {
            appBuildGradleCallback = callback;
            return config;
        }),
        createRunOncePlugin: jest.fn((plugin: any) => plugin),
    };
});

beforeEach(() => {
    infoPlistCallback = null;
    podfileCallback = null;
    androidManifestCallback = null;
    projectBuildGradleCallback = null;
    appBuildGradleCallback = null;
    jest.clearAllMocks();
});

// ─── Validation ─────────────────────────────────────────────────────────────

describe('Plugin validation', () => {
    it('throws when props are missing entirely', () => {
        expect(() => withExpoTuyaSdk(createBaseConfig(), undefined)).toThrow(
            'Plugin props are required'
        );
    });

    it('throws when neither ios nor android is provided', () => {
        expect(() => withExpoTuyaSdk(createBaseConfig(), {})).toThrow(
            'You must provide at least "ios" or "android"'
        );
    });

    it('throws when ios is provided without cryptionPath', () => {
        expect(() =>
            withExpoTuyaSdk(createBaseConfig(), {
                ios: { appKey: 'k', appSecret: 's' },
            })
        ).toThrow('cryptionPath');
    });

    it('does not throw with valid ios props', () => {
        expect(() => withExpoTuyaSdk(createBaseConfig(), IOS_PROPS)).not.toThrow();
    });

    it('does not throw with only android props', () => {
        expect(() => withExpoTuyaSdk(createBaseConfig(), ANDROID_PROPS)).not.toThrow();
    });
});

// ─── iOS: Info.plist ────────────────────────────────────────────────────────

describe('iOS Info.plist', () => {
    it('injects ThingSmartAppKey and ThingSmartAppSecret', () => {
        withExpoTuyaSdk(createBaseConfig(), FULL_PROPS);

        const plistConfig = { modResults: {} as Record<string, any> };
        infoPlistCallback(plistConfig);

        expect(plistConfig.modResults.ThingSmartAppKey).toBe('ios-key-123');
        expect(plistConfig.modResults.ThingSmartAppSecret).toBe('ios-secret-456');
    });

    it('injects Bluetooth permission', () => {
        withExpoTuyaSdk(createBaseConfig(), IOS_PROPS);

        const plistConfig = { modResults: {} as Record<string, any> };
        infoPlistCallback(plistConfig);

        expect(plistConfig.modResults.NSBluetoothAlwaysUsageDescription).toBeTruthy();
    });

    it('injects Local Network permission', () => {
        withExpoTuyaSdk(createBaseConfig(), IOS_PROPS);

        const plistConfig = { modResults: {} as Record<string, any> };
        infoPlistCallback(plistConfig);

        expect(plistConfig.modResults.NSLocalNetworkUsageDescription).toBeTruthy();
    });

    it('injects Location permission', () => {
        withExpoTuyaSdk(createBaseConfig(), IOS_PROPS);

        const plistConfig = { modResults: {} as Record<string, any> };
        infoPlistCallback(plistConfig);

        expect(plistConfig.modResults.NSLocationWhenInUseUsageDescription).toBeTruthy();
    });

    it('does not overwrite existing permissions', () => {
        withExpoTuyaSdk(createBaseConfig(), IOS_PROPS);

        const plistConfig = {
            modResults: {
                NSBluetoothAlwaysUsageDescription: 'Custom BT message',
                NSLocalNetworkUsageDescription: 'Custom LAN message',
                NSLocationWhenInUseUsageDescription: 'Custom location message',
            } as Record<string, any>,
        };
        infoPlistCallback(plistConfig);

        expect(plistConfig.modResults.NSBluetoothAlwaysUsageDescription).toBe('Custom BT message');
        expect(plistConfig.modResults.NSLocalNetworkUsageDescription).toBe('Custom LAN message');
        expect(plistConfig.modResults.NSLocationWhenInUseUsageDescription).toBe(
            'Custom location message'
        );
    });
});

// ─── iOS: Podfile ───────────────────────────────────────────────────────────

describe('iOS Podfile', () => {
    it('adds all three required pod sources', () => {
        withExpoTuyaSdk(createBaseConfig(), IOS_PROPS);

        const podfileConfig = {
            modResults: { contents: "use_expo_modules!\nplatform :ios, '13.0'\n" },
        };
        podfileCallback(podfileConfig);

        expect(podfileConfig.modResults.contents).toContain(
            "source 'https://github.com/tuya/tuya-pod-specs.git'"
        );
        expect(podfileConfig.modResults.contents).toContain(
            "source 'https://github.com/TuyaInc/TuyaPublicSpecs.git'"
        );
        expect(podfileConfig.modResults.contents).toContain(
            "source 'https://github.com/CocoaPods/Specs.git'"
        );
    });

    it('injects ThingSmartCryption pod with the configured path', () => {
        withExpoTuyaSdk(createBaseConfig(), IOS_PROPS);

        const podfileConfig = {
            modResults: { contents: "use_expo_modules!\nplatform :ios, '13.0'\n" },
        };
        podfileCallback(podfileConfig);

        expect(podfileConfig.modResults.contents).toContain(
            "pod 'ThingSmartCryption', :path => '../vendor/ios'"
        );
    });

    it('does not duplicate sources if already present', () => {
        withExpoTuyaSdk(createBaseConfig(), IOS_PROPS);

        const existingPodfile =
            "source 'https://github.com/tuya/tuya-pod-specs.git'\n" +
            "source 'https://github.com/TuyaInc/TuyaPublicSpecs.git'\n" +
            "source 'https://github.com/CocoaPods/Specs.git'\n" +
            "use_expo_modules!\nplatform :ios, '13.0'\n";
        const podfileConfig = {
            modResults: { contents: existingPodfile },
        };
        podfileCallback(podfileConfig);

        const tuyaCount = (podfileConfig.modResults.contents.match(/tuya-pod-specs/g) || []).length;
        expect(tuyaCount).toBe(1);
    });

    it('does not duplicate ThingSmartCryption if already present', () => {
        withExpoTuyaSdk(createBaseConfig(), IOS_PROPS);

        const podfileConfig = {
            modResults: {
                contents:
                    "use_expo_modules!\n  pod 'ThingSmartCryption', :path => '../vendor/ios'\nplatform :ios, '13.0'\n",
            },
        };
        podfileCallback(podfileConfig);

        const count = (podfileConfig.modResults.contents.match(/ThingSmartCryption/g) || []).length;
        expect(count).toBe(1);
    });
});

// ─── Android: AndroidManifest.xml ───────────────────────────────────────────

describe('Android AndroidManifest.xml', () => {
    function createManifestConfig() {
        return {
            modResults: {
                manifest: {
                    application: [
                        {
                            $: { 'android:name': '.MainApplication' },
                            'meta-data': [] as any[],
                        },
                    ],
                },
            },
        };
    }

    it('injects THING_SMART_APPKEY and THING_SMART_APPSECRET', () => {
        withExpoTuyaSdk(createBaseConfig(), ANDROID_PROPS);

        const manifestConfig = createManifestConfig();
        androidManifestCallback(manifestConfig);

        const metaData = manifestConfig.modResults.manifest.application[0]['meta-data'];

        const appKeyEntry = metaData.find(
            (m: any) => m.$['android:name'] === 'THING_SMART_APPKEY'
        );
        const appSecretEntry = metaData.find(
            (m: any) => m.$['android:name'] === 'THING_SMART_APPSECRET'
        );

        expect(appKeyEntry.$['android:value']).toBe('android-key-789');
        expect(appSecretEntry.$['android:value']).toBe('android-secret-012');
    });

    it('updates existing meta-data instead of duplicating', () => {
        withExpoTuyaSdk(createBaseConfig(), ANDROID_PROPS);

        const manifestConfig = createManifestConfig();
        manifestConfig.modResults.manifest.application[0]['meta-data'] = [
            { $: { 'android:name': 'THING_SMART_APPKEY', 'android:value': 'old-key' } },
            { $: { 'android:name': 'THING_SMART_APPSECRET', 'android:value': 'old-secret' } },
        ];

        androidManifestCallback(manifestConfig);

        const metaData = manifestConfig.modResults.manifest.application[0]['meta-data'];
        expect(metaData).toHaveLength(2);
        expect(
            metaData.find((m: any) => m.$['android:name'] === 'THING_SMART_APPKEY').$['android:value']
        ).toBe('android-key-789');
    });
});

// ─── Android: build.gradle Maven repo ───────────────────────────────────────

describe('Android build.gradle', () => {
    const SAMPLE_BUILD_GRADLE = `
buildscript {
  repositories {
    google()
    mavenCentral()
  }
}

allprojects {
  repositories {
    google()
    mavenCentral()
  }
}
`;

    it('adds Tuya Maven repositories', () => {
        withExpoTuyaSdk(createBaseConfig(), ANDROID_PROPS);

        const gradleConfig = {
            modResults: { contents: SAMPLE_BUILD_GRADLE },
        };
        projectBuildGradleCallback(gradleConfig);

        expect(gradleConfig.modResults.contents).toContain(
            "maven { url 'https://maven-other.tuya.com/repository/maven-releases/' }"
        );
        expect(gradleConfig.modResults.contents).toContain(
            "maven { url 'https://maven-other.tuya.com/repository/maven-commercial-releases/' }"
        );
        expect(gradleConfig.modResults.contents).toContain(
            "maven { url 'https://maven-other.tuya.com/repository/maven-snapshots/' }"
        );
    });

    it('does not duplicate Maven repositories if already present', () => {
        withExpoTuyaSdk(createBaseConfig(), ANDROID_PROPS);

        const gradleWithTuya =
            SAMPLE_BUILD_GRADLE +
            "\nmaven { url 'https://maven-other.tuya.com/repository/maven-releases/' }" +
            "\nmaven { url 'https://maven-other.tuya.com/repository/maven-commercial-releases/' }" +
            "\nmaven { url 'https://maven-other.tuya.com/repository/maven-snapshots/' }";
        const gradleConfig = {
            modResults: { contents: gradleWithTuya },
        };
        projectBuildGradleCallback(gradleConfig);

        const count = (gradleConfig.modResults.contents.match(/maven-other\.tuya\.com/g) || []).length;
        expect(count).toBe(3);
    });
});

// ─── Android: Security AAR ───────────────────────────────────────────────────

describe('Android security-algorithm AAR', () => {
    const SAMPLE_APP_GRADLE = `
android {
  namespace "com.test"
}

dependencies {
    implementation("com.facebook.react:react-android")
}
`;

    it('adds flatDir repository pointing to securityAarPath', () => {
        withExpoTuyaSdk(createBaseConfig(), ANDROID_PROPS);

        const gradleConfig = {
            modResults: { contents: SAMPLE_APP_GRADLE },
        };
        appBuildGradleCallback(gradleConfig);

        expect(gradleConfig.modResults.contents).toContain("flatDir");
        expect(gradleConfig.modResults.contents).toContain("dirs '../../vendor/android'");
    });

    it('adds security-algorithm AAR as implementation dependency', () => {
        withExpoTuyaSdk(createBaseConfig(), ANDROID_PROPS);

        const gradleConfig = {
            modResults: { contents: SAMPLE_APP_GRADLE },
        };
        appBuildGradleCallback(gradleConfig);

        expect(gradleConfig.modResults.contents).toContain(
            "implementation(name: 'security-algorithm-1.0.0-beta', ext: 'aar')"
        );
    });

    it('does not duplicate if already present', () => {
        withExpoTuyaSdk(createBaseConfig(), ANDROID_PROPS);

        const gradleConfig = {
            modResults: {
                contents:
                    SAMPLE_APP_GRADLE + "\nimplementation(name: 'security-algorithm-1.0.0-beta', ext: 'aar')",
            },
        };
        appBuildGradleCallback(gradleConfig);

        const count = (gradleConfig.modResults.contents.match(/security-algorithm/g) || []).length;
        expect(count).toBe(1);
    });

    it('does not inject AAR when securityAarPath is not provided', () => {
        const propsWithoutAar = {
            android: { appKey: 'k', appSecret: 's' },
        };
        withExpoTuyaSdk(createBaseConfig(), propsWithoutAar);

        expect(withAppBuildGradle).not.toHaveBeenCalled();
    });
});

// ─── Selective platform registration ────────────────────────────────────────

describe('Selective platform registration', () => {
    it('does not register Android mods when only ios is provided', () => {
        withExpoTuyaSdk(createBaseConfig(), IOS_PROPS);

        expect(withAndroidManifest).not.toHaveBeenCalled();
        expect(withProjectBuildGradle).not.toHaveBeenCalled();
    });

    it('does not register iOS mods when only android is provided', () => {
        withExpoTuyaSdk(createBaseConfig(), ANDROID_PROPS);

        expect(withInfoPlist).not.toHaveBeenCalled();
        expect(withPodfile).not.toHaveBeenCalled();
    });
});
