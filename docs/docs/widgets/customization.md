# Widget Customization Guide

Transform your generated Live Activity widgets from basic black-and-white templates to stunning, highly customized experiences that match your app's brand and delight your users.

## 🎯 What We'll Build

This tutorial will take you from the default generated widget to a beautiful, fully customized Live Activity with:

- 🎨 **Branded colors and gradients** matching your app
- 🌟 **Custom animations and transitions**
- 📱 **Responsive layouts** for Dynamic Island and Lock Screen
- 🔥 **Visual effects** like shadows, blurs, and glassmorphism
- 🎭 **State-based styling** that changes based on activity state
- 🏪 **Professional UI patterns** seen in top apps

## 📋 Prerequisites

Before starting, ensure you have:
- ✅ Generated a widget using the CLI: `npx react-native-dynamic-activities create MyWidget`
- ✅ Added the Widget Extension to Xcode
- ✅ Basic understanding of SwiftUI concepts

## 🎨 Step 1: From Black to Beautiful - Basic Styling

### The Default Generated Widget (Problem)
The default generated widget is functional but visually basic:

```swift
// Default generated code - basic and unbranded
VStack(alignment: .leading, spacing: 8) {
    Text(context.attributes.title)
        .font(.headline)
    Text(context.state.state.capitalized)
        .font(.caption)
}
.padding()
```

**Result:** Plain black text on system background - doesn't stand out or reflect your brand.

### Transform to Branded Beauty (Solution)

Let's transform this into a visually stunning widget:

```swift
// Enhanced branded widget with visual flair
VStack(alignment: .leading, spacing: 0) {
    // Header with gradient background
    HStack {
        // App icon or brand symbol
        Image(systemName: "star.fill")
            .font(.title2)
            .foregroundColor(.white)
            .frame(width: 32, height: 32)
            .background(
                Circle()
                    .fill(LinearGradient(
                        colors: [Color.blue, Color.purple],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ))
            )
        
        VStack(alignment: .leading, spacing: 2) {
            Text(context.attributes.title)
                .font(.headline)
                .fontWeight(.bold)
                .foregroundColor(.primary)
            
            Text(context.attributes.body)
                .font(.caption)
                .foregroundColor(.secondary)
                .lineLimit(1)
        }
        
        Spacer()
        
        // Status badge with state-based colors
        StatusBadge(state: context.state.state)
    }
    .padding(.horizontal, 16)
    .padding(.vertical, 12)
    .background(
        RoundedRectangle(cornerRadius: 12)
            .fill(Color(.systemBackground))
            .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
    )
}
```

## 🌈 Step 2: Advanced Color System

### Create a Branded Color Palette

```swift
// Add this to your LiveActivity file
extension Color {
    static let brandPrimary = Color(red: 0.2, green: 0.6, blue: 1.0)
    static let brandSecondary = Color(red: 0.8, green: 0.2, blue: 0.8)
    static let brandAccent = Color(red: 1.0, green: 0.6, blue: 0.2)
    
    // State-based colors
    static let successGreen = Color(red: 0.2, green: 0.8, blue: 0.4)
    static let warningOrange = Color(red: 1.0, green: 0.6, blue: 0.0)
    static let errorRed = Color(red: 1.0, green: 0.3, blue: 0.3)
    
    // Gradient combinations
    static let primaryGradient = LinearGradient(
        colors: [.brandPrimary, .brandSecondary],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )
    
    static let successGradient = LinearGradient(
        colors: [.successGreen, .brandPrimary],
        startPoint: .leading,
        endPoint: .trailing
    )
}
```

### Dynamic Color Mapping

```swift
// State-based color function
private func stateColorScheme(_ state: String) -> (background: LinearGradient, foreground: Color) {
    switch state {
    case "active":
        return (Color.successGradient, .white)
    case "pending":
        return (
            LinearGradient(colors: [.warningOrange, .brandAccent], startPoint: .leading, endPoint: .trailing),
            .white
        )
    case "stale":
        return (
            LinearGradient(colors: [.gray, .secondary], startPoint: .leading, endPoint: .trailing),
            .white
        )
    case "ended":
        return (
            LinearGradient(colors: [.brandPrimary, .brandSecondary], startPoint: .leading, endPoint: .trailing),
            .white
        )
    default:
        return (
            LinearGradient(colors: [.gray], startPoint: .leading, endPoint: .trailing),
            .primary
        )
    }
}
```

## 🎭 Step 3: Custom Components for Reusability

### StatusBadge Component

