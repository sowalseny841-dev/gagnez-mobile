import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Platform,
  Animated,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { BalanceCard } from "@/components/BalanceCard";
import { AdCard, AdData } from "@/components/AdCard";
import { WithdrawModal } from "@/components/WithdrawModal";
import { RechargementModal } from "@/components/RechargementModal";
import { getDailyAds } from "@/data/ads";

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { balance, totalEarned, adsWatched, addEarning, addRecharge, requestWithdraw } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [ads, setAds] = useState<AdData[]>(getDailyAds());
  const [completedAds, setCompletedAds] = useState<Set<string>>(new Set());
  const [withdrawVisible, setWithdrawVisible] = useState(false);
  const [rechargementVisible, setRechargementVisible] = useState(false);
  const earnAnim = useRef(new Animated.Value(0)).current;
  const [lastEarned, setLastEarned] = useState(0);
  const [showEarn, setShowEarn] = useState(false);

  function handleAdComplete(ad: AdData, reward: number) {
    if (completedAds.has(ad.id)) return;
    setCompletedAds((prev) => new Set([...prev, ad.id]));
    addEarning(reward, `Pub: ${ad.brand}`);
    setLastEarned(reward);
    setShowEarn(true);
    earnAnim.setValue(0);
    Animated.sequence([
      Animated.spring(earnAnim, { toValue: 1, tension: 80, friction: 6, useNativeDriver: true }),
      Animated.delay(1500),
      Animated.timing(earnAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setShowEarn(false));
  }

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setAds(getDailyAds());
    setCompletedAds(new Set());
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : 0;

  const earnScale = earnAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] });
  const earnOpacity = earnAnim;

  const allCompleted = ads.every((a) => completedAds.has(a.id));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.appBar, { paddingTop: topInset + 12, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.appTitle, { color: colors.primary }]}>GagnezMobile</Text>
          <Text style={[styles.appSubtitle, { color: colors.mutedForeground }]}>Regardez, gagnez, retirez</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.rechargeBtn, { backgroundColor: "#1B3F8B" }]}
            onPress={() => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setRechargementVisible(true);
            }}
          >
            <MaterialCommunityIcons name="credit-card-plus" size={16} color="#fff" />
            <Text style={styles.headerBtnText}>Recharger</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.withdrawTopBtn, { backgroundColor: colors.primary }]}
            onPress={() => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setWithdrawVisible(true);
            }}
          >
            <MaterialCommunityIcons name="bank-transfer-out" size={16} color="#fff" />
            <Text style={styles.headerBtnText}>Retirer</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={ads}
        keyExtractor={(item) => item.id}
        scrollEnabled={!!ads.length}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.listContent, { paddingBottom: bottomInset + 24 }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListHeaderComponent={() => (
          <View>
            <BalanceCard balance={balance} totalEarned={totalEarned} adsWatched={adsWatched} />
            {allCompleted && ads.length > 0 && (
              <View style={[styles.allDoneBanner, { backgroundColor: colors.primary + "18", borderColor: colors.primary }]}>
                <MaterialCommunityIcons name="star-circle" size={20} color={colors.primary} />
                <Text style={[styles.allDoneText, { color: colors.primary }]}>
                  Bravo ! Toutes les pubs du jour terminées. Revenez demain !
                </Text>
              </View>
            )}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Publicités disponibles</Text>
              <View style={[styles.countBadge, { backgroundColor: colors.secondary }]}>
                <Text style={[styles.countText, { color: colors.primary }]}>
                  {ads.length - completedAds.size}/{ads.length}
                </Text>
              </View>
            </View>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: 16 }}>
            <AdCard
              ad={item}
              onComplete={(reward) => handleAdComplete(item, reward)}
            />
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="movie-off" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Aucune pub disponible</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Tirez vers le bas pour actualiser</Text>
          </View>
        )}
      />

      {showEarn && (
        <Animated.View
          style={[
            styles.earnToast,
            { backgroundColor: colors.primary, transform: [{ scale: earnScale }], opacity: earnOpacity },
          ]}
          pointerEvents="none"
        >
          <MaterialCommunityIcons name="cash-plus" size={20} color="#fff" />
          <Text style={styles.earnToastText}>+{lastEarned.toLocaleString()} GNF gagné !</Text>
        </Animated.View>
      )}

      <WithdrawModal
        visible={withdrawVisible}
        balance={balance}
        onClose={() => setWithdrawVisible(false)}
        onWithdraw={requestWithdraw}
      />

      <RechargementModal
        visible={rechargementVisible}
        onClose={() => setRechargementVisible(false)}
        onSuccess={(amount) => {
          addRecharge(amount, `Rechargement FedaPay`);
          setLastEarned(amount);
          setShowEarn(true);
          earnAnim.setValue(0);
          Animated.sequence([
            Animated.spring(earnAnim, { toValue: 1, tension: 80, friction: 6, useNativeDriver: true }),
            Animated.delay(2000),
            Animated.timing(earnAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
          ]).start(() => setShowEarn(false));
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  appBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  appTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  rechargeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  withdrawTopBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  headerBtnText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Inter_700Bold",
  },
  listContent: { paddingTop: 16 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  countText: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  allDoneBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  allDoneText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    lineHeight: 18,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  earnToast: {
    position: "absolute",
    bottom: 100,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  earnToastText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
});
