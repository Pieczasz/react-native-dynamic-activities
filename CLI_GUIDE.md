# CLI Widget Tool Guide

This guide covers the command-line interface (CLI) tools provided by React Native Dynamic Activities for generating Live Activity widgets and managing your project setup.

## Overview

The library includes several CLI commands to help you:
- Generate complete Live Activity widget scaffolding
- Set up Xcode project configurations
- Validate your development environment
- Create widget templates with best practices

## Available Commands

### `npx react-native-dynamic-activities create`

The primary command for generating Live Activity widgets.

```bash
# Generate with default name
npx react-native-dynamic-activities create

# Generate with custom name
npx react-native-dynamic-activities create DeliveryWidget

# Alternative syntax using the library's package scripts
bun run react-native-dynamic-activities create OrderTracker
```

### Package Script Commands

The library also provides npm/bun script commands:

```bash
# Generate a widget (same as CLI create)
bun run create-widget

# Validate widget setup
bun run widget:validate

# Diagnose widget issues
bun run widget:doctor
```

## Widget Generation Process

When you run the create command, the tool follows this process:

### 1. Environment Validation
- Checks if you're in a React Native project root
- Validates iOS directory exists
- Confirms Xcode project is present
- Verifies required dependencies

### 2. Configuration Setup
The tool will configure:
- **Widget Name**: The display name for your widget (e.g., "DeliveryWidget")
- **Bundle ID**: The iOS bundle identifier for the widget extension
- **Activity Name**: The Swift struct name for your ActivityAttributes

### 3. File Generation
Creates the following files:

#### Swift Files
```
ios/[ProjectName]Widget/
├── [WidgetName].swift                    # Main widget implementation
├── [WidgetName]LiveActivity.swift        # Live Activity configuration
├── [ActivityName]Attributes.swift        # Activity attributes definition
└── Info.plist                          # Widget extension info
```

#### Supporting Files
```
ios/[ProjectName]Widget/
├── Assets.xcassets/                     # Widget assets
│   ├── AccentColor.colorset/
│   └── AppIcon.appiconset/
└── [WidgetName].entitlements           # Required entitlements
```

### 4. Xcode Project Integration
- Adds Widget Extension target to your Xcode project
- Configures build settings and dependencies
- Sets up proper code signing
- Adds required capabilities and entitlements

## Generated Widget Structure

### ActivityAttributes Definition
```swift
import ActivityKit

struct DeliveryAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        var status: String
        var estimatedDeliveryTime: Date?
        var relevanceScore: Double?
    }
    
    var orderId: String
    var customerName: String
}
```

### Widget Implementation  
```swift
import WidgetKit
import SwiftUI

struct DeliveryLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: DeliveryAttributes.self) { context in
            // Lock Screen / Banner UI
            VStack(alignment: .leading) {
                Text("Order #\\(context.attributes.orderId)")
                Text("Status: \\(context.state.status)")
            }
        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    Text("🚚")
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text(context.state.status)
                }
            } compactLeading: {
                Text("🚚")
            } compactTrailing: {
                Text("📦")
            } minimal: {
                Text("🚚")
            }
        }
    }
}
```

## Command Options and Flags

### Basic Usage
```bash
# Use defaults
npx react-native-dynamic-activities create

# Specify widget name
npx react-native-dynamic-activities create [WidgetName]
```

### Advanced Options
While the current implementation focuses on simplicity, you can customize the generated code by modifying the templates in the `templates/` directory of the library.

## Environment Requirements

### Prerequisites
- React Native project with iOS support
- Xcode 14+ installed
- iOS 16.2+ deployment target
- react-native-dynamic-activities installed

### Required Project Structure
```
YourProject/
├── package.json
├── ios/
│   ├── YourProject.xcodeproj/
│   └── YourProject/
└── node_modules/
    └── react-native-dynamic-activities/
```

## Troubleshooting

### Common Issues and Solutions

#### "Not in a React Native project root"
**Problem**: CLI can't find package.json
**Solution**: Run the command from your React Native project's root directory

