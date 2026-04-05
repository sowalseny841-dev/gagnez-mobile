import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useColors } from "@/hooks/useColors";
import { useApp, Transaction } from "@/context/AppContext";

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function HistoriqueScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { transactions, totalEarned, adsWatched } = useApp();

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : 0;

  const totalWithdrawn = transactions.filter((t) => t.type === "withdraw").reduce((s, t) => s + t.amount, 0);

  function renderItem({ item }: { item: Transaction }) {
    const isEarn = item.type === "earn";
    return (
      <View style={[styles.txRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.txIcon, { backgroundColor: isEarn ? colors.primary + "18" : colors.destructive + "18" }]}>
          <MaterialCommunityIcons
            name={isEarn ? "cash-plus" : "bank-transfer-out"}
            size={20}
            color={isEarn ? colors.primary : colors.destructive}
          />
        </View>
        <View style={styles.txInfo}>
          <Text style={[styles.txDesc, { color: colors.foreground }]}>{item.description}</Text>
          <Text style={[styles.txDate, { color: colors.mutedForeground }]}>{formatDate(item.date)}</Text>
        </View>
        <Text style={[styles.txAmount, { color: isEarn ? colors.primary : colors.destructive }]}>
          {isEarn ? "+" : "-"}{item.amount.toLocaleString()} GNF
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.appBar, { paddingTop: topInset + 12, borderBottomColor: colors.border }]}>
        <Text style={[styles.pageTitle, { color: colors.foreground }]}>Historique</Text>
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(t) => t.id}
        scrollEnabled={!!transactions.length}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: bottomInset + 24 }]}
        ListHeaderComponent={() => (
          <View>
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <MaterialCommunityIcons name="trending-up" size={20} color={colors.primary} />
                <Text style={[styles.statVal, { color: colors.foreground }]}>{totalEarned.toLocaleString()} GNF</Text>
                <Text style={[styles.statLbl, { color: colors.mutedForeground }]}>Total gagné</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <MaterialCommunityIcons name="play-circle" size={20} color={colors.accent} />
                <Text style={[styles.statVal, { color: colors.foreground }]}>{adsWatched}</Text>
                <Text style={[styles.statLbl, { color: colors.mutedForeground }]}>Pubs regardées</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <MaterialCommunityIcons name="bank-transfer-out" size={20} color={colors.destructive} />
                <Text style={[styles.statVal, { color: colors.foreground }]}>{totalWithdrawn.toLocaleString()} GNF</Text>
                <Text style={[styles.statLbl, { color: colors.mutedForeground }]}>Total retiré</Text>
              </View>
            </View>

            {transactions.length > 0 && (
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Transactions récentes</Text>
            )}
          </View>
        )}
        renderItem={renderItem}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <MaterialCommunityIcons name="history" size={56} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Aucune transaction</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Regardez des publicités pour commencer à gagner de l'argent !
            </Text>
          </View>
        )}
      />
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
  content: { padding: 16 },
  statsGrid: { flexDirection: "row", gap: 10, marginBottom: 20 },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
    gap: 4,
  },
  statVal: { fontSize: 14, fontFamily: "Inter_700Bold", textAlign: "center" },
  statLbl: { fontSize: 10, fontFamily: "Inter_400Regular", textAlign: "center" },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 12 },
  txRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  txIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  txInfo: { flex: 1 },
  txDesc: { fontSize: 13, fontFamily: "Inter_500Medium", marginBottom: 3 },
  txDate: { fontSize: 11, fontFamily: "Inter_400Regular" },
  txAmount: { fontSize: 14, fontFamily: "Inter_700Bold" },
  empty: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
    paddingHorizontal: 32,
  },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },
});
