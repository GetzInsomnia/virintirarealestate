import { GetStaticProps } from 'next'
import { useRouter } from 'next/router'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'
import {
  NextSeo,
  HowToJsonLd,
  WebPageJsonLd,
  BreadcrumbJsonLd,
} from 'next-seo'
import LanguageSwitcher from '../../components/LanguageSwitcher'
import { getOpenGraph, getLanguageAlternates, getSeoUrls } from '../../lib/seo'

export default function MonthlyStatements() {
  const { t } = useTranslation('common')
  const { locale, defaultLocale } = useRouter()
  const lang = locale || defaultLocale || 'th'
  const steps = t('howto_steps', { returnObjects: true }) as { name: string; text: string }[]
  const { siteUrl, pageUrl } = getSeoUrls(lang, '/how-to/monthly-statements')
  const homeUrl = siteUrl
  return (
    <>
      <NextSeo
        title={t('howto_title')}
        description={t('howto_description')}
        canonical={pageUrl}
        openGraph={getOpenGraph(
          lang,
          pageUrl,
          t('howto_title'),
          t('howto_description')
        )}
        languageAlternates={getLanguageAlternates('/how-to/monthly-statements')}
      />
      <WebPageJsonLd
        id={pageUrl}
        url={pageUrl}
        title={t('howto_title')}
        description={t('howto_description')}
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
            name: t('howto_title'),
            item: pageUrl,
          },
        ]}
      />
      <HowToJsonLd
        name={t('howto_title')}
        description={t('howto_description')}
        url={pageUrl}
        step={steps.map((s) => ({ name: s.name, text: s.text }))}
      />
      <LanguageSwitcher />
      <h1>{t('howto_title')}</h1>
      <ol>
        {steps.map((s, i) => (
          <li key={i}>
            <strong>{s.name}</strong>
            <p>{s.text}</p>
          </li>
        ))}
      </ol>
    </>
  )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? 'th', ['common'])),
  },
})
