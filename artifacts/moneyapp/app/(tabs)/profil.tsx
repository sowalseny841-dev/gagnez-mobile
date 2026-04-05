import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";

const TIPS = [
  { icon: "eye", text: "Regardez toutes les pubs chaque jour pour maximiser vos gains", color: "#16c784" },
  { icon: "clock-outline", text: "Revenez chaque jour - de nouvelles pubs arrivent régulièrement", color: "#f59e0b" },
  { icon: "cash-multiple", text: "Minimum 5 000 GNF requis pour effectuer un retrait", color: "#1A96F0" },
  { icon: "share-variant", text: "Partagez l'app avec vos amis pour des bonus spéciaux", color: "#ec4899" },
];

export default function ProfilScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { balance, totalEarned, adsWatched } = useApp();

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : 0;

  const level = adsWatched < 10 ? "Débutant" : adsWatched < 50 ? "Intermédiaire" : adsWatched < 200 ? "Expert" : "Maître";
  const levelColor = adsWatched < 10 ? "#6b7280" : adsWatched < 50 ? colors.primary : adsWatched < 200 ? "#f59e0b" : "#ffd700";
  const nextLevelAds = adsWatched < 10 ? 10 : adsWatched < 50 ? 50 : adsWatched < 200 ? 200 : null;
  const levelPct = nextLevelAds ? Math.min((adsWatched / nextLevelAds) * 100, 100) : 100;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.appBar, { paddingTop: topInset + 12, borderBottomColor: colors.border }]}>
        <Text style={[styles.pageTitle, { color: colors.foreground }]}>Mon profil</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: bottomInset + 24 }}>
        <View style={[styles.profileCard, { backgroundColor: colors.gradientStart }]}>
          <View style={styles.avatarWrap}>
            <View style={[styles.avatar, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
              <MaterialCommunityIcons name="account" size={40} color="#fff" />
            </View>
            <View style={[styles.levelBadge, { backgroundColor: levelColor }]}>
              <Text style={styles.levelText}>{level}</Text>
            </View>
          </View>
          <Text style={styles.userName}>Mon compte</Text>
          <Text style={styles.userSub}>Membre GagnezMobile</Text>

          <View style={styles.levelBarWrap}>
            <View style={styles.levelBarRow}>
              <Text style={styles.levelBarLabel}>Progression niveau</Text>
              {nextLevelAds && (
                <Text style={styles.levelBarLabel}>{adsWatched}/{nextLevelAds} pubs</Text>
              )}
            </View>
            <View style={styles.levelBar}>
              <View style={[styles.levelFill, { width: `${levelPct}%` as any, backgroundColor: levelColor }]} />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Mes statistiques</Text>
          <View style={styles.statsGrid}>
            {[
              { label: "Solde actuel", value: `${balance.toLocaleString()} GNF`, icon: "wallet", color: colors.primary },
              { label: "Total gagné", value: `${totalEarned.toLocaleString()} GNF`, icon: "trending-up", color: "#10b981" },
              { label: "Pubs regardées", value: adsWatched.toString(), icon: "play-circle", color: "#f59e0b" },
              { label: "Gains / pub", value: adsWatched > 0 ? `${Math.round(totalEarned / adsWatched).toLocaleString()} GNF` : "0 GNF", icon: "chart-line", color: "#8b5cf6" },
            ].map((s, i) => (
              <View key={i} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <MaterialCommunityIcons name={s.icon as any} size={22} color={s.color} />
                <Text style={[styles.statValue, { color: colors.foreground }]}>{s.value}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Conseils pour gagner plus</Text>
          {TIPS.map((tip, i) => (
            <View key={i} style={[styles.tipRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.tipIcon, { backgroundColor: tip.color + "18" }]}>
                <MaterialCommunityIcons name={tip.icon as any} size={18} color={tip.color} />
              </View>
              <Text style={[styles.tipText, { color: colors.foreground }]}>{tip.text}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.infoBox, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
          <MaterialCommunityIcons name="information-outline" size={18} color={colors.mutedForeground} />
          <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
            GagnezMobile vous permet de gagner de l'argent réel en Guinée en regardant des publicités partenaires. 
            Les paiements sont effectués via Mobile Money (Orange Money, MTN, Wave).
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  appBar: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  pageTitle: { fontSize: 24, fontFamily: "Inter_700Bold" },
  profileCard: {
    margin: 16,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
  },
  avatarWrap: { position: "relative", marginBottom: 12 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.4)",
  },
  levelBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#fff",
  },
  levelText: { color: "#fff", fontSize: 10, fontFamily: "Inter_700Bold" },
  userName: { color: "#fff", fontSize: 20, fontFamily: "Inter_700Bold", marginBottom: 2 },
  userSub: { color: "rgba(255,255,255,0.7)", fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 16 },
  levelBarWrap: { width: "100%" },
  levelBarRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  levelBarLabel: { color: "rgba(255,255,255,0.8)", fontSize: 12, fontFamily: "Inter_400Regular" },
  levelBar: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 4,
    overflow: "hidden",
  },
  levelFill: { height: "100%", borderRadius: 4 },
  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold", marginBottom: 12 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statCard: {
    width: "47%",
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    alignItems: "center",
    gap: 6,
  },
  statValue: { fontSize: 15, fontFamily: "Inter_700Bold", textAlign: "center" },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center" },
  tipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  tipIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  tipText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginHorizontal: 16,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  infoText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18 },
});
