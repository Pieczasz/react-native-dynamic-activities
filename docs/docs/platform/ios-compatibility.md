# iOS Compatibility Guide

Comprehensive guide to iOS version compatibility, feature availability, and best practices for supporting different iOS versions with React Native Dynamic Activities.

## 📋 iOS Version Support Matrix

| iOS Version | Support Level | Features Available | Recommendations |
|-------------|--------------|-------------------|-----------------|
| **iOS 26.0+** | 🟢 **Full Support** | All features: alertConfiguration in start(), push channels, scheduling | ✅ Future target |
| **iOS 18.0+** | 🟢 **Full Support** | Style parameter, pending state, advanced features | ✅ Target for new apps |
| **iOS 17.2+** | 🟡 **Good Support** | Timestamps in updates/end, alertConfiguration in updates only | ✅ Fully supported |
| **iOS 16.2-17.1** | 🟡 **Limited Support** | Basic Live Activities, alertConfiguration in updates only | ✅ Minimum requirement |
| **iOS 16.1** | 🟠 **ActivityKit Only** | ActivityKit available, Live Activities disabled | ⚠️ Handle gracefully |
| **iOS < 16.1** | 🔴 **Not Supported** | No ActivityKit framework | ❌ Unsupported |

## 🎯 Feature Availability by iOS Version

### iOS 26.0+ Features
```typescript
// ✅ Available in iOS 26.0+
await DynamicActivities.startLiveActivity(
  attributes,
  {
    state: "pending",
    relevanceScore: 1.0
  },
  {
    token: pushToken,
    channelId: "broadcast-channel-id"
  },
  'transient',
  alertConfiguration, // ← AlertConfiguration in start (iOS 26.0+)
  new Date(Date.now() + 30000) // ← Scheduled start time (iOS 26.0+)
);
```

### iOS 18.0+ Features
```typescript
// ✅ Available in iOS 18.0+
await DynamicActivities.startLiveActivity(
  attributes,
  {
    state: "pending", // ← Pending state for scheduled activities (iOS 18.0+)
    relevanceScore: 1.0
  },
  pushToken,
  'transient' // ← Style parameter (iOS 18.0+)
);
```

### iOS 17.2+ Features
```typescript
// ✅ Available in iOS 17.2+
await DynamicActivities.updateLiveActivity(
  activityId,
  content,
  alertConfiguration,
  new Date() // ← Timestamp parameter
);

await DynamicActivities.endLiveActivity(
  activityId,
  content,
  'default',
  new Date() // ← Timestamp parameter  
);
```

### iOS 16.2+ Features (Baseline)
```typescript
// ✅ Available in all supported iOS versions (16.2+)
await DynamicActivities.startLiveActivity(attributes, content);
await DynamicActivities.updateLiveActivity(activityId, content);
await DynamicActivities.endLiveActivity(activityId, content);

// ✅ Basic push token support (16.2+)
await DynamicActivities.startLiveActivity(
  attributes,
  content,
  { token: pushToken } // Basic push token, no channels
);

// ✅ Alert configuration in updates/end (16.2+)
await DynamicActivities.updateLiveActivity(activityId, content, alertConfiguration);
await DynamicActivities.endLiveActivity(activityId, content, 'default');
```

## 🔧 Version Detection & Feature Gating

### Automatic Feature Detection
React Native Dynamic Activities automatically handles version compatibility:

```typescript
const supportInfo = await DynamicActivities.areLiveActivitiesSupported();

console.log(supportInfo);
// iOS 17.2: { supported: true, version: 17.2, comment: "Full feature support available" }
// iOS 16.2: { supported: true, version: 16.2, comment: "Basic support: no style, timestamp, or alertConfiguration in requests" }
// iOS 16.1: { supported: false, version: 16.1, comment: "ActivityKit available but Live Activities require iOS 16.2" }
```

### Manual Version Checking
For fine-grained control, check iOS version manually:

