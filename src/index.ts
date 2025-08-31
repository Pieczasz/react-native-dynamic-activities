import { NitroModules } from "react-native-nitro-modules";
import type { DynamicActivities as DynamicActivitiesSpec } from "./specs/LiveActivities.nitro";

export const DynamicActivities =
  NitroModules.createHybridObject<DynamicActivitiesSpec>("DynamicActivities");

export type {
  LiveActivityAlertConfiguration,
  LiveActivityAttributes,
  LiveActivityContent,
  LiveActivityDismissalPolicy,
  LiveActivityPushToken,
  LiveActivityState,
  LiveActivityStyle,
  PushTokenUpdateEvent,
} from "./specs/LiveActivities.nitro";

export type {
  LiveActivityAuthorizationError,
  LiveActivityError,
  LiveActivityErrorInfo,
  LiveActivitySystemError,
} from "./specs/LiveActivitiesErrors.nitro";

export {
  getErrorSeverity,
  isAuthorizationError,
  isLiveActivityError,
  isSystemError,
  LIVE_ACTIVITY_ERROR_DOMAIN,
  LiveActivityErrorCode,
  LiveActivityErrorFactory,
  LiveActivityErrorMessages,
  LiveActivityErrorSeverity,
  LiveActivityErrorSeverityMap,
  LiveActivityRecoverySuggestions,
} from "./specs/LiveActivitiesErrors.nitro";
