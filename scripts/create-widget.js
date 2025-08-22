#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

// Color output helpers
const colors = {
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  blue: "\x1b[34m",
  bold: "\x1b[1m",
  reset: "\x1b[0m",
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  title: (msg) => console.log(`\n${colors.bold}${colors.blue}${msg}${colors.reset}\n`),
};

class WidgetScaffolder {
  constructor() {
    this.projectRoot = process.cwd();
    this.iosDir = path.join(this.projectRoot, "ios");
    this.templatesDir = path.join(__dirname, "..", "templates");
  }

  async run() {
    try {
      log.title("🚀 React Native Dynamic Activities - Widget Scaffolder");

      // Validate environment
      await this.validateEnvironment();

      // Get user input
      const config = await this.getUserInput();

      // Generate widget files
      await this.generateWidget(config);

      // Update Xcode project
      await this.updateXcodeProject(config);

      // Success message
      this.showCompletionMessage(config);
    } catch (error) {
      log.error(`Failed to create widget: ${error.message}`);
      process.exit(1);
    }
  }

  async validateEnvironment() {
    log.info("Validating environment...");

    // Check if we're in a React Native project
    if (!fs.existsSync(path.join(this.projectRoot, "package.json"))) {
      throw new Error("Not in a React Native project root");
    }

    // Check if iOS directory exists
    if (!fs.existsSync(this.iosDir)) {
      throw new Error("iOS directory not found. Run this from your React Native project root.");
    }

    // Check for Xcode project
    const iosContents = fs.readdirSync(this.iosDir);
    const xcodeproj = iosContents.find((item) => item.endsWith(".xcodeproj"));

    if (!xcodeproj) {
      throw new Error("No Xcode project found in ios/ directory");
    }

    this.xcodeprojPath = path.join(this.iosDir, xcodeproj);
    this.projectName = xcodeproj.replace(".xcodeproj", "");

    log.success("Environment validation passed");
  }

  async getUserInput() {
    // For now, use defaults. In a real implementation, you'd use inquirer or similar
    const config = {
      widgetName: this.getWidgetName(),
      bundleId: this.getBundleId(),
      activityName: this.getActivityName(),
    };

    log.info("Widget Configuration:");
    log.info(`  Widget Name: ${config.widgetName}`);
    log.info(`  Bundle ID: ${config.bundleId}`);
    log.info(`  Activity Name: ${config.activityName}`);

    return config;
  }

  getWidgetName() {
    // Extract from command line args or use default
    const args = process.argv.slice(2);
    const nameArg = args.find((arg) => arg.startsWith("--name="));
    return nameArg ? nameArg.split("=")[1] : `${this.projectName}Widget`;
  }

  getBundleId() {
    const args = process.argv.slice(2);
    const bundleArg = args.find((arg) => arg.startsWith("--bundle-id="));
    return bundleArg
      ? bundleArg.split("=")[1]
      : `com.example.${this.projectName.toLowerCase()}.widget`;
  }

  getActivityName() {
    const args = process.argv.slice(2);
    const activityArg = args.find((arg) => arg.startsWith("--activity="));
    return activityArg ? activityArg.split("=")[1] : "DefaultActivity";
  }

  async generateWidget(config) {
    log.info("Generating widget files...");

    const widgetDir = path.join(this.iosDir, config.widgetName);

    // Create widget directory
    if (!fs.existsSync(widgetDir)) {
      fs.mkdirSync(widgetDir, { recursive: true });
    }

    // Generate Swift files
    await this.generateWidgetBundle(widgetDir, config);
    await this.generateLiveActivity(widgetDir, config);
    await this.generateActivityAttributes(widgetDir, config);
    await this.generateInfoPlist(widgetDir, config);

    log.success(`Widget files generated in ${widgetDir}`);
  }

  async generateWidgetBundle(widgetDir, config) {
    const template = `import SwiftUI
import WidgetKit

@main
struct ${config.widgetName}Bundle: WidgetBundle {
    var body: some Widget {
        ${config.activityName}LiveActivity()
    }
}
`;

    fs.writeFileSync(path.join(widgetDir, `${config.widgetName}Bundle.swift`), template);
  }

  async generateLiveActivity(widgetDir, config) {
    const template = `import ActivityKit
import SwiftUI
import WidgetKit

struct ${config.activityName}LiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: ${config.activityName}Attributes.self) { context in
            // Lock Screen/Banner UI
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text(context.attributes.title)
                        .font(.headline)
                        .foregroundColor(.primary)
                    Spacer()
                    Text(context.state.state.capitalized)
                        .font(.caption)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(
                            RoundedRectangle(cornerRadius: 8)
                                .fill(context.state.state == "active" ? Color.green : Color.gray)
                        )
                        .foregroundColor(.white)
                }
                
                Text(context.attributes.body)
                    .font(.body)
                    .foregroundColor(.secondary)
                
                if let relevanceScore = context.state.relevanceScore {
                    HStack {
                        Text("Progress")
                            .font(.caption)
                        Spacer()
                        Text("\\(Int(relevanceScore * 100))%")
                            .font(.caption)
                            .fontWeight(.semibold)
                    }
                    
                    ProgressView(value: relevanceScore)
                        .progressViewStyle(LinearProgressViewStyle(tint: .blue))
                }
            }
            .padding()
            .background(
                RoundedRectangle(cornerRadius: 16)
                    .fill(Color(.systemBackground))
            )
        } dynamicIsland: { context in
            DynamicIsland {
                // Expanded UI
                DynamicIslandExpandedRegion(.leading) {
                    VStack(alignment: .leading) {
                        Text(context.attributes.title)
                            .font(.caption)
                            .fontWeight(.semibold)
                        Text(context.state.state.capitalized)
                            .font(.caption2)
                            .foregroundColor(.secondary)
                    }
                }
                DynamicIslandExpandedRegion(.trailing) {
                    VStack(alignment: .trailing) {
                        if let relevanceScore = context.state.relevanceScore {
                            Text("\\(Int(relevanceScore * 100))%")
                                .font(.caption)
                                .fontWeight(.semibold)
                            ProgressView(value: relevanceScore)
                                .progressViewStyle(LinearProgressViewStyle(tint: .blue))
                                .frame(width: 40)
                        }
                    }
                }
                DynamicIslandExpandedRegion(.center) {
                    Text(context.attributes.body)
                        .font(.caption)
                        .multilineTextAlignment(.center)
                }
            } compactLeading: {
                // Compact leading
                Text(context.attributes.title.prefix(1))
                    .font(.caption2)
                    .fontWeight(.semibold)
            } compactTrailing: {
                // Compact trailing
                if context.state.state == "active" {
                    Image(systemName: "play.fill")
                        .foregroundColor(.green)
                        .font(.caption2)
                } else {
                    Image(systemName: "pause.fill")
                        .foregroundColor(.gray)
                        .font(.caption2)
                }
            } minimal: {
                // Minimal
                Text(context.attributes.title.prefix(1))
                    .font(.caption2)
                    .fontWeight(.semibold)
            }
        }
    }
}

// Preview
#if DEBUG
struct ${config.activityName}LiveActivity_Previews: PreviewProvider {
    static let attributes = ${config.activityName}Attributes(
        title: "Sample Activity",
        body: "This is a preview of your Live Activity"
    )
    
    static let contentState = ${config.activityName}Attributes.ContentState(
        state: "active",
        relevanceScore: 0.75
    )
    
    static var previews: some View {
        attributes
            .previewContext(contentState, viewKind: .dynamicIsland(.compact))
            .previewDisplayName("Island Compact")
        
        attributes
            .previewContext(contentState, viewKind: .dynamicIsland(.expanded))
            .previewDisplayName("Island Expanded")
        
        attributes
            .previewContext(contentState, viewKind: .dynamicIsland(.minimal))
            .previewDisplayName("Island Minimal")
    }
}
#endif
`;

    fs.writeFileSync(path.join(widgetDir, `${config.activityName}LiveActivity.swift`), template);
  }

  async generateActivityAttributes(widgetDir, config) {
    const template = `import ActivityKit
import Foundation

// MARK: - Activity Attributes
struct ${config.activityName}Attributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        /// Current state of the activity (e.g., "active", "paused", "ended")
        var state: String
        
        /// Optional relevance score for Dynamic Island priority (0.0 - 1.0)
        var relevanceScore: Double?
        
        /// Optional timestamp for the state change
        var timestamp: Date?
        
        public init(state: String, relevanceScore: Double? = nil, timestamp: Date? = nil) {
            self.state = state
            self.relevanceScore = relevanceScore
            self.timestamp = timestamp
        }
    }
    
    /// Activity title
    var title: String
    
    /// Activity description/body text
    var body: String
    
    /// Optional metadata
    var metadata: [String: String]?
    
    public init(title: String, body: String, metadata: [String: String]? = nil) {
        self.title = title
        self.body = body
        self.metadata = metadata
    }
}

// MARK: - Type Mapping Helper
extension ${config.activityName}Attributes {
    /// Maps JavaScript LiveActivityAttributes to Swift ActivityAttributes
    static func from(jsAttributes: [String: Any]) -> ${config.activityName}Attributes? {
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
    
    /// Maps JavaScript LiveActivityContent to Swift ContentState
    static func contentStateFrom(jsContent: [String: Any]) -> ContentState? {
        guard let state = jsContent["state"] as? String else {
            return nil
        }
        
        let relevanceScore = jsContent["relevanceScore"] as? Double
        let timestamp = jsContent["timestamp"] as? Date
        
        return ContentState(
            state: state,
            relevanceScore: relevanceScore,
            timestamp: timestamp
        )
    }
}
`;

    fs.writeFileSync(path.join(widgetDir, `${config.activityName}Attributes.swift`), template);
  }

  async generateInfoPlist(widgetDir, config) {
    const template = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>$(DEVELOPMENT_LANGUAGE)</string>
    <key>CFBundleDisplayName</key>
    <string>${config.widgetName}</string>
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
</dict>
</plist>
`;

    fs.writeFileSync(path.join(widgetDir, "Info.plist"), template);
  }

  async updateXcodeProject(config) {
    log.info("Updating Xcode project...");

    // Note: In a real implementation, you'd use xcode-project manipulation
    // For now, we'll provide manual instructions
    log.warning("Xcode project update requires manual steps (see completion message)");
  }

  showCompletionMessage(config) {
    log.title("🎉 Widget Extension Created Successfully!");

    console.log(`${colors.green}Generated Files:${colors.reset}`);
    console.log(`${config.widgetName}Bundle.swift`);
    console.log(`${config.activityName}LiveActivity.swift`);
    console.log(`${config.activityName}Attributes.swift`);
    console.log("Info.plist");

    console.log(`\n${colors.yellow}Manual Xcode Setup Required:${colors.reset}`);
    console.log("1. Open your project in Xcode");
    console.log("2. File -> New -> Target...");
    console.log(`3. Select "Widget Extension" -> Next`);
    console.log(`4. Product Name: ${config.widgetName}`);
    console.log(`5. Bundle Identifier: ${config.bundleId}`);
    console.log(`6. Check "Include Live Activity" if available`);
    console.log("7. Click Finish");
    console.log(`8. Replace generated files with the ones created in ios/${config.widgetName}/`);
    console.log(`9. Add "Live Activities" capability to your main app target`);

    console.log(`\n${colors.blue}Usage in React Native:${colors.reset}`);
    console.log("```typescript");
    console.log(`import { DynamicActivities } from 'react-native-dynamic-activities';`);
    console.log("");
    console.log(`// Your attributes should match ${config.activityName}Attributes`);
    console.log("const attributes = {");
    console.log(`  title: "My Activity",`);
    console.log(`  body: "Activity description"`);
    console.log("};");
    console.log("");
    console.log("const content = {");
    console.log(`  state: "active",`);
    console.log("  relevanceScore: 1.0");
    console.log("};");
    console.log("");
    console.log("const result = await DynamicActivities.startLiveActivity(attributes, content);");
    console.log("```");

    console.log(`\n${colors.green}Next Steps:${colors.reset}`);
    console.log(`• Test on a physical device (Live Activities don't work in Simulator)`);
    console.log(`• Customize the UI in ${config.activityName}LiveActivity.swift`);
    console.log("• Update your TypeScript types to match Swift ActivityAttributes");
  }
}

// CLI execution
if (require.main === module) {
  const scaffolder = new WidgetScaffolder();
  scaffolder.run().catch((error) => {
    console.error("Error:", error.message);
    process.exit(1);
  });
}

module.exports = WidgetScaffolder;
