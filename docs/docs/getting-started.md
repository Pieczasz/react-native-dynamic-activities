# Getting Started

Build your first Live Activity in just 10 minutes! This guide walks you through creating a pizza delivery tracker that appears in the Dynamic Island and Lock Screen.

## 🎯 What We'll Build

A pizza delivery Live Activity that shows:
- **Lock Screen:** Full delivery status with progress
- **Dynamic Island:** Compact delivery state with timer
- **Real-time updates** from preparing → delivery → completed

## 📝 Prerequisites

Make sure you've completed the [Installation Guide](installation) and have:
- ✅ React Native Dynamic Activities installed
- ✅ Live Activities entitlement configured
- ✅ Widget Extension created in Xcode

## 🚀 Step 1: Check Support

First, verify that Live Activities are supported on the device:

```typescript
import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { DynamicActivities } from 'react-native-dynamic-activities';

const PizzaTracker = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [supportInfo, setSupportInfo] = useState(null);

  useEffect(() => {
    checkSupport();
  }, []);

  const checkSupport = async () => {
    try {
      const info = await DynamicActivities.areLiveActivitiesSupported();
      setSupportInfo(info);
      setIsSupported(info.supported);
      
      if (!info.supported) {
        Alert.alert('Not Supported', info.comment);
      }
    } catch (error) {
      console.error('Support check failed:', error);
    }
  };

  if (!isSupported) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text>Live Activities not supported</Text>
        <Text style={{fontSize: 12, color: 'gray'}}>
          {supportInfo?.comment}
        </Text>
      </View>
    );
  }

  return (
    <View style={{flex: 1, padding: 20}}>
      <Text style={{fontSize: 18, fontWeight: 'bold', marginBottom: 20}}>
        🍕 Pizza Tracker
      </Text>
      {/* We'll add more UI here */}
    </View>
  );
};

export default PizzaTracker;
```

## 🍕 Step 2: Start a Live Activity

Add the pizza tracking functionality:

```typescript
import { 
  DynamicActivities, 
  LiveActivityStartResult,
  LiveActivityError 
} from 'react-native-dynamic-activities';

const PizzaTracker = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [currentActivity, setCurrentActivity] = useState<LiveActivityStartResult | null>(null);
  const [orderStatus, setOrderStatus] = useState<'idle' | 'preparing' | 'baking' | 'delivery' | 'delivered'>('idle');

  // ... support check code from above ...

  const startPizzaTracking = async () => {
    try {
      // Define the pizza order attributes
      const attributes = {
        title: "Papa's Pizza Co.",
        body: "Large Pepperoni Pizza - Order #1234"
      };

      // Initial content state
      const content = {
        state: "preparing",
        relevanceScore: 1.0, // Highest priority in Dynamic Island
        staleDate: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
      };

      // Start the Live Activity
      const result = await DynamicActivities.startLiveActivity(
        attributes,
        content,
        undefined, // pushToken - optional for remote updates
        'standard', // style - 'standard' or 'transient'
      );

      setCurrentActivity(result);
      setOrderStatus('preparing');
      
      Alert.alert(
        'Live Activity Started! 🎉', 
        'Check your Dynamic Island or Lock Screen'
      );

      // Simulate order progression
      simulateOrderProgress(result.activityId);
      
    } catch (error) {
      const liveActivityError = error as LiveActivityError;
      Alert.alert(
        'Failed to Start Live Activity',
        `${liveActivityError.message}\n\nSuggestion: ${liveActivityError.recoverySuggestion || 'Please try again'}`
      );
      console.error('Start Live Activity error:', liveActivityError);
    }
  };

  const simulateOrderProgress = async (activityId: string) => {
    const stages = [
      { status: 'baking', delay: 3000, relevance: 0.9 },
      { status: 'delivery', delay: 5000, relevance: 0.8 },
      { status: 'delivered', delay: 8000, relevance: 0.1 },
    ] as const;

    for (const stage of stages) {
      await new Promise(resolve => setTimeout(resolve, stage.delay));
      
      try {
        if (stage.status === 'delivered') {
          // End the activity when delivered
          await DynamicActivities.endLiveActivity(
            activityId,
            {
              state: stage.status,
              relevanceScore: stage.relevance,
            },
            'default', // dismissalPolicy - 'default', 'immediate', 'after'
          );
          setCurrentActivity(null);
        } else {
          // Update the activity for intermediate stages
          await DynamicActivities.updateLiveActivity(
            activityId,
            {
              state: stage.status,
              relevanceScore: stage.relevance,
            }
          );
        }
        
        setOrderStatus(stage.status);
        
      } catch (error) {
        console.error(`Failed to update to ${stage.status}:`, error);
      }
    }
  };

  const stopTracking = async () => {
    if (!currentActivity) return;
    
    try {
      await DynamicActivities.endLiveActivity(
        currentActivity.activityId,
        { state: 'cancelled' },
        'immediate'
      );
      setCurrentActivity(null);
      setOrderStatus('idle');
      Alert.alert('Live Activity Ended');
    } catch (error) {
      console.error('End Live Activity error:', error);
    }
  };

  const getStatusEmoji = () => {
    switch (orderStatus) {
      case 'preparing': return '👨‍🍳';
      case 'baking': return '🔥';
      case 'delivery': return '🚗';
      case 'delivered': return '✅';
      default: return '🍕';
    }
  };

  const getStatusText = () => {
    switch (orderStatus) {
      case 'preparing': return 'Preparing your delicious pizza...';
      case 'baking': return 'Pizza is baking in the oven!';
      case 'delivery': return 'Out for delivery!';
      case 'delivered': return 'Pizza delivered! Enjoy!';
      default: return 'Ready to track your pizza?';
    }
  };

  return (
    <View style={{flex: 1, padding: 20, justifyContent: 'center'}}>
      <Text style={{fontSize: 24, textAlign: 'center', marginBottom: 10}}>
        {getStatusEmoji()}
      </Text>
      
      <Text style={{fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 10}}>
        🍕 Papa's Pizza Tracker
      </Text>
      
      <Text style={{textAlign: 'center', marginBottom: 30, fontSize: 16}}>
        {getStatusText()}
      </Text>

      {currentActivity ? (
        <View>
          <Text style={{textAlign: 'center', marginBottom: 20, color: 'green'}}>
            Live Activity Running!{'\n'}
            Check your Dynamic Island or Lock Screen
          </Text>
          
          <Button
            title="Stop Tracking"
            onPress={stopTracking}
            color="red"
          />
        </View>
      ) : (
        <Button
          title="Start Pizza Tracking 🍕"
          onPress={startPizzaTracking}
        />
      )}

      {currentActivity && (
        <Text style={{marginTop: 20, fontSize: 12, color: 'gray', textAlign: 'center'}}>
          Activity ID: {currentActivity.activityId.substring(0, 8)}...
          {currentActivity.pushToken && (
            <Text>{'\n'}Push Token Available</Text>
          )}
        </Text>
      )}
    </View>
  );
};
```

