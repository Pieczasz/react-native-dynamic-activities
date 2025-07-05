import Foundation
import ActivityKit

class HybridDynamicActivities: HybridDynamicActivitiesSpec {
    func sum(num1: Double, num2: Double) throws -> Double {
        return num1 + num2
    }
    /**
     * Check if Live Activities are supported on this device
     * @returns true if Live Activities are supported, false otherwise
     */
    func areLiveActivitiesSupported() -> Bool {
        // TODO: Implement actual Live Activities support check
        if #available(iOS 16.1, *) {
            return ActivityAuthorizationInfo().areActivitiesEnabled
        } else {
            return false
        }
    }
    

    func startLiveActivity(
        attributes: [String: Any],
        content: [String: Any],
        pushToken: [String: Any]?,
        style: String?,
        alertConfiguration: [String: Any]?,
        start: Date?
    ) throws -> [String: Any] {
        // TODO: Implement actual Live Activity start logic
        guard #available(iOS 16.1, *) else {
            throw createSystemError(code: "UNSUPPORTED_VERSION", message: "Live Activities require iOS 16.1 or later")
        }
        
        let authInfo = ActivityAuthorizationInfo()
        if !authInfo.areActivitiesEnabled {
            throw createAuthorizationError(code: "disabledByUser", message: "Live Activities are disabled by the user")
        }
        
        return [
            "activityId": UUID().uuidString,
            "pushToken": pushToken?["token"] as? String
        ]
    }
    

    func updateLiveActivity(
        activityId: String,
        content: [String: Any],
        alertConfiguration: [String: Any]?,
        timestamp: Date?
    ) throws {
        guard #available(iOS 16.1, *) else {
            throw createSystemError(code: "UNSUPPORTED_VERSION", message: "Live Activities require iOS 16.1 or later")
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
        guard #available(iOS 16.1, *) else {
            throw createSystemError(code: "UNSUPPORTED_VERSION", message: "Live Activities require iOS 16.1 or later")
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
    
    @available(iOS 16.1, *)
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
