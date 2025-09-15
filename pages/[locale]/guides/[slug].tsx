import fs from 'fs'
import path from 'path'
import { GetStaticPaths, GetStaticProps } from 'next'
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote'
import { serialize } from 'next-mdx-remote/serialize'
import { useRouter } from 'next/router'
import { NextSeo, ArticleJsonLd } from 'next-seo'
import { getSeoUrls, getLanguageAlternates } from '@/lib/seo'
import Breadcrumbs from '@/src/components/Breadcrumbs'
import BreadcrumbJsonLd from '@/src/components/JsonLd/BreadcrumbJsonLd'
import { guidesCrumbs } from '@/src/lib/nav/crumbs'

interface ArticleData {
  slug: string
  category: string
  coverImage: string
  publishedAt: string
  provinces: string[]
  title: string
}

interface Props {
  source: MDXRemoteSerializeResult
  article: ArticleData
}

export default function GuideDetail({ source, article }: Props) {
  const router = useRouter()
  const lang = Array.isArray(router.query.locale)
    ? router.query.locale[0]
    : (router.query.locale as string)
  const { pageUrl } = getSeoUrls(lang, `/guides/${article.slug}`)
  const crumbs = guidesCrumbs(lang, article.slug, article.title)

  return (
    <div>
      <NextSeo
        title={article.title}
        canonical={pageUrl}
        openGraph={{ images: [{ url: article.coverImage }] }}
        languageAlternates={getLanguageAlternates(`/guides/${article.slug}`)}
      />
      <BreadcrumbJsonLd items={crumbs} />
      <Breadcrumbs items={crumbs} />
      <ArticleJsonLd
        url={pageUrl}
        title={article.title}
        images={[article.coverImage]}
        datePublished={article.publishedAt}
        authorName={['Virintira']}
        description={article.title}
      />
      <h1>{article.title}</h1>
      <MDXRemote {...source} />
    </div>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
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

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const { locale, slug } = params as { locale: string; slug: string }
  const dataPath = path.join(process.cwd(), 'public', 'data', 'articles.json')
  const raw: any[] = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
  const entry = raw.find((a) => a.slug === slug)
  const mdxFile = path.join(process.cwd(), 'public', 'data', 'articles', entry.locales[locale]?.mdx || entry.locales.en.mdx)
  const source = fs.readFileSync(mdxFile, 'utf-8')
  const mdxSource = await serialize(source)
  const article: ArticleData = {
    slug: entry.slug,
    category: entry.category,
    coverImage: entry.coverImage,
    publishedAt: entry.publishedAt,
    provinces: entry.provinces,
    title: entry.locales[locale]?.title || entry.locales.en.title,
  }
  return { props: { source: mdxSource, article } }
}
