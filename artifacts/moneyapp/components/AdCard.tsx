import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";

export type AdData = {
  id: string;
  title: string;
  brand: string;
  reward: number;
  duration: number;
  type: "video" | "quiz" | "survey";
  icon: string;
  color: string;
};

type Props = {
  ad: AdData;
  onComplete: (reward: number) => void;
};

export function AdCard({ ad, onComplete }: Props) {
  const colors = useColors();
  const [watching, setWatching] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsed = useRef(0);

  function startAd() {
    if (watching || completed) return;
    setWatching(true);
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    elapsed.current = 0;
    timerRef.current = setInterval(() => {
      elapsed.current += 100;
      const pct = Math.min(elapsed.current / (ad.duration * 1000), 1);
      setProgress(pct);
      progressAnim.setValue(pct);
      if (pct >= 1) {
        clearInterval(timerRef.current!);
        setWatching(false);
        setCompleted(true);
        if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Animated.spring(scaleAnim, { toValue: 1.05, useNativeDriver: true }).start(() => {
          Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
        });
      }
    }, 100);
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  function collect() {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onComplete(ad.reward);
  }

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <Animated.View style={[styles.card, { backgroundColor: colors.card, borderColor: completed ? colors.primary : colors.border, transform: [{ scale: scaleAnim }] }]}>
      <View style={[styles.iconContainer, { backgroundColor: ad.color + "22" }]}>
        <Text style={styles.iconText}>{ad.icon}</Text>
      </View>
      <View style={styles.info}>
        <Text style={[styles.brand, { color: colors.mutedForeground }]}>{ad.brand}</Text>
        <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={2}>{ad.title}</Text>
        <View style={styles.rewardRow}>
          <MaterialCommunityIcons name="cash" size={14} color={colors.gold} />
          <Text style={[styles.reward, { color: colors.gold }]}>+{ad.reward.toLocaleString()} GNF</Text>
          <View style={[styles.badge, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.badgeText, { color: colors.mutedForeground }]}>
              {ad.type === "video" ? "Vidéo" : ad.type === "quiz" ? "Quiz" : "Sondage"} · {ad.duration}s
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        {completed ? (
          <TouchableOpacity style={[styles.collectBtn, { backgroundColor: colors.primary }]} onPress={collect}>
            <MaterialCommunityIcons name="check-circle" size={16} color="#fff" />
            <Text style={styles.collectText}>Collecter</Text>
          </TouchableOpacity>
        ) : watching ? (
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
              <Animated.View style={[styles.progressFill, { width: progressWidth, backgroundColor: colors.primary }]} />
            </View>
            <Text style={[styles.progressText, { color: colors.mutedForeground }]}>
              {Math.ceil((1 - progress) * ad.duration)}s
            </Text>
          </View>
        ) : (
          <TouchableOpacity style={[styles.watchBtn, { backgroundColor: colors.secondary, borderColor: colors.primary }]} onPress={startAd}>
            <Feather name="play-circle" size={16} color={colors.primary} />
            <Text style={[styles.watchText, { color: colors.primary }]}>Regarder</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    fontSize: 26,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  brand: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    lineHeight: 18,
  },
  rewardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  reward: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 4,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
  },
  actions: {
    alignItems: "flex-end",
    justifyContent: "center",
    minWidth: 90,
  },
  watchBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  watchText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  collectBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  collectText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  progressContainer: {
    alignItems: "center",
    gap: 4,
    width: 90,
  },
  progressBar: {
    width: "100%",
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
});
