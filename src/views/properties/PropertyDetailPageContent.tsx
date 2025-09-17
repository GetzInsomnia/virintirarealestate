import Link from 'next/link'
import PropertyImage, { asSrc, ImgLike } from '../../components/PropertyImage'
import Breadcrumbs from '../../components/Breadcrumbs'
import { Crumb } from '../../lib/nav/crumbs'
import { useAdminPreview } from '../../context/AdminPreviewContext'

export interface Property {
  id: number
  province: { en: string; th: string }
  type: string
  title: { en: string; th: string; zh?: string }
  price: number
  images: ImgLike[]
}

export interface Article {
  slug: string
  category: string
  provinces: string[]
  coverImage: string
  title: string
}

interface Props {
  property: Property
  articles: Article[]
  lang: string
  title: string
  provinceName: string
  crumbs: Crumb[]
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
  const related = articles.filter(
    (a) => a.category === property.type || a.provinces.includes(property.province.en)
  )

  return (
    <div>
      <Breadcrumbs items={crumbs} />
      {isPreview && (
        <div className="mb-2 flex justify-end">
          <button
            type="button"
            onClick={() =>
              requestInlineEdit({
                type: 'property',
                id: property.id,
                label: `${title} gallery`,
                path: `/properties/${property.id}#gallery`,
              })
            }
            className="rounded bg-amber-400 px-3 py-1 text-xs font-semibold uppercase text-black shadow transition hover:bg-amber-300"
          >
            Edit gallery
          </button>
        </div>
      )}
      <div>
        {(property.images ?? []).length > 0 ? (
          (property.images ?? []).map((img, i) => {
            const src = asSrc(img)
            return (
              <PropertyImage
                key={src}
                src={src}
                alt={`${title} image ${i + 1}`}
              />
            )
          })
        ) : (
          <PropertyImage src={undefined} alt={`${title} placeholder`} />
        )}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold">{title}</h1>
        {isPreview && (
          <button
            type="button"
            onClick={() =>
              requestInlineEdit({
                type: 'property',
                id: property.id,
                label: `${title} headline`,
                path: `/properties/${property.id}#hero`,
              })
            }
            className="rounded border border-amber-400 px-3 py-1 text-xs font-semibold uppercase text-amber-700 transition hover:bg-amber-100"
          >
            Edit header
          </button>
        )}
      </div>
      <p>{provinceName}</p>
      <p>{property.price}</p>
      {isPreview && (
        <div className="my-3 flex flex-wrap gap-2 text-xs uppercase text-amber-600">
          <button
            type="button"
            onClick={() =>
              requestInlineEdit({
                type: 'property',
                id: property.id,
                label: `${title} pricing`,
                path: `/properties/${property.id}#pricing`,
              })
            }
            className="rounded border border-amber-400 px-2 py-1 font-semibold transition hover:bg-amber-50"
          >
            Edit pricing block
          </button>
          <button
            type="button"
            onClick={() =>
              requestInlineEdit({
                type: 'property',
                id: property.id,
                label: `${title} related guides`,
                path: `/properties/${property.id}#related`,
              })
            }
            className="rounded border border-amber-400 px-2 py-1 font-semibold transition hover:bg-amber-50"
          >
            Edit related guides
          </button>
        </div>
      )}
      <h2>Related Guides</h2>
      <ul>
        {related.map((a) => (
          <li key={a.slug}>
            <Link href={`/${lang}/guides/${a.slug}`}>{a.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
