export enum LiveActivityErrorCode {
  // Authorization Errors - matching Apple's ActivityAuthorizationError exactly
  // https://developer.apple.com/documentation/activitykit/activityauthorizationerror
  ATTRIBUTES_TOO_LARGE = 'attributesTooLarge',
  DENIED = 'denied',
  GLOBAL_MAXIMUM_EXCEEDED = 'globalMaximumExceeded',
  MALFORMED_ACTIVITY_IDENTIFIER = 'malformedActivityIdentifier',
  MISSING_PROCESS_IDENTIFIER = 'missingProcessIdentifier',
  PERSISTENCE_FAILURE = 'persistenceFailure',
  RECONNECT_NOT_PERMITTED = 'reconnectNotPermitted',
  TARGET_MAXIMUM_EXCEEDED = 'targetMaximumExceeded',
  UNENTITLED = 'unentitled',
  UNSUPPORTED = 'unsupported',
  UNSUPPORTED_TARGET = 'unsupportedTarget',
  VISIBILITY = 'visibility',

  // Additional system-level errors
  NETWORK_ERROR = 'networkError',
  UNKNOWN_ERROR = 'unknownError',
}

export interface LiveActivityErrorInfo {
  code: LiveActivityErrorCode
  message: string
  failureReason?: string
  recoverySuggestion?: string
  nativeError?: unknown
  activityId?: string
  timestamp: Date
  errorCode?: number
  errorDomain?: string
}

export interface LiveActivityAuthorizationError extends LiveActivityErrorInfo {
  code:
    | LiveActivityErrorCode.ATTRIBUTES_TOO_LARGE
    | LiveActivityErrorCode.DENIED
    | LiveActivityErrorCode.GLOBAL_MAXIMUM_EXCEEDED
    | LiveActivityErrorCode.MALFORMED_ACTIVITY_IDENTIFIER
    | LiveActivityErrorCode.MISSING_PROCESS_IDENTIFIER
    | LiveActivityErrorCode.PERSISTENCE_FAILURE
    | LiveActivityErrorCode.RECONNECT_NOT_PERMITTED
    | LiveActivityErrorCode.TARGET_MAXIMUM_EXCEEDED
    | LiveActivityErrorCode.UNENTITLED
    | LiveActivityErrorCode.UNSUPPORTED
    | LiveActivityErrorCode.UNSUPPORTED_TARGET
    | LiveActivityErrorCode.VISIBILITY
}

export interface LiveActivitySystemError extends LiveActivityErrorInfo {
  code:
    | LiveActivityErrorCode.NETWORK_ERROR
    | LiveActivityErrorCode.UNKNOWN_ERROR
}

// All possible Live Activity errors
export type LiveActivityError =
  | LiveActivityAuthorizationError
  | LiveActivitySystemError

// Error factory functions for creating specific error types
export namespace LiveActivityErrorFactory {
  export function createAuthorizationError(
    code:
      | LiveActivityErrorCode.ATTRIBUTES_TOO_LARGE
      | LiveActivityErrorCode.DENIED
      | LiveActivityErrorCode.GLOBAL_MAXIMUM_EXCEEDED
      | LiveActivityErrorCode.MALFORMED_ACTIVITY_IDENTIFIER
      | LiveActivityErrorCode.MISSING_PROCESS_IDENTIFIER
      | LiveActivityErrorCode.PERSISTENCE_FAILURE
      | LiveActivityErrorCode.RECONNECT_NOT_PERMITTED
      | LiveActivityErrorCode.TARGET_MAXIMUM_EXCEEDED
      | LiveActivityErrorCode.UNENTITLED
      | LiveActivityErrorCode.UNSUPPORTED
      | LiveActivityErrorCode.UNSUPPORTED_TARGET
      | LiveActivityErrorCode.VISIBILITY,
    message?: string,
    options?: {
      failureReason?: string
      recoverySuggestion?: string
      nativeError?: unknown
      activityId?: string
      errorCode?: number
      errorDomain?: string
    }
  ): LiveActivityAuthorizationError {
    return {
      code,
      message: message || LiveActivityErrorMessages[code],
      failureReason: options?.failureReason,
      recoverySuggestion: options?.recoverySuggestion,
      nativeError: options?.nativeError,
      activityId: options?.activityId,
      timestamp: new Date(),
      errorCode: options?.errorCode,
      errorDomain: options?.errorDomain,
    }
  }

