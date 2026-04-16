import {
    ConfigPlugin,
    createRunOncePlugin,
    withInfoPlist,
    withAndroidManifest,
    withPodfile,
    withProjectBuildGradle,
} from 'expo/config-plugins';

type PlatformKeys = {
    appKey: string;
    appSecret: string;
};

type TuyaSdkPluginProps = {
    ios?: PlatformKeys;
    android?: PlatformKeys;
};

const TUYA_POD_SOURCE = "source 'https://github.com/tuya/tuya-pod-specs.git'";
const GITHUB_POD_SOURCE = "source 'https://cdn.cocoapods.org/'";
const TUYA_MAVEN_URL = 'https://maven-other.tuya.com/repository/maven-releases/';

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

// --- iOS: Add Tuya pod sources to Podfile ---
const withTuyaPodfile: ConfigPlugin = (config) => {
    return withPodfile(config, (podfileConfig) => {
        let podfile = podfileConfig.modResults.contents;

        if (!podfile.includes(TUYA_POD_SOURCE)) {
            const sources = [TUYA_POD_SOURCE, GITHUB_POD_SOURCE].filter(
                (s) => !podfile.includes(s)
            );

            if (sources.length > 0) {
                podfile = sources.join('\n') + '\n\n' + podfile;
            }
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

// --- Android: Add Tuya Maven repository to project-level build.gradle ---
const withTuyaMavenRepo: ConfigPlugin = (config) => {
    return withProjectBuildGradle(config, (gradleConfig) => {
        let buildGradle = gradleConfig.modResults.contents;

        if (!buildGradle.includes(TUYA_MAVEN_URL)) {
            // Insert the Tuya maven repo inside the allprojects > repositories block
            buildGradle = buildGradle.replace(
                /allprojects\s*\{[\s\S]*?repositories\s*\{/,
                (match) => `${match}\n    maven { url '${TUYA_MAVEN_URL}' }`
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
        config = withTuyaInfoPlist(config, props);
        config = withTuyaPodfile(config);
    }

    if (props.android) {
        config = withTuyaAndroidManifest(config, props);
        config = withTuyaMavenRepo(config);
    }

    return config;
};

export default createRunOncePlugin(withExpoTuyaSdk, 'expo-tuya-sdk', '0.1.0');
