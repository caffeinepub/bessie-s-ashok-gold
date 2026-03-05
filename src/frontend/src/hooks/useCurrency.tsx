import type React from "react";
import { createContext, useCallback, useContext, useState } from "react";

// ─── Currency definitions ─────────────────────────────────────────────────────
export interface CurrencyOption {
  code: string;
  symbol: string;
  label: string;
  rate: number; // rate relative to EUR (base)
}

export const CURRENCIES: CurrencyOption[] = [
  { code: "EUR", symbol: "€", label: "Euro", rate: 1.0 },
  { code: "USD", symbol: "$", label: "US Dollar", rate: 1.08 },
  { code: "GBP", symbol: "£", label: "British Pound", rate: 0.86 },
  { code: "INR", symbol: "₹", label: "Indian Rupee", rate: 90.5 },
  { code: "AED", symbol: "د.إ", label: "UAE Dirham", rate: 3.97 },
  { code: "SAR", symbol: "﷼", label: "Saudi Riyal", rate: 4.05 },
];

const STORAGE_KEY = "selectedCurrency";

// ─── Context type ─────────────────────────────────────────────────────────────
interface CurrencyContextValue {
  currency: CurrencyOption;
  setCurrencyCode: (code: string) => void;
  convertPrice: (euroPrice: number) => string;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const getInitialCurrency = (): CurrencyOption => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const found = CURRENCIES.find((c) => c.code === stored);
      if (found) return found;
    }
    return CURRENCIES[0]; // default EUR
  };

  const [currency, setCurrency] = useState<CurrencyOption>(getInitialCurrency);

  const setCurrencyCode = useCallback((code: string) => {
    const found = CURRENCIES.find((c) => c.code === code);
    if (found) {
      setCurrency(found);
      localStorage.setItem(STORAGE_KEY, code);
    }
  }, []);

  const convertPrice = useCallback(
    (euroPrice: number): string => {
      const converted = euroPrice * currency.rate;
      // For currencies with large values (INR), show no decimals; others show 2
      const decimals = currency.rate >= 10 ? 0 : 2;
      return `${currency.symbol}${converted.toFixed(decimals)}`;
    },
    [currency],
  );

  return (
    <CurrencyContext.Provider
      value={{ currency, setCurrencyCode, convertPrice }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return ctx;
}
