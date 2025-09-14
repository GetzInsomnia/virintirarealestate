import { GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'
import {
  NextSeo,
  LocalBusinessJsonLd,
  WebPageJsonLd,
  BreadcrumbJsonLd,
  SiteLinksSearchBoxJsonLd,
} from 'next-seo'
import { useRouter } from 'next/router'
import Script from 'next/script'
import LanguageSwitcher from "./../components/LanguageSwitcher"
import CurrencySwitcher from "../src/components/CurrencySwitcher"
import PropertyPrice from "../src/components/PropertyPrice"
import { getOpenGraph, getLanguageAlternates, getSeoUrls } from '../lib/seo'

export default function Home() {
  const { t } = useTranslation('common')
  const { locale, defaultLocale } = useRouter()
  const lang = locale || defaultLocale || 'th'
  const keywords = t('seo_keywords', { returnObjects: true }) as string[]
  const { baseUrl, siteUrl, pageUrl } = getSeoUrls(lang)
  return (
    <>
      <NextSeo
        title={t('seo_title')}
        description={t('seo_description')}
        canonical={pageUrl}
        openGraph={{
          ...getOpenGraph(
            lang,
            pageUrl,
            t('seo_title'),
            t('seo_description')
          ),
          images: [
            {
              url: `${baseUrl}/og-home.png`,
              width: 1845,
              height: 871,
              alt: `${t('seo_title')} Open Graph Image`,
            },
          ],
        }}
        additionalMetaTags={[{
          name: 'keywords',
          content: keywords.join(', '),
        }]}
        languageAlternates={getLanguageAlternates()}
      />
      <WebPageJsonLd
        id={pageUrl}
        url={pageUrl}
        title={t('seo_title')}
        description={t('seo_description')}
      />
      <BreadcrumbJsonLd
        itemListElements={[{
          position: 1,
          name: t('seo_title'),
          item: pageUrl,
        }]}
      />
      <LocalBusinessJsonLd
        type='AccountingService'
        id={siteUrl}
        name='Virintira'
        description='Multilingual accounting partner.'
        url={siteUrl}
        telephone='+66-2-123-4567'
        address={{
          streetAddress: '123 Example Road',
          addressLocality: 'Bangkok',
          addressRegion: 'Bangkok',
          postalCode: '10110',
          addressCountry: 'TH',
        }}
        geo={{ latitude: '13.7563', longitude: '100.5018' }}
        openingHours={[{
          opens: '09:00',
          closes: '17:00',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        }]}
      />
      <SiteLinksSearchBoxJsonLd
        url={siteUrl}
        potentialActions={[
          {
            target: `${siteUrl}/search?query={search_term_string}`,
            queryInput: 'search_term_string',
          },
        ]}
      />
      {/* eslint-disable-next-line react/no-danger */}
      <Script
        id='speakable'
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: t('seo_title'),
            description: t('seo_description'),
            url: pageUrl,
            speakable: {
              '@type': 'SpeakableSpecification',
              cssSelector: ['h1', 'p'],
            },
          }).replace(/</g, '\\u003c'),
        }}
      />
      <LanguageSwitcher />
      <CurrencySwitcher />
      <PropertyPrice priceTHB={1000000} />
      <h1>{t('welcome')}</h1>
      <p>{keywords.join(', ')}</p>
    </>
  )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? 'th', ['common'])),
  },
})
