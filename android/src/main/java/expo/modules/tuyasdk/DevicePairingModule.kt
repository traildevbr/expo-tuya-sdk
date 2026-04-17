package expo.modules.tuyasdk

import android.content.Context
import com.thingclips.smart.activator.core.kit.ThingActivatorCoreKit
import com.thingclips.smart.activator.core.kit.ThingActivatorDeviceCoreKit
import com.thingclips.smart.activator.core.kit.active.inter.IThingActiveManager
import com.thingclips.smart.activator.core.kit.bean.ThingActivatorScanDeviceBean
import com.thingclips.smart.activator.core.kit.bean.ThingActivatorScanFailureBean
import com.thingclips.smart.activator.core.kit.bean.ThingActivatorScanKey
import com.thingclips.smart.activator.core.kit.bean.ThingDeviceActiveErrorBean
import com.thingclips.smart.activator.core.kit.bean.ThingDeviceActiveLimitBean
import com.thingclips.smart.activator.core.kit.builder.ThingDeviceActiveBuilder
import com.thingclips.smart.activator.core.kit.callback.ThingActivatorScanCallback
import com.thingclips.smart.activator.core.kit.constant.ThingDeviceActiveModeEnum
import com.thingclips.smart.activator.core.kit.listener.IThingDeviceActiveListener
import com.thingclips.smart.sdk.api.IThingActivatorGetToken
import com.thingclips.smart.sdk.bean.DeviceBean
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class DevicePairingModule : Module() {

        private var scanKey: ThingActivatorScanKey? = null
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
                                                override fun onSuccess(token: String) =
                                                        promise.resolve(token)
                                                override fun onFailure(
                                                        errorCode: String,
                                                        errorMsg: String
                                                ) = promise.reject("ERR_GET_TOKEN", errorMsg, null)
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
                                                        override fun deviceFound(
                                                                deviceBean:
                                                                        ThingActivatorScanDeviceBean
                                                        ) {
                                                                sendEvent(
                                                                        "onDeviceFound",
                                                                        mapOf(
                                                                                "devId" to
                                                                                        deviceBean
                                                                                                .uniqueId
                                                                        )
                                                                )
                                                        }
                                                        override fun deviceUpdate(
                                                                deviceBean:
                                                                        ThingActivatorScanDeviceBean
                                                        ) {}
                                                        override fun deviceRepeat(
                                                                deviceBean:
                                                                        ThingActivatorScanDeviceBean
                                                        ) {}
                                                        override fun scanFinish() =
                                                                promise.resolve(null)
                                                        override fun scanFailure(
                                                                failureBean:
                                                                        ThingActivatorScanFailureBean
                                                        ) = promise.resolve(null)
                                                }
                                        )
                }

                AsyncFunction("stopEzScan") { promise: Promise ->
                        scanKey?.let { ThingActivatorCoreKit.getScanDeviceManager().stopScan(it) }
                        scanKey = null
                        promise.resolve(null)
                }

                // ─── EZ Pairing ─────────────────────────────────────────────────────

                AsyncFunction("startEzPairing") {
                        ssid: String,
                        password: String,
                        token: String,
                        timeoutSeconds: Int,
                        promise: Promise ->
                        val manager =
                                ThingActivatorCoreKit.getActiveManager().newThingActiveManager()
                        activeManager = manager

                        val builder =
                                ThingDeviceActiveBuilder()
                                        .setActiveModel(ThingDeviceActiveModeEnum.EZ)
                                        .setSsid(ssid)
                                        .setPassword(password)
                                        .setToken(token)
                                        .setTimeOut(timeoutSeconds.toLong())
                                        .setListener(
                                                object : IThingDeviceActiveListener {
                                                        override fun onFind(devId: String) {
                                                                sendEvent(
                                                                        "onDeviceFound",
                                                                        mapOf("devId" to devId)
                                                                )
                                                        }
                                                        override fun onBind(devId: String) {
                                                                sendEvent(
                                                                        "onDeviceBind",
                                                                        mapOf("devId" to devId)
                                                                )
                                                        }
                                                        override fun onActiveSuccess(
                                                                deviceBean: DeviceBean
                                                        ) {
                                                                sendEvent(
                                                                        "onPairingSuccess",
                                                                        mapOf(
                                                                                "devId" to
                                                                                        (deviceBean
                                                                                                .devId
                                                                                                ?: ""),
                                                                                "name" to
                                                                                        (deviceBean
                                                                                                .name
                                                                                                ?: ""),
                                                                                "productId" to
                                                                                        (deviceBean
                                                                                                .productId
                                                                                                ?: ""),
                                                                                "uuid" to
                                                                                        (deviceBean
                                                                                                .uuid
                                                                                                ?: ""),
                                                                                "isOnline" to
                                                                                        (deviceBean
                                                                                                .isOnline ==
                                                                                                true)
                                                                        )
                                                                )
                                                                promise.resolve(null)
                                                        }
                                                        override fun onActiveError(
                                                                errorBean:
                                                                        ThingDeviceActiveErrorBean
                                                        ) {
                                                                val code =
                                                                        errorBean.errCode
                                                                                ?: "ERR_PAIRING"
                                                                val msg =
                                                                        errorBean.errMsg
                                                                                ?: "Pairing failed"
                                                                sendEvent(
                                                                        "onPairingError",
                                                                        mapOf(
                                                                                "errorCode" to code,
                                                                                "errorMsg" to msg
                                                                        )
                                                                )
                                                                promise.reject(code, msg, null)
                                                        }
                                                        override fun onActiveLimited(
                                                                limitBean:
                                                                        ThingDeviceActiveLimitBean
                                                        ) {
                                                                val code =
                                                                        limitBean.errorCode
                                                                                ?: "ERR_PAIRING_LIMITED"
                                                                val msg =
                                                                        limitBean.errorMsg
                                                                                ?: "Pairing limited"
                                                                sendEvent(
                                                                        "onPairingLimited",
                                                                        mapOf(
                                                                                "errorCode" to code,
                                                                                "errorMsg" to msg
                                                                        )
                                                                )
                                                                promise.reject(code, msg, null)
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
}
