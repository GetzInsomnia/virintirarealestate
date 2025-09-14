import { useCurrency } from '../context/CurrencyContext';
import { formatCurrencyTHBBase, formatPriceTHB } from '../lib/fx/convert';

interface Props {
  priceTHB: number;
}

export default function PropertyPrice({ priceTHB }: Props) {
  const { currency, rates } = useCurrency();
  const main = formatCurrencyTHBBase(priceTHB, currency, rates);
  const thb = formatPriceTHB(priceTHB);

  return (
    <div>
      <span>{main}</span>
      {currency !== 'THB' && <div className="text-sm text-gray-500">{thb}</div>}
    </div>
  );
}
