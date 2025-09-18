import fs from 'fs'
import path from 'path'
import { GetStaticPaths, GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import type { NextSeoProps } from 'next-seo'
import type { ArticleJsonLdProps } from 'next-seo'
import type { MDXRemoteSerializeResult } from 'next-mdx-remote'
import { serialize } from 'next-mdx-remote/serialize'
import GuideDetailPageContent, { ArticleData } from './GuideDetailPageContent'
import { getLanguageAlternates, getSeoUrls } from '@/lib/seo'
import { guidesCrumbs, Crumb } from '@/lib/nav/crumbs'
import { loadCommonTranslation } from '@/views/shared/loadCommonTranslation'

export interface GuideDetailHeadProps {
  seo: NextSeoProps
  breadcrumb: Crumb[]
  articleJsonLd: ArticleJsonLdProps
}

export interface GuideDetailViewProps extends Record<string, unknown> {
  source: MDXRemoteSerializeResult
  article: ArticleData
  lang: string
  crumbs: Crumb[]
  head: GuideDetailHeadProps
}

export default function GuideDetailView({ source, article, crumbs }: GuideDetailViewProps) {
  return <GuideDetailPageContent source={source} article={article} crumbs={crumbs} />
}

export const getGuideDetailStaticPaths: GetStaticPaths = async () => {
  const dataPath = path.join(process.cwd(), 'public', 'data', 'articles.json')
  const raw: any[] = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
  const locales = ['en', 'th']
  const paths: { params: { locale: string; slug: string } }[] = []
  for (const article of raw) {
    for (const locale of locales) {
      if (article.locales[locale]) {
        paths.push({ params: { locale, slug: article.slug } })
      }
    }
  }
  return { paths, fallback: false }
}

export const getGuideDetailStaticProps: GetStaticProps<GuideDetailViewProps> = async ({
  params,
}) => {
  const { locale: lang = 'th', slug } = params as { locale: string; slug: string }
  const dataPath = path.join(process.cwd(), 'public', 'data', 'articles.json')
  const raw: any[] = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
  const entry = raw.find((a) => a.slug === slug)
  if (!entry) {
    return { notFound: true }
  }
  const mdxFile = path.join(
    process.cwd(),
    'public',
    'data',
    'articles',
    entry.locales[lang]?.mdx || entry.locales.en.mdx,
  )
  const sourceContent = fs.readFileSync(mdxFile, 'utf-8')
  const mdxSource = await serialize(sourceContent)
  const article: ArticleData = {
    slug: entry.slug,
    category: entry.category,
    coverImage: entry.coverImage,
    publishedAt: entry.publishedAt,
    provinces: entry.provinces,
    title: entry.locales[lang]?.title || entry.locales.en.title,
  }
  const translations = await serverSideTranslations(lang, ['common'])
  const common = loadCommonTranslation(lang)
  const brandName = common.Brand?.name || ''
  const { pageUrl } = getSeoUrls(lang, `/guides/${article.slug}`)
  const crumbs = guidesCrumbs(lang, article.slug, article.title)

  return {
    props: {
      source: mdxSource,
      article,
      lang,
      crumbs,
      head: {
        seo: {
          title: article.title,
          canonical: pageUrl,
          openGraph: { images: [{ url: article.coverImage }] },
          languageAlternates: getLanguageAlternates(`/guides/${article.slug}`),
        },
        breadcrumb: crumbs,
        articleJsonLd: {
          url: pageUrl,
          title: article.title,
          images: [article.coverImage],
          datePublished: article.publishedAt,
          authorName: [brandName],
          description: article.title,
        },
      },
      ...translations,
    },
  }
}

export const getStaticPaths = getGuideDetailStaticPaths
export const getStaticProps = getGuideDetailStaticProps
