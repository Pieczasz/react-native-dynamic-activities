# Step-by-Step Tutorial: From Expo to Live Activities

Complete tutorial to build a Live Activities app from scratch, starting with a new Expo project and ending with fully functional iOS Live Activities.

## 📋 What You'll Build

By the end of this tutorial, you'll have:
- ✅ A React Native app with Live Activities support
- 🎨 Custom SwiftUI Live Activity widget
- 📱 Real-time updates in Dynamic Island and Lock Screen
- 🔧 Complete iOS project setup

## 🛠️ Prerequisites

### Required Software
- **macOS** (for iOS development)
- **Xcode 14.0+** (for iOS 16.2+ SDK)
- **Node.js 18+**
- **iOS device** (Live Activities don't work in Simulator)

### Apple Developer Account
- Active Apple Developer Program membership
- iOS device registered for development

## 📖 Tutorial Steps Overview

1. [Create Expo App](#step-1-create-expo-app)
2. [Eject to Bare Workflow](#step-2-eject-to-bare-workflow)
3. [Install Dependencies](#step-3-install-dependencies)
4. [Configure iOS Project](#step-4-configure-ios-project)
5. [Generate Live Activity Widget](#step-5-generate-live-activity-widget)
6. [Setup Xcode Widget Target](#step-6-setup-xcode-widget-target)
7. [Test Basic Functionality](#step-7-test-basic-functionality)
8. [Customize Your Widget](#step-8-customize-your-widget)

---

## Step 1: Create Expo App

Start by creating a new Expo project:

```bash
npx create-expo-app@latest LiveActivitiesDemo
cd LiveActivitiesDemo
```

**Verify setup:**
```bash
npm start
# Press 'i' to run on iOS Simulator
```

You should see the default Expo app running.

---

## Step 2: Eject to Bare Workflow

Live Activities require custom native code, so we need to eject from Expo's managed workflow:

```bash
# Install Expo CLI if not already installed
npm install -g @expo/cli

# Eject to bare workflow
npx expo prebuild
```

This creates `ios/` and `android/` directories with native code.

**Verify eject:**
```bash
ls -la
# You should see ios/ and android/ directories
```

---

## Step 3: Install Dependencies

Install React Native Dynamic Activities and its peer dependencies:

```bash
# Install the library and Nitro Modules
npm install react-native-dynamic-activities react-native-nitro-modules

# Install iOS dependencies
cd ios
bundle install
bundle exec pod install
cd ..
```

**Verify installation:**
```bash
# Check if pods installed successfully
ls ios/Pods/
# Should see installed pods including react-native-nitro-modules
```

---

## Step 4: Configure iOS Project

### 4.1 Add Entitlements

Open `ios/LiveActivitiesDemo/LiveActivitiesDemo.entitlements` and add:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.developer.ActivityKit</key>
    <true/>
    <key>com.apple.developer.ActivityKit-push-updates</key>
    <true/>
</dict>
</plist>
```

### 4.2 Update Info.plist

Add to `ios/LiveActivitiesDemo/Info.plist` before the closing `</dict>` tag:

```xml
<key>NSSupportsLiveActivities</key>
<true/>
<key>NSSupportsLiveActivitiesFrequentUpdates</key>
<true/>
```

### 4.3 Configure Xcode Project

1. Open `ios/LiveActivitiesDemo.xcworkspace` in Xcode
2. Select your app target → **Signing & Capabilities**
3. Click **+ Capability** and add:
   - **Push Notifications**
   - **Background Modes** (enable "Background Processing")

---

## Step 5: Generate Live Activity Widget

Use our CLI to generate a complete widget template:

```bash
# From project root
npx react-native-dynamic-activities create DeliveryWidget
```

This creates:
- `ios/DeliveryWidget/DeliveryWidgetBundle.swift`
- `ios/DeliveryWidget/DeliveryActivityLiveActivity.swift`
- `ios/DeliveryWidget/DeliveryActivityAttributes.swift`
- `ios/DeliveryWidget/Info.plist`

**Verify generation:**
```bash
ls ios/DeliveryWidget/
# Should show the 4 generated Swift files
```

---

## Step 6: Setup Xcode Widget Target

### 6.1 Add Widget Extension Target

1. In Xcode, **File → New → Target**
2. Select **Widget Extension** → **Next**
3. Configure:
   - **Product Name:** `DeliveryWidget`
   - **Bundle Identifier:** `com.yourcompany.liveactivitiesdemo.DeliveryWidget`
   - Check **"Include Live Activity"**
4. Click **Finish** → **Activate** when prompted

### 6.2 Replace Generated Files

1. Delete the auto-generated files in Xcode (keep the folder)
2. **Right-click** DeliveryWidget folder → **Add Files to "LiveActivitiesDemo"**
3. Navigate to `ios/DeliveryWidget/` and add all 4 files:
   - `DeliveryWidgetBundle.swift`
   - `DeliveryActivityLiveActivity.swift`
   - `DeliveryActivityAttributes.swift`
   - `Info.plist`

### 6.3 Configure Widget Target

1. Select **DeliveryWidget** target in Project Navigator
2. **Signing & Capabilities:**
   - Set correct **Bundle Identifier**
   - Configure **Signing** (same team as main app)

---

## Step 7: Test Basic Functionality

### 7.1 Add Test Code

Replace `App.js` content:

```javascript
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { DynamicActivities } from 'react-native-dynamic-activities';

export default function App() {
  const [activityId, setActivityId] = useState(null);
  const [isSupported, setIsSupported] = useState(null);

  React.useEffect(() => {
    checkSupport();
  }, []);

  const checkSupport = async () => {
    try {
      const support = await DynamicActivities.areLiveActivitiesSupported();
      setIsSupported(support.supported);
      console.log('Live Activities Support:', support);
    } catch (error) {
      console.error('Support check failed:', error);
    }
  };

  const startActivity = async () => {
    try {
      const attributes = {
        title: "Pizza Delivery",
        body: "Your order is being prepared"
      };

      const content = {
        state: "preparing",
        relevanceScore: 1.0
      };

      const result = await DynamicActivities.startLiveActivity(attributes, content);
      setActivityId(result.activityId);
      Alert.alert('Success', `Live Activity started: ${result.activityId}`);
    } catch (error) {
      Alert.alert('Error', error.message);
      console.error('Start activity failed:', error);
    }
  };

  const updateActivity = async () => {
    if (!activityId) return;

    try {
      const content = {
        state: "delivering",
        relevanceScore: 0.8
      };

      await DynamicActivities.updateLiveActivity(activityId, content);
      Alert.alert('Success', 'Live Activity updated');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const endActivity = async () => {
    if (!activityId) return;

    try {
      const content = {
        state: "delivered",
        relevanceScore: 0.0
      };

      await DynamicActivities.endLiveActivity(activityId, content);
      setActivityId(null);
      Alert.alert('Success', 'Live Activity ended');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Live Activities Demo</Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          Support Status: {isSupported === null ? 'Checking...' : isSupported ? '✅ Supported' : '❌ Not Supported'}
        </Text>
        {activityId && (
          <Text style={styles.activityText}>Active: {activityId.substring(0, 8)}...</Text>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, !isSupported && styles.buttonDisabled]} 
          onPress={startActivity}
          disabled={!isSupported || activityId}
        >
          <Text style={styles.buttonText}>Start Activity</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.updateButton, !activityId && styles.buttonDisabled]} 
          onPress={updateActivity}
          disabled={!activityId}
        >
          <Text style={styles.buttonText}>Update Activity</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.endButton, !activityId && styles.buttonDisabled]} 
          onPress={endActivity}
          disabled={!activityId}
        >
          <Text style={styles.buttonText}>End Activity</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  statusText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#666',
  },
  activityText: {
    fontSize: 14,
    color: '#007AFF',
    fontFamily: 'Courier',
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  updateButton: {
    backgroundColor: '#FF9500',
  },
  endButton: {
    backgroundColor: '#FF3B30',
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

### 7.2 Build and Test

1. **Build the app:**
   ```bash
   npx react-native run-ios --device
   ```

2. **Test on device:**
   - Tap "Start Activity"
   - Check Dynamic Island and Lock Screen
   - Tap "Update Activity" to see changes
   - Tap "End Activity" to dismiss

**Expected behavior:**
- Live Activity appears in Dynamic Island
- Shows on Lock Screen with custom UI
- Updates reflect in real-time

---

## Step 8: Customize Your Widget

### 8.1 Modify Activity Attributes

Edit `ios/DeliveryWidget/DeliveryActivityAttributes.swift` to add custom fields:

```swift
struct DeliveryActivityAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        var state: String
        var relevanceScore: Double?
        var timestamp: Date?
        var estimatedDeliveryTime: Date?
        var driverName: String?
        
        public init(state: String, relevanceScore: Double? = nil, timestamp: Date? = nil, 
                   estimatedDeliveryTime: Date? = nil, driverName: String? = nil) {
            self.state = state
            self.relevanceScore = relevanceScore
            self.timestamp = timestamp
            self.estimatedDeliveryTime = estimatedDeliveryTime
            self.driverName = driverName
        }
    }
    
    var title: String
    var body: String
    var orderNumber: String
    var customerName: String
    
    public init(title: String, body: String, orderNumber: String, customerName: String) {
        self.title = title
        self.body = body
        self.orderNumber = orderNumber
        self.customerName = customerName
    }
}
```

### 8.2 Update React Native Code

Update your `startActivity` call:

```javascript
const startActivity = async () => {
  try {
    const attributes = {
      title: "Pizza Delivery",
      body: "Large Pepperoni Pizza",
      orderNumber: "#12345",
      customerName: "John Doe"
    };

    const content = {
      state: "preparing",
      relevanceScore: 1.0,
      estimatedDeliveryTime: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      driverName: "Mike"
    };

    const result = await DynamicActivities.startLiveActivity(attributes, content);
    setActivityId(result.activityId);
    Alert.alert('Success', `Live Activity started: ${result.activityId}`);
  } catch (error) {
    Alert.alert('Error', error.message);
  }
};
```

### 8.3 Rebuild and Test

```bash
npx react-native run-ios --device
```

Your Live Activities will now show the enhanced information!

---

## 🎉 Congratulations!

You've successfully created a React Native app with Live Activities! Your app now supports:

- ✅ **Dynamic Island integration**
- ✅ **Lock Screen Live Activities**
- ✅ **Real-time updates**
- ✅ **Custom SwiftUI design**

## 📚 Next Steps

- **[Widget Customization](widgets/customization)** - Advanced SwiftUI customization
- **[API Reference](api/overview)** - Complete API documentation
- **[Troubleshooting](troubleshooting)** - Common issues and solutions

## 🔧 Common Issues

### "Live Activities not supported"
- Ensure iOS 16.2+ on physical device
- Check entitlements are properly configured

### Widget not showing
- Verify Widget Extension target is added correctly
- Check bundle identifiers match
- Ensure all files are added to correct target

### Build errors
- Clean build folder: `Product → Clean Build Folder`
- Reinstall pods: `cd ios && pod install`
- Check all Swift files compile without errors

---

**Need help?** Check our [Troubleshooting Guide](troubleshooting) or [GitHub Discussions](https://github.com/pieczasz/react-native-dynamic-activities/discussions).