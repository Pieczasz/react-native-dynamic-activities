import ActivityKit
import Foundation
import NitroModules

// MARK: - Hybrid Bridge Implementation

/**
 * Nitro bridge that connects JavaScript to iOS ActivityKit.
 *
 * This class implements the generated `HybridDynamicActivitiesSpec` protocol,
 * providing type-safe communication between JS and native ActivityKit APIs.
 * All operations are delegated to `LiveActivitiesService` for business logic.
 *
 * **Architecture:**
 * - Converts Nitro types to/from Swift types
 * - Maps native errors to structured JS errors
 * - Handles async operations via Nitro Promises
 */
final class HybridDynamicActivities: HybridDynamicActivitiesSpec {
  // MARK: - Properties

  /// Service instance for ActivityKit operations
  private let service = LiveActivitiesService()

  // MARK: - LiveActivities Support

  func areLiveActivitiesSupported() throws -> Promise<LiveActivitiesSupportInfo> {
    let promise = Promise<LiveActivitiesSupportInfo>()
    let info = service.areSupported()
    promise.resolve(withResult: info)
    return promise
  }

  // MARK: - Activity Lifecycle

  func startLiveActivity(
    attributes: LiveActivityAttributes,
    content: LiveActivityContent,
    pushToken: LiveActivityPushToken?,
    style: LiveActivityStyle?,
    alertConfiguration: LiveActivityAlertConfiguration?,
    start: Date?
  ) throws -> Promise<LiveActivityStartResult> {
    executeWithPromise { [weak self] in
      try self?.service.startActivity(
        attributes: attributes,
        content: content,
        pushToken: pushToken,
        style: style,
        alertConfiguration: alertConfiguration,
        start: start
      )
    }
  }

  func updateLiveActivity(
    activityId: String,
    content: LiveActivityContent,
    alertConfiguration: LiveActivityAlertConfiguration?,
    timestamp: Date?
  ) throws -> Promise<Void> {
    executeWithPromise { [weak self] in
      try self?.service.updateActivity(
        activityId: activityId,
        content: content,
        alertConfiguration: alertConfiguration,
        timestamp: timestamp
      )
    }
  }

  func endLiveActivity(
    activityId: String,
    content: LiveActivityContent,
    dismissalPolicy: LiveActivityDismissalPolicy?
  ) throws -> Promise<Void> {
    executeWithPromise { [weak self] in
      try self?.service.endActivity(
        activityId: activityId,
        content: content,
        dismissalPolicy: dismissalPolicy
      )
    }
  }
}

// MARK: - Private Helpers

private extension HybridDynamicActivities {
  /**
   * Executes service operations with consistent error handling and promise management.
   *
   * - Parameter operation: The service operation to execute
   * - Returns: A Nitro Promise with proper error mapping
   */
  func executeWithPromise<T>(
    operation: () throws -> T?
  ) -> Promise<T> {
    let promise = Promise<T>()

    do {
      guard let result = try operation() else {
        promise.reject(withError: makeNSError(
          code: "operationFailed",
          message: "Service operation returned nil",
          domain: "LiveActivitySystemError"
        ))
        return promise
      }
      promise.resolve(withResult: result)
    } catch {
      promise.reject(withError: mapError(error))
    }

    return promise
  }

  /**
   * Maps native errors to structured JS errors with proper typing.
   */
  func mapError(_ error: Error) -> NSError {
    if #available(iOS 16.2, *),
       let authError = error as? ActivityAuthorizationError
    {
      return mapAuthorizationError(authError)
    }

    return makeNSError(
      code: "unknownError",
      message: error.localizedDescription,
      domain: "LiveActivitySystemError"
    )
  }
}
