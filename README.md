# expo-tuya-sdk

Expo module wrapping the [Tuya Smart Life App SDK (Thing SDK v5+)](https://developer.tuya.com/en/docs/app-development/integrate-sdk?id=Ka5d52ewngdoi) for iOS and Android.

Provides a fully typed React Native API for:
- **SDK initialization** — configure app keys, debug mode
- **User Account** — register, login (phone/email/OAuth/UID), password reset, anonymous accounts
- **Home Management** — create/update/delete homes, rooms, members, invitations, weather
- **Device Pairing** — EZ mode (SmartConfig) Wi-Fi pairing
- **Device Management** — share devices with other users, manage sharers and receivers

## Requirements

- Expo SDK 51+
- iOS 13.0+
- Android minSdk 21+
- A [Tuya Developer Platform](https://platform.tuya.com) account

## Installation

```bash
npm install expo-tuya-sdk
```

## Platform Setup

### 1. Get your credentials

1. Log in to the [Tuya Developer Platform](https://platform.tuya.com/oem/sdkList)
2. Create an app and get your **App Key** and **App Secret** for iOS and Android
3. Download the security packages:
   - **iOS**: `ios_core_sdk.tar.gz` → extract to `vendor/ios/`
   - **Android**: `security-algorithm-1.0.0-beta.aar` → place in `vendor/android/`

```
your-app/
├── vendor/
│   ├── ios/
│   │   ├── Build/
│   │   └── ThingSmartCryption.podspec
│   └── android/
│       └── security-algorithm-1.0.0-beta.aar
└── app.config.js
```

```bash
mkdir -p vendor/ios && tar -xzf ios_core_sdk.tar.gz -C vendor/ios/
```

### 2. Configure the plugin

**`app.config.js`** (recommended — use environment variables):

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

| Prop | Platform | Required | Description |
|------|----------|----------|-------------|
| `ios.appKey` | iOS | ✅ | App Key from Tuya Developer Platform |
| `ios.appSecret` | iOS | ✅ | App Secret from Tuya Developer Platform |
| `ios.cryptionPath` | iOS | ✅ | Path to extracted `ios_core_sdk` dir, relative to `ios/` |
| `android.appKey` | Android | ✅ | App Key from Tuya Developer Platform |
| `android.appSecret` | Android | ✅ | App Secret from Tuya Developer Platform |
| `android.securityAarPath` | Android | — | Path to `.aar` dir, relative to `android/app/` |

### 3. Prebuild

```bash
npx expo prebuild --clean
npx expo run:ios
npx expo run:android
```

## API Reference

### SDK

```typescript
import ExpoTuyaSdk from 'expo-tuya-sdk';

await ExpoTuyaSdk.initialize();          // read keys from native config
ExpoTuyaSdk.isInitialized();             // boolean
ExpoTuyaSdk.setDebugMode(true);
```

---

### UserAccount

```typescript
import { UserAccount } from 'expo-tuya-sdk';
```

#### Phone

```typescript
await UserAccount.sendVerifyCode(phone, region, countryCode, type);
// type: 1=register, 2=login, 3=reset password

await UserAccount.registerWithPhone(countryCode, phone, password, code);
await UserAccount.loginWithPhone(countryCode, phone, password);
await UserAccount.loginWithPhoneCode(phone, countryCode, code);
await UserAccount.resetPasswordWithPhone(countryCode, phone, newPassword, code);
```

#### Email

```typescript
await UserAccount.registerWithEmail(countryCode, email, password, code);
await UserAccount.loginWithEmail(countryCode, email, password);
await UserAccount.loginWithEmailCode(email, countryCode, code);
await UserAccount.resetPasswordWithEmail(countryCode, email, newPassword, code);
```

#### OAuth / Third-party

```typescript
await UserAccount.loginWithAuth2(platform, countryCode, token, extraInfo);
// platform: "ap" (Apple), "gg" (Google), "fb" (Facebook), etc.

await UserAccount.loginWithFacebook(countryCode, token);
await UserAccount.loginWithWechat(countryCode, code);
```

#### UID (custom user system)

```typescript
await UserAccount.loginOrRegisterWithUid(countryCode, uid, token, createHome);
```

#### Account management

```typescript
await UserAccount.updateNickname(name);
await UserAccount.updateTempUnit(1);           // 1=°C, 2=°F
await UserAccount.updateTimeZone("America/Sao_Paulo");
await UserAccount.logout();
await UserAccount.cancelAccount();             // 7-day grace period
```

#### Session expiration

```typescript
UserAccount.addListener('onSessionInvalid', () => {
  // navigate to login
});
```

---

### HomeManagement

```typescript
import { HomeManagement } from 'expo-tuya-sdk';
```

#### Homes

```typescript
const homeId = await HomeManagement.createHome(name, lon, lat, geoName, rooms);
const homes   = await HomeManagement.queryHomeList();
const home    = await HomeManagement.getHomeDetail(homeId);
await HomeManagement.updateHome(homeId, name, lon, lat, geoName, rooms);
await HomeManagement.dismissHome(homeId);
```

#### Rooms

```typescript
const roomId = await HomeManagement.addRoom(homeId, name);
await HomeManagement.removeRoom(homeId, roomId);
await HomeManagement.sortRoomList(homeId, [roomId1, roomId2]);
await HomeManagement.updateRoomName(homeId, roomId, name);
await HomeManagement.addDeviceToRoom(homeId, roomId, devId);
await HomeManagement.removeDeviceFromRoom(homeId, roomId, devId);
await HomeManagement.addGroupToRoom(homeId, roomId, groupId);
await HomeManagement.removeGroupFromRoom(homeId, roomId, groupId);
await HomeManagement.saveBatchRoomRelation(homeId, roomId, [devId1, devId2]);
```

#### Members

```typescript
await HomeManagement.addMember({ homeId, nickName, account, countryCode, role, autoAccept });
await HomeManagement.removeMember(memberId);
const members = await HomeManagement.queryMemberList(homeId);
await HomeManagement.updateMember({ memberId, nickName, role });
```

#### Invitations

```typescript
const code = await HomeManagement.getInvitationCode(homeId);
await HomeManagement.joinHomeWithInvitationCode(code);
await HomeManagement.cancelInvitation(invitationId);
await HomeManagement.processInvitation(homeId, accept);  // accept: boolean
const list = await HomeManagement.getInvitationList(homeId);
await HomeManagement.updateInvitedMember(invitationId, name, role);
```

#### Weather

```typescript
const sketch = await HomeManagement.getHomeWeatherSketch(homeId);
const detail = await HomeManagement.getHomeWeatherDetail(homeId, limit, units);
```

#### Events

```typescript
HomeManagement.addListener('onHomeAdded',          ({ homeId }) => {});
HomeManagement.addListener('onHomeRemoved',         ({ homeId }) => {});
HomeManagement.addListener('onServerConnectSuccess', () => {});
```

---

### DevicePairing

Wi-Fi EZ mode (SmartConfig) pairing.

```typescript
import { DevicePairing } from 'expo-tuya-sdk';
```

```typescript
// 1. Get a pairing token (valid 10 min)
const token = await DevicePairing.getPairingToken(homeId);

// 2. Start pairing
await DevicePairing.startEzPairing(ssid, password, token, 100);

// 3. Listen for progress
DevicePairing.addListener('onDeviceFound',   ({ devId }) => {});
DevicePairing.addListener('onDeviceBind',    ({ devId }) => {});
DevicePairing.addListener('onPairingSuccess', (device) => {
  console.log('Paired:', device.devId, device.name);
});
DevicePairing.addListener('onPairingError',  ({ errorCode, errorMsg }) => {});

// 4. Stop if needed
await DevicePairing.stopEzPairing();
```

> **iOS note:** EZ mode requires the `com.apple.developer.networking.multicast` entitlement on iOS 14.5+. Consider AP mode for better reliability.

---

### DeviceManagement

Share devices with other users.

```typescript
import { DeviceManagement } from 'expo-tuya-sdk';
```

#### Sharer APIs

```typescript
// Check if device supports sharing
const ok = await DeviceManagement.supportShare(devId, 1); // 1=device, 2=group

// Remaining share quota (-1 = unlimited)
const times = await DeviceManagement.remainingShareTimes(devId, 1);

// Share with a user
const result = await DeviceManagement.share(devId, 1, homeId, userAccount);

// List receivers
const receivers = await DeviceManagement.receivers(devId, 1, 1, 20);

// Remove a receiver
await DeviceManagement.removeReceiver(memberId, devId, 1);

// Update share expiration (mode: 0=forever, 1=period)
await DeviceManagement.updateShareExpirationDate(memberId, devId, 1, 1, endTimeMs);

// Recently shared contacts
const contacts = await DeviceManagement.relationMembers();
await DeviceManagement.removeRelationMember(uid);

// Generate share code/link
const info = await DeviceManagement.createShareInfo(devId, 1, homeId, 5, 1);
// shareType: 0=account, 3=message, 4=email, 5=copy
```

#### Receiver APIs

```typescript
// Validate a share code
const valid = await DeviceManagement.validateShareCode(code);

// Get share code info
const info = await DeviceManagement.shareCodeInfo(code);

// Accept a share invitation
await DeviceManagement.acceptShare(code);

// Remove a shared device (receiver removes their own access)
await DeviceManagement.removeShare(devId, 1);

// List users who shared with me
const sharers = await DeviceManagement.sharers();

// Get sharer name for a device
const name = await DeviceManagement.sharerName(devId, 1);

// Get sharer details
const detail = await DeviceManagement.sharerDetail(memberId);

// Remove a sharer
await DeviceManagement.removeSharer(memberId);

// Update sharer remark name
await DeviceManagement.updateSharer(memberId, newName);
```

---

## What the plugin does automatically

On each `prebuild --clean`, the Config Plugin handles:

**iOS:**
- Injects `ThingSmartAppKey` / `ThingSmartAppSecret` into `Info.plist`
- Adds Bluetooth, local network, and location usage descriptions
- Adds required CocoaPods sources
- Injects `ThingSmartCryption` pod (local) and `ThingSmartBusinessExtensionKit`
- Adds `ThingSmartBusinessExtensionConfig.setupConfig()` to `AppDelegate.swift`
- Adds BizBundle import to the bridging header

**Android:**
- Injects `THING_SMART_APPKEY` / `THING_SMART_APPSECRET` into `AndroidManifest.xml`
- Adds Tuya Maven repositories to `build.gradle`
- Adds `thingsmart-expansion-sdk` dependency
- Excludes unavailable SNAPSHOT annotation artifacts

## License

MIT © [Traildev](https://github.com/traildevbr)
