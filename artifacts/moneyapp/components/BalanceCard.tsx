import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

type Props = {
  balance: number;
  totalEarned: number;
  adsWatched: number;
};

export function BalanceCard({ balance, totalEarned, adsWatched }: Props) {
  const colors = useColors();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  const MIN_WITHDRAW = 5000;
  const progressPct = Math.min((balance / MIN_WITHDRAW) * 100, 100);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <View style={[styles.card, { backgroundColor: colors.gradientStart }]}>
        <View style={styles.header}>
          <View style={styles.labelRow}>
            <MaterialCommunityIcons name="wallet" size={16} color="rgba(255,255,255,0.8)" />
            <Text style={styles.label}>Solde disponible</Text>
          </View>
          <View style={[styles.liveBadge, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>EN DIRECT</Text>
          </View>
        </View>

        <Text style={styles.balance}>{balance.toLocaleString("fr-FR")} GNF</Text>
        <Text style={styles.usdEquiv}>{(balance / 8500).toFixed(2)} USD</Text>

        <View style={styles.withdrawGoal}>
          <View style={styles.goalRow}>
            <Text style={styles.goalLabel}>Objectif retrait: {MIN_WITHDRAW.toLocaleString()} GNF</Text>
            <Text style={styles.goalPct}>{progressPct.toFixed(0)}%</Text>
          </View>
          <View style={styles.goalBar}>
            <View style={[styles.goalFill, { width: `${progressPct}%` as any }]} />
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <MaterialCommunityIcons name="trending-up" size={16} color="rgba(255,255,255,0.9)" />
            <Text style={styles.statValue}>{totalEarned.toLocaleString("fr-FR")}</Text>
            <Text style={styles.statLabel}>Total gagné (GNF)</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.stat}>
            <MaterialCommunityIcons name="play-circle" size={16} color="rgba(255,255,255,0.9)" />
            <Text style={styles.statValue}>{adsWatched}</Text>
            <Text style={styles.statLabel}>Pubs regardées</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.stat}>
            <MaterialCommunityIcons name="cash-multiple" size={16} color="rgba(255,255,255,0.9)" />
            <Text style={styles.statValue}>{adsWatched > 0 ? Math.round(totalEarned / adsWatched).toLocaleString() : "0"}</Text>
            <Text style={styles.statLabel}>Moy. / pub (GNF)</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    shadowColor: "#0d7a4e",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  label: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4ade80",
  },
  liveText: {
    color: "#fff",
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },
  balance: {
    color: "#ffffff",
    fontSize: 36,
    fontFamily: "Inter_700Bold",
    letterSpacing: -1,
  },
  usdEquiv: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
    marginBottom: 16,
  },
  withdrawGoal: {
    marginBottom: 16,
  },
  goalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  goalLabel: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  goalPct: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Inter_700Bold",
  },
  goalBar: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 3,
    overflow: "hidden",
  },
  goalFill: {
    height: "100%",
    backgroundColor: "#ffd700",
    borderRadius: 3,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.15)",
  },
  stat: {
    flex: 1,
    alignItems: "center",
    gap: 3,
  },
  statValue: {
    color: "#ffffff",
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
  statLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
});
