import ActivityKit
import Foundation
import NitroModules

// MARK: - Generic Activity Attributes

/**
 * Generic attributes that can be used with ActivityKit for simple Live Activities.
 * This eliminates the need for user-specific attribute types in most cases.
 */
struct GenericActivityAttributes: ActivityAttributes {
  public struct ContentState: Codable, Hashable {
    /// Current state of the activity
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

  public init(title: String, body: String) {
    self.title = title
    self.body = body
  }
}

// MARK: - Activity Registry

/**
 * Registry for tracking active Live Activities.
 */
private final class ActivityRegistry {
  static let shared = ActivityRegistry()
  private var activities: [String: Any] = [:] // Any to support different Activity types
  private let queue = DispatchQueue(label: "com.dynamicactivities.registry", qos: .userInitiated)

  private init() {}

  @available(iOS 16.1, *)
  func registerActivity(_ activity: Activity<some ActivityAttributes>) {
    queue.async { [weak self] in
      self?.activities[activity.id] = activity
    }
  }

  @available(iOS 16.1, *)
  func getActivity<T: ActivityAttributes>(id: String, type _: T.Type) -> Activity<T>? {
    queue.sync { [weak self] in
      return self?.activities[id] as? Activity<T>
    }
  }

  func removeActivity(id: String) {
    queue.async { [weak self] in
      self?.activities.removeValue(forKey: id)
    }
  }
}

// MARK: - LiveActivitiesService

/**
 * Core service layer for ActivityKit operations.
 *
 * **Architecture:**
 * - Pure Swift service layer with direct ActivityKit integration
 * - Uses generic attributes that work for most use cases
 * - Handles iOS version compatibility and authorization checks
 * - Complete activity lifecycle management (start, update, end)
 */
final class LiveActivitiesService {
  // MARK: - Properties

  /// Activity registry for tracking live activities
  private let activityRegistry = ActivityRegistry.shared

  // MARK: - Support Detection

