import ExpoModulesCore
import ThingSmartBusinessExtensionKit

public class DeviceManagementModule: Module {

    public func definition() -> ModuleDefinition {
        Name("ExpoTuyaDeviceManagement")

        // ─── Sharer APIs ─────────────────────────────────────────────────────

        AsyncFunction("supportShare") { (resId: String, resType: Int32, promise: Promise) in
            ThingDeviceShareManager.supportShare(
                resId,
                resType: ThingShareResType(rawValue: Int(resType)) ?? .device,
                success: { promise.resolve($0) },
                failure: { promise.reject($0) }
            )
        }

        AsyncFunction("remainingShareTimes") { (resId: String, resType: Int32, promise: Promise) in
            ThingDeviceShareManager.remainingShareTimes(
                resId,
                resType: ThingShareResType(rawValue: Int(resType)) ?? .device,
                success: { promise.resolve(Int($0)) },
                failure: { promise.reject($0) }
            )
        }

        AsyncFunction("share") { (resId: String, resType: Int32, spaceId: Int64, userAccount: String, promise: Promise) in
            ThingDeviceShareManager.share(
                resId,
                resType: ThingShareResType(rawValue: Int(resType)) ?? .device,
                spaceId: spaceId,
                userAccount: userAccount,
                success: { result in
                    promise.resolve([
                        "memberId": result.memberId,
                        "nickName": result.nickName,
                        "userName": result.userName,
                    ])
                },
                failure: { promise.reject($0) }
            )
        }

        AsyncFunction("removeReceiver") { (memberId: Int, resId: String, resType: Int32, promise: Promise) in
            ThingDeviceShareManager.removeReceiver(
                memberId,
                resId: resId,
                resType: ThingShareResType(rawValue: Int(resType)) ?? .device,
                success: { promise.resolve(nil) },
                failure: { promise.reject($0) }
            )
        }

        AsyncFunction("receivers") { (resId: String, resType: Int32, page: Int32, pageSize: Int32, promise: Promise) in
            ThingDeviceShareManager.receivers(
                resId,
                resType: ThingShareResType(rawValue: Int(resType)) ?? .device,
                page: page,
                pageSize: pageSize,
                success: { members in
                    promise.resolve((members ?? []).map { self.shareMemberToDict($0) })
                },
                failure: { promise.reject($0) }
            )
        }

        AsyncFunction("updateShareExpirationDate") { (memberId: Int, resId: String, resType: Int32, mode: Int32, endTime: Int64, promise: Promise) in
            ThingDeviceShareManager.updateShareExpirationDate(
                memberId,
                resId: resId,
                resType: ThingShareResType(rawValue: Int(resType)) ?? .device,
                mode: ThingShareValidationType(rawValue: Int(mode)) ?? .forever,
                endTime: endTime,
                success: { promise.resolve(nil) },
                failure: { promise.reject($0) }
            )
        }

        AsyncFunction("relationMembers") { (promise: Promise) in
            ThingDeviceShareManager.relationMembers(
                { members in
                    promise.resolve((members ?? []).map { self.shareMemberToDict($0) })
                },
                failure: { promise.reject($0) }
            )
        }

        AsyncFunction("removeRelationMember") { (uid: String, promise: Promise) in
            ThingDeviceShareManager.removeRelationMember(
                uid,
                success: { promise.resolve(nil) },
                failure: { promise.reject($0) }
            )
        }

        AsyncFunction("createShareInfo") { (resId: String, resType: Int32, spaceId: Int64, shareType: Int32, shareCount: Int32, promise: Promise) in
            ThingDeviceShareManager.createShareInfo(
                resId,
                resType: ThingShareResType(rawValue: Int(resType)) ?? .device,
                spaceId: spaceId,
                shareType: ThingDeviceShareType(rawValue: Int(shareType)) ?? .account,
                shareCount: shareCount,
                success: { info in
                    promise.resolve([
                        "content": info.content,
                        "code": info.code,
                        "shortUrl": info.shortUrl,
                    ])
                },
                failure: { promise.reject($0) }
            )
        }

        // ─── Receiver APIs ───────────────────────────────────────────────────

        AsyncFunction("validateShareCode") { (code: String, promise: Promise) in
            ThingDeviceShareManager.validate(
                code,
                success: { promise.resolve($0) },
                failure: { promise.reject($0) }
            )
        }

        AsyncFunction("shareCodeInfo") { (code: String, promise: Promise) in
            ThingDeviceShareManager.shareCodeInfo(
                code,
                success: { info in
                    promise.resolve([
                        "appId": info.appId,
                        "resId": info.resId,
                        "resType": info.resType.rawValue,
                        "resIcon": info.resIcon,
                        "resName": info.resName,
                        "nickName": info.nickName,
                        "shareSource": info.shareSource.rawValue,
                        "groupId": info.groupId,
                    ])
                },
                failure: { promise.reject($0) }
            )
        }

        AsyncFunction("acceptShare") { (code: String, promise: Promise) in
            ThingDeviceShareManager.accept(
                code,
                success: { promise.resolve(nil) },
                failure: { promise.reject($0) }
            )
        }

        AsyncFunction("removeShare") { (resId: String, resType: Int32, promise: Promise) in
            ThingDeviceShareManager.removeShare(
                resId,
                resType: ThingShareResType(rawValue: Int(resType)) ?? .device,
                success: { promise.resolve(nil) },
                failure: { promise.reject($0) }
            )
        }

        AsyncFunction("sharers") { (promise: Promise) in
            ThingDeviceShareManager.sharers(
                { sharers in
                    let result = (sharers ?? []).map { s -> [String: Any] in
                        ["memberId": s.memberId, "nickName": s.nickName, "userName": s.userName]
                    }
                    promise.resolve(result)
                },
                failure: { promise.reject($0) }
            )
        }

        AsyncFunction("sharerName") { (resId: String, resType: Int32, promise: Promise) in
            ThingDeviceShareManager.sharerName(
                resId,
                resType: ThingShareResType(rawValue: Int(resType)) ?? .device,
                success: { promise.resolve($0) },
                failure: { promise.reject($0) }
            )
        }

        AsyncFunction("sharerDetail") { (memberId: Int, promise: Promise) in
            ThingDeviceShareManager.sharerDetail(
                memberId,
                success: { detail in
                    let devices = detail.devices.map { d -> [String: Any] in
                        ["devId": d.devId, "name": d.name, "iconUrl": d.iconUrl]
                    }
                    promise.resolve([
                        "devices": devices,
                        "mobile": detail.mobile,
                        "name": detail.name,
                        "remarkName": detail.remarkName,
                    ])
                },
                failure: { promise.reject($0) }
            )
        }

        AsyncFunction("removeSharer") { (memberId: Int, promise: Promise) in
            ThingDeviceShareManager.removeSharer(
                memberId,
                success: { promise.resolve(nil) },
                failure: { promise.reject($0) }
            )
        }

        AsyncFunction("updateSharer") { (memberId: Int, name: String, promise: Promise) in
            ThingDeviceShareManager.updateSharer(
                memberId,
                name: name,
                success: { promise.resolve(nil) },
                failure: { promise.reject($0) }
            )
        }
    }

    // MARK: - Helpers

    private func shareMemberToDict(_ m: ThingSmartShareMemberModel) -> [String: Any] {
        return [
            "memberId": m.memberId,
            "nickName": m.nickName,
            "userName": m.userName,
            "iconUrl": m.iconUrl,
            "shareMode": m.shareMode.rawValue,
            "endTime": m.endTime,
            "uid": m.uid,
        ]
    }

    private func makeError(_ message: String) -> NSError {
        return NSError(
            domain: "ExpoTuyaDeviceManagement",
            code: -1,
            userInfo: [NSLocalizedDescriptionKey: message]
        )
    }
}
