import ActivityKit
import Foundation

// MARK: - Activity Attributes
struct {{ACTIVITY_NAME}}Attributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        /// Current state of the activity (e.g., "active", "paused", "ended")
        var state: String
        
        /// Optional relevance score for Dynamic Island priority (0.0 - 1.0)
        var relevanceScore: Double?
        
        /// Optional timestamp for the state change
        var timestamp: Date?
        
        public init(state: String, relevanceScore: Double? = nil, timestamp: Date? = nil) {
            self.state = state
            self.relevanceScore = relevanceScore
            self.timestamp = timestamp
        }
    }
    
    /// Activity title
    var title: String
    
    /// Activity description/body text
    var body: String
    
    /// Optional metadata
    var metadata: [String: String]?
    
    public init(title: String, body: String, metadata: [String: String]? = nil) {
        self.title = title
        self.body = body
        self.metadata = metadata
    }
}

// MARK: - Library Bridge Implementation
extension {{ACTIVITY_NAME}}Attributes: LiveActivityBridge {
    static func startActivity(
        attributes: LiveActivityAttributes,
        content: LiveActivityContent,
        pushToken: LiveActivityPushToken?,
        style: LiveActivityStyle?,
        alertConfiguration: LiveActivityAlertConfiguration?,
        start: Date?
    ) throws -> LiveActivityStartResult {
        // Convert library types to widget types
        let attrs = {{ACTIVITY_NAME}}Attributes(
            title: attributes.title,
            body: attributes.body,
            metadata: attributes.metadata
        )
        
        let state = ContentState(
            state: "active", // You can map from content.data if needed
            relevanceScore: content.relevanceScore,
            timestamp: start ?? Date()
        )
        
        // Create ActivityKit request
        do {
            let activity: Activity<{{ACTIVITY_NAME}}Attributes> = try Activity.request(
                attributes: attrs,
                content: .init(state: state, staleDate: content.staleDate)
            )
            
            // Extract push token as hex if available
            var hexToken: String?
            if let tokenData = activity.pushToken {
                hexToken = tokenData.map { String(format: "%02x", $0) }.joined()
            }
            
            return LiveActivityStartResult(activityId: activity.id, pushToken: hexToken)
        } catch let authError as ActivityAuthorizationError {
            throw mapAuthorizationError(authError)
        } catch {
            throw makeNSError(
                code: "unknownError",
                message: error.localizedDescription,
                domain: "LiveActivitySystemError"
            )
        }
    }
    
    static func updateActivity(
        activityId: String,
        content: LiveActivityContent,
        alertConfiguration: LiveActivityAlertConfiguration?,
        timestamp: Date?
    ) throws {
        // Implementation for updates - requires activity tracking
        throw makeNSError(
            code: "notImplemented",
            message: "Activity updates require activity instance tracking",
            domain: "LiveActivitySystemError"
        )
    }
    
    static func endActivity(
        activityId: String,
        content: LiveActivityContent,
        dismissalPolicy: LiveActivityDismissalPolicy?
    ) throws {
        // Implementation for ending - requires activity tracking
        throw makeNSError(
            code: "notImplemented",
            message: "Activity end requires activity instance tracking",
            domain: "LiveActivitySystemError"
        )
    }
}

// MARK: - Helper Functions
private func mapAuthorizationError(_ error: ActivityAuthorizationError) -> NSError {
    switch error {
    case .activityNotEnabled:
        return makeNSError(
            code: "denied",
            message: "Live Activities are disabled by the user",
            domain: "LiveActivityAuthorizationError"
        )
    case .insufficientData:
        return makeNSError(
            code: "insufficientData",
            message: "Insufficient data to create Live Activity",
            domain: "LiveActivityAuthorizationError"
        )
    default:
        return makeNSError(
            code: "authorizationError",
            message: error.localizedDescription,
            domain: "LiveActivityAuthorizationError"
        )
    }
}

private func makeNSError(code: String, message: String, domain: String) -> NSError {
    return NSError(
        domain: domain,
        code: 0,
        userInfo: [
            NSLocalizedDescriptionKey: message,
            "code": code
        ]
    )
}