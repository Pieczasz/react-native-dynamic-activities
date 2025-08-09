import ActivityKit
import Foundation
import NitroModules

// MARK: - LiveActivitiesService

/**
 Service layer for ActivityKit operations. Does not expose Nitro Promises.
 Hybrid entry point should convert to/from Nitro types and handle promises.
 */
final class LiveActivitiesService {
    // MARK: - Public API

    func areSupported() -> LiveActivitiesSupportInfo {
        if #available(iOS 26.0, *) {
            return .init(
                supported: ActivityAuthorizationInfo().areActivitiesEnabled,
                version: 26.0,
                comment: "You can use everything"
            )
        } else if #available(iOS 18.0, *) {
            return .init(
                supported: ActivityAuthorizationInfo().areActivitiesEnabled,
                version: 18.0,
                comment: "Limited: no alertConfiguration/start at request, no pending end"
            )
        } else if #available(iOS 17.2, *) {
            return .init(
                supported: ActivityAuthorizationInfo().areActivitiesEnabled,
                version: 17.2,
                comment: "No alertConfiguration/start at request; no style at request"
            )
        } else if #available(iOS 16.2, *) {
            return .init(
                supported: ActivityAuthorizationInfo().areActivitiesEnabled,
                version: 16.2,
                comment: "No alertConfiguration/start at request; no timestamp for update/end"
            )
        } else {
            return .init(supported: false, version: 16.1, comment: "Live Activities are not supported on this device")
        }
    }

    // swiftlint:disable:next function_parameter_count
    func startActivity(
        attributes: LiveActivityAttributes,
        content: LiveActivityContent,
        pushToken: LiveActivityPushToken?,
        style: LiveActivityStyle?,
        alertConfiguration: LiveActivityAlertConfiguration?,
        start: Date?
    ) throws
        -> LiveActivityStartResult {
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
        let attrs = Activity<LiveActivityAttributes>.Attributes(attributes)
        let state = Activity<LiveActivityAttributes>.ContentState(content)

        var akStyle: ActivityStyle?
        if #available(iOS 18.0, *), let s = style {
            akStyle = (s == .standard) ? .standard : .transient
        }

        var akAlert: AlertConfiguration?
        if #available(iOS 26.0, *), let cfg = alertConfiguration {
            akAlert = .init(title: cfg.title, body: cfg.body, sound: .init(named: .init(cfg.sound)))
        }

        let pushType: ActivityPushType?
        if let token = pushToken?.token, let tokenData = Data(hex: token) {
            pushType = .token(tokenData)
        } else {
            pushType = nil
        }

        do {
            let activity: Activity<Activity<LiveActivityAttributes>.Attributes>
            if #available(iOS 26.0, *) {
                activity = try Activity.request(
                    attributes: attrs,
                    content: .init(state: state),
                    pushType: pushType,
                    style: akStyle,
                    alertConfiguration: akAlert,
                    start: start
                )
            } else if #available(iOS 18.0, *) {
                activity = try Activity.request(
                    attributes: attrs,
                    content: .init(state: state),
                    pushType: pushType,
                    style: akStyle
                )
            } else {
                activity = try Activity.request(
                    attributes: attrs,
                    content: .init(state: state),
                    pushType: pushType
                )
            }

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
        activityId: String,
        content: LiveActivityContent,
        alertConfiguration: LiveActivityAlertConfiguration?,
        timestamp: Date?
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

        let state = Activity<LiveActivityAttributes>.ContentState(content)
        do {
            if #available(iOS 17.2, *), let ts = timestamp {
                try Activity.update(
                    activityId,
                    content: .init(state: state),
                    alertConfiguration: {
                        if let cfg = alertConfiguration {
                            return .init(title: cfg.title, body: cfg.body, sound: .default)
                        }
                        return nil
                    }(),
                    timestamp: ts
                )
            } else if let cfg = alertConfiguration {
                try Activity.update(
                    activityId,
                    content: .init(state: state),
                    alertConfiguration: .init(title: cfg.title, body: cfg.body, sound: .default)
                )
            } else {
                try Activity.update(activityId, content: .init(state: state))
            }
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

    func endActivity(
        activityId: String,
        content: LiveActivityContent,
        dismissalPolicy: LiveActivityDismissalPolicy?
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

        let state = Activity<LiveActivityAttributes>.ContentState(content)
        do {
            let policy: Activity<LiveActivityAttributes>.DismissalPolicy? = {
                guard let dp = dismissalPolicy else { return nil }
                switch dp {
                case .default:
                    return .default
                case .immediate:
                    return .immediate
                case .after:
                    // Not supported without a date; use default
                    return .default
                @unknown default:
                    return .default
                }
            }()

            if #available(iOS 17.2, *) {
                try Activity.end(activityId, content: .init(state: state), dismissalPolicy: policy, timestamp: nil)
            } else {
                try Activity.end(activityId, content: .init(state: state), dismissalPolicy: policy)
            }
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
}

// MARK: - Hex helper

extension Data {
    fileprivate init?(hex string: String) {
        let len = string.count
        guard len % 2 == 0 else { return nil }
        self.init(capacity: len / 2)
        var index = string.startIndex
        for _ in 0..<len / 2 {
            let nextIndex = string.index(index, offsetBy: 2)
            let byteString = string[index..<nextIndex]
            guard let byte = UInt8(byteString, radix: 16) else { return nil }
            append(byte)
            index = nextIndex
        }
    }
}
