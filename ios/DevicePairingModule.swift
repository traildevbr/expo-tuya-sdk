import ExpoModulesCore
import ThingSmartActivatorCoreKit
import ThingSmartBusinessExtensionKit
import ThingSmartDeviceCoreKit

// MARK: - Delegate Proxy

private class ActivatorSearchDelegateProxy: NSObject, ThingSmartActivatorSearchDelegate {
    weak var module: DevicePairingModule?

    init(module: DevicePairingModule) {
        self.module = module
    }

    // MARK: @required — device found or error
    func activatorService(
        _ service: ThingSmartActivatorSearchProtocol,
        activatorType type: ThingSmartActivatorTypeModel,
        didFindDevice device: ThingSmartActivatorDeviceModel?,
        error errorModel: ThingSmartActivatorErrorModel?
    ) {
        guard let module = module else { return }

        if let errorModel = errorModel {
            let err = errorModel.error as NSError
            module.sendEvent("onPairingError", [
                "errorCode": String(err.code),
                "errorMsg": err.localizedDescription,
            ])
            module.pairingPromise?.reject(err)
            module.pairingPromise = nil
            return
        }

        guard let device = device else { return }

        switch device.step.rawValue {
        case 1: // ThingActivatorStepFound
            module.sendEvent("onDeviceFound", ["devId": device.devId])
        case 2: // ThingActivatorStepRegisted
            module.sendEvent("onDeviceBind", ["devId": device.devId])
        case 3: // ThingActivatorStepIntialized — success
            module.sendEvent("onPairingSuccess", [
                "devId": device.devId,
                "name": device.name,
                "productId": device.productId ?? "",
                "uuid": "",
                "isOnline": true,
            ])
            module.pairingPromise?.resolve(nil)
            module.pairingPromise = nil
        default:
            break
        }
    }

    // MARK: @optional — device info updated
    func activatorService(
        _ service: ThingSmartActivatorSearchProtocol,
        activatorType type: ThingSmartActivatorTypeModel,
        didUpdateDevice device: ThingSmartActivatorDeviceModel
    ) {
        guard let module = module else { return }

        if device.step.rawValue == 3 { // ThingActivatorStepIntialized
            module.sendEvent("onPairingSuccess", [
                "devId": device.devId,
                "name": device.name,
                "productId": device.productId ?? "",
                "uuid": "",
                "isOnline": true,
            ])
            module.pairingPromise?.resolve(nil)
            module.pairingPromise = nil
        }
    }
}

// MARK: - DevicePairingModule

public class DevicePairingModule: Module {
    private var discovery: ThingSmartActivatorDiscovery?
    private var delegateProxy: ActivatorSearchDelegateProxy?
    private var ezTypeModel: ThingSmartActivatorTypeEZModel?
    fileprivate var pairingPromise: Promise?

    public func definition() -> ModuleDefinition {
        Name("ExpoTuyaDevicePairing")

        Events(
            "onDeviceFound",
            "onDeviceBind",
            "onPairingSuccess",
            "onPairingError",
            "onPairingLimited"
        )

        // MARK: - Get Pairing Token

        AsyncFunction("getPairingToken") { (homeId: Int64, promise: Promise) in
            let activator = ThingSmartActivator()
            activator.getTokenWithHomeId(homeId, success: { token in
                promise.resolve(token)
            }, failure: { error in
                promise.reject(error ?? self.makeError("Failed to get pairing token"))
            })
        }

        // MARK: - EZ Scan (no-op on iOS — discovery is part of startEzPairing)

        AsyncFunction("startEzScan") { (_: String, _: String, _: String, _: Double, promise: Promise) in
            promise.resolve(nil)
        }

        AsyncFunction("stopEzScan") { (promise: Promise) in
            promise.resolve(nil)
        }

        // MARK: - EZ Pairing

        AsyncFunction("startEzPairing") { (ssid: String, password: String, token: String, timeoutSeconds: Double, promise: Promise) in
            // Stop any previous session
            if let prev = self.ezTypeModel {
                self.discovery?.stopSearch([prev], clearCache: true)
            }

            // Build the EZ type model
            let ezType = ThingSmartActivatorTypeEZModel()
            ezType.type = .ezSearch
            ezType.typeName = NSStringFromThingSmartActivatorType(.ezSearch)
            ezType.ssid = ssid
            ezType.password = password
            ezType.token = token
            ezType.timeout = timeoutSeconds
            self.ezTypeModel = ezType

            // Set up discovery
            let proxy = ActivatorSearchDelegateProxy(module: self)
            self.delegateProxy = proxy

            let disc = ThingSmartActivatorDiscovery()
            disc.register(withActivatorList: [ezType])
            disc.setupDelegate(proxy)
            disc.loadConfig()
            self.discovery = disc
            self.pairingPromise = promise

            disc.startSearch([ezType])
        }

        AsyncFunction("stopEzPairing") { (promise: Promise) in
            if let ezType = self.ezTypeModel {
                self.discovery?.stopSearch([ezType], clearCache: true)
            }
            self.discovery?.setupDelegate(nil)
            self.discovery = nil
            self.ezTypeModel = nil
            self.delegateProxy = nil
            self.pairingPromise?.resolve(nil)
            self.pairingPromise = nil
            promise.resolve(nil)
        }
    }

    // MARK: - Helpers

    private func makeError(_ message: String) -> NSError {
        return NSError(
            domain: "ExpoTuyaDevicePairing",
            code: -1,
            userInfo: [NSLocalizedDescriptionKey: message]
        )
    }
}
