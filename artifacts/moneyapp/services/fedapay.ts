/**
 * Service FedaPay — Intégration paiement pour GagnezMobile
 * Utilise l'API REST FedaPay v1 pour créer des transactions
 * et ouvrir le checkout dans le navigateur.
 *
 * Doc: https://docs.fedapay.com
 */

const FEDAPAY_BASE_URL = "https://api.fedapay.com/v1";
const PUBLIC_KEY = process.env.EXPO_PUBLIC_FEDAPAY_PUBLIC_KEY ?? "";

export type FedaPayCurrency = "GNF" | "XOF" | "EUR" | "USD";

export type CreateTransactionParams = {
  amount: number;
  currency?: FedaPayCurrency;
  description: string;
  customerFirstname?: string;
  customerLastname?: string;
  customerEmail?: string;
  customerPhone?: string;
};

export type FedaPayTransaction = {
  id: number;
  reference: string;
  amount: number;
  description: string;
  status: string;
  currency: { iso: string };
};

export type FedaPayToken = {
  token: string;
  url: string;
};

function headers() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${PUBLIC_KEY}`,
    "X-Version": "v1",
  };
}

/**
 * Crée une transaction FedaPay et retourne l'URL de paiement.
 */
export async function createPaymentTransaction(
  params: CreateTransactionParams
): Promise<{ transaction: FedaPayTransaction; checkoutUrl: string }> {
  const { amount, currency = "GNF", description, customerEmail, customerFirstname, customerLastname, customerPhone } = params;

  // 1. Créer la transaction
  const txBody: Record<string, unknown> = {
    description,
    amount,
    currency: { iso: currency },
    callback_url: "https://gagnez-mobile.app/paiement-retour",
    items: [{ name: description, quantity: 1, unit_price: amount, total_price: amount }],
  };

  if (customerEmail || customerFirstname || customerPhone) {
    txBody["customer"] = {
      ...(customerFirstname ? { firstname: customerFirstname } : {}),
      ...(customerLastname ? { lastname: customerLastname } : {}),
      ...(customerEmail ? { email: customerEmail } : {}),
      ...(customerPhone ? { phone_number: { number: customerPhone, country: "GN" } } : {}),
    };
  }

  const txRes = await fetch(`${FEDAPAY_BASE_URL}/transactions`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(txBody),
  });

  if (!txRes.ok) {
    const err = await txRes.json().catch(() => ({}));
    const msg = (err as { message?: string }).message ?? `Erreur ${txRes.status}`;
    throw new Error(`FedaPay création transaction: ${msg}`);
  }

  const txData = (await txRes.json()) as { v1: { transaction: FedaPayTransaction } };
  const transaction = txData.v1?.transaction ?? (txData as unknown as FedaPayTransaction);

  // 2. Générer le token de paiement
  const tokenRes = await fetch(`${FEDAPAY_BASE_URL}/transactions/${transaction.id}/token`, {
    method: "POST",
    headers: headers(),
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.json().catch(() => ({}));
    const msg = (err as { message?: string }).message ?? `Erreur ${tokenRes.status}`;
    throw new Error(`FedaPay génération token: ${msg}`);
  }

  const tokenData = (await tokenRes.json()) as { token: FedaPayToken };
  const token = tokenData.token ?? (tokenData as unknown as FedaPayToken);
  const checkoutUrl = token.url ?? `https://checkout.fedapay.com/${token.token}`;

  return { transaction, checkoutUrl };
}

/**
 * Vérifie le statut d'une transaction par son ID.
 */
export async function getTransactionStatus(transactionId: number): Promise<string> {
  const res = await fetch(`${FEDAPAY_BASE_URL}/transactions/${transactionId}`, {
    headers: headers(),
  });

  if (!res.ok) throw new Error(`Erreur vérification statut: ${res.status}`);

  const data = (await res.json()) as { v1: { transaction: FedaPayTransaction } };
  const tx = data.v1?.transaction ?? (data as unknown as FedaPayTransaction);
  return tx.status ?? "unknown";
}

export const RECHARGEMENT_AMOUNTS = [
  { label: "5 000 GNF", gnf: 5000, display: "5K" },
  { label: "10 000 GNF", gnf: 10000, display: "10K" },
  { label: "25 000 GNF", gnf: 25000, display: "25K" },
  { label: "50 000 GNF", gnf: 50000, display: "50K" },
  { label: "100 000 GNF", gnf: 100000, display: "100K" },
];