  export function createSystemError(
    code:
      | LiveActivityErrorCode.NETWORK_ERROR
      | LiveActivityErrorCode.UNKNOWN_ERROR,
    message?: string,
    options?: {
      failureReason?: string
      recoverySuggestion?: string
      nativeError?: unknown
      activityId?: string
      errorCode?: number
      errorDomain?: string
    }
  ): LiveActivitySystemError {
    return {
      code,
      message: message || LiveActivityErrorMessages[code],
      failureReason: options?.failureReason,
      recoverySuggestion: options?.recoverySuggestion,
      nativeError: options?.nativeError,
      activityId: options?.activityId,
      timestamp: new Date(),
      errorCode: options?.errorCode,
      errorDomain: options?.errorDomain,
    }
  }

  export function createErrorFromNativeError(
    nativeError: unknown,
    activityId?: string
  ): LiveActivityError {
    if (typeof nativeError === 'object' && nativeError !== null) {
      const error = nativeError as Record<string, unknown>
      const code = String(
        error.code || error.localizedDescription || 'unknownError'
      )
      const message = String(
        error.localizedDescription || 'An unknown error occurred'
      )
      const failureReason = error.failureReason
        ? String(error.failureReason)
        : undefined
      const recoverySuggestion = error.recoverySuggestion
        ? String(error.recoverySuggestion)
        : undefined
      const errorCode = error.errorCode ? Number(error.errorCode) : undefined
      const errorDomain = error.errorDomain
        ? String(error.errorDomain)
        : undefined

      const mappedCode = mapNativeErrorCode(code)

      if (isAuthorizationErrorCode(mappedCode)) {
        return createAuthorizationError(
          mappedCode as LiveActivityAuthorizationError['code'],
          message,
          {
            failureReason,
            recoverySuggestion,
            nativeError,
            activityId,
            errorCode,
            errorDomain,
          }
        )
      }

      return createSystemError(
        mappedCode as
          | LiveActivityErrorCode.NETWORK_ERROR
          | LiveActivityErrorCode.UNKNOWN_ERROR,
        message,
        {
          failureReason,
          recoverySuggestion,
          nativeError,
          activityId,
          errorCode,
          errorDomain,
        }
      )
    }

    return createSystemError(
      LiveActivityErrorCode.UNKNOWN_ERROR,
      'An unknown error occurred',
      {
        nativeError,
        activityId,
      }
    )
  }
}

function mapNativeErrorCode(nativeCode: string): LiveActivityErrorCode {
  switch (nativeCode) {
    case 'attributesTooLarge':
      return LiveActivityErrorCode.ATTRIBUTES_TOO_LARGE
    case 'denied':
      return LiveActivityErrorCode.DENIED
    case 'globalMaximumExceeded':
      return LiveActivityErrorCode.GLOBAL_MAXIMUM_EXCEEDED
    case 'malformedActivityIdentifier':
      return LiveActivityErrorCode.MALFORMED_ACTIVITY_IDENTIFIER
    case 'missingProcessIdentifier':
      return LiveActivityErrorCode.MISSING_PROCESS_IDENTIFIER
    case 'persistenceFailure':
      return LiveActivityErrorCode.PERSISTENCE_FAILURE
    case 'reconnectNotPermitted':
      return LiveActivityErrorCode.RECONNECT_NOT_PERMITTED
    case 'targetMaximumExceeded':
      return LiveActivityErrorCode.TARGET_MAXIMUM_EXCEEDED
    case 'unentitled':
      return LiveActivityErrorCode.UNENTITLED
    case 'unsupported':
      return LiveActivityErrorCode.UNSUPPORTED
    case 'unsupportedTarget':
      return LiveActivityErrorCode.UNSUPPORTED_TARGET
    case 'visibility':
      return LiveActivityErrorCode.VISIBILITY
    case 'networkError':
      return LiveActivityErrorCode.NETWORK_ERROR
    default:
      return LiveActivityErrorCode.UNKNOWN_ERROR
  }
}

