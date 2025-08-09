import ActivityKit
import Foundation

func makeNSError(code: String, message: String, domain: String) -> NSError {
    let userInfo: [String: Any] = [
        NSLocalizedDescriptionKey: message,
        NSDebugDescriptionErrorKey: message,
        NSUnderlyingErrorKey: message,
        NSLocalizedFailureReasonErrorKey: message,
        NSLocalizedRecoverySuggestionErrorKey: "See Settings > [Your App] > Live Activities",
        "code": code,
        "errorDomain": domain
    ]
    let numericCode = (domain == "LiveActivityAuthorizationError") ? 1001 : 2001
    return NSError(domain: domain, code: numericCode, userInfo: userInfo)
}

@available(iOS 16.2, *)
func mapAuthorizationError(_ error: ActivityAuthorizationError) -> NSError {
    switch error {
    case .attributesTooLarge:
        return makeNSError(
            code: "attributesTooLarge",
            message: "The provided Live Activity attributes exceeded the maximum size of 4KB.",
            domain: "LiveActivityAuthorizationError"
        )
    case .denied:
        return makeNSError(
            code: "denied",
            message: "A person deactivated Live Activities in Settings.",
            domain: "LiveActivityAuthorizationError"
        )
    case .globalMaximumExceeded:
        return makeNSError(
            code: "globalMaximumExceeded",
            message: "The device reached the maximum number of ongoing Live Activities.",
            domain: "LiveActivityAuthorizationError"
        )
    case .malformedActivityIdentifier:
        return makeNSError(
            code: "malformedActivityIdentifier",
            message: "The provided activity identifier is malformed.",
            domain: "LiveActivityAuthorizationError"
        )
    case .missingProcessIdentifier:
        return makeNSError(
            code: "missingProcessIdentifier",
            message: "The process that tried to start the Live Activity is missing a process identifier.",
            domain: "LiveActivityAuthorizationError"
        )
    case .persistenceFailure:
        return makeNSError(
            code: "persistenceFailure",
            message: "The system couldn't persist the Live Activity.",
            domain: "LiveActivityAuthorizationError"
        )
    case .reconnectNotPermitted:
        return makeNSError(
            code: "reconnectNotPermitted",
            message: "The process that tried to recreate the Live Activity " +
            "is not the same process that originally created it.",
            domain: "LiveActivityAuthorizationError"
        )
    case .targetMaximumExceeded:
        return makeNSError(
            code: "targetMaximumExceeded",
            message: "The app has already started the maximum number of concurrent Live Activities.",
            domain: "LiveActivityAuthorizationError"
        )
    case .unentitled:
        return makeNSError(
            code: "unentitled",
            message: "The app doesn't have the required entitlement to start a Live Activity.",
            domain: "LiveActivityAuthorizationError"
        )
    case .unsupported:
        return makeNSError(
            code: "unsupported",
            message: "The device doesn't support Live Activities.",
            domain: "LiveActivityAuthorizationError"
        )
    case .unsupportedTarget:
        return makeNSError(
            code: "unsupportedTarget",
            message: "The app doesn't have the required entitlement to start a Live Activity.",
            domain: "LiveActivityAuthorizationError"
        )
    case .visibility:
        return makeNSError(
            code: "visibility",
            message: "The app tried to start the Live Activity while it was in the background.",
            domain: "LiveActivityAuthorizationError"
        )
    @unknown default:
        return makeNSError(
            code: "unknownError",
            message: "An unknown authorization error occurred.",
            domain: "LiveActivityAuthorizationError"
        )
    }
}

func unsupportedVersionError() -> NSError {
    makeNSError(
        code: "unsupported",
        message: "Live Activities require iOS 16.2 or later",
        domain: "LiveActivitySystemError"
    )
}
