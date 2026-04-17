package expo.modules.tuyasdk

import com.thingclips.smart.android.user.api.IBooleanCallback
import com.thingclips.smart.android.user.api.ILoginCallback
import com.thingclips.smart.android.user.api.ILogoutCallback
import com.thingclips.smart.android.user.api.IReNickNameCallback
import com.thingclips.smart.android.user.api.IRegisterCallback
import com.thingclips.smart.android.user.api.IResetPasswordCallback
import com.thingclips.smart.android.user.api.IUidLoginCallback
import com.thingclips.smart.android.user.api.IWhiteListCallback
import com.thingclips.smart.android.user.bean.User
import com.thingclips.smart.android.user.bean.WhiteList
import com.thingclips.smart.home.sdk.ThingHomeSdk
import com.thingclips.smart.sdk.ThingSdk
import com.thingclips.smart.sdk.api.IResultCallback
import com.thingclips.smart.sdk.enums.TempUnitEnum
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import org.json.JSONObject

class UserAccountModule : Module() {
    override fun definition() = ModuleDefinition {
        Name("ExpoTuyaUserAccount")

        Events("onSessionInvalid")

        OnCreate {
            ThingHomeSdk.setOnNeedLoginListener {
                sendEvent("onSessionInvalid", emptyMap<String, Any>())
            }
        }

        // ─── Query areas for verification code service ──────────────────────

        AsyncFunction("getWhiteListWhoCanSendMobileCode") { promise: Promise ->
            ThingHomeSdk.getUserInstance()
                    .getWhiteListWhoCanSendMobileCodeSuccess(
                            object : IWhiteListCallback {
                                override fun onSuccess(whiteList: WhiteList?) {
                                    promise.resolve(whiteList?.countryCodes ?: "")
                                }

                                override fun onError(code: String?, error: String?) {
                                    promise.reject(
                                            "ERR_WHITELIST",
                                            error ?: "Failed to get whitelist regions",
                                            null
                                    )
                                }
                            }
                    )
        }

        // ─── Send verification code ─────────────────────────────────────────

        AsyncFunction("sendVerifyCode") {
                userName: String,
                region: String,
                countryCode: String,
                type: Int,
                promise: Promise ->
            ThingHomeSdk.getUserInstance()
                    .sendVerifyCodeWithUserName(
                            userName,
                            region,
                            countryCode,
                            type,
                            object : IResultCallback {
                                override fun onError(code: String?, error: String?) {
                                    promise.reject(
                                            "ERR_SEND_CODE",
                                            error ?: "Failed to send verification code",
                                            null
                                    )
                                }

                                override fun onSuccess() {
                                    promise.resolve(null)
                                }
                            }
                    )
        }

        // ─── Check verification code ────────────────────────────────────────

        AsyncFunction("checkVerifyCode") {
                userName: String,
                region: String,
                countryCode: String,
                code: String,
                type: Int,
                promise: Promise ->
            ThingHomeSdk.getUserInstance()
                    .checkCodeWithUserName(
                            userName,
                            region,
                            countryCode,
                            code,
                            type,
                            object : IResultCallback {
                                override fun onError(code: String?, error: String?) {
                                    promise.reject(
                                            "ERR_CHECK_CODE",
                                            error ?: "Failed to verify code",
                                            null
                                    )
                                }

                                override fun onSuccess() {
                                    promise.resolve(true)
                                }
                            }
                    )
        }

        // ─── Register with phone ────────────────────────────────────────────

        AsyncFunction("registerWithPhone") {
                countryCode: String,
                phoneNumber: String,
                password: String,
                code: String,
                promise: Promise ->
            ThingHomeSdk.getUserInstance()
                    .registerAccountWithPhone(
                            countryCode,
                            phoneNumber,
                            password,
                            code,
                            object : IRegisterCallback {
                                override fun onSuccess(user: User?) {
                                    promise.resolve(null)
                                }

                                override fun onError(code: String?, error: String?) {
                                    promise.reject(
                                            "ERR_REGISTER_PHONE",
                                            error ?: "Failed to register",
                                            null
                                    )
                                }
                            }
                    )
        }

        // ─── Login with phone and password ──────────────────────────────────

        AsyncFunction("loginWithPhone") {
                countryCode: String,
                phoneNumber: String,
                password: String,
                promise: Promise ->
            ThingHomeSdk.getUserInstance()
                    .loginWithPhonePassword(
                            countryCode,
                            phoneNumber,
                            password,
                            object : ILoginCallback {
                                override fun onSuccess(user: User?) {
                                    promise.resolve(null)
                                }

                                override fun onError(code: String?, error: String?) {
                                    promise.reject(
                                            "ERR_LOGIN_PHONE",
                                            error ?: "Failed to login",
                                            null
                                    )
                                }
                            }
                    )
        }

        // ─── Login with phone and verification code ─────────────────────────

        AsyncFunction("loginWithPhoneCode") {
                phoneNumber: String,
                countryCode: String,
                code: String,
                promise: Promise ->
            ThingHomeSdk.getUserInstance()
                    .loginWithPhone(
                            countryCode,
                            phoneNumber,
                            code,
                            object : ILoginCallback {
                                override fun onSuccess(user: User?) {
                                    promise.resolve(null)
                                }

                                override fun onError(code: String?, error: String?) {
                                    promise.reject(
                                            "ERR_LOGIN_PHONE_CODE",
                                            error ?: "Failed to login with code",
                                            null
                                    )
                                }
                            }
                    )
        }

        // ─── Reset password with phone ──────────────────────────────────────

        AsyncFunction("resetPasswordWithPhone") {
                countryCode: String,
                phoneNumber: String,
                newPassword: String,
                code: String,
                promise: Promise ->
            ThingHomeSdk.getUserInstance()
                    .resetPhonePassword(
                            countryCode,
                            phoneNumber,
                            code,
                            newPassword,
                            object : IResetPasswordCallback {
                                override fun onSuccess() {
                                    promise.resolve(null)
                                }

                                override fun onError(code: String?, error: String?) {
                                    promise.reject(
                                            "ERR_RESET_PHONE_PWD",
                                            error ?: "Failed to reset password",
                                            null
                                    )
                                }
                            }
                    )
        }

        // ─── Send binding verification code for email ───────────────────────

        AsyncFunction("sendBindingVerificationCodeWithEmail") {
                email: String,
                countryCode: String,
                promise: Promise ->
            ThingHomeSdk.getUserInstance()
                    .sendBindVerifyCodeWithEmail(
                            countryCode,
                            email,
                            object : IResultCallback {
                                override fun onError(code: String?, error: String?) {
                                    promise.reject(
                                            "ERR_SEND_BIND_EMAIL_CODE",
                                            error ?: "Failed to send binding verification code",
                                            null
                                    )
                                }

                                override fun onSuccess() {
                                    promise.resolve(null)
                                }
                            }
                    )
        }

        // ─── Bind email ─────────────────────────────────────────────────────

        AsyncFunction("bindEmail") {
                email: String,
                countryCode: String,
                code: String,
                sId: String,
                promise: Promise ->
            ThingHomeSdk.getUserInstance()
                    .bindEmail(
                            countryCode,
                            email,
                            code,
                            sId,
                            object : IResultCallback {
                                override fun onError(code: String?, error: String?) {
                                    promise.reject(
                                            "ERR_BIND_EMAIL",
                                            error ?: "Failed to bind email",
                                            null
                                    )
                                }

                                override fun onSuccess() {
                                    promise.resolve(null)
                                }
                            }
                    )
        }

        // ─── Register with email ────────────────────────────────────────────

        AsyncFunction("registerWithEmail") {
                countryCode: String,
                email: String,
                password: String,
                code: String,
                promise: Promise ->
            ThingHomeSdk.getUserInstance()
                    .registerAccountWithEmail(
                            countryCode,
                            email,
                            password,
                            code,
                            object : IRegisterCallback {
                                override fun onSuccess(user: User?) {
                                    promise.resolve(null)
                                }

                                override fun onError(code: String?, error: String?) {
                                    promise.reject(
                                            "ERR_REGISTER_EMAIL",
                                            error ?: "Failed to register with email",
                                            null
                                    )
                                }
                            }
                    )
        }

        // ─── Login with email and password ──────────────────────────────────

        AsyncFunction("loginWithEmail") {
                countryCode: String,
                email: String,
                password: String,
                promise: Promise ->
            ThingHomeSdk.getUserInstance()
                    .loginWithEmail(
                            countryCode,
                            email,
                            password,
                            object : ILoginCallback {
                                override fun onSuccess(user: User?) {
                                    promise.resolve(null)
                                }

                                override fun onError(code: String?, error: String?) {
                                    promise.reject(
                                            "ERR_LOGIN_EMAIL",
                                            error ?: "Failed to login with email",
                                            null
                                    )
                                }
                            }
                    )
        }

        // ─── Login with email and verification code ─────────────────────────

        AsyncFunction("loginWithEmailCode") {
                email: String,
                countryCode: String,
                code: String,
                promise: Promise ->
            ThingHomeSdk.getUserInstance()
                    .loginWithEmailCode(
                            countryCode,
                            email,
                            code,
                            object : ILoginCallback {
                                override fun onSuccess(user: User?) {
                                    promise.resolve(null)
                                }

                                override fun onError(code: String?, error: String?) {
                                    promise.reject(
                                            "ERR_LOGIN_EMAIL_CODE",
                                            error ?: "Failed to login with email code",
                                            null
                                    )
                                }
                            }
                    )
        }

        // ─── Reset password with email ──────────────────────────────────────

        AsyncFunction("resetPasswordWithEmail") {
                countryCode: String,
                email: String,
                newPassword: String,
                code: String,
                promise: Promise ->
            ThingHomeSdk.getUserInstance()
                    .resetEmailPassword(
                            countryCode,
                            email,
                            code,
                            newPassword,
                            object : IResetPasswordCallback {
                                override fun onSuccess() {
                                    promise.resolve(null)
                                }

                                override fun onError(code: String?, error: String?) {
                                    promise.reject(
                                            "ERR_RESET_EMAIL_PWD",
                                            error ?: "Failed to reset password with email",
                                            null
                                    )
                                }
                            }
                    )
        }

        // ─── Send binding verification code for phone ───────────────────────

        AsyncFunction("sendBindVerifyCodeWithPhone") {
                countryCode: String,
                phoneNumber: String,
                promise: Promise ->
            ThingHomeSdk.getUserInstance()
                    .sendBindVerifyCode(
                            countryCode,
                            phoneNumber,
                            object : IResultCallback {
                                override fun onError(code: String?, error: String?) {
                                    promise.reject(
                                            "ERR_SEND_BIND_PHONE_CODE",
                                            error
                                                    ?: "Failed to send phone binding verification code",
                                            null
                                    )
                                }

                                override fun onSuccess() {
                                    promise.resolve(null)
                                }
                            }
                    )
        }

        // ─── Bind phone number ──────────────────────────────────────────────

        AsyncFunction("bindPhone") {
                countryCode: String,
                phoneNumber: String,
                code: String,
                promise: Promise ->
            ThingHomeSdk.getUserInstance()
                    .bindMobile(
                            countryCode,
                            phoneNumber,
                            code,
                            object : IResultCallback {
                                override fun onError(code: String?, error: String?) {
                                    promise.reject(
                                            "ERR_BIND_PHONE",
                                            error ?: "Failed to bind phone number",
                                            null
                                    )
                                }

                                override fun onSuccess() {
                                    promise.resolve(null)
                                }
                            }
                    )
        }

        // ─── Login or register with UID ─────────────────────────────────────

        AsyncFunction("loginOrRegisterWithUid") {
                countryCode: String,
                uid: String,
                password: String,
                createHome: Boolean,
                promise: Promise ->
            ThingHomeSdk.getUserInstance()
                    .loginOrRegisterWithUid(
                            countryCode,
                            uid,
                            password,
                            createHome,
                            object : IUidLoginCallback {
                                override fun onSuccess(user: User?, homeId: Long) {
                                    val result = mapOf("homeId" to homeId)
                                    promise.resolve(result)
                                }

                                override fun onError(code: String?, error: String?) {
                                    promise.reject(
                                            "ERR_UID_LOGIN",
                                            error ?: "Failed to login or register with UID",
                                            null
                                    )
                                }
                            }
                    )
        }

        // ─── Login with Facebook ────────────────────────────────────────────

        AsyncFunction("loginWithFacebook") { countryCode: String, token: String, promise: Promise ->
            ThingHomeSdk.getUserInstance()
                    .thirdLogin(
                            countryCode,
                            token,
                            "fb",
                            "{}",
                            object : ILoginCallback {
                                override fun onSuccess(user: User?) {
                                    promise.resolve(null)
                                }

                                override fun onError(code: String?, error: String?) {
                                    promise.reject(
                                            "ERR_LOGIN_FACEBOOK",
                                            error ?: "Failed to login with Facebook",
                                            null
                                    )
                                }
                            }
                    )
        }

        // ─── Login with Twitter ─────────────────────────────────────────────

        AsyncFunction("loginWithTwitter") {
                countryCode: String,
                key: String,
                secret: String,
                promise: Promise ->
            ThingHomeSdk.getUserInstance()
                    .thirdLogin(
                            countryCode,
                            key,
                            "tw",
                            "{\"secret\":\"$secret\"}",
                            object : ILoginCallback {
                                override fun onSuccess(user: User?) {
                                    promise.resolve(null)
                                }

                                override fun onError(code: String?, error: String?) {
                                    promise.reject(
                                            "ERR_LOGIN_TWITTER",
                                            error ?: "Failed to login with Twitter",
                                            null
                                    )
                                }
                            }
                    )
        }

        // ─── Login with OAuth 2.0 ──────────────────────────────────────────

        AsyncFunction("loginWithAuth2") {
                type: String,
                countryCode: String,
                accessToken: String,
                extraInfo: Map<String, Any>,
                promise: Promise ->
            ThingHomeSdk.getUserInstance()
                    .thirdLogin(
                            countryCode,
                            accessToken,
                            type,
                            JSONObject(extraInfo).toString(),
                            object : ILoginCallback {
                                override fun onSuccess(user: User?) {
                                    promise.resolve(null)
                                }

                                override fun onError(code: String?, error: String?) {
                                    promise.reject(
                                            "ERR_LOGIN_AUTH2",
                                            error ?: "Failed to login with OAuth 2.0",
                                            null
                                    )
                                }
                            }
                    )
        }

        // ─── Login with WeChat ──────────────────────────────────────────────

        AsyncFunction("loginWithWechat") { countryCode: String, code: String, promise: Promise ->
            ThingHomeSdk.getUserInstance()
                    .loginByWechat(
                            countryCode,
                            code,
                            object : ILoginCallback {
                                override fun onSuccess(user: User?) {
                                    promise.resolve(null)
                                }

                                override fun onError(code: String?, error: String?) {
                                    promise.reject(
                                            "ERR_LOGIN_WECHAT",
                                            error ?: "Failed to login with WeChat",
                                            null
                                    )
                                }
                            }
                    )
        }

        // ─── Login with QQ ──────────────────────────────────────────────────

        AsyncFunction("loginWithQQ") {
                countryCode: String,
                userId: String,
                accessToken: String,
                promise: Promise ->
            ThingHomeSdk.getUserInstance()
                    .loginByQQ(
                            countryCode,
                            userId,
                            accessToken,
                            object : ILoginCallback {
                                override fun onSuccess(user: User?) {
                                    promise.resolve(null)
                                }

                                override fun onError(code: String?, error: String?) {
                                    promise.reject(
                                            "ERR_LOGIN_QQ",
                                            error ?: "Failed to login with QQ",
                                            null
                                    )
                                }
                            }
                    )
        }

        // ─── Register anonymous account ─────────────────────────────────────

        AsyncFunction("registerAnonymous") { countryCode: String, userName: String, promise: Promise
            ->
            ThingHomeSdk.getUserInstance()
                    .touristRegisterAndLogin(
                            countryCode,
                            userName,
                            object : IRegisterCallback {
                                override fun onSuccess(user: User?) {
                                    promise.resolve(null)
                                }

                                override fun onError(code: String?, error: String?) {
                                    promise.reject(
                                            "ERR_REGISTER_ANONYMOUS",
                                            error ?: "Failed to register anonymous account",
                                            null
                                    )
                                }
                            }
                    )
        }

        // ─── Delete anonymous account ───────────────────────────────────────

        AsyncFunction("deleteAnonymousAccount") { promise: Promise ->
            ThingHomeSdk.getUserInstance()
                    .touristLogOut(
                            object : ILogoutCallback {
                                override fun onSuccess() {
                                    promise.resolve(null)
                                }

                                override fun onError(code: String?, error: String?) {
                                    promise.reject(
                                            "ERR_DELETE_ANONYMOUS",
                                            error ?: "Failed to delete anonymous account",
                                            null
                                    )
                                }
                            }
                    )
        }

        // ─── Bind username to anonymous account ─────────────────────────────

        AsyncFunction("usernameBinding") {
                countryCode: String,
                userName: String,
                code: String,
                password: String,
                promise: Promise ->
            ThingHomeSdk.getUserInstance()
                    .touristBindWithUserName(
                            countryCode,
                            userName,
                            code,
                            password,
                            object : IBooleanCallback {
                                override fun onSuccess() {
                                    promise.resolve(null)
                                }

                                override fun onError(code: String?, error: String?) {
                                    promise.reject(
                                            "ERR_USERNAME_BINDING",
                                            error ?: "Failed to bind username",
                                            null
                                    )
                                }
                            }
                    )
        }

        // ─── Set temperature unit ───────────────────────────────────────────

        AsyncFunction("updateTempUnit") { tempUnit: Int, promise: Promise ->
            val unit = if (tempUnit == 1) TempUnitEnum.Celsius else TempUnitEnum.Fahrenheit
            ThingHomeSdk.getUserInstance()
                    .setTempUnit(
                            unit,
                            object : IResultCallback {
                                override fun onError(code: String?, error: String?) {
                                    promise.reject(
                                            "ERR_UPDATE_TEMP_UNIT",
                                            error ?: "Failed to update temperature unit",
                                            null
                                    )
                                }

                                override fun onSuccess() {
                                    promise.resolve(null)
                                }
                            }
                    )
        }

        // ─── Update nickname ────────────────────────────────────────────────

        AsyncFunction("updateNickname") { nickname: String, promise: Promise ->
            ThingHomeSdk.getUserInstance()
                    .updateNickName(
                            nickname,
                            object : IReNickNameCallback {
                                override fun onSuccess() {
                                    promise.resolve(null)
                                }

                                override fun onError(code: String?, error: String?) {
                                    promise.reject(
                                            "ERR_UPDATE_NICKNAME",
                                            error ?: "Failed to update nickname",
                                            null
                                    )
                                }
                            }
                    )
        }

        // ─── Update time zone ───────────────────────────────────────────────

        AsyncFunction("updateTimeZone") { timeZoneId: String, promise: Promise ->
            ThingHomeSdk.getUserInstance()
                    .updateTimeZone(
                            timeZoneId,
                            object : IResultCallback {
                                override fun onError(code: String?, error: String?) {
                                    promise.reject(
                                            "ERR_UPDATE_TIMEZONE",
                                            error ?: "Failed to update time zone",
                                            null
                                    )
                                }

                                override fun onSuccess() {
                                    promise.resolve(null)
                                }
                            }
                    )
        }

        // ─── Update location ────────────────────────────────────────────────

        Function("updateLocation") { latitude: Double, longitude: Double ->
            ThingSdk.setLatAndLong(latitude.toString(), longitude.toString())
        }

        // ─── Change bound account ───────────────────────────────────────────

        AsyncFunction("changeBindAccount") {
                account: String,
                countryCode: String,
                code: String,
                promise: Promise ->
            val sId = ThingHomeSdk.getUserInstance().getUser()?.getSid() ?: ""
            ThingHomeSdk.getUserInstance()
                    .changeUserName(
                            countryCode,
                            code,
                            sId,
                            account,
                            object : IResultCallback {
                                override fun onError(code: String?, error: String?) {
                                    promise.reject(
                                            "ERR_CHANGE_BIND_ACCOUNT",
                                            error ?: "Failed to change bound account",
                                            null
                                    )
                                }

                                override fun onSuccess() {
                                    promise.resolve(null)
                                }
                            }
                    )
        }

        // ─── Logout ─────────────────────────────────────────────────────────

        AsyncFunction("logout") { promise: Promise ->
            ThingHomeSdk.getUserInstance()
                    .logout(
                            object : ILogoutCallback {
                                override fun onSuccess() {
                                    promise.resolve(null)
                                }

                                override fun onError(code: String?, error: String?) {
                                    promise.reject("ERR_LOGOUT", error ?: "Failed to logout", null)
                                }
                            }
                    )
        }

        // ─── Cancel (delete) account ────────────────────────────────────────

        AsyncFunction("cancelAccount") { promise: Promise ->
            ThingHomeSdk.getUserInstance()
                    .cancelAccount(
                            object : IResultCallback {
                                override fun onError(code: String?, error: String?) {
                                    promise.reject(
                                            "ERR_CANCEL_ACCOUNT",
                                            error ?: "Failed to cancel account",
                                            null
                                    )
                                }

                                override fun onSuccess() {
                                    promise.resolve(null)
                                }
                            }
                    )
        }
    }
}