function isAuthorizationErrorCode(code: LiveActivityErrorCode): boolean {
  return [
    LiveActivityErrorCode.ATTRIBUTES_TOO_LARGE,
    LiveActivityErrorCode.DENIED,
    LiveActivityErrorCode.GLOBAL_MAXIMUM_EXCEEDED,
    LiveActivityErrorCode.MALFORMED_ACTIVITY_IDENTIFIER,
    LiveActivityErrorCode.MISSING_PROCESS_IDENTIFIER,
    LiveActivityErrorCode.PERSISTENCE_FAILURE,
    LiveActivityErrorCode.RECONNECT_NOT_PERMITTED,
    LiveActivityErrorCode.TARGET_MAXIMUM_EXCEEDED,
    LiveActivityErrorCode.UNENTITLED,
    LiveActivityErrorCode.UNSUPPORTED,
    LiveActivityErrorCode.UNSUPPORTED_TARGET,
    LiveActivityErrorCode.VISIBILITY,
  ].includes(code)
}

// Error messages matching Apple's descriptions
// https://developer.apple.com/documentation/activitykit/activityauthorizationerror
export const LiveActivityErrorMessages = {
  [LiveActivityErrorCode.ATTRIBUTES_TOO_LARGE]:
    'The provided Live Activity attributes exceeded the maximum size of 4KB.',
  [LiveActivityErrorCode.DENIED]:
    'A person deactivated Live Activities in Settings.',
  [LiveActivityErrorCode.GLOBAL_MAXIMUM_EXCEEDED]:
    'The device reached the maximum number of ongoing Live Activities.',
  [LiveActivityErrorCode.MALFORMED_ACTIVITY_IDENTIFIER]:
    'The provided activity identifier is malformed.',
  [LiveActivityErrorCode.MISSING_PROCESS_IDENTIFIER]:
    'The process that tried to start the Live Activity is missing a process identifier.',
  [LiveActivityErrorCode.PERSISTENCE_FAILURE]:
    "The system couldn't persist the Live Activity.",
  [LiveActivityErrorCode.RECONNECT_NOT_PERMITTED]:
    'The process that tried to recreate the Live Activity is not the process that originally created the Live Activity.',
  [LiveActivityErrorCode.TARGET_MAXIMUM_EXCEEDED]:
    'The app has already started the maximum number of concurrent Live Activities.',
  [LiveActivityErrorCode.UNENTITLED]:
    "The app doesn't have the required entitlement to start a Live Activity.",
  [LiveActivityErrorCode.UNSUPPORTED]:
    "The device doesn't support Live Activities.",
  [LiveActivityErrorCode.UNSUPPORTED_TARGET]:
    "The app doesn't have the required entitlement to start a Live Activities.",
  [LiveActivityErrorCode.VISIBILITY]:
    'The app tried to start the Live Activity while it was in the background.',
  [LiveActivityErrorCode.NETWORK_ERROR]:
    'A network error occurred while processing the request.',
  [LiveActivityErrorCode.UNKNOWN_ERROR]: 'An unknown error occurred.',
} as const

