#!/usr/bin/env node

/**
 * React Native Dynamic Activities CLI
 * Production-ready command line interface for widget generation
 */

const { program } = require("commander");
const path = require("node:path");
const fs = require("node:fs");

// Color output helpers
const colors = {
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
  reset: "\x1b[0m",
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  title: (msg) => console.log(`\n${colors.bold}${colors.cyan}🚀 ${msg}${colors.reset}\n`),
};

class DynamicActivitiesCLI {
  constructor() {
    this.projectRoot = process.cwd();
    this.iosDir = path.join(this.projectRoot, "ios");
  }

  /**
   * Validates the development environment
   */
  validateEnvironment() {
    if (!fs.existsSync(path.join(this.projectRoot, "package.json"))) {
      throw new Error(
        "Not in a React Native project root. Please run this command from your React Native project's root directory.",
      );
    }

    if (!fs.existsSync(this.iosDir)) {
      throw new Error(
        "iOS directory not found. Make sure you're in a React Native project root with an ios/ directory.",
      );
    }

    const iosContents = fs.readdirSync(this.iosDir);
    const xcodeproj = iosContents.find((item) => item.endsWith(".xcodeproj"));

    if (!xcodeproj) {
      throw new Error(
        "No Xcode project found in ios/ directory. Make sure your React Native project is properly set up.",
      );
    }

    return xcodeproj.replace(".xcodeproj", "");
  }

  /**
   * Gets widget configuration from command line args or defaults
   */
  getWidgetConfig(name) {
    const projectName = this.getProjectName();
    const widgetName = name || "ExampleWidget";
    const activityName = `${widgetName.replace(/Widget$/, "")}Activity`;

    return {
      widgetName,
      bundleId: `${this.getBundlePrefix()}.${widgetName.toLowerCase()}`,
      activityName,
      projectName,
      projectRoot: this.projectRoot,
      iosDir: this.iosDir,
    };
  }

  /**
   * Gets project name from package.json
   */
  getProjectName() {
    try {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(this.projectRoot, "package.json"), "utf8"),
      );
      return packageJson.name || "MyProject";
    } catch (error) {
      log.warning("Could not read package.json, using default project name");
      return "MyProject";
    }
  }

  /**
   * Gets bundle identifier prefix from iOS project
   */
  getBundlePrefix() {
    try {
      const projectName = this.validateEnvironment();
      const plistPath = path.join(this.iosDir, projectName, "Info.plist");

      if (fs.existsSync(plistPath)) {
        const plistContent = fs.readFileSync(plistPath, "utf8");
        // Simple regex to extract bundle identifier pattern
        const bundleMatch = plistContent.match(
          /<key>CFBundleIdentifier<\/key>\s*<string>(.*?)<\/string>/,
        );
        if (bundleMatch) {
          const bundleId = bundleMatch[1]
            .replace("$(PRODUCT_BUNDLE_IDENTIFIER)", "")
            .replace(/\.\w+$/, "");
          if (bundleId.startsWith("com.")) {
            return bundleId;
          }
        }
      }
    } catch (error) {
      log.warning("Could not determine bundle prefix from iOS project");
    }

    // Fallback to project name based bundle ID
    const projectName = this.getProjectName()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
    return `com.${projectName}`;
  }

  /**
   * Creates a new widget with all necessary files
   */
  async createWidget(name) {
    try {
      log.title("React Native Dynamic Activities - Widget Creator");

      const projectName = this.validateEnvironment();
      const config = this.getWidgetConfig(name);

      log.info("Creating widget with configuration:");
      console.log(`  ${colors.cyan}Widget Name:${colors.reset} ${config.widgetName}`);
      console.log(`  ${colors.cyan}Bundle ID:${colors.reset} ${config.bundleId}`);
      console.log(`  ${colors.cyan}Activity Name:${colors.reset} ${config.activityName}`);
      console.log(`  ${colors.cyan}Project:${colors.reset} ${projectName}\n`);

      const widgetDir = path.join(this.iosDir, config.widgetName);

      // Create widget directory
      if (!fs.existsSync(widgetDir)) {
        fs.mkdirSync(widgetDir, { recursive: true });
        log.success(`Created directory: ${widgetDir}`);
      }

      // Generate all widget files
      this.generateWidgetBundle(widgetDir, config);
      this.generateLiveActivity(widgetDir, config);
      this.generateActivityAttributes(widgetDir, config);
      this.generateInfoPlist(widgetDir, config);

      log.success("Widget files generated successfully!");
      this.showCompletionMessage(config);
    } catch (error) {
      log.error(`Failed to create widget: ${error.message}`);
      process.exit(1);
    }
  }

  /**
   * Generates the widget bundle file
   */
  generateWidgetBundle(widgetDir, config) {
    const template = `import SwiftUI
import WidgetKit

@main
struct ${config.widgetName}Bundle: WidgetBundle {
    var body: some Widget {
        ${config.activityName}LiveActivity()
    }
}
`;
    const filePath = path.join(widgetDir, `${config.widgetName}Bundle.swift`);
    fs.writeFileSync(filePath, template);
    log.success(`Generated: ${config.widgetName}Bundle.swift`);
  }

  /**
   * Generates the Live Activity SwiftUI view
   */
  generateLiveActivity(widgetDir, config) {
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
                        .fontWeight(.semibold)
                    Spacer()
                    Text(context.state.state.capitalized)
                        .font(.caption)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(Color.blue.opacity(0.2))
                        .cornerRadius(8)
                }
                
                Text(context.attributes.body)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                
                if let relevanceScore = context.state.relevanceScore {
                    HStack {
                        Text("Progress")
                            .font(.caption)
                        Spacer()
                        Text("\\(Int(relevanceScore * 100))%")
                            .font(.caption)
                            .fontWeight(.medium)
                    }
                    
                    ProgressView(value: relevanceScore)
                        .progressViewStyle(LinearProgressViewStyle(tint: .blue))
                        .scaleEffect(y: 0.5)
                }
            }
            .padding()
            .background(
                RoundedRectangle(cornerRadius: 12)
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

// MARK: - Previews
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
    const filePath = path.join(widgetDir, `${config.activityName}LiveActivity.swift`);
    fs.writeFileSync(filePath, template);
    log.success(`Generated: ${config.activityName}LiveActivity.swift`);
  }

  /**
   * Generates the Activity Attributes
   */
  generateActivityAttributes(widgetDir, config) {
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
    const filePath = path.join(widgetDir, `${config.activityName}Attributes.swift`);
    fs.writeFileSync(filePath, template);
    log.success(`Generated: ${config.activityName}Attributes.swift`);
  }

  /**
   * Generates Info.plist
   */
  generateInfoPlist(widgetDir, config) {
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
    const filePath = path.join(widgetDir, "Info.plist");
    fs.writeFileSync(filePath, template);
    log.success("Generated: Info.plist");
  }

  /**
   * Shows completion message with next steps
   */
  showCompletionMessage(config) {
    console.log(
      `\n${colors.bold}${colors.green}🎉 Widget Extension Created Successfully!${colors.reset}\n`,
    );

    console.log(`${colors.green}Generated Files:${colors.reset}`);
    console.log(`  📄 ${config.widgetName}Bundle.swift`);
    console.log(`  📄 ${config.activityName}LiveActivity.swift`);
    console.log(`  📄 ${config.activityName}Attributes.swift`);
    console.log("  📄 Info.plist\n");

    console.log(`${colors.yellow}${colors.bold}Manual Xcode Setup Required:${colors.reset}`);
    console.log(
      `${colors.cyan}1.${colors.reset} Open your project in ${colors.bold}Xcode${colors.reset}`,
    );
    console.log(`${colors.cyan}2.${colors.reset} File → New → Target...`);
    console.log(
      `${colors.cyan}3.${colors.reset} Select "${colors.bold}Widget Extension${colors.reset}" → Next`,
    );
    console.log(
      `${colors.cyan}4.${colors.reset} Product Name: ${colors.bold}${config.widgetName}${colors.reset}`,
    );
    console.log(
      `${colors.cyan}5.${colors.reset} Bundle Identifier: ${colors.bold}${config.bundleId}${colors.reset}`,
    );
    console.log(
      `${colors.cyan}6.${colors.reset} Check "${colors.bold}Include Live Activity${colors.reset}" if available`,
    );
    console.log(`${colors.cyan}7.${colors.reset} Click Finish`);
    console.log(
      `${colors.cyan}8.${colors.reset} Replace generated files with the ones in ${colors.bold}ios/${config.widgetName}/${colors.reset}`,
    );
    console.log(
      `${colors.cyan}9.${colors.reset} Add "${colors.bold}Live Activities${colors.reset}" capability to your main app target\n`,
    );

    console.log(`${colors.blue}${colors.bold}Usage in React Native:${colors.reset}`);
    console.log(
      `${colors.reset}// Your attributes should match ${config.activityName}Attributes${colors.reset}`,
    );
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
    console.log(
      `const result = await DynamicActivities.startLiveActivity(attributes, content);${colors.reset}\n`,
    );

    console.log(`${colors.green}${colors.bold}Next Steps:${colors.reset}`);
    console.log(`• Test on a physical device (Live Activities don't work in Simulator)`);
    console.log(
      `• Customize the UI in ${colors.bold}${config.activityName}LiveActivity.swift${colors.reset}`,
    );
    console.log("• Update your TypeScript types to match Swift ActivityAttributes");
    console.log("• Check the documentation for more advanced features\n");
  }
}

// CLI Setup
program
  .name("react-native-dynamic-activities")
  .description("React Native Dynamic Activities CLI - Generate Live Activity widgets")
  .version("1.0.0");

program
  .command("create")
  .argument("[name]", "Widget name (e.g., DeliveryWidget)", "ExampleWidget")
  .description("Create a new Live Activity widget")
  .action(async (name) => {
    const cli = new DynamicActivitiesCLI();
    await cli.createWidget(name);
  });

program
  .command("help")
  .description("Show help information")
  .action(() => {
    program.help();
  });

// Handle unknown commands
program.on("command:*", () => {
  console.error(`${colors.red}✗${colors.reset} Invalid command: ${program.args.join(" ")}`);
  console.log(
    `${colors.yellow}ℹ${colors.reset} Use 'react-native-dynamic-activities help' to see available commands`,
  );
  process.exit(1);
});

// Parse command line arguments
program.parse();

// Show help if no arguments provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
