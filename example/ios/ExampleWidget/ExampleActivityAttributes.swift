import ActivityKit
import Foundation

// MARK: - Activity Registry

private final class ActivityRegistry {
    static let shared = ActivityRegistry()
    private var activities: [String: Activity<ExampleActivityAttributes>] = [:]
    private let queue = DispatchQueue(label: "com.dynamicactivities.registry", qos: .userInitiated)
    
    private init() {}
    
    func registerActivity(_ activity: Activity<ExampleActivityAttributes>) {
        queue.async { [weak self] in
            self?.activities[activity.id] = activity
        }
    }
    
    func getActivity(id: String) -> Activity<ExampleActivityAttributes>? {
        queue.sync { [weak self] in
            return self?.activities[id]
        }
    }
    
    func removeActivity(id: String) {
        queue.async { [weak self] in
            self?.activities.removeValue(forKey: id)
        }
    }
}

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

// MARK: - REACT_NATIVE_DYNAMIC_ACTIVITIES_BRIDGE
// This marker helps the library automatically discover and register this bridge
// DO NOT REMOVE: Used for automatic bridge registration