```swift
struct StatusBadge: View {
    let state: String
    
    var body: some View {
        HStack(spacing: 4) {
            // Animated status indicator
            Circle()
                .fill(indicatorColor)
                .frame(width: 8, height: 8)
                .scaleEffect(state == "active" ? 1.2 : 1.0)
                .animation(.easeInOut(duration: 1).repeatForever(), value: state == "active")
            
            Text(stateDisplayText)
                .font(.caption)
                .fontWeight(.semibold)
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 6)
        .background(
            Capsule()
                .fill(backgroundGradient)
        )
        .foregroundColor(.white)
    }
    
    private var stateDisplayText: String {
        switch state {
        case "active": return "Live"
        case "pending": return "Pending"
        case "stale": return "Updating"
        case "ended": return "Complete"
        case "dismissed": return "Paused"
        default: return state.capitalized
        }
    }
    
    private var indicatorColor: Color {
        switch state {
        case "active": return .successGreen
        case "pending": return .warningOrange
        case "stale": return .gray
        case "ended": return .brandPrimary
        default: return .gray
        }
    }
    
    private var backgroundGradient: LinearGradient {
        stateColorScheme(state).background
    }
}
```

### ProgressIndicator Component

```swift
struct ProgressIndicator: View {
    let progress: Double
    let showPercentage: Bool
    
    var body: some View {
        VStack(spacing: 4) {
            if showPercentage {
                HStack {
                    Text("Progress")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Spacer()
                    Text("\(Int(progress * 100))%")
                        .font(.caption)
                        .fontWeight(.semibold)
                        .foregroundColor(.brandPrimary)
                }
            }
            
            // Custom progress bar with gradient
            GeometryReader { geometry in
                ZStack(alignment: .leading) {
                    // Background track
                    RoundedRectangle(cornerRadius: 6)
                        .fill(Color.gray.opacity(0.2))
                        .frame(height: 8)
                    
                    // Progress fill with gradient
                    RoundedRectangle(cornerRadius: 6)
                        .fill(Color.primaryGradient)
                        .frame(width: geometry.size.width * progress, height: 8)
                        .animation(.easeInOut(duration: 0.3), value: progress)
                }
            }
            .frame(height: 8)
        }
    }
}
```

## 🌟 Step 4: Advanced Visual Effects

### Glassmorphism Effect

```swift
struct GlassmorphismBackground: View {
    var body: some View {
        ZStack {
            // Gradient background
            LinearGradient(
                colors: [
                    Color.brandPrimary.opacity(0.3),
                    Color.brandSecondary.opacity(0.2)
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            
            // Glass effect
            RoundedRectangle(cornerRadius: 16)
                .fill(Color.white.opacity(0.1))
                .background(
                    RoundedRectangle(cornerRadius: 16)
                        .stroke(Color.white.opacity(0.2), lineWidth: 1)
                )
                .blur(radius: 0.5)
        }
    }
}
```

### Animated Icons

```swift
struct AnimatedStateIcon: View {
    let state: String
    
    var body: some View {
        Group {
            switch state {
            case "active":
                Image(systemName: "waveform")
                    .symbolEffect(.pulse, options: .repeating)
            case "pending":
                Image(systemName: "clock.fill")
                    .symbolEffect(.rotation.cycleRight, options: .repeating)
            case "stale":
                Image(systemName: "wifi.slash")
            case "ended":
                Image(systemName: "checkmark.circle.fill")
                    .symbolEffect(.bounce, value: state)
            default:
                Image(systemName: "circle.fill")
            }
        }
        .font(.title2)
        .foregroundStyle(iconColor)
        .contentTransition(.symbolEffect(.replace))
    }
    
    private var iconColor: Color {
        switch state {
        case "active": return .successGreen
        case "pending": return .warningOrange
        case "stale": return .gray
        case "ended": return .brandPrimary
        default: return .secondary
        }
    }
}
```

## 📱 Step 5: Dynamic Island Optimization

### Compact View Design

```swift
// In your DynamicIsland configuration
DynamicIsland {
    // ... expanded region
} compactLeading: {
    // Branded compact leading with animation
    ZStack {
        Circle()
            .fill(Color.primaryGradient)
            .frame(width: 20, height: 20)
        
        Image(systemName: iconForState(context.state.state))
            .font(.caption)
            .foregroundColor(.white)
            .contentTransition(.symbolEffect(.replace))
    }
} compactTrailing: {
    // Progress or status indicator
    if let progress = context.state.relevanceScore {
        CircularProgressView(progress: progress)
    } else {
        StatusDot(state: context.state.state)
    }
} minimal: {
    // Minimal view with just brand color
    Circle()
        .fill(Color.brandPrimary)
        .frame(width: 12, height: 12)
}
```

### Circular Progress for Compact View

```swift
struct CircularProgressView: View {
    let progress: Double
    
    var body: some View {
        ZStack {
            Circle()
                .stroke(Color.gray.opacity(0.3), lineWidth: 2)
                .frame(width: 16, height: 16)
            
            Circle()
                .trim(from: 0, to: progress)
                .stroke(Color.brandPrimary, lineWidth: 2)
                .frame(width: 16, height: 16)
                .rotationEffect(.degrees(-90))
                .animation(.easeInOut(duration: 0.3), value: progress)
        }
    }
}
```

