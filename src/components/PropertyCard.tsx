import Link from 'next/link';
import PropertyImage, { asSrc, ImgLike } from './PropertyImage';
import { useCurrency } from '../context/CurrencyContext';
import { useAdminPreview } from '../context/AdminPreviewContext';
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
  const { isPreview, requestInlineEdit } = useAdminPreview();
  let localeKey: 'en' | 'th' | 'zh' = 'en';
  if (locale === 'th' || locale === 'zh') {
    localeKey = locale;
  }
  const title = property.title[localeKey] ?? property.title.en;
  const main = formatCurrencyTHBBase(property.price, currency, rates);
  const thb = formatCurrencyTHBBase(property.price, 'THB', rates);

  const src = asSrc(property.images?.[0]);

  return (
    <div className="relative border p-2">
      {isPreview && (
        <button
          type="button"
          onClick={() =>
            requestInlineEdit({
              type: 'property',
              id: property.id,
              label: property.title.en,
              path: `/properties/${property.id}`,
            })
          }
          className="absolute right-2 top-2 rounded bg-amber-400 px-2 py-1 text-xs font-semibold text-black shadow transition hover:bg-amber-300"
        >
          Inline edit
        </button>
      )}
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
