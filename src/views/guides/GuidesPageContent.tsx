import Link from 'next/link'
import { useEffect, useState } from 'react'
import MiniSearch from 'minisearch'
import Script from 'next/script'
import Breadcrumbs from '../../components/Breadcrumbs'
import { Crumb } from '../../lib/nav/crumbs'

export interface Article {
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
  lang: string
  crumbs: Crumb[]
}

export default function GuidesPageContent({ articles, categories, lang, crumbs }: Props) {
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
      <Breadcrumbs items={crumbs} />
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
      {results.length > 0 && (
        <Script
          id='guides-itemlist'
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'ItemList',
              itemListElement: results.map((a, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                url: `/${lang}/guides/${a.slug}`,
              })),
            }).replace(/</g, '\\u003c'),
          }}
        />
      )}
    </div>
  )
}
