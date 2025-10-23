import { useStore } from "@/contexts/StoreContext";

export const useCurrency = () => {
  const { settings } = useStore();

  const formatCurrency = (amount: number): string => {
    const currency = settings?.currency || 'LKR';
    
    const currencySymbols: Record<string, string> = {
      'LKR': 'Rs ',
      'USD': '$',
      'EUR': '€'
    };

    const symbol = currencySymbols[currency] || currency + ' ';
    return `${symbol}${amount.toFixed(2)}`;
  };

  const getCurrencySymbol = (): string => {
    const currency = settings?.currency || 'LKR';
    
    const currencySymbols: Record<string, string> = {
      'LKR': 'Rs',
      'USD': '$',
      'EUR': '€'
    };

    return currencySymbols[currency] || currency;
  };

  return { formatCurrency, getCurrencySymbol, currency: settings?.currency || 'LKR' };
};