  /**
   * Determines Live Activities support and available features for current iOS version.
   *
   * - Returns: Support information with version-specific feature availability
   */
  func areSupported() -> LiveActivitiesSupportInfo {
    if #available(iOS 26.0, *) {
      LiveActivitiesSupportInfo(
        supported: ActivityAuthorizationInfo().areActivitiesEnabled,
        version: 26.0,
        comment: "Full feature support available"
      )
    } else if #available(iOS 18.0, *) {
      LiveActivitiesSupportInfo(
        supported: ActivityAuthorizationInfo().areActivitiesEnabled,
        version: 18.0,
        comment: "Limited: no alertConfiguration/start parameters in requests (available in iOS 26.0+)"
      )
    } else if #available(iOS 17.2, *) {
      LiveActivitiesSupportInfo(
        supported: ActivityAuthorizationInfo().areActivitiesEnabled,
        version: 17.2,
        comment: "Limited: no style parameter (iOS 18.0+) or alertConfiguration/start in requests (iOS 26.0+)"
      )
    } else if #available(iOS 16.2, *) {
      LiveActivitiesSupportInfo(
        supported: ActivityAuthorizationInfo().areActivitiesEnabled,
        version: 16.2,
        comment: "Basic support: no style, timestamp (iOS 17.2+), or alertConfiguration/start in requests (iOS 26.0+)"
      )
    } else if #available(iOS 16.1, *) {
      LiveActivitiesSupportInfo(
        supported: ActivityAuthorizationInfo().areActivitiesEnabled,
        version: 16.1,
        comment: "ActivityKit available but Live Activities require iOS 16.2"
      )
    } else {
      LiveActivitiesSupportInfo(
        supported: false,
        version: Double(ProcessInfo.processInfo.operatingSystemVersion.majorVersion),
        comment: "Live Activities require iOS 16.2 or later"
      )
    }
  }

  // MARK: - Activity Lifecycle

  /**
   * Starts a new Live Activity with the provided configuration.
   *
   * **Validation Flow:**
   * 1. Checks iOS version compatibility (≥16.2)
   * 2. Verifies user authorization for Live Activities
   * 3. Creates ActivityKit activity directly
   *
   * - Parameters:
   *   - attributes: Activity attributes (title, body, metadata)
   *   - content: Initial content state
   *   - pushToken: Optional push token for remote updates
   *   - style: Activity style (iOS 18.0+)
   *   - alertConfiguration: Alert configuration (iOS 16.2+)
   *   - start: Optional start date (iOS 26.0+)
   * - Returns: Activity ID and push token information
   * - Throws: Authorization or system errors
   */
  func startActivity(
    attributes: LiveActivityAttributes,
    content: LiveActivityContent,
    pushToken _: LiveActivityPushToken?,
    style _: LiveActivityStyle?,
    alertConfiguration _: LiveActivityAlertConfiguration?,
    start: Date?
  ) throws -> LiveActivityStartResult {
    // Version compatibility check
    guard #available(iOS 16.2, *) else {
      throw unsupportedVersionError()
    }

    // User authorization check
    try validateUserAuthorization()

    // Convert to generic attributes
    let genericAttributes = GenericActivityAttributes(
      title: attributes.title,
      body: attributes.body
    )

    let contentState = GenericActivityAttributes.ContentState(
      state: content.state.stringValue,
      relevanceScore: content.relevanceScore,
      timestamp: start ?? Date()
    )

    // Create ActivityKit request
    do {
      let activity: Activity<GenericActivityAttributes>
      if #available(iOS 16.2, *) {
        activity = try Activity.request(
          attributes: genericAttributes,
          content: .init(state: contentState, staleDate: content.staleDate)
        )
      } else {
        throw unsupportedVersionError()
      }

      // Register for tracking
      activityRegistry.registerActivity(activity)

      // Extract push token as hex if available
      var hexToken: String?
      if let tokenData = activity.pushToken {
        hexToken = tokenData.map { String(format: "%02x", $0) }.joined()
      }

      return LiveActivityStartResult(activityId: activity.id, pushToken: hexToken)
    } catch let authError as ActivityAuthorizationError {
      if #available(iOS 16.1, *) {
        throw mapAuthorizationError(authError)
      } else {
        throw makeNSError(
          code: "unknownError",
          message: authError.localizedDescription,
          domain: "LiveActivitySystemError"
        )
      }
    } catch {
      throw makeNSError(
        code: "unknownError",
        message: error.localizedDescription,
        domain: "LiveActivitySystemError"
      )
    }
  }

  /**
   * Updates an existing Live Activity with new content.
   *
   * - Parameters:
   *   - activityId: The ID of the activity to update
   *   - content: New content state
   *   - alertConfiguration: Optional alert for the update
   *   - timestamp: Custom timestamp (iOS 17.2+)
   * - Throws: System or activity not found errors
   */
  func updateActivity(
    activityId: String,
    content: LiveActivityContent,
    alertConfiguration _: LiveActivityAlertConfiguration?,
    timestamp: Date?
  ) throws {
    guard #available(iOS 16.2, *) else {
      throw unsupportedVersionError()
    }

    guard let activity = activityRegistry.getActivity(id: activityId, type: GenericActivityAttributes.self) else {
      throw makeNSError(
        code: "notFound",
        message: "Activity with ID \(activityId) not found",
        domain: "LiveActivitySystemError"
      )
    }

    let newState = GenericActivityAttributes.ContentState(
      state: content.state.stringValue,
      relevanceScore: content.relevanceScore,
      timestamp: timestamp ?? Date()
    )

    if #available(iOS 17.2, *), let timestamp {
      Task {
        await activity.update(
          .init(state: newState, staleDate: content.staleDate),
          alertConfiguration: nil,
          timestamp: timestamp
        )
      }
    } else {
      Task {
        await activity.update(.init(state: newState, staleDate: content.staleDate))
      }
    }
  }

  /**
   * Ends an existing Live Activity with final content.
   *
   * - Parameters:
   *   - activityId: The ID of the activity to end
   *   - content: Final content state
   *   - dismissalPolicy: How the activity should be dismissed
   *   - timestamp: Custom timestamp (iOS 17.2+)
   * - Throws: System or activity not found errors
   */
  func endActivity(
    activityId: String,
    content: LiveActivityContent,
    dismissalPolicy _: LiveActivityDismissalPolicy?,
    timestamp: Date?
  ) throws {
    guard #available(iOS 16.2, *) else {
      throw unsupportedVersionError()
    }

    guard let activity = activityRegistry.getActivity(id: activityId, type: GenericActivityAttributes.self) else {
      throw makeNSError(
        code: "notFound",
        message: "Activity with ID \(activityId) not found",
        domain: "LiveActivitySystemError"
      )
    }

    let finalState = GenericActivityAttributes.ContentState(
      state: "ended",
      relevanceScore: content.relevanceScore,
      timestamp: timestamp ?? Date()
    )

    // Convert dismissalPolicy - ActivityKit uses different enum
    let policy: ActivityUIDismissalPolicy = .default // Simple mapping for now

    if #available(iOS 17.2, *), let timestamp {
      Task {
        await activity.end(
          .init(state: finalState, staleDate: content.staleDate),
          dismissalPolicy: policy,
          timestamp: timestamp
        )
      }
    } else {
      Task {
        await activity.end(.init(state: finalState, staleDate: content.staleDate), dismissalPolicy: policy)
      }
    }

    // Clean up from registry
    activityRegistry.removeActivity(id: activityId)
  }
}

// MARK: - Private Helpers

private extension LiveActivitiesService {
  /**
   * Validates that user has authorized Live Activities for this app.
   *
   * - Throws: Authorization error if Live Activities are disabled
   */
  func validateUserAuthorization() throws {
    if #available(iOS 16.1, *) {
      let authInfo = ActivityAuthorizationInfo()
      guard authInfo.areActivitiesEnabled else {
        throw makeNSError(
          code: "denied",
          message: "Live Activities are disabled by the user in Settings",
          domain: "LiveActivityAuthorizationError"
        )
      }
    } else {
      // iOS < 16.1 doesn't support Live Activities at all
      throw unsupportedVersionError()
    }
  }
}

// MARK: - Error Mapping Helpers
// (Centralized in ios/Errors/ErrorMapping.swift)

// MARK: - Data Extensions

/**
 * Utility extension for converting hex strings to Data.
 *
 * Used for processing push tokens in ActivityKit implementations.
 */
private extension Data {
  /**
   * Creates Data from a hexadecimal string representation.
   *
   * - Parameter hex: Hexadecimal string (e.g., "deadbeef")
   * - Note: String must have even length for valid byte pairs
   */
  init?(hex string: String) {
    let length = string.count
    guard length.isMultiple(of: 2) else { return nil }

    self.init(capacity: length / 2)
    var index = string.startIndex

    for _ in 0 ..< (length / 2) {
      let nextIndex = string.index(index, offsetBy: 2)
      let byteString = string[index ..< nextIndex]

      guard let byte = UInt8(byteString, radix: 16) else { return nil }
      append(byte)
      index = nextIndex
    }
  }
}
