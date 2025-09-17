export type Rates = Record<string, number>;

export interface RatesPayload {
  base: string;
  date: string;
  rates: Record<string, number>;
}

function isRatesPayload(value: unknown): value is RatesPayload {
  return (
    typeof value === 'object' &&
    value !== null &&
    'rates' in value &&
    typeof (value as { rates?: unknown }).rates === 'object' &&
    (value as { rates: unknown }).rates !== null
  );
}

export function normalizeRates(value: unknown): Rates {
  if (isRatesPayload(value)) {
    return { ...(value.rates as Rates), THB: 1 };
  }

  if (typeof value === 'object' && value !== null) {
    const rates = value as Rates;
    if (rates.THB === 1) {
      return rates;
    }
    return { ...rates, THB: 1 };
  }

  return { THB: 1 };
}

export function formatPriceTHB(amount: number, locale = 'th-TH'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'THB',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function convertFromTHB(amountTHB: number, rate: number): number {
  return amountTHB * rate;
}

export function formatCurrencyTHBBase(
  amountTHB: number,
  currency: string,
  ratesInput: Rates,
  locale = 'en-US'
): string {
  const rates = normalizeRates(ratesInput);

  if (currency === 'THB' || !rates[currency]) {
    return formatPriceTHB(amountTHB, locale);
  }
  const converted = convertFromTHB(amountTHB, rates[currency]);
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(converted);
}
