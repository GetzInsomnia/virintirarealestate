import { GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'
import Head from 'next/head'
import LanguageSwitcher from "./../components/LanguageSwitcher"

export default function Home() {
  const { t } = useTranslation('common')
  return (
    <>
      <Head>
        <title>{t('seo_title')}</title>
        <meta name="description" content={t('seo_description')} />
      </Head>
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