#### "No Xcode project found"
**Problem**: Missing .xcodeproj file in ios/ directory
**Solution**: Ensure you have run `npx react-native-ios` or have a valid iOS project setup

#### "Environment validation failed" 
**Problem**: Missing required dependencies or incorrect setup
**Solution**: Run the widget doctor command for detailed diagnostics

```bash
bun run widget:doctor
```

#### Permission Errors
**Problem**: CLI can't write files
**Solution**: Check file permissions and ensure you have write access to the project directory

#### Build Errors After Generation
**Problem**: Xcode build fails after adding widget
**Solution**: 
1. Clean build folder in Xcode (⌘+⇧+K)
2. Ensure proper code signing for both app and widget targets
3. Verify iOS deployment target is 16.2+

### Validation Command

Use the validation command to check your setup:

```bash
bun run widget:validate
```

This will check:
- Project structure integrity
- Required dependencies
- Xcode project configuration  
- Widget target setup
- Entitlements and capabilities

## Manual Setup (Alternative)

If the CLI doesn't work for your project structure, you can manually create the widget:

### 1. Create Widget Extension in Xcode
1. Open your iOS project in Xcode
2. File → New → Target → Widget Extension
3. Choose "Include Live Activity" if available
4. Set minimum iOS version to 16.2+

### 2. Configure ActivityAttributes
```swift
import ActivityKit

struct YourActivityAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        // Match your TypeScript LiveActivityContent interface
        var state: String
        var relevanceScore: Double?
        // Add other fields as needed
    }
    
    // Match your TypeScript LiveActivityAttributes interface  
    var title: String
    var body: String
}
```

### 3. Implement Widget Views
Follow the generated template structure but customize the UI to match your app's design.

### 4. Add Entitlements
Add to your app target's entitlements file:
```xml
<key>com.apple.developer.usernotifications.live-activities</key>
<true/>
```

## Best Practices

### 1. Widget Naming
- Use descriptive names (e.g., "DeliveryTracker", "OrderStatus")
- Follow Swift naming conventions (PascalCase)
- Avoid generic names like "Widget" or "Activity"

### 2. Bundle ID Structure  
- Follow reverse domain notation: `com.yourcompany.yourapp.widgetname`
- Keep consistent with your main app's bundle ID
- Use lowercase with dots as separators

### 3. ActivityAttributes Design
- Keep data minimal (under 4KB total)
- Match TypeScript interfaces exactly
- Use optional fields for flexibility
- Include relevanceScore for Dynamic Island priority

### 4. Testing
- Test on physical devices (Simulator has limitations)
- Verify both Lock Screen and Dynamic Island presentations
- Test different states and transitions
- Validate dismissal policies work correctly

## Complete Example

Here's a complete workflow for creating a delivery tracking widget:

```bash
# 1. Generate the widget
cd YourReactNativeProject
npx react-native-dynamic-activities create DeliveryTracker

# 2. The CLI creates files and configures Xcode

# 3. Build and test
cd ios && xcodebuild -workspace YourProject.xcworkspace -scheme YourProject
```

Then in your React Native code:
```typescript
import { DynamicActivities } from 'react-native-dynamic-activities';

// Start the activity (attributes must match Swift struct)
const result = await DynamicActivities.startLiveActivity(
  {
    title: "Delivery #12345",
    body: "Your food is being prepared"
  },
  {
    state: "preparing", 
    relevanceScore: 1.0
  }
);

// Update the activity
await DynamicActivities.updateLiveActivity(
  result.activityId,
  {
    state: "on_way",
    relevanceScore: 0.8  
  }
);

// End with custom dismissal
await DynamicActivities.endLiveActivity(
  result.activityId,
  { state: "delivered" },
  "after",
  undefined,
  new Date(Date.now() + 2 * 60 * 60 * 1000) // Keep visible for 2 hours
);
```

This comprehensive CLI tool setup ensures you can quickly generate production-ready Live Activity widgets with proper Xcode integration and TypeScript compatibility.