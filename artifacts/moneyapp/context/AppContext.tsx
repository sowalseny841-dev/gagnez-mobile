import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Transaction = {
  id: string;
  type: "earn" | "withdraw";
  amount: number;
  description: string;
  date: string;
};

export type AdType = "video" | "banner" | "rewarded";

type AppContextType = {
  balance: number;
  totalEarned: number;
  adsWatched: number;
  transactions: Transaction[];
  addEarning: (amount: number, description: string) => void;
  requestWithdraw: (amount: number) => boolean;
  isLoading: boolean;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  BALANCE: "@gagnez_balance",
  TOTAL_EARNED: "@gagnez_total_earned",
  ADS_WATCHED: "@gagnez_ads_watched",
  TRANSACTIONS: "@gagnez_transactions",
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [balance, setBalance] = useState<number>(0);
  const [totalEarned, setTotalEarned] = useState<number>(0);
  const [adsWatched, setAdsWatched] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [bal, total, ads, txs] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.BALANCE),
        AsyncStorage.getItem(STORAGE_KEYS.TOTAL_EARNED),
        AsyncStorage.getItem(STORAGE_KEYS.ADS_WATCHED),
        AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS),
      ]);
      if (bal) setBalance(parseFloat(bal));
      if (total) setTotalEarned(parseFloat(total));
      if (ads) setAdsWatched(parseInt(ads, 10));
      if (txs) setTransactions(JSON.parse(txs));
    } catch (e) {
    } finally {
      setIsLoading(false);
    }
  }

  async function saveData(
    newBalance: number,
    newTotal: number,
    newAds: number,
    newTxs: Transaction[]
  ) {
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.BALANCE, newBalance.toString()),
      AsyncStorage.setItem(STORAGE_KEYS.TOTAL_EARNED, newTotal.toString()),
      AsyncStorage.setItem(STORAGE_KEYS.ADS_WATCHED, newAds.toString()),
      AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(newTxs)),
    ]);
  }

  const addEarning = useCallback(
    (amount: number, description: string) => {
      const newBalance = balance + amount;
      const newTotal = totalEarned + amount;
      const newAds = adsWatched + 1;
      const newTx: Transaction = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        type: "earn",
        amount,
        description,
        date: new Date().toISOString(),
      };
      const newTxs = [newTx, ...transactions].slice(0, 100);
      setBalance(newBalance);
      setTotalEarned(newTotal);
      setAdsWatched(newAds);
      setTransactions(newTxs);
      saveData(newBalance, newTotal, newAds, newTxs);
    },
    [balance, totalEarned, adsWatched, transactions]
  );

  const requestWithdraw = useCallback(
    (amount: number): boolean => {
      const MIN_WITHDRAW = 5000;
      if (balance < MIN_WITHDRAW || amount > balance) return false;
      const newBalance = balance - amount;
      const newTx: Transaction = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        type: "withdraw",
        amount,
        description: "Retrait vers Mobile Money",
        date: new Date().toISOString(),
      };
      const newTxs = [newTx, ...transactions].slice(0, 100);
      setBalance(newBalance);
      setTransactions(newTxs);
      saveData(newBalance, totalEarned, adsWatched, newTxs);
      return true;
    },
    [balance, totalEarned, adsWatched, transactions]
  );

  return (
    <AppContext.Provider
      value={{
        balance,
        totalEarned,
        adsWatched,
        transactions,
        addEarning,
        requestWithdraw,
        isLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
}
