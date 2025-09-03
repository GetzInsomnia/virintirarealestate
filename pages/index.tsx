import { GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'
import {
  NextSeo,
  LocalBusinessJsonLd,
  WebPageJsonLd,
  BreadcrumbJsonLd,
} from 'next-seo'
import { useRouter } from 'next/router'
import defaultSeo from '../next-seo.config'
import LanguageSwitcher from "./../components/LanguageSwitcher"

export default function Home() {
  const { t } = useTranslation('common')
  const { locale, defaultLocale } = useRouter()
  const lang = locale || defaultLocale || 'th'
  const keywords = t('seo_keywords', { returnObjects: true }) as string[]
  const ogLocale =
    lang === 'en' ? 'en_US' : lang === 'zh' ? 'zh_CN' : 'th_TH'
  const baseUrl = defaultSeo.baseUrl
  const pageUrl = lang === defaultLocale ? baseUrl : `${baseUrl}/${lang}`
  return (
    <>
      <NextSeo
        title={t('seo_title')}
        description={t('seo_description')}
        canonical={pageUrl}
        openGraph={{
          ...defaultSeo.openGraph,
          title: t('seo_title'),
          description: t('seo_description'),
          locale: ogLocale,
          url: pageUrl,
        }}
        additionalMetaTags={[{
          name: 'keywords',
          content: keywords.join(', '),
        }]}
        languageAlternates={[
          { hrefLang: 'th', href: `${baseUrl}/th` },
          { hrefLang: 'en', href: `${baseUrl}/en` },
          { hrefLang: 'zh', href: `${baseUrl}/zh` },
          { hrefLang: 'x-default', href: baseUrl },
        ]}
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
        id={baseUrl}
        name='Virintira'
        description='Multilingual accounting partner.'
        url={baseUrl}
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
      <LanguageSwitcher />
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