```typescript
import { Platform } from 'react-native';

const getIOSVersion = (): number => {
  if (Platform.OS !== 'ios') return 0;
  return parseFloat(Platform.Version as string);
};

const iosVersion = getIOSVersion();

// Feature gating examples
const supportsTimestamp = iosVersion >= 17.2;
const supportsStyle = iosVersion >= 18.0; // Future
const supportsLiveActivities = iosVersion >= 16.2;
```

### Progressive Enhancement Pattern
```typescript
const startLiveActivityWithFallbacks = async (
  attributes: LiveActivityAttributes,
  content: LiveActivityContent,
  options?: {
    pushToken?: LiveActivityPushToken;
    style?: LiveActivityStyle;
    alertConfiguration?: LiveActivityAlertConfiguration;
    timestamp?: Date;
  }
) => {
  const supportInfo = await DynamicActivities.areLiveActivitiesSupported();
  
  if (!supportInfo.supported) {
    throw new Error(`Live Activities not supported: ${supportInfo.comment}`);
  }

  // Progressive enhancement based on iOS version
  if (supportInfo.version >= 18.0) {
    // iOS 18.0+ - All features including alertConfiguration in start, style parameter
    return await DynamicActivities.startLiveActivity(
      attributes,
      content,
      options?.pushToken,
      options?.style, // Available from iOS 18.0+
      options?.alertConfiguration, // Available in start from iOS 18.0+
      options?.timestamp // Available from iOS 18.0+
    );
  } else if (supportInfo.version >= 17.2) {
    // iOS 17.2+ - Timestamps in updates/end, but no alertConfiguration in start
    return await DynamicActivities.startLiveActivity(
      attributes,
      content,
      options?.pushToken
      // No style or alertConfiguration in start - use update() for alerts
    );
  } else {
    // iOS 16.2+ - Basic features only
    return await DynamicActivities.startLiveActivity(
      attributes,
      content,
      options?.pushToken
      // No style, alertConfiguration, or timestamp
    );
  }
};
```

## 🎨 SwiftUI Compatibility

### iOS Version-Specific SwiftUI Features

Your generated widget templates are compatible across iOS versions, but you can enhance them:

#### iOS 17+ SwiftUI Enhancements
```swift
// In your LiveActivity SwiftUI code
struct MyActivityLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: MyActivityAttributes.self) { context in
            VStack {
                Text(context.attributes.title)
                    .font(.headline)
                
                // iOS 17+ animation enhancements
                if #available(iOS 17.0, *) {
                    Text(context.state.state)
                        .font(.caption)
                        .contentTransition(.symbolEffect(.replace))
                } else {
                    Text(context.state.state)
                        .font(.caption)
                        .animation(.easeInOut, value: context.state.state)
                }
            }
        } dynamicIsland: { context in
            // Dynamic Island layouts
        }
    }
}
```

#### iOS 16.2 Baseline SwiftUI
```swift
// Safe SwiftUI code that works on all supported iOS versions
VStack(alignment: .leading, spacing: 8) {
    HStack {
        Text(context.attributes.title)
            .font(.headline)
        Spacer()
        Text(context.state.state.capitalized)
            .font(.caption)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(Color.blue.opacity(0.2))
            .cornerRadius(8)
    }
    
    Text(context.attributes.body)
        .font(.subheadline)
        .foregroundColor(.secondary)
}
.padding()
```

## 🛡️ Error Handling Across iOS Versions

### Version-Specific Error Scenarios

#### iOS 16.1 Handling
```typescript
try {
  const supportInfo = await DynamicActivities.areLiveActivitiesSupported();
  
  if (supportInfo.version === 16.1) {
    // Show helpful message to user
    showMessage(
      "Live Activities Available in iOS 16.2+",
      "Update your iOS version to use Live Activities features"
    );
    return;
  }
  
  await DynamicActivities.startLiveActivity(attributes, content);
  
} catch (error) {
  if (isLiveActivityError(error) && error.code === LiveActivityErrorCode.UNSUPPORTED) {
    // Handle unsupported version gracefully
    showFallbackUI();
  }
}
```

#### iOS Version-Specific Error Messages
```typescript
const getVersionSpecificErrorMessage = (error: LiveActivityError, iosVersion: number): string => {
  switch (error.code) {
    case LiveActivityErrorCode.UNSUPPORTED:
      if (iosVersion < 16.1) {
        return "Live Activities require iOS 16.2 or later. Please update your iOS version.";
      } else if (iosVersion === 16.1) {
        return "Live Activities are available starting with iOS 16.2. Please update to iOS 16.2 or later.";
      }
      return error.message;
      
    case LiveActivityErrorCode.DENIED:
      return `Live Activities are disabled. Enable them in Settings > ${getAppName()} > Live Activities.`;
      
    default:
      return error.message;
  }
};
```

## 📱 Device Compatibility

### Dynamic Island Compatibility

| Device | Dynamic Island | Lock Screen | Notes |
|--------|----------------|-------------|-------|
| **iPhone 14 Pro/Pro Max** | ✅ Full Support | ✅ Full Support | Native Dynamic Island |
| **iPhone 15/15 Plus** | ✅ Full Support | ✅ Full Support | Native Dynamic Island |
| **iPhone 15 Pro/Pro Max** | ✅ Full Support | ✅ Full Support | Native Dynamic Island |
| **Other iOS 16.2+ devices** | 🟡 Limited | ✅ Full Support | Shows as notification banner |

### Device-Specific Considerations
```typescript
import { Platform } from 'react-native';

const getDeviceCapabilities = () => {
  // This is a simplified example - you'd use a proper device detection library
  const deviceName = Platform.constants.systemName;
  
  return {
    hasDynamicIsland: deviceName?.includes('iPhone15') || deviceName?.includes('iPhone14 Pro'),
    supportsLiveActivities: Platform.Version >= '16.2',
    recommendsTransientStyle: false // For future use
  };
};

const optimizeForDevice = async (attributes, content) => {
  const capabilities = getDeviceCapabilities();
  
  if (!capabilities.hasDynamicIsland) {
    // Optimize for Lock Screen display
    content.relevanceScore = Math.min(content.relevanceScore || 0.5, 0.8);
  }
  
  return await DynamicActivities.startLiveActivity(attributes, content);
};
```

## 🔧 Development Best Practices

### 1. Always Check Support First
```typescript
const LiveActivityComponent = () => {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [supportInfo, setSupportInfo] = useState<LiveActivitiesSupportInfo | null>(null);

  useEffect(() => {
    DynamicActivities.areLiveActivitiesSupported().then((info) => {
      setIsSupported(info.supported);
      setSupportInfo(info);
    });
  }, []);

  if (isSupported === null) {
    return <Text>Checking Live Activities support...</Text>;
  }

  if (!isSupported) {
    return (
      <View>
        <Text>Live Activities not available</Text>
        <Text style={{fontSize: 12, color: 'gray'}}>
          {supportInfo?.comment}
        </Text>
      </View>
    );
  }

  return <LiveActivityUI supportInfo={supportInfo} />;
};
```

### 2. Graceful Degradation
```typescript
const createLiveActivityOrFallback = async (data) => {
  try {
    const supportInfo = await DynamicActivities.areLiveActivitiesSupported();
    
    if (supportInfo.supported) {
      return await DynamicActivities.startLiveActivity(data.attributes, data.content);
    } else {
      // Fallback to push notifications or in-app notifications
      return await sendPushNotification(data);
    }
  } catch (error) {
    // Always have a fallback
    return await showInAppNotification(data);
  }
};
```

