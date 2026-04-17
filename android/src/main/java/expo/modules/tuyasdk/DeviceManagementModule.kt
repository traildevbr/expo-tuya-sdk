package expo.modules.tuyasdk

import com.thingclips.smart.device.sharedevice.sdk.ThingShareBizKit
import com.thingclips.smart.device.sharedevice.sdk.bean.ShareMember
import com.thingclips.smart.home.sdk.bean.DeviceShareBean
import com.thingclips.smart.home.sdk.bean.ShareReceivedUserDetailBean
import com.thingclips.smart.home.sdk.bean.SharedUserInfoBean
import com.thingclips.smart.home.sdk.callback.IThingResultCallback
import com.thingclips.smart.sdk.api.IResultCallback
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class DeviceManagementModule : Module() {

        private val shareManager
                get() = ThingShareBizKit.getThingDeviceShareManager()

        override fun definition() = ModuleDefinition {
                Name("ExpoTuyaDeviceManagement")

                // ─── Sharer APIs ─────────────────────────────────────────────────────

                AsyncFunction("supportShare") { resId: String, resType: Int, promise: Promise ->
                        shareManager.isSupportDeviceShare(
                                resId,
                                resType,
                                object : IThingResultCallback<Boolean> {
                                        override fun onSuccess(result: Boolean) =
                                                promise.resolve(result)
                                        override fun onError(code: String?, msg: String?) =
                                                promise.reject(
                                                        "ERR_SUPPORT_SHARE",
                                                        msg ?: "supportShare failed",
                                                        null
                                                )
                                }
                        )
                }

                AsyncFunction("remainingShareTimes") { resId: String, resType: Int, promise: Promise
                        ->
                        // Not exposed in this SDK version — return -1 (unlimited)
                        promise.resolve(-1)
                }

                AsyncFunction("share") {
                        resId: String,
                        resType: Int,
                        spaceId: Double,
                        userAccount: String,
                        promise: Promise ->
                        shareManager.shareToUser(
                                resId,
                                resType,
                                spaceId.toLong(),
                                userAccount,
                                object : IThingResultCallback<SharedUserInfoBean> {
                                        override fun onSuccess(result: SharedUserInfoBean) {
                                                promise.resolve(
                                                        mapOf(
                                                                "memberId" to result.memeberId,
                                                                "nickName" to
                                                                        (result.remarkName ?: ""),
                                                                "userName" to
                                                                        (result.userName ?: "")
                                                        )
                                                )
                                        }
                                        override fun onError(code: String?, msg: String?) =
                                                promise.reject(
                                                        "ERR_SHARE",
                                                        msg ?: "share failed",
                                                        null
                                                )
                                }
                        )
                }

                AsyncFunction("removeReceiver") {
                        memberId: Double,
                        resId: String,
                        resType: Int,
                        promise: Promise ->
                        shareManager.removeReceiver(
                                memberId.toLong(),
                                resId,
                                resType,
                                object : IResultCallback {
                                        override fun onSuccess() = promise.resolve(null)
                                        override fun onError(code: String?, msg: String?) =
                                                promise.reject(
                                                        "ERR_REMOVE_RECEIVER",
                                                        msg ?: "removeReceiver failed",
                                                        null
                                                )
                                }
                        )
                }

                AsyncFunction("receivers") {
                        resId: String,
                        resType: Int,
                        page: Int,
                        pageSize: Int,
                        promise: Promise ->
                        shareManager.getReceivers(
                                resId,
                                resType,
                                page,
                                pageSize,
                                object : IThingResultCallback<List<ShareMember>> {
                                        override fun onSuccess(result: List<ShareMember>) =
                                                promise.resolve(result.map { shareMemberToMap(it) })
                                        override fun onError(code: String?, msg: String?) =
                                                promise.reject(
                                                        "ERR_RECEIVERS",
                                                        msg ?: "receivers failed",
                                                        null
                                                )
                                }
                        )
                }

                AsyncFunction("updateShareExpirationDate") {
                        memberId: Double,
                        resId: String,
                        resType: Int,
                        mode: Int,
                        endTime: Double,
                        promise: Promise ->
                        // Not exposed in this SDK version
                        promise.resolve(null)
                }

                AsyncFunction("relationMembers") { promise: Promise ->
                        shareManager.getRelationMembers(
                                object : IThingResultCallback<List<ShareMember>> {
                                        override fun onSuccess(result: List<ShareMember>) =
                                                promise.resolve(result.map { shareMemberToMap(it) })
                                        override fun onError(code: String?, msg: String?) =
                                                promise.reject(
                                                        "ERR_RELATION_MEMBERS",
                                                        msg ?: "relationMembers failed",
                                                        null
                                                )
                                }
                        )
                }

                AsyncFunction("removeRelationMember") { uid: String, promise: Promise ->
                        // Not exposed in this SDK version
                        promise.resolve(null)
                }

                AsyncFunction("createShareInfo") {
                        resId: String,
                        resType: Int,
                        spaceId: Double,
                        shareType: Int,
                        shareCount: Int,
                        promise: Promise ->
                        // Not exposed in this SDK version
                        promise.resolve(mapOf("content" to "", "code" to "", "shortUrl" to ""))
                }

                // ─── Receiver APIs ───────────────────────────────────────────────────

                AsyncFunction("validateShareCode") { code: String, promise: Promise ->
                        shareManager.parseShortLinkAvailability(
                                code,
                                object : IThingResultCallback<Boolean> {
                                        override fun onSuccess(result: Boolean) =
                                                promise.resolve(result)
                                        override fun onError(code2: String?, msg: String?) =
                                                promise.reject(
                                                        "ERR_VALIDATE_CODE",
                                                        msg ?: "validateShareCode failed",
                                                        null
                                                )
                                }
                        )
                }

                AsyncFunction("shareCodeInfo") { code: String, promise: Promise ->
                        // Not exposed in this SDK version
                        promise.resolve(
                                mapOf(
                                        "appId" to "",
                                        "resId" to "",
                                        "resType" to 1,
                                        "resIcon" to "",
                                        "resName" to "",
                                        "nickName" to "",
                                        "shareSource" to 0,
                                        "groupId" to 0L
                                )
                        )
                }

                AsyncFunction("acceptShare") { code: String, promise: Promise ->
                        shareManager.acceptShare(
                                code,
                                object : IResultCallback {
                                        override fun onSuccess() = promise.resolve(null)
                                        override fun onError(code2: String?, msg: String?) =
                                                promise.reject(
                                                        "ERR_ACCEPT_SHARE",
                                                        msg ?: "acceptShare failed",
                                                        null
                                                )
                                }
                        )
                }

                AsyncFunction("removeShare") { resId: String, resType: Int, promise: Promise ->
                        shareManager.removeReceivedShare(
                                resId,
                                resType,
                                object : IResultCallback {
                                        override fun onSuccess() = promise.resolve(null)
                                        override fun onError(code: String?, msg: String?) =
                                                promise.reject(
                                                        "ERR_REMOVE_SHARE",
                                                        msg ?: "removeShare failed",
                                                        null
                                                )
                                }
                        )
                }

                AsyncFunction("sharers") { promise: Promise ->
                        shareManager.getShareReceivedUserList(
                                object : IThingResultCallback<List<SharedUserInfoBean>> {
                                        override fun onSuccess(result: List<SharedUserInfoBean>) {
                                                promise.resolve(
                                                        result.map {
                                                                mapOf(
                                                                        "memberId" to it.memeberId,
                                                                        "nickName" to
                                                                                (it.remarkName
                                                                                        ?: ""),
                                                                        "userName" to
                                                                                (it.userName ?: "")
                                                                )
                                                        }
                                                )
                                        }
                                        override fun onError(code: String?, msg: String?) =
                                                promise.reject(
                                                        "ERR_SHARERS",
                                                        msg ?: "sharers failed",
                                                        null
                                                )
                                }
                        )
                }

                AsyncFunction("sharerName") { resId: String, resType: Int, promise: Promise ->
                        shareManager.getSharerName(
                                resId,
                                resType,
                                object : IThingResultCallback<String> {
                                        override fun onSuccess(result: String) =
                                                promise.resolve(result)
                                        override fun onError(code: String?, msg: String?) =
                                                promise.reject(
                                                        "ERR_SHARER_NAME",
                                                        msg ?: "sharerName failed",
                                                        null
                                                )
                                }
                        )
                }

                AsyncFunction("sharerDetail") { memberId: Double, promise: Promise ->
                        shareManager.getSharerInfoDetail(
                                memberId.toLong(),
                                object : IThingResultCallback<ShareReceivedUserDetailBean> {
                                        override fun onSuccess(
                                                result: ShareReceivedUserDetailBean
                                        ) {
                                                val devices =
                                                        result.devices?.map { d: DeviceShareBean ->
                                                                mapOf(
                                                                        "devId" to (d.devId ?: ""),
                                                                        "name" to
                                                                                (d.deviceName
                                                                                        ?: ""),
                                                                        "iconUrl" to
                                                                                (d.iconUrl ?: "")
                                                                )
                                                        }
                                                                ?: emptyList()
                                                promise.resolve(
                                                        mapOf(
                                                                "devices" to devices,
                                                                "mobile" to (result.mobile ?: ""),
                                                                "name" to
                                                                        (result.nameWithoutRemark
                                                                                ?: ""),
                                                                "remarkName" to
                                                                        (result.remarkName ?: "")
                                                        )
                                                )
                                        }
                                        override fun onError(code: String?, msg: String?) =
                                                promise.reject(
                                                        "ERR_SHARER_DETAIL",
                                                        msg ?: "sharerDetail failed",
                                                        null
                                                )
                                }
                        )
                }

                AsyncFunction("removeSharer") { memberId: Double, promise: Promise ->
                        shareManager.removeReceivedUserShare(
                                memberId.toLong(),
                                object : IResultCallback {
                                        override fun onSuccess() = promise.resolve(null)
                                        override fun onError(code: String?, msg: String?) =
                                                promise.reject(
                                                        "ERR_REMOVE_SHARER",
                                                        msg ?: "removeSharer failed",
                                                        null
                                                )
                                }
                        )
                }

                AsyncFunction("updateSharer") { memberId: Double, name: String, promise: Promise ->
                        shareManager.renameReceivedShareNickname(
                                memberId.toLong(),
                                name,
                                object : IResultCallback {
                                        override fun onSuccess() = promise.resolve(null)
                                        override fun onError(code: String?, msg: String?) =
                                                promise.reject(
                                                        "ERR_UPDATE_SHARER",
                                                        msg ?: "updateSharer failed",
                                                        null
                                                )
                                }
                        )
                }
        }

        // ─── Helpers ─────────────────────────────────────────────────────────────

        private fun shareMemberToMap(m: ShareMember): Map<String, Any?> =
                mapOf(
                        "memberId" to (m.memberId ?: 0L),
                        "nickName" to (m.nickName ?: ""),
                        "userName" to (m.userName ?: ""),
                        "iconUrl" to (m.iconUrl ?: ""),
                        "shareMode" to m.shareMode,
                        "endTime" to (m.endTime ?: 0L),
                        "uid" to (m.uid ?: "")
                )
}
