import ExpoModulesCore
import ThingSmartDeviceKit

public class HomeManagementModule: Module {
  private var homeManager: ThingSmartHomeManager?
  private var homeInstances: [Int64: ThingSmartHome] = [:]

  public func definition() -> ModuleDefinition {
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

    // MARK: - Create a home

    AsyncFunction("createHome") { (name: String, lon: Double, lat: Double, geoName: String, rooms: [String], promise: Promise) in
      self.getHomeManager().addHome(
        withName: name,
        geoName: geoName,
        rooms: rooms,
        latitude: lat,
        longitude: lon,
        success: { homeId in
          promise.resolve(homeId)
        },
        failure: { error in
          promise.reject(error ?? self.makeError("Failed to create home"))
        }
      )
    }

    // MARK: - Query home list

    AsyncFunction("queryHomeList") { (promise: Promise) in
      self.getHomeManager().getHomeList(success: { homes in
        let result = homes?.map { self.homeModelToDict($0) } ?? []
        promise.resolve(result)
      }, failure: { error in
        promise.reject(error ?? self.makeError("Failed to query home list"))
      })
    }

    // MARK: - Get home detail

    AsyncFunction("getHomeDetail") { (homeId: Int64, promise: Promise) in
      let home = self.getHomeInstance(homeId)
      home.getHomeData(success: { homeModel in
        promise.resolve(self.homeModelToDict(homeModel))
      }, failure: { error in
        promise.reject(error ?? self.makeError("Failed to get home detail"))
      })
    }

    // MARK: - Get home local cache

    AsyncFunction("getHomeLocalCache") { (homeId: Int64, promise: Promise) in
      let home = self.getHomeInstance(homeId)
      home.getHomeLocalCache(success: { homeModel in
        promise.resolve(self.homeModelToDict(homeModel))
      }, failure: { error in
        promise.reject(error ?? self.makeError("Failed to get home cache"))
      })
    }

    // MARK: - Update home

    AsyncFunction("updateHome") { (homeId: Int64, name: String, lon: Double, lat: Double, geoName: String, rooms: [String], promise: Promise) in
      let home = self.getHomeInstance(homeId)
      home.updateHomeInfo(
        withName: name,
        geoName: geoName,
        latitude: lat,
        longitude: lon,
        success: {
          promise.resolve(nil)
        },
        failure: { error in
          promise.reject(error ?? self.makeError("Failed to update home"))
        }
      )
    }

    // MARK: - Dismiss home

    AsyncFunction("dismissHome") { (homeId: Int64, promise: Promise) in
      let home = self.getHomeInstance(homeId)
      home.dismissHome(success: {
        self.homeInstances.removeValue(forKey: homeId)
        promise.resolve(nil)
      }, failure: { error in
        promise.reject(error ?? self.makeError("Failed to dismiss home"))
      })
    }

    // MARK: - Weather sketch

    AsyncFunction("getHomeWeatherSketch") { (homeId: Int64, promise: Promise) in
      let home = self.getHomeInstance(homeId)
      home.getHomeWeatherSketch(success: { sketch in
        promise.resolve([
          "condition": sketch?.condition ?? "",
          "temp": sketch?.temp ?? "",
          "iconUrl": sketch?.iconUrl ?? "",
          "inIconUrl": sketch?.inIconUrl ?? "",
        ])
      }, failure: { error in
        promise.reject(error ?? self.makeError("Failed to get weather sketch"))
      })
    }

    // MARK: - Weather detail

    AsyncFunction("getHomeWeatherDetail") { (homeId: Int64, limit: Int, units: [String: Any], promise: Promise) in
      let home = self.getHomeInstance(homeId)
      let optionModel = ThingSmartWeatherOptionModel()
      if let tempUnit = units["tempUnit"] as? Int {
        optionModel.temperatureUnit = ThingSmartTemperatureUnit(rawValue: tempUnit) ?? .celsius
      }
      if let pressureUnit = units["pressureUnit"] as? Int {
        optionModel.pressureUnit = ThingSmartPressureUnit(rawValue: pressureUnit) ?? .hPa
      }
      if let windspeedUnit = units["windspeedUnit"] as? Int {
        optionModel.windspeedUnit = ThingSmartWindspeedUnit(rawValue: windspeedUnit) ?? .mPerSec
      }
      optionModel.limit = limit

      home.getHomeWeatherDetail(with: optionModel, success: { models in
        let result = models?.map { model -> [String: Any] in
          return [
            "icon": model.icon ?? "",
            "name": model.name ?? "",
            "unit": model.unit ?? "",
            "value": model.value ?? "",
          ]
        } ?? []
        promise.resolve(result)
      }, failure: { error in
        promise.reject(error ?? self.makeError("Failed to get weather detail"))
      })
    }

    // MARK: - Sort devices/groups

    AsyncFunction("sortDeviceOrGroup") { (homeId: Int64, orderList: [[String: String]], promise: Promise) in
      let home = self.getHomeInstance(homeId)
      let nsOrderList = orderList.map { item -> NSDictionary in
        return item as NSDictionary
      }
      home.sortDeviceOrGroup(withOrderList: nsOrderList, success: {
        promise.resolve(nil)
      }, failure: { error in
        promise.reject(error ?? self.makeError("Failed to sort devices/groups"))
      })
    }

    // MARK: - Add room

    AsyncFunction("addRoom") { (homeId: Int64, name: String, promise: Promise) in
      let home = self.getHomeInstance(homeId)
      home.addHomeRoom(withName: name, success: {
        // iOS doesn't return roomId directly from this callback, resolve nil
        promise.resolve(0)
      }, failure: { error in
        promise.reject(error ?? self.makeError("Failed to add room"))
      })
    }

    // MARK: - Remove room

    AsyncFunction("removeRoom") { (homeId: Int64, roomId: Int64, promise: Promise) in
      let home = self.getHomeInstance(homeId)
      home.removeHomeRoom(withRoomId: roomId, success: {
        promise.resolve(nil)
      }, failure: { error in
        promise.reject(error ?? self.makeError("Failed to remove room"))
      })
    }

    // MARK: - Sort rooms

    AsyncFunction("sortRoomList") { (homeId: Int64, roomIds: [Int64], promise: Promise) in
      let home = self.getHomeInstance(homeId)
      // Build ThingSmartRoomModel list from roomIds using home's roomList
      let roomModels = roomIds.compactMap { rid -> ThingSmartRoomModel? in
        return home.roomList?.first(where: { $0.roomId == rid })
      }
      home.sortRoomList(roomModels, success: {
        promise.resolve(nil)
      }, failure: { error in
        promise.reject(error ?? self.makeError("Failed to sort rooms"))
      })
    }

    // MARK: - Update room name

    AsyncFunction("updateRoomName") { (roomId: Int64, name: String, promise: Promise) in
      let room = ThingSmartRoom(roomId: roomId)
      room?.updateRoomName(name, success: {
        promise.resolve(nil)
      }, failure: { error in
        promise.reject(error ?? self.makeError("Failed to update room name"))
      })
    }

    // MARK: - Add device to room

    AsyncFunction("addDeviceToRoom") { (roomId: Int64, devId: String, promise: Promise) in
      let room = ThingSmartRoom(roomId: roomId)
      room?.addDevice(withDeviceId: devId, success: {
        promise.resolve(nil)
      }, failure: { error in
        promise.reject(error ?? self.makeError("Failed to add device to room"))
      })
    }

    // MARK: - Remove device from room

    AsyncFunction("removeDeviceFromRoom") { (roomId: Int64, devId: String, promise: Promise) in
      let room = ThingSmartRoom(roomId: roomId)
      room?.removeDevice(withDeviceId: devId, success: {
        promise.resolve(nil)
      }, failure: { error in
        promise.reject(error ?? self.makeError("Failed to remove device from room"))
      })
    }

    // MARK: - Add group to room

    AsyncFunction("addGroupToRoom") { (roomId: Int64, groupId: String, promise: Promise) in
      let room = ThingSmartRoom(roomId: roomId)
      room?.addGroup(withGroupId: groupId, success: {
        promise.resolve(nil)
      }, failure: { error in
        promise.reject(error ?? self.makeError("Failed to add group to room"))
      })
    }

    // MARK: - Remove group from room

    AsyncFunction("removeGroupFromRoom") { (roomId: Int64, groupId: String, promise: Promise) in
      let room = ThingSmartRoom(roomId: roomId)
      room?.removeGroup(withGroupId: groupId, success: {
        promise.resolve(nil)
      }, failure: { error in
        promise.reject(error ?? self.makeError("Failed to remove group from room"))
      })
    }

    // MARK: - Batch room relation

    AsyncFunction("saveBatchRoomRelation") { (roomId: Int64, deviceGroupIds: [String], promise: Promise) in
      let room = ThingSmartRoom(roomId: roomId)
      room?.saveBatchRoomRelation(withDeviceGroupList: deviceGroupIds, success: {
        promise.resolve(nil)
      }, failure: { error in
        promise.reject(error ?? self.makeError("Failed to save batch room relation"))
      })
    }

    // MARK: - Add member

    AsyncFunction("addMember") { (params: [String: Any], promise: Promise) in
      let homeId = params["homeId"] as? Int64 ?? 0
      let home = self.getHomeInstance(homeId)
      let requestModel = ThingSmartHomeAddMemberRequestModel()
      requestModel.name = params["nickName"] as? String ?? ""
      requestModel.account = params["account"] as? String ?? ""
      requestModel.countryCode = params["countryCode"] as? String ?? ""
      requestModel.role = ThingHomeRoleType(rawValue: params["role"] as? UInt ?? 0) ?? .member
      requestModel.autoAccept = params["autoAccept"] as? Bool ?? true

      home.addHomeMember(withAddMemeberRequestModel: requestModel, success: { dict in
        promise.resolve(dict ?? [:])
      }, failure: { error in
        promise.reject(error ?? self.makeError("Failed to add member"))
      })
    }

    // MARK: - Remove member

    AsyncFunction("removeMember") { (memberId: Int64, promise: Promise) in
      let member = ThingSmartHomeMember()
      member.removeHomeMember(withMemberId: memberId, success: {
        promise.resolve(nil)
      }, failure: { error in
        promise.reject(error ?? self.makeError("Failed to remove member"))
      })
    }

    // MARK: - Query member list

    AsyncFunction("queryMemberList") { (homeId: Int64, promise: Promise) in
      let home = self.getHomeInstance(homeId)
      home.getHomeMemberList(success: { members in
        let result = members?.map { m -> [String: Any] in
          return [
            "homeId": homeId,
            "memberId": m.memberId,
            "nickName": m.nickName ?? "",
            "account": m.account ?? "",
            "role": m.role.rawValue,
            "admin": m.role == .admin || m.role == .owner,
            "headPic": m.headPic ?? "",
            "memberStatus": m.dealStatus.rawValue,
          ]
        } ?? []
        promise.resolve(result)
      }, failure: { error in
        promise.reject(error ?? self.makeError("Failed to query member list"))
      })
    }

    // MARK: - Update member

    AsyncFunction("updateMember") { (params: [String: Any], promise: Promise) in
      let member = ThingSmartHomeMember()
      let requestModel = ThingSmartHomeMemberRequestModel()
      requestModel.memberId = params["memberId"] as? Int64 ?? 0
      requestModel.name = params["nickName"] as? String ?? ""
      requestModel.role = ThingHomeRoleType(rawValue: params["role"] as? UInt ?? 0) ?? .member

      member.updateHomeMemberInfo(withMemberRequestModel: requestModel, success: {
        promise.resolve(nil)
      }, failure: { error in
        promise.reject(error ?? self.makeError("Failed to update member"))
      })
    }

    // MARK: - Get invitation code

    AsyncFunction("getInvitationCode") { (homeId: Int64, promise: Promise) in
      let invitation = ThingSmartHomeInvitation()
      let requestModel = ThingSmartHomeInvitationCreateRequestModel()
      requestModel.homeID = homeId
      requestModel.needMsgContent = true
      invitation.createInvitation(with: requestModel, success: { resultModel in
        promise.resolve(resultModel?.invitationCode ?? "")
      }, failure: { error in
        promise.reject(error ?? self.makeError("Failed to get invitation code"))
      })
    }

    // MARK: - Join home with invitation code

    AsyncFunction("joinHomeWithInvitationCode") { (invitationCode: String, promise: Promise) in
      let invitation = ThingSmartHomeInvitation()
      invitation.joinHome(withInvitationCode: invitationCode, success: { result in
        promise.resolve(nil)
      }, failure: { error in
        promise.reject(error ?? self.makeError("Failed to join home"))
      })
    }

    // MARK: - Cancel invitation

    AsyncFunction("cancelInvitation") { (invitationId: Int64, promise: Promise) in
      let invitation = ThingSmartHomeInvitation()
      invitation.cancelInvitation(withInvitationID: NSNumber(value: invitationId), success: { result in
        promise.resolve(nil)
      }, failure: { error in
        promise.reject(error ?? self.makeError("Failed to cancel invitation"))
      })
    }

    // MARK: - Process invitation (accept/decline)

    AsyncFunction("processInvitation") { (homeId: Int64, accept: Bool, promise: Promise) in
      let home = self.getHomeInstance(homeId)
      home.joinFamily(withAccept: accept, success: { result in
        promise.resolve(nil)
      }, failure: { error in
        promise.reject(error ?? self.makeError("Failed to process invitation"))
      })
    }

    // MARK: - Get invitation list

    AsyncFunction("getInvitationList") { (homeId: Int64, promise: Promise) in
      let invitation = ThingSmartHomeInvitation()
      invitation.fetchInvitationRecordList(withHomeID: homeId, success: { records in
        let result = records?.map { r -> [String: Any] in
          return [
            "invitationId": r.invitationID ?? 0,
            "invitationCode": r.invitationCode ?? "",
            "name": r.name ?? "",
            "role": r.role,
            "dealStatus": r.dealStatus,
          ]
        } ?? []
        promise.resolve(result)
      }, failure: { error in
        promise.reject(error ?? self.makeError("Failed to get invitation list"))
      })
    }

    // MARK: - Update invited member

    AsyncFunction("updateInvitedMember") { (invitationId: Int64, name: String, role: Int, promise: Promise) in
      let invitation = ThingSmartHomeInvitation()
      let requestModel = ThingSmartHomeInvitationInfoRequestModel()
      requestModel.invitationID = NSNumber(value: invitationId)
      requestModel.name = name
      requestModel.role = ThingHomeRoleType(rawValue: UInt(role)) ?? .member

      invitation.updateInvitationInfo(with: requestModel, success: { result in
        promise.resolve(nil)
      }, failure: { error in
        promise.reject(error ?? self.makeError("Failed to update invited member"))
      })
    }

    // MARK: - Lifecycle

    OnStartObserving {
      self.getHomeManager().delegate = self
    }

    OnStopObserving {
      self.homeManager?.delegate = nil
    }
  }

