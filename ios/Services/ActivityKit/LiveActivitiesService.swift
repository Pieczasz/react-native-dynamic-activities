import ActivityKit
import Foundation
import NitroModules

// MARK: - Native ActivityKit Types

/**
 Native ActivityKit-compatible attributes that conform to ActivityAttributes protocol.
 Converts from Nitro LiveActivityAttributes to proper ActivityKit types.
 */
struct NativeActivityAttributes: ActivityAttributes {
  typealias ContentState = NativeActivityContentState

  let title: String
  let body: String

  init(from nitroAttributes: LiveActivityAttributes) {
    title = nitroAttributes.title
    body = nitroAttributes.body
  }
}

/**
 Native ActivityKit-compatible content state.
 Converts from Nitro LiveActivityContent to proper ActivityKit ContentState.
 The LiveActivityContent from Nitro contains state + metadata, but the ActivityKit ContentState
 should contain the actual display data (title/body from the attributes).
 */
struct NativeActivityContentState: Codable, Hashable {
  let title: String
  let body: String

  init(from nitroAttributes: LiveActivityAttributes, content _: LiveActivityContent) {
    // The content state should reflect the attributes' title/body
    title = nitroAttributes.title
    body = nitroAttributes.body
  }
}

// MARK: - LiveActivitiesService

/**
 Service layer for ActivityKit operations. Does not expose Nitro Promises.
 Hybrid entry point should convert to/from Nitro types and handle promises.
 */
final class LiveActivitiesService {
  // MARK: - Public API

  func areSupported() -> LiveActivitiesSupportInfo {
    if #available(iOS 26.0, *) {
      .init(
        supported: ActivityAuthorizationInfo().areActivitiesEnabled,
        version: 26.0,
        comment: "You can use everything"
      )
    } else if #available(iOS 18.0, *) {
      .init(
        supported: ActivityAuthorizationInfo().areActivitiesEnabled,
        version: 18.0,
        comment: "Limited: no alertConfiguration/start at request, no pending end"
      )
    } else if #available(iOS 17.2, *) {
      .init(
        supported: ActivityAuthorizationInfo().areActivitiesEnabled,
        version: 17.2,
        comment: "No alertConfiguration/start at request; no style at request"
      )
    } else if #available(iOS 16.2, *) {
      .init(
        supported: ActivityAuthorizationInfo().areActivitiesEnabled,
        version: 16.2,
        comment: "No alertConfiguration/start at request; no timestamp for update/end"
      )
    } else {
      .init(supported: false, version: 16.1, comment: "Live Activities are not supported on this device")
    }
  }

  func startActivity(
    attributes: LiveActivityAttributes,
    content: LiveActivityContent,
    pushToken: LiveActivityPushToken?,
    style: LiveActivityStyle?,
    alertConfiguration: LiveActivityAlertConfiguration?,
    start _: Date?
  ) throws
    -> LiveActivityStartResult
  {
    guard #available(iOS 16.2, *) else { throw unsupportedVersionError() }

    let authInfo = ActivityAuthorizationInfo()
    guard authInfo.areActivitiesEnabled else {
      throw makeNSError(
        code: "denied",
        message: "Live Activities are disabled by the user",
        domain: "LiveActivityAuthorizationError"
      )
    }

    // Convert Nitro types to ActivityKit types
    let attrs = NativeActivityAttributes(from: attributes)
    let state = NativeActivityContentState(from: attributes, content: content)

    var akStyle: ActivityStyle?
    if #available(iOS 18.0, *), let s = style {
      akStyle = (s == .standard) ? .standard : .transient
    }

    var akAlert: AlertConfiguration?
    if #available(iOS 16.2, *), let cfg = alertConfiguration {
      akAlert = AlertConfiguration(
        title: LocalizedStringResource(stringLiteral: cfg.title),
        body: LocalizedStringResource(stringLiteral: cfg.body),
        sound: .default
      )
    }

    let tokenData: Data? = if let token = pushToken?.token {
      Data(hex: token)
    } else {
      nil
    }

    do {
      let activity: Activity<NativeActivityAttributes> = try Activity.request(
        attributes: attrs,
        content: .init(state: state, staleDate: content.staleDate)
      )

      // Extract push token as hex if available
      var hexToken: String?
      if let tokenData = activity.pushToken {
        hexToken = tokenData.map { String(format: "%02x", $0) }.joined()
      }
      return .init(activityId: activity.id, pushToken: hexToken)
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

  func updateActivity(
    activityId _: String,
    content _: LiveActivityContent,
    alertConfiguration _: LiveActivityAlertConfiguration?,
    timestamp _: Date?
  ) throws {
    guard #available(iOS 16.2, *) else { throw unsupportedVersionError() }
    let authInfo = ActivityAuthorizationInfo()
    guard authInfo.areActivitiesEnabled else {
      throw makeNSError(
        code: "denied",
        message: "Live Activities are disabled by the user",
        domain: "LiveActivityAuthorizationError"
      )
    }

    // For updates and ends, we need to track activities properly
    // This is a simplified implementation that throws an error for now
    throw makeNSError(
      code: "notImplemented",
      message: "Activity updates require activity instance tracking - not implemented in this version",
      domain: "LiveActivitySystemError"
    )
  }

  func endActivity(
    activityId _: String,
    content _: LiveActivityContent,
    dismissalPolicy _: LiveActivityDismissalPolicy?
  ) throws {
    guard #available(iOS 16.2, *) else { throw unsupportedVersionError() }
    let authInfo = ActivityAuthorizationInfo()
    guard authInfo.areActivitiesEnabled else {
      throw makeNSError(
        code: "denied",
        message: "Live Activities are disabled by the user",
        domain: "LiveActivityAuthorizationError"
      )
    }

    // For ending activities, we need to track activities properly
    // This is a simplified implementation that throws an error for now
    throw makeNSError(
      code: "notImplemented",
      message: "Activity end requires activity instance tracking - not implemented in this version",
      domain: "LiveActivitySystemError"
    )
  }
}

// MARK: - Hex helper

private extension Data {
  init?(hex string: String) {
    let len = string.count
    guard len % 2 == 0 else { return nil }
    self.init(capacity: len / 2)
    var index = string.startIndex
    for _ in 0 ..< len / 2 {
      let nextIndex = string.index(index, offsetBy: 2)
      let byteString = string[index ..< nextIndex]
      guard let byte = UInt8(byteString, radix: 16) else { return nil }
      append(byte)
      index = nextIndex
    }
  }
}
