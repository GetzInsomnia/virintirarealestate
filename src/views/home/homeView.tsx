import { GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import type {
  NextSeoProps,
  LocalBusinessJsonLdProps,
  WebPageJsonLdProps,
} from 'next-seo'
import HomePageContent from './HomePageContent'
import { getOpenGraph, getLanguageAlternates, getSeoUrls } from '@/lib/seo'
import { loadCommonTranslation } from '@/views/shared/loadCommonTranslation'

export interface HomeHeadProps {
  seo: NextSeoProps
  webPage: WebPageJsonLdProps
  breadcrumb: { position: number; name: string; item: string }[]
  localBusiness: LocalBusinessJsonLdProps
  websiteJson: Record<string, unknown>
  speakableJson: Record<string, unknown>
}

export interface HomeViewProps extends Record<string, unknown> {
  lang: string
  keywords: string[]
  head: HomeHeadProps
}

export default function HomeView({ keywords }: HomeViewProps) {
  return <HomePageContent keywords={keywords} />
}

export const getHomeStaticProps: GetStaticProps<HomeViewProps> = async ({
  locale,
  defaultLocale,
}) => {
  const lang = locale || defaultLocale || 'th'
  const translations = await serverSideTranslations(lang, ['common'])
  const common = loadCommonTranslation(lang)
  const keywords = Array.isArray(common.seo_keywords) ? common.seo_keywords : []
  const title = typeof common.seo_title === 'string' ? common.seo_title : ''
  const description =
    typeof common.seo_description === 'string' ? common.seo_description : ''
  const brandName = common.Brand?.name || ''
  const brandTagline = common.Brand?.tagline || ''
  const { baseUrl, siteUrl, pageUrl } = getSeoUrls(lang)

  const head: HomeHeadProps = {
    seo: {
      title,
      description,
      canonical: pageUrl,
      openGraph: {
        ...getOpenGraph(lang, pageUrl, title, description),
        images: [
          {
            url: `${baseUrl}/og-home.png`,
            width: 1845,
            height: 871,
            alt: `${title} Open Graph Image`,
          },
        ],
      },
      additionalMetaTags: [
        {
          name: 'keywords',
          content: keywords.join(', '),
        },
      ],
      languageAlternates: getLanguageAlternates(),
    },
    webPage: {
      id: pageUrl,
      url: pageUrl,
      title,
      description,
    },
    breadcrumb: [
      {
        position: 1,
        name: title,
        item: pageUrl,
      },
    ],
    localBusiness: {
      type: 'RealEstateAgent',
      id: siteUrl,
      name: brandName,
      description: brandTagline,
      url: siteUrl,
      telephone: '+66-2-123-4567',
      address: {
        streetAddress: '123 Example Road',
        addressLocality: 'Bangkok',
        addressRegion: 'Bangkok',
        postalCode: '10110',
        addressCountry: 'TH',
      },
      geo: { latitude: '13.7563', longitude: '100.5018' },
      openingHours: [
        {
          opens: '09:00',
          closes: '17:00',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        },
      ],
    },
    websiteJson: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      url: siteUrl,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${siteUrl}/search?query={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
    speakableJson: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: title,
      description,
      url: pageUrl,
      speakable: {
        '@type': 'SpeakableSpecification',
        cssSelector: ['h1', 'p'],
      },
    },
  }

  return {
    props: {
      lang,
      keywords,
      head,
      ...translations,
    },
  }
}

export const getStaticProps = getHomeStaticProps
