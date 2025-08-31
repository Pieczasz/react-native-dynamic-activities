# DynamicActivities API

The main API object providing all Live Activity operations. Import and use this object to interact with iOS Live Activities from React Native.

## 📦 Import

```typescript
import { DynamicActivities } from 'react-native-dynamic-activities';
```

## 🏗️ API Overview

All methods are **async** and return **Promises**. They automatically handle:
- ✅ iOS version compatibility checks
- ✅ Platform detection (iOS vs Android)  
- ✅ User permission validation
- ✅ Comprehensive error handling with recovery suggestions

---

## 🔍 areLiveActivitiesSupported()

Check if Live Activities are supported on the current device and iOS version.

### Signature
```typescript
areLiveActivitiesSupported(): Promise<LiveActivitiesSupportInfo>
```

### Returns
```typescript
interface LiveActivitiesSupportInfo {
  supported: boolean;    // Whether Live Activities work on this device
  version: number;       // iOS version (e.g., 16.2, 17.0)
  comment: string;       // Human-readable explanation
}
```

### Examples

#### Basic Support Check
```typescript
const supportInfo = await DynamicActivities.areLiveActivitiesSupported();

if (supportInfo.supported) {
  console.log('✅ Live Activities supported!');
  console.log(`iOS ${supportInfo.version}: ${supportInfo.comment}`);
} else {
  console.log('❌ Not supported:', supportInfo.comment);
}
```

#### Version-specific Features
```typescript
const supportInfo = await DynamicActivities.areLiveActivitiesSupported();

if (supportInfo.version >= 18.0) {
  // Use iOS 18+ features like custom styles
  console.log('Can use style parameter');
} else if (supportInfo.version >= 17.2) {
  // Use iOS 17.2+ features like timestamps
  console.log('Can use timestamp parameter');
} else if (supportInfo.version >= 16.2) {
  // Basic Live Activities support
  console.log('Basic Live Activities available');
}
```

### Platform Responses

| Platform | Response |
|----------|----------|
| **iOS 16.2+** | `{ supported: true, version: 16.2, comment: "Full feature support available" }` |
| **iOS 16.1** | `{ supported: false, version: 16.1, comment: "ActivityKit available but Live Activities require iOS 16.2" }` |
| **iOS < 16.1** | `{ supported: false, version: 15.0, comment: "Live Activities require iOS 16.2 or later" }` |
| **Android** | `{ supported: false, version: 0.0, comment: "Live Activities are not supported on Android" }` |

---

## 🚀 startLiveActivity()

Start a new Live Activity with the provided attributes and initial content.

### Signature
```typescript
startLiveActivity(
  attributes: LiveActivityAttributes,
  content: LiveActivityContent,
  pushToken?: LiveActivityPushToken,
  style?: LiveActivityStyle,
  alertConfiguration?: LiveActivityAlertConfiguration,
  startDate?: Date
): Promise<LiveActivityStartResult>
```

### Parameters

#### `attributes: LiveActivityAttributes` *(required)*
Static metadata that defines the activity. Cannot be changed after creation.

```typescript
interface LiveActivityAttributes {
  title: string;    // Activity title (e.g., "Pizza Delivery")
  body: string;     // Activity description (e.g., "Order #1234 from Mario's")
}
```

#### `content: LiveActivityContent` *(required)*  
Dynamic state information that can be updated throughout the activity lifecycle.

```typescript
interface LiveActivityContent {
  state: LiveActivityState;           // Current activity state
  staleDate?: Date;                   // When activity becomes stale
  relevanceScore?: number;            // Priority in Dynamic Island (0.0-1.0)
}

// Live Activity State includes new 'pending' state (iOS 18.0+)
type LiveActivityState = 'active' | 'ended' | 'dismissed' | 'stale' | 'pending';
```

#### `pushToken?: LiveActivityPushToken` *(optional)*
Configuration for remote push notifications to update the activity. **iOS 18.0+** supports both traditional push tokens and push channels.

```typescript
interface LiveActivityPushToken {
  token: string;           // Hex-encoded APNs device token
  channelId?: string;      // Optional channel ID for iOS 18.0+ push channels
}
```

**Push Token vs Push Channel (iOS 18.0+):**
- **Push Token**: Traditional method, generates unique token per activity instance
- **Push Channel**: New method, allows broadcasting updates to multiple activities using a shared channel ID

#### `style?: LiveActivityStyle` *(optional, iOS 18.0+)*
Visual presentation style of the Live Activity.

```typescript
type LiveActivityStyle = 'standard' | 'transient';
```

- **`'standard'`**: Default presentation style for persistent Live Activities
- **`'transient'`**: Temporary presentation in the Dynamic Island for brief interactions

#### `alertConfiguration?: LiveActivityAlertConfiguration` *(optional, iOS 26.0+)*
Configuration for alerts when the activity starts. This feature is available in iOS 26.0 and later versions.

```typescript
interface LiveActivityAlertConfiguration {
  title: string;    // Alert title
  body: string;     // Alert body text  
  sound: string;    // Alert sound name (e.g., 'default', 'chime.aiff')
}
```

