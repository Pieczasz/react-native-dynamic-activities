# ActivityStyle Guide

This guide explains Apple's `ActivityStyle` enum support in React Native Dynamic Activities, including usage patterns, requirements, and behavioral differences.

## Overview

`ActivityStyle` is Apple's enum for controlling Live Activity presentation behavior, available from iOS 16.1+ but requiring iOS 18.0+ for practical usage. It defines how Live Activities appear and behave on the user's device.

## ActivityStyle Options

### `"standard"` (Default)
```typescript
await DynamicActivities.startLiveActivity(
  attributes,
  content,
  undefined, // pushToken
  'standard' // ActivityStyle
);
```

**Behavior:**
- **Default Live Activity behavior**
- Appears in Dynamic Island (if available) and Lock Screen
- Remains visible according to system policies
- Full interaction support
- **Recommended for most use cases**

### `"transient"`
```typescript  
await DynamicActivities.startLiveActivity(
  attributes,
  content,
  undefined, // pushToken
  'transient' // ActivityStyle
);
```

**Behavior:**
- **Brief, temporary presentation**
- Appears briefly then disappears automatically
- Minimal user interaction
- Suitable for quick notifications or status updates
- **Use sparingly** for non-persistent information

## Version Requirements

### iOS Version Support
| iOS Version | ActivityStyle Support | Notes |
|-------------|---------------------|-------|
| **iOS 16.1+** | 🟡 Enum defined | ActivityStyle enum exists but not usable |
| **iOS 16.2 - 17.x** | 🔄 Fallback | Falls back to standard Activity.request() |
| **iOS 18.0+** | ✅ **Full Support** | ActivityStyle parameter works in Activity.request() |

### Implementation Details
The library automatically handles version compatibility:

```swift
// iOS 18.0+ - Uses ActivityStyle
if #available(iOS 18.0, *), let style = style {
    let activityStyle: ActivityStyle = style == "transient" ? .transient : .standard
    activity = try Activity.request(
        attributes: genericAttributes,
        content: content,
        style: activityStyle
    )
} else if #available(iOS 16.2, *) {
    // iOS 16.2+ - Fallback without style
    activity = try Activity.request(
        attributes: genericAttributes,
        content: content
    )
}
```

## Platform Support

| Platform | ActivityStyle Support | Notes |
|----------|---------------------|-------|
| **iOS 18.0+** | ✅ Full | Both 'standard' and 'transient' work as expected |
| **iOS 16.2-17.x** | 🔄 Fallback | Parameter ignored, uses standard behavior |
| **Android** | ❌ Stub | All methods reject with descriptive errors |