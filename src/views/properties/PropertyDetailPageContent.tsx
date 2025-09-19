import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import PropertyPrice from '../../components/PropertyPrice'
import PropertyCard from '../../components/PropertyCard'
import { asSrc, ImgLike } from '../../components/PropertyImage'
import Breadcrumbs from '../../components/Breadcrumbs'
import { Crumb } from '../../lib/nav/crumbs'
import { useAdminPreview } from '../../context/AdminPreviewContext'

export interface TransitDetail {
  line?: string
  station?: string
  distanceMinutes?: number
  description?: string
}

export interface Property {
  id: number
  province: { en: string; th: string }
  type: string
  title: { en: string; th: string; zh?: string }
  description?: { en: string; th: string; zh?: string }
  price: number
  priceBucket?: string
  status?: string
  beds?: number
  baths?: number
  area?: number
  areaBuilt?: number
  furnished?: string | boolean
  amenities?: string[]
  nearTransit?: boolean
  transitLine?: string
  transitStation?: string
  transit?: TransitDetail[]
  images: ImgLike[]
}

export interface Article {
  slug: string
  category: string
  provinces: string[]
  coverImage: string
  title: string
}

interface SearchResponse {
  total: number
  results: Property[]
}

interface Props {
  property: Property
  articles: Article[]
  lang: string
  title: string
  provinceName: string
  crumbs: Crumb[]
}

const statusColorClasses: Record<string, string> = {
  sold: 'border-gray-600 bg-gray-50 text-gray-700',
  reserved: 'border-amber-400 bg-amber-100 text-amber-800',
  default: 'border-emerald-400 bg-emerald-50 text-emerald-700',
}

function formatLabel(value: string | number | boolean | undefined): string | null {
  if (value === undefined || value === null) return null
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No'
  }
  if (typeof value === 'number') {
    return value.toString()
  }
  const trimmed = value.trim()
  if (!trimmed) return null
  return trimmed
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function formatFurnished(value: string | boolean | undefined): string | null {
  if (value === undefined) return null
  if (typeof value === 'boolean') return value ? 'Furnished' : 'Unfurnished'
  return formatLabel(value)
}

function formatStatus(value: string | undefined, fallback: string): { label: string; classes: string } {
  const normalized = value?.toLowerCase() || fallback.toLowerCase()
  const label = formatLabel(value || fallback) || fallback
  const key = normalized.includes('sold')
    ? 'sold'
    : normalized.includes('reserv')
    ? 'reserved'
    : 'default'
  return { label, classes: statusColorClasses[key] ?? statusColorClasses.default }
}

