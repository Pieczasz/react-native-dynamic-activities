#!/usr/bin/env node

/**
 * React Native Dynamic Activities - Main CLI Entry Point
 *
 * Provides a comprehensive CLI interface for Live Activities widget creation,
 * management, and troubleshooting.
 */

const path = require("node:path");
const fs = require("node:fs");

// Import our specialized tools
const WidgetWizard = require("./widget-wizard");
const XcodeManager = require("./xcode-manager");
const WidgetScaffolder = require("./create-widget");

class DynamicActivitiesCLI {
  constructor() {
    this.commands = {
      create: {
        description: "Create a new Live Activity widget (basic)",
        handler: this.createWidget.bind(this),
      },
      wizard: {
        description: "Interactive widget creation wizard (recommended)",
        handler: this.runWizard.bind(this),
      },
      "setup-xcode": {
        description: "Automatically configure Xcode project",
        handler: this.setupXcode.bind(this),
      },
      verify: {
        description: "Verify widget configuration",
        handler: this.verifyWidget.bind(this),
      },
      doctor: {
        description: "Diagnose development environment",
        handler: this.runDoctor.bind(this),
      },
      preview: {
        description: "Generate widget previews",
        handler: this.generatePreview.bind(this),
      },
      list: {
        description: "List existing widgets in project",
        handler: this.listWidgets.bind(this),
      },
      help: {
        description: "Show this help message",
        handler: this.showHelp.bind(this),
      },
    };
  }

  // Colors for consistent output
  colors = {
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
    blue: "\x1b[34m",
    cyan: "\x1b[36m",
    magenta: "\x1b[35m",
    bold: "\x1b[1m",
    dim: "\x1b[2m",
    reset: "\x1b[0m",
  };

  async run() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
      this.showWelcome();
      return;
    }

    const command = args[0];
    const commandDef = this.commands[command];

    if (!commandDef) {
      console.log(`${this.colors.red}Unknown command: ${command}${this.colors.reset}`);
      this.showHelp();
      process.exit(1);
    }

    try {
      await commandDef.handler(args.slice(1));
    } catch (error) {
      console.log(`${this.colors.red}Error: ${error.message}${this.colors.reset}`);
      process.exit(1);
    }
  }

  showWelcome() {
    console.log(`
${this.colors.bold}${this.colors.cyan}╔════════════════════════════════════════════════════════════════════════════╗
║                    🚀 React Native Dynamic Activities CLI                  ║
║                                                                            ║
║               Create iOS Live Activities with zero Xcode friction         ║
╚════════════════════════════════════════════════════════════════════════════╝${this.colors.reset}

${this.colors.dim}Welcome to the most developer-friendly Live Activities toolkit!${this.colors.reset}

${this.colors.bold}🎯 Quick Start:${this.colors.reset}
  ${this.colors.green}npx react-native-dynamic-activities wizard${this.colors.reset}   # Interactive widget creation
  ${this.colors.green}npx react-native-dynamic-activities create${this.colors.reset}   # Basic widget generation

${this.colors.bold}🛠 Available Commands:${this.colors.reset}
`);

    for (const [cmd, def] of Object.entries(this.commands)) {
      console.log(`  ${this.colors.cyan}${cmd.padEnd(12)}${this.colors.reset} ${def.description}`);
    }

    console.log(`
${this.colors.bold}💡 Examples:${this.colors.reset}
  ${this.colors.dim}# Interactive wizard with all options${this.colors.reset}
  ${this.colors.green}npx react-native-dynamic-activities wizard${this.colors.reset}

  ${this.colors.dim}# Quick widget creation${this.colors.reset}
  ${this.colors.green}npx react-native-dynamic-activities create --name=TimerWidget${this.colors.reset}

  ${this.colors.dim}# Check if everything is set up correctly${this.colors.reset}
  ${this.colors.green}npx react-native-dynamic-activities doctor${this.colors.reset}

${this.colors.yellow}📖 Need help?${this.colors.reset} Run: ${this.colors.cyan}npx react-native-dynamic-activities help${this.colors.reset}
`);
  }

  async createWidget(args) {
    console.log(
      `${this.colors.blue}🔨 Creating widget with basic scaffolder...${this.colors.reset}\n`,
    );

    const scaffolder = new WidgetScaffolder();

    // Override argv for the scaffolder
    const originalArgv = process.argv;
    process.argv = ["node", "create-widget.js", ...args];

    try {
      await scaffolder.run();
    } finally {
      process.argv = originalArgv;
    }

    console.log(
      `\n${this.colors.green}💡 Want more features?${this.colors.reset} Try: ${this.colors.cyan}npx react-native-dynamic-activities wizard${this.colors.reset}`,
    );
  }

  async runWizard(args) {
    console.log(
      `${this.colors.magenta}🧙‍♂️ Starting interactive widget wizard...${this.colors.reset}\n`,
    );

    const wizard = new WidgetWizard();
    await wizard.run();
  }

  async setupXcode(args) {
    const manager = new XcodeManager();

    const widgetName = this.getArgValue(args, "--widget");
    const bundleId = this.getArgValue(args, "--bundle-id");
    const filesArg = this.getArgValue(args, "--files");
    const files = filesArg ? filesArg.split(",") : [];

    if (!widgetName) {
      throw new Error("--widget parameter is required");
    }

    await manager.setupWidget(widgetName, bundleId, files);
  }

  async verifyWidget(args) {
    const manager = new XcodeManager();

    const widgetName = this.getArgValue(args, "--widget");
    if (!widgetName) {
      throw new Error("--widget parameter is required");
    }

    const isValid = await manager.verify(widgetName);

    if (isValid) {
      console.log(
        `\n${this.colors.green}🎉 Widget "${widgetName}" is properly configured!${this.colors.reset}`,
      );
    } else {
      console.log(
        `\n${this.colors.yellow}⚠ Widget "${widgetName}" has configuration issues.${this.colors.reset}`,
      );
      process.exit(1);
    }
  }

  async runDoctor() {
    const manager = new XcodeManager();
    await manager.doctor();
  }

  async generatePreview(args) {
    console.log(`${this.colors.blue}📱 Widget Preview Generator${this.colors.reset}\n`);

    const widgetName = this.getArgValue(args, "--widget");
    if (!widgetName) {
      throw new Error("--widget parameter is required");
    }

    const projectRoot = process.cwd();
    const widgetDir = path.join(projectRoot, "ios", widgetName);

    if (!fs.existsSync(widgetDir)) {
      throw new Error(`Widget directory not found: ${widgetDir}`);
    }

    console.log(`${this.colors.green}✓${this.colors.reset} Found widget: ${widgetName}`);

    // Generate preview script
    const previewScript = `#!/usr/bin/env swift

import Foundation
import SwiftUI

// Preview Generator for ${widgetName}
print("📱 Widget Preview Generator")
print("🎨 Widget: ${widgetName}")
print("")
print("To see your widget previews:")
print("1. Open your project in Xcode")
print("2. Navigate to ${widgetName}LiveActivity.swift")
print("3. Click 'Resume' in the preview canvas")
print("4. Your widget will appear with different states")
print("")
print("Preview states available:")
print("• Dynamic Island - Compact")
print("• Dynamic Island - Expanded") 
print("• Dynamic Island - Minimal")
print("• Lock Screen")
print("")
print("💡 Tip: Use Command+Option+P to refresh previews")
`;

    const previewPath = path.join(widgetDir, "generate_preview.swift");
    fs.writeFileSync(previewPath, previewScript);

    console.log(`${this.colors.green}✓${this.colors.reset} Preview script created: ${previewPath}`);
    console.log(
      `${this.colors.blue}ℹ${this.colors.reset} Open Xcode and run the preview to see your widget\n`,
    );

    // Also generate a README for previews
    const previewReadme = `# ${widgetName} Previews

## Using Xcode Previews

1. Open your project in Xcode
2. Navigate to \`${widgetName}LiveActivity.swift\`
3. Click **"Resume"** in the Preview canvas (right panel)
4. Your widget will render with different configurations

## Available Preview States

### Dynamic Island
- **Compact**: Minimal space on either side of the island
- **Expanded**: Full Dynamic Island takeover
- **Minimal**: Single dot when multiple activities are active

### Lock Screen
- **Banner**: Full widget display on Lock Screen
- **Notification**: Inline with other notifications

## Customizing Previews

Edit the \`${widgetName}LiveActivity_Previews\` struct to:
- Add custom data states
- Test different content scenarios  
- Validate UI in various modes

## Troubleshooting Previews

If previews don't work:
1. Clean build folder: **Product → Clean Build Folder**
2. Restart Xcode
3. Check iOS deployment target (16.2+)
4. Ensure all Swift files compile without errors
`;

    const readmePath = path.join(widgetDir, "PREVIEW_GUIDE.md");
    fs.writeFileSync(readmePath, previewReadme);

    console.log(`${this.colors.green}✓${this.colors.reset} Preview guide created: ${readmePath}`);

    // Try to automatically open Xcode if available
    try {
      const { execSync } = require("node:child_process");
      const xcodeproj = fs
        .readdirSync(path.join(projectRoot, "ios"))
        .find((f) => f.endsWith(".xcodeproj"));

      if (xcodeproj) {
        console.log(`${this.colors.blue}ℹ${this.colors.reset} Opening project in Xcode...`);
        execSync(`open ios/${xcodeproj}`, { cwd: projectRoot });
      }
    } catch (error) {
      // Silent fail - just don't auto-open
    }
  }

  async listWidgets() {
    console.log(`${this.colors.blue}📋 Widget Inventory${this.colors.reset}\n`);

    const projectRoot = process.cwd();
    const iosDir = path.join(projectRoot, "ios");

    if (!fs.existsSync(iosDir)) {
      throw new Error("iOS directory not found - not a React Native project?");
    }

    const contents = fs.readdirSync(iosDir);
    const widgets = [];

    // Find potential widget directories
    for (const item of contents) {
      const itemPath = path.join(iosDir, item);
      const stat = fs.statSync(itemPath);

      if (stat.isDirectory()) {
        const infoPlistPath = path.join(itemPath, "Info.plist");

        if (fs.existsSync(infoPlistPath)) {
          const content = fs.readFileSync(infoPlistPath, "utf8");

          if (content.includes("com.apple.widgetkit-extension")) {
            // This is a widget!
            const hasLiveActivity = content.includes("NSSupportsLiveActivities");

            widgets.push({
              name: item,
              path: itemPath,
              hasLiveActivity,
              files: fs.readdirSync(itemPath).filter((f) => f.endsWith(".swift")),
            });
          }
        }
      }
    }

    if (widgets.length === 0) {
      console.log(`${this.colors.yellow}⚠ No widgets found in this project${this.colors.reset}`);
      console.log(
        `${this.colors.dim}Create one with:${this.colors.reset} ${this.colors.cyan}npx react-native-dynamic-activities wizard${this.colors.reset}\n`,
      );
      return;
    }

    console.log(`Found ${widgets.length} widget${widgets.length > 1 ? "s" : ""}:\n`);

    for (let index = 0; index < widgets.length; index++) {
      const widget = widgets[index];
      const icon = widget.hasLiveActivity ? "🔴" : "📱";
      const type = widget.hasLiveActivity ? "Live Activity" : "Standard Widget";

      console.log(`${icon} ${this.colors.bold}${widget.name}${this.colors.reset} (${type})`);
      console.log(`   Path: ${this.colors.dim}ios/${widget.name}/${this.colors.reset}`);
      console.log(`   Files: ${widget.files.join(", ")}`);

      if (index < widgets.length - 1) console.log("");
    }

    console.log(`\n${this.colors.green}💡 Commands:${this.colors.reset}`);
    for (const widget of widgets) {
      console.log(
        `   Verify: ${this.colors.cyan}npx react-native-dynamic-activities verify --widget=${widget.name}${this.colors.reset}`,
      );
    }
  }

  showHelp() {
    console.log(`
${this.colors.bold}React Native Dynamic Activities CLI${this.colors.reset}

${this.colors.bold}Commands:${this.colors.reset}
`);

    for (const [cmd, def] of Object.entries(this.commands)) {
      console.log(`  ${this.colors.cyan}${cmd.padEnd(12)}${this.colors.reset} ${def.description}`);
    }

    console.log(`
${this.colors.bold}Examples:${this.colors.reset}
  ${this.colors.green}npx react-native-dynamic-activities wizard${this.colors.reset}
    Interactive wizard for complete widget creation

  ${this.colors.green}npx react-native-dynamic-activities create --name=Timer --activity=TimerActivity${this.colors.reset}
    Quick widget creation with custom names

  ${this.colors.green}npx react-native-dynamic-activities setup-xcode --widget=Timer${this.colors.reset}
    Automatically configure Xcode project for existing widget

  ${this.colors.green}npx react-native-dynamic-activities verify --widget=Timer${this.colors.reset}
    Check if widget is properly configured

  ${this.colors.green}npx react-native-dynamic-activities doctor${this.colors.reset}
    Diagnose development environment issues

${this.colors.bold}Global Flags:${this.colors.reset}
  ${this.colors.yellow}--help${this.colors.reset}        Show help for specific command
  ${this.colors.yellow}--version${this.colors.reset}     Show version information
  ${this.colors.yellow}--verbose${this.colors.reset}     Enable detailed output

${this.colors.bold}Need More Help?${this.colors.reset}
  📚 Documentation: https://github.com/pieczasz/react-native-dynamic-activities
  🐛 Issues: https://github.com/pieczasz/react-native-dynamic-activities/issues
  💬 Discussions: https://github.com/pieczasz/react-native-dynamic-activities/discussions
`);
  }

  // Utility method to extract argument values
  getArgValue(args, argName) {
    const arg = args.find((a) => a.startsWith(`${argName}=`));
    return arg ? arg.split("=")[1] : null;
  }
}

// Main execution
if (require.main === module) {
  const cli = new DynamicActivitiesCLI();
  cli.run().catch((error) => {
    console.error(`${cli.colors.red}Fatal error: ${error.message}${cli.colors.reset}`);
    process.exit(1);
  });
}

module.exports = DynamicActivitiesCLI;
