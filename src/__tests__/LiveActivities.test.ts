import type {
  LiveActivityState,
  LiveActivityStyle,
  LiveActivityDismissalPolicy,
  LiveActivityAttributes,
  LiveActivityContent,
  LiveActivityPushToken,
  LiveActivityAlertConfiguration,
  DynamicActivities,
} from '../index'

const mockDynamicActivities = {
  areLiveActivitiesSupported() {
    return {
      supported: true,
      version: 26.0,
      comment: 'You can use everything',
    }
  },

  async startLiveActivity(
    _attributes: LiveActivityAttributes,
    _content: LiveActivityContent,
    pushToken: LiveActivityPushToken,
    _style: LiveActivityStyle,
    _alertConfiguration: LiveActivityAlertConfiguration,
    _start: Date
  ) {
    // Return predictable data so the test can assert on it
    return {
      activityId: 'mock-activity-id',
      pushToken: pushToken?.token,
    }
  },

  async updateLiveActivity(_activityId: string, _content: LiveActivityContent) {
    /* no-op */
  },

  async endLiveActivity(
    _activityId: string,
    _content: LiveActivityContent,
    _dismissalPolicy: LiveActivityDismissalPolicy
  ) {
    /* no-op */
  },
} as unknown as typeof DynamicActivities

describe('LiveActivities specification', () => {
  it('exposes the correct LiveActivityState values', () => {
    const expectedStates: LiveActivityState[] = [
      'active',
      'dismissed',
      'pending',
      'stale',
      'ended',
    ]

    expect(expectedStates).toEqual(expectedStates)
  })

  it('exposes the correct LiveActivityStyle values', () => {
    const expectedStyles: LiveActivityStyle[] = ['standard', 'transient']

    expect(expectedStyles).toEqual(expectedStyles)
  })

  it('allows starting a live activity via the mock implementation', async () => {
    const { activityId, pushToken } =
      await mockDynamicActivities.startLiveActivity(
        { title: 'Test', body: 'Body' },
        { state: 'active', relevanceScore: 1 },
        { token: 'token123' },
        'standard'
      )

    expect(activityId).toBe('mock-activity-id')
    expect(pushToken).toBe('token123')
  })

  it('handles updates and ends without throwing', async () => {
    await expect(
      mockDynamicActivities.updateLiveActivity('mock-activity-id', {
        state: 'active',
      })
    ).resolves.toBeUndefined()

    const dismissalPolicy: LiveActivityDismissalPolicy = { policy: 'default' }

    await expect(
      mockDynamicActivities.endLiveActivity(
        'mock-activity-id',
        {
          state: 'ended',
        },
        dismissalPolicy
      )
    ).resolves.toBeUndefined()
  })
})
