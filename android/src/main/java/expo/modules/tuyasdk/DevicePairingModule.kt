package expo.modules.tuyasdk

import android.content.Context
import com.thingclips.smart.activator.core.kit.ThingActivatorCoreKit
import com.thingclips.smart.activator.core.kit.ThingActivatorDeviceCoreKit
import com.thingclips.smart.activator.core.kit.api.IThingActivatorGetToken
import com.thingclips.smart.activator.core.kit.bean.ThingActivatorScanDeviceBean
import com.thingclips.smart.activator.core.kit.bean.ThingDeviceActiveErrorBean
import com.thingclips.smart.activator.core.kit.bean.ThingDeviceActiveLimitBean
import com.thingclips.smart.activator.core.kit.builder.ThingDeviceActiveBuilder
import com.thingclips.smart.activator.core.kit.constant.ThingDeviceActiveModeEnum
import com.thingclips.smart.activator.core.kit.listener.IThingDeviceActiveListener
import com.thingclips.smart.activator.core.kit.listener.ThingActivatorScanCallback
import com.thingclips.smart.activator.core.kit.manager.IThingActiveManager
import com.thingclips.smart.home.sdk.bean.DeviceBean
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class DevicePairingModule : Module() {

    private var scanKey: String? = null
    private var activeManager: IThingActiveManager? = null

    override fun definition() = ModuleDefinition {
        Name("ExpoTuyaDevicePairing")

        Events(
                "onDeviceFound",
                "onDeviceBind",
                "onPairingSuccess",
                "onPairingError",
                "onPairingLimited"
        )

        // ─── Get Pairing Token ──────────────────────────────────────────────

        AsyncFunction("getPairingToken") { homeId: Long, promise: Promise ->
            ThingActivatorDeviceCoreKit.getActivatorInstance()
                    .getActivatorToken(
                            homeId,
                            object : IThingActivatorGetToken {
                                override fun onSuccess(token: String) {
                                    promise.resolve(token)
                                }

                                override fun onFailure(errorCode: String, errorMsg: String) {
                                    promise.reject("ERR_GET_TOKEN", errorMsg, null)
                                }
                            }
                    )
        }

        // ─── EZ Scan ────────────────────────────────────────────────────────

        AsyncFunction("startEzScan") {
                ssid: String,
                password: String,
                token: String,
                timeoutMs: Long,
                promise: Promise ->
            val context: Context =
                    appContext.reactContext
                            ?: return@AsyncFunction promise.reject(
                                    "ERR_NO_CONTEXT",
                                    "React context unavailable",
                                    null
                            )

            scanKey =
                    ThingActivatorCoreKit.getScanDeviceManager()
                            .startEzDeviceSearch(
                                    context,
                                    ssid,
                                    password,
                                    token,
                                    timeoutMs,
                                    object : ThingActivatorScanCallback {
                                        override fun onDeviceFind(
                                                deviceBean: ThingActivatorScanDeviceBean
                                        ) {
                                            sendEvent(
                                                    "onDeviceFound",
                                                    mapOf("devId" to (deviceBean.devId ?: ""))
                                            )
                                        }

                                        override fun onScanTimeout() {
                                            // Scan finished — resolve so JS knows scanning ended
                                            promise.resolve(null)
                                        }
                                    }
                            )
        }

        AsyncFunction("stopEzScan") { promise: Promise ->
            val key = scanKey
            if (key != null) {
                ThingActivatorCoreKit.getScanDeviceManager().stopScan(key)
                scanKey = null
            }
            promise.resolve(null)
        }

        // ─── EZ Pairing ─────────────────────────────────────────────────────

        AsyncFunction("startEzPairing") {
                ssid: String,
                password: String,
                token: String,
                timeoutSeconds: Int,
                promise: Promise ->
            val manager = ThingActivatorCoreKit.getActiveManager().newThingActiveManager()
            activeManager = manager

            val builder =
                    ThingDeviceActiveBuilder()
                            .setActiveModel(ThingDeviceActiveModeEnum.EZ)
                            .setSsid(ssid)
                            .setPassword(password)
                            .setToken(token)
                            .setTimeOut(timeoutSeconds)
                            .setListener(
                                    object : IThingDeviceActiveListener {
                                        override fun onFind(devId: String) {
                                            sendEvent("onDeviceFound", mapOf("devId" to devId))
                                        }

                                        override fun onBind(devId: String) {
                                            sendEvent("onDeviceBind", mapOf("devId" to devId))
                                        }

                                        override fun onActiveSuccess(deviceBean: DeviceBean) {
                                            sendEvent(
                                                    "onPairingSuccess",
                                                    mapOf(
                                                            "devId" to (deviceBean.devId ?: ""),
                                                            "name" to (deviceBean.name ?: ""),
                                                            "productId" to
                                                                    (deviceBean.productId ?: ""),
                                                            "uuid" to (deviceBean.uuid ?: ""),
                                                            "isOnline" to (deviceBean.isOnline)
                                                    )
                                            )
                                            promise.resolve(null)
                                        }

                                        override fun onActiveError(
                                                errorBean: ThingDeviceActiveErrorBean
                                        ) {
                                            sendEvent(
                                                    "onPairingError",
                                                    mapOf(
                                                            "errorCode" to
                                                                    (errorBean.errorCode ?: ""),
                                                            "errorMsg" to
                                                                    (errorBean.errorMsg
                                                                            ?: "Pairing failed")
                                                    )
                                            )
                                            promise.reject(
                                                    errorBean.errorCode ?: "ERR_PAIRING",
                                                    errorBean.errorMsg ?: "Pairing failed",
                                                    null
                                            )
                                        }

                                        override fun onActiveLimited(
                                                limitBean: ThingDeviceActiveLimitBean
                                        ) {
                                            sendEvent(
                                                    "onPairingLimited",
                                                    mapOf(
                                                            "errorCode" to
                                                                    (limitBean.errorCode ?: ""),
                                                            "errorMsg" to
                                                                    (limitBean.errorMsg
                                                                            ?: "Pairing limited")
                                                    )
                                            )
                                            promise.reject(
                                                    limitBean.errorCode ?: "ERR_PAIRING_LIMITED",
                                                    limitBean.errorMsg ?: "Pairing limited",
                                                    null
                                            )
                                        }
                                    }
                            )

            manager.startActive(builder)
        }

        AsyncFunction("stopEzPairing") { promise: Promise ->
            activeManager?.stopActive()
            activeManager = null
            promise.resolve(null)
        }
    }

    private fun deviceBeanToMap(bean: DeviceBean): Map<String, Any?> =
            mapOf(
                    "devId" to bean.devId,
                    "name" to bean.name,
                    "productId" to bean.productId,
                    "uuid" to bean.uuid,
                    "isOnline" to bean.isOnline
            )
}