## 🎪 Step 6: Complete Styled Widget Example

Here's a complete example of a beautifully styled Live Activity:

```swift
struct DeliveryActivityLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: DeliveryActivityAttributes.self) { context in
            // Lock Screen/Banner UI - Full Beauty Mode
            VStack(spacing: 0) {
                // Header section with glassmorphism
                HStack(spacing: 12) {
                    // App logo with glow effect
                    ZStack {
                        Circle()
                            .fill(Color.brandPrimary)
                            .frame(width: 44, height: 44)
                            .shadow(color: Color.brandPrimary.opacity(0.5), radius: 8, x: 0, y: 0)
                        
                        Image(systemName: "fork.knife")
                            .font(.title3)
                            .fontWeight(.semibold)
                            .foregroundColor(.white)
                    }
                    
                    VStack(alignment: .leading, spacing: 2) {
                        Text(context.attributes.title)
                            .font(.headline)
                            .fontWeight(.bold)
                            .foregroundColor(.primary)
                        
                        Text(context.attributes.body)
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                            .lineLimit(2)
                    }
                    
                    Spacer()
                    
                    // Status with animation
                    StatusBadge(state: context.state.state)
                }
                .padding(.horizontal, 20)
                .padding(.vertical, 16)
                
                // Progress section (if applicable)
                if let relevanceScore = context.state.relevanceScore, relevanceScore > 0.1 {
                    VStack(spacing: 8) {
                        Divider()
                            .overlay(Color.brandPrimary.opacity(0.3))
                        
                        ProgressIndicator(
                            progress: relevanceScore,
                            showPercentage: true
                        )
                        .padding(.horizontal, 20)
                        .padding(.bottom, 16)
                    }
                }
            }
            .background(
                RoundedRectangle(cornerRadius: 20)
                    .fill(Color(.systemBackground))
                    .shadow(color: .black.opacity(0.1), radius: 10, x: 0, y: 4)
                    .overlay(
                        RoundedRectangle(cornerRadius: 20)
                            .stroke(Color.brandPrimary.opacity(0.2), lineWidth: 1)
                    )
            )
            .padding(.horizontal, 16)
            
        } dynamicIsland: { context in
            DynamicIsland {
                // Expanded UI with full branding
                DynamicIslandExpandedRegion(.leading) {
                    HStack(spacing: 8) {
                        AnimatedStateIcon(state: context.state.state)
                        
                        VStack(alignment: .leading, spacing: 1) {
                            Text(context.attributes.title)
                                .font(.caption)
                                .fontWeight(.bold)
                                .foregroundColor(.primary)
                            Text(statusMessage(context.state.state))
                                .font(.caption2)
                                .foregroundColor(.brandPrimary)
                        }
                    }
                }
                
                DynamicIslandExpandedRegion(.trailing) {
                    VStack(alignment: .trailing, spacing: 4) {
                        if let relevanceScore = context.state.relevanceScore {
                            Text("\(Int(relevanceScore * 100))%")
                                .font(.caption)
                                .fontWeight(.bold)
                                .foregroundColor(.brandPrimary)
                            
                            ProgressIndicator(
                                progress: relevanceScore,
                                showPercentage: false
                            )
                            .frame(width: 60)
                        }
                        
                        Text(estimatedTime(context.state.state))
                            .font(.caption2)
                            .foregroundColor(.secondary)
                    }
                }
                
                DynamicIslandExpandedRegion(.center) {
                    Text(context.attributes.body)
                        .font(.caption)
                        .multilineTextAlignment(.center)
                        .foregroundColor(.primary)
                        .lineLimit(2)
                }
                
            } compactLeading: {
                ZStack {
                    Circle()
                        .fill(Color.primaryGradient)
                        .frame(width: 20, height: 20)
                    
                    AnimatedStateIcon(state: context.state.state)
                        .font(.caption2)
                        .foregroundColor(.white)
                }
                
            } compactTrailing: {
                if let relevanceScore = context.state.relevanceScore {
                    CircularProgressView(progress: relevanceScore)
                } else {
                    Circle()
                        .fill(stateColorScheme(context.state.state).foreground)
                        .frame(width: 12, height: 12)
                }
                
            } minimal: {
                Circle()
                    .fill(Color.primaryGradient)
                    .frame(width: 16, height: 16)
            }
        }
    }
}

// MARK: - Helper Functions
private func statusMessage(_ state: String) -> String {
    switch state {
    case "active": return "In Progress"
    case "pending": return "Getting Ready"
    case "stale": return "Updating..."
    case "ended": return "Completed"
    default: return "Status Unknown"
    }
}

private func estimatedTime(_ state: String) -> String {
    switch state {
    case "active": return "15 min"
    case "pending": return "Starting"
    case "ended": return "Done!"
    default: return "--"
    }
}

private func iconForState(_ state: String) -> String {
    switch state {
    case "active": return "flame.fill"
    case "pending": return "clock.fill"
    case "stale": return "wifi.slash"
    case "ended": return "checkmark.circle.fill"
    default: return "circle.fill"
    }
}
```

