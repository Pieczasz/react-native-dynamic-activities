import ActivityKit
import Foundation

// MARK: - Activity Attributes
struct ExampleActivityAttributes: ActivityAttributes {
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

// MARK: - Type Mapping Helper
extension ExampleActivityAttributes {
    /// Maps JavaScript LiveActivityAttributes to Swift ActivityAttributes
    static func from(jsAttributes: [String: Any]) -> ExampleActivityAttributes? {
        guard let title = jsAttributes["title"] as? String,
              let body = jsAttributes["body"] as? String else {
            return nil
        }
        
        let metadata = jsAttributes["metadata"] as? [String: String]
        
        return ExampleActivityAttributes(
            title: title,
            body: body,
            metadata: metadata
        )
    }
    
    /// Maps JavaScript LiveActivityContent to Swift ContentState
    static func contentStateFrom(jsContent: [String: Any]) -> ContentState? {
        guard let state = jsContent["state"] as? String else {
            return nil
        }
        
        let relevanceScore = jsContent["relevanceScore"] as? Double
        let timestamp = jsContent["timestamp"] as? Date
        
        return ContentState(
            state: state,
            relevanceScore: relevanceScore,
            timestamp: timestamp
        )
    }
}
