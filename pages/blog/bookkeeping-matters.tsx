import { GetStaticProps } from 'next'
import { useRouter } from 'next/router'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'
import {
  NextSeo,
  ArticleJsonLd,
  WebPageJsonLd,
  BreadcrumbJsonLd,
} from 'next-seo'
import Script from 'next/script'
import LanguageSwitcher from '../../components/LanguageSwitcher'
import { getOpenGraph, getLanguageAlternates, getSeoUrls } from '../../lib/seo'

export default function BookkeepingMatters() {
  const { t } = useTranslation('common')
  const { locale, defaultLocale } = useRouter()
  const lang = locale || defaultLocale || 'th'
  const keywords = t('blog_post_keywords', { returnObjects: true }) as string[]
  const { baseUrl, siteUrl, pageUrl } = getSeoUrls(lang, '/blog/bookkeeping-matters')
  const homeUrl = siteUrl
  return (
    <>
      <NextSeo
        title={t('blog_post_title')}
        description={t('blog_post_description')}
        canonical={pageUrl}
        openGraph={{
          ...getOpenGraph(
            lang,
            pageUrl,
            t('blog_post_title'),
            t('blog_post_description')
          ),
          images: [
            {
              url: `${baseUrl}/og-blog.png`,
              width: 1845,
              height: 871,
              alt: `${t('blog_post_title')} Open Graph Image`,
            },
          ],
        }}
        additionalMetaTags={[
          {
            name: 'keywords',
            content: keywords.join(', '),
          },
        ]}
        languageAlternates={getLanguageAlternates('/blog/bookkeeping-matters')}
      />
      <WebPageJsonLd
        id={pageUrl}
        url={pageUrl}
        title={t('blog_post_title')}
        description={t('blog_post_description')}
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
            name: t('blog_post_title'),
            item: pageUrl,
          },
        ]}
      />
      <ArticleJsonLd
        url={pageUrl}
        title={t('blog_post_title')}
        images={[`${baseUrl}/og-blog.png`]}
        datePublished="2023-01-01"
        dateModified="2023-01-01"
        authorName={t('blog_post_author')}
        description={t('blog_post_description')}
        publisherName="Virintira"
        publisherLogo={`${baseUrl}/favicon.ico`}
      />
      {/* eslint-disable-next-line react/no-danger */}
      <Script
        id='speakable'
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: t('blog_post_title'),
            description: t('blog_post_description'),
            url: pageUrl,
            speakable: {
              '@type': 'SpeakableSpecification',
              cssSelector: ['h1', 'p'],
            },
          }).replace(/</g, '\\u003c'),
        }}
      />
      <LanguageSwitcher />
      <h1>{t('blog_post_title')}</h1>
      <p>{t('blog_post_description')}</p>
    </>
  )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? 'th', ['common'])),
  },
})
