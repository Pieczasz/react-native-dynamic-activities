import Foundation
import ActivityKit
import ActivityKit

class LiveActivities: LiveActivitiesSpec {
    /**
     * Check if Live Activities are supported on this device
     * @returns true if Live Activities are supported, false otherwise
     */
    func areLiveActivitiesSupported() -> [String: Any] {
        if #available(iOS 26.0, *) {
            return [
                "supported": ActivityAuthorizationInfo().areActivitiesEnabled,
                "version": "26.0 or higher - You can use everything"
            ]
        } else if #available(iOS 18.0, *) {
            return [
                "supported": ActivityAuthorizationInfo().areActivitiesEnabled,
                "version": "Between 18.0 and 26.0 - You can't use alertConfiguration and start date while starting a 
                Live Activity and you can't also use pending state while ending a Live Activity"
            ]
        } else if #available(iOS 17.2, *) {
            return [
                "supported": ActivityAuthorizationInfo().areActivitiesEnabled,
                "version": "Between 17.2 and 18.0 - You can't use alertConfiguration and start date while starting a 
                Live Activity and you can't also use pending state while ending a Live Activity;
                You also can't use style while starting a Live Activity
                "
            ]
        } else if #available(iOS 16.2, *) {
            return [
                "supported": ActivityAuthorizationInfo().areActivitiesEnabled,
                "version": "Between 16.2 and 17.2 - You can't use alertConfiguration and start date while starting a 
                Live Activity and you can't also use pending state while ending a Live Activity;
                You also can't use style while starting a Live Activity
                You also can't use timestamp while updating a Live Activity and while ending a Live Activity
                "
            ]
        } else {
            return [
                "supported": false,
                "version": "16.1 or lower - Live Activities are not supported on this device"
            ]
        }
    }
    

    func startLiveActivity(
        attributes: Attributes,
        content: ActivityContent<Activity<Attributes>.ContentState>,
        pushToken: PushType? = nil,
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

        if (alertConfiguration != nil && start != nil && style != nil) {
            if #available(iOS 26.0, *) {
                let activity = Activity.request(
                    attributes: attributes,
                    content: content,
                    pushType: pushToken,
                    style: style,
                    alertConfiguration: alertConfiguration,
                )
                return activity
            }
        }

        if (alertConfiguration == nil && start == nil && style != nil) {
            if #available(iOS 18.0, *) {
                let activity = Activity.request(
                    attributes: attributes,
                    content: content,
                    pushType: pushToken,
                    style: style,
                )
                return activity
            }
        }
        
        if #available(iOS 16.2, *) {
            let activity = Activity.request(
                attributes: attributes,
                content: content,
                pushType: pushToken,
            )
            return activity
        }

        throw createSystemError(code: "UNSUPPORTED_VERSION", message: "Live Activities require iOS 16.2 or later")
    }
    

    func updateLiveActivity(
        activityId: String,
        content: [String: Any],
        alertConfiguration: [String: Any]?,
        timestamp: Date?
    ) throws {
        guard #available(iOS 16.2, *) else {
            throw createSystemError(code: "UNSUPPORTED_VERSION", message: "Live Activities require iOS 16.2 or later")
        }
        // TODO: Implement actual Live Activity update logic
        let authInfo = ActivityAuthorizationInfo()
        if !authInfo.areActivitiesEnabled {
            throw createAuthorizationError(code: "disabledByUser", message: "Live Activities are disabled by the user")
        }
        
    }
    
    func endLiveActivity(
        activityId: String,
        content: [String: Any],
        dismissalPolicy: [String: Any]?
    ) throws {
        // TODO: Implement actual Live Activity end logic
        guard #available(iOS 16.2, *) else {
            throw createSystemError(code: "UNSUPPORTED_VERSION", message: "Live Activities require iOS 16.2 or later")
        }
        
        let authInfo = ActivityAuthorizationInfo()
        if !authInfo.areActivitiesEnabled {
            throw createAuthorizationError(code: "disabledByUser", message: "Live Activities are disabled by the user")
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
