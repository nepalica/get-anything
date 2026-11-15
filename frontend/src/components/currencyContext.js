import { createContext, useContext } from "react";

export const CurrencyContext = createContext({
  rate: null,
  isLoading: true,
  isError: false,
  errorMessage: "Payment conversion settings are unavailable.",
});

export const useNprCurrency = () => useContext(CurrencyContext);

export const formatNpr = (amount, rate) => {
  const value = Number(amount) * Number(rate);
  if (!Number.isFinite(value)) return null;

  return new Intl.NumberFormat("en-NP", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};
