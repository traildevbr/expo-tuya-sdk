import {
    ConfigPlugin,
    createRunOncePlugin,
    withInfoPlist,
    withAndroidManifest,
    withPodfile,
    withProjectBuildGradle,
    withAppBuildGradle,
    withDangerousMod,
} from 'expo/config-plugins';
import * as fs from 'fs';
import * as path from 'path';

type PlatformKeys = {
    appKey: string;
    appSecret: string;
};

type TuyaSdkPluginProps = {
    ios?: PlatformKeys & {
        /**
         * Path to the directory containing ThingSmartCryption.podspec and the Build folder.
         * Obtained by extracting ios_core_sdk.tar.gz from the Tuya Developer Platform.
         * Relative to the iOS project directory (e.g. "../vendor/ios").
         */
        cryptionPath: string;
    };
    android?: PlatformKeys & {
        /**
         * Path to the directory containing the security-algorithm .aar file.
         * Relative to the Android app directory (e.g. "../../vendor/android").
         */
        securityAarPath?: string;
    };
};

const POD_SOURCES = [
    "source 'https://github.com/tuya/tuya-pod-specs.git'",
    "source 'https://github.com/TuyaInc/TuyaPublicSpecs.git'",
    "source 'https://github.com/CocoaPods/Specs.git'",
];

const TUYA_MAVEN_URLS = [
    'https://maven-other.tuya.com/repository/maven-releases/',
    'https://maven-other.tuya.com/repository/maven-commercial-releases/',
    'https://maven-other.tuya.com/repository/maven-snapshots/',
];

// --- iOS: Inject keys + permissions into Info.plist ---
const withTuyaInfoPlist: ConfigPlugin<TuyaSdkPluginProps> = (config, props) => {
    return withInfoPlist(config, (plistConfig) => {
        if (props.ios) {
            plistConfig.modResults.ThingSmartAppKey = props.ios.appKey;
            plistConfig.modResults.ThingSmartAppSecret = props.ios.appSecret;
        }

        if (!plistConfig.modResults.NSBluetoothAlwaysUsageDescription) {
            plistConfig.modResults.NSBluetoothAlwaysUsageDescription =
                'This app uses Bluetooth to discover and connect to smart devices.';
        }

        if (!plistConfig.modResults.NSLocalNetworkUsageDescription) {
            plistConfig.modResults.NSLocalNetworkUsageDescription =
                'This app uses the local network to discover and communicate with smart devices.';
        }

        if (!plistConfig.modResults.NSLocationWhenInUseUsageDescription) {
            plistConfig.modResults.NSLocationWhenInUseUsageDescription =
                'This app uses your location to find nearby smart devices.';
        }

        return plistConfig;
    });
};

// --- iOS: Add Tuya pod sources + ThingSmartCryption to Podfile ---
const withTuyaPodfile: ConfigPlugin<TuyaSdkPluginProps> = (config, props) => {
    return withPodfile(config, (podfileConfig) => {
        let podfile = podfileConfig.modResults.contents;

        // Add all required pod sources at the top
        const missingSources = POD_SOURCES.filter((s) => !podfile.includes(s));
        if (missingSources.length > 0) {
            podfile = missingSources.join('\n') + '\n\n' + podfile;
        }

        // Add ThingSmartCryption pod with local path
        if (props.ios?.cryptionPath && !podfile.includes('ThingSmartCryption')) {
            const cryptionPod = `  pod 'ThingSmartCryption', :path => '${props.ios.cryptionPath}'`;
            podfile = podfile.replace(
                /use_expo_modules!\s*\n/,
                `use_expo_modules!\n${cryptionPod}\n`
            );
        }

        // Add BizBundle SDK pod
        if (!podfile.includes('ThingSmartBusinessExtensionKit')) {
            podfile = podfile.replace(
                /use_expo_modules!\s*\n/,
                `use_expo_modules!\n  pod 'ThingSmartBusinessExtensionKit'\n`
            );
        }

        podfileConfig.modResults.contents = podfile;
        return podfileConfig;
    });
};

