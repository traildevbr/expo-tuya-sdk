package expo.modules.tuyasdk

import com.thingclips.smart.home.sdk.ThingHomeSdk
import com.thingclips.smart.home.sdk.bean.HomeBean
import com.thingclips.smart.home.sdk.callback.IThingGetHomeListCallback
import com.thingclips.smart.home.sdk.callback.IThingHomeResultCallback
import com.thingclips.smart.sdk.api.IResultCallback
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class HomeManagementModule : Module() {
    override fun definition() = ModuleDefinition {
        Name("ExpoTuyaHomeManagement")

        Events(
                "onHomeAdded",
                "onHomeRemoved",
                "onHomeInfoChanged",
                "onHomeInvite",
                "onServerConnectSuccess",
                "onDeviceAdded",
                "onDeviceRemoved",
                "onGroupAdded",
                "onGroupRemoved"
        )

        OnStartObserving {
            try {
                ThingHomeSdk.getHomeManagerInstance()
                        .registerThingHomeChangeListener(homeChangeListener)
            } catch (_: Exception) {}
        }

        OnStopObserving {
            try {
                ThingHomeSdk.getHomeManagerInstance()
                        .unRegisterThingHomeChangeListener(homeChangeListener)
            } catch (_: Exception) {}
        }

        // ─── Home Manager ───────────────────────────────────────────────────

        AsyncFunction("createHome") {
                name: String,
                lon: Double,
                lat: Double,
                geoName: String,
                rooms: List<String>,
                promise: Promise ->
            ThingHomeSdk.getHomeManagerInstance()
                    .createHome(
                            name,
                            lon,
                            lat,
                            geoName,
                            rooms,
                            object : IThingHomeResultCallback {
                                override fun onSuccess(bean: HomeBean?) {
                                    promise.resolve(bean?.homeId ?: 0)
                                }

                                override fun onError(errorCode: String?, errorMsg: String?) {
                                    promise.reject(
                                            "ERR_CREATE_HOME",
                                            errorMsg ?: "Failed to create home",
                                            null
                                    )
                                }
                            }
                    )
        }

        AsyncFunction("queryHomeList") { promise: Promise ->
            ThingHomeSdk.getHomeManagerInstance()
                    .queryHomeList(
                            object : IThingGetHomeListCallback {
                                override fun onSuccess(homeBeans: List<HomeBean>?) {
                                    val result = homeBeans?.map { homeBeanToMap(it) } ?: emptyList()
                                    promise.resolve(result)
                                }

                                override fun onError(errorCode: String?, error: String?) {
                                    promise.reject(
                                            "ERR_QUERY_HOME_LIST",
                                            error ?: "Failed to query home list",
                                            null
                                    )
                                }
                            }
                    )
        }

        // ─── Home Instance ──────────────────────────────────────────────────

        AsyncFunction("getHomeDetail") { homeId: Double, promise: Promise ->
            ThingHomeSdk.newHomeInstance(homeId.toLong())
                    .getHomeDetail(
                            object : IThingHomeResultCallback {
                                override fun onSuccess(bean: HomeBean?) {
                                    promise.resolve(homeBeanToMap(bean))
                                }

                                override fun onError(errorCode: String?, errorMsg: String?) {
                                    promise.reject(
                                            "ERR_HOME_DETAIL",
                                            errorMsg ?: "Failed to get home detail",
                                            null
                                    )
                                }
                            }
                    )
        }

        AsyncFunction("getHomeLocalCache") { homeId: Double, promise: Promise ->
            ThingHomeSdk.newHomeInstance(homeId.toLong())
                    .getHomeLocalCache(
                            object : IThingHomeResultCallback {
                                override fun onSuccess(bean: HomeBean?) {
                                    promise.resolve(homeBeanToMap(bean))
                                }

                                override fun onError(errorCode: String?, errorMsg: String?) {
                                    promise.reject(
                                            "ERR_HOME_CACHE",
                                            errorMsg ?: "Failed to get home cache",
                                            null
                                    )
                                }
                            }
                    )
        }

        AsyncFunction("updateHome") {
                homeId: Double,
                name: String,
                lon: Double,
                lat: Double,
                geoName: String,
                rooms: List<String>,
                promise: Promise ->
            // SDK 6.11.1 only has 4-param updateHome(name, lon, lat, geoName, callback)
            // The rooms param from JS is accepted but not passed to the native API
            ThingHomeSdk.newHomeInstance(homeId.toLong())
                    .updateHome(
                            name,
                            lon,
                            lat,
                            geoName,
                            object : IResultCallback {
                                override fun onSuccess() {
                                    promise.resolve(null)
                                }

                                override fun onError(code: String?, error: String?) {
                                    promise.reject(
                                            "ERR_UPDATE_HOME",
                                            error ?: "Failed to update home",
                                            null
                                    )
                                }
                            }
                    )
        }

        AsyncFunction("dismissHome") { homeId: Double, promise: Promise ->
            ThingHomeSdk.newHomeInstance(homeId.toLong())
                    .dismissHome(
                            object : IResultCallback {
                                override fun onSuccess() {
                                    promise.resolve(null)
                                }

                                override fun onError(code: String?, error: String?) {
                                    promise.reject(
                                            "ERR_DISMISS_HOME",
                                            error ?: "Failed to dismiss home",
                                            null
                                    )
                                }
                            }
                    )
        }

        // ─── Weather ────────────────────────────────────────────────────────

        AsyncFunction("getHomeWeatherSketch") { homeId: Double, promise: Promise ->
            val homeBean = ThingHomeSdk.getDataInstance()?.getHomeBean(homeId.toLong())
            val lon = homeBean?.lon ?: 0.0
            val lat = homeBean?.lat ?: 0.0
            ThingHomeSdk.newHomeInstance(homeId.toLong())
                    .getHomeWeatherSketch(
                            lon,
                            lat,
                            object :
                                    com.thingclips.smart.home.sdk.callback.IIGetHomeWetherSketchCallBack {
                                override fun onSuccess(
                                        sketch: com.thingclips.smart.home.sdk.bean.WeatherBean?
                                ) {
                                    promise.resolve(
                                            mapOf(
                                                    "condition" to (sketch?.condition ?: ""),
                                                    "temp" to (sketch?.temp ?: ""),
                                                    "iconUrl" to (sketch?.iconUrl ?: ""),
                                                    "inIconUrl" to (sketch?.inIconUrl ?: "")
                                            )
                                    )
                                }

                                override fun onFailure(errorCode: String?, errorMsg: String?) {
                                    promise.reject(
                                            "ERR_WEATHER_SKETCH",
                                            errorMsg ?: "Failed to get weather sketch",
                                            null
                                    )
                                }
                            }
                    )
        }

        AsyncFunction("getHomeWeatherDetail") {
                homeId: Double,
                limit: Int,
                units: Map<String, Any>,
                promise: Promise ->
            val unitMap = HashMap<String, Any>()
            units["tempUnit"]?.let { unitMap["tempUnit"] = it }
            units["pressureUnit"]?.let { unitMap["pressureUnit"] = it }
            units["windspeedUnit"]?.let { unitMap["windspeedUnit"] = it }

            ThingHomeSdk.newHomeInstance(homeId.toLong())
                    .getHomeWeatherDetail(
                            limit,
                            unitMap,
                            object : com.thingclips.smart.home.sdk.callback.IGetHomeWetherCallBack {
                                override fun onSuccess(
                                        list:
                                                List<
                                                        com.thingclips.smart.home.sdk.bean.DashBoardBean>?
                                ) {
                                    val result =
                                            list?.map { item ->
                                                mapOf(
                                                        "icon" to (item.icon ?: ""),
                                                        "name" to (item.name ?: ""),
                                                        "unit" to (item.unit ?: ""),
                                                        "value" to (item.value ?: "")
                                                )
                                            }
                                                    ?: emptyList()
                                    promise.resolve(result)
                                }

                                override fun onFailure(errorCode: String?, errorMsg: String?) {
                                    promise.reject(
                                            "ERR_WEATHER_DETAIL",
                                            errorMsg ?: "Failed to get weather detail",
                                            null
                                    )
                                }
                            }
                    )
        }

        // ─── Sorting ────────────────────────────────────────────────────────

        AsyncFunction("sortDeviceOrGroup") {
                homeId: Double,
                orderList: List<Map<String, String>>,
                promise: Promise ->
            val bizList =
                    orderList.map { item ->
                        com.thingclips.smart.home.sdk.bean.DeviceAndGroupInHomeBean().apply {
                            bizId = item["bizId"] ?: ""
                            bizType = (item["bizType"] ?: "0").toInt()
                        }
                    }
            ThingHomeSdk.newHomeInstance(homeId.toLong())
                    .sortDevInHome(
                            homeId.toLong().toString(),
                            bizList,
                            object : IResultCallback {
                                override fun onSuccess() {
                                    promise.resolve(null)
                                }

                                override fun onError(code: String?, error: String?) {
                                    promise.reject(
                                            "ERR_SORT_DEV_GROUP",
                                            error ?: "Failed to sort devices/groups",
                                            null
                                    )
                                }
                            }
                    )
        }

        // ─── Room Management ────────────────────────────────────────────────

        AsyncFunction("addRoom") { homeId: Double, name: String, promise: Promise ->
            ThingHomeSdk.newHomeInstance(homeId.toLong())
                    .addRoom(
                            name,
                            object :
                                    com.thingclips.smart.home.sdk.callback.IThingRoomResultCallback {
                                override fun onSuccess(
                                        bean: com.thingclips.smart.home.sdk.bean.RoomBean?
                                ) {
                                    promise.resolve(bean?.roomId ?: 0)
                                }

                                override fun onError(errorCode: String?, errorMsg: String?) {
                                    promise.reject(
                                            "ERR_ADD_ROOM",
                                            errorMsg ?: "Failed to add room",
                                            null
                                    )
                                }
                            }
                    )
        }

        AsyncFunction("removeRoom") { homeId: Double, roomId: Double, promise: Promise ->
            ThingHomeSdk.newHomeInstance(homeId.toLong())
                    .removeRoom(
                            roomId.toLong(),
                            object : IResultCallback {
                                override fun onSuccess() {
                                    promise.resolve(null)
                                }

                                override fun onError(code: String?, error: String?) {
                                    promise.reject(
                                            "ERR_REMOVE_ROOM",
                                            error ?: "Failed to remove room",
                                            null
                                    )
                                }
                            }
                    )
        }

        AsyncFunction("sortRoomList") { homeId: Double, roomIds: List<Double>, promise: Promise ->
            val idList = roomIds.map { it.toLong() }
            ThingHomeSdk.newHomeInstance(homeId.toLong())
                    .sortRoom(
                            idList,
                            object : IResultCallback {
                                override fun onSuccess() {
                                    promise.resolve(null)
                                }

                                override fun onError(code: String?, error: String?) {
                                    promise.reject(
                                            "ERR_SORT_ROOMS",
                                            error ?: "Failed to sort rooms",
                                            null
                                    )
                                }
                            }
                    )
        }

        // ─── Room Instance Methods ──────────────────────────────────────────

        AsyncFunction("updateRoomName") { roomId: Double, name: String, promise: Promise ->
            ThingHomeSdk.newRoomInstance(roomId.toLong())
                    .updateRoom(
                            name,
                            object : IResultCallback {
                                override fun onSuccess() {
                                    promise.resolve(null)
                                }

                                override fun onError(code: String?, error: String?) {
                                    promise.reject(
                                            "ERR_UPDATE_ROOM",
                                            error ?: "Failed to update room name",
                                            null
                                    )
                                }
                            }
                    )
        }

        AsyncFunction("addDeviceToRoom") { roomId: Double, devId: String, promise: Promise ->
            ThingHomeSdk.newRoomInstance(roomId.toLong())
                    .addDevice(
                            devId,
                            object : IResultCallback {
                                override fun onSuccess() {
                                    promise.resolve(null)
                                }

                                override fun onError(code: String?, error: String?) {
                                    promise.reject(
                                            "ERR_ADD_DEVICE_ROOM",
                                            error ?: "Failed to add device to room",
                                            null
                                    )
                                }
                            }
                    )
        }

        AsyncFunction("removeDeviceFromRoom") { roomId: Double, devId: String, promise: Promise ->
            ThingHomeSdk.newRoomInstance(roomId.toLong())
                    .removeDevice(
                            devId,
                            object : IResultCallback {
                                override fun onSuccess() {
                                    promise.resolve(null)
                                }

                                override fun onError(code: String?, error: String?) {
                                    promise.reject(
                                            "ERR_REMOVE_DEVICE_ROOM",
                                            error ?: "Failed to remove device from room",
                                            null
                                    )
                                }
                            }
                    )
        }

        AsyncFunction("addGroupToRoom") { roomId: Double, groupId: String, promise: Promise ->
            ThingHomeSdk.newRoomInstance(roomId.toLong())
                    .addGroup(
                            groupId.toLong(),
                            object : IResultCallback {
                                override fun onSuccess() {
                                    promise.resolve(null)
                                }

                                override fun onError(code: String?, error: String?) {
                                    promise.reject(
                                            "ERR_ADD_GROUP_ROOM",
                                            error ?: "Failed to add group to room",
                                            null
                                    )
                                }
                            }
                    )
        }

        AsyncFunction("removeGroupFromRoom") { roomId: Double, groupId: String, promise: Promise ->
            ThingHomeSdk.newRoomInstance(roomId.toLong())
                    .removeGroup(
                            groupId.toLong(),
                            object : IResultCallback {
                                override fun onSuccess() {
                                    promise.resolve(null)
                                }

                                override fun onError(code: String?, error: String?) {
                                    promise.reject(
                                            "ERR_REMOVE_GROUP_ROOM",
                                            error ?: "Failed to remove group from room",
                                            null
                                    )
                                }
                            }
                    )
        }

        AsyncFunction("saveBatchRoomRelation") {
                roomId: Double,
                deviceGroupIds: List<String>,
                promise: Promise ->
            val list =
                    deviceGroupIds.map { id ->
                        com.thingclips.smart.home.sdk.bean.DeviceAndGroupInRoomBean().apply {
                            setId(id)
                            setType(6) // device type
                        }
                    }
            ThingHomeSdk.newRoomInstance(roomId.toLong())
                    .moveDevGroupListFromRoom(
                            list,
                            object : IResultCallback {
                                override fun onSuccess() {
                                    promise.resolve(null)
                                }

                                override fun onError(code: String?, error: String?) {
                                    promise.reject(
                                            "ERR_BATCH_ROOM",
                                            error ?: "Failed to save batch room relation",
                                            null
                                    )
                                }
                            }
                    )
        }

        // ─── Member Management ──────────────────────────────────────────────

        AsyncFunction("addMember") { params: Map<String, Any>, promise: Promise ->
            val wrapper =
                    com.thingclips.smart.home.sdk.bean.MemberWrapperBean.Builder()
                            .setHomeId((params["homeId"] as? Double)?.toLong() ?: 0L)
                            .setNickName(params["nickName"] as? String ?: "")
                            .setAccount(params["account"] as? String ?: "")
                            .setCountryCode(params["countryCode"] as? String ?: "")
                            .setRole((params["role"] as? Double)?.toInt() ?: 0)
                            .setAutoAccept(params["autoAccept"] as? Boolean ?: true)
                            .build()
            ThingHomeSdk.getMemberInstance()
                    .addMember(
                            wrapper,
                            object :
                                    com.thingclips.smart.sdk.api.IThingDataCallback<
                                            com.thingclips.smart.home.sdk.bean.MemberBean> {
                                override fun onSuccess(
                                        bean: com.thingclips.smart.home.sdk.bean.MemberBean?
                                ) {
                                    promise.resolve(memberBeanToMap(bean))
                                }

                                override fun onError(errorCode: String?, errorMsg: String?) {
                                    promise.reject(
                                            "ERR_ADD_MEMBER",
                                            errorMsg ?: "Failed to add member",
                                            null
                                    )
                                }
                            }
                    )
        }

        AsyncFunction("removeMember") { memberId: Double, promise: Promise ->
            ThingHomeSdk.getMemberInstance()
                    .removeMember(
                            memberId.toLong(),
                            object : IResultCallback {
                                override fun onSuccess() {
                                    promise.resolve(null)
                                }

                                override fun onError(code: String?, error: String?) {
                                    promise.reject(
                                            "ERR_REMOVE_MEMBER",
                                            error ?: "Failed to remove member",
                                            null
                                    )
                                }
                            }
                    )
        }

        AsyncFunction("queryMemberList") { homeId: Double, promise: Promise ->
            ThingHomeSdk.getMemberInstance()
                    .queryMemberList(
                            homeId.toLong(),
                            object :
                                    com.thingclips.smart.home.sdk.callback.IThingGetMemberListCallback {
                                override fun onSuccess(
                                        memberList:
                                                List<com.thingclips.smart.home.sdk.bean.MemberBean>?
                                ) {
                                    val result =
                                            memberList?.map { memberBeanToMap(it) } ?: emptyList()
                                    promise.resolve(result)
                                }

                                override fun onError(errorCode: String?, error: String?) {
                                    promise.reject(
                                            "ERR_QUERY_MEMBERS",
                                            error ?: "Failed to query member list",
                                            null
                                    )
                                }
                            }
                    )
        }

        AsyncFunction("updateMember") { params: Map<String, Any>, promise: Promise ->
            val wrapper =
                    com.thingclips.smart.home.sdk.bean.MemberWrapperBean.Builder()
                            .setMemberId((params["memberId"] as? Double)?.toLong() ?: 0L)
                            .setNickName(params["nickName"] as? String ?: "")
                            .setRole((params["role"] as? Double)?.toInt() ?: 0)
                            .setAdmin(params["admin"] as? Boolean ?: false)
                            .build()
            ThingHomeSdk.getMemberInstance()
                    .updateMember(
                            wrapper,
                            object : IResultCallback {
                                override fun onSuccess() {
                                    promise.resolve(null)
                                }

                                override fun onError(code: String?, error: String?) {
                                    promise.reject(
                                            "ERR_UPDATE_MEMBER",
                                            error ?: "Failed to update member",
                                            null
                                    )
                                }
                            }
                    )
        }

        AsyncFunction("getInvitationCode") { homeId: Double, promise: Promise ->
            ThingHomeSdk.getMemberInstance()
                    .getInvitationMessage(
                            homeId.toLong(),
                            object :
                                    com.thingclips.smart.sdk.api.IThingDataCallback<
                                            com.thingclips.sdk.home.bean.InviteMessageBean> {
                                override fun onSuccess(
                                        bean: com.thingclips.sdk.home.bean.InviteMessageBean?
                                ) {
                                    promise.resolve(bean?.invitationCode ?: "")
                                }

                                override fun onError(errorCode: String?, errorMsg: String?) {
                                    promise.reject(
                                            "ERR_INVITATION_CODE",
                                            errorMsg ?: "Failed to get invitation code",
                                            null
                                    )
                                }
                            }
                    )
        }

        AsyncFunction("joinHomeWithInvitationCode") { code: String, promise: Promise ->
            ThingHomeSdk.getHomeManagerInstance()
                    .joinHomeByInviteCode(
                            code,
                            object : IResultCallback {
                                override fun onSuccess() {
                                    promise.resolve(null)
                                }

                                override fun onError(errorCode: String?, error: String?) {
                                    promise.reject(
                                            "ERR_JOIN_HOME",
                                            error ?: "Failed to join home",
                                            null
                                    )
                                }
                            }
                    )
        }

        AsyncFunction("cancelInvitation") { invitationId: Double, promise: Promise ->
            ThingHomeSdk.getMemberInstance()
                    .cancelMemberInvitationCode(
                            invitationId.toLong(),
                            object : IResultCallback {
                                override fun onSuccess() {
                                    promise.resolve(null)
                                }

                                override fun onError(code: String?, error: String?) {
                                    promise.reject(
                                            "ERR_CANCEL_INVITATION",
                                            error ?: "Failed to cancel invitation",
                                            null
                                    )
                                }
                            }
                    )
        }

        AsyncFunction("processInvitation") { homeId: Double, accept: Boolean, promise: Promise ->
            val action = accept
            ThingHomeSdk.getMemberInstance()
                    .processInvitation(
                            homeId.toLong(),
                            action,
                            object : IResultCallback {
                                override fun onSuccess() {
                                    promise.resolve(null)
                                }

                                override fun onError(code: String?, error: String?) {
                                    promise.reject(
                                            "ERR_PROCESS_INVITATION",
                                            error ?: "Failed to process invitation",
                                            null
                                    )
                                }
                            }
                    )
        }

        AsyncFunction("getInvitationList") { homeId: Double, promise: Promise ->
            ThingHomeSdk.getMemberInstance()
                    .getInvitationList(
                            homeId.toLong(),
                            object : com.thingclips.smart.sdk.api.IThingDataCallback<Any> {
                                override fun onSuccess(result: Any?) {
                                    @Suppress("UNCHECKED_CAST")
                                    val list = result as? List<Map<String, Any>> ?: emptyList()
                                    val mapped =
                                            list.map { item ->
                                                mapOf(
                                                        "invitationId" to
                                                                (item["invitationId"] ?: 0),
                                                        "invitationCode" to
                                                                (item["invitationCode"] ?: ""),
                                                        "name" to (item["name"] ?: ""),
                                                        "role" to (item["role"] ?: 0),
                                                        "dealStatus" to (item["dealStatus"] ?: 0)
                                                )
                                            }
                                    promise.resolve(mapped)
                                }

                                override fun onError(errorCode: String?, errorMsg: String?) {
                                    promise.reject(
                                            "ERR_INVITATION_LIST",
                                            errorMsg ?: "Failed to get invitation list",
                                            null
                                    )
                                }
                            }
                    )
        }

        AsyncFunction("updateInvitedMember") {
                invitationId: Double,
                name: String,
                role: Int,
                promise: Promise ->
            ThingHomeSdk.getMemberInstance()
                    .updateInvitedMember(
                            invitationId.toLong(),
                            name,
                            role,
                            object : IResultCallback {
                                override fun onSuccess() {
                                    promise.resolve(null)
                                }

                                override fun onError(code: String?, error: String?) {
                                    promise.reject(
                                            "ERR_UPDATE_INVITED",
                                            error ?: "Failed to update invited member",
                                            null
                                    )
                                }
                            }
                    )
        }
    }

    // ─── Helpers ─────────────────────────────────────────────────────────

    private fun homeBeanToMap(bean: HomeBean?): Map<String, Any?> {
        if (bean == null) return emptyMap()
        return mapOf(
                "homeId" to bean.homeId,
                "name" to (bean.name ?: ""),
                "geoName" to (bean.geoName ?: ""),
                "lon" to bean.lon,
                "lat" to bean.lat,
                "admin" to bean.isAdmin,
                "homeStatus" to bean.homeStatus,
                "role" to bean.role
        )
    }

    private fun memberBeanToMap(
            bean: com.thingclips.smart.home.sdk.bean.MemberBean?
    ): Map<String, Any?> {
        if (bean == null) return emptyMap()
        return mapOf(
                "homeId" to bean.homeId,
                "memberId" to bean.memberId,
                "nickName" to (bean.nickName ?: ""),
                "account" to (bean.account ?: ""),
                "role" to bean.role,
                "admin" to bean.isAdmin,
                "headPic" to (bean.headPic ?: ""),
                "memberStatus" to bean.memberStatus
        )
    }

    // ─── Home Change Listener ───────────────────────────────────────────

    private val homeChangeListener =
            object : com.thingclips.smart.home.sdk.api.IThingHomeChangeListener {
                override fun onHomeAdded(homeId: Long) {
                    sendEvent("onHomeAdded", mapOf("homeId" to homeId))
                }

                override fun onHomeInvite(homeId: Long, homeName: String?) {
                    sendEvent(
                            "onHomeInvite",
                            mapOf("homeId" to homeId, "homeName" to (homeName ?: ""))
                    )
                }

                override fun onHomeRemoved(homeId: Long) {
                    sendEvent("onHomeRemoved", mapOf("homeId" to homeId))
                }

                override fun onHomeInfoChanged(homeId: Long) {
                    sendEvent("onHomeInfoChanged", mapOf("homeId" to homeId))
                }

                override fun onSharedDeviceList(
                        list: List<com.thingclips.smart.sdk.bean.DeviceBean>?
                ) {
                    // Not exposed to JS
                }

                override fun onSharedGroupList(
                        list: MutableList<com.thingclips.smart.sdk.bean.GroupBean>?
                ) {
                    // Not exposed to JS
                }

                override fun onServerConnectSuccess() {
                    sendEvent("onServerConnectSuccess", emptyMap<String, Any>())
                }
            }
}
