import fs from 'fs'
import path from 'path'
import { GetStaticPaths, GetStaticProps } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
import Script from 'next/script'
import PropertyImage, { ProcessedImage } from '@/src/components/PropertyImage'
import { getSeoUrls, getLanguageAlternates } from '@/lib/seo'

interface Property {
  id: number
  province: { en: string; th: string }
  type: string
  title: { en: string; th: string }
  price: number
  images: (string | ProcessedImage)[]
}

interface Article {
  slug: string
  category: string
  provinces: string[]
  coverImage: string
  title: string
}

interface Props {
  property: Property
  articles: Article[]
}

export default function PropertyDetail({ property, articles }: Props) {
  const router = useRouter()
  const lang = Array.isArray(router.query.locale)
    ? router.query.locale[0]
    : (router.query.locale as string)
  const title = property.title[lang as 'en' | 'th'] || property.title.en
  const provinceName =
    property.province[lang as 'en' | 'th'] || property.province.en
  const related = articles.filter(
    (a) => a.category === property.type || a.provinces.includes(property.province.en)
  )
  const { pageUrl } = getSeoUrls(lang, `/properties/${property.id}`)

  return (
    <div>
      <NextSeo
        title={title}
        canonical={pageUrl}
        languageAlternates={getLanguageAlternates(`/properties/${property.id}`)}
      />
      <div>
        {property.images.length > 0 ? (
          property.images.map((img, i) => (
            <PropertyImage key={img + i} src={img} alt={`${title} image ${i + 1}`} />
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
      <Script
        id='realestate-listing'
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'RealEstateListing',
            url: pageUrl,
            name: title,
            description: title,
            address: {
              '@type': 'PostalAddress',
              addressRegion: provinceName,
              addressCountry: 'TH',
            },
            offers: {
              '@type': 'Offer',
              price: property.price,
              priceCurrency: 'THB',
            },
            image: property.images.map((img) =>
              typeof img === 'string' ? img : img.webp
            ),
          }).replace(/</g, '\\u003c'),
        }}
      />
    </div>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const dataPath = path.join(process.cwd(), 'public', 'data', 'properties.json')
  const properties: Property[] = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
  const locales = ['en', 'th']
  const paths = []
  for (const p of properties) {
    for (const locale of locales) {
      paths.push({ params: { locale, id: p.id.toString() } })
    }
  }
  return { paths, fallback: false }
}

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const { id, locale } = params as { id: string; locale: string }
  const dataPath = path.join(process.cwd(), 'public', 'data', 'properties.json')
  const properties: Property[] = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
  const property = properties.find((p) => p.id === Number(id))!
  const articlesRaw: any[] = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'public', 'data', 'articles.json'), 'utf-8')
  )
  const articles: Article[] = articlesRaw.map((a) => ({
    slug: a.slug,
    category: a.category,
    provinces: a.provinces,
    coverImage: a.coverImage,
    title: a.locales[locale]?.title || a.locales.en.title,
  }))
  return { props: { property, articles } }
}
