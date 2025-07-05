import type { HybridObject } from 'react-native-nitro-modules'

export interface LiveActivityAttributes {
  title: string
  body: string
}

export type LiveActivityState =
  | 'active'
  | 'dismissed'
  | 'pending'
  | 'stale'
  | 'ended'

export interface LiveActivityContent {
  state: LiveActivityState
  staleDate?: Date
  relevanceScore?: number
}

export interface LiveActivityPushToken {
  token: string
  channel: string
}

export type LiveActivityStyle = 'standard' | 'transient'

export interface LiveActivityAlertConfiguration {
  title: string
  body: string
  sound: string
}

export type LiveActivityDismissalPolicy =
  | { policy: 'default' }
  | { policy: 'immediate' }
  | { policy: 'after'; date: Date }

export interface PushTokenUpdateEvent {
  activityId: string
  token: string
}

export interface DynamicActivities
  extends HybridObject<{ ios: 'swift'; android: 'kotlin' }> {
  /**
   * Check if Live Activities are supported on this device
   * @returns true if Live Activities are supported, false otherwise
   */
  areLiveActivitiesSupported(): boolean

  /**
   * Start a new Live Activity
   * @param attributes - The attributes for the Live Activity
   * @param content - The initial content for the Live Activity
   * @param pushToken - Optional push token for remote updates
   * @param style - Optional style (iOS 18.0+)
   * @param alertConfiguration - Optional alert configuration (iOS 26.0+)
   * @param start - Optional start date (iOS 26.0+)
   * @returns Promise with activity ID and push token
   * @throws {LiveActivityError} When authorization fails, content is invalid, or system is unavailable
   */
  startLiveActivity(
    attributes: LiveActivityAttributes,
    content: LiveActivityContent,
    pushToken?: LiveActivityPushToken,

    style?: LiveActivityStyle,
    alertConfiguration?: LiveActivityAlertConfiguration,
    start?: Date
  ): Promise<{ activityId: string; pushToken?: string }>

  /**
   * Update an existing Live Activity
   * @param activityId - The ID of the activity to update
   * @param content - The new content for the Live Activity
   * @param alertConfiguration - Optional alert configuration (iOS 16.2+ not 26.0+ as in request)
   * @param timestamp - Optional timestamp (iOS 17.2+)
   * @throws {LiveActivityError} When activity is not found, already ended, or content is invalid
   */
  updateLiveActivity(
    activityId: string,
    content: LiveActivityContent,
    alertConfiguration?: LiveActivityAlertConfiguration,
    timestamp?: Date
  ): Promise<void>

  /**
   * End a Live Activity
   * @param activityId - The ID of the activity to end
   * @param content - The final content for the Live Activity
   * @param dismissalPolicy - Optional dismissal policy
   * @throws {LiveActivityError} When activity is not found or already ended
   */
  endLiveActivity(
    activityId: string,
    content: LiveActivityContent,
    dismissalPolicy?: LiveActivityDismissalPolicy
  ): Promise<void>
}
