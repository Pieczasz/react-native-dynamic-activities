#!/usr/bin/env ts-node

/**
 * React Native Dynamic Activities - Modern TypeScript CLI
 *
 * A simplified, type-safe CLI for Live Activities widget creation.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import chalk from "chalk";
import { program } from "commander";

interface WidgetConfig {
  widgetName: string;
  bundleId: string;
  activityName: string;
  projectRoot: string;
  iosDir: string;
}

class DynamicActivitiesCLI {
  private projectRoot: string;
  private iosDir: string;

  constructor() {
    this.projectRoot = process.cwd();
    this.iosDir = path.join(this.projectRoot, "ios");
  }

  /**
   * Validates the development environment
   */
  private validateEnvironment(): void {
    if (!fs.existsSync(path.join(this.projectRoot, "package.json"))) {
      throw new Error("Not in a React Native project root");
    }

    if (!fs.existsSync(this.iosDir)) {
      throw new Error("iOS directory not found. Run this from your React Native project root.");
    }

    const iosContents = fs.readdirSync(this.iosDir);
    const xcodeproj = iosContents.find((item) => item.endsWith(".xcodeproj"));

    if (!xcodeproj) {
      throw new Error("No Xcode project found in ios/ directory");
    }
  }

  /**
   * Gets widget configuration from command line args or defaults
   */
  private getWidgetConfig(name?: string): WidgetConfig {
    const widgetName = name || "ExampleWidget";
    const activityName = `${widgetName.replace("Widget", "")}Activity`;

    return {
      widgetName,
      bundleId: `com.${this.getProjectName().toLowerCase()}.${widgetName.toLowerCase()}`,
      activityName,
      projectRoot: this.projectRoot,
      iosDir: this.iosDir,
    };
  }

  /**
   * Gets project name from package.json
   */
  private getProjectName(): string {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(this.projectRoot, "package.json"), "utf8"),
    );
    return packageJson.name || "MyProject";
  }

  /**
   * Creates a new widget with all necessary files
   */
  async createWidget(name?: string): Promise<void> {
    try {
      console.log(chalk.blue.bold("\n🚀 React Native Dynamic Activities - Widget Creator\n"));

      this.validateEnvironment();
      const config = this.getWidgetConfig(name);

      console.log(chalk.cyan("Creating widget with configuration:"));
      console.log(`  Widget Name: ${config.widgetName}`);
      console.log(`  Bundle ID: ${config.bundleId}`);
      console.log(`  Activity Name: ${config.activityName}\n`);

      const widgetDir = path.join(this.iosDir, config.widgetName);

      // Create widget directory
      if (!fs.existsSync(widgetDir)) {
        fs.mkdirSync(widgetDir, { recursive: true });
      }

      // Generate all widget files
      this.generateWidgetBundle(widgetDir, config);
      this.generateLiveActivity(widgetDir, config);
      this.generateActivityAttributes(widgetDir, config);
      this.generateInfoPlist(widgetDir, config);

      console.log(chalk.green("✓ Widget files generated successfully!"));
      this.showCompletionMessage(config);
    } catch (error) {
      console.error(chalk.red(`✗ Failed to create widget: ${error.message}`));
      process.exit(1);
    }
  }

  /**
   * Generates the widget bundle file
   */
  private generateWidgetBundle(widgetDir: string, config: WidgetConfig): void {
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

  /**
   * Generates the Live Activity SwiftUI view
   */
  private generateLiveActivity(widgetDir: string, config: WidgetConfig): void {
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
    fs.writeFileSync(path.join(widgetDir, `${config.activityName}LiveActivity.swift`), template);
  }

  /**
   * Generates the Activity Attributes
   */
  private generateActivityAttributes(widgetDir: string, config: WidgetConfig): void {
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

  /**
   * Generates Info.plist
   */
  private generateInfoPlist(widgetDir: string, config: WidgetConfig): void {
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

  /**
   * Shows completion message with next steps
   */
  private showCompletionMessage(config: WidgetConfig): void {
    console.log(chalk.green.bold("\n🎉 Widget Extension Created Successfully!\n"));

    console.log(chalk.green("Generated Files:"));
    console.log(`  ${config.widgetName}Bundle.swift`);
    console.log(`  ${config.activityName}LiveActivity.swift`);
    console.log(`  ${config.activityName}Attributes.swift`);
    console.log("  Info.plist\n");

    console.log(chalk.yellow("Manual Xcode Setup Required:"));
    console.log("1. Open your project in Xcode");
    console.log("2. File → New → Target...");
    console.log('3. Select "Widget Extension" → Next');
    console.log(`4. Product Name: ${config.widgetName}`);
    console.log(`5. Bundle Identifier: ${config.bundleId}`);
    console.log('6. Check "Include Live Activity" if available');
    console.log("7. Click Finish");
    console.log(`8. Replace generated files with the ones in ios/${config.widgetName}/`);
    console.log('9. Add "Live Activities" capability to your main app target\n');

    console.log(chalk.blue("Usage in React Native:"));
    console.log(chalk.gray("```typescript"));
    console.log(chalk.gray(`import { DynamicActivities } from 'react-native-dynamic-activities';`));
    console.log(chalk.gray(""));
    console.log(chalk.gray(`// Your attributes should match ${config.activityName}Attributes`));
    console.log(chalk.gray("const attributes = {"));
    console.log(chalk.gray('  title: "My Activity",'));
    console.log(chalk.gray('  body: "Activity description"'));
    console.log(chalk.gray("};"));
    console.log(chalk.gray(""));
    console.log(chalk.gray("const content = {"));
    console.log(chalk.gray('  state: "active",'));
    console.log(chalk.gray("  relevanceScore: 1.0"));
    console.log(chalk.gray("};"));
    console.log(chalk.gray(""));
    console.log(
      chalk.gray("const result = await DynamicActivities.startLiveActivity(attributes, content);"),
    );
    console.log(chalk.gray("```\n"));

    console.log(chalk.green("Next Steps:"));
    console.log("• Test on a physical device (Live Activities don't work in Simulator)");
    console.log(`• Customize the UI in ${config.activityName}LiveActivity.swift`);
    console.log("• Update your TypeScript types to match Swift ActivityAttributes");
  }
}

// CLI Setup
program
  .name("dynamic-activities")
  .description("React Native Dynamic Activities CLI")
  .version("1.0.0");

program
  .command("create [name]")
  .description("Create a new Live Activity widget")
  .action(async (name?: string) => {
    const cli = new DynamicActivitiesCLI();
    await cli.createWidget(name);
  });

program
  .command("help")
  .description("Show help information")
  .action(() => {
    program.help();
  });

// Parse command line arguments
program.parse();
