import { useCurrency } from '../context/CurrencyContext';

const currencies = ['THB', 'USD', 'CNY', 'EUR', 'JPY', 'SGD', 'HKD'];

export default function CurrencySwitcher() {
  const { currency, setCurrency } = useCurrency();

  return (
    <select
      aria-label="Currency selector"
      value={currency}
      onChange={(e) => setCurrency(e.target.value)}
    >
      {currencies.map((cur) => (
        <option key={cur} value={cur}>
          {cur}
        </option>
      ))}
    </select>
  );
}