// Recovery suggestions for common errors
export const LiveActivityRecoverySuggestions = {
  [LiveActivityErrorCode.ATTRIBUTES_TOO_LARGE]:
    'Reduce the size of the Live Activity attributes to under 4KB.',
  [LiveActivityErrorCode.DENIED]:
    'Ask the user to enable Live Activities in Settings > [Your App] > Live Activities.',
  [LiveActivityErrorCode.GLOBAL_MAXIMUM_EXCEEDED]:
    'Wait for some Live Activities to end before starting new ones.',
  [LiveActivityErrorCode.MALFORMED_ACTIVITY_IDENTIFIER]:
    'Ensure the activity identifier follows the correct format.',
  [LiveActivityErrorCode.MISSING_PROCESS_IDENTIFIER]:
    'Restart the app and try again.',
  [LiveActivityErrorCode.PERSISTENCE_FAILURE]:
    'Try again later. If the problem persists, restart the app.',
  [LiveActivityErrorCode.RECONNECT_NOT_PERMITTED]:
    'Only the original process can recreate this Live Activity.',
  [LiveActivityErrorCode.TARGET_MAXIMUM_EXCEEDED]:
    'End some existing Live Activities before starting new ones.',
  [LiveActivityErrorCode.UNENTITLED]:
    'Ensure your app has the required Live Activity entitlement.',
  [LiveActivityErrorCode.UNSUPPORTED]:
    'Live Activities require iOS 16.1 or later.',
  [LiveActivityErrorCode.UNSUPPORTED_TARGET]:
    'Ensure your app target has the required Live Activity entitlement.',
  [LiveActivityErrorCode.VISIBILITY]:
    'Start Live Activities only when your app is in the foreground.',
  [LiveActivityErrorCode.NETWORK_ERROR]:
    'Check your internet connection and try again.',
  [LiveActivityErrorCode.UNKNOWN_ERROR]:
    'Try again later. If the problem persists, restart the app.',
} as const

export const LIVE_ACTIVITY_ERROR_DOMAIN = 'com.dynamicactivities.liveactivities'

export function isLiveActivityError(
  error: unknown
): error is LiveActivityError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    'timestamp' in error &&
    Object.values(LiveActivityErrorCode).includes(
      (error as { code: LiveActivityErrorCode }).code
    )
  )
}

export function isAuthorizationError(
  error: LiveActivityError
): error is LiveActivityAuthorizationError {
  return isAuthorizationErrorCode(error.code)
}

export function isSystemError(
  error: LiveActivityError
): error is LiveActivitySystemError {
  return [
    LiveActivityErrorCode.NETWORK_ERROR,
    LiveActivityErrorCode.UNKNOWN_ERROR,
  ].includes(error.code)
}

export enum LiveActivityErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export const LiveActivityErrorSeverityMap = {
  [LiveActivityErrorCode.ATTRIBUTES_TOO_LARGE]:
    LiveActivityErrorSeverity.MEDIUM,
  [LiveActivityErrorCode.DENIED]: LiveActivityErrorSeverity.HIGH,
  [LiveActivityErrorCode.GLOBAL_MAXIMUM_EXCEEDED]:
    LiveActivityErrorSeverity.MEDIUM,
  [LiveActivityErrorCode.MALFORMED_ACTIVITY_IDENTIFIER]:
    LiveActivityErrorSeverity.HIGH,
  [LiveActivityErrorCode.MISSING_PROCESS_IDENTIFIER]:
    LiveActivityErrorSeverity.CRITICAL,
  [LiveActivityErrorCode.PERSISTENCE_FAILURE]: LiveActivityErrorSeverity.HIGH,
  [LiveActivityErrorCode.RECONNECT_NOT_PERMITTED]:
    LiveActivityErrorSeverity.HIGH,
  [LiveActivityErrorCode.TARGET_MAXIMUM_EXCEEDED]:
    LiveActivityErrorSeverity.MEDIUM,
  [LiveActivityErrorCode.UNENTITLED]: LiveActivityErrorSeverity.CRITICAL,
  [LiveActivityErrorCode.UNSUPPORTED]: LiveActivityErrorSeverity.CRITICAL,
  [LiveActivityErrorCode.UNSUPPORTED_TARGET]:
    LiveActivityErrorSeverity.CRITICAL,
  [LiveActivityErrorCode.VISIBILITY]: LiveActivityErrorSeverity.MEDIUM,
  [LiveActivityErrorCode.NETWORK_ERROR]: LiveActivityErrorSeverity.LOW,
  [LiveActivityErrorCode.UNKNOWN_ERROR]: LiveActivityErrorSeverity.MEDIUM,
} as const

export function getErrorSeverity(
  error: LiveActivityError
): LiveActivityErrorSeverity {
  return LiveActivityErrorSeverityMap[error.code]
}
