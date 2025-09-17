import fs from 'fs'
import path from 'path'
import { GetStaticPaths, GetStaticProps } from 'next'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
import Script from 'next/script'
import { getSeoUrls, getLanguageAlternates } from 'lib/seo'
import BreadcrumbJsonLd from '@/components/JsonLd/BreadcrumbJsonLd'
import { pdpCrumbs } from '@/lib/nav/crumbs'
import PropertyDetailPageContent, {
  Property,
  Article,
} from '@/views/properties/PropertyDetailPageContent'
import { asSrc } from '@/components/PropertyImage'
import type { ImgLike } from '@/components/PropertyImage'

interface Props {
  property: Property
  articles: Article[]
}

export default function PropertyDetail({ property, articles }: Props) {
  const router = useRouter()
  const lang = Array.isArray(router.query.locale)
    ? router.query.locale[0]
    : (router.query.locale as string)
  let titleLocale: 'en' | 'th' | 'zh' = 'en'
  if (lang === 'th' || lang === 'zh') {
    titleLocale = lang
  }
  const title = property.title[titleLocale] || property.title.en
  const provinceName =
    property.province[lang === 'th' ? 'th' : 'en'] || property.province.en
  const { pageUrl } = getSeoUrls(lang, `/properties/${property.id}`)
  const crumbs = pdpCrumbs(lang, property.id, title)

  return (
    <>
      <NextSeo
        title={title}
        canonical={pageUrl}
        languageAlternates={getLanguageAlternates(`/properties/${property.id}`)}
      />
      <BreadcrumbJsonLd items={crumbs} />
      <PropertyDetailPageContent
        property={property}
        articles={articles}
        lang={lang}
        title={title}
        provinceName={provinceName}
        crumbs={crumbs}
      />
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
            image: (property.images ?? []).map((img: ImgLike) => asSrc(img)),
          }).replace(/</g, '\\u003c'),
        }}
      />
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const dataPath = path.join(process.cwd(), 'public', 'data', 'properties.json')
  const properties: Property[] = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
  const locales = ['en', 'th', 'zh']
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
