import Link from 'next/link';
import PropertyImage, { asSrc, ImgLike } from './PropertyImage';
import { useCurrency } from '../context/CurrencyContext';
import { formatCurrencyTHBBase } from '../lib/fx/convert';

interface Property {
  id: number;
  title: { en: string; th: string; zh?: string };
  price: number;
  images: ImgLike[];
}

interface Props {
  property: Property;
  locale: string;
}

export default function PropertyCard({ property, locale }: Props) {
  const { currency, rates } = useCurrency();
  let localeKey: 'en' | 'th' | 'zh' = 'en';
  if (locale === 'th' || locale === 'zh') {
    localeKey = locale;
  }
  const title = property.title[localeKey] ?? property.title.en;
  const main = formatCurrencyTHBBase(property.price, currency, rates);
  const thb = formatCurrencyTHBBase(property.price, 'THB', rates);

  const src = asSrc(property.images?.[0]);

  return (
    <div className="border p-2">
      <Link href={`/properties/${property.id}`}>
        <PropertyImage src={src} alt={title} />
        <h3 className="font-semibold mt-2">{title}</h3>
      </Link>
      <div>
        <div>{main}</div>
        {currency !== 'THB' && (
          <div className="text-sm text-gray-500">≈ {thb}</div>
        )}
      </div>
    </div>
  );
}
