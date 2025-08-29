import ActivityKit
import Foundation
import NitroModules

// MARK: - ActivityKit Bridge Protocol

/**
 * Protocol that user-generated widgets must implement to bridge with the library.
 *
 * The CLI generates implementations of this protocol for each widget extension,
 * allowing the library to delegate ActivityKit operations to user-specific code
 * while maintaining type safety and proper error handling.
 *
 * **Generated Implementation Location:**
 * Widget Extension Target → `[WidgetName]ActivityAttributes.swift`
 */
protocol LiveActivityBridge {
  static func startActivity(
    attributes: LiveActivityAttributes,
    content: LiveActivityContent,
    pushToken: LiveActivityPushToken?,
    style: LiveActivityStyle?,
    alertConfiguration: LiveActivityAlertConfiguration?,
    start: Date?
  ) throws -> LiveActivityStartResult

  static func updateActivity(
    activityId: String,
    content: LiveActivityContent,
    alertConfiguration: LiveActivityAlertConfiguration?,
    timestamp: Date?
  ) throws

  static func endActivity(
    activityId: String,
    content: LiveActivityContent,
    dismissalPolicy: LiveActivityDismissalPolicy?
  ) throws
}

// MARK: - Bridge Registry

/**
 * Registry for user-implemented widget bridges.
 *
 * **Usage Pattern:**
 * 1. User implements `LiveActivityBridge` protocol in their widget extension
 * 2. User calls `LiveActivityBridgeRegistry.shared.registerBridge(MyWidgetAttributes.self)`
 *    in their AppDelegate or main app initialization
 * 3. Library delegates all ActivityKit operations to the registered implementation
 *
 * **Thread Safety:** This registry is designed for single registration during app launch.
 */
final class LiveActivityBridgeRegistry {
  // MARK: - Properties

  static let shared = LiveActivityBridgeRegistry()
  private var bridgeClass: LiveActivityBridge.Type?

  private let queue = DispatchQueue(label: "com.dynamicactivities.bridge-registry", qos: .userInitiated)

  // MARK: - Initialization

  private init() {}

  // MARK: - Public API

  /**
   * Registers a user-implemented bridge for ActivityKit operations.
   *
   * - Parameter bridgeClass: The bridge implementation class
   * - Important: Should be called once during app initialization
   */
  func registerBridge(_ bridgeClass: LiveActivityBridge.Type) {
    queue.async { [weak self] in
      self?.bridgeClass = bridgeClass
    }
  }

  /**
   * Retrieves the registered bridge implementation.
   *
   * - Returns: The registered bridge class
   * - Throws: `LiveActivitySystemError` if no bridge is registered
   */
  func getBridge() throws -> LiveActivityBridge.Type {
    try queue.sync { [weak self] in
      guard let bridge = self?.bridgeClass else {
        throw makeNSError(
          code: "noBridge",
          message: "No ActivityKit bridge registered. Ensure you call LiveActivityBridgeRegistry.shared.registerBridge() during app initialization.",
          domain: "LiveActivitySystemError"
        )
      }
      return bridge
    }
  }
}

// MARK: - LiveActivitiesService

/**
 * Core service layer for ActivityKit operations.
 *
 * **Architecture:**
 * - Pure Swift service layer (no Nitro dependencies)
 * - Delegates actual ActivityKit calls to user-registered bridge implementations
 * - Handles iOS version compatibility and authorization checks
 * - Error handling is delegated to bridge implementations and error mapping layer
 *
 * **Design Pattern:**
 * This service acts as a coordinator that validates preconditions and delegates
 * to user-specific bridge implementations, maintaining separation of concerns.
 */
final class LiveActivitiesService {
  // MARK: - Properties

  /// Bridge registry for delegating operations
  private let bridgeRegistry = LiveActivityBridgeRegistry.shared

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
        comment: "Limited: no alertConfiguration/start parameters in requests"
      )
    } else if #available(iOS 17.2, *) {
      LiveActivitiesSupportInfo(
        supported: ActivityAuthorizationInfo().areActivitiesEnabled,
        version: 17.2,
        comment: "Limited: no style parameter and timestamp support only for updates"
      )
    } else if #available(iOS 16.2, *) {
      LiveActivitiesSupportInfo(
        supported: ActivityAuthorizationInfo().areActivitiesEnabled,
        version: 16.2,
        comment: "Basic support: no advanced parameters or timestamp support"
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
   * 3. Delegates to registered bridge implementation
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
    pushToken: LiveActivityPushToken?,
    style: LiveActivityStyle?,
    alertConfiguration: LiveActivityAlertConfiguration?,
    start: Date?
  ) throws -> LiveActivityStartResult {
    // Version compatibility check
    guard #available(iOS 16.2, *) else {
      throw unsupportedVersionError()
    }

    // User authorization check
    try validateUserAuthorization()

    // Delegate to user-implemented bridge
    let bridge = try bridgeRegistry.getBridge()
    return try bridge.startActivity(
      attributes: attributes,
      content: content,
      pushToken: pushToken,
      style: style,
      alertConfiguration: alertConfiguration,
      start: start
    )
  }

  /**
   * Updates an existing Live Activity with new content.
   *
   * - Parameters:
   *   - activityId: The ID of the activity to update
   *   - content: New content state
   *   - alertConfiguration: Optional alert for the update
   *   - timestamp: Custom timestamp (iOS 17.2+)
   * - Throws: System or bridge implementation errors
   */
  func updateActivity(
    activityId: String,
    content: LiveActivityContent,
    alertConfiguration: LiveActivityAlertConfiguration?,
    timestamp: Date?
  ) throws {
    guard #available(iOS 16.2, *) else {
      throw unsupportedVersionError()
    }

    let bridge = try bridgeRegistry.getBridge()
    try bridge.updateActivity(
      activityId: activityId,
      content: content,
      alertConfiguration: alertConfiguration,
      timestamp: timestamp
    )
  }

  /**
   * Ends an existing Live Activity with final content.
   *
   * - Parameters:
   *   - activityId: The ID of the activity to end
   *   - content: Final content state
   *   - dismissalPolicy: How the activity should be dismissed
   * - Throws: System or bridge implementation errors
   */
  func endActivity(
    activityId: String,
    content: LiveActivityContent,
    dismissalPolicy: LiveActivityDismissalPolicy?
  ) throws {
    guard #available(iOS 16.2, *) else {
      throw unsupportedVersionError()
    }

    let bridge = try bridgeRegistry.getBridge()
    try bridge.endActivity(
      activityId: activityId,
      content: content,
      dismissalPolicy: dismissalPolicy
    )
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

// MARK: - Data Extensions

/**
 * Utility extension for converting hex strings to Data.
 *
 * Used for processing push tokens in ActivityKit bridge implementations.
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
