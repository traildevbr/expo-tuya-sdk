package expo.modules.tuyasdk

import android.content.pm.PackageManager
import com.thingclips.smart.home.sdk.ThingHomeSdk
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ExpoTuyaSdkModule : Module() {
    override fun definition() = ModuleDefinition {
        Name("ExpoTuyaSdk")

        Events("onInitSuccess", "onInitFailure")

        AsyncFunction("initialize") {
            val context =
                    appContext.reactContext
                            ?: throw IllegalStateException("React context is not available.")

            val applicationInfo =
                    context.packageManager.getApplicationInfo(
                            context.packageName,
                            PackageManager.GET_META_DATA
                    )

            val appKey = applicationInfo.metaData?.getString("THING_SMART_APPKEY")
            val appSecret = applicationInfo.metaData?.getString("THING_SMART_APPSECRET")

            if (appKey.isNullOrEmpty() || appSecret.isNullOrEmpty()) {
                throw IllegalStateException(
                        "THING_SMART_APPKEY or THING_SMART_APPSECRET not found in AndroidManifest.xml. " +
                                "Make sure the expo-tuya-sdk config plugin is configured correctly."
                )
            }

            ThingHomeSdk.init(
                    context.applicationContext as android.app.Application,
                    appKey,
                    appSecret
            )
            ThingHomeSdk.setDebugMode(true)
        }

        Function("isInitialized") {
            try {
                val user = ThingHomeSdk.getUserInstance()
                user != null
            } catch (e: Exception) {
                false
            }
        }

        Function("setDebugMode") { enabled: Boolean -> ThingHomeSdk.setDebugMode(enabled) }
    }
}
