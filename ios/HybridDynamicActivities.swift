import ActivityKit
import Foundation
import NitroModules

/**
 A Swift implementation of the generated Nitro `HybridDynamicActivitiesSpec`.
 Bridges JS <-> ActivityKit with proper type conversions and error mapping.
 */
class HybridDynamicActivities: HybridDynamicActivitiesSpec {
  // MARK: - Spec

  func areLiveActivitiesSupported() throws -> Promise<LiveActivitiesSupportInfo> {
    let promise = Promise<LiveActivitiesSupportInfo>()
    let info = LiveActivitiesService().areSupported()
    promise.resolve(withResult: info)
    return promise
  }

  func startLiveActivity(
    attributes: LiveActivityAttributes,
    content: LiveActivityContent,
    pushToken: LiveActivityPushToken?,
    style: LiveActivityStyle?,
    alertConfiguration: LiveActivityAlertConfiguration?,
    start: Date?
  ) throws
    -> Promise<LiveActivityStartResult>
  {
    let promise = Promise<LiveActivityStartResult>()
    do {
      let result = try LiveActivitiesService().startActivity(
        attributes: attributes,
        content: content,
        pushToken: pushToken,
        style: style,
        alertConfiguration: alertConfiguration,
        start: start
      )
      promise.resolve(withResult: result)
    } catch {
      if #available(iOS 16.2, *) {
        if let authError = error as? ActivityAuthorizationError {
          promise.reject(withError: mapAuthorizationError(authError))
          return promise
        }
      }
      promise.reject(withError: makeNSError(
        code: "unknownError",
        message: error.localizedDescription,
        domain: "LiveActivitySystemError"
      ))
    }

    return promise
  }

  func updateLiveActivity(
    activityId: String,
    content: LiveActivityContent,
    alertConfiguration: LiveActivityAlertConfiguration?,
    timestamp: Date?
  ) throws
    -> Promise<Void>
  {
    let promise = Promise<Void>()
    do {
      try LiveActivitiesService().updateActivity(
        activityId: activityId,
        content: content,
        alertConfiguration: alertConfiguration,
        timestamp: timestamp
      )
      promise.resolve(withResult: ())
    } catch {
      if #available(iOS 16.2, *) {
        if let authError = error as? ActivityAuthorizationError {
          promise.reject(withError: mapAuthorizationError(authError))
          return promise
        }
      }
      promise.reject(withError: makeNSError(
        code: "unknownError",
        message: error.localizedDescription,
        domain: "LiveActivitySystemError"
      ))
    }
    return promise
  }

  func endLiveActivity(
    activityId: String,
    content: LiveActivityContent,
    dismissalPolicy: LiveActivityDismissalPolicy?
  ) throws
    -> Promise<Void>
  {
    let promise = Promise<Void>()
    do {
      try LiveActivitiesService().endActivity(
        activityId: activityId,
        content: content,
        dismissalPolicy: dismissalPolicy
      )
      promise.resolve(withResult: ())
    } catch {
      if #available(iOS 16.2, *) {
        if let authError = error as? ActivityAuthorizationError {
          promise.reject(withError: mapAuthorizationError(authError))
          return promise
        }
      }
      promise.reject(withError: makeNSError(
        code: "unknownError",
        message: error.localizedDescription,
        domain: "LiveActivitySystemError"
      ))
    }
    return promise
  }
}
