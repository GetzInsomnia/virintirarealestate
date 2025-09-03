import { GetStaticProps } from 'next'
import { useRouter } from 'next/router'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'
import {
  NextSeo,
  FAQPageJsonLd,
  WebPageJsonLd,
  BreadcrumbJsonLd,
} from 'next-seo'
import LanguageSwitcher from '../../components/LanguageSwitcher'
import ServiceJsonLd from '../../components/ServiceJsonLd'
import { getOpenGraph, getLanguageAlternates, getSeoUrls } from '../../lib/seo'

export default function Bookkeeping() {
  const { t } = useTranslation('common')
  const { locale, defaultLocale } = useRouter()
  const lang = locale || defaultLocale || 'th'
  const keywords = t('bookkeeping_service_keywords', { returnObjects: true }) as string[]
  const { baseUrl, siteUrl, pageUrl } = getSeoUrls(lang, '/services/bookkeeping')
  const homeUrl = siteUrl
  return (
    <>
      <NextSeo
        title={t('bookkeeping_service_name')}
        description={t('bookkeeping_service_description')}
        canonical={pageUrl}
        openGraph={getOpenGraph(
          lang,
          pageUrl,
          t('bookkeeping_service_name'),
          t('bookkeeping_service_description')
        )}
        additionalMetaTags={[
          {
            name: 'keywords',
            content: keywords.join(', '),
          },
        ]}
        languageAlternates={getLanguageAlternates('/services/bookkeeping')}
      />
      <WebPageJsonLd
        id={pageUrl}
        url={pageUrl}
        title={t('bookkeeping_service_name')}
        description={t('bookkeeping_service_description')}
      />
      <BreadcrumbJsonLd
        itemListElements={[
          {
            position: 1,
            name: t('seo_title'),
            item: homeUrl,
          },
          {
            position: 2,
            name: t('bookkeeping_service_name'),
            item: pageUrl,
          },
        ]}
      />
      <ServiceJsonLd
        id="bookkeeping-service-jsonld"
        name={t('bookkeeping_service_name')}
        description={t('bookkeeping_service_description')}
        provider={{ '@type': 'Organization', name: 'Virintira', url: siteUrl }}
        url={pageUrl}
      />
      <FAQPageJsonLd
        mainEntity={[
          {
            questionName: t('faq_question_1'),
            acceptedAnswerText: t('faq_answer_1'),
          },
        ]}
      />
      <LanguageSwitcher />
      <h1>{t('bookkeeping_service_name')}</h1>
      <p>{t('bookkeeping_service_description')}</p>
      <h2>FAQ</h2>
      <p>
        <strong>{t('faq_question_1')}</strong>
      </p>
      <p>{t('faq_answer_1')}</p>
    </>
  )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? 'th', ['common'])),
  },
})
