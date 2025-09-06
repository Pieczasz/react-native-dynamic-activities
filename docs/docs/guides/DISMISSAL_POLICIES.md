# Live Activity Dismissal Policies

This document explains the different dismissal policies available when ending Live Activities and their behavior.

## Overview

When ending a Live Activity with `DynamicActivities.endLiveActivity()`, you can specify how and when the system should remove the activity from the user's interface. The library supports three dismissal policies that map directly to Apple's `ActivityUIDismissalPolicy` enum.

## Dismissal Policy Types

### `"default"` (Default Behavior)
```typescript
await DynamicActivities.endLiveActivity(
  activityId,
  { state: 'ended' },
  'default'
);
```

**Behavior:**
- Uses the system's default dismissal timing
- Typically keeps the activity visible for a brief period before removing it
- Allows users to see the final state of the activity
- **Recommended** for most use cases

### `"immediate"` (Instant Removal)
```typescript
await DynamicActivities.endLiveActivity(
  activityId,
  { state: 'ended' },
  'immediate'
);
```

**Behavior:**
- Removes the Live Activity immediately from all locations
- No delay or transition period
- Use when you want instant cleanup (e.g., cancelled operations)

### `"after"` (Scheduled Removal)
```typescript
const dismissalDate = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now

await DynamicActivities.endLiveActivity(
  activityId,
  { state: 'ended' },
  'after',
  undefined, // timestamp (optional)
  dismissalDate // dismissal date
);
```

**Behavior:**
- Schedules the activity for removal at a specific date/time
- Must be within a **4-hour window** from when the activity ends
- If the specified date is beyond 4 hours, it will be automatically clamped to the 4-hour maximum
- Useful for activities that should remain visible for a specific duration (e.g., delivery confirmations)

## Important Notes

### 4-Hour Limit for "after" Policy
Apple imposes a strict 4-hour limit on how long a Live Activity can remain visible after being ended. This is enforced at the system level:

```typescript
// ✅ Valid - 2 hours from now
const validDate = new Date(Date.now() + 2 * 60 * 60 * 1000);

// ⚠️ Will be clamped - 6 hours exceeds the 4-hour limit
const tooFarDate = new Date(Date.now() + 6 * 60 * 60 * 1000);

await DynamicActivities.endLiveActivity(
  activityId,
  { state: 'ended' },
  'after',
  undefined,
  tooFarDate // This will be automatically reduced to 4 hours maximum
);
```

### Parameter Requirements

| Policy | `dismissalDate` Required? | Notes |
|--------|--------------------------|-------|
| `"default"` | No | Ignored if provided |
| `"immediate"` | No | Ignored if provided |
| `"after"` | **Yes** | Must be a valid `Date` object |

If you specify `"after"` without providing a `dismissalDate`, the system will fall back to `"default"` behavior.

## Error Handling

The dismissal policy operations can fail for several reasons:

```typescript
import { isLiveActivityError, LiveActivityErrorCode } from 'react-native-dynamic-activities';

try {
  await DynamicActivities.endLiveActivity(
    activityId,
    { state: 'ended' },
    'after',
    undefined,
    new Date(Date.now() + 3 * 60 * 60 * 1000) // 3 hours
  );
} catch (error) {
  if (isLiveActivityError(error)) {
    switch (error.code) {
      case LiveActivityErrorCode.UNKNOWN_ERROR:
        // Activity ID not found
        console.error('Activity not found:', error.message);
        break;
      default:
        console.error('Dismissal failed:', error.message);
    }
  }
}
```

## Platform Support

| Platform | Support | Notes |
|----------|---------|-------|
| **iOS 16.2+** | ✅ Full | All dismissal policies supported |
| **Android** | ❌ Not supported | All methods reject with clear error messages |

## ActivityStyle Support

The `style` parameter in `startLiveActivity()` uses Apple's `ActivityStyle` enum:

- **`"standard"`** - Standard Live Activity behavior (default)
- **`"transient"`** - Transient Live Activity that appears briefly

**Requirements:**
- Available from iOS 16.1+ (enum definition)
- **Requires iOS 18.0+ minimum** for actual usage
- Automatically falls back to standard behavior on older iOS versions

```typescript
// iOS 18.0+ with ActivityStyle support
await DynamicActivities.startLiveActivity(
  attributes,
  content,
  undefined, // pushToken
  'transient' // style - requires iOS 18.0+
);
```

## Best Practices

1. **Use `"default"` for most cases** - It provides good user experience with appropriate timing
2. **Use `"immediate"` sparingly** - Only when instant removal is necessary (cancellations, errors)
3. **Use `"after"` for important notifications** - Delivery confirmations, payment receipts, etc.
4. **Always handle errors** - Network issues or invalid activity IDs can cause failures
5. **Respect the 4-hour limit** - Don't rely on activities staying visible longer than 4 hours

## Complete Example

```typescript
import { DynamicActivities, isLiveActivityError, LiveActivityErrorCode } from 'react-native-dynamic-activities';

async function endActivityWithCustomPolicy() {
  const activityId = 'your-activity-id';
  
  try {
    // For a delivery confirmation that should stay visible for 2 hours
    const dismissalDate = new Date(Date.now() + 2 * 60 * 60 * 1000);
    
    await DynamicActivities.endLiveActivity(
      activityId,
      {
        state: 'ended',
        relevanceScore: 1.0
      },
      'after',
      new Date(), // optional timestamp
      dismissalDate
    );
    
    console.log('Activity scheduled for removal in 2 hours');
    
  } catch (error) {
    if (isLiveActivityError(error)) {
      console.error('Failed to end activity:', error.message);
      console.error('Suggested fix:', error.recoverySuggestion);
    } else {
      console.error('Unexpected error:', error);
    }
  }
}
```