## 🎨 Step 3: Customize Your Widget UI

Your CLI-generated widget template creates a SwiftUI interface. Let's customize it for our pizza tracker.

Edit `ios/MyWidget/MyActivityLiveActivity.swift`:

```swift
import ActivityKit
import SwiftUI
import WidgetKit

struct MyActivityLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: MyActivityAttributes.self) { context in
            // Lock Screen/Banner UI
            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    Text("🍕 \(context.attributes.title)")
                        .font(.headline)
                        .fontWeight(.bold)
                    Spacer()
                    
                    // Status badge
                    Text(context.state.state.capitalized)
                        .font(.caption)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background(
                            RoundedRectangle(cornerRadius: 12)
                                .fill(statusColor(for: context.state.state))
                        )
                        .foregroundColor(.white)
                }
                
                Text(context.attributes.body)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                
                // Progress indicator
                if let relevanceScore = context.state.relevanceScore, relevanceScore > 0.1 {
                    VStack(spacing: 6) {
                        HStack {
                            Text(statusMessage(for: context.state.state))
                                .font(.caption)
                                .fontWeight(.medium)
                            Spacer()
                            Text(progressText(for: context.state.state))
                                .font(.caption2)
                                .foregroundColor(.secondary)
                        }
                        
                        ProgressView(value: progressValue(for: context.state.state))
                            .progressViewStyle(LinearProgressViewStyle(tint: statusColor(for: context.state.state)))
                            .scaleEffect(y: 1.5)
                    }
                }
                
                // Estimated time
                if context.state.state != "delivered" {
                    HStack {
                        Image(systemName: "clock")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        Text("Est. \(estimatedTime(for: context.state.state))")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        Spacer()
                    }
                }
            }
            .padding()
            .background(
                RoundedRectangle(cornerRadius: 16)
                    .fill(Color(.systemBackground))
                    .shadow(radius: 2)
            )
            
        } dynamicIsland: { context in
            DynamicIsland {
                // Expanded UI
                DynamicIslandExpandedRegion(.leading) {
                    VStack(alignment: .leading) {
                        Text("🍕 Papa's Pizza")
                            .font(.caption)
                            .fontWeight(.semibold)
                        Text(context.state.state.capitalized)
                            .font(.caption2)
                            .foregroundColor(.secondary)
                    }
                }
                DynamicIslandExpandedRegion(.trailing) {
                    VStack(alignment: .trailing) {
                        Text(estimatedTime(for: context.state.state))
                            .font(.caption)
                            .fontWeight(.semibold)
                        if let relevanceScore = context.state.relevanceScore, relevanceScore > 0.1 {
                            ProgressView(value: progressValue(for: context.state.state))
                                .progressViewStyle(LinearProgressViewStyle(tint: statusColor(for: context.state.state)))
                                .frame(width: 50)
                        }
                    }
                }
                DynamicIslandExpandedRegion(.center) {
                    Text(statusMessage(for: context.state.state))
                        .font(.caption)
                        .multilineTextAlignment(.center)
                }
                
            } compactLeading: {
                // Compact leading - Pizza emoji
                Text("🍕")
                    .font(.caption)
                
            } compactTrailing: {
                // Compact trailing - Status indicator
                Circle()
                    .fill(statusColor(for: context.state.state))
                    .frame(width: 8, height: 8)
                
            } minimal: {
                // Minimal - Just the pizza
                Text("🍕")
                    .font(.caption2)
            }
        }
    }
}

// Helper functions for UI customization
private func statusColor(for state: String) -> Color {
    switch state {
    case "preparing": return .blue
    case "baking": return .orange
    case "delivery": return .green
    case "delivered": return .purple
    default: return .gray
    }
}

private func statusMessage(for state: String) -> String {
    switch state {
    case "preparing": return "Chef is preparing your pizza"
    case "baking": return "Pizza is in the oven"
    case "delivery": return "Driver is on the way"
    case "delivered": return "Pizza delivered!"
    default: return "Order received"
    }
}

private func progressValue(for state: String) -> Double {
    switch state {
    case "preparing": return 0.25
    case "baking": return 0.6
    case "delivery": return 0.9
    case "delivered": return 1.0
    default: return 0.0
    }
}

private func progressText(for state: String) -> String {
    switch state {
    case "preparing": return "25%"
    case "baking": return "60%"
    case "delivery": return "90%"
    case "delivered": return "100%"
    default: return "0%"
    }
}

private func estimatedTime(for state: String) -> String {
    switch state {
    case "preparing": return "25 min"
    case "baking": return "15 min"
    case "delivery": return "8 min"
    case "delivered": return "Delivered!"
    default: return "30 min"
    }
}
```

