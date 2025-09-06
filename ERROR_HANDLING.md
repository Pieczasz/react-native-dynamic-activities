# Error Handling Guide

This guide covers comprehensive error handling for React Native Dynamic Activities, including all error types, recovery strategies, and best practices.

## Overview

The library provides a robust error handling system that maps Apple's `ActivityAuthorizationError` codes exactly, plus additional system-level errors. All errors are structured, typed, and include recovery suggestions.

## Error Types

### 1. Authorization Errors
These occur when the user or system prevents Live Activities from being created or managed.

#### Common Authorization Errors

##### `DENIED` - User Disabled Live Activities
```typescript
import { LiveActivityErrorCode, isLiveActivityError } from 'react-native-dynamic-activities';

try {
  await DynamicActivities.startLiveActivity(attributes, content);
} catch (error) {
  if (isLiveActivityError(error) && error.code === LiveActivityErrorCode.DENIED) {
    // User has disabled Live Activities in Settings
    showSettingsPrompt('Please enable Live Activities in Settings > [Your App] > Live Activities');
  }
}
```

**Recovery:** Guide user to Settings → [Your App] → Live Activities

##### `UNENTITLED` - Missing Entitlements
```typescript
if (error.code === LiveActivityErrorCode.UNENTITLED) {
  console.error('Live Activities entitlement missing from app configuration');
  // This is a development/configuration issue
}
```

**Recovery:** Add Live Activities capability in Xcode project settings

##### `ATTRIBUTES_TOO_LARGE` - Data Size Limit
```typescript
if (error.code === LiveActivityErrorCode.ATTRIBUTES_TOO_LARGE) {
  console.error('Activity data exceeds 4KB limit');
  // Reduce the size of your attributes data
}
```

**Recovery:** Reduce attribute data to under 4KB

##### `TARGET_MAXIMUM_EXCEEDED` - Too Many Activities
```typescript
if (error.code === LiveActivityErrorCode.TARGET_MAXIMUM_EXCEEDED) {
  console.error('App has reached maximum concurrent Live Activities');
  // End some existing activities before starting new ones
}
```

**Recovery:** End existing activities before starting new ones

##### `GLOBAL_MAXIMUM_EXCEEDED` - Device Limit
```typescript
if (error.code === LiveActivityErrorCode.GLOBAL_MAXIMUM_EXCEEDED) {
  console.error('Device has reached system-wide Live Activity limit');
  // User needs to wait or end other apps\' activities
}
```

**Recovery:** User must wait for other activities to end

##### `VISIBILITY` - Background Start Attempt
```typescript
if (error.code === LiveActivityErrorCode.VISIBILITY) {
  console.error('Cannot start Live Activity while app is in background');
  // Only start activities when app is in foreground
}
```

**Recovery:** Only start Live Activities when app is in foreground

### 2. System Errors

##### `UNSUPPORTED` - iOS Version Too Old
```typescript
if (error.code === LiveActivityErrorCode.UNSUPPORTED) {
  console.error('Live Activities require iOS 16.2 or later');
  // Show appropriate message to user
}
```

**Recovery:** Inform user about iOS version requirement

##### `NETWORK_ERROR` - Network Issues
```typescript
if (error.code === LiveActivityErrorCode.NETWORK_ERROR) {
  console.error('Network error during Live Activity operation');
  // Retry after checking connectivity
}
```

**Recovery:** Check network connection and retry

##### `UNKNOWN_ERROR` - Unexpected Issues
```typescript
if (error.code === LiveActivityErrorCode.UNKNOWN_ERROR) {
  console.error('An unexpected error occurred:', error.message);
  // Log for debugging, provide generic error message to user
}
```

**Recovery:** Generic retry or contact support

## Error Object Structure

All Live Activity errors implement the `LiveActivityError` interface:

```typescript
interface LiveActivityError {
  code: LiveActivityErrorCode;           // Specific error code
  message: string;                       // Human-readable description
  failureReason?: string;                // Technical reason for failure
  recoverySuggestion?: string;           // How to fix the issue
  nativeError?: unknown;                 // Original native error
  activityId?: string;                   // Associated activity ID
  timestamp: Date;                       // When the error occurred
  errorCode?: number;                    // Native error code
  errorDomain?: string;                  // Native error domain
}
```

## Error Detection and Utilities

### Type Guards

```typescript
import { 
  isLiveActivityError, 
  isAuthorizationError, 
  isSystemError 
} from 'react-native-dynamic-activities';

try {
  await someOperation();
} catch (error) {
  if (isLiveActivityError(error)) {
    // It's a Live Activity error
    
    if (isAuthorizationError(error)) {
      // User/permission related error
      handleAuthorizationError(error);
    } else if (isSystemError(error)) {
      // System/network related error
      handleSystemError(error);
    }
  } else {
    // Some other kind of error
    console.error('Unexpected error type:', error);
  }
}
```

### Error Severity

```typescript
import { getErrorSeverity, LiveActivityErrorSeverity } from 'react-native-dynamic-activities';

if (isLiveActivityError(error)) {
  const severity = getErrorSeverity(error);
  
  switch (severity) {
    case LiveActivityErrorSeverity.LOW:
      // Network issues, temporary problems
      console.warn('Temporary issue:', error.message);
      break;
      
    case LiveActivityErrorSeverity.MEDIUM:
      // Size limits, activity limits
      console.error('Fixable issue:', error.message);
      break;
      
    case LiveActivityErrorSeverity.HIGH:
      // User disabled, permissions
      console.error('User action required:', error.message);
      break;
      
    case LiveActivityErrorSeverity.CRITICAL:
      // Missing entitlements, unsupported device
      console.error('Configuration issue:', error.message);
      break;
  }
}
```

## Error Factory Functions

For creating custom errors or handling native errors:

```typescript
import { LiveActivityErrorFactory } from 'react-native-dynamic-activities';

// Create authorization error
const authError = LiveActivityErrorFactory.createAuthorizationError(
  LiveActivityErrorCode.DENIED,
  'Custom error message',
  {
    failureReason: 'User disabled in settings',
    recoverySuggestion: 'Enable in Settings app',
    activityId: 'my-activity-id'
  }
);

// Create from native error
const nativeError = { code: 'denied', localizedDescription: 'Access denied' };
const mappedError = LiveActivityErrorFactory.createErrorFromNativeError(nativeError);
```

## Best Practices

### 1. Always Use Type Guards
```typescript
// ❌ Don't assume error structure
try {
  await operation();
} catch (error: any) {
  console.error(error.code); // Might not exist!
}

// ✅ Use type guards
try {
  await operation();
} catch (error) {
  if (isLiveActivityError(error)) {
    console.error('Live Activity error:', error.code);
    console.log('Recovery:', error.recoverySuggestion);
  } else {
    console.error('Other error:', error);
  }
}
```

### 2. Handle Specific Error Codes
```typescript
// ✅ Handle specific errors with appropriate actions
try {
  await DynamicActivities.startLiveActivity(attributes, content);
} catch (error) {
  if (!isLiveActivityError(error)) {
    console.error('Unexpected error:', error);
    return;
  }

  switch (error.code) {
    case LiveActivityErrorCode.DENIED:
      showPermissionDialog();
      break;
      
    case LiveActivityErrorCode.ATTRIBUTES_TOO_LARGE:
      reduceDataSize();
      break;
      
    case LiveActivityErrorCode.TARGET_MAXIMUM_EXCEEDED:
      endOldActivities();
      break;
      
    case LiveActivityErrorCode.UNSUPPORTED:
      showUnsupportedMessage();
      break;
      
    default:
      showGenericError(error.message);
  }
}
```

