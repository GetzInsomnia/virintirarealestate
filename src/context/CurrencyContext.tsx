import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { Rates } from '../lib/fx/convert';

interface CurrencyContextValue {
  currency: string;
  setCurrency: (currency: string) => void;
  rates: Rates;
}

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: 'THB',
  setCurrency: () => {},
  rates: { THB: 1 },
});

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState('THB');
  const [rates, setRates] = useState<Rates>({ THB: 1 });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('currency');
      if (stored) {
        setCurrencyState(stored);
      }
    }
    fetch('/data/rates.json')
      .then((res) => res.json())
      .then((data: Rates) => setRates(data))
      .catch(() => {});
  }, []);

  const setCurrency = (cur: string) => {
    setCurrencyState(cur);
    if (typeof window !== 'undefined') {
      localStorage.setItem('currency', cur);
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, rates }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => useContext(CurrencyContext);