## 🧪 Step 4: Test Your Live Activity

1. **Build and run** your app on a physical iOS device (Live Activities don't work in Simulator)
2. **Tap "Start Pizza Tracking"** 
3. **Check the Dynamic Island** - you should see a pizza emoji with a colored dot
4. **Tap and hold the Dynamic Island** to see the expanded view
5. **Lock your device** to see the full Lock Screen Live Activity
6. **Watch the automatic updates** as the pizza progresses through stages

## 🎊 Congratulations!

You've successfully created your first Live Activity! Your users can now:

- ✅ See real-time pizza delivery progress in the Dynamic Island
- ✅ View detailed status on the Lock Screen
- ✅ Get automatic updates as the order progresses
- ✅ Experience beautiful, native iOS integration

## 🚀 What's Next?

Now that you have a working Live Activity, explore more advanced features:

### 🔧 Advanced Features
- **Error Handling** - Robust error management
- **Remote Push Updates** - Update from your server
- **[Custom Styles](widgets/customization)** - Advanced SwiftUI customization

### 📖 API Reference
- **[DynamicActivities API](api/dynamic-activities)** - Complete method reference
- **[Error Types](api/errors/overview)** - All error codes and handling
- **TypeScript interfaces** - Complete type definitions

### 🎨 UI Customization
- **[Widget Customization](widgets/customization)** - Advanced SwiftUI techniques
- **Design Guidelines** - Apple's Live Activity best practices

## 💡 Pro Tips

1. **Test on Device:** Live Activities only work on physical devices
2. **Use Relevance Score:** Higher scores (0.8-1.0) get priority in Dynamic Island
3. **Set Stale Dates:** Activities automatically become less prominent over time
4. **Handle Errors Gracefully:** Show meaningful error messages to users
5. **Optimize for Battery:** End activities when no longer needed

---

**Ready for more?** Check out our [Widget Generation Guide](widgets/overview) to create more sophisticated Live Activities! 🎨