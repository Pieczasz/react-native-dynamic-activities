# CLI Usage Guide

Master the React Native Dynamic Activities CLI to generate perfect Live Activity widgets quickly and efficiently.

## 🚀 Installation & Access

### Global Installation
```bash
npm install -g react-native-dynamic-activities
react-native-dynamic-activities --help
```

### Project-local Usage (Recommended)
```bash
# Via npx (most common)
npx react-native-dynamic-activities create MyWidget

# Via bun
bun x react-native-dynamic-activities create MyWidget

# Via yarn
yarn dlx react-native-dynamic-activities create MyWidget
```

## 📋 Command Overview

### Main Commands

| Command | Description | Example |
|---------|-------------|---------|
| `create [name]` | Generate a new widget | `create DeliveryWidget` |
| `help` | Show help information | `help` |
| `--version` | Show CLI version | `--version` |

## 🎛️ Create Command Options

### Basic Syntax
```bash
react-native-dynamic-activities create [widget-name]
```

### Arguments

| Argument | Type | Default | Description |
|----------|------|---------|-------------|
| `[name]` | String | `ExampleWidget` | Widget extension name (e.g., DeliveryWidget) |

**Auto-generated values:**
- **Bundle ID**: Automatically detected from your iOS project or generated
- **Activity Name**: Based on widget name (e.g., `DeliveryWidget` → `DeliveryActivity`)
- **Files**: All necessary Swift files and Info.plist

## 📖 Detailed Usage Examples

### 1. Simple Widget Generation
```bash
# Generates: MyWidget with MyActivityAttributes
npx react-native-dynamic-activities create MyWidget
```

**Generated Files:**
```
ios/MyWidget/
├── MyWidgetBundle.swift
├── MyActivityLiveActivity.swift
├── MyActivityAttributes.swift
└── Info.plist
```

### 2. Custom Bundle Identifier
```bash
# Specify your app's bundle ID pattern
npx react-native-dynamic-activities create DeliveryWidget \
  --bundle-id=com.foodapp.delivery.widget
```

### 3. Custom Activity Name
```bash
# Generate with specific activity class name
npx react-native-dynamic-activities create OrderWidget \
  --activity=OrderTrackingAttributes
```

**Result:** Creates `OrderTrackingAttributes` class instead of default `OrderActivityAttributes`

### 4. Complete Customization
```bash
npx react-native-dynamic-activities create \
  --name=RideShareWidget \
  --bundle-id=com.rideshare.activities \
  --activity=RideTrackingActivity \
  --template=location \
  --force
```

## 🎨 Template Types

### `basic` (Default)
Simple status tracking with progress indicator.

**Best for:** Order tracking, task completion, simple state updates

**Generated Features:**
- Status badge with color coding
- Progress bar with relevance score
- Estimated time display
- Basic Dynamic Island layouts

```bash
npx react-native-dynamic-activities create BasicTracker
```

### `progress` (Advanced)
Progress-focused design with detailed completion tracking.

**Best for:** Downloads, installations, workout progress, cooking timers

**Generated Features:**
- Large progress circle/bar
- Percentage completion
- Time remaining calculations
- Step-by-step progress indicators

```bash
npx react-native-dynamic-activities create ProgressWidget --template=progress
```

### `timer` (Time-focused)
Time-based activities with countdown/up functionality.

**Best for:** Workout timers, meeting countdowns, parking meters, cooking

**Generated Features:**
- Large time display
- Start/pause/stop visual states
- Time formatting (MM:SS, HH:MM:SS)
- Alert-style colors for time urgency

```bash
npx react-native-dynamic-activities create TimerWidget --template=timer
```

### `location` (Location-aware)
Location and delivery tracking optimized design.

**Best for:** Food delivery, ride-sharing, package tracking, navigation

**Generated Features:**
- Map-style status indicators
- Distance/ETA displays
- Driver/courier information areas
- Route progress visualization

```bash
npx react-native-dynamic-activities create DeliveryWidget --template=location
```

## 🔧 CLI Configuration

### Project Detection
The CLI automatically detects:
- **React Native project** by looking for `package.json` with React Native dependencies
- **iOS directory** at `./ios/`
- **Xcode project** files (`.xcodeproj`)
- **Bundle identifier** from existing app configuration

### Auto-generated Values
If not specified, the CLI generates:

```typescript
// Example auto-generation for "DeliveryWidget"
{
  widgetName: "DeliveryWidget",
  bundleId: "com.yourproject.deliverywidget", // Based on package.json name
  activityName: "DeliveryActivity",           // Widget name + "Activity"
  projectRoot: process.cwd(),
  iosDir: "./ios"
}
```

## 🎯 Advanced CLI Usage

### Environment Variables
```bash
# Set default template
export RN_DA_DEFAULT_TEMPLATE=progress
npx react-native-dynamic-activities create MyWidget

# Set default bundle ID prefix  
export RN_DA_BUNDLE_PREFIX=com.mycompany
npx react-native-dynamic-activities create MyWidget
```

### Batch Generation
```bash
# Generate multiple widgets for different features
npx react-native-dynamic-activities create DeliveryWidget --template=location
npx react-native-dynamic-activities create WorkoutWidget --template=timer  
npx react-native-dynamic-activities create DownloadWidget --template=progress
```

### Force Overwrite
```bash
# Overwrite existing widget files
npx react-native-dynamic-activities create MyWidget --force
```

**⚠️ Warning:** This will permanently overwrite your customized files!

## 📁 Output Structure

### Generated Directory Structure
```
ios/[WidgetName]/
├── [WidgetName]Bundle.swift           # Widget entry point
├── [ActivityName]LiveActivity.swift   # SwiftUI Live Activity implementation  
├── [ActivityName]Attributes.swift     # Activity data structure
└── Info.plist                        # Widget Extension configuration
```

### File Naming Examples

| Widget Name | Activity Name | Generated Files |
|-------------|---------------|----------------|
| `DeliveryWidget` | `DeliveryActivity` | `DeliveryActivityLiveActivity.swift`<br/>`DeliveryActivityAttributes.swift` |
| `TimerWidget` | `WorkoutTimer` | `WorkoutTimerLiveActivity.swift`<br/>`WorkoutTimerAttributes.swift` |
| `MyApp` | `MyAppActivity` | `MyAppActivityLiveActivity.swift`<br/>`MyAppActivityAttributes.swift` |

## ✅ Validation & Error Handling

### Pre-generation Checks
The CLI validates:

1. **✅ React Native Project** - Ensures you're in a RN project root
2. **✅ iOS Directory** - Confirms `./ios/` directory exists  
3. **✅ Xcode Project** - Finds `.xcodeproj` file
4. **✅ Bundle ID Format** - Validates bundle identifier syntax
5. **✅ File Conflicts** - Warns about existing files (unless `--force`)

### Common Error Messages

#### "Not in a React Native project root"
**Solution:** Run from your React Native project's root directory (where `package.json` is located)

#### "No Xcode project found in ios/ directory"
**Solution:** Ensure your iOS project is properly set up with a `.xcodeproj` file

#### "Widget files already exist"
**Solutions:**
- Use `--force` to overwrite
- Choose a different widget name
- Manually delete existing files

## 🎨 CLI Output Examples

### Successful Generation
```
🚀 React Native Dynamic Activities - Widget Creator

Creating widget with configuration:
  Widget Name: DeliveryWidget
  Bundle ID: com.foodapp.deliverywidget
  Activity Name: DeliveryActivity

✓ Widget files generated successfully!

🎉 Widget Extension Created Successfully!

Generated Files:
  DeliveryWidgetBundle.swift
  DeliveryActivityLiveActivity.swift  
  DeliveryActivityAttributes.swift
  Info.plist

Manual Xcode Setup Required:
1. Open your project in Xcode
2. File → New → Target...
3. Select "Widget Extension" → Next
4. Product Name: DeliveryWidget
5. Bundle Identifier: com.foodapp.deliverywidget
6. Check "Include Live Activity" if available
7. Click Finish
8. Replace generated files with the ones in ios/DeliveryWidget/
9. Add "Live Activities" capability to your main app target

Usage in React Native:
```typescript
import { DynamicActivities } from 'react-native-dynamic-activities';

const attributes = {
  title: "My Activity",
  body: "Activity description"  
};

const content = {
  state: "active",
  relevanceScore: 1.0
};

const result = await DynamicActivities.startLiveActivity(attributes, content);
```

Next Steps:
• Test on a physical device (Live Activities don't work in Simulator)
• Customize the UI in DeliveryActivityLiveActivity.swift
• Update your TypeScript types to match Swift ActivityAttributes
```

## 🛠️ Troubleshooting

### CLI Not Found
```bash
# If npx doesn't work, try:
npm list -g react-native-dynamic-activities

# Or install globally:
npm install -g react-native-dynamic-activities
```

### Permission Errors
```bash
# On macOS/Linux, you might need:
sudo npm install -g react-native-dynamic-activities

# Or use a Node version manager like nvm
```

### Template Issues
```bash
# Clear CLI cache if templates seem outdated:
npm cache clean --force
npx react-native-dynamic-activities create MyWidget --force
```

## 💡 Pro Tips

### 🎯 **Naming Best Practices**
- Use **descriptive names**: `FoodDeliveryWidget` vs `Widget1`
- Match your **app domain**: If app is `com.pizza.app`, use `com.pizza.app.delivery`
- Keep **activity names clear**: `OrderTracking` vs `Activity1`

### 🚀 **Workflow Optimization**
```bash
# Create widget and immediately test
npx react-native-dynamic-activities create TestWidget && \
cd ios && \
xcodebuild -workspace MyApp.xcworkspace -scheme TestWidget
```

### 🎨 **Template Selection Guide**
- **E-commerce apps:** `location` template for order tracking
- **Fitness apps:** `timer` template for workouts  
- **Productivity apps:** `progress` template for task completion
- **General apps:** `basic` template for simple status updates

---

**Ready to customize your generated widget?** Check out the [Customization Guide](customization) to learn SwiftUI modifications! 🎨