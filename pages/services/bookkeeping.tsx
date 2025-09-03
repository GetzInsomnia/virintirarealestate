import { GetStaticProps } from 'next'
import { useRouter } from 'next/router'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'
import { NextSeo, FAQPageJsonLd } from 'next-seo'
import defaultSeo from '../../next-seo.config'
import LanguageSwitcher from '../../components/LanguageSwitcher'
import ServiceJsonLd from '../../components/ServiceJsonLd'

export default function Bookkeeping() {
  const { t } = useTranslation('common')
  const { asPath, defaultLocale } = useRouter()
  const lang = asPath.split('/')[1] || defaultLocale || 'th'
  const baseUrl = defaultSeo.baseUrl
  const pageUrl =
    lang === defaultLocale
      ? `${baseUrl}/services/bookkeeping`
      : `${baseUrl}/${lang}/services/bookkeeping`
  return (
    <>
      <NextSeo
        title={t('bookkeeping_service_name')}
        description={t('bookkeeping_service_description')}
        canonical={pageUrl}
        openGraph={{
          ...defaultSeo.openGraph,
          title: t('bookkeeping_service_name'),
          description: t('bookkeeping_service_description'),
          url: pageUrl,
        }}
      />
      <ServiceJsonLd
        name={t('bookkeeping_service_name')}
        description={t('bookkeeping_service_description')}
        provider={{ '@type': 'Organization', name: 'Virintira', url: baseUrl }}
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