### 3. Provide User-Friendly Messages
```typescript
function getUserFriendlyMessage(error: LiveActivityError): string {
  switch (error.code) {
    case LiveActivityErrorCode.DENIED:
      return 'Live Activities are disabled. Please enable them in Settings.';
      
    case LiveActivityErrorCode.UNSUPPORTED:
      return 'Live Activities require iOS 16.2 or later.';
      
    case LiveActivityErrorCode.ATTRIBUTES_TOO_LARGE:
      return 'The activity data is too large. Please try again.';
      
    case LiveActivityErrorCode.TARGET_MAXIMUM_EXCEEDED:
      return 'Too many active notifications. Please wait a moment.';
      
    default:
      return 'Something went wrong. Please try again.';
  }
}
```

### 4. Implement Retry Logic
```typescript
async function startActivityWithRetry(
  attributes: LiveActivityAttributes, 
  content: LiveActivityContent,
  maxRetries: number = 3
): Promise<LiveActivityStartResult> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await DynamicActivities.startLiveActivity(attributes, content);
    } catch (error) {
      lastError = error;
      
      if (isLiveActivityError(error)) {
        // Don't retry certain errors
        if ([
          LiveActivityErrorCode.DENIED,
          LiveActivityErrorCode.UNENTITLED,
          LiveActivityErrorCode.UNSUPPORTED
        ].includes(error.code)) {
          throw error; // Don't retry these
        }
      }
      
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError!;
}
```

### 5. Log Errors for Debugging
```typescript
function logError(error: unknown, context: string) {
  if (isLiveActivityError(error)) {
    console.group(`Live Activity Error - ${context}`);
    console.error('Code:', error.code);
    console.error('Message:', error.message);
    console.error('Recovery:', error.recoverySuggestion);
    console.error('Severity:', getErrorSeverity(error));
    console.error('Timestamp:', error.timestamp.toISOString());
    if (error.activityId) console.error('Activity ID:', error.activityId);
    if (error.nativeError) console.error('Native Error:', error.nativeError);
    console.groupEnd();
  } else {
    console.error(`Unexpected error in ${context}:`, error);
  }
}
```

## Complete Error Handling Example

```typescript
import {
  DynamicActivities,
  LiveActivityErrorCode,
  isLiveActivityError,
  isAuthorizationError,
  getErrorSeverity,
  LiveActivityErrorSeverity
} from 'react-native-dynamic-activities';

async function createLiveActivity() {
  try {
    // Check support first
    const support = await DynamicActivities.areLiveActivitiesSupported();
    if (!support.supported) {
      throw new Error(`Live Activities not supported: ${support.comment}`);
    }

    // Start the activity
    const result = await DynamicActivities.startLiveActivity(
      { title: 'Delivery', body: 'Your order is on the way' },
      { state: 'active', relevanceScore: 1.0 }
    );

    console.log('Live Activity started:', result.activityId);
    return result;

  } catch (error) {
    if (isLiveActivityError(error)) {
      const severity = getErrorSeverity(error);
      
      console.error(`Live Activity Error (${severity}):`, {
        code: error.code,
        message: error.message,
        recovery: error.recoverySuggestion,
        timestamp: error.timestamp
      });

      // Handle based on error type and severity
      if (isAuthorizationError(error)) {
        switch (error.code) {
          case LiveActivityErrorCode.DENIED:
            showPermissionDialog();
            break;
          case LiveActivityErrorCode.UNENTITLED:
            reportConfigurationError();
            break;
          default:
            showAuthError(error.message);
        }
      } else {
        // System error
        if (severity === LiveActivityErrorSeverity.LOW) {
          // Retry for network errors
          setTimeout(() => createLiveActivity(), 2000);
        } else {
          showSystemError(error.message);
        }
      }
    } else {
      console.error('Unexpected error:', error);
      showGenericError();
    }
  }
}
```

This comprehensive error handling ensures robust operation and good user experience even when things go wrong.