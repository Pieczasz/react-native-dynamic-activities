import {
  LIVE_ACTIVITY_ERROR_DOMAIN,
  type LiveActivityAuthorizationError,
  LiveActivityErrorCode,
  LiveActivityErrorFactory,
  LiveActivityErrorMessages,
  LiveActivityErrorSeverity,
  LiveActivityErrorSeverityMap,
  LiveActivityRecoverySuggestions,
  getErrorSeverity,
  isAuthorizationError,
  isLiveActivityError,
  isSystemError,
} from "../index";

describe("Live Activities Error Handling", () => {
  describe("Error Codes", () => {
    it("should have Apple ActivityAuthorizationError codes matching exactly", () => {
      expect(LiveActivityErrorCode.ATTRIBUTES_TOO_LARGE).toBe("attributesTooLarge");
      expect(LiveActivityErrorCode.DENIED).toBe("denied");
      expect(LiveActivityErrorCode.GLOBAL_MAXIMUM_EXCEEDED).toBe("globalMaximumExceeded");
      expect(LiveActivityErrorCode.MALFORMED_ACTIVITY_IDENTIFIER).toBe(
        "malformedActivityIdentifier",
      );
      expect(LiveActivityErrorCode.MISSING_PROCESS_IDENTIFIER).toBe("missingProcessIdentifier");
      expect(LiveActivityErrorCode.PERSISTENCE_FAILURE).toBe("persistenceFailure");
      expect(LiveActivityErrorCode.RECONNECT_NOT_PERMITTED).toBe("reconnectNotPermitted");
      expect(LiveActivityErrorCode.TARGET_MAXIMUM_EXCEEDED).toBe("targetMaximumExceeded");
      expect(LiveActivityErrorCode.UNENTITLED).toBe("unentitled");
      expect(LiveActivityErrorCode.UNSUPPORTED).toBe("unsupported");
      expect(LiveActivityErrorCode.UNSUPPORTED_TARGET).toBe("unsupportedTarget");
      expect(LiveActivityErrorCode.VISIBILITY).toBe("visibility");
    });

    it("should have system error codes", () => {
      expect(LiveActivityErrorCode.NETWORK_ERROR).toBe("networkError");
      expect(LiveActivityErrorCode.UNKNOWN_ERROR).toBe("unknownError");
    });
  });

  describe("Error Messages", () => {
    it("should provide correct error messages matching Apple descriptions", () => {
      expect(LiveActivityErrorMessages[LiveActivityErrorCode.ATTRIBUTES_TOO_LARGE]).toBe(
        "The provided Live Activity attributes exceeded the maximum size of 4KB.",
      );
      expect(LiveActivityErrorMessages[LiveActivityErrorCode.DENIED]).toBe(
        "A person deactivated Live Activities in Settings.",
      );
      expect(LiveActivityErrorMessages[LiveActivityErrorCode.GLOBAL_MAXIMUM_EXCEEDED]).toBe(
        "The device reached the maximum number of ongoing Live Activities.",
      );
      expect(LiveActivityErrorMessages[LiveActivityErrorCode.MALFORMED_ACTIVITY_IDENTIFIER]).toBe(
        "The provided activity identifier is malformed.",
      );
      expect(LiveActivityErrorMessages[LiveActivityErrorCode.MISSING_PROCESS_IDENTIFIER]).toBe(
        "The process that tried to start the Live Activity is missing a process identifier.",
      );
      expect(LiveActivityErrorMessages[LiveActivityErrorCode.PERSISTENCE_FAILURE]).toBe(
        "The system couldn't persist the Live Activity.",
      );
      expect(LiveActivityErrorMessages[LiveActivityErrorCode.RECONNECT_NOT_PERMITTED]).toBe(
        "The process that tried to recreate the Live Activity is not the process that originally created the Live Activity.",
      );
      expect(LiveActivityErrorMessages[LiveActivityErrorCode.TARGET_MAXIMUM_EXCEEDED]).toBe(
        "The app has already started the maximum number of concurrent Live Activities.",
      );
      expect(LiveActivityErrorMessages[LiveActivityErrorCode.UNENTITLED]).toBe(
        "The app doesn't have the required entitlement to start a Live Activity.",
      );
      expect(LiveActivityErrorMessages[LiveActivityErrorCode.UNSUPPORTED]).toBe(
        "The device doesn't support Live Activities.",
      );
      expect(LiveActivityErrorMessages[LiveActivityErrorCode.UNSUPPORTED_TARGET]).toBe(
        "The app doesn't have the required entitlement to start Live Activities.",
      );
      expect(LiveActivityErrorMessages[LiveActivityErrorCode.VISIBILITY]).toBe(
        "The app tried to start the Live Activity while it was in the background.",
      );
      expect(LiveActivityErrorMessages[LiveActivityErrorCode.NETWORK_ERROR]).toBe(
        "A network error occurred while processing the request.",
      );
      expect(LiveActivityErrorMessages[LiveActivityErrorCode.UNKNOWN_ERROR]).toBe(
        "An unknown error occurred.",
      );
    });
  });

  describe("Recovery Suggestions", () => {
    it("should provide helpful recovery suggestions", () => {
      expect(LiveActivityRecoverySuggestions[LiveActivityErrorCode.ATTRIBUTES_TOO_LARGE]).toBe(
        "Reduce the size of the Live Activity attributes to under 4KB.",
      );
      expect(LiveActivityRecoverySuggestions[LiveActivityErrorCode.DENIED]).toBe(
        "Ask the user to enable Live Activities in Settings > [Your App] > Live Activities.",
      );
      expect(LiveActivityRecoverySuggestions[LiveActivityErrorCode.UNENTITLED]).toBe(
        "Ensure your app has the required Live Activity entitlement.",
      );
      expect(LiveActivityRecoverySuggestions[LiveActivityErrorCode.UNSUPPORTED]).toBe(
        "Live Activities require iOS 16.2 or later.",
      );
      expect(LiveActivityRecoverySuggestions[LiveActivityErrorCode.VISIBILITY]).toBe(
        "Start Live Activities only when your app is in the foreground.",
      );
    });
  });

  describe("Error Factory Functions", () => {
    describe("createAuthorizationError", () => {
      it("should create proper authorization error objects", () => {
        const error = LiveActivityErrorFactory.createAuthorizationError(
          LiveActivityErrorCode.DENIED,
          "Test error message",
        );

        expect(error).toHaveProperty("code", LiveActivityErrorCode.DENIED);
        expect(error).toHaveProperty("message", "Test error message");
        expect(error).toHaveProperty("timestamp");
        expect(error.timestamp).toBeInstanceOf(Date);
        expect(error.nativeError).toBeUndefined();
      });

      it("should create authorization error with options", () => {
        const nativeError = new Error("Native error");
        const error = LiveActivityErrorFactory.createAuthorizationError(
          LiveActivityErrorCode.ATTRIBUTES_TOO_LARGE,
          "Attributes too large",
          {
            failureReason: "Data exceeds 4KB limit",
            recoverySuggestion: "Reduce data size",
            nativeError,
            activityId: "test-activity-id",
            errorCode: 1001,
            errorDomain: "com.example.app",
          },
        );

        expect(error).toHaveProperty("code", LiveActivityErrorCode.ATTRIBUTES_TOO_LARGE);
        expect(error).toHaveProperty("message", "Attributes too large");
        expect(error).toHaveProperty("failureReason", "Data exceeds 4KB limit");
        expect(error).toHaveProperty("recoverySuggestion", "Reduce data size");
        expect(error).toHaveProperty("nativeError", nativeError);
        expect(error).toHaveProperty("activityId", "test-activity-id");
        expect(error).toHaveProperty("errorCode", 1001);
        expect(error).toHaveProperty("errorDomain", "com.example.app");
        expect(error).toHaveProperty("timestamp");
      });

      it("should use default message when none provided", () => {
        const error = LiveActivityErrorFactory.createAuthorizationError(
          LiveActivityErrorCode.DENIED,
        );

        expect(error.message).toBe(LiveActivityErrorMessages[LiveActivityErrorCode.DENIED]);
      });

      it("should create authorization error for all valid codes", () => {
        const authCodes: LiveActivityAuthorizationError["code"][] = [
          LiveActivityErrorCode.ATTRIBUTES_TOO_LARGE,
          LiveActivityErrorCode.DENIED,
          LiveActivityErrorCode.GLOBAL_MAXIMUM_EXCEEDED,
          LiveActivityErrorCode.MALFORMED_ACTIVITY_IDENTIFIER,
          LiveActivityErrorCode.MISSING_PROCESS_IDENTIFIER,
          LiveActivityErrorCode.PERSISTENCE_FAILURE,
          LiveActivityErrorCode.RECONNECT_NOT_PERMITTED,
          LiveActivityErrorCode.TARGET_MAXIMUM_EXCEEDED,
          LiveActivityErrorCode.UNENTITLED,
          LiveActivityErrorCode.UNSUPPORTED,
          LiveActivityErrorCode.UNSUPPORTED_TARGET,
          LiveActivityErrorCode.VISIBILITY,
        ];

        for (const code of authCodes) {
          const error = LiveActivityErrorFactory.createAuthorizationError(code, "Test message");
          expect(error.code).toBe(code);
          expect(error.message).toBe("Test message");
        }
      });
    });

    describe("createSystemError", () => {
      it("should create system error", () => {
        const error = LiveActivityErrorFactory.createSystemError(
          LiveActivityErrorCode.NETWORK_ERROR,
          "Network error occurred",
        );

        expect(error).toHaveProperty("code", LiveActivityErrorCode.NETWORK_ERROR);
        expect(error).toHaveProperty("message", "Network error occurred");
        expect(error).toHaveProperty("timestamp");
      });

      it("should create system error with options", () => {
        const error = LiveActivityErrorFactory.createSystemError(
          LiveActivityErrorCode.UNKNOWN_ERROR,
          "Unknown error",
          {
            failureReason: "Unexpected condition",
            recoverySuggestion: "Try again",
            activityId: "test-activity-id",
          },
        );

        expect(error).toHaveProperty("code", LiveActivityErrorCode.UNKNOWN_ERROR);
        expect(error).toHaveProperty("message", "Unknown error");
        expect(error).toHaveProperty("failureReason", "Unexpected condition");
        expect(error).toHaveProperty("recoverySuggestion", "Try again");
        expect(error).toHaveProperty("activityId", "test-activity-id");
      });
    });

    describe("createErrorFromNativeError", () => {
      it("should create error from native error object", () => {
        const nativeError = {
          code: "denied",
          localizedDescription: "Live Activities are disabled",
          failureReason: "User disabled in settings",
          recoverySuggestion: "Enable in Settings",
          errorCode: 1000,
          errorDomain: "ActivityKit",
        };

        const error = LiveActivityErrorFactory.createErrorFromNativeError(
          nativeError,
          "test-activity-id",
        );

        expect(error).toHaveProperty("code", LiveActivityErrorCode.DENIED);
        expect(error).toHaveProperty("message", "Live Activities are disabled");
        expect(error).toHaveProperty("failureReason", "User disabled in settings");
        expect(error).toHaveProperty("recoverySuggestion", "Enable in Settings");
        expect(error).toHaveProperty("activityId", "test-activity-id");
        expect(error).toHaveProperty("errorCode", 1000);
        expect(error).toHaveProperty("errorDomain", "ActivityKit");
      });

      it("should handle unknown native error codes", () => {
        const nativeError = {
          code: "unknownCode",
          localizedDescription: "Unknown error",
        };

        const error = LiveActivityErrorFactory.createErrorFromNativeError(nativeError);

        expect(error).toHaveProperty("code", LiveActivityErrorCode.UNKNOWN_ERROR);
        expect(error).toHaveProperty("message", "Unknown error");
      });

      it("should handle invalid native error input", () => {
        const error = LiveActivityErrorFactory.createErrorFromNativeError("invalid");

        expect(error).toHaveProperty("code", LiveActivityErrorCode.UNKNOWN_ERROR);
        expect(error).toHaveProperty("message", "An unknown error occurred");
      });
    });
  });

  describe("Type Guards", () => {
    it("should identify live activity errors", () => {
      const error = LiveActivityErrorFactory.createAuthorizationError(
        LiveActivityErrorCode.DENIED,
        "Test message",
      );

      expect(isLiveActivityError(error)).toBe(true);
      expect(isLiveActivityError(new Error("Regular error"))).toBe(false);
      expect(isLiveActivityError(null)).toBe(false);
      expect(isLiveActivityError(undefined)).toBe(false);
    });

    it("should identify authorization errors", () => {
      const authError = LiveActivityErrorFactory.createAuthorizationError(
        LiveActivityErrorCode.DENIED,
        "Test message",
      );
      const systemError = LiveActivityErrorFactory.createSystemError(
        LiveActivityErrorCode.NETWORK_ERROR,
        "Network error",
      );

      expect(isAuthorizationError(authError)).toBe(true);
      expect(isAuthorizationError(systemError)).toBe(false);
    });

    it("should identify system errors", () => {
      const authError = LiveActivityErrorFactory.createAuthorizationError(
        LiveActivityErrorCode.DENIED,
        "Test message",
      );
      const systemError = LiveActivityErrorFactory.createSystemError(
        LiveActivityErrorCode.NETWORK_ERROR,
        "Network error",
      );

      expect(isSystemError(authError)).toBe(false);
      expect(isSystemError(systemError)).toBe(true);
    });
  });

  describe("Error Severity", () => {
    it("should have correct severity mappings", () => {
      expect(LiveActivityErrorSeverityMap[LiveActivityErrorCode.DENIED]).toBe(
        LiveActivityErrorSeverity.HIGH,
      );
      expect(LiveActivityErrorSeverityMap[LiveActivityErrorCode.UNENTITLED]).toBe(
        LiveActivityErrorSeverity.CRITICAL,
      );
      expect(LiveActivityErrorSeverityMap[LiveActivityErrorCode.UNSUPPORTED]).toBe(
        LiveActivityErrorSeverity.CRITICAL,
      );
      expect(LiveActivityErrorSeverityMap[LiveActivityErrorCode.NETWORK_ERROR]).toBe(
        LiveActivityErrorSeverity.LOW,
      );
      expect(LiveActivityErrorSeverityMap[LiveActivityErrorCode.ATTRIBUTES_TOO_LARGE]).toBe(
        LiveActivityErrorSeverity.MEDIUM,
      );
    });

    it("should return correct severity for errors", () => {
      const criticalError = LiveActivityErrorFactory.createAuthorizationError(
        LiveActivityErrorCode.UNENTITLED,
        "Not entitled",
      );
      const lowError = LiveActivityErrorFactory.createSystemError(
        LiveActivityErrorCode.NETWORK_ERROR,
        "Network issue",
      );

      expect(getErrorSeverity(criticalError)).toBe(LiveActivityErrorSeverity.CRITICAL);
      expect(getErrorSeverity(lowError)).toBe(LiveActivityErrorSeverity.LOW);
    });
  });

  describe("Error Domain", () => {
    it("should have correct error domain", () => {
      expect(LIVE_ACTIVITY_ERROR_DOMAIN).toBe("com.dynamicactivities.liveactivities");
    });
  });

  describe("Error Object Structure", () => {
    it("should create error objects with proper TypeScript types", () => {
      const error = LiveActivityErrorFactory.createAuthorizationError(
        LiveActivityErrorCode.DENIED,
        "Test message",
      );

      expect(typeof error.code).toBe("string");
      expect(typeof error.message).toBe("string");
      expect(error.timestamp).toBeInstanceOf(Date);
      expect(error.activityId).toBeUndefined();
    });

    it("should have all required properties in error objects", () => {
      const error = LiveActivityErrorFactory.createAuthorizationError(
        LiveActivityErrorCode.DENIED,
        "Test message",
      );

      expect(error).toHaveProperty("code");
      expect(error).toHaveProperty("message");
      expect(error).toHaveProperty("timestamp");
      expect(error.timestamp).toBeInstanceOf(Date);
    });
  });

  describe("Error Code Values", () => {
    it("should have proper string values for error codes", () => {
      const errorCodes = Object.values(LiveActivityErrorCode);

      for (const code of errorCodes) {
        expect(typeof code).toBe("string");
        expect(code.length).toBeGreaterThan(0);
        expect(code).toMatch(/^[A-Za-z]+$/); // Should be alphanumeric (camelCase)
      }
    });

    it("should have unique error code values", () => {
      const errorCodes = Object.values(LiveActivityErrorCode);
      const uniqueCodes = new Set(errorCodes);

      expect(uniqueCodes.size).toBe(errorCodes.length);
    });
  });

  describe("Error Completeness", () => {
    it("should have error messages for all error codes", () => {
      const errorCodes = Object.values(LiveActivityErrorCode);

      for (const code of errorCodes) {
        expect(LiveActivityErrorMessages[code]).toBeDefined();
        expect(typeof LiveActivityErrorMessages[code]).toBe("string");
        expect(LiveActivityErrorMessages[code].length).toBeGreaterThan(0);
      }
    });

    it("should have recovery suggestions for all error codes", () => {
      const errorCodes = Object.values(LiveActivityErrorCode);

      for (const code of errorCodes) {
        expect(LiveActivityRecoverySuggestions[code]).toBeDefined();
        expect(typeof LiveActivityRecoverySuggestions[code]).toBe("string");
        expect(LiveActivityRecoverySuggestions[code].length).toBeGreaterThan(0);
      }
    });

    it("should have severity mappings for all error codes", () => {
      const errorCodes = Object.values(LiveActivityErrorCode);

      for (const code of errorCodes) {
        expect(LiveActivityErrorSeverityMap[code]).toBeDefined();
        expect(Object.values(LiveActivityErrorSeverity)).toContain(
          LiveActivityErrorSeverityMap[code],
        );
      }
    });
  });
});
