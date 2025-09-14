import fs from 'fs'
import path from 'path'
import { GetStaticPaths, GetStaticProps } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import MiniSearch from 'minisearch'

interface Article {
  slug: string
  category: string
  coverImage: string
  publishedAt: string
  provinces: string[]
  title: string
}

interface Props {
  articles: Article[]
  categories: string[]
}

export default function GuidesList({ articles, categories }: Props) {
  const router = useRouter()
  const lang = Array.isArray(router.query.locale)
    ? router.query.locale[0]
    : (router.query.locale as string)

  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [mini, setMini] = useState<MiniSearch<Article> | null>(null)
  const [results, setResults] = useState<Article[]>(articles)

  useEffect(() => {
    async function load() {
      const res = await fetch(`/data/index/articles-${lang}.json`)
      const json = await res.json()
      const m = MiniSearch.loadJSON(json, {
        idField: 'slug',
        fields: ['title', 'category', 'provinces'],
        storeFields: ['slug', 'title', 'category', 'provinces'],
      }) as MiniSearch<Article>
      setMini(m)
    }
    load()
  }, [lang])

  useEffect(() => {
    if (!mini) {
      setResults(filterCategory(articles, category))
      return
    }
    if (!query) {
      setResults(filterCategory(articles, category))
    } else {
      const hits = mini.search(query, { prefix: true }) as any[]
      const slugs = new Set(hits.map((h) => h.id))
      const filtered = articles.filter((a) => slugs.has(a.slug))
      setResults(filterCategory(filtered, category))
    }
  }, [query, category, mini, articles])

  function filterCategory(list: Article[], cat: string) {
    if (!cat) return list
    return list.filter((a) => a.category === cat)
  }

  return (
    <div>
      <h1>Guides</h1>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder='Search guides'
      />
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value=''>All categories</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>
      <ul>
        {results.map((a) => (
          <li key={a.slug}>
            <Link href={`/${lang}/guides/${a.slug}`}>
              <img src={a.coverImage} alt='' width={100} />
              <span>{a.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
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
