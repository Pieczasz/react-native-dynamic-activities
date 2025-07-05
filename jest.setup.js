// Global Jest setup for React Native Dynamic Activities

// Mock the react-native-nitro-modules package
jest.mock('react-native-nitro-modules', () => ({
  NitroModules: {
    createHybridObject: jest.fn((name) => {
      if (name === 'DynamicActivities') {
        return {
          areLiveActivitiesSupported: jest.fn(() => true),
          startLiveActivity: jest.fn(() =>
            Promise.resolve({ activityId: 'test-activity-id' })
          ),
          updateLiveActivity: jest.fn(() => Promise.resolve()),
          endLiveActivity: jest.fn(() => Promise.resolve()),
        }
      }
      return {}
    }),
  },
}))

// Suppress console warnings and errors in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
}

// Mock native modules that might be used in tests
jest.mock('react-native', () => ({
  NativeModules: {},
  Platform: {
    OS: 'ios',
    select: jest.fn((options) => options.ios),
  },
}))
