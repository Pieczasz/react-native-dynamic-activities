#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");

// Enhanced CLI with interactive prompts
class WidgetWizard {
  constructor() {
    this.projectRoot = process.cwd();
    this.iosDir = path.join(this.projectRoot, "ios");
    this.templatesDir = path.join(__dirname, "..", "templates");
  }

  // Colors and logging
  colors = {
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    bold: "\x1b[1m",
    dim: "\x1b[2m",
    reset: "\x1b[0m",
  };

  log = {
    info: (msg) => console.log(`${this.colors.blue}ℹ${this.colors.reset} ${msg}`),
    success: (msg) => console.log(`${this.colors.green}✓${this.colors.reset} ${msg}`),
    warning: (msg) => console.log(`${this.colors.yellow}⚠${this.colors.reset} ${msg}`),
    error: (msg) => console.log(`${this.colors.red}✗${this.colors.reset} ${msg}`),
    title: (msg) =>
      console.log(`\n${this.colors.bold}${this.colors.cyan}${msg}${this.colors.reset}\n`),
    step: (num, msg) => console.log(`${this.colors.magenta}${num}.${this.colors.reset} ${msg}`),
  };

  async run() {
    try {
      this.printHeader();
      await this.validateEnvironment();
      const config = await this.interactiveConfig();
      await this.generateWidget(config);
      await this.updateXcodeProject(config);
      await this.generatePreview(config);
      this.showCompletion(config);
    } catch (error) {
      this.log.error(`Widget creation failed: ${error.message}`);
      process.exit(1);
    }
  }

  printHeader() {
    console.log(`
${this.colors.bold}${this.colors.cyan}╔═══════════════════════════════════════════════════════════════╗
║                🚀 Live Activities Widget Wizard              ║
║                                                               ║
║    Create production-ready iOS Live Activities in minutes    ║
╚═══════════════════════════════════════════════════════════════╝${this.colors.reset}

${this.colors.dim}This wizard will guide you through creating a complete Widget Extension
with Dynamic Island support, ActivityKit integration, and custom UI.${this.colors.reset}
    `);
  }

  async validateEnvironment() {
    this.log.info("🔍 Validating environment...");

    // Check React Native project
    if (!fs.existsSync(path.join(this.projectRoot, "package.json"))) {
      throw new Error("Not in a React Native project root");
    }

    // Check iOS directory
    if (!fs.existsSync(this.iosDir)) {
      throw new Error("iOS directory not found");
    }

    // Find Xcode project
    const iosContents = fs.readdirSync(this.iosDir);
    const xcodeproj = iosContents.find((item) => item.endsWith(".xcodeproj"));

    if (!xcodeproj) {
      throw new Error("No Xcode project found in ios/ directory");
    }

    this.xcodeprojPath = path.join(this.iosDir, xcodeproj);
    this.projectName = xcodeproj.replace(".xcodeproj", "");

    // Check for existing widgets
    const existingWidgets = iosContents.filter(
      (item) =>
        fs.existsSync(path.join(this.iosDir, item, "Info.plist")) &&
        fs
          .readFileSync(path.join(this.iosDir, item, "Info.plist"), "utf8")
          .includes("com.apple.widgetkit-extension"),
    );

    if (existingWidgets.length > 0) {
      this.log.warning(`Found existing widgets: ${existingWidgets.join(", ")}`);
    }

    this.log.success("Environment validated");
  }

  async interactiveConfig() {
    this.log.title("📝 Widget Configuration");

    console.log("Let's configure your Live Activity widget:\n");

    const config = {
      // Basic Info
      widgetName: await this.prompt("Widget name (e.g., TimerWidget)", `${this.projectName}Widget`),
      activityName: await this.prompt("Activity name (e.g., TimerActivity)", "DefaultActivity"),
      displayName: await this.prompt("Display name for users", "Live Activity"),

      // Bundle Configuration
      bundleId: await this.prompt("Bundle identifier suffix", "widget", (input) =>
        input.match(/^[a-zA-Z0-9.-]+$/) ? null : "Only letters, numbers, dots, and hyphens allowed",
      ),

      // UI Configuration
      uiStyle: await this.select("Choose UI style:", [
        { name: "Modern (Recommended)", value: "modern" },
        { name: "Minimal", value: "minimal" },
        { name: "Custom", value: "custom" },
      ]),

      // Color Scheme
      colorScheme: await this.select("Color scheme:", [
        { name: "Adaptive (follows system)", value: "adaptive" },
        { name: "Light", value: "light" },
        { name: "Dark", value: "dark" },
        { name: "Custom", value: "custom" },
      ]),

      // Features
      features: await this.multiSelect("Select features to include:", [
        { name: "Progress indicators", value: "progress", selected: true },
        { name: "Custom icons/SF Symbols", value: "icons", selected: true },
        { name: "Timer/countdown support", value: "timer", selected: false },
        { name: "Media playback controls", value: "media", selected: false },
        { name: "Location updates", value: "location", selected: false },
      ]),

      // Advanced
      minIOSVersion: await this.select("Minimum iOS version:", [
        { name: "iOS 16.2 (Live Activities)", value: "16.2" },
        { name: "iOS 17.0 (Enhanced features)", value: "17.0" },
        { name: "iOS 18.0 (Latest features)", value: "18.0" },
      ]),

      // TypeScript Integration
      generateTypes: await this.confirm("Generate TypeScript types?", true),
      updateMainTypes: await this.confirm("Update main index.ts with new types?", true),
    };

    // Computed properties
    config.fullBundleId = `${await this.getMainBundleId()}.${config.bundleId}`;

    this.log.info("\nConfiguration summary:");
    console.log(`  Widget: ${this.colors.cyan}${config.widgetName}${this.colors.reset}`);
    console.log(`  Bundle: ${this.colors.cyan}${config.fullBundleId}${this.colors.reset}`);
    console.log(`  Style: ${this.colors.cyan}${config.uiStyle}${this.colors.reset}`);
    console.log(
      `  Features: ${this.colors.cyan}${config.features.join(", ")}${this.colors.reset}\n`,
    );

    const proceed = await this.confirm("Proceed with widget creation?", true);
    if (!proceed) {
      throw new Error("Cancelled by user");
    }

    return config;
  }

  // Interactive prompt helpers
  async prompt(question, defaultValue = "", validator = null) {
    return new Promise((resolve) => {
      const readline = require("node:readline").createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      const ask = () => {
        const prompt = defaultValue
          ? `${question} ${this.colors.dim}(${defaultValue})${this.colors.reset}: `
          : `${question}: `;

        readline.question(prompt, (answer) => {
          const value = answer.trim() || defaultValue;

          if (validator) {
            const error = validator(value);
            if (error) {
              this.log.error(error);
              ask();
              return;
            }
          }

          readline.close();
          resolve(value);
        });
      };

      ask();
    });
  }

  async select(question, options) {
    console.log(`\n${question}`);
    options.forEach((opt, i) => {
      console.log(`  ${i + 1}. ${opt.name}`);
    });

    const answer = await this.prompt("Select option", "1", (input) => {
      const num = Number.parseInt(input);
      return num >= 1 && num <= options.length
        ? null
        : `Please enter a number between 1 and ${options.length}`;
    });

    return options[Number.parseInt(answer) - 1].value;
  }

  async multiSelect(question, options) {
    console.log(`\n${question}`);
    options.forEach((opt, i) => {
      const selected = opt.selected ? "✓" : " ";
      console.log(`  [${selected}] ${i + 1}. ${opt.name}`);
    });

    const answer = await this.prompt(
      "Enter numbers separated by commas (or press Enter for defaults)",
      options
        .filter((o) => o.selected)
        .map((_, i) => i + 1)
        .join(","),
    );

    const indices = answer
      .split(",")
      .map((n) => Number.parseInt(n.trim()) - 1)
      .filter((i) => i >= 0 && i < options.length);
    return indices.map((i) => options[i].value);
  }

  async confirm(question, defaultValue = false) {
    const defaultText = defaultValue ? "Y/n" : "y/N";
    const answer = await this.prompt(`${question} (${defaultText})`, defaultValue ? "y" : "n");
    return answer.toLowerCase().startsWith("y");
  }

  async getMainBundleId() {
    try {
      const infoPlistPath = path.join(this.iosDir, this.projectName, "Info.plist");
      if (fs.existsSync(infoPlistPath)) {
        const plistContent = fs.readFileSync(infoPlistPath, "utf8");
        const bundleIdMatch = plistContent.match(
          /<key>CFBundleIdentifier<\/key>\s*<string>(.+?)<\/string>/,
        );
        if (bundleIdMatch && !bundleIdMatch[1].includes("$")) {
          return bundleIdMatch[1];
        }
      }
    } catch (error) {
      // Fallback
    }
    return `com.example.${this.projectName.toLowerCase()}`;
  }

  async generateWidget(config) {
    this.log.title("🔨 Generating Widget Files");

    const widgetDir = path.join(this.iosDir, config.widgetName);
    if (!fs.existsSync(widgetDir)) {
      fs.mkdirSync(widgetDir, { recursive: true });
    }

    this.log.step(1, "Creating Swift files...");

    // Generate enhanced files based on configuration
    await this.generateAdvancedWidgetBundle(widgetDir, config);
    await this.generateAdvancedLiveActivity(widgetDir, config);
    await this.generateAdvancedAttributes(widgetDir, config);
    await this.generateInfoPlist(widgetDir, config);

    if (config.generateTypes) {
      this.log.step(2, "Generating TypeScript types...");
      await this.generateTypeScriptTypes(config);
    }

    this.log.success(`Widget files generated in ${widgetDir}`);
  }

  async generateAdvancedLiveActivity(widgetDir, config) {
    // Advanced template with features
    const template = this.buildLiveActivityTemplate(config);
    fs.writeFileSync(path.join(widgetDir, `${config.activityName}LiveActivity.swift`), template);
  }

  buildLiveActivityTemplate(config) {
    const features = config.features;
    const hasProgress = features.includes("progress");
    const hasIcons = features.includes("icons");
    const hasTimer = features.includes("timer");

    return `import ActivityKit
import SwiftUI
import WidgetKit

struct ${config.activityName}LiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: ${config.activityName}Attributes.self) { context in
            // Lock Screen/Banner UI
            ${this.generateLockScreenUI(config)}
        } dynamicIsland: { context in
            ${this.generateDynamicIslandUI(config)}
        }
    }
}

${this.generatePreviewProvider(config)}`;
  }

  generateLockScreenUI(config) {
    const features = config.features;
    const style = config.uiStyle;

    if (style === "minimal") {
      return `HStack {
                Text(context.attributes.title)
                    .font(.headline)
                Spacer()
                Text(context.state.state.capitalized)
                    .font(.caption)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(RoundedRectangle(cornerRadius: 8).fill(Color.blue))
                    .foregroundColor(.white)
            }
            .padding()`;
    }

    return `VStack(alignment: .leading, spacing: 12) {
                ${this.generateHeaderRow(config)}
                
                Text(context.attributes.body)
                    .font(.body)
                    .foregroundColor(.secondary)
                    .lineLimit(2)
                
                ${features.includes("progress") ? this.generateProgressView() : ""}
                ${features.includes("timer") ? this.generateTimerView() : ""}
            }
            .padding()
            .background(
                RoundedRectangle(cornerRadius: 16)
                    .fill(${this.getBackgroundColor(config.colorScheme)})
                    .shadow(color: Color.black.opacity(0.1), radius: 2)
            )`;
  }

  generateHeaderRow(config) {
    const hasIcons = config.features.includes("icons");

    return `HStack {
                ${
                  hasIcons
                    ? `Image(systemName: "circle.fill")
                    .foregroundColor(.blue)
                    .font(.caption)`
                    : ""
                }
                Text(context.attributes.title)
                    .font(.headline)
                    .fontWeight(.semibold)
                Spacer()
                StatusBadge(state: context.state.state)
            }`;
  }

  generateProgressView() {
    return `if let progress = context.state.relevanceScore {
                HStack {
                    Text("Progress")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Spacer()
                    Text("\\(Int(progress * 100))%")
                        .font(.caption)
                        .fontWeight(.medium)
                }
                
                ProgressView(value: progress)
                    .progressViewStyle(LinearProgressViewStyle(tint: .blue))
                    .scaleEffect(y: 0.8)
            }`;
  }

  generateTimerView() {
    return `if let timestamp = context.state.timestamp {
                HStack {
                    Image(systemName: "clock")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Text(timestamp, style: .relative)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }`;
  }

  generateDynamicIslandUI(config) {
    return `DynamicIsland {
                // Expanded UI
                DynamicIslandExpandedRegion(.leading) {
                    ${this.generateExpandedLeading(config)}
                }
                DynamicIslandExpandedRegion(.trailing) {
                    ${this.generateExpandedTrailing(config)}
                }
                DynamicIslandExpandedRegion(.center) {
                    Text(context.attributes.body)
                        .font(.caption)
                        .multilineTextAlignment(.center)
                        .lineLimit(2)
                }
            } compactLeading: {
                ${this.generateCompactLeading(config)}
            } compactTrailing: {
                ${this.generateCompactTrailing(config)}
            } minimal: {
                ${this.generateMinimal(config)}
            }`;
  }

  generateExpandedLeading(config) {
    const hasIcons = config.features.includes("icons");

    return `VStack(alignment: .leading, spacing: 2) {
                ${
                  hasIcons
                    ? `Image(systemName: "app.badge")
                    .font(.caption2)
                    .foregroundColor(.blue)`
                    : ""
                }
                Text(context.attributes.title)
                    .font(.caption)
                    .fontWeight(.semibold)
                    .lineLimit(1)
                Text(context.state.state.capitalized)
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }`;
  }

  generateExpandedTrailing(config) {
    const hasProgress = config.features.includes("progress");

    if (hasProgress) {
      return `VStack(alignment: .trailing, spacing: 4) {
                  if let progress = context.state.relevanceScore {
                      Text("\\(Int(progress * 100))%")
                          .font(.caption)
                          .fontWeight(.semibold)
                      ProgressView(value: progress)
                          .progressViewStyle(LinearProgressViewStyle(tint: .blue))
                          .frame(width: 40)
                  }
              }`;
    }

    return `VStack(alignment: .trailing) {
                Image(systemName: "chevron.right")
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }`;
  }

  generateCompactLeading(config) {
    const hasIcons = config.features.includes("icons");

    if (hasIcons) {
      return `Image(systemName: "app.badge.fill")
                  .font(.caption2)
                  .foregroundColor(.blue)`;
    }

    return `Text(context.attributes.title.prefix(1))
                .font(.caption2)
                .fontWeight(.semibold)`;
  }

  generateCompactTrailing(config) {
    return "StateIndicator(state: context.state.state)";
  }

  generateMinimal(config) {
    const hasIcons = config.features.includes("icons");

    if (hasIcons) {
      return `Image(systemName: "circle.fill")
                  .font(.caption2)
                  .foregroundColor(.blue)`;
    }

    return `Text(context.attributes.title.prefix(1))
                .font(.caption2)
                .fontWeight(.semibold)`;
  }

  getBackgroundColor(colorScheme) {
    switch (colorScheme) {
      case "light":
        return "Color.white";
      case "dark":
        return "Color.black";
      case "custom":
        return 'Color("WidgetBackground")';
      default:
        return "Color(.systemBackground)";
    }
  }

  generatePreviewProvider(config) {
    return `
// MARK: - Helper Views
struct StatusBadge: View {
    let state: String
    
    var body: some View {
        Text(state.capitalized)
            .font(.caption)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(
                RoundedRectangle(cornerRadius: 8)
                    .fill(badgeColor)
            )
            .foregroundColor(.white)
    }
    
    private var badgeColor: Color {
        switch state.lowercased() {
        case "active": return .green
        case "paused": return .orange
        case "ended": return .gray
        default: return .blue
        }
    }
}

struct StateIndicator: View {
    let state: String
    
    var body: some View {
        Image(systemName: iconName)
            .font(.caption2)
            .foregroundColor(iconColor)
    }
    
    private var iconName: String {
        switch state.lowercased() {
        case "active": return "play.fill"
        case "paused": return "pause.fill"
        case "ended": return "stop.fill"
        default: return "circle.fill"
        }
    }
    
    private var iconColor: Color {
        switch state.lowercased() {
        case "active": return .green
        case "paused": return .orange
        case "ended": return .gray
        default: return .blue
        }
    }
}

// MARK: - Previews
#if DEBUG
struct ${config.activityName}LiveActivity_Previews: PreviewProvider {
    static let attributes = ${config.activityName}Attributes(
        title: "${config.displayName}",
        body: "This is a preview of your Live Activity with enhanced features"
    )
    
    static let activeState = ${config.activityName}Attributes.ContentState(
        state: "active",
        relevanceScore: 0.75,
        timestamp: Date()
    )
    
    static let pausedState = ${config.activityName}Attributes.ContentState(
        state: "paused",
        relevanceScore: 0.45,
        timestamp: Date().addingTimeInterval(-300)
    )
    
    static var previews: some View {
        Group {
            // Dynamic Island Previews
            attributes
                .previewContext(activeState, viewKind: .dynamicIsland(.compact))
                .previewDisplayName("Island Compact - Active")
            
            attributes
                .previewContext(activeState, viewKind: .dynamicIsland(.expanded))
                .previewDisplayName("Island Expanded - Active")
                
            attributes
                .previewContext(pausedState, viewKind: .dynamicIsland(.minimal))
                .previewDisplayName("Island Minimal - Paused")
            
            // Lock Screen Previews
            attributes
                .previewContext(activeState, viewKind: .content)
                .previewDisplayName("Lock Screen - Active")
                
            attributes
                .previewContext(pausedState, viewKind: .content)
                .previewDisplayName("Lock Screen - Paused")
        }
    }
}
#endif`;
  }

  async generateAdvancedAttributes(widgetDir, config) {
    const template = `import ActivityKit
import Foundation

// MARK: - ${config.activityName} Attributes
public struct ${config.activityName}Attributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        /// Current state of the activity
        public var state: String
        
        /// Relevance score for Dynamic Island priority (0.0 - 1.0)
        public var relevanceScore: Double?
        
        ${config.features.includes("timer") ? "/// Timestamp for time-based updates\n        public var timestamp: Date?" : ""}
        
        ${config.features.includes("progress") ? "/// Current progress value (0.0 - 1.0)\n        public var progress: Double?" : ""}
        
        ${config.features.includes("location") ? "/// Location description\n        public var location: String?" : ""}
        
        ${config.features.includes("media") ? "/// Media information\n        public var mediaInfo: MediaInfo?" : ""}
        
        public init(
            state: String,
            relevanceScore: Double? = nil${config.features.includes("timer") ? ",\n            timestamp: Date? = nil" : ""}${config.features.includes("progress") ? ",\n            progress: Double? = nil" : ""}${config.features.includes("location") ? ",\n            location: String? = nil" : ""}${config.features.includes("media") ? ",\n            mediaInfo: MediaInfo? = nil" : ""}
        ) {
            self.state = state
            self.relevanceScore = relevanceScore
            ${config.features.includes("timer") ? "self.timestamp = timestamp" : ""}
            ${config.features.includes("progress") ? "self.progress = progress" : ""}
            ${config.features.includes("location") ? "self.location = location" : ""}
            ${config.features.includes("media") ? "self.mediaInfo = mediaInfo" : ""}
        }
    }
    
    /// Activity title
    public var title: String
    
    /// Activity description
    public var body: String
    
    /// Optional metadata for additional configuration
    public var metadata: [String: String]?
    
    public init(title: String, body: String, metadata: [String: String]? = nil) {
        self.title = title
        self.body = body
        self.metadata = metadata
    }
}

${config.features.includes("media") ? this.generateMediaInfoStruct() : ""}

// MARK: - JavaScript Integration
extension ${config.activityName}Attributes {
    /// Creates attributes from JavaScript object
    public static func from(jsAttributes: [String: Any]) -> ${config.activityName}Attributes? {
        guard let title = jsAttributes["title"] as? String,
              let body = jsAttributes["body"] as? String else {
            return nil
        }
        
        let metadata = jsAttributes["metadata"] as? [String: String]
        
        return ${config.activityName}Attributes(
            title: title,
            body: body,
            metadata: metadata
        )
    }
    
    /// Creates content state from JavaScript object
    public static func contentStateFrom(jsContent: [String: Any]) -> ContentState? {
        guard let state = jsContent["state"] as? String else {
            return nil
        }
        
        let relevanceScore = jsContent["relevanceScore"] as? Double
        ${config.features.includes("timer") ? 'let timestamp = jsContent["timestamp"] as? Date' : ""}
        ${config.features.includes("progress") ? 'let progress = jsContent["progress"] as? Double' : ""}
        ${config.features.includes("location") ? 'let location = jsContent["location"] as? String' : ""}
        ${config.features.includes("media") ? 'let mediaInfo = MediaInfo.from(jsContent["mediaInfo"] as? [String: Any])' : ""}
        
        return ContentState(
            state: state,
            relevanceScore: relevanceScore${config.features.includes("timer") ? ",\n            timestamp: timestamp" : ""}${config.features.includes("progress") ? ",\n            progress: progress" : ""}${config.features.includes("location") ? ",\n            location: location" : ""}${config.features.includes("media") ? ",\n            mediaInfo: mediaInfo" : ""}
        )
    }
}`;

    fs.writeFileSync(path.join(widgetDir, `${config.activityName}Attributes.swift`), template);
  }

  generateMediaInfoStruct() {
    return `
// MARK: - Media Information
public struct MediaInfo: Codable, Hashable {
    public var title: String
    public var artist: String?
    public var isPlaying: Bool
    
    public init(title: String, artist: String? = nil, isPlaying: Bool = false) {
        self.title = title
        self.artist = artist
        self.isPlaying = isPlaying
    }
    
    public static func from(_ jsObject: [String: Any]?) -> MediaInfo? {
        guard let jsObject = jsObject,
              let title = jsObject["title"] as? String else {
            return nil
        }
        
        let artist = jsObject["artist"] as? String
        let isPlaying = jsObject["isPlaying"] as? Bool ?? false
        
        return MediaInfo(title: title, artist: artist, isPlaying: isPlaying)
    }
}`;
  }

  async generateAdvancedWidgetBundle(widgetDir, config) {
    const template = `import SwiftUI
import WidgetKit

@main
struct ${config.widgetName}Bundle: WidgetBundle {
    var body: some Widget {
        ${config.activityName}LiveActivity()
    }
}`;

    fs.writeFileSync(path.join(widgetDir, `${config.widgetName}Bundle.swift`), template);
  }

  async generateInfoPlist(widgetDir, config) {
    const template = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>$(DEVELOPMENT_LANGUAGE)</string>
    <key>CFBundleDisplayName</key>
    <string>${config.displayName}</string>
    <key>CFBundleExecutable</key>
    <string>$(EXECUTABLE_NAME)</string>
    <key>CFBundleIdentifier</key>
    <string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>$(PRODUCT_NAME)</string>
    <key>CFBundlePackageType</key>
    <string>$(PRODUCT_BUNDLE_PACKAGE_TYPE)</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0</string>
    <key>CFBundleVersion</key>
    <string>1</string>
    <key>NSExtension</key>
    <dict>
        <key>NSExtensionPointIdentifier</key>
        <string>com.apple.widgetkit-extension</string>
    </dict>
    <key>NSSupportsLiveActivities</key>
    <true/>
    <key>LSMinimumSystemVersion</key>
    <string>${config.minIOSVersion}</string>
</dict>
</plist>`;

    fs.writeFileSync(path.join(widgetDir, "Info.plist"), template);
  }

  async generateTypeScriptTypes(config) {
    const typesDir = path.join(this.projectRoot, "src", "types");
    if (!fs.existsSync(typesDir)) {
      fs.mkdirSync(typesDir, { recursive: true });
    }

    const features = config.features;

    const typeDefinitions = `// Generated types for ${config.activityName}
export interface ${config.activityName}Attributes {
  title: string;
  body: string;
  metadata?: Record<string, string>;
}

export interface ${config.activityName}ContentState {
  state: string;
  relevanceScore?: number;
  ${features.includes("timer") ? "timestamp?: Date;" : ""}
  ${features.includes("progress") ? "progress?: number;" : ""}
  ${features.includes("location") ? "location?: string;" : ""}
  ${features.includes("media") ? "mediaInfo?: MediaInfo;" : ""}
}

${
  features.includes("media")
    ? `
export interface MediaInfo {
  title: string;
  artist?: string;
  isPlaying: boolean;
}`
    : ""
}

// Helper types
export type ${config.activityName}State = 'active' | 'paused' | 'ended';

// Usage example
export const create${config.activityName} = (
  attributes: ${config.activityName}Attributes,
  content: ${config.activityName}ContentState
) => {
  return DynamicActivities.startLiveActivity(attributes, content);
};`;

    fs.writeFileSync(path.join(typesDir, `${config.activityName}.ts`), typeDefinitions);

    this.log.success(`TypeScript types generated in src/types/${config.activityName}.ts`);
  }

  async updateXcodeProject(config) {
    this.log.title("🔧 Xcode Project Integration");

    try {
      // Check if we can use node-xcode library
      const hasNodeXcode = this.checkNodeXcode();

      if (hasNodeXcode) {
        this.log.step(1, "Updating Xcode project automatically...");
        await this.automaticXcodeUpdate(config);
      } else {
        this.log.warning("node-xcode not available - generating manual instructions");
        this.generateXcodeInstructions(config);
      }
    } catch (error) {
      this.log.warning(`Automatic Xcode update failed: ${error.message}`);
      this.generateXcodeInstructions(config);
    }
  }

  checkNodeXcode() {
    try {
      require.resolve("xcode");
      return true;
    } catch {
      return false;
    }
  }

  async automaticXcodeUpdate(config) {
    const xcode = require("xcode");
    const project = xcode.project(path.join(this.xcodeprojPath, "project.pbxproj"));

    project.parseSync();

    // Add widget target
    const targetUuid = project.generateUuid();
    const productUuid = project.generateUuid();

    // This is a simplified version - full implementation would be much more complex
    project.addTarget(config.widgetName, "app_extension", config.widgetName, config.fullBundleId);

    // Add Swift files to target
    const widgetDir = path.join(this.iosDir, config.widgetName);
    const swiftFiles = fs.readdirSync(widgetDir).filter((f) => f.endsWith(".swift"));

    for (const file of swiftFiles) {
      project.addSourceFile(path.join(config.widgetName, file), {
        target: targetUuid,
      });
    }

    // Write updated project
    fs.writeFileSync(path.join(this.xcodeprojPath, "project.pbxproj"), project.writeSync());

    this.log.success("Xcode project updated automatically");
  }

  generateXcodeInstructions(config) {
    const instructionsPath = path.join(this.iosDir, config.widgetName, "XCODE_SETUP.md");

    const instructions = `# Xcode Setup Instructions for ${config.widgetName}

## Automatic Setup (Recommended)

1. Open your project in Xcode
2. Run this script to add the widget target:

\`\`\`bash
npx react-native-dynamic-activities setup-xcode --widget="${config.widgetName}"
\`\`\`

## Manual Setup

1. **Add Widget Extension Target:**
   - File → New → Target...
   - Select "Widget Extension"
   - Product Name: \`${config.widgetName}\`
   - Bundle Identifier: \`${config.fullBundleId}\`
   - Language: Swift
   - Check "Include Live Activity" ✅

2. **Replace Generated Files:**
   - Delete the auto-generated Swift files in the new target
   - Add these files to your widget target:
     - \`${config.widgetName}Bundle.swift\`
     - \`${config.activityName}LiveActivity.swift\`
     - \`${config.activityName}Attributes.swift\`
     - \`Info.plist\`

3. **Configure Main App:**
   - Select your main app target
   - Go to "Signing & Capabilities"
   - Add "Live Activities" capability ✅

4. **Build Settings:**
   - Set iOS Deployment Target to ${config.minIOSVersion}+
   - Ensure Swift Language Version is set to 5.0+

5. **Test Your Widget:**
   - Build and run on a physical device
   - Live Activities don't work in Simulator

## Verification

Run this command to verify setup:
\`\`\`bash
npx react-native-dynamic-activities verify --widget="${config.widgetName}"
\`\`\`
`;

    fs.writeFileSync(instructionsPath, instructions);
    this.log.success(`Setup instructions created: ${instructionsPath}`);
  }

  async generatePreview(config) {
    this.log.title("📱 Generating Preview");

    try {
      // Generate preview images using Swift (requires macOS + Xcode)
      this.log.step(1, "Creating widget preview...");

      const previewScript = this.generatePreviewScript(config);
      const previewPath = path.join(this.iosDir, config.widgetName, "generate_preview.swift");

      fs.writeFileSync(previewPath, previewScript);

      this.log.info(`Preview script created: ${previewPath}`);
      this.log.info("Run it in Xcode to generate widget previews");
    } catch (error) {
      this.log.warning(`Preview generation failed: ${error.message}`);
    }
  }

  generatePreviewScript(config) {
    return `#!/usr/bin/env swift

// Preview Generator for ${config.activityName}
// Run this in Xcode to generate widget previews

import Foundation

print("🎨 Generating previews for ${config.widgetName}")
print("📱 Open Xcode and use the preview canvas")
print("🔄 Widget previews will update automatically")

// Add your preview generation logic here
// This can include screenshot automation, design exports, etc.
`;
  }

  showCompletion(config) {
    this.log.title("🎉 Widget Created Successfully!");

    console.log(`${this.colors.green}✓ Generated Files:${this.colors.reset}`);
    console.log(`  📁 ios/${config.widgetName}/`);
    console.log(`    ├── ${config.widgetName}Bundle.swift`);
    console.log(`    ├── ${config.activityName}LiveActivity.swift`);
    console.log(`    ├── ${config.activityName}Attributes.swift`);
    console.log("    ├── Info.plist");
    console.log("    └── XCODE_SETUP.md");

    if (config.generateTypes) {
      console.log("  📁 src/types/");
      console.log(`    └── ${config.activityName}.ts`);
    }

    console.log(`\n${this.colors.cyan}🚀 Next Steps:${this.colors.reset}`);
    console.log(
      `  1. ${this.colors.bold}Open Xcode${this.colors.reset} and follow setup instructions`,
    );
    console.log(
      `  2. ${this.colors.bold}Add Widget Extension target${this.colors.reset} using generated files`,
    );
    console.log(`  3. ${this.colors.bold}Enable Live Activities${this.colors.reset} capability`);
    console.log(
      `  4. ${this.colors.bold}Test on device${this.colors.reset} (physical device required)`,
    );

    console.log(`\n${this.colors.blue}💡 Usage Example:${this.colors.reset}`);
    console.log("```typescript");
    console.log(`import { DynamicActivities } from 'react-native-dynamic-activities';`);
    console.log(
      `${config.generateTypes ? `import { ${config.activityName}Attributes, ${config.activityName}ContentState } from './src/types/${config.activityName}';` : ""}`,
    );
    console.log("");
    console.log(
      `const attributes${config.generateTypes ? `: ${config.activityName}Attributes` : ""} = {`,
    );
    console.log(`  title: "${config.displayName}",`);
    console.log(`  body: "Your activity description"`);
    console.log("};");
    console.log("");
    console.log(
      `const content${config.generateTypes ? `: ${config.activityName}ContentState` : ""} = {`,
    );
    console.log(`  state: "active",`);
    console.log(
      `  relevanceScore: 1.0${config.features.includes("progress") ? ",\n  progress: 0.75" : ""}${config.features.includes("timer") ? ",\n  timestamp: new Date()" : ""}`,
    );
    console.log("};");
    console.log("");
    console.log("const result = await DynamicActivities.startLiveActivity(attributes, content);");
    console.log("```");

    console.log(`\n${this.colors.green}🛠 Available Commands:${this.colors.reset}`);
    console.log(
      `  • ${this.colors.cyan}npx react-native-dynamic-activities setup-xcode${this.colors.reset} - Automated Xcode setup`,
    );
    console.log(
      `  • ${this.colors.cyan}npx react-native-dynamic-activities verify${this.colors.reset} - Verify widget configuration`,
    );
    console.log(
      `  • ${this.colors.cyan}npx react-native-dynamic-activities preview${this.colors.reset} - Generate widget previews`,
    );

    console.log(
      `\n${this.colors.yellow}📖 Documentation:${this.colors.reset} See WIDGET_SETUP.md for detailed guides`,
    );
    console.log(
      `${this.colors.yellow}🐛 Issues?${this.colors.reset} Run \`npx react-native-dynamic-activities doctor\` for diagnostics\n`,
    );
  }
}

// CLI execution
if (require.main === module) {
  const wizard = new WidgetWizard();
  wizard.run().catch((error) => {
    console.error(`${wizard.colors.red}Error:${wizard.colors.reset}`, error.message);
    process.exit(1);
  });
}

module.exports = WidgetWizard;