#### `startDate?: Date` *(optional, iOS 26.0+)*
Custom start time for the activity. If provided, the Live Activity will be scheduled to start at this specific date. Defaults to current time. This feature enables pre-scheduling of Live Activities.

### Returns
```typescript
interface LiveActivityStartResult {
  activityId: string;      // Unique identifier for this activity
  pushToken?: string;      // Hex-encoded push token if available
}
```

### Examples

#### Basic Activity
```typescript
const result = await DynamicActivities.startLiveActivity(
  {
    title: "Food Delivery",
    body: "Pizza from Mario's Restaurant - Order #1234"
  },
  {
    state: "preparing",
    relevanceScore: 1.0,  // Highest priority
    staleDate: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
  }
);

console.log('Activity ID:', result.activityId);
if (result.pushToken) {
  console.log('Push token:', result.pushToken);
}
```

#### With Push Notifications
```typescript
const result = await DynamicActivities.startLiveActivity(
  {
    title: "Ride Share", 
    body: "Driver arriving in 5 minutes"
  },
  {
    state: "driver_on_way",
    relevanceScore: 0.9
  },
  {
    token: "a1b2c3d4e5f6..." // Your APNs device token
  }
);
```

#### iOS 18+ with Style and Alert Configuration
```typescript
const supportInfo = await DynamicActivities.areLiveActivitiesSupported();

const result = await DynamicActivities.startLiveActivity(
  {
    title: "Workout Timer",
    body: "HIIT Training Session"
  },
  {
    state: "active",
    relevanceScore: 1.0
  },
  undefined, // no push token
  supportInfo.version >= 18.0 ? 'transient' : undefined, // conditional style
  supportInfo.version >= 18.0 ? { // alert configuration in start (iOS 18+)
    title: "Workout Started!",
    body: "Your HIIT session has begun",
    sound: "default"
  } : undefined,
  new Date(Date.now() + 5000) // start in 5 seconds (iOS 18+)
);
```

#### iOS 18+ with Pending State and Channel Push
```typescript
const result = await DynamicActivities.startLiveActivity(
  {
    title: "Sports Game",
    body: "Lakers vs Warriors - Game starts at 8:00 PM"
  },
  {
    state: "pending", // New in iOS 18.0+ - for scheduled/upcoming events
    relevanceScore: 0.7
  },
  {
    token: "your-apns-token",
    channelId: "sports-game-channel-123" // Broadcast channel for iOS 18+
  },
  'standard',
  {
    title: "Game Scheduled",
    body: "You'll be notified when the game begins",
    sound: "chime.aiff"
  },
  new Date('2024-03-15T20:00:00') // Scheduled start time
);
```

### Error Handling
```typescript
try {
  const result = await DynamicActivities.startLiveActivity(attributes, content);
} catch (error) {
  if (isAuthorizationError(error)) {
    // User denied permission or reached limits
    console.error('Permission error:', error.message);
    console.log('Fix:', error.recoverySuggestion);
  } else if (isSystemError(error)) {
    // Network or system issue
    console.error('System error:', error.message);
  }
}
```

### Common Errors

| Error Code | Meaning | Recovery |
|------------|---------|----------|
| `denied` | User disabled Live Activities | Enable in Settings > App > Live Activities |
| `unentitled` | Missing Live Activities entitlement | Add entitlement in Xcode |
| `attributesTooLarge` | Activity data exceeds 4KB | Reduce attributes size |
| `globalMaximumExceeded` | Too many Live Activities on device | Wait for some to end |

---

## 🔄 updateLiveActivity()

Update an existing Live Activity with new content.

### Signature
```typescript
updateLiveActivity(
  activityId: string,
  content: LiveActivityContent,
  alertConfiguration?: LiveActivityAlertConfiguration,
  timestamp?: Date
): Promise<void>
```

### Parameters

#### `activityId: string` *(required)*
The unique identifier returned from `startLiveActivity()`.

#### `content: LiveActivityContent` *(required)*
New state information to display.

#### `alertConfiguration?: LiveActivityAlertConfiguration` *(optional, iOS 26.0+)*
Optional alert to show with the update.

#### `timestamp?: Date` *(optional, iOS 17.2+)*
Custom timestamp for the update. Defaults to current time.

### Examples

#### Basic Update
```typescript
await DynamicActivities.updateLiveActivity(
  result.activityId,
  {
    state: "out_for_delivery",
    relevanceScore: 0.8,
    staleDate: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
  }
);
```

#### Update with Alert
```typescript
await DynamicActivities.updateLiveActivity(
  result.activityId,
  {
    state: "driver_arrived",
    relevanceScore: 1.0
  },
  {
    title: "Driver Arrived!",
    body: "Your driver is waiting outside",
    sound: "default"
  }
);
```

#### Update with Custom Timestamp (iOS 17.2+)
```typescript
const supportInfo = await DynamicActivities.areLiveActivitiesSupported();

await DynamicActivities.updateLiveActivity(
  result.activityId,
  { state: "completed" },
  undefined, // no alert
  supportInfo.version >= 17.2 ? new Date() : undefined // timestamp parameter
);
```

---

## 🛑 endLiveActivity()

End a Live Activity gracefully with final content.

### Signature
```typescript
endLiveActivity(
  activityId: string,
  content: LiveActivityContent,
  dismissalPolicy?: LiveActivityDismissalPolicy,
  timestamp?: Date
): Promise<void>
```

### Parameters

#### `activityId: string` *(required)*
The unique identifier of the activity to end.

#### `content: LiveActivityContent` *(required)*
Final content to display before dismissal.

#### `dismissalPolicy?: LiveActivityDismissalPolicy` *(optional)*
How quickly the activity should be dismissed.

```typescript
type LiveActivityDismissalPolicy = 'default' | 'immediate' | 'after';
```

#### `timestamp?: Date` *(optional, iOS 17.2+)*
Custom timestamp for the end event.

### Examples

#### Basic End
```typescript
await DynamicActivities.endLiveActivity(
  result.activityId,
  {
    state: "delivered",
    relevanceScore: 0.1
  }
);
```

#### Immediate Dismissal
```typescript
await DynamicActivities.endLiveActivity(
  result.activityId,
  { state: "cancelled" },
  'immediate'  // Remove from Dynamic Island/Lock Screen immediately
);
```

#### Scheduled Dismissal
```typescript
await DynamicActivities.endLiveActivity(
  result.activityId,
  { state: "completed" },
  'after',  // Dismiss after a delay
  new Date(Date.now() + 10 * 1000)  // 10 seconds from now
);
```

## 🎯 Complete Example

Here's a complete example showing the full Live Activity lifecycle:

```typescript
import React, { useState } from 'react';
import { 
  DynamicActivities, 
  LiveActivityStartResult,
  isLiveActivityError 
} from 'react-native-dynamic-activities';

const LiveActivityExample = () => {
  const [activity, setActivity] = useState<LiveActivityStartResult | null>(null);

  const startDeliveryTracking = async () => {
    try {
      // Check support first
      const supportInfo = await DynamicActivities.areLiveActivitiesSupported();
      if (!supportInfo.supported) {
        alert(`Not supported: ${supportInfo.comment}`);
        return;
      }

      // Start activity
      const result = await DynamicActivities.startLiveActivity(
        {
          title: "Pizza Express",
          body: "Large Pepperoni Pizza - Order #5678"
        },
        {
          state: "preparing",
          relevanceScore: 1.0,
          staleDate: new Date(Date.now() + 45 * 60 * 1000) // 45 minutes
        }
      );

      setActivity(result);
      
      // Simulate delivery stages
      simulateDelivery(result.activityId);
      
    } catch (error) {
      if (isLiveActivityError(error)) {
        alert(`Error: ${error.message}\nTry: ${error.recoverySuggestion}`);
      }
    }
  };

  const simulateDelivery = async (activityId: string) => {
    // Stage 1: Preparing -> Cooking (after 3 seconds)
    setTimeout(async () => {
      await DynamicActivities.updateLiveActivity(activityId, {
        state: "cooking",
        relevanceScore: 0.9
      });
    }, 3000);

    // Stage 2: Cooking -> Out for delivery (after 8 seconds)
    setTimeout(async () => {
      await DynamicActivities.updateLiveActivity(activityId, {
        state: "out_for_delivery", 
        relevanceScore: 0.8
      });
    }, 8000);

    // Stage 3: Delivered (after 15 seconds)
    setTimeout(async () => {
      await DynamicActivities.endLiveActivity(
        activityId,
        { state: "delivered", relevanceScore: 0.1 },
        'default'
      );
      setActivity(null);
    }, 15000);
  };

  return (
    <View>
      {activity ? (
        <Text>Live Activity Running: {activity.activityId}</Text>
      ) : (
        <Button title="Start Delivery Tracking" onPress={startDeliveryTracking} />
      )}
    </View>
  );
};
```

## 💡 Best Practices

### 1. Always Check Support First
```typescript
const supportInfo = await DynamicActivities.areLiveActivitiesSupported();
if (!supportInfo.supported) {
  // Handle gracefully - don't show Live Activity features
  return;
}
```

### 2. Handle Errors Gracefully
```typescript
try {
  await DynamicActivities.startLiveActivity(attributes, content);
} catch (error) {
  // Show user-friendly error message
  showErrorDialog(error.message, error.recoverySuggestion);
}
```

### 3. Use Appropriate Relevance Scores
```typescript
// High priority events
{ state: "driver_arrived", relevanceScore: 1.0 }

// Medium priority updates  
{ state: "preparing", relevanceScore: 0.7 }

// Low priority/completed states
{ state: "delivered", relevanceScore: 0.1 }
```

### 4. Set Reasonable Stale Dates
```typescript
const content = {
  state: "active",
  // Activity becomes less prominent after 30 minutes
  staleDate: new Date(Date.now() + 30 * 60 * 1000)
};
```

---

**Next:** Learn about LiveActivityAttributes to understand activity metadata structure! 📋