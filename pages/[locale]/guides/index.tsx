import fs from 'fs'
import path from 'path'
import { GetStaticPaths, GetStaticProps } from 'next'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
import { getSeoUrls, getLanguageAlternates } from 'lib/seo'
import BreadcrumbJsonLd from '@/components/JsonLd/BreadcrumbJsonLd'
import { guidesCrumbs } from '@/lib/nav/crumbs'
import GuidesPageContent, { Article } from '@/views/guides/GuidesPageContent'

interface Props {
  articles: Article[]
  categories: string[]
}

export default function GuidesList({ articles, categories }: Props) {
  const router = useRouter()
  const lang = Array.isArray(router.query.locale)
    ? router.query.locale[0]
    : (router.query.locale as string)
  const { pageUrl } = getSeoUrls(lang, '/guides')
  const crumbs = guidesCrumbs(lang)

  return (
    <>
      <NextSeo
        title='Guides'
        canonical={pageUrl}
        languageAlternates={getLanguageAlternates('/guides')}
      />
      <BreadcrumbJsonLd items={crumbs} />
      <GuidesPageContent
        articles={articles}
        categories={categories}
        lang={lang}
        crumbs={crumbs}
      />
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const locales = ['en', 'th']
  const paths = locales.map((locale) => ({ params: { locale } }))
  return { paths, fallback: false }
}

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const locale = params?.locale as string
  const dataPath = path.join(process.cwd(), 'public', 'data', 'articles.json')
  const raw: any[] = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
  const articles: Article[] = raw.map((a) => ({
    slug: a.slug,
    category: a.category,
    coverImage: a.coverImage,
    publishedAt: a.publishedAt,
    provinces: a.provinces,
    title: a.locales[locale]?.title || a.locales.en.title,
  }))
  const categories = Array.from(new Set(raw.map((a) => a.category)))
  return { props: { articles, categories } }
}