export default function PropertyDetailPageContent({
  property,
  articles,
  lang,
  title,
  provinceName,
  crumbs,
}: Props) {
  const { isPreview, requestInlineEdit } = useAdminPreview()
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [mainImageLoaded, setMainImageLoaded] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [relatedProperties, setRelatedProperties] = useState<Property[]>([])
  const [relatedLoading, setRelatedLoading] = useState(true)

  const images = useMemo(() => property.images ?? [], [property.images])

  useEffect(() => {
    if (selectedImageIndex >= images.length) {
      setSelectedImageIndex(0)
    }
  }, [images.length, selectedImageIndex])

  const selectedImage = images[selectedImageIndex] ?? images[0]
  const selectedImageSrc = selectedImage ? asSrc(selectedImage) : undefined

  useEffect(() => {
    if (!selectedImageSrc) {
      setMainImageLoaded(true)
      return
    }
    setMainImageLoaded(false)
  }, [selectedImageSrc])

  useEffect(() => {
    if (typeof window === 'undefined') return
    let isActive = true
    setRelatedLoading(true)
    const worker = new Worker(new URL('../../workers/search.worker.ts', import.meta.url))
    worker.onmessage = (event: MessageEvent<SearchResponse>) => {
      if (!isActive) return
      const results = (event.data?.results ?? []).filter((p) => p.id !== property.id)
      setRelatedProperties(results.slice(0, 4))
      setRelatedLoading(false)
      worker.terminate()
    }
    worker.onerror = () => {
      if (!isActive) return
      setRelatedLoading(false)
      setRelatedProperties([])
      worker.terminate()
    }
    worker.postMessage({
      locale: lang,
      province: property.province?.en,
      type: property.type,
      page: 1,
      pageSize: 6,
    })
    return () => {
      isActive = false
      worker.terminate()
    }
  }, [lang, property.id, property.province?.en, property.type])

  let localeKey: 'en' | 'th' | 'zh' = 'en'
  if (lang === 'th' || lang === 'zh') {
    localeKey = lang
  }
  const description = property.description?.[localeKey] ?? property.description?.en
  const amenities = useMemo(
    () => (property.amenities ?? []).map((a) => formatLabel(a) ?? '').filter((a) => !!a),
    [property.amenities],
  )
  const transitDetails = useMemo(() => {
    if (Array.isArray(property.transit) && property.transit.length > 0) {
      return property.transit
    }
    if (property.transitLine || property.transitStation) {
      return [
        {
          line: property.transitLine,
          station: property.transitStation,
          description: property.nearTransit ? 'Near transit' : undefined,
        },
      ]
    }
    if (property.nearTransit) {
      return [
        {
          description: 'Near public transit',
        },
      ]
    }
    return []
  }, [property.nearTransit, property.transit, property.transitLine, property.transitStation])

  const specs = useMemo(
    () =>
      [
        property.beds !== undefined
          ? { label: 'Bedrooms', value: `${property.beds}` }
          : null,
        property.baths !== undefined
          ? { label: 'Bathrooms', value: `${property.baths}` }
          : null,
        property.area !== undefined
          ? { label: 'Area', value: `${property.area.toLocaleString()} sqm` }
          : null,
        property.areaBuilt !== undefined
          ? { label: 'Built Area', value: `${property.areaBuilt.toLocaleString()} sqm` }
          : null,
        formatFurnished(property.furnished)
          ? { label: 'Furnished', value: formatFurnished(property.furnished)! }
          : null,
      ].filter((item): item is { label: string; value: string } => item !== null),
    [property.area, property.areaBuilt, property.baths, property.beds, property.furnished],
  )

  const statusInfo = formatStatus(property.status, property.type)

  const relatedFallbackGuides = useMemo(() => {
    if (!relatedLoading && relatedProperties.length === 0) {
      return articles
        .filter((a) => a.category === property.type || a.provinces.includes(property.province.en))
        .slice(0, 4)
    }
    return []
  }, [articles, property.province.en, property.type, relatedLoading, relatedProperties.length])

  const InlineButton = (
    {
      label,
      path,
      children,
      variant = 'solid',
    }: {
      label: string
      path: string
      children: string
      variant?: 'solid' | 'outline'
    },
  ) => (
    <button
      type="button"
      onClick={() =>
        requestInlineEdit({
          type: 'property',
          id: property.id,
          label,
          path,
        })
      }
      className={`rounded px-3 py-1 text-xs font-semibold uppercase transition ${
        variant === 'solid'
          ? 'bg-amber-400 text-black shadow hover:bg-amber-300'
          : 'border border-amber-400 text-amber-700 hover:bg-amber-100'
      }`}
    >
      {children}
    </button>
  )

  return (
    <div className="space-y-8">
      <Breadcrumbs items={crumbs} />

      {isPreview && (
        <div className="flex flex-wrap justify-end gap-2 text-xs" aria-label="Inline edit controls">
          {InlineButton({
            label: `${title} gallery`,
            path: `/properties/${property.id}#gallery`,
            children: 'Edit gallery',
            variant: 'solid',
          })}
          {InlineButton({
            label: `${title} headline`,
            path: `/properties/${property.id}#hero`,
            children: 'Edit header',
            variant: 'outline',
          })}
          {InlineButton({
            label: `${title} pricing`,
            path: `/properties/${property.id}#pricing`,
            children: 'Edit pricing block',
            variant: 'outline',
          })}
          {InlineButton({
            label: `${title} amenities`,
            path: `/properties/${property.id}#amenities`,
            children: 'Edit amenities',
            variant: 'outline',
          })}
          {InlineButton({
            label: `${title} transit`,
            path: `/properties/${property.id}#transit`,
            children: 'Edit transit',
            variant: 'outline',
          })}
          {InlineButton({
            label: `${title} related properties`,
            path: `/properties/${property.id}#related`,
            children: 'Edit related properties',
            variant: 'outline',
          })}
        </div>
      )}

      <section id="gallery" className="space-y-3">
        <div className="relative w-full overflow-hidden rounded-xl bg-gray-100">
          <div className="relative aspect-[4/3] w-full">
            {selectedImageSrc ? (
              <>
                {!mainImageLoaded && <div className="absolute inset-0 animate-pulse bg-gray-200" aria-hidden="true" />}
                <Image
                  key={selectedImageSrc}
                  src={selectedImageSrc}
                  alt={`${title} image ${selectedImageIndex + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 80vw, 1024px"
                  className={`object-cover transition-opacity duration-500 ${
                    mainImageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoadingComplete={() => setMainImageLoaded(true)}
                  priority
                />
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  className="absolute bottom-4 right-4 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-gray-900 shadow backdrop-blur transition hover:bg-white"
                >
                  View gallery
                </button>
              </>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-gray-500">
                Image coming soon
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {images.length === 0 && (
            <div className="h-20 w-28 animate-pulse rounded-lg bg-gray-200" aria-hidden="true" />
          )}
          {images.map((img, idx) => {
            const isActive = idx === selectedImageIndex
            const thumbSrc = asSrc(img)
            if (!thumbSrc) return null
            return (
              <button
                key={`${thumbSrc}-${idx}`}
                type="button"
                onClick={() => setSelectedImageIndex(idx)}
                className={`relative h-20 w-28 flex-shrink-0 overflow-hidden rounded-lg border transition ${
                  isActive ? 'border-amber-500 ring-2 ring-amber-300' : 'border-transparent'
                }`}
                aria-label={`Select image ${idx + 1}`}
              >
                <Image
                  src={thumbSrc}
                  alt={`${title} thumbnail ${idx + 1}`}
                  fill
                  sizes="112px"
                  className="object-cover"
                />
              </button>
            )
          })}
        </div>
      </section>

      <section
        id="hero"
        className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-start"
      >
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-1 text-xs font-semibold tracking-wide uppercase ${
                statusInfo.classes
              }`}
            >
              {statusInfo.label}
            </span>
            <p className="text-sm text-gray-500">{provinceName}</p>
          </div>
          <h1 className="text-3xl font-semibold text-gray-900 md:text-4xl">{title}</h1>
          {description && <p className="text-base text-gray-600">{description}</p>}

          <div id="pricing" className="rounded-lg bg-gray-50 p-4 shadow-sm">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-gray-500">Listing price</span>
              <PropertyPrice priceTHB={property.price} />
            </div>
          </div>

          {specs.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {specs.map((spec) => (
                <div
                  key={spec.label}
                  className="rounded-lg border border-gray-200 p-4 shadow-sm"
                >
                  <div className="text-sm text-gray-500">{spec.label}</div>
                  <div className="mt-1 text-lg font-semibold text-gray-900">{spec.value}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <div id="amenities" className="rounded-lg border border-gray-200 p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Amenities</h2>
            {amenities.length > 0 ? (
              <ul className="mt-3 grid list-disc gap-2 pl-5 text-sm text-gray-600 sm:grid-cols-2">
                {amenities.map((amenity) => (
                  <li key={amenity}>{amenity}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-gray-500">Amenities information coming soon.</p>
            )}
          </div>

          <div id="transit" className="rounded-lg border border-gray-200 p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Nearby transit</h2>
            {transitDetails.length > 0 ? (
              <ul className="mt-3 space-y-3 text-sm text-gray-600">
                {transitDetails.map((item, index) => (
                  <li key={`${item.line ?? item.station ?? 'transit'}-${index}`}>
                    <div className="font-semibold text-gray-800">
                      {[item.line, item.station].filter(Boolean).join(' • ') || item.description || 'Transit option'}
                    </div>
                    {item.distanceMinutes !== undefined && (
                      <div className="text-xs text-gray-500">
                        Approx. {item.distanceMinutes} min walk
                      </div>
                    )}
                    {item.description && (item.line || item.station) && (
                      <div className="text-xs text-gray-500">{item.description}</div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-gray-500">Transit details will be provided soon.</p>
            )}
          </div>
        </aside>
      </section>

      <section id="related" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900">Related properties</h2>
          <Link
            href={`/${lang}/properties?province=${encodeURIComponent(property.province.en)}&type=${encodeURIComponent(property.type)}`}
            className="text-sm font-semibold text-amber-600 hover:text-amber-700"
          >
            View more
          </Link>
        </div>
        {relatedLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={`skeleton-${idx}`}
                className="h-64 animate-pulse rounded-lg border border-gray-200 bg-gray-100"
              />
            ))}
          </div>
        ) : relatedProperties.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProperties.map((related) => (
              <PropertyCard key={related.id} property={related} locale={lang} />
            ))}
          </div>
        ) : relatedFallbackGuides.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Explore helpful guides while similar listings are being prepared:
            </p>
            <ul className="grid gap-2 sm:grid-cols-2">
              {relatedFallbackGuides.map((guide) => (
                <li key={guide.slug} className="rounded-lg border border-gray-200 p-4 shadow-sm">
                  <Link
                    href={`/${lang}/guides/${guide.slug}`}
                    className="text-sm font-semibold text-amber-600 hover:text-amber-700"
                  >
                    {guide.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No related properties are available right now.</p>
        )}
      </section>

      {lightboxOpen && selectedImageSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="absolute inset-0" onClick={() => setLightboxOpen(false)} aria-hidden="true" />
          <div className="relative z-10 w-full max-w-5xl space-y-4">
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="ml-auto block rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-gray-900 shadow hover:bg-white"
            >
              Close
            </button>
            <div className="relative aspect-[3/2] w-full overflow-hidden rounded-lg bg-black">
              <Image
                src={selectedImageSrc}
                alt={`${title} large image`}
                fill
                sizes="(max-width: 1024px) 100vw, 960px"
                className="object-contain"
                priority
              />
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => {
                const isActive = idx === selectedImageIndex
                const thumbSrc = asSrc(img)
                if (!thumbSrc) return null
                return (
                  <button
                    key={`lightbox-thumb-${thumbSrc}-${idx}`}
                    type="button"
                    onClick={() => {
                      setSelectedImageIndex(idx)
                    }}
                    className={`relative h-16 w-24 flex-shrink-0 overflow-hidden rounded border transition ${
                      isActive ? 'border-amber-500 ring-2 ring-amber-300' : 'border-transparent'
                    }`}
                    aria-label={`Select image ${idx + 1}`}
                  >
                    <Image
                      src={thumbSrc}
                      alt={`${title} lightbox thumbnail ${idx + 1}`}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
