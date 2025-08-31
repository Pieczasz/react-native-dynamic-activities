# Troubleshooting Guide

Common issues and solutions when working with React Native Dynamic Activities. Follow this guide to diagnose and fix problems quickly.

## 🚨 Quick Diagnosis

### Is your issue here?

| Problem | Quick Check | Solution |
|---------|-------------|----------|
| 🚫 "Live Activities not supported" | iOS version? | [iOS Version Issues](#-ios-version-issues) |
| 📱 Live Activity not appearing | Physical device? | [Testing on Simulator](#-testing-on-simulator) |
| 🔧 Build errors | Missing entitlements? | [Entitlement Issues](#️-entitlement-issues) |
| 🎨 Widget not showing up | Xcode target added? | [Widget Extension Issues](#-widget-extension-issues) |
| ⚠️ TypeScript errors | Nitro Modules issue? | [TypeScript & Nitro Issues](#-typescript--nitro-issues) |
| 🤖 Android crashes | Android not supported | [Android Platform Issues](#-android-platform-issues) |

---

## 📱 iOS Version Issues

### Problem: "Live Activities not supported" on iOS 16.2+

#### Symptoms
```typescript
const info = await DynamicActivities.areLiveActivitiesSupported();
// Returns: { supported: false, version: 16.2, comment: "..." }
```

#### Possible Causes & Solutions

**1. Missing Live Activities Entitlement**
```xml
<!-- Add to ios/YourApp/YourApp.entitlements -->
<key>com.apple.developer.ActivityKit</key>
<true/>
```

**2. Missing Info.plist Configuration**
```xml
<!-- Add to ios/YourApp/Info.plist -->
<key>NSSupportsLiveActivities</key>
<true/>
```

**3. User Disabled Live Activities**
- Go to **Settings > YourApp > Live Activities**
- Enable **"Allow Live Activities"**

**4. Focus Mode or Do Not Disturb**
- Live Activities respect Focus modes
- Check if Focus mode is blocking notifications

### Problem: Features not available despite correct iOS version

#### iOS 17.2+ Features Not Working
```typescript
// Timestamp parameter ignored
await DynamicActivities.updateLiveActivity(id, content, null, new Date());
```

**Solution:** Check actual iOS version:
```typescript
import { Platform } from 'react-native';

const iosVersion = parseFloat(Platform.Version as string);
if (iosVersion >= 17.2) {
  // Use timestamp
  await DynamicActivities.updateLiveActivity(id, content, null, timestamp);
} else {
  // Fallback
  await DynamicActivities.updateLiveActivity(id, content);
}
```

---

## 🏗️ Entitlement Issues

### Problem: "Unentitled" error when starting Live Activity

#### Error Message
```
LiveActivityError: The app doesn't have the required entitlement to start a Live Activity.
Code: unentitled
```

#### Solution Checklist

**1. ✅ Add Live Activities Entitlement**
```xml
<!-- ios/YourApp/YourApp.entitlements -->
<key>com.apple.developer.ActivityKit</key>
<true/>
```

**2. ✅ Add Push Notifications (for remote updates)**
```xml
<!-- ios/YourApp/YourApp.entitlements -->
<key>aps-environment</key>
<string>development</string> <!-- or "production" -->

<key>com.apple.developer.ActivityKit-push-updates</key>
<true/>
```

**3. ✅ Verify Xcode Capabilities**
1. Select your **app target** in Xcode
2. Go to **Signing & Capabilities**
3. Click **+ Capability**
4. Add **"Push Notifications"**
5. The ActivityKit entitlement should be added automatically

**4. ✅ Check Provisioning Profile**
- Ensure your provisioning profile includes the Live Activities entitlement
- Regenerate provisioning profile if needed

### Problem: Entitlements not taking effect

#### Solution: Clean and Rebuild
```bash
cd ios
rm -rf build
xcodebuild clean
cd ..
npx react-native run-ios
```

---

## 🎨 Widget Extension Issues

### Problem: Generated widget files not working in Xcode

#### Symptoms
- Build errors in Widget Extension
- SwiftUI compilation failures
- Widget not appearing in Widget gallery

#### Solution: Proper Widget Extension Setup

**1. ✅ Create Widget Extension in Xcode**
1. **File → New → Target...**
2. Select **Widget Extension**
3. **Product Name:** Must match CLI-generated name
4. **Bundle Identifier:** `com.yourapp.widgetname`
5. ✅ Check **"Include Live Activity"**

**2. ✅ Replace Generated Files**
- Delete Xcode-generated Swift files
- Copy CLI-generated files from `ios/YourWidget/`
- Add files to Xcode project

**3. ✅ Verify Bundle Identifier**
```swift
// In Widget Extension target settings
Bundle Identifier: com.yourapp.yourwidget

// Must be a child of main app:
Main App: com.yourapp
Widget: com.yourapp.widget
```

**4. ✅ Check Widget Extension Info.plist**
```xml
<key>NSSupportsLiveActivities</key>
<true/>
<key>NSExtension</key>
<dict>
    <key>NSExtensionPointIdentifier</key>
    <string>com.apple.widgetkit-extension</string>
</dict>
```

### Problem: Widget builds but doesn't show Live Activities

#### Check Widget Registration
```swift
// In YourWidgetBundle.swift
@main
struct YourWidgetBundle: WidgetBundle {
    var body: some Widget {
        YourActivityLiveActivity() // ← Must match your Live Activity struct
    }
}
```

#### Check ActivityAttributes Structure
```swift
// Ensure your ActivityAttributes conforms to ActivityAttributes protocol
struct YourActivityAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        // Must be Codable and Hashable
    }
    
    // Static attributes
    var title: String
    var body: String
}
```

---

## 🔧 TypeScript & Nitro Issues

### Problem: TypeScript compilation errors

#### Common Errors & Solutions

**1. "Cannot find module 'react-native-dynamic-activities'"**
```bash
# Clean and reinstall
rm -rf node_modules
npm install

# Or with bun
rm -rf node_modules  
bun install
```

**2. "Property 'DynamicActivities' does not exist"**
```typescript
// ✅ Correct import
import { DynamicActivities } from 'react-native-dynamic-activities';

// ❌ Incorrect
import DynamicActivities from 'react-native-dynamic-activities';
```

**3. Nitro Modules build errors**
```bash
# Clear Metro cache
npx react-native start --reset-cache

# Clean iOS build
cd ios && xcodebuild clean && cd ..

# Reinstall pods
cd ios && pod install && cd ..
```

### Problem: "JSI Runtime Error" or Nitro Modules crashes

#### Solution: Check Nitro Modules Setup

**1. ✅ Verify peer dependency**
```json
// package.json should include
{
  "dependencies": {
    "react-native-dynamic-activities": "^0.1.0",
    "react-native-nitro-modules": "^0.29.1"
  }
}
```

**2. ✅ Check Metro configuration**
```javascript
// metro.config.js
const { getDefaultConfig } = require('@react-native/metro-config');

const config = getDefaultConfig(__dirname);

// Add Nitro Modules support
config.resolver.platforms = [
  ...config.resolver.platforms,
  'nitro.ts',
  'nitro.js',
];

module.exports = config;
```

**3. ✅ Verify React Native version compatibility**
```bash
# React Native 0.70+ required
npx react-native --version
```

---

## 🤖 Android Platform Issues

### Problem: App crashes on Android

#### Error Message
```
UnsupportedOperationException: Live Activities are iOS-only.
```

#### Solution: Platform-Specific Code
```typescript
import { Platform } from 'react-native';

if (Platform.OS === 'ios') {
  // Only call on iOS
  const info = await DynamicActivities.areLiveActivitiesSupported();
  if (info.supported) {
    await DynamicActivities.startLiveActivity(attributes, content);
  }
} else {
  // Handle Android gracefully
  console.log('Live Activities not available on Android');
  // Show in-app notifications instead
  showInAppNotification(title, body);
}
```

#### Better: Use Support Check
```typescript
// This works on both platforms
const info = await DynamicActivities.areLiveActivitiesSupported();

if (info.supported) {
  // Will be false on Android
  await DynamicActivities.startLiveActivity(attributes, content);
} else {
  console.log('Not supported:', info.comment);
  // "Live Activities are not supported on Android"
}
```

---

## 📱 Testing on Simulator

### Problem: Live Activities not appearing in iOS Simulator

#### Why This Happens
**Live Activities don't work in iOS Simulator** - this is an Apple limitation, not a bug in the library.

#### Solution: Test on Physical Device
```bash
# Connect iPhone/iPad via USB
# Build and run on device
npx react-native run-ios --device "Your iPhone Name"

# Or select device in Xcode and build
```

#### Simulator Testing Alternatives
While Live Activities won't appear, you can still test:

**1. ✅ Support Detection**
```typescript
// This works in Simulator
const info = await DynamicActivities.areLiveActivitiesSupported();
console.log(info); // Will show supported: true, version: 16.2+
```

**2. ✅ Error Handling**
```typescript
// Test error scenarios in Simulator
try {
  await DynamicActivities.startLiveActivity(invalidData, content);
} catch (error) {
  console.log('Error handling works:', error.message);
}
```

**3. ✅ TypeScript Compilation**
- Import statements work
- Type checking functions
- IntelliSense and auto-completion

---

## 🚀 Performance Issues

### Problem: App slow or unresponsive after adding Live Activities

#### Possible Causes & Solutions

**1. ✅ Too many concurrent activities**
```typescript
// Check active activities before starting new ones
const activeCount = await getActiveActivityCount(); // Your app logic

if (activeCount >= 5) {
  // End oldest activity before starting new one
  await DynamicActivities.endLiveActivity(oldestActivityId, finalContent);
}

await DynamicActivities.startLiveActivity(attributes, content);
```

**2. ✅ Heavy SwiftUI layouts**
Optimize your widget's SwiftUI code:
```swift
// ✅ Good: Efficient layout
VStack(spacing: 8) {
    Text(context.attributes.title)
        .font(.headline)
    Text(context.state.state)
        .font(.caption)
}

// ❌ Bad: Complex nested layouts
VStack {
    HStack {
        VStack {
            // Too much nesting
        }
    }
}
```

**3. ✅ Frequent updates**
```typescript
// ✅ Good: Batch updates
const updateQueue = [];
updateQueue.push(newState1, newState2, newState3);

// Process queue every 30 seconds
setInterval(async () => {
  if (updateQueue.length > 0) {
    const latestState = updateQueue.pop();
    await DynamicActivities.updateLiveActivity(activityId, latestState);
    updateQueue.length = 0;
  }
}, 30000);

// ❌ Bad: Update on every change
onChange((newState) => {
  DynamicActivities.updateLiveActivity(activityId, newState);
});
```

---

## 🛠️ Development Workflow Issues

### Problem: Changes not reflecting during development

#### Solution: Proper Development Workflow

**1. ✅ For JavaScript changes:**
```bash
# Reload Metro
npx react-native start --reset-cache
```

**2. ✅ For Widget UI changes (SwiftUI):**
```bash
# Rebuild iOS app
cd ios
xcodebuild -workspace YourApp.xcworkspace -scheme YourApp clean
cd ..
npx react-native run-ios
```

**3. ✅ For Nitro Modules changes:**
```bash
# Full clean rebuild
npm run clean  # or equivalent for your setup
rm -rf node_modules
npm install
cd ios && pod install && cd ..
npx react-native run-ios
```

### Problem: Widget preview not updating in Xcode

#### Solution: Refresh Widget Previews
1. In Xcode, select your **Widget Extension** target
2. **Product → Clean Build Folder**
3. **Product → Build**
4. Widget previews should update

---

## 🔍 Debugging Tools

### Enable Detailed Logging

**1. JavaScript Debugging**
```typescript
// Add this for detailed error logging
import { LiveActivityErrorSeverity, getErrorSeverity } from 'react-native-dynamic-activities';

try {
  await DynamicActivities.startLiveActivity(attributes, content);
} catch (error) {
  if (isLiveActivityError(error)) {
    console.group('🚨 Live Activity Debug Info');
    console.log('Error Code:', error.code);
    console.log('Message:', error.message);
    console.log('Severity:', getErrorSeverity(error));
    console.log('Recovery:', error.recoverySuggestion);
    console.log('Native Error:', error.nativeError);
    console.log('Activity ID:', error.activityId);
    console.log('Timestamp:', error.timestamp);
    console.groupEnd();
  }
}
```

**2. Native iOS Debugging**
Add to your Swift code for debugging:
```swift
// In your Live Activity Swift files
print("🔍 Activity State: \(context.state.state)")
print("🔍 Relevance Score: \(context.state.relevanceScore ?? 0)")
print("🔍 Activity ID: \(context.activity.id)")
```

### Xcode Console Debugging
1. **Window → Devices and Simulators**
2. Select your device
3. Click **"Open Console"**
4. Filter by your app name to see Live Activity logs

---

## 🆘 Getting Help

### Before Asking for Help

**1. ✅ Check this troubleshooting guide**
**2. ✅ Verify iOS version compatibility**
**3. ✅ Test on physical device (not Simulator)**
**4. ✅ Check entitlements and Info.plist**
**5. ✅ Try a clean rebuild**

### Where to Get Help

**GitHub Issues (Bug Reports)**
- 🐛 [Report bugs](https://github.com/pieczasz/react-native-dynamic-activities/issues/new?template=bug_report.md)
- Include: iOS version, React Native version, error messages, reproduction steps

**GitHub Discussions (Questions)**
- 💬 [Ask questions](https://github.com/pieczasz/react-native-dynamic-activities/discussions)
- Share your use case, get implementation advice

**Stack Overflow**
- 🔍 Tag: `react-native-dynamic-activities`
- Include minimal reproduction code

### Information to Include

When asking for help, please include:

```typescript
// Device & versions
console.log('Platform:', Platform.OS, Platform.Version);
console.log('React Native:', require('react-native/package.json').version);

// Support info
const info = await DynamicActivities.areLiveActivitiesSupported();
console.log('Support Info:', info);

// Error details (if applicable)
catch (error) {
  console.log('Full Error:', {
    message: error.message,
    code: error.code,
    stack: error.stack,
    nativeError: error.nativeError
  });
}
```

---

## 💡 Prevention Tips

### 1. Always Check Support First
```typescript
const checkSupport = async () => {
  const info = await DynamicActivities.areLiveActivitiesSupported();
  if (!info.supported) {
    // Disable Live Activity features
    setFeatureEnabled('liveActivities', false);
    return false;
  }
  return true;
};
```

### 2. Use TypeScript Strictly
```typescript
// Enable strict mode in tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true
  }
}
```

### 3. Test on Multiple Devices
- Test on different iOS versions (16.2, 17.0, 17.2+)
- Test with different user settings (Focus modes, notification permissions)
- Test error scenarios (network failures, permission denials)

### 4. Follow Apple's Guidelines
- Keep activity content concise
- Use meaningful relevance scores
- End activities when no longer needed
- Respect user preferences (Focus modes, Do Not Disturb)

---

**Still having issues?** Check our [GitHub Issues](https://github.com/pieczasz/react-native-dynamic-activities/issues) or [start a discussion](https://github.com/pieczasz/react-native-dynamic-activities/discussions)! 🤝