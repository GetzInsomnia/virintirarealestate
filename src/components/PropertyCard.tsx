import Link from 'next/link';
import PropertyImage from './PropertyImage';
import { useCurrency } from '../context/CurrencyContext';
import { formatCurrencyTHBBase } from '../lib/fx/convert';

type ImgLike = string | { src: string };

const asSrc = (img?: ImgLike): string | undefined =>
  typeof img === 'string' ? img : img?.src;

interface Property {
  id: number;
  title: { en: string; th: string };
  price: number;
  images: ImgLike[];
}

interface Props {
  property: Property;
  locale: string;
}

export default function PropertyCard({ property, locale }: Props) {
  const { currency, rates } = useCurrency();
  const title = property.title[locale as 'en' | 'th'] || property.title.en;
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
