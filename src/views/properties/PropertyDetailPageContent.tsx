import Link from 'next/link'
import PropertyImage, { ProcessedImage } from '../../components/PropertyImage'
import Breadcrumbs from '../../components/Breadcrumbs'
import { Crumb } from '../../lib/nav/crumbs'

export interface Property {
  id: number
  province: { en: string; th: string }
  type: string
  title: { en: string; th: string }
  price: number
  images: (string | ProcessedImage)[]
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
  const related = articles.filter(
    (a) => a.category === property.type || a.provinces.includes(property.province.en)
  )

  return (
    <div>
      <Breadcrumbs items={crumbs} />
      <div>
        {property.images.length > 0 ? (
          property.images.map((img, i) => (
            <PropertyImage key={typeof img === 'string' ? img : img.webp + i} src={img} alt={`${title} image ${i + 1}`} />
          ))
        ) : (
          <PropertyImage src={undefined} alt={`${title} placeholder`} />
        )}
      </div>
      <h1>{title}</h1>
      <p>{provinceName}</p>
      <p>{property.price}</p>
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