### 3. Version-Aware Feature Flags
```typescript
interface FeatureFlags {
  liveActivities: boolean;
  liveActivityTimestamps: boolean;
  liveActivityStyles: boolean;
  liveActivityAlerts: boolean;
}

const getFeatureFlags = async (): Promise<FeatureFlags> => {
  const supportInfo = await DynamicActivities.areLiveActivitiesSupported();
  
  return {
    liveActivities: supportInfo.supported,
    liveActivityTimestamps: supportInfo.version >= 17.2,
    liveActivityStyles: supportInfo.version >= 18.0,
    liveActivityAlerts: supportInfo.supported, // Available since 16.2
  };
};

// Usage
const featureFlags = await getFeatureFlags();

if (featureFlags.liveActivityTimestamps) {
  await DynamicActivities.updateLiveActivity(id, content, null, new Date());
} else {
  await DynamicActivities.updateLiveActivity(id, content);
}
```

## 🧪 Testing Across iOS Versions

### Testing Strategy
1. **Primary Target:** iOS 17.2+ (latest features)
2. **Baseline Target:** iOS 16.2 (minimum supported)
3. **Edge Cases:** iOS 16.1 (graceful rejection)

### Testing Checklist
- [ ] ✅ Test on iOS 17.2+ with all features
- [ ] ✅ Test on iOS 16.2 with basic features only
- [ ] ✅ Test on iOS 16.1 with proper rejection handling
- [ ] ✅ Test error scenarios on each version
- [ ] ✅ Test Dynamic Island vs non-Dynamic Island devices
- [ ] ✅ Test with different user permission settings

### Automated Testing
```typescript
// Example test structure for version compatibility
describe('iOS Version Compatibility', () => {
  test('should detect support correctly on iOS 17.2+', async () => {
    // Mock iOS 17.2
    mockPlatformVersion('17.2');
    
    const info = await DynamicActivities.areLiveActivitiesSupported();
    expect(info.supported).toBe(true);
    expect(info.version).toBe(17.2);
  });

  test('should handle iOS 16.1 gracefully', async () => {
    // Mock iOS 16.1
    mockPlatformVersion('16.1');
    
    const info = await DynamicActivities.areLiveActivitiesSupported();
    expect(info.supported).toBe(false);
    expect(info.comment).toContain('require iOS 16.2');
  });

  test('should use appropriate parameters based on version', async () => {
    mockPlatformVersion('16.2');
    
    // Should work without timestamp
    await expect(
      DynamicActivities.updateLiveActivity(mockId, mockContent)
    ).resolves.toBeUndefined();
    
    // Timestamp should be ignored gracefully
    await expect(
      DynamicActivities.updateLiveActivity(mockId, mockContent, null, new Date())
    ).resolves.toBeUndefined();
  });
});
```

## 🚀 Future iOS Version Preparation

### Preparing for iOS 18+
When iOS 18 is released with new Live Activity features:

1. **Update feature detection:**
```typescript
// Add new feature flags
const supportsNewFeature = supportInfo.version >= 18.0;
```

2. **Update SwiftUI templates:**
```swift
// Add iOS 18+ enhancements
if #available(iOS 18.0, *) {
    // Use new iOS 18 APIs
} else {
    // Fallback to iOS 17/16 implementation
}
```

3. **Update documentation and examples**

### Deprecation Strategy
When dropping support for older iOS versions:

1. **Add deprecation warnings** in code
2. **Update minimum iOS version** in documentation  
3. **Provide migration guide** for users
4. **Maintain backward compatibility** for at least one major version

---

## 📊 iOS Usage Statistics

Consider these statistics when deciding which iOS versions to support:

| iOS Version | Typical Adoption | Support Recommendation |
|-------------|------------------|----------------------|
| **Latest (iOS 17.x)** | ~60% after 6 months | ✅ Full support |
| **Previous (iOS 16.x)** | ~30% after 1 year | ✅ Full support |
| **iOS 15.x** | ~8% after 2 years | ⚠️ Consider dropping |
| **iOS 14.x and older** | ~2% after 2 years | ❌ Drop support |

*Note: These are typical patterns - check your app's specific analytics for accurate data.*

---

**Next:** Learn about Android Platform Handling to properly support Android users! 🤖