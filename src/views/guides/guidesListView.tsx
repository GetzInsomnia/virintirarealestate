import fs from 'fs'
import path from 'path'
import { GetStaticPaths, GetStaticProps } from 'next'
import type { NextSeoProps } from 'next-seo'
import GuidesPageContent, { Article } from './GuidesPageContent'
import { getLanguageAlternates, getSeoUrls } from '@/lib/seo'
import { guidesCrumbs, Crumb } from '@/lib/nav/crumbs'

export interface GuidesListHeadProps {
  seo: NextSeoProps
  breadcrumb: Crumb[]
}

export interface GuidesListViewProps {
  lang: string
  articles: Article[]
  categories: string[]
  crumbs: Crumb[]
  head: GuidesListHeadProps
}

export default function GuidesListView({
  articles,
  categories,
  lang,
  crumbs,
}: GuidesListViewProps) {
  return (
    <GuidesPageContent
      articles={articles}
      categories={categories}
      lang={lang}
      crumbs={crumbs}
    />
  )
}

export const getGuidesListStaticPaths: GetStaticPaths = async () => {
  const locales = ['en', 'th']
  const paths = locales.map((locale) => ({ params: { locale } }))
  return { paths, fallback: false }
}

export const getGuidesListStaticProps: GetStaticProps<GuidesListViewProps> = async ({
  params,
}) => {
  const lang = (params?.locale as string) || 'th'
  const dataPath = path.join(process.cwd(), 'public', 'data', 'articles.json')
  const raw: any[] = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
  const articles: Article[] = raw.map((a) => ({
    slug: a.slug,
    category: a.category,
    coverImage: a.coverImage,
    publishedAt: a.publishedAt,
    provinces: a.provinces,
    title: a.locales[lang]?.title || a.locales.en.title,
  }))
  const categories = Array.from(new Set(raw.map((a) => a.category)))
  const crumbs = guidesCrumbs(lang)
  const { pageUrl } = getSeoUrls(lang, '/guides')

  return {
    props: {
      lang,
      articles,
      categories,
      crumbs,
      head: {
        seo: {
          title: 'Guides',
          canonical: pageUrl,
          languageAlternates: getLanguageAlternates('/guides'),
        },
        breadcrumb: crumbs,
      },
    },
  }
}

export const getStaticPaths = getGuidesListStaticPaths
export const getStaticProps = getGuidesListStaticProps
