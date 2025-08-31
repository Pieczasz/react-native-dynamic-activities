# Widget Generation Overview

React Native Dynamic Activities includes powerful CLI tools that generate complete SwiftUI Live Activity templates, saving you hours of setup and ensuring best practices from day one.

## 🎯 Why Use Widget Generation?

### ⚡ **Instant Setup**
- **Complete SwiftUI templates** generated in seconds
- **ActivityAttributes structure** matching your data
- **Dynamic Island layouts** with compact, expanded, and minimal views
- **Lock Screen designs** optimized for readability

### 🛡️ **Best Practices Built-In**
- **Apple Design Guidelines** compliance
- **Performance optimized** SwiftUI code
- **Accessibility ready** with proper labels
- **Type-safe** Swift ↔ JavaScript bridge

### 🎨 **Customizable Foundation**
- **Modern SwiftUI patterns** using latest iOS APIs
- **Responsive layouts** for all screen sizes
- **Theme-aware** colors and styles
- **Easy to extend** and customize

## 🚀 Quick Start

### Generate Your First Widget

```bash
# Navigate to your React Native project root
cd YourReactNativeProject

# Generate a widget (replace 'DeliveryWidget' with your desired name)
npx react-native-dynamic-activities create DeliveryWidget

# Or use the short command
rn-dynamic-activities create DeliveryWidget
```

### What Gets Generated

```
ios/DeliveryWidget/
├── DeliveryWidgetBundle.swift      # Widget entry point
├── DeliveryActivityLiveActivity.swift  # SwiftUI Live Activity UI
├── DeliveryActivityAttributes.swift    # Activity data structure
└── Info.plist                     # Widget configuration
```

## 📁 Generated File Structure

### 1. Widget Bundle (`DeliveryWidgetBundle.swift`)
The main entry point that registers your Live Activity with the system:

```swift
import SwiftUI
import WidgetKit

@main
struct DeliveryWidgetBundle: WidgetBundle {
    var body: some Widget {
        DeliveryActivityLiveActivity()
    }
}
```

### 2. Live Activity UI (`DeliveryActivityLiveActivity.swift`)
Complete SwiftUI implementation with:

- **Lock Screen Layout** - Full-featured UI with status, progress, and details
- **Dynamic Island** - Compact, expanded, and minimal views
- **State Management** - Reactive UI based on activity state
- **Accessibility** - Full VoiceOver support

```swift
struct DeliveryActivityLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: DeliveryActivityAttributes.self) { context in
            // Lock Screen/Banner UI
            VStack(alignment: .leading, spacing: 8) {
                // Rich, customizable layout
            }
        } dynamicIsland: { context in
            DynamicIsland {
                // Expanded, Compact, and Minimal views
            }
        }
    }
}
```

### 3. Activity Attributes (`DeliveryActivityAttributes.swift`)
Type-safe data structure defining your Live Activity:

```swift
struct DeliveryActivityAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        var state: String
        var relevanceScore: Double?
        var timestamp: Date?
    }
    
    var title: String
    var body: String
    var metadata: [String: String]?
}
```

### 4. Info.plist Configuration
Proper Widget Extension configuration:

```xml
<key>NSSupportsLiveActivities</key>
<true/>
<key>NSExtension</key>
<dict>
    <key>NSExtensionPointIdentifier</key>
    <string>com.apple.widgetkit-extension</string>
</dict>
```

## 🎨 Default UI Features

### Lock Screen Layout
- **Header** with title and status badge
- **Body text** with activity description  
- **Progress indicator** with relevance-based progress bar
- **Estimated time** with clock icon and time remaining
- **Status messages** that change based on activity state

### Dynamic Island Layouts

#### Expanded View
- **Leading region:** Title and current status
- **Trailing region:** Time remaining and progress bar
- **Center region:** Descriptive status message

#### Compact View
- **Leading:** First letter of title or custom icon
- **Trailing:** Color-coded status indicator

#### Minimal View
- **Single element:** Activity identifier or icon

## 🎛️ CLI Options

### Basic Usage

```bash
# Generate with default name
rn-dynamic-activities create

# Generate with custom name  
rn-dynamic-activities create MyWidget

# Generate with custom bundle ID
rn-dynamic-activities create MyWidget --bundle-id=com.myapp.widget

# Generate with custom activity name
rn-dynamic-activities create MyWidget --activity=OrderTracking
```

### Advanced Options

```bash
# Full customization
rn-dynamic-activities create DeliveryTracker \
  --bundle-id=com.foodapp.delivery \
  --activity=DeliveryTracking \
  --template=advanced
```

### Available Templates

| Template | Description | Use Case |
|----------|-------------|----------|
| `basic` (default) | Simple status tracking | Basic state updates |
| `progress` | Progress-focused layout | Task completion tracking |
| `timer` | Time-based activities | Workout timers, cooking |
| `location` | Location-aware design | Delivery, ride-sharing |

## 🔧 Generated Code Features

### Responsive Design
- **Safe area aware** layouts
- **Dynamic Type** support for accessibility
- **Device orientation** handling
- **Screen size** adaptation

### Performance Optimized
- **SwiftUI best practices** for smooth animations
- **Memory efficient** view updates
- **Battery conscious** update patterns
- **Lazy loading** for complex content

### Accessibility Ready
- **VoiceOver** labels and hints
- **Dynamic Type** text scaling
- **High contrast** support
- **Reduced motion** compatibility

## 🚀 Integration with React Native

### Type-Safe Bridge
Generated ActivityAttributes automatically map to your TypeScript types:

```typescript
// Your React Native code
const attributes = {
  title: "Food Delivery",
  body: "Pizza from Mario's - Order #1234"
};

const content = {
  state: "preparing",
  relevanceScore: 1.0
};

await DynamicActivities.startLiveActivity(attributes, content);
```

```swift
// Generated Swift code handles the mapping
static func from(jsAttributes: [String: Any]) -> DeliveryActivityAttributes? {
    guard let title = jsAttributes["title"] as? String,
          let body = jsAttributes["body"] as? String else {
        return nil
    }
    
    return DeliveryActivityAttributes(title: title, body: body)
}
```

## 📱 Testing Your Generated Widget

### 1. Build and Test
```bash
# Build your iOS app
cd ios && xcodebuild -workspace YourApp.xcworkspace -scheme YourApp

# Or run through React Native
npx react-native run-ios
```

### 2. Verify Widget Extension
1. Open Xcode
2. Select your **Widget Extension** target
3. **Build and Run** - this opens the Widget preview
4. Test different **Live Activity states**

### 3. Test on Device
```typescript
// Test your generated widget
const result = await DynamicActivities.startLiveActivity(
  { title: "Test Activity", body: "Generated widget test" },
  { state: "active", relevanceScore: 1.0 }
);
```

## 🎨 Next Steps

Ready to customize your generated widget?

1. **[CLI Usage Guide](cli-usage)** - Learn all CLI options and commands
2. **[Customization Guide](customization)** - Modify the generated SwiftUI code  
3. **Xcode Setup** - Integrate with your Xcode project
4. **Design Guidelines** - Follow Apple's Live Activity best practices

## 💡 Pro Tips

### 🎯 **Naming Conventions**
- Use **PascalCase** for widget names: `DeliveryTracker`, `WorkoutTimer`
- Keep activity names **descriptive**: `DeliveryTracking`, `WorkoutSession`
- Match your app's **domain** in bundle IDs

### 🚀 **Development Workflow**
1. **Generate** widget template with CLI
2. **Customize** SwiftUI layouts for your needs
3. **Test** in Xcode Widget preview
4. **Integrate** with React Native app
5. **Deploy** to TestFlight for device testing

### 🎨 **Design Considerations**
- **Keep text concise** - space is limited in Dynamic Island
- **Use meaningful colors** - they convey status at a glance  
- **Test accessibility** - ensure VoiceOver works well
- **Consider dark mode** - your widget should look great in both themes

---

**Ready to generate your first widget?** Check out the [CLI Usage Guide](cli-usage) for detailed commands and options! 🚀