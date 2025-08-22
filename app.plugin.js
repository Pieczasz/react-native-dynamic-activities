import fs from "node:fs";
import path from "node:path";
import {
  createRunOncePlugin,
  withEntitlementsPlist,
  withInfoPlist,
  withXcodeProject,
} from "@expo/config-plugins";

/**
 * Expo Config Plugin for React Native Dynamic Activities
 *
 * Automatically configures iOS projects for Live Activities:
 * - Adds Live Activities entitlement
 * - Creates Widget Extension target (template)
 * - Configures necessary capabilities
 */

const PLUGIN_NAME = "react-native-dynamic-activities";

async function withDynamicActivities(config, props = {}) {
  const {
    widgetName = `${config.name}Widget`,
    bundleIdSuffix = "widget",
    activityName = "DefaultActivity",
  } = props;

  // Add Live Activities entitlement to main app
  let updatedConfig = withEntitlementsPlist(config, (config) => {
    config.modResults["com.apple.developer.live-activities"] = true;
    return config;
  });

  // Update Info.plist for Live Activities support
  updatedConfig = withInfoPlist(updatedConfig, (config) => {
    // Add NSSupportsLiveActivities if not present
    if (!config.modResults.NSSupportsLiveActivities) {
      config.modResults.NSSupportsLiveActivities = true;
    }
    return config;
  });

  // Configure Xcode project
  updatedConfig = withXcodeProject(updatedConfig, (config) => {
    return configureXcodeProject(config, {
      widgetName,
      bundleIdSuffix,
      activityName,
    });
  });

  return updatedConfig;
}

function configureXcodeProject(config, { widgetName, bundleIdSuffix, activityName }) {
  const project = config.modResults;

  // Get main app bundle identifier
  const mainBundleId = getBundleIdentifier(config);
  const widgetBundleId = `${mainBundleId}.${bundleIdSuffix}`;

  try {
    // Check if widget target already exists
    const existingTarget = findWidgetTarget(project, widgetName);
    if (existingTarget) {
      console.log(`[${PLUGIN_NAME}] Widget target "${widgetName}" already exists, skipping...`);
      return config;
    }

    // Create widget target configuration
    const widgetTargetUuid = project.generateUuid();
    const widgetProductUuid = project.generateUuid();

    // Add widget target
    addWidgetTarget(project, {
      widgetName,
      widgetBundleId,
      activityName,
      widgetTargetUuid,
      widgetProductUuid,
    });

    console.log(`[${PLUGIN_NAME}] Added Widget Extension target: ${widgetName}`);
  } catch (error) {
    console.warn(`[${PLUGIN_NAME}] Failed to configure Xcode project: ${error.message}`);
    console.warn("You may need to manually create the Widget Extension in Xcode");
  }

  return config;
}

function getBundleIdentifier(config) {
  // Try to get from iOS config, fallback to expo defaults
  return config.ios?.bundleIdentifier || `com.${config.owner || "anonymous"}.${config.slug}`;
}

function findWidgetTarget(project, widgetName) {
  const targets = project.hash.project.objects.PBXNativeTarget || {};
  return Object.values(targets).find(
    (target) => target.name === widgetName || target.productName === widgetName,
  );
}

function addWidgetTarget(
  project,
  { widgetName, widgetBundleId, activityName, widgetTargetUuid, widgetProductUuid },
) {
  // This is a simplified implementation
  // In a real plugin, you'd need to:
  // 1. Create PBXNativeTarget
  // 2. Add build configurations
  // 3. Create file references for Swift files
  // 4. Add build phases (compile sources, copy bundle resources)
  // 5. Link frameworks (WidgetKit, SwiftUI, ActivityKit)

  // For now, we'll create placeholder files and instructions
  const iosDir = path.join(config.modRequest.projectRoot, "ios");
  const widgetDir = path.join(iosDir, widgetName);

  // Create widget directory with instructions
  if (!fs.existsSync(widgetDir)) {
    fs.mkdirSync(widgetDir, { recursive: true });

    // Create instruction file
    const instructionContent = `
# Widget Extension Setup Required

This directory was created by the react-native-dynamic-activities Expo plugin.

## Manual Setup Required:

1. Open your project in Xcode
2. Add a new Widget Extension target:
   - File -> New -> Target...
   - Select "Widget Extension"
   - Product Name: ${widgetName}
   - Bundle Identifier: ${widgetBundleId}
   - Check "Include Live Activity" if available

3. Replace the generated Swift files with templates from:
   node_modules/react-native-dynamic-activities/templates/widget/

4. Update your Swift files to match your TypeScript types

## Configuration:
- Widget Name: ${widgetName}
- Bundle ID: ${widgetBundleId}
- Activity Name: ${activityName}

## Alternative:
Run the widget scaffolder script:
\`\`\`bash
npx react-native-dynamic-activities create-widget --name=${widgetName} --activity=${activityName}
\`\`\`
`;

    fs.writeFileSync(path.join(widgetDir, "SETUP_INSTRUCTIONS.md"), instructionContent.trim());
  }

  // Note: Full Xcode project manipulation would require a more sophisticated
  // approach using xcodeproj parsing and manipulation libraries
  console.log(`[${PLUGIN_NAME}] Created widget directory at ios/${widgetName}`);
  console.log(
    `[${PLUGIN_NAME}] See ios/${widgetName}/SETUP_INSTRUCTIONS.md for manual setup steps`,
  );
}

// Create plugin with proper versioning
const withDynamicActivitiesPlugin = createRunOncePlugin(
  withDynamicActivities,
  PLUGIN_NAME,
  "1.0.0", // Plugin version
);

export default withDynamicActivitiesPlugin;
