# Installation

Get React Native Dynamic Activities up and running in your project in just a few minutes.

## 📋 Requirements

### System Requirements
- **iOS 16.2+** (for Live Activities support)
- **Xcode 14.0+** (for iOS 16.2 SDK)
- **React Native 0.70+** (for Nitro Modules compatibility)
- **Node.js 18+** (for modern JavaScript features)

### Dependencies
- [`react-native-nitro-modules`](https://github.com/margelo/react-native-nitro-modules) - The native bridge framework

## 🚀 Quick Installation

### 1. Install the Package

```bash
# Using npm
npm install react-native-dynamic-activities react-native-nitro-modules

# Using yarn
yarn add react-native-dynamic-activities react-native-nitro-modules

# Using bun (recommended)
bun add react-native-dynamic-activities react-native-nitro-modules
```

### 2. iOS Platform Setup

#### Install iOS Dependencies

```bash
cd ios && pod install
```

#### Add Live Activities Entitlement

1. Open your project in **Xcode**
2. Select your **app target**
3. Go to **Signing & Capabilities**
4. Click **+ Capability**
5. Add **"Push Notifications"** (for remote updates)
6. Add **"Background Modes"** and enable **"Background Processing"**

Add this to your `ios/YourApp/YourApp.entitlements`:

```xml
<key>com.apple.developer.ActivityKit</key>
<true/>
<key>com.apple.developer.ActivityKit-push-updates</key>
<true/>
```

#### Configure Info.plist

Add to `ios/YourApp/Info.plist`:

```xml
<key>NSSupportsLiveActivities</key>
<true/>
<key>NSSupportsLiveActivitiesFrequentUpdates</key>
<true/>
```

### 3. Generate Your First Widget

Use our CLI to generate a complete SwiftUI Live Activity template:

```bash
# From your project root
npx react-native-dynamic-activities create MyWidget

# Or using the global command
bun --bun x react-native-dynamic-activities create MyWidget
```

This creates:
- `ios/MyWidget/MyWidgetBundle.swift` - Widget entry point
- `ios/MyWidget/MyActivityLiveActivity.swift` - SwiftUI Live Activity UI
- `ios/MyWidget/MyActivityAttributes.swift` - Activity data structure
- `ios/MyWidget/Info.plist` - Widget configuration

### 4. Add Widget Target to Xcode

1. Open your project in **Xcode**
2. **File → New → Target...**
3. Select **Widget Extension** → **Next**
4. **Product Name:** `MyWidget` (match your CLI-generated name)
5. **Bundle Identifier:** `com.yourapp.MyWidget`
6. Check **"Include Live Activity"** if available
7. Click **Finish**
8. **Replace** the generated files with your CLI-generated ones from `ios/MyWidget/`

### 5. Verify Installation

Add this test code to your React Native app:

```typescript
import { DynamicActivities } from 'react-native-dynamic-activities';

// Check if Live Activities are supported
const supportInfo = await DynamicActivities.areLiveActivitiesSupported();
console.log('Live Activities Support:', supportInfo);

if (supportInfo.supported) {
  console.log('✅ Ready to create Live Activities!');
} else {
  console.log('❌ Live Activities not supported:', supportInfo.comment);
}
```

## 🔧 Advanced Configuration

### Metro Configuration

If you encounter issues with Nitro Modules, add to your `metro.config.js`:

```javascript
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

### TypeScript Configuration

Ensure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true
  }
}
```


## 🛠️ Troubleshooting

### Common Issues

#### "Live Activities not supported" on iOS 16.2+

**Solution:** Check your entitlements and Info.plist configuration. Ensure you've added the `com.apple.developer.ActivityKit` entitlement.

#### Widget Extension not showing up

**Solution:** Make sure your Widget Extension target has the same bundle identifier prefix as your main app and includes the correct Info.plist settings.

#### Build errors with Nitro Modules

**Solution:** 
1. Clean your build: `cd ios && xcodebuild clean`
2. Clear Metro cache: `npx react-native start --reset-cache`  
3. Reinstall pods: `cd ios && pod install`

#### Android build issues

**Solution:** Android is not supported. The library provides a clean stub implementation that returns descriptive error messages.

### Getting Help

- 📖 **Documentation:** Check our [Troubleshooting Guide](troubleshooting)
- 🐛 **Bug Reports:** [GitHub Issues](https://github.com/pieczasz/react-native-dynamic-activities/issues)
- 💬 **Questions:** [GitHub Discussions](https://github.com/pieczasz/react-native-dynamic-activities/discussions)
- 🔍 **Stack Overflow:** Tag with `react-native-dynamic-activities`

## ✅ Verification Checklist

Make sure you have:

- [ ] ✅ Installed the package and dependencies
- [ ] 📱 Added Live Activities entitlement
- [ ] ⚙️ Configured Info.plist settings  
- [ ] 🎨 Generated widget with CLI tool
- [ ] 🔨 Added Widget Extension to Xcode
- [ ] ✨ Tested basic functionality

## 🎉 What's Next?

Now that you have React Native Dynamic Activities installed:

1. **[Getting Started Guide](getting-started)** - Create your first Live Activity
2. **[Widget Customization](widgets/customization)** - Learn to customize your SwiftUI templates  
3. **[API Reference](api/overview)** - Explore the complete API

---

**Ready to create amazing Live Activities?** Let's [get started](getting-started)! 🚀