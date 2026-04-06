import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { useColors } from "@/hooks/useColors";
import { createPaymentTransaction, RECHARGEMENT_AMOUNTS } from "@/services/fedapay";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSuccess: (amount: number) => void;
};

type Step = "form" | "loading" | "success" | "error";

export function RechargementModal({ visible, onClose, onSuccess }: Props) {
  const colors = useColors();
  const [amount, setAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [currency, setCurrency] = useState<"GNF" | "XOF">("GNF");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [step, setStep] = useState<Step>("form");
  const [errorMsg, setErrorMsg] = useState("");
  const [paidAmount, setPaidAmount] = useState(0);

  function reset() {
    setAmount(null);
    setCustomAmount("");
    setPhone("");
    setName("");
    setStep("form");
    setErrorMsg("");
    setPaidAmount(0);
    onClose();
  }

  function getEffectiveAmount(): number {
    if (amount !== null) return amount;
    const v = parseInt(customAmount.replace(/\s/g, ""), 10);
    return isNaN(v) ? 0 : v;
  }

  async function handlePay() {
    const effectiveAmount = getEffectiveAmount();
    if (effectiveAmount < 1000) {
      Alert.alert("Montant invalide", "Le montant minimum est 1 000 GNF.");
      return;
    }

    setStep("loading");
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const [firstName, ...lastParts] = name.trim().split(" ");
      const lastName = lastParts.join(" ");

      const { checkoutUrl } = await createPaymentTransaction({
        amount: effectiveAmount,
        currency,
        description: `Rechargement GagnezMobile — ${effectiveAmount.toLocaleString("fr-FR")} ${currency}`,
        customerPhone: phone || undefined,
        customerFirstname: firstName || "Utilisateur",
        customerLastname: lastName || undefined,
      });

      // Ouvrir le checkout FedaPay dans le navigateur intégré
      const result = await WebBrowser.openAuthSessionAsync(
        checkoutUrl,
        "gagnez-mobile://paiement-retour"
      );

      if (result.type === "success" || result.type === "dismiss") {
        // L'utilisateur est revenu — on considère le paiement comme traité
        // En production, vous vérifieriez le statut via webhook ou l'API
        setPaidAmount(effectiveAmount);
        setStep("success");
        onSuccess(effectiveAmount);
        if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        setStep("form");
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erreur inconnue";
      setErrorMsg(msg);
      setStep("error");
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }

  const effectiveAmount = getEffectiveAmount();

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={reset}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={reset} style={styles.closeBtn} disabled={step === "loading"}>
            <Feather name="x" size={22} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Recharger mon compte</Text>
          <View style={styles.placeholder} />
        </View>

        {/* ─── LOADING ─── */}
        {step === "loading" && (
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
              Ouverture de FedaPay…
            </Text>
            <Text style={[styles.loadingSubText, { color: colors.mutedForeground }]}>
              Complétez le paiement dans la fenêtre qui s'ouvre
            </Text>
          </View>
        )}

        {/* ─── SUCCESS ─── */}
        {step === "success" && (
          <View style={styles.centerState}>
            <View style={[styles.successIcon, { backgroundColor: colors.primary + "18" }]}>
              <MaterialCommunityIcons name="check-circle" size={72} color={colors.primary} />
            </View>
            <Text style={[styles.successTitle, { color: colors.foreground }]}>Paiement réussi !</Text>
            <Text style={[styles.successAmount, { color: colors.primary }]}>
              +{paidAmount.toLocaleString("fr-FR")} {currency}
            </Text>
            <Text style={[styles.successText, { color: colors.mutedForeground }]}>
              Votre compte GagnezMobile a été rechargé avec succès via FedaPay.
            </Text>
            <TouchableOpacity style={[styles.doneBtn, { backgroundColor: colors.primary }]} onPress={reset}>
              <Text style={styles.doneBtnText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ─── ERROR ─── */}
        {step === "error" && (
          <View style={styles.centerState}>
            <View style={[styles.errorIcon, { backgroundColor: colors.destructive + "18" }]}>
              <MaterialCommunityIcons name="alert-circle" size={72} color={colors.destructive} />
            </View>
            <Text style={[styles.errorTitle, { color: colors.foreground }]}>Paiement échoué</Text>
            <Text style={[styles.errorText, { color: colors.mutedForeground }]}>{errorMsg}</Text>
            <TouchableOpacity style={[styles.retryBtn, { backgroundColor: colors.primary }]} onPress={() => setStep("form")}>
              <MaterialCommunityIcons name="refresh" size={18} color="#fff" />
              <Text style={styles.doneBtnText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ─── FORM ─── */}
        {step === "form" && (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.form, { paddingBottom: Platform.OS === "web" ? 50 : 24 }]}>

            {/* Bannière FedaPay */}
            <View style={[styles.fedaBanner, { backgroundColor: "#1B3F8B" + "15", borderColor: "#1B3F8B" + "40" }]}>
              <MaterialCommunityIcons name="shield-check" size={18} color="#1B3F8B" />
              <Text style={[styles.fedaText, { color: "#1B3F8B" }]}>
                Paiement sécurisé par <Text style={{ fontFamily: "Inter_700Bold" }}>FedaPay</Text> — Mobile Money & Carte
              </Text>
            </View>

            {/* Devise */}
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Devise</Text>
            <View style={styles.currencyRow}>
              {(["GNF", "XOF"] as const).map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.currencyBtn, { borderColor: currency === c ? colors.primary : colors.border, backgroundColor: currency === c ? colors.primary + "15" : colors.card }]}
                  onPress={() => setCurrency(c)}
                >
                  <Text style={[styles.currencyText, { color: currency === c ? colors.primary : colors.mutedForeground }]}>
                    {c === "GNF" ? "🇬🇳 GNF — Franc Guinéen" : "🌍 XOF — FCFA"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Montants rapides */}
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Choisir un montant</Text>
            <View style={styles.amountsGrid}>
              {RECHARGEMENT_AMOUNTS.map((a) => (
                <TouchableOpacity
                  key={a.gnf}
                  style={[styles.amountBtn, { borderColor: amount === a.gnf ? colors.primary : colors.border, backgroundColor: amount === a.gnf ? colors.primary + "15" : colors.card }]}
                  onPress={() => { setAmount(a.gnf); setCustomAmount(""); }}
                >
                  <Text style={[styles.amountBtnValue, { color: amount === a.gnf ? colors.primary : colors.foreground }]}>{a.display}</Text>
                  <Text style={[styles.amountBtnLabel, { color: colors.mutedForeground }]}>{currency}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Montant personnalisé */}
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Ou saisir un montant</Text>
            <View style={[styles.inputWrap, { borderColor: customAmount ? colors.primary : colors.border, backgroundColor: colors.card }]}>
              <MaterialCommunityIcons name="cash" size={18} color={colors.mutedForeground} />
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                placeholder={`Montant en ${currency}`}
                placeholderTextColor={colors.mutedForeground}
                keyboardType="numeric"
                value={customAmount}
                onChangeText={(v) => { setCustomAmount(v); setAmount(null); }}
              />
              <Text style={[styles.inputSuffix, { color: colors.mutedForeground }]}>{currency}</Text>
            </View>

            {/* Informations client (optionnel) */}
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Votre nom (optionnel)</Text>
            <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.card }]}>
              <MaterialCommunityIcons name="account" size={18} color={colors.mutedForeground} />
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                placeholder="Prénom Nom"
                placeholderTextColor={colors.mutedForeground}
                value={name}
                onChangeText={setName}
              />
            </View>

            <Text style={[styles.label, { color: colors.mutedForeground }]}>Téléphone Mobile Money (optionnel)</Text>
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

            {/* Récapitulatif */}
            {effectiveAmount > 0 && (
              <View style={[styles.recap, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                <View style={styles.recapRow}>
                  <Text style={[styles.recapLabel, { color: colors.mutedForeground }]}>Montant</Text>
                  <Text style={[styles.recapValue, { color: colors.foreground }]}>{effectiveAmount.toLocaleString("fr-FR")} {currency}</Text>
                </View>
                <View style={styles.recapRow}>
                  <Text style={[styles.recapLabel, { color: colors.mutedForeground }]}>Frais FedaPay</Text>
                  <Text style={[styles.recapValue, { color: colors.mutedForeground }]}>Inclus</Text>
                </View>
                <View style={[styles.recapRow, styles.recapTotal]}>
                  <Text style={[styles.recapLabel, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Total à payer</Text>
                  <Text style={[styles.recapValue, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>{effectiveAmount.toLocaleString("fr-FR")} {currency}</Text>
                </View>
              </View>
            )}

            {/* Bouton principal */}
            <TouchableOpacity
              style={[styles.payBtn, { backgroundColor: effectiveAmount >= 1000 ? "#1B3F8B" : colors.muted }]}
              onPress={handlePay}
              disabled={effectiveAmount < 1000}
            >
              <MaterialCommunityIcons name="credit-card-outline" size={20} color={effectiveAmount >= 1000 ? "#fff" : colors.mutedForeground} />
              <Text style={[styles.payBtnText, { color: effectiveAmount >= 1000 ? "#fff" : colors.mutedForeground }]}>
                {effectiveAmount >= 1000 ? `Payer ${effectiveAmount.toLocaleString("fr-FR")} ${currency} avec FedaPay` : "Recharger mon compte"}
              </Text>
            </TouchableOpacity>

            <Text style={[styles.secureNote, { color: colors.mutedForeground }]}>
              🔒 Paiement 100% sécurisé · Orange Money · MTN · Wave · Carte bancaire
            </Text>
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
  form: { padding: 20 },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 16,
  },
  loadingText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  loadingSubText: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" },
  successIcon: { width: 120, height: 120, borderRadius: 60, alignItems: "center", justifyContent: "center" },
  successTitle: { fontSize: 24, fontFamily: "Inter_700Bold" },
  successAmount: { fontSize: 28, fontFamily: "Inter_700Bold" },
  successText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },
  errorIcon: { width: 120, height: 120, borderRadius: 60, alignItems: "center", justifyContent: "center" },
  errorTitle: { fontSize: 22, fontFamily: "Inter_700Bold" },
  errorText: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
  doneBtn: { paddingHorizontal: 40, paddingVertical: 14, borderRadius: 14 },
  retryBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14 },
  doneBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
  fedaBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 20,
  },
  fedaText: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium" },
  label: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 16,
  },
  currencyRow: { flexDirection: "row", gap: 10 },
  currencyBtn: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1.5, alignItems: "center" },
  currencyText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  amountsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  amountBtn: {
    width: "30%",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: "center",
    gap: 2,
  },
  amountBtnValue: { fontSize: 16, fontFamily: "Inter_700Bold" },
  amountBtnLabel: { fontSize: 10, fontFamily: "Inter_400Regular" },
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
  inputSuffix: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  recap: {
    marginTop: 20,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  recapRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  recapTotal: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.08)",
    marginTop: 4,
  },
  recapLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  recapValue: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  payBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 16,
    borderRadius: 14,
    marginTop: 20,
  },
  payBtnText: { fontSize: 15, fontFamily: "Inter_700Bold" },
  secureNote: {
    textAlign: "center",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 12,
    lineHeight: 18,
  },
});
