import ExpoModulesCore
import ThingSmartBaseKit

public class UserAccountModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoTuyaUserAccount")

    Events("onSessionInvalid")

    // MARK: - Query areas for verification code service

    AsyncFunction("getWhiteListWhoCanSendMobileCode") { (promise: Promise) in
      ThingSmartUser.sharedInstance().getWhiteListWhoCanSendMobileCodeSuccess({ regions in
        promise.resolve(regions ?? "")
      }, failure: { error in
        promise.reject(error ?? NSError(domain: "ExpoTuyaUserAccount", code: -1, userInfo: [NSLocalizedDescriptionKey: "Failed to get whitelist regions"]))
      })
    }

    // MARK: - Send verification code

    AsyncFunction("sendVerifyCode") { (userName: String, region: String, countryCode: String, type: Int, promise: Promise) in
      ThingSmartUser.sharedInstance().sendVerifyCode(
        withUserName: userName,
        region: region,
        countryCode: countryCode,
        type: type,
        success: {
          promise.resolve(nil)
        },
        failure: { error in
          promise.reject(error ?? NSError(domain: "ExpoTuyaUserAccount", code: -1, userInfo: [NSLocalizedDescriptionKey: "Failed to send verification code"]))
        }
      )
    }

    // MARK: - Verify verification code

    AsyncFunction("checkVerifyCode") { (userName: String, region: String, countryCode: String, code: String, type: Int, promise: Promise) in
      ThingSmartUser.sharedInstance().checkCode(
        withUserName: userName,
        region: region.isEmpty ? nil : region,
        countryCode: countryCode,
        code: code,
        type: type,
        success: { result in
          promise.resolve(result)
        },
        failure: { error in
          promise.reject(error ?? NSError(domain: "ExpoTuyaUserAccount", code: -1, userInfo: [NSLocalizedDescriptionKey: "Failed to verify code"]))
        }
      )
    }

    // MARK: - Register with phone

    AsyncFunction("registerWithPhone") { (countryCode: String, phoneNumber: String, password: String, code: String, promise: Promise) in
      ThingSmartUser.sharedInstance().register(
        byPhone: countryCode,
        phoneNumber: phoneNumber,
        password: password,
        code: code,
        success: {
          promise.resolve(nil)
        },
        failure: { error in
          promise.reject(error ?? NSError(domain: "ExpoTuyaUserAccount", code: -1, userInfo: [NSLocalizedDescriptionKey: "Failed to register"]))
        }
      )
    }

    // MARK: - Login with phone and password

    AsyncFunction("loginWithPhone") { (countryCode: String, phoneNumber: String, password: String, promise: Promise) in
      ThingSmartUser.sharedInstance().login(
        byPhone: countryCode,
        phoneNumber: phoneNumber,
        password: password,
        success: {
          promise.resolve(nil)
        },
        failure: { error in
          promise.reject(error ?? NSError(domain: "ExpoTuyaUserAccount", code: -1, userInfo: [NSLocalizedDescriptionKey: "Failed to login"]))
        }
      )
    }

    // MARK: - Login with phone and verification code

    AsyncFunction("loginWithPhoneCode") { (phoneNumber: String, countryCode: String, code: String, promise: Promise) in
      ThingSmartUser.sharedInstance().login(
        withMobile: phoneNumber,
        countryCode: countryCode,
        code: code,
        success: {
          promise.resolve(nil)
        },
        failure: { error in
          promise.reject(error ?? NSError(domain: "ExpoTuyaUserAccount", code: -1, userInfo: [NSLocalizedDescriptionKey: "Failed to login with code"]))
        }
      )
    }

    // MARK: - Reset password

    AsyncFunction("resetPasswordWithPhone") { (countryCode: String, phoneNumber: String, newPassword: String, code: String, promise: Promise) in
      ThingSmartUser.sharedInstance().resetPassword(
        byPhone: countryCode,
        phoneNumber: phoneNumber,
        newPassword: newPassword,
        code: code,
        success: {
          promise.resolve(nil)
        },
        failure: { error in
          promise.reject(error ?? NSError(domain: "ExpoTuyaUserAccount", code: -1, userInfo: [NSLocalizedDescriptionKey: "Failed to reset password"]))
        }
      )
    }

    // MARK: - Send binding verification code for email

    AsyncFunction("sendBindingVerificationCodeWithEmail") { (email: String, countryCode: String, promise: Promise) in
      ThingSmartUser.sharedInstance().sendBindingVerificationCode(
        withEmail: email,
        countryCode: countryCode,
        success: {
          promise.resolve(nil)
        },
        failure: { error in
          promise.reject(error ?? NSError(domain: "ExpoTuyaUserAccount", code: -1, userInfo: [NSLocalizedDescriptionKey: "Failed to send binding verification code"]))
        }
      )
    }

    // MARK: - Bind email

    AsyncFunction("bindEmail") { (email: String, countryCode: String, code: String, sId: String, promise: Promise) in
      ThingSmartUser.sharedInstance().bindEmail(
        email,
        withCountryCode: countryCode,
        code: code,
        sId: sId,
        success: {
          promise.resolve(nil)
        },
        failure: { error in
          promise.reject(error ?? NSError(domain: "ExpoTuyaUserAccount", code: -1, userInfo: [NSLocalizedDescriptionKey: "Failed to bind email"]))
        }
      )
    }

    // MARK: - Register with email

    AsyncFunction("registerWithEmail") { (countryCode: String, email: String, password: String, code: String, promise: Promise) in
      ThingSmartUser.sharedInstance().register(
        byEmail: countryCode,
        email: email,
        password: password,
        code: code,
        success: {
          promise.resolve(nil)
        },
        failure: { error in
          promise.reject(error ?? NSError(domain: "ExpoTuyaUserAccount", code: -1, userInfo: [NSLocalizedDescriptionKey: "Failed to register with email"]))
        }
      )
    }

    // MARK: - Login with email and password

    AsyncFunction("loginWithEmail") { (countryCode: String, email: String, password: String, promise: Promise) in
      ThingSmartUser.sharedInstance().login(
        byEmail: countryCode,
        email: email,
        password: password,
        success: {
          promise.resolve(nil)
        },
        failure: { error in
          promise.reject(error ?? NSError(domain: "ExpoTuyaUserAccount", code: -1, userInfo: [NSLocalizedDescriptionKey: "Failed to login with email"]))
        }
      )
    }

    // MARK: - Login with email and verification code

    AsyncFunction("loginWithEmailCode") { (email: String, countryCode: String, code: String, promise: Promise) in
      ThingSmartUser.sharedInstance().login(
        withEmail: email,
        countryCode: countryCode,
        code: code,
        success: {
          promise.resolve(nil)
        },
        failure: { error in
          promise.reject(error ?? NSError(domain: "ExpoTuyaUserAccount", code: -1, userInfo: [NSLocalizedDescriptionKey: "Failed to login with email code"]))
        }
      )
    }

    // MARK: - Reset password with email

    AsyncFunction("resetPasswordWithEmail") { (countryCode: String, email: String, newPassword: String, code: String, promise: Promise) in
      ThingSmartUser.sharedInstance().resetPassword(
        byEmail: countryCode,
        email: email,
        newPassword: newPassword,
        code: code,
        success: {
          promise.resolve(nil)
        },
        failure: { error in
          promise.reject(error ?? NSError(domain: "ExpoTuyaUserAccount", code: -1, userInfo: [NSLocalizedDescriptionKey: "Failed to reset password with email"]))
        }
      )
    }

    // MARK: - Send binding verification code for phone

    AsyncFunction("sendBindVerifyCodeWithPhone") { (countryCode: String, phoneNumber: String, promise: Promise) in
      ThingSmartUser.sharedInstance().sendBindVerifyCode(
        countryCode,
        phoneNumber: phoneNumber,
        success: {
          promise.resolve(nil)
        },
        failure: { error in
          promise.reject(error ?? NSError(domain: "ExpoTuyaUserAccount", code: -1, userInfo: [NSLocalizedDescriptionKey: "Failed to send phone binding verification code"]))
        }
      )
    }

    // MARK: - Bind phone number

    AsyncFunction("bindPhone") { (countryCode: String, phoneNumber: String, code: String, promise: Promise) in
      ThingSmartUser.sharedInstance().mobileBinding(
        countryCode,
        phoneNumber: phoneNumber,
        code: code,
        success: {
          promise.resolve(nil)
        },
        failure: { error in
          promise.reject(error ?? NSError(domain: "ExpoTuyaUserAccount", code: -1, userInfo: [NSLocalizedDescriptionKey: "Failed to bind phone number"]))
        }
      )
    }

    // MARK: - Login or register with UID

    AsyncFunction("loginOrRegisterWithUid") { (countryCode: String, uid: String, password: String, createHome: Bool, promise: Promise) in
      ThingSmartUser.sharedInstance().loginOrRegister(
        withCountryCode: countryCode,
        uid: uid,
        password: password,
        createHome: createHome,
        success: { result in
          promise.resolve(result)
        },
        failure: { error in
          promise.reject(error ?? NSError(domain: "ExpoTuyaUserAccount", code: -1, userInfo: [NSLocalizedDescriptionKey: "Failed to login or register with UID"]))
        }
      )
    }

    // MARK: - Login with Facebook

    AsyncFunction("loginWithFacebook") { (countryCode: String, token: String, promise: Promise) in
      ThingSmartUser.sharedInstance().login(
        byFacebook: countryCode,
        token: token,
        success: {
          promise.resolve(nil)
        },
        failure: { error in
          promise.reject(error ?? NSError(domain: "ExpoTuyaUserAccount", code: -1, userInfo: [NSLocalizedDescriptionKey: "Failed to login with Facebook"]))
        }
      )
    }

    // MARK: - Login with Twitter

    AsyncFunction("loginWithTwitter") { (countryCode: String, key: String, secret: String, promise: Promise) in
      ThingSmartUser.sharedInstance().login(
        byTwitter: countryCode,
        key: key,
        secret: secret,
        success: {
          promise.resolve(nil)
        },
        failure: { error in
          promise.reject(error ?? NSError(domain: "ExpoTuyaUserAccount", code: -1, userInfo: [NSLocalizedDescriptionKey: "Failed to login with Twitter"]))
        }
      )
    }

    // MARK: - Login with OAuth 2.0

    AsyncFunction("loginWithAuth2") { (type: String, countryCode: String, accessToken: String, extraInfo: [String: Any], promise: Promise) in
      ThingSmartUser.sharedInstance().loginByAuth2(
        withType: type,
        countryCode: countryCode,
        accessToken: accessToken,
        extraInfo: extraInfo,
        success: {
          promise.resolve(nil)
        },
        failure: { error in
          promise.reject(error ?? NSError(domain: "ExpoTuyaUserAccount", code: -1, userInfo: [NSLocalizedDescriptionKey: "Failed to login with OAuth 2.0"]))
        }
      )
    }

    // MARK: - Login with WeChat

    AsyncFunction("loginWithWechat") { (countryCode: String, code: String, promise: Promise) in
      ThingSmartUser.sharedInstance().login(
        byWechat: countryCode,
        code: code,
        success: {
          promise.resolve(nil)
        },
        failure: { error in
          promise.reject(error ?? NSError(domain: "ExpoTuyaUserAccount", code: -1, userInfo: [NSLocalizedDescriptionKey: "Failed to login with WeChat"]))
        }
      )
    }

    // MARK: - Login with QQ

    AsyncFunction("loginWithQQ") { (countryCode: String, userId: String, accessToken: String, promise: Promise) in
      ThingSmartUser.sharedInstance().login(
        byQQ: countryCode,
        userId: userId,
        accessToken: accessToken,
        success: {
          promise.resolve(nil)
        },
        failure: { error in
          promise.reject(error ?? NSError(domain: "ExpoTuyaUserAccount", code: -1, userInfo: [NSLocalizedDescriptionKey: "Failed to login with QQ"]))
        }
      )
    }

    // MARK: - Register anonymous account

    AsyncFunction("registerAnonymous") { (countryCode: String, userName: String, promise: Promise) in
      ThingSmartUser.sharedInstance().registerAnonymous(
        withCountryCode: countryCode,
        userName: userName,
        success: {
          promise.resolve(nil)
        },
        failure: { error in
          promise.reject(error ?? NSError(domain: "ExpoTuyaUserAccount", code: -1, userInfo: [NSLocalizedDescriptionKey: "Failed to register anonymous account"]))
        }
      )
    }

    // MARK: - Delete anonymous account

    AsyncFunction("deleteAnonymousAccount") { (promise: Promise) in
      ThingSmartUser.sharedInstance().deleteAnonymousAccount(success: {
        promise.resolve(nil)
      }, failure: { error in
        promise.reject(error ?? NSError(domain: "ExpoTuyaUserAccount", code: -1, userInfo: [NSLocalizedDescriptionKey: "Failed to delete anonymous account"]))
      })
    }

    // MARK: - Bind username to anonymous account

    AsyncFunction("usernameBinding") { (countryCode: String, userName: String, code: String, password: String, promise: Promise) in
      ThingSmartUser.sharedInstance().usernameBinding(
        withCountryCode: countryCode,
        userName: userName,
        code: code,
        password: password,
        success: {
          promise.resolve(nil)
        },
        failure: { error in
          promise.reject(error ?? NSError(domain: "ExpoTuyaUserAccount", code: -1, userInfo: [NSLocalizedDescriptionKey: "Failed to bind username"]))
        }
      )
    }

    // MARK: - Set temperature unit

    AsyncFunction("updateTempUnit") { (tempUnit: Int, promise: Promise) in
      ThingSmartUser.sharedInstance().updateTempUnit(withTempUnit: tempUnit, success: {
        promise.resolve(nil)
      }, failure: { error in
        promise.reject(error ?? NSError(domain: "ExpoTuyaUserAccount", code: -1, userInfo: [NSLocalizedDescriptionKey: "Failed to update temperature unit"]))
      })
    }

    // MARK: - Update nickname

    AsyncFunction("updateNickname") { (nickname: String, promise: Promise) in
      ThingSmartUser.sharedInstance().updateNickname(nickname, success: {
        promise.resolve(nil)
      }, failure: { error in
        promise.reject(error ?? NSError(domain: "ExpoTuyaUserAccount", code: -1, userInfo: [NSLocalizedDescriptionKey: "Failed to update nickname"]))
      })
    }

    // MARK: - Update time zone

    AsyncFunction("updateTimeZone") { (timeZoneId: String, promise: Promise) in
      ThingSmartUser.sharedInstance().updateTimeZone(withTimeZoneId: timeZoneId, success: {
        promise.resolve(nil)
      }, failure: { error in
        promise.reject(error ?? NSError(domain: "ExpoTuyaUserAccount", code: -1, userInfo: [NSLocalizedDescriptionKey: "Failed to update time zone"]))
      })
    }

    // MARK: - Update location

    Function("updateLocation") { (latitude: Double, longitude: Double) in
      ThingSmartSDK.sharedInstance().updateLatitude(latitude, longitude: longitude)
    }

    // MARK: - Change bound account

    AsyncFunction("changeBindAccount") { (account: String, countryCode: String, code: String, promise: Promise) in
      ThingSmartUser.sharedInstance().changBindAccount(
        account,
        countryCode: countryCode,
        code: code,
        success: {
          promise.resolve(nil)
        },
        failure: { error in
          promise.reject(error ?? NSError(domain: "ExpoTuyaUserAccount", code: -1, userInfo: [NSLocalizedDescriptionKey: "Failed to change bound account"]))
        }
      )
    }

    // MARK: - Logout

    AsyncFunction("logout") { (promise: Promise) in
      ThingSmartUser.sharedInstance().loginOut({
        promise.resolve(nil)
      }, failure: { error in
        promise.reject(error ?? NSError(domain: "ExpoTuyaUserAccount", code: -1, userInfo: [NSLocalizedDescriptionKey: "Failed to logout"]))
      })
    }

    // MARK: - Cancel (delete) account

    AsyncFunction("cancelAccount") { (promise: Promise) in
      ThingSmartUser.sharedInstance().cancelAccount({
        promise.resolve(nil)
      }, failure: { error in
        promise.reject(error ?? NSError(domain: "ExpoTuyaUserAccount", code: -1, userInfo: [NSLocalizedDescriptionKey: "Failed to cancel account"]))
      })
    }

    // MARK: - Session expiration listener

    OnStartObserving {
      self.sessionObserver = NotificationCenter.default.addObserver(
        forName: NSNotification.Name(rawValue: "ThingSmartUserNotificationUserSessionInvalid"),
        object: nil,
        queue: .main
      ) { [weak self] _ in
        self?.sendEvent("onSessionInvalid")
      }
    }

    OnStopObserving {
      if let observer = self.sessionObserver {
        NotificationCenter.default.removeObserver(observer)
        self.sessionObserver = nil
      }
    }
  }

  private var sessionObserver: NSObjectProtocol?
}
