import Foundation
import ActivityKit

// MARK: - Hex String → Data helper

private extension Data {
    /// Creates `Data` from a hexadecimal-encoded string. Returns `nil` if the
    /// string contains non-hex characters or has an odd length.
    init?(hex string: String) {
        let len = string.count
        guard len % 2 == 0 else { return nil }

        self.init(capacity: len / 2)
        var index = string.startIndex
        for _ in 0 ..< len / 2 {
            let nextIndex = string.index(index, offsetBy: 2)
            let byteString = string[index..<nextIndex]
            guard let byte = UInt8(byteString, radix: 16) else { return nil }
            self.append(byte)
            index = nextIndex
        }
    }
}

class LiveActivities: LiveActivitiesSpec {
    func areLiveActivitiesSupported() -> [String: Any] {
        if #available(iOS 26.0, *) {
            return [
                "supported": ActivityAuthorizationInfo().areActivitiesEnabled,
                "version": 26.0,
                "comment": "You can use everything"
            ]
        } else if #available(iOS 18.0, *) {
            return [
                "supported": ActivityAuthorizationInfo().areActivitiesEnabled,
                "version": 18.0,
                "comment": """
                You can't use alertConfiguration and start date while starting a 
                Live Activity and you can't also use pending state while ending a Live Activity
                """
            ]
        } else if #available(iOS 17.2, *) {
            return [
                "supported": ActivityAuthorizationInfo().areActivitiesEnabled,
                "version": 17.2,
                "comment": """
                You can't use alertConfiguration and start date while starting a 
                Live Activity and you can't also use pending state while ending a Live Activity;
                You also can't use style while starting a Live Activity
                """
            ]
        } else if #available(iOS 16.2, *) {
            return [
                "supported": ActivityAuthorizationInfo().areActivitiesEnabled,
                "version": 16.2,
                "comment": """
                You can't use alertConfiguration and start date while starting a 
                Live Activity and you can't also use pending state while ending a Live Activity;
                You also can't use style while starting a Live Activity;
                You also can't use timestamp while updating a Live Activity and while ending a Live Activity
                """
            ]
        } else {
            return [
                "supported": false,
                "version": 16.1,
                "comment": "Live Activities are not supported on this device"
            ]
        }
    }
    
    func startLiveActivity(
        attributes: Attributes,
        content: ActivityContent<Activity<Attributes>.ContentState>,
        pushToken: [String: Any]? = nil,
        style: ActivityStyle? = nil,
        alertConfiguration: AlertConfiguration? = nil,
        start: Date? = nil
    ) throws -> Activity<Attributes> {
        guard #available(iOS 16.2, *) else {
            throw createSystemError(code: "UNSUPPORTED_VERSION", message: "Live Activities require iOS 16.2 or later")
        }

        let authInfo = ActivityAuthorizationInfo()
        if !authInfo.areActivitiesEnabled {
            throw createAuthorizationError(code: "disabledByUser", message: "Live Activities are disabled by the user")
        }

        // Convert the JS dictionary into Activity.PushType
        let nativePushType: PushType? = {
            guard let dict = pushToken,
                  let tokenHex = dict["token"] as? String,
                  let tokenData = Data(hex: tokenHex) else { return nil }
            return .token(tokenData)
        }()

        do {
            let activity: Activity<Attributes>

            if #available(iOS 26.0, *) {
                activity = try Activity.request(
                    attributes: attributes,
                    content: content,
                    pushType: nativePushType,
                    style: style,
                    alertConfiguration: alertConfiguration,
                    start: start
                )
            } else if #available(iOS 18.0, *) {
                activity = try Activity.request(
                    attributes: attributes,
                    content: content,
                    pushType: nativePushType,
                    style: style
                )
            } else {
                activity = try Activity.request(
                    attributes: attributes,
                    content: content,
                    pushType: nativePushType
                )
            }

            return activity
        } catch let authError as ActivityAuthorizationError {
            throw mapActivityAuthorizationError(authError)
        } catch {
            throw createSystemError(code: "UNKNOWN_ERROR", message: error.localizedDescription)
        }
    }
    
    func updateLiveActivity(
        activityId: String,
        content: ActivityContent<Activity<Attributes>.ContentState>,
        alertConfiguration: AlertConfiguration? = nil,
        timestamp: Date? = nil
    ) throws {
        guard #available(iOS 16.2, *) else {
            throw createSystemError(code: "UNSUPPORTED_VERSION", message: "Live Activities require iOS 16.2 or later")
        }

        let authInfo = ActivityAuthorizationInfo()
        if !authInfo.areActivitiesEnabled {
            throw createAuthorizationError(code: "disabledByUser", message: "Live Activities are disabled by the user")
        }

        do {
            if #available(iOS 17.2, *) && timestamp != nil {
                try Activity.update(
                    activityId,
                    content: content,
                    alertConfiguration: alertConfiguration,
                    timestamp: timestamp
                )
            } else if alertConfiguration != nil {
                try Activity.update(
                    activityId,
                    content: content,
                    alertConfiguration: alertConfiguration
                )
            } else {
                try Activity.update(
                    activityId,
                    content: content
                )
            }
        } catch let authError as ActivityAuthorizationError {
            throw mapActivityAuthorizationError(authError)
        } catch {
            throw createSystemError(code: "UNKNOWN_ERROR", message: error.localizedDescription)
        }
    }
    
    func endLiveActivity(
        activityId: String,
        content: ActivityContent<Activity<Attributes>.ContentState>,
        dismissalPolicy: DismissalPolicy? = nil,
        timestamp: Date? = nil
    ) throws {
        // TODO: Implement actual Live Activity end logic
        guard #available(iOS 16.2, *) else {
            throw createSystemError(code: "UNSUPPORTED_VERSION", message: "Live Activities require iOS 16.2 or later")
        }
        
        let authInfo = ActivityAuthorizationInfo()
        if !authInfo.areActivitiesEnabled {
            throw createAuthorizationError(code: "disabledByUser", message: "Live Activities are disabled by the user")
        }
        
        do {
            if #available(iOS 17.2, *) {
                try Activity.end(
                activityId, 
                content: content, 
                dismissalPolicy: dismissalPolicy, 
                timestamp: timestamp
                )
            } else {
                try Activity.end(
                    activityId, 
                    content: content, 
                    dismissalPolicy: dismissalPolicy
                )
            }
        } catch let authError as ActivityAuthorizationError {
            throw mapActivityAuthorizationError(authError)
        } catch {
            throw createSystemError(code: "UNKNOWN_ERROR", message: error.localizedDescription)
        }
    }
    
    private func createAuthorizationError(code: String, message: String) -> NSError {
        return NSError(
            domain: "LiveActivityAuthorizationError",
            code: 1001,
            userInfo: [
                "code": code,
                "message": message,
                "timestamp": Date().timeIntervalSince1970
            ]
        )
    }
    
    private func createSystemError(code: String, message: String) -> NSError {
        return NSError(
            domain: "LiveActivitySystemError",
            code: 2001,
            userInfo: [
                "code": code,
                "message": message,
                "timestamp": Date().timeIntervalSince1970
            ]
        )
    }
    
    // MARK: - ActivityAuthorizationError Mapping
    
    @available(iOS 16.2, *)
    private func mapActivityAuthorizationError(_ error: ActivityAuthorizationError) -> NSError {
        let (code, message) = switch error {
        case .disabledByUser:
            ("disabledByUser", "Live Activities are disabled by the user. Please ask the user to enable them in Settings.")
        case .frequentPushes:
            ("frequentPushes", "Too many push notifications have been sent. Please reduce the frequency of updates.")
        case .insufficientPrivilege:
            ("insufficientPrivilege", "The app does not have sufficient permissions to create Live Activities.")
        @unknown default:
            ("UNKNOWN_ERROR", "An unknown authorization error occurred.")
        }
        
        return createAuthorizationError(code: code, message: message)
    }
}
