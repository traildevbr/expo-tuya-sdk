import ExpoModulesCore
import ThingSmartBaseKit

public class ExpoTuyaSdkModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoTuyaSdk")

    Events("onInitSuccess", "onInitFailure")

    /// Initialize the Tuya SDK by reading ThingSmartAppKey and ThingSmartAppSecret
    /// from Info.plist (injected by the Config Plugin).
    AsyncFunction("initialize") {
      guard
        let appKey = Bundle.main.object(forInfoDictionaryKey: "ThingSmartAppKey") as? String,
        let appSecret = Bundle.main.object(forInfoDictionaryKey: "ThingSmartAppSecret") as? String,
        !appKey.isEmpty,
        !appSecret.isEmpty
      else {
        throw NSError(
          domain: "ExpoTuyaSdk",
          code: 1,
          userInfo: [NSLocalizedDescriptionKey: "ThingSmartAppKey or ThingSmartAppSecret not found in Info.plist. Make sure the expo-tuya-sdk config plugin is configured correctly."]
        )
      }

      ThingSmartSDK.sharedInstance().start(withAppKey: appKey, secretKey: appSecret)

      #if DEBUG
      ThingSmartSDK.sharedInstance().debugMode = true
      #endif
    }

    /// Check whether the SDK has been initialized.
    Function("isInitialized") {
      return !ThingSmartSDK.sharedInstance().appKey.isEmpty
    }

    /// Enable or disable debug mode for the Tuya SDK.
    Function("setDebugMode") { (enabled: Bool) in
      ThingSmartSDK.sharedInstance().debugMode = enabled
    }
  }
}