// --- Android: Inject keys as <meta-data> in AndroidManifest.xml ---
const withTuyaAndroidManifest: ConfigPlugin<TuyaSdkPluginProps> = (config, props) => {
    return withAndroidManifest(config, (manifestConfig) => {
        if (!props.android) {
            return manifestConfig;
        }

        const mainApplication =
            manifestConfig.modResults.manifest.application?.[0];

        if (!mainApplication) {
            throw new Error(
                'expo-tuya-sdk: Could not find <application> in AndroidManifest.xml'
            );
        }

        if (!mainApplication['meta-data']) {
            mainApplication['meta-data'] = [];
        }

        const metaData = mainApplication['meta-data'];

        const setMetaData = (name: string, value: string) => {
            const existing = metaData.find(
                (item: any) => item.$?.['android:name'] === name
            );
            if (existing) {
                existing.$['android:value'] = value;
            } else {
                metaData.push({
                    $: {
                        'android:name': name,
                        'android:value': value,
                    },
                });
            }
        };

        setMetaData('THING_SMART_APPKEY', props.android.appKey);
        setMetaData('THING_SMART_APPSECRET', props.android.appSecret);

        return manifestConfig;
    });
};

// --- Android: Add Tuya Maven repositories to project-level build.gradle ---
const withTuyaMavenRepo: ConfigPlugin = (config) => {
    return withProjectBuildGradle(config, (gradleConfig) => {
        let buildGradle = gradleConfig.modResults.contents;

        const missingUrls = TUYA_MAVEN_URLS.filter((url) => !buildGradle.includes(url));
        if (missingUrls.length > 0) {
            const mavenLines = missingUrls
                .map((url) => `    maven { url '${url}' }`)
                .join('\n');
            buildGradle = buildGradle.replace(
                /allprojects\s*\{[\s\S]*?repositories\s*\{/,
                (match) => `${match}\n${mavenLines}`
            );
        }

        // Exclude SNAPSHOT annotation artifacts that are unavailable in any repo
        if (!buildGradle.includes('thingmodule-annotation')) {
            buildGradle = buildGradle.replace(
                /allprojects\s*\{([\s\S]*?repositories\s*\{[\s\S]*?\})/,
                (match) =>
                    match +
                    `\n  configurations.all {\n    exclude group: 'com.thingclips.smart', module: 'thingsmart-modularCampAnno'\n    exclude group: 'com.thingclips.android.module', module: 'thingmodule-annotation'\n  }`
            );
        }

        gradleConfig.modResults.contents = buildGradle;
        return gradleConfig;
    });
};

// --- Android: Add security-algorithm AAR via flatDir + implementation ---
const withTuyaSecurityAar: ConfigPlugin<TuyaSdkPluginProps> = (config, props) => {
    if (!props.android?.securityAarPath) {
        return config;
    }

    const aarPath = props.android.securityAarPath;

    return withAppBuildGradle(config, (gradleConfig) => {
        let buildGradle = gradleConfig.modResults.contents;

        // Add flatDir repository for the AAR
        if (!buildGradle.includes('security-algorithm')) {
            // Add repositories block with flatDir before dependencies
            const flatDirBlock = `\nrepositories {\n    flatDir {\n        dirs '${aarPath}'\n    }\n}\n`;
            const aarDependency = `    implementation(name: 'security-algorithm-1.0.0-beta', ext: 'aar')`;

            // Insert flatDir before the dependencies block
            buildGradle = buildGradle.replace(
                /\ndependencies\s*\{/,
                `${flatDirBlock}\ndependencies {`
            );

            // Insert the AAR dependency inside the dependencies block
            buildGradle = buildGradle.replace(
                /\ndependencies\s*\{/,
                `\ndependencies {\n${aarDependency}`
            );
        }

        gradleConfig.modResults.contents = buildGradle;
        return gradleConfig;
    });
};

// --- iOS: Add BizBundle import to Bridging Header + setupConfig in AppDelegate ---
const withTuyaBizBundleIos: ConfigPlugin = (config) => {
    return withDangerousMod(config, [
        'ios',
        (dangerousConfig) => {
            const projectRoot = dangerousConfig.modRequest.projectRoot;
            const iosDir = path.join(projectRoot, 'ios');

            // Find the bridging header (pattern: <AppName>-Bridging-Header.h)
            const bridgingHeaderImport =
                '#import <ThingSmartBusinessExtensionKit/ThingSmartBusinessExtensionKit.h>';
            const files = fs.readdirSync(iosDir, { recursive: true, withFileTypes: true } as any) as unknown as fs.Dirent[];
            const bridgingHeader = files.find(
                (f) => f.isFile() && f.name.endsWith('-Bridging-Header.h')
            );

            if (bridgingHeader) {
                const headerPath = path.join(
                    (bridgingHeader as any).parentPath ?? (bridgingHeader as any).path,
                    bridgingHeader.name
                );
                let contents = fs.readFileSync(headerPath, 'utf8');
                if (!contents.includes('ThingSmartBusinessExtensionKit')) {
                    contents = contents.trimEnd() + '\n' + bridgingHeaderImport + '\n';
                    fs.writeFileSync(headerPath, contents);
                }
            }

            // Find AppDelegate.swift and inject setupConfig()
            const appDelegate = files.find(
                (f) => f.isFile() && f.name === 'AppDelegate.swift'
            );

            if (appDelegate) {
                const appDelegatePath = path.join(
                    (appDelegate as any).parentPath ?? (appDelegate as any).path,
                    appDelegate.name
                );
                let contents = fs.readFileSync(appDelegatePath, 'utf8');
                if (!contents.includes('ThingSmartBusinessExtensionConfig.setupConfig')) {
                    // Insert after didFinishLaunchingWithOptions opening brace
                    contents = contents.replace(
                        /(didFinishLaunchingWithOptions[^\{]*\{)/,
                        `$1\n    ThingSmartBusinessExtensionConfig.setupConfig()`
                    );
                    fs.writeFileSync(appDelegatePath, contents);
                }
            }

            return dangerousConfig;
        },
    ]);
};

// --- Android: Add BizBundle SDK dependency to app build.gradle ---
const withTuyaBizBundleAndroid: ConfigPlugin = (config) => {
    return withAppBuildGradle(config, (gradleConfig) => {
        let buildGradle = gradleConfig.modResults.contents;

        if (!buildGradle.includes('thingsmart-expansion-sdk')) {
            buildGradle = buildGradle.replace(
                /dependencies\s*\{/,
                `dependencies {\n    implementation "com.thingclips.smart:thingsmart-expansion-sdk:6.11.1"`
            );
        }

        gradleConfig.modResults.contents = buildGradle;
        return gradleConfig;
    });
};

const withExpoTuyaSdk: ConfigPlugin<TuyaSdkPluginProps> = (config, props) => {
    if (!props) {
        throw new Error(
            'expo-tuya-sdk: Plugin props are required. Provide at least ios or android keys.'
        );
    }

    if (!props.ios && !props.android) {
        throw new Error(
            'expo-tuya-sdk: You must provide at least "ios" or "android" configuration with appKey and appSecret.'
        );
    }

    if (props.ios) {
        if (!props.ios.cryptionPath) {
            throw new Error(
                'expo-tuya-sdk: "ios.cryptionPath" is required. ' +
                'Extract ios_core_sdk.tar.gz from the Tuya Developer Platform and provide the path.'
            );
        }
        config = withTuyaInfoPlist(config, props);
        config = withTuyaPodfile(config, props);
        config = withTuyaBizBundleIos(config);
    }

    if (props.android) {
        config = withTuyaAndroidManifest(config, props);
        config = withTuyaMavenRepo(config);
        config = withTuyaSecurityAar(config, props);
        config = withTuyaBizBundleAndroid(config);
    }

    return config;
};

export default createRunOncePlugin(withExpoTuyaSdk, 'expo-tuya-sdk', '0.1.0');
