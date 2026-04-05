import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";

type Props = {
  visible: boolean;
  balance: number;
  onClose: () => void;
  onWithdraw: (amount: number) => boolean;
};

const OPERATORS = [
  { id: "orange", name: "Orange Money", icon: "cellphone" as const, color: "#FF6600" },
  { id: "mtn", name: "MTN MoMo", icon: "cellphone" as const, color: "#FFCB00" },
  { id: "wave", name: "Wave", icon: "cellphone" as const, color: "#1A96F0" },
];

const MIN_WITHDRAW = 5000;

export function WithdrawModal({ visible, balance, onClose, onWithdraw }: Props) {
  const colors = useColors();
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedOp, setSelectedOp] = useState("orange");
  const [step, setStep] = useState<"form" | "success">("form");

  function handleWithdraw() {
    const amt = parseFloat(amount);
    if (!amt || amt < MIN_WITHDRAW) {
      Alert.alert("Montant insuffisant", `Le minimum de retrait est ${MIN_WITHDRAW.toLocaleString()} GNF`);
      return;
    }
    if (amt > balance) {
      Alert.alert("Solde insuffisant", "Vous n'avez pas assez de fonds.");
      return;
    }
    if (!phone || phone.length < 8) {
      Alert.alert("Numéro invalide", "Entrez un numéro de téléphone valide.");
      return;
    }
    const ok = onWithdraw(amt);
    if (ok) {
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setStep("success");
    }
  }

  function reset() {
    setAmount("");
    setPhone("");
    setStep("form");
    setSelectedOp("orange");
    onClose();
  }

  const op = OPERATORS.find((o) => o.id === selectedOp)!;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={reset}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={reset} style={styles.closeBtn}>
            <Feather name="x" size={22} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Retrait d'argent</Text>
          <View style={styles.placeholder} />
        </View>

        {step === "success" ? (
          <View style={styles.successContainer}>
            <View style={[styles.successIcon, { backgroundColor: colors.primary + "22" }]}>
              <MaterialCommunityIcons name="check-circle" size={64} color={colors.primary} />
            </View>
            <Text style={[styles.successTitle, { color: colors.foreground }]}>Demande envoyée !</Text>
            <Text style={[styles.successText, { color: colors.mutedForeground }]}>
              Votre retrait de {parseFloat(amount).toLocaleString()} GNF vers {op.name} ({phone}) a été soumis. 
              Vous recevrez votre paiement dans 24-48h.
            </Text>
            <TouchableOpacity style={[styles.doneBtn, { backgroundColor: colors.primary }]} onPress={reset}>
              <Text style={styles.doneBtnText}>Terminer</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            <View style={[styles.balanceInfo, { backgroundColor: colors.secondary }]}>
              <MaterialCommunityIcons name="wallet" size={18} color={colors.primary} />
              <Text style={[styles.balanceText, { color: colors.foreground }]}>
                Solde: <Text style={{ fontFamily: "Inter_700Bold", color: colors.primary }}>{balance.toLocaleString()} GNF</Text>
              </Text>
            </View>

            {balance < MIN_WITHDRAW && (
              <View style={[styles.warningBox, { backgroundColor: colors.warning + "22", borderColor: colors.warning }]}>
                <MaterialCommunityIcons name="alert-circle" size={16} color={colors.warning} />
                <Text style={[styles.warningText, { color: colors.warning }]}>
                  Minimum {MIN_WITHDRAW.toLocaleString()} GNF requis. Il vous manque {(MIN_WITHDRAW - balance).toLocaleString()} GNF.
                </Text>
              </View>
            )}

            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Opérateur Mobile Money</Text>
            <View style={styles.operatorsRow}>
              {OPERATORS.map((o) => (
                <TouchableOpacity
                  key={o.id}
                  style={[styles.opBtn, { borderColor: selectedOp === o.id ? o.color : colors.border, backgroundColor: selectedOp === o.id ? o.color + "15" : colors.card }]}
                  onPress={() => setSelectedOp(o.id)}
                >
                  <View style={[styles.opDot, { backgroundColor: o.color }]} />
                  <Text style={[styles.opName, { color: selectedOp === o.id ? o.color : colors.foreground }]}>{o.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Numéro de téléphone</Text>
            <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.card }]}>
              <MaterialCommunityIcons name="phone" size={18} color={colors.mutedForeground} />
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                placeholder="Ex: 621 00 00 00"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Montant (GNF)</Text>
            <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.card }]}>
              <MaterialCommunityIcons name="cash" size={18} color={colors.mutedForeground} />
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                placeholder={`Min. ${MIN_WITHDRAW.toLocaleString()} GNF`}
                placeholderTextColor={colors.mutedForeground}
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
            </View>

            <View style={styles.quickAmounts}>
              {[5000, 10000, 25000, 50000].map((amt) => (
                <TouchableOpacity
                  key={amt}
                  style={[styles.quickBtn, { borderColor: colors.border, backgroundColor: colors.secondary }]}
                  onPress={() => setAmount(amt.toString())}
                  disabled={balance < amt}
                >
                  <Text style={[styles.quickText, { color: balance >= amt ? colors.primary : colors.mutedForeground }]}>
                    {(amt / 1000).toFixed(0)}K
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.withdrawBtn, { backgroundColor: balance < MIN_WITHDRAW ? colors.muted : colors.primary }]}
              onPress={handleWithdraw}
              disabled={balance < MIN_WITHDRAW}
            >
              <MaterialCommunityIcons name="bank-transfer-out" size={20} color={balance < MIN_WITHDRAW ? colors.mutedForeground : "#fff"} />
              <Text style={[styles.withdrawBtnText, { color: balance < MIN_WITHDRAW ? colors.mutedForeground : "#fff" }]}>
                Retirer maintenant
              </Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "web" ? 60 : 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  closeBtn: { padding: 4 },
  headerTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  placeholder: { width: 30 },
  form: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  balanceInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  balanceText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  warningBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
  },
  warningText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular" },
  sectionLabel: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 16,
  },
  operatorsRow: { flexDirection: "row", gap: 8, marginBottom: 4 },
  opBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  opDot: { width: 10, height: 10, borderRadius: 5 },
  opName: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  input: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  quickAmounts: { flexDirection: "row", gap: 8, marginTop: 12 },
  quickBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
  },
  quickText: { fontSize: 13, fontFamily: "Inter_700Bold" },
  withdrawBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    borderRadius: 14,
    marginTop: 24,
    marginBottom: 40,
  },
  withdrawBtnText: { fontSize: 16, fontFamily: "Inter_700Bold" },
  successContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  successTitle: { fontSize: 24, fontFamily: "Inter_700Bold", marginBottom: 12 },
  successText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22, marginBottom: 32 },
  doneBtn: {
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 14,
  },
  doneBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
});
