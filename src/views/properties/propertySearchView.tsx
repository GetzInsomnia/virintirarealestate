import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import Script from 'next/script'
import { GetServerSideProps } from 'next'
import type { NextSeoProps } from 'next-seo'
import PropertyFilters, { Filters } from '@/components/PropertyFilters'
import PropertyCard from '@/components/PropertyCard'
import { filterParamsSchema } from '@/lib/validation/search'
import { listingCrumbs, Crumb } from '@/lib/nav/crumbs'
import Breadcrumbs from '@/components/Breadcrumbs'
import { getLanguageAlternates, getSeoUrls } from '@/lib/seo'

interface SearchResponse {
  total: number
  results: any[]
}

export interface PropertySearchHeadProps {
  seo: NextSeoProps
  breadcrumb: Crumb[]
}

export interface PropertySearchViewProps {
  lang: string
  initialFilters: Filters
  crumbs: Crumb[]
  head: PropertySearchHeadProps
}

export default function PropertySearchView({
  lang,
  initialFilters,
  crumbs,
}: PropertySearchViewProps) {
  const router = useRouter()
  const [filters, setFilters] = useState<Filters>(initialFilters)
  const [results, setResults] = useState<any[]>([])

  useEffect(() => {
    setFilters(initialFilters)
  }, [initialFilters])

  const runSearch = useCallback(
    (f: Filters) => {
      if (typeof window === 'undefined') return
      const worker = new Worker(new URL('../../workers/search.worker.ts', import.meta.url))
      worker.onmessage = (e: MessageEvent<SearchResponse>) => {
        setResults(e.data.results)
        worker.terminate()
      }
      worker.postMessage({ locale: lang, query: '', ...f })
    },
    [lang],
  )

  useEffect(() => {
    runSearch(initialFilters)
  }, [initialFilters, runSearch])

  const handleChange = useCallback(
    (f: Filters) => {
      const safe = filterParamsSchema.parse(f) as Filters
      setFilters(safe)
      const query = Object.fromEntries(
        Object.entries(safe).filter(([, v]) =>
          Array.isArray(v) ? v.length > 0 : v !== undefined && v !== ''
        ),
      )
      router.replace({ pathname: router.pathname, query }, undefined, { shallow: true })
      runSearch(safe)
    },
    [router, runSearch],
  )

  const itemListJson = useMemo(() => {
    if (results.length === 0) return null
    return {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: results.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `/${lang}/properties/${p.id}`,
      })),
    }
  }, [results, lang])

  return (
    <div className='p-4 space-y-4'>
      <Breadcrumbs items={crumbs} />
      <PropertyFilters filters={filters} onChange={handleChange} />
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        {results.map((p) => (
          <PropertyCard key={p.id} property={p} locale={lang} />
        ))}
      </div>
      {itemListJson && (
        <Script
          id='property-itemlist'
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(itemListJson).replace(/</g, '\\u003c'),
          }}
        />
      )}
    </div>
  )
}

export const getPropertySearchServerSideProps: GetServerSideProps<
  PropertySearchViewProps
> = async ({ locale, defaultLocale, query }) => {
  const lang = locale || defaultLocale || 'th'
  const parsed = filterParamsSchema.safeParse(query)
  const initialFilters = (parsed.success ? parsed.data : {}) as Filters
  const crumbs = listingCrumbs(lang)
  const { pageUrl } = getSeoUrls(lang, '/properties')
  return {
    props: {
      lang,
      initialFilters,
      crumbs,
      head: {
        seo: {
          title: 'Property Listings',
          canonical: pageUrl,
          languageAlternates: getLanguageAlternates('/properties'),
        },
        breadcrumb: crumbs,
      },
    },
  }
}

export const getServerSideProps = getPropertySearchServerSideProps
