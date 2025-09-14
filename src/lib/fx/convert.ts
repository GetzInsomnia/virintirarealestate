export type Rates = Record<string, number>;

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
  rates: Rates,
  locale = 'en-US'
): string {
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
