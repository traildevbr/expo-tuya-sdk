# expo-tuya-sdk

Expo module wrapping the [Tuya Smart Life App SDK (Thing SDK v5+)](https://developer.tuya.com/en/docs/app-development/integrate-sdk?id=Ka5d52ewngdoi) for iOS and Android.

## Prerequisites

- Expo SDK 55+
- iOS 13.0+
- Android minSdk 21+
- A [Tuya Developer Platform](https://platform.tuya.com) account with an app created

### Tuya Platform Setup

1. Log in to the [Tuya Developer Platform](https://platform.tuya.com/oem/sdkList)
2. Create an app and get your **App Key** and **App Secret** for each platform (iOS / Android)
3. Build the SDK on the platform and download the security packages:
   - **iOS**: Download `ios_core_sdk.tar.gz` (contains `ThingSmartCryption.podspec` + `Build/` folder)
   - **Android**: Download `security-algorithm-1.0.0-beta.aar`

## Installation

```bash
npm install expo-tuya-sdk
```

## Project Setup

### 1. Place the security files

Create a `vendor/` directory in your project and organize the security files:

```
your-app/
├── vendor/
│   ├── ios/
│   │   ├── Build/                          # from ios_core_sdk.tar.gz
│   │   ├── ThingSmartCryption.podspec      # from ios_core_sdk.tar.gz
│   │   └── ios_core_sdk.tar.gz             # original (optional, for reference)
│   └── android/
│       └── security-algorithm-1.0.0-beta.aar
├── app.json
└── ...
```

To extract the iOS security SDK:

```bash
mkdir -p vendor/ios
tar -xzf ios_core_sdk.tar.gz -C vendor/ios/
```

### 2. Configure the plugin

Add the plugin to your `app.json` or `app.config.js`:

**app.json:**

```json
{
  "expo": {
    "plugins": [
      [
        "expo-tuya-sdk",
        {
          "ios": {
            "appKey": "YOUR_IOS_APP_KEY",
            "appSecret": "YOUR_IOS_APP_SECRET",
            "cryptionPath": "../vendor/ios"
          },
          "android": {
            "appKey": "YOUR_ANDROID_APP_KEY",
            "appSecret": "YOUR_ANDROID_APP_SECRET",
            "securityAarPath": "../../vendor/android"
          }
        }
      ]
    ]
  }
}
```

**app.config.js** (recommended, to use environment variables):

```js
module.exports = ({ config }) => ({
  ...config,
  plugins: [
    [
      "expo-tuya-sdk",
      {
        ios: {
          appKey: process.env.TUYA_IOS_APP_KEY,
          appSecret: process.env.TUYA_IOS_APP_SECRET,
          cryptionPath: "../vendor/ios",
        },
        android: {
          appKey: process.env.TUYA_ANDROID_APP_KEY,
          appSecret: process.env.TUYA_ANDROID_APP_SECRET,
          securityAarPath: "../../vendor/android",
        },
      },
    ],
  ],
});
```

> **Path reference:**
> - `ios.cryptionPath` is relative to the `ios/` directory of the generated project
> - `android.securityAarPath` is relative to the `android/app/` directory of the generated project

### 3. Plugin props

| Prop | Platform | Required | Description |
|------|----------|----------|-------------|
| `ios.appKey` | iOS | Yes | App Key from Tuya Developer Platform |
| `ios.appSecret` | iOS | Yes | App Secret from Tuya Developer Platform |
| `ios.cryptionPath` | iOS | Yes | Path to the extracted `ios_core_sdk` directory (relative to `ios/`) |
| `android.appKey` | Android | Yes | App Key from Tuya Developer Platform |
| `android.appSecret` | Android | Yes | App Secret from Tuya Developer Platform |
| `android.securityAarPath` | Android | No | Path to the directory containing the `.aar` file (relative to `android/app/`) |

You can configure only one platform if needed. The plugin will skip the other.

### 4. Build

```bash
npx expo prebuild --clean
npx expo run:ios
# or
npx expo run:android
```

## What the plugin does automatically

On each `prebuild`, the Config Plugin handles:

**iOS:**
- Injects `ThingSmartAppKey` and `ThingSmartAppSecret` into `Info.plist`
- Adds `NSBluetoothAlwaysUsageDescription`, `NSLocalNetworkUsageDescription`, and `NSLocationWhenInUseUsageDescription` permissions (won't overwrite existing values)
- Adds required CocoaPods sources (`tuya-pod-specs`, `TuyaPublicSpecs`, `CocoaPods/Specs`)
- Injects the `ThingSmartCryption` pod with local path

**Android:**
- Injects `THING_SMART_APPKEY` and `THING_SMART_APPSECRET` as `<meta-data>` in `AndroidManifest.xml`
- Adds the Tuya Maven repository to the project-level `build.gradle`
- Adds `flatDir` repository and `security-algorithm` AAR dependency to the app-level `build.gradle` (when `securityAarPath` is provided)

## Usage

### Initialize the SDK

```typescript
import ExpoTuyaSdk from 'expo-tuya-sdk';

// Call once at app startup. Keys are read from native config automatically.
await ExpoTuyaSdk.initialize();

// Check initialization status
const ready = ExpoTuyaSdk.isInitialized();

// Toggle debug logs
ExpoTuyaSdk.setDebugMode(true);
```

### User Account

```typescript
import { UserAccount } from 'expo-tuya-sdk';
```

#### Register with phone

```typescript
// 1. Send verification code (type 1 = register)
await UserAccount.sendVerifyCode("11999999999", "AY", "55", 1);

// 2. Register
await UserAccount.registerWithPhone("55", "11999999999", "password123", "123456");
```

#### Login with phone

```typescript
// With password
await UserAccount.loginWithPhone("55", "11999999999", "password123");

// With verification code
await UserAccount.sendVerifyCode("11999999999", "AY", "55", 2);
await UserAccount.loginWithPhoneCode("11999999999", "55", "123456");
```

#### Register and login with email

```typescript
// Send code (type 1 = register)
await UserAccount.sendVerifyCode("user@example.com", "AY", "55", 1);

// Register
await UserAccount.registerWithEmail("55", "user@example.com", "password123", "123456");

// Login with password
await UserAccount.loginWithEmail("55", "user@example.com", "password123");

// Login with verification code
await UserAccount.sendVerifyCode("user@example.com", "AY", "55", 2);
await UserAccount.loginWithEmailCode("user@example.com", "55", "123456");
```

#### Reset password

```typescript
// Phone
await UserAccount.sendVerifyCode("11999999999", "AY", "55", 3);
await UserAccount.resetPasswordWithPhone("55", "11999999999", "newPassword", "123456");

// Email
await UserAccount.sendVerifyCode("user@example.com", "AY", "55", 3);
await UserAccount.resetPasswordWithEmail("55", "user@example.com", "newPassword", "123456");
```

#### Login with UID (custom user system)

```typescript
await UserAccount.loginOrRegisterWithUid("55", "your-user-uid", "random-token", true);
```

#### Third-party login

```typescript
// OAuth 2.0 (Apple, Google, LINE, etc.)
await UserAccount.loginWithAuth2("ap", "55", identityToken, {
  userIdentifier: user,
  email: email,
  nickname: nickname,
  snsNickname: nickname,
});

// Google
await UserAccount.loginWithAuth2("gg", "1", googleIdToken, { pubVersion: 1 });

// Facebook
await UserAccount.loginWithFacebook("55", facebookToken);

// WeChat
await UserAccount.loginWithWechat("86", wechatCode);
```

#### Anonymous account

```typescript
// Register anonymous
await UserAccount.registerAnonymous("55", "Device Name");

// Convert to normal account
await UserAccount.sendVerifyCode("11999999999", "AY", "55", 1);
await UserAccount.usernameBinding("55", "11999999999", "123456", "password123");

// Delete anonymous account (immediate)
await UserAccount.deleteAnonymousAccount();
```

#### Account management

```typescript
await UserAccount.updateNickname("New Name");
await UserAccount.updateTempUnit(1);             // 1 = °C, 2 = °F
await UserAccount.updateTimeZone("America/Sao_Paulo");
UserAccount.updateLocation(-23.5505, -46.6333);  // sync

// Change bound phone/email
await UserAccount.sendVerifyCode("new@email.com", "AY", "55", 1);
await UserAccount.changeBindAccount("new@email.com", "55", "123456");

// Logout
await UserAccount.logout();

// Delete account (7-day grace period)
await UserAccount.cancelAccount();
```

#### Session expiration

```typescript
import { UserAccount } from 'expo-tuya-sdk';

// Listen for session expiration
UserAccount.addListener('onSessionInvalid', () => {
  // Navigate to login screen
});
```

## Native Dependencies

The plugin automatically manages these dependencies:

**iOS (via CocoaPods):**
- `ThingSmartHomeKit`
- `ThingSmartDeviceCoreKit`
- `ThingSmartActivatorKit`
- `ThingSmartCryption` (local, from your security package)

**Android (via Gradle):**
- `com.thingclips.smart:thingsmart:6.11.0`
- `com.thingclips.smart:thingsmart-activator:6.11.0`
- `security-algorithm-1.0.0-beta.aar` (local, from your security package)

## Development

```bash
# Install dependencies
npm install

# Build the module
npm run build

# Build the config plugin
npm run build:plugin

# Run tests
npm test

# Open example app
cd example
npx expo prebuild --clean
npx expo run:ios
```

## License

MIT
