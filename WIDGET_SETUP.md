# Widget Extension Setup Guide

This guide covers the enhanced developer experience tools for creating Live Activity widgets with minimal Xcode work.

## 🚀 Quick Start Options

### Option 1: Widget Scaffolder CLI (Recommended)

Generate a complete Widget Extension with one command:

```bash
# Generate with defaults
npx react-native-dynamic-activities create-widget

# Custom configuration
npx react-native-dynamic-activities create-widget \
  --name=TimerWidget \
  --activity=TimerActivity \
  --bundle-id=com.yourapp.timer.widget
```

**What it creates:**
- Complete Swift widget implementation
- ActivityKit attributes matching your TypeScript types
- Dynamic Island + Lock Screen UI
- Info.plist with Live Activities support
- Preview configurations for Xcode

### Option 2: Expo Config Plugin (Expo Projects)

For Expo projects, add automatic Live Activities configuration:

```javascript
// app.config.js or expo.json
export default {
  expo: {
    plugins: [
      [
        "react-native-dynamic-activities",
        {
          widgetName: "MyAppWidget",
          bundleIdSuffix: "widget",
          activityName: "MyActivity"
        }
      ]
    ]
  }
};
```

**What it configures:**
- Live Activities entitlement
- Info.plist configuration
- Widget Extension directory structure
- Setup instructions

### Option 3: Manual Templates

Use provided templates for custom setup:

```bash
# Copy templates to your project
cp -r node_modules/react-native-dynamic-activities/templates/widget ios/MyWidget
```

## 📋 Complete Setup Workflow

### 1. Generate Widget Files

Choose one of the options above to generate your widget foundation.

### 2. Xcode Configuration

**Required manual steps in Xcode:**

1. **Add Widget Extension Target:**
   - File -> New -> Target...
   - Select "Widget Extension"
   - Use the same name as your generated widget
   - Check "Include Live Activity"

2. **Replace Generated Files:**
   - Delete Xcode's generated Swift files
   - Add your generated files to the widget target

3. **Enable Live Activities:**
   - Select main app target
   - Signing & Capabilities tab
   - Add "Live Activities" capability

### 3. TypeScript Integration

Ensure your TypeScript types match your Swift `ActivityAttributes`:

```typescript
// Your JS types should match Swift ActivityAttributes structure
interface LiveActivityAttributes {
  title: string;
  body: string;
  metadata?: Record<string, string>;
}

interface LiveActivityContent {
  state: string;
  relevanceScore?: number;
  timestamp?: Date;
}
```

### 4. Test Your Widget

```typescript
import { DynamicActivities } from 'react-native-dynamic-activities';

const attributes = {
  title: "Timer",
  body: "25 minutes remaining"
};

const content = {
  state: "active",
  relevanceScore: 0.8
};

const result = await DynamicActivities.startLiveActivity(attributes, content);
```

## 🎨 Customization Guide

### Widget UI Customization

Edit the generated `*LiveActivity.swift` file to customize:

- **Lock Screen appearance** (main ActivityConfiguration block)
- **Dynamic Island states** (compactLeading, compactTrailing, minimal, expanded)
- **Colors, fonts, layouts**

### Advanced Features

#### Custom Activity Attributes

Extend `ActivityAttributes` for your use case:

```swift
struct TimerAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        var timeRemaining: TimeInterval
        var isRunning: Bool
        var state: String
    }
    
    var title: String
    var totalDuration: TimeInterval
}
```

#### Multiple Widget Types

Create multiple activities for different use cases:

```bash
# Generate different widgets
npx react-native-dynamic-activities create-widget --name=TimerWidget --activity=Timer
npx react-native-dynamic-activities create-widget --name=DeliveryWidget --activity=Delivery
```

## 🛠 Troubleshooting

### Common Issues

**Widget not appearing:**
- Ensure Live Activities capability is enabled
- Check device settings: Settings -> Face ID & Passcode -> Live Activities
- Test on physical device (limited Simulator support)

**Build errors:**
- Verify all generated files are added to widget target
- Check bundle identifier matches between JS and Xcode
- Ensure iOS deployment target is 16.2+

**Type mismatches:**
- Keep TypeScript types aligned with Swift `ActivityAttributes`
- Use the generated type mapping helpers
- Test with simple attributes first

### Debug Commands

```bash
# Check project configuration
npx react-native-dynamic-activities doctor

# Validate widget setup
npx react-native-dynamic-activities validate-widget --name=MyWidget

# Regenerate templates
npx react-native-dynamic-activities create-widget --overwrite
```

## 📚 Additional Resources

- [Apple Live Activities Documentation](https://developer.apple.com/documentation/activitykit)
- [Dynamic Island Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/live-activities)
- [WidgetKit Documentation](https://developer.apple.com/documentation/widgetkit)

## 🎯 Best Practices

1. **Keep attributes minimal** - Only essential data that won't change
2. **Update content frequently** - Use relevanceScore for prioritization  
3. **Design for all states** - Compact, expanded, and minimal Dynamic Island views
4. **Test on device** - Simulator has limited Live Activities support
5. **Handle errors gracefully** - User may disable Live Activities in settings

## 🔄 Migration from Manual Setup

If you have an existing manual widget setup:

1. Generate new widget files: `npx react-native-dynamic-activities create-widget --name=ExistingWidget`
2. Compare with your current implementation
3. Migrate custom UI while keeping the generated structure
4. Update TypeScript types to match the new ActivityAttributes