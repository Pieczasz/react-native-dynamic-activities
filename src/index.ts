import { NitroModules } from "react-native-nitro-modules";
import type { DynamicActivities as DynamicActivitiesSpec } from "./specs/LiveActivities.nitro";

export const DynamicActivities =
  NitroModules.createHybridObject<DynamicActivitiesSpec>("DynamicActivities");

export type {
  LiveActivityAttributes,
  LiveActivityContent,
  LiveActivityPushToken,
  LiveActivityAlertConfiguration,
  LiveActivityDismissalPolicy,
  LiveActivityStyle,
  LiveActivityState,
  PushTokenUpdateEvent,
} from "./specs/LiveActivities.nitro";

export type {
  LiveActivityError,
  LiveActivityErrorInfo,
  LiveActivityAuthorizationError,
  LiveActivitySystemError,
} from "./specs/LiveActivitiesErrors.nitro";

export {
  LiveActivityErrorCode,
  LiveActivityErrorFactory,
  LiveActivityErrorMessages,
  LiveActivityRecoverySuggestions,
  LiveActivityErrorSeverity,
  LiveActivityErrorSeverityMap,
  isLiveActivityError,
  isAuthorizationError,
  isSystemError,
  getErrorSeverity,
  LIVE_ACTIVITY_ERROR_DOMAIN,
} from "./specs/LiveActivitiesErrors.nitro";
