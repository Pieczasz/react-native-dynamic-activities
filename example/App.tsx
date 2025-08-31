import { useEffect, useRef, useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import {
  DynamicActivities,
  type LiveActivityAttributes,
  type LiveActivityContent,
  type LiveActivityDismissalPolicy,
} from "react-native-dynamic-activities";

function App(): React.JSX.Element {
  const [supported, setSupported] = useState<string>("checking...");
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const activityIdRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let mounted = true;
    DynamicActivities.areLiveActivitiesSupported().then((info) => {
      if (!mounted) return;
      setSupported(`${info.supported ? "Yes" : "No"} (iOS ${info.version})`);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isRunning) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(async () => {
      setTimeLeft((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          timerRef.current = null;
          setIsRunning(false);
          if (activityIdRef.current) {
            const finalContent: LiveActivityContent = { state: "ended" };
            const policy: LiveActivityDismissalPolicy = "immediate";
            // Fire and forget
            DynamicActivities.endLiveActivity(activityIdRef.current, finalContent, policy).catch(
              () => {},
            );
            activityIdRef.current = null;
          }
          return 0;
        }
        // Push Live Activity update (ignore errors for demo)
        if (activityIdRef.current) {
          const content: LiveActivityContent = {
            state: "active",
            relevanceScore: Math.max(0, next / 30),
          };
          DynamicActivities.updateLiveActivity(activityIdRef.current, content).catch(() => {});
        }
        return next;
      });
    }, 1000);
    return () => {
      timerRef.current && clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const start = async () => {
    setTimeLeft(30);
    setIsRunning(true);

    const attributes: LiveActivityAttributes = {
      title: "Timer",
      body: "Counting down",
    };
    const content: LiveActivityContent = {
      state: "active",
      relevanceScore: 1,
    };
    try {
      const result = await DynamicActivities.startLiveActivity(attributes, content);
      activityIdRef.current = result.activityId;
    } catch (e) {
      console.warn("startLiveActivity failed", e);
      setIsRunning(false);
    }
  };

  const stop = async () => {
    setIsRunning(false);
    timerRef.current && clearInterval(timerRef.current);
    timerRef.current = null;
    if (activityIdRef.current) {
      try {
        await DynamicActivities.endLiveActivity(
          activityIdRef.current,
          { state: "ended" },
          "default",
        );
      } catch (e) {
        // ignore
      }
      activityIdRef.current = null;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Live Activities Support: {supported}</Text>
      <Text style={styles.time}>{timeLeft}s</Text>
      <View style={styles.row}>
        <Button title="Start 30s Timer" onPress={start} disabled={isRunning} />
        <View style={{ width: 12 }} />
        <Button title="Stop" onPress={stop} disabled={!isRunning} />
      </View>
      <Text style={styles.note}>
        To see the Live Activity, start the timer and lock the device. Ensure your app has Live
        Activities entitlement and a WidgetKit extension.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 16,
    color: "#333",
    marginBottom: 12,
  },
  time: {
    fontSize: 48,
    fontWeight: "600",
    color: "#222",
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  note: {
    color: "#666",
    textAlign: "center",
  },
});

export default App;
