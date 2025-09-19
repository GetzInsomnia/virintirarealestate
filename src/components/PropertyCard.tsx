import Link from 'next/link';
import PropertyImage, { asSrc, ImgLike } from './PropertyImage';
import PropertyPrice from './PropertyPrice';
import { useAdminPreview } from '../context/AdminPreviewContext';

interface Property {
  id: number;
  title: { en: string; th: string; zh?: string };
  price: number;
  images: ImgLike[];
  status?: string;
}

interface Props {
  property: Property;
  locale: string;
}

export default function PropertyCard({ property, locale }: Props) {
  const { isPreview, requestInlineEdit } = useAdminPreview();
  let localeKey: 'en' | 'th' | 'zh' = 'en';
  if (locale === 'th' || locale === 'zh') {
    localeKey = locale;
  }
  const title = property.title[localeKey] ?? property.title.en;
  const status = property.status?.toUpperCase();
  const statusLabel = status
    ? status
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase())
    : null;
  const badgeClass =
    status === 'SOLD'
      ? 'bg-gray-600 text-white'
      : status === 'RESERVED'
      ? 'bg-amber-500 text-black'
      : 'bg-emerald-500 text-white';
  const containerClass = `relative border p-2 ${
    status === 'SOLD' ? 'opacity-80 grayscale' : ''
  }`;

  const src = asSrc(property.images?.[0]);

  return (
    <div className={containerClass}>
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
      {statusLabel && (
        <span className={`absolute left-2 top-2 rounded px-2 py-1 text-xs font-semibold ${badgeClass}`}>
          {statusLabel}
        </span>
      )}
      <div className="mt-2">
        <PropertyPrice priceTHB={property.price} />
      </div>
    </div>
  );
}