  // MARK: - Helpers

  private func getHomeManager() -> ThingSmartHomeManager {
    if homeManager == nil {
      homeManager = ThingSmartHomeManager()
    }
    return homeManager!
  }

  private func getHomeInstance(_ homeId: Int64) -> ThingSmartHome {
    if let existing = homeInstances[homeId] {
      return existing
    }
    let home = ThingSmartHome(homeId: homeId)!
    homeInstances[homeId] = home
    return home
  }

  private func homeModelToDict(_ model: ThingSmartHomeModel?) -> [String: Any] {
    guard let m = model else { return [:] }
    return [
      "homeId": m.homeId,
      "name": m.name ?? "",
      "geoName": m.geoName ?? "",
      "lon": m.longitude,
      "lat": m.latitude,
      "admin": m.admin,
      "homeStatus": m.homeStatus,
      "role": m.role,
    ]
  }

  private func makeError(_ message: String) -> NSError {
    return NSError(domain: "ExpoTuyaHomeManagement", code: -1, userInfo: [NSLocalizedDescriptionKey: message])
  }
}

// MARK: - ThingSmartHomeManagerDelegate

extension HomeManagementModule: ThingSmartHomeManagerDelegate {
  public func homeManager(_ manager: ThingSmartHomeManager, didAddHome home: ThingSmartHomeModel) {
    sendEvent("onHomeAdded", ["homeId": home.homeId])
  }

  public func homeManager(_ manager: ThingSmartHomeManager, didRemoveHome homeId: Int64) {
    homeInstances.removeValue(forKey: homeId)
    sendEvent("onHomeRemoved", ["homeId": homeId])
  }

  public func serviceConnectedSuccess() {
    sendEvent("onServerConnectSuccess")
  }
}
