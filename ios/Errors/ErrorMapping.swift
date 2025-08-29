import ActivityKit
import Foundation

// MARK: - Error Creation

/**
 * Creates structured NSError instances for Live Activities operations.
 *
 * - Parameters:
 *   - code: Error code matching TypeScript `LiveActivityErrorCode` enum
 *   - message: Human-readable error description
 *   - domain: Error domain for categorization
 * - Returns: NSError with comprehensive userInfo dictionary
 */
func makeNSError(code: String, message: String, domain: String) -> NSError {
  let userInfo: [String: Any] = [
    NSLocalizedDescriptionKey: message,
    NSDebugDescriptionErrorKey: message,
    NSLocalizedFailureReasonErrorKey: message,
    NSLocalizedRecoverySuggestionErrorKey: getRecoverySuggestion(for: code, domain: domain),
    "code": code,
    "errorDomain": domain,
  ]

  // Assign meaningful numeric codes for different error types
  let numericCode = getNumericCode(for: domain)
  return NSError(domain: domain, code: numericCode, userInfo: userInfo)
}

/**
 * Provides contextual recovery suggestions based on error type.
 */
private func getRecoverySuggestion(for code: String, domain: String) -> String {
  switch (domain, code) {
  case ("LiveActivityAuthorizationError", "denied"):
    "Enable Live Activities in Settings > [Your App] > Live Activities"
  case ("LiveActivityAuthorizationError", "unentitled"):
    "Add Live Activities entitlement to your app in Xcode"
  case ("LiveActivityAuthorizationError", "attributesTooLarge"):
    "Reduce the size of activity attributes to under 4KB"
  case ("LiveActivitySystemError", "noBridge"):
    "Call LiveActivityBridgeRegistry.shared.registerBridge() in your app initialization"
  case ("LiveActivitySystemError", "unsupported"):
    "Update to iOS 16.2 or later to use Live Activities"
  default:
    "Check the error details and try again"
  }
}

/**
 * Maps error domains to numeric codes for NSError compatibility.
 */
private func getNumericCode(for domain: String) -> Int {
  switch domain {
  case "LiveActivityAuthorizationError": 1001
  case "LiveActivitySystemError": 2001
  default: 9001
  }
}

// MARK: - ActivityKit Error Mapping

/**
 * Maps ActivityKit authorization errors to structured JavaScript errors.
 *
 * **Error Mapping Strategy:**
 * - Maintains exact correspondence with Apple's `ActivityAuthorizationError` cases
 * - Provides consistent error codes that match TypeScript definitions
 * - Uses Apple's official error descriptions for accuracy
 *
 * - Parameter error: Native ActivityKit authorization error
 * - Returns: NSError with structured information for JavaScript consumption
 */
@available(iOS 16.2, *)
func mapAuthorizationError(_ error: ActivityAuthorizationError) -> NSError {
  let errorMapping: (code: String, message: String) = {
    switch error {
    case .attributesTooLarge:
      return (
        code: "attributesTooLarge",
        message: "The provided Live Activity attributes exceeded the maximum size of 4KB."
      )
    case .denied:
      return (
        code: "denied",
        message: "A person deactivated Live Activities in Settings."
      )
    case .globalMaximumExceeded:
      return (
        code: "globalMaximumExceeded",
        message: "The device reached the maximum number of ongoing Live Activities."
      )
    case .malformedActivityIdentifier:
      return (
        code: "malformedActivityIdentifier",
        message: "The provided activity identifier is malformed."
      )
    case .missingProcessIdentifier:
      return (
        code: "missingProcessIdentifier",
        message: "The process that tried to start the Live Activity is missing a process identifier."
      )
    case .persistenceFailure:
      return (
        code: "persistenceFailure",
        message: "The system couldn't persist the Live Activity."
      )
    case .reconnectNotPermitted:
      return (
        code: "reconnectNotPermitted",
        message: "The process that tried to recreate the Live Activity is not the same process that originally created it."
      )
    case .targetMaximumExceeded:
      return (
        code: "targetMaximumExceeded",
        message: "The app has already started the maximum number of concurrent Live Activities."
      )
    case .unentitled:
      return (
        code: "unentitled",
        message: "The app doesn't have the required entitlement to start a Live Activity."
      )
    case .unsupported:
      return (
        code: "unsupported",
        message: "The device doesn't support Live Activities."
      )
    case .unsupportedTarget:
      return (
        code: "unsupportedTarget",
        message: "The app target doesn't have the required entitlement to start Live Activities."
      )
    case .visibility:
      return (
        code: "visibility",
        message: "The app tried to start the Live Activity while it was in the background."
      )
    @unknown default:
      return (
        code: "unknownError",
        message: "An unknown authorization error occurred: \(error.localizedDescription)"
      )
    }
  }()

  return makeNSError(
    code: errorMapping.code,
    message: errorMapping.message,
    domain: "LiveActivityAuthorizationError"
  )
}

// MARK: - System Error Helpers

/**
 * Creates a system error for unsupported iOS versions.
 *
 * - Returns: NSError indicating iOS version incompatibility
 */
func unsupportedVersionError() -> NSError {
  let currentVersion = ProcessInfo.processInfo.operatingSystemVersion
  let versionString = "\(currentVersion.majorVersion).\(currentVersion.minorVersion)"

  return makeNSError(
    code: "unsupported",
    message: "Live Activities require iOS 16.2 or later (current: iOS \(versionString))",
    domain: "LiveActivitySystemError"
  )
}
