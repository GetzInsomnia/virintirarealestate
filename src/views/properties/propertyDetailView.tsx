import fs from 'fs'
import path from 'path'
import { GetStaticPaths, GetStaticProps } from 'next'
import type { NextSeoProps } from 'next-seo'
import PropertyDetailPageContent, {
  Property,
  Article,
} from './PropertyDetailPageContent'
import { pdpCrumbs, Crumb } from '@/lib/nav/crumbs'
import { getLanguageAlternates, getSeoUrls } from '@/lib/seo'
import { asSrc, ImgLike } from '@/components/PropertyImage'

export interface PropertyDetailHeadProps {
  seo: NextSeoProps
  breadcrumb: Crumb[]
  realEstateJson: Record<string, unknown>
}

export interface PropertyDetailViewProps {
  property: Property
  articles: Article[]
  lang: string
  title: string
  provinceName: string
  crumbs: Crumb[]
  head: PropertyDetailHeadProps
}

export default function PropertyDetailView(props: PropertyDetailViewProps) {
  const { property, articles, lang, title, provinceName, crumbs } = props
  return (
    <PropertyDetailPageContent
      property={property}
      articles={articles}
      lang={lang}
      title={title}
      provinceName={provinceName}
      crumbs={crumbs}
    />
  )
}

export const getPropertyDetailStaticPaths: GetStaticPaths = async () => {
  const dataPath = path.join(process.cwd(), 'public', 'data', 'properties.json')
  const properties: Property[] = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
  const locales = ['en', 'th', 'zh']
  const paths = [] as { params: { locale: string; id: string } }[]
  for (const p of properties) {
    for (const locale of locales) {
      paths.push({ params: { locale, id: p.id.toString() } })
    }
  }
  return { paths, fallback: false }
}

export const getPropertyDetailStaticProps: GetStaticProps<PropertyDetailViewProps> = async ({
  params,
}) => {
  const { id, locale: lang = 'th' } = params as { id: string; locale: string }
  const dataPath = path.join(process.cwd(), 'public', 'data', 'properties.json')
  const properties: Property[] = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
  const property = properties.find((p) => p.id === Number(id))
  if (!property) {
    return { notFound: true }
  }
  const articlesRaw: any[] = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'public', 'data', 'articles.json'), 'utf-8'),
  )
  const articles: Article[] = articlesRaw.map((a) => ({
    slug: a.slug,
    category: a.category,
    provinces: a.provinces,
    coverImage: a.coverImage,
    title: a.locales[lang]?.title || a.locales.en.title,
  }))
  let titleLocale: 'en' | 'th' | 'zh' = 'en'
  if (lang === 'th' || lang === 'zh') {
    titleLocale = lang
  }
  const title = property.title[titleLocale] || property.title.en
  const provinceName = property.province[lang === 'th' ? 'th' : 'en'] || property.province.en
  const { pageUrl } = getSeoUrls(lang, `/properties/${property.id}`)
  const crumbs = pdpCrumbs(lang, property.id, title)

  const head: PropertyDetailHeadProps = {
    seo: {
      title,
      canonical: pageUrl,
      languageAlternates: getLanguageAlternates(`/properties/${property.id}`),
    },
    breadcrumb: crumbs,
    realEstateJson: {
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
    },
  }

  return {
    props: {
      property,
      articles,
      lang,
      title,
      provinceName,
      crumbs,
      head,
    },
  }
}

export const getStaticPaths = getPropertyDetailStaticPaths
export const getStaticProps = getPropertyDetailStaticProps
