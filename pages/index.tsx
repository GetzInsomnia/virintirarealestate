import { GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'
import { NextSeo } from 'next-seo'
import { useRouter } from 'next/router'
import defaultSeo from '../next-seo.config'
import LanguageSwitcher from "./../components/LanguageSwitcher"

export default function Home() {
  const { t } = useTranslation('common')
  const { asPath, defaultLocale } = useRouter()
  const lang = asPath.split('/')[1] || defaultLocale || 'th'
  const ogLocale = lang === 'en' ? 'en_US' : 'th_TH'
  const baseUrl = 'https://your-domain.com'
  const pageUrl = lang === defaultLocale ? baseUrl : `${baseUrl}/${lang}`
  return (
    <>
      <NextSeo
        title={t('seo_title')}
        description={t('seo_description')}
        openGraph={{
          ...defaultSeo.openGraph,
          title: t('seo_title'),
          description: t('seo_description'),
          locale: ogLocale,
          url: pageUrl,
        }}
        languageAlternates={[
          { hrefLang: 'th', href: `${baseUrl}/th` },
          { hrefLang: 'en', href: `${baseUrl}/en` },
        ]}
      />
      <LanguageSwitcher />
      <h1>{t('welcome')}</h1>
    </>
  )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? 'th', ['common'])),
  },
})