## 🎨 Step 7: Dark Mode & Accessibility

### Dark Mode Support

```swift
// Color extension with dark mode support
extension Color {
    static let adaptiveBackground = Color(.systemBackground)
    static let adaptivePrimary = Color(.label)
    static let adaptiveSecondary = Color(.secondaryLabel)
    
    // Brand colors that work in both light and dark mode
    static let brandPrimaryAdaptive = Color(
        light: Color(red: 0.2, green: 0.6, blue: 1.0),
        dark: Color(red: 0.3, green: 0.7, blue: 1.0)
    )
}

// Color initializer for light/dark mode
extension Color {
    init(light: Color, dark: Color) {
        self.init(UIColor { traitCollection in
            switch traitCollection.userInterfaceStyle {
            case .dark:
                return UIColor(dark)
            default:
                return UIColor(light)
            }
        })
    }
}
```

### Accessibility Features

```swift
struct AccessibleStatusBadge: View {
    let state: String
    
    var body: some View {
        StatusBadge(state: state)
            .accessibilityLabel("Activity status")
            .accessibilityValue(accessibilityStatusText)
            .accessibilityHint("Current state of your live activity")
    }
    
    private var accessibilityStatusText: String {
        switch state {
        case "active": return "Currently active and updating"
        case "pending": return "Waiting to begin"
        case "stale": return "Information may be outdated"
        case "ended": return "Activity completed"
        default: return "Status: \(state)"
        }
    }
}
```

## 🚀 Step 8: Performance & Best Practices

### Optimize for Battery

```swift
// Use conditional animations to save battery
struct BatteryFriendlyAnimation: View {
    let state: String
    @Environment(\.isActivityStateUpdatesReduceMotion) var reduceMotion
    
    var body: some View {
        Circle()
            .fill(Color.brandPrimary)
            .scaleEffect(shouldAnimate ? 1.1 : 1.0)
            .animation(
                reduceMotion ? .none : .easeInOut(duration: 1).repeatForever(),
                value: shouldAnimate
            )
    }
    
    private var shouldAnimate: Bool {
        !reduceMotion && state == "active"
    }
}
```

### Efficient Image Usage

```swift
// Use SF Symbols instead of custom images when possible
struct EfficientIcon: View {
    let state: String
    
    var body: some View {
        Image(systemName: iconName)
            .font(.system(size: 16, weight: .medium))
            .foregroundStyle(iconColor)
            .contentTransition(.symbolEffect(.replace))
    }
    
    private var iconName: String {
        switch state {
        case "active": return "checkmark.circle.fill"
        case "pending": return "clock.badge.questionmark"
        case "stale": return "exclamationmark.triangle"
        case "ended": return "checkmark.seal.fill"
        default: return "circle"
        }
    }
    
    private var iconColor: Color {
        // Use semantic colors when possible
        switch state {
        case "active": return .green
        case "pending": return .orange
        case "stale": return .red
        case "ended": return .blue
        default: return .secondary
        }
    }
}
```

## 🎯 Final Result

After following this guide, your Live Activity will have:

✅ **Beautiful branded design** that matches your app  
✅ **Smooth animations** that delight users  
✅ **Perfect Dynamic Island integration** with all view sizes  
✅ **State-aware styling** that changes based on activity status  
✅ **Dark mode support** for all user preferences  
✅ **Accessibility compliance** with VoiceOver support  
✅ **Battery-efficient animations** that respect user settings  
✅ **Professional visual effects** like glassmorphism and shadows  

## 🔮 Future: CSS Styling in React Native

In future versions of React Native Dynamic Activities, we plan to support defining your Live Activity styling directly in React Native using CSS-like syntax:

```typescript
// Future planned feature - CSS styling in React Native
const MyLiveActivityStyle = StyleSheet.create({
  container: {
    background: 'linear-gradient(45deg, #2196F3, #9C27B0)',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statusBadge: {
    background: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: '6px 12px',
  }
});

// This would automatically generate the SwiftUI code
await DynamicActivities.startLiveActivity(
  attributes,
  content,
  { style: MyLiveActivityStyle }
);
```

This will make Live Activity styling much more accessible to React Native developers while maintaining the performance benefits of native SwiftUI rendering.

---

**Ready to ship your beautiful widget?** Test it thoroughly across different iOS versions and devices, then update your app with confidence! 🚀

**Next:** Explore performance optimization techniques in your widgets! ⚡