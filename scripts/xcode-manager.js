#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");

/**
 * Automatic Xcode Project Manager
 * Handles Widget Extension target creation and configuration
 */
class XcodeManager {
  constructor() {
    this.projectRoot = process.cwd();
    this.iosDir = path.join(this.projectRoot, "ios");
  }

  colors = {
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
    blue: "\x1b[34m",
    cyan: "\x1b[36m",
    bold: "\x1b[1m",
    reset: "\x1b[0m",
  };

  log = {
    info: (msg) => console.log(`${this.colors.blue}ℹ${this.colors.reset} ${msg}`),
    success: (msg) => console.log(`${this.colors.green}✓${this.colors.reset} ${msg}`),
    warning: (msg) => console.log(`${this.colors.yellow}⚠${this.colors.reset} ${msg}`),
    error: (msg) => console.log(`${this.colors.red}✗${this.colors.reset} ${msg}`),
    title: (msg) =>
      console.log(`\n${this.colors.bold}${this.colors.cyan}${msg}${this.colors.reset}\n`),
  };

  async setupWidget(widgetName, bundleId, widgetFiles) {
    this.log.title("🔧 Automatic Xcode Setup");

    try {
      // Find Xcode project
      const xcodeproj = this.findXcodeProject();
      if (!xcodeproj) {
        throw new Error("No Xcode project found");
      }

      this.log.info(`Found project: ${xcodeproj}`);

      // Check if we can modify the project
      await this.validateXcodeProject(xcodeproj);

      // Try different approaches for Xcode modification
      const success = await this.tryXcodeModification(xcodeproj, widgetName, bundleId, widgetFiles);

      if (success) {
        this.log.success("Widget Extension target created successfully!");
        await this.configureMainAppCapabilities(xcodeproj);
        return true;
      }

      this.log.warning("Automatic setup failed - generating manual instructions");
      this.generateManualInstructions(widgetName, bundleId, widgetFiles);
      return false;
    } catch (error) {
      this.log.error(`Setup failed: ${error.message}`);
      this.generateManualInstructions(widgetName, bundleId, widgetFiles);
      return false;
    }
  }

  findXcodeProject() {
    const iosContents = fs.readdirSync(this.iosDir);
    return iosContents.find((item) => item.endsWith(".xcodeproj"));
  }

  async validateXcodeProject(xcodeproj) {
    const projectPath = path.join(this.iosDir, xcodeproj);
    const pbxprojPath = path.join(projectPath, "project.pbxproj");

    if (!fs.existsSync(pbxprojPath)) {
      throw new Error("project.pbxproj not found");
    }

    // Check if project is readable/writable
    try {
      fs.accessSync(pbxprojPath, fs.constants.R_OK | fs.constants.W_OK);
    } catch {
      throw new Error("Cannot read/write Xcode project file");
    }

    this.log.success("Xcode project validation passed");
  }

  async tryXcodeModification(xcodeproj, widgetName, bundleId, widgetFiles) {
    const methods = [
      () => this.useNodeXcode(xcodeproj, widgetName, bundleId, widgetFiles),
      () => this.useXcodebuild(xcodeproj, widgetName, bundleId, widgetFiles),
      () => this.usePBXProjManipulation(xcodeproj, widgetName, bundleId, widgetFiles),
    ];

    for (const method of methods) {
      try {
        this.log.info("Trying automatic project modification...");
        await method();
        return true;
      } catch (error) {
        this.log.warning(`Method failed: ${error.message}`);
      }
    }

    return false;
  }

  async useNodeXcode(xcodeproj, widgetName, bundleId, widgetFiles) {
    try {
      const xcode = require("xcode");
      const pbxprojPath = path.join(this.iosDir, xcodeproj, "project.pbxproj");
      const project = xcode.project(pbxprojPath);

      project.parseSync();

      // Add widget extension target
      const targetUuid = project.generateUuid();
      const productUuid = project.generateUuid();

      // Create the target
      project.addTarget(widgetName, "app_extension", widgetName, bundleId);

      // Add source files
      for (const file of widgetFiles) {
        if (file.endsWith(".swift")) {
          project.addSourceFile(
            path.join(widgetName, file),
            { target: targetUuid },
            project.findTargetKey(widgetName),
          );
        }
      }

      // Add frameworks
      project.addFramework("WidgetKit.framework", { target: targetUuid });
      project.addFramework("SwiftUI.framework", { target: targetUuid });

      // Write the project
      fs.writeFileSync(pbxprojPath, project.writeSync());

      this.log.success("Used node-xcode for project modification");
    } catch (error) {
      if (error.code === "MODULE_NOT_FOUND") {
        throw new Error("node-xcode not available - install with: npm install xcode");
      }
      throw error;
    }
  }

  async useXcodebuild(xcodeproj, widgetName, bundleId, widgetFiles) {
    try {
      // Check if xcodebuild is available
      execSync("which xcodebuild", { stdio: "pipe" });

      const projectPath = path.join(this.iosDir, xcodeproj);

      // This is a simplified approach - real implementation would be more complex
      const script = `
tell application "Xcode"
    set myProject to open POSIX file "${projectPath}"
    -- Add widget extension target
    -- This would require AppleScript automation which is complex
end tell
`;

      this.log.warning("xcodebuild automation not fully implemented yet");
      throw new Error("xcodebuild method not ready");
    } catch (error) {
      throw new Error(`xcodebuild not available: ${error.message}`);
    }
  }

  async usePBXProjManipulation(xcodeproj, widgetName, bundleId, widgetFiles) {
    // Direct pbxproj file manipulation (advanced but fragile)
    const pbxprojPath = path.join(this.iosDir, xcodeproj, "project.pbxproj");

    // This is very complex and error-prone
    // Would require deep understanding of pbxproj format
    throw new Error("Direct pbxproj manipulation not implemented - too risky");
  }

  async configureMainAppCapabilities(xcodeproj) {
    this.log.info("Configuring Live Activities capability...");

    try {
      // Try to find and modify entitlements
      const entitlementsPath = this.findEntitlementsFile(xcodeproj);

      if (entitlementsPath) {
        this.addLiveActivitiesEntitlement(entitlementsPath);
        this.log.success("Live Activities entitlement added");
      } else {
        this.log.warning("Entitlements file not found - manual configuration required");
      }
    } catch (error) {
      this.log.warning(`Capability configuration failed: ${error.message}`);
    }
  }

  findEntitlementsFile(xcodeproj) {
    const projectName = xcodeproj.replace(".xcodeproj", "");
    const possiblePaths = [
      path.join(this.iosDir, projectName, `${projectName}.entitlements`),
      path.join(this.iosDir, projectName, "entitlements.plist"),
      path.join(this.iosDir, `${projectName}.entitlements`),
    ];

    return possiblePaths.find((p) => fs.existsSync(p));
  }

  addLiveActivitiesEntitlement(entitlementsPath) {
    let content = fs.readFileSync(entitlementsPath, "utf8");

    // Check if already exists
    if (content.includes("com.apple.developer.live-activities")) {
      this.log.info("Live Activities entitlement already exists");
      return;
    }

    // Add the entitlement
    const entitlement = `\t<key>com.apple.developer.live-activities</key>
\t<true/>`;

    // Insert before closing </dict>
    content = content.replace("</dict>", `${entitlement}\n</dict>`);

    fs.writeFileSync(entitlementsPath, content);
  }

  generateManualInstructions(widgetName, bundleId, widgetFiles) {
    const instructionsPath = path.join(this.iosDir, "WIDGET_SETUP_INSTRUCTIONS.md");

    const instructions = `# Manual Widget Extension Setup

Automatic setup was not possible. Please follow these manual steps:

## 1. Add Widget Extension Target

1. Open your project in Xcode
2. File → New → Target...
3. Select **Widget Extension**
4. Configure:
   - Product Name: \`${widgetName}\`
   - Bundle Identifier: \`${bundleId}\`
   - Language: **Swift**
   - ✅ Check "Include Live Activity"

## 2. Replace Generated Files

Delete the auto-generated files and add these instead:

${widgetFiles.map((file) => `- \`${widgetName}/${file}\``).join("\n")}

## 3. Configure Main App

1. Select your main app target
2. Signing & Capabilities tab
3. Click **+ Capability**
4. Add **"Live Activities"**

## 4. Build Settings

- Set **iOS Deployment Target** to 16.2+
- Ensure **Swift Language Version** is 5.0+

## 5. Test

- Build and run on a **physical device**
- Live Activities don't work in Simulator

## Need Help?

Run: \`npx react-native-dynamic-activities doctor\`
`;

    fs.writeFileSync(instructionsPath, instructions);

    this.log.info(`📝 Manual setup instructions: ${instructionsPath}`);

    // Also show in console
    console.log(`\n${this.colors.yellow}📋 Manual Setup Required:${this.colors.reset}`);
    console.log("1. Open project in Xcode");
    console.log(
      `2. Add Widget Extension target: ${this.colors.cyan}${widgetName}${this.colors.reset}`,
    );
    console.log(`3. Bundle ID: ${this.colors.cyan}${bundleId}${this.colors.reset}`);
    console.log(`4. Replace generated files with ones in ios/${widgetName}/`);
    console.log("5. Add Live Activities capability to main app\n");
  }

  // Verification and diagnostics
  async verify(widgetName) {
    this.log.title("🔍 Widget Configuration Verification");

    const issues = [];
    const warnings = [];

    // Check widget directory exists
    const widgetDir = path.join(this.iosDir, widgetName);
    if (!fs.existsSync(widgetDir)) {
      issues.push(`Widget directory not found: ${widgetDir}`);
    } else {
      this.log.success(`Widget directory exists: ${widgetName}/`);

      // Check required files
      const requiredFiles = [`${widgetName}Bundle.swift`, "Info.plist"];

      for (const file of requiredFiles) {
        if (fs.existsSync(path.join(widgetDir, file))) {
          this.log.success(`✓ ${file}`);
        } else {
          issues.push(`Missing file: ${file}`);
        }
      }
    }

    // Check Xcode project
    const xcodeproj = this.findXcodeProject();
    if (xcodeproj) {
      this.log.success(`Xcode project found: ${xcodeproj}`);

      // Check if widget target exists in project
      try {
        const pbxprojPath = path.join(this.iosDir, xcodeproj, "project.pbxproj");
        const content = fs.readFileSync(pbxprojPath, "utf8");

        if (content.includes(widgetName)) {
          this.log.success("Widget target found in Xcode project");
        } else {
          warnings.push("Widget target not found in Xcode project - may need manual setup");
        }

        if (content.includes("com.apple.widgetkit-extension")) {
          this.log.success("WidgetKit extension configuration found");
        } else {
          warnings.push("WidgetKit extension configuration not found");
        }
      } catch (error) {
        warnings.push(`Could not read Xcode project: ${error.message}`);
      }
    } else {
      issues.push("No Xcode project found");
    }

    // Check main app entitlements
    const entitlementsPath = this.findEntitlementsFile(xcodeproj);
    if (entitlementsPath) {
      const content = fs.readFileSync(entitlementsPath, "utf8");
      if (content.includes("com.apple.developer.live-activities")) {
        this.log.success("Live Activities entitlement configured");
      } else {
        warnings.push("Live Activities entitlement not found - add manually in Xcode");
      }
    } else {
      warnings.push("Entitlements file not found");
    }

    // Summary
    console.log(`\n${this.colors.bold}Verification Summary:${this.colors.reset}`);

    if (issues.length === 0) {
      this.log.success("No critical issues found!");
    } else {
      console.log(`\n${this.colors.red}Issues (${issues.length}):${this.colors.reset}`);
      for (const issue of issues) {
        console.log(`  ✗ ${issue}`);
      }
    }

    if (warnings.length > 0) {
      console.log(`\n${this.colors.yellow}Warnings (${warnings.length}):${this.colors.reset}`);
      for (const warning of warnings) {
        console.log(`${warning}`);
      }
    }

    return issues.length === 0;
  }

  async doctor() {
    this.log.title("🩺 React Native Dynamic Activities Doctor");

    console.log("Checking development environment...\n");

    const checks = [
      () => this.checkNodeVersion(),
      () => this.checkReactNative(),
      () => this.checkiOSSetup(),
      () => this.checkXcode(),
      () => this.checkDependencies(),
      () => this.checkPlatformSupport(),
    ];

    const results = [];

    for (const check of checks) {
      try {
        const result = await check();
        results.push(result);
      } catch (error) {
        results.push({ status: "error", message: error.message });
      }
    }

    // Summary
    const passed = results.filter((r) => r.status === "pass").length;
    const warnings = results.filter((r) => r.status === "warning").length;
    const errors = results.filter((r) => r.status === "error").length;

    console.log(`\n${this.colors.bold}Doctor Summary:${this.colors.reset}`);
    console.log(`✓ ${passed} checks passed`);
    if (warnings > 0) console.log(`⚠ ${warnings} warnings`);
    if (errors > 0) console.log(`✗ ${errors} errors`);

    if (errors === 0 && warnings === 0) {
      console.log(
        `\n${this.colors.green}🎉 Everything looks good! You're ready to create Live Activities.${this.colors.reset}`,
      );
    } else if (errors === 0) {
      console.log(
        `\n${this.colors.yellow}⚠ Minor issues detected, but you should be able to proceed.${this.colors.reset}`,
      );
    } else {
      console.log(
        `\n${this.colors.red}❌ Please fix the errors above before proceeding.${this.colors.reset}`,
      );
    }
  }

  checkNodeVersion() {
    const version = process.version;
    const majorVersion = Number.parseInt(version.replace("v", "").split(".")[0]);

    if (majorVersion >= 18) {
      this.log.success(`Node.js version: ${version}`);
      return { status: "pass", check: "Node.js version" };
    }
  }

  checkReactNative() {
    try {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(this.projectRoot, "package.json"), "utf8"),
      );
      const rnVersion =
        packageJson.dependencies?.["react-native"] || packageJson.devDependencies?.["react-native"];

      if (rnVersion) {
        this.log.success(`React Native found: ${rnVersion}`);
        return { status: "pass", check: "React Native" };
      }
    } catch (error) {
      this.log.error(`Could not read package.json: ${error.message}`);
      return { status: "error", check: "React Native" };
    }
  }

  checkiOSSetup() {
    if (fs.existsSync(this.iosDir)) {
      this.log.success("iOS directory found");

      const xcodeproj = this.findXcodeProject();
      if (xcodeproj) {
        this.log.success(`Xcode project: ${xcodeproj}`);
        return { status: "pass", check: "iOS setup" };
      }
    } else {
      this.log.error("iOS directory not found");
      return { status: "error", check: "iOS setup" };
    }
  }

  checkXcode() {
    try {
      const xcodebuildVersion = execSync("xcodebuild -version", {
        encoding: "utf8",
        stdio: "pipe",
      }).trim();

      this.log.success(`Xcode: ${xcodebuildVersion.split("\n")[0]}`);
      return { status: "pass", check: "Xcode" };
    } catch (error) {
      this.log.warning("Xcode command line tools not found or not working");
      return { status: "warning", check: "Xcode" };
    }
  }

  checkDependencies() {
    try {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(this.projectRoot, "package.json"), "utf8"),
      );
      const nitroVersion =
        packageJson.dependencies?.["react-native-nitro-modules"] ||
        packageJson.devDependencies?.["react-native-nitro-modules"];

      if (nitroVersion) {
        this.log.success(`Nitro Modules: ${nitroVersion}`);
        return { status: "pass", check: "Dependencies" };
      }
    } catch (error) {
      this.log.error(`Could not check dependencies: ${error.message}`);
      return { status: "error", check: "Dependencies" };
    }
  }

  checkPlatformSupport() {
    const platform = process.platform;

    if (platform === "darwin") {
      this.log.success("Platform: macOS (iOS development supported)");
      return { status: "pass", check: "Platform support" };
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const manager = new XcodeManager();

  switch (command) {
    case "setup-xcode": {
      const widgetName = args.find((arg) => arg.startsWith("--widget="))?.split("=")[1];
      const bundleId = args.find((arg) => arg.startsWith("--bundle-id="))?.split("=")[1];
      const filesArg = args.find((arg) => arg.startsWith("--files="))?.split("=")[1];
      const files = filesArg ? filesArg.split(",") : [];

      if (!widgetName) {
        console.error("Error: --widget parameter required");
        process.exit(1);
      }

      await manager.setupWidget(widgetName, bundleId, files);
      break;
    }

    case "verify": {
      const verifyWidget = args.find((arg) => arg.startsWith("--widget="))?.split("=")[1];
      if (!verifyWidget) {
        console.error("Error: --widget parameter required");
        process.exit(1);
      }

      const isValid = await manager.verify(verifyWidget);
      process.exit(isValid ? 0 : 1);
      break;
    }

    case "doctor":
      await manager.doctor();
      break;

    default:
      console.log("Usage:");
      console.log(
        "  setup-xcode --widget=WidgetName [--bundle-id=com.app.widget] [--files=file1,file2]",
      );
      console.log("  verify --widget=WidgetName");
      console.log("  doctor");
      break;
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error("Error:", error.message);
    process.exit(1);
  });
}

module.exports = XcodeManager;
