import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
import Script from 'next/script'
import PropertyFilters, { Filters } from '../src/components/PropertyFilters'
import PropertyCard from '../src/components/PropertyCard'
import { filterParamsSchema } from '../src/lib/validation/search'
import { getLanguageAlternates, getSeoUrls } from '../lib/seo'
import Breadcrumbs from '@/src/components/Breadcrumbs'
import BreadcrumbJsonLd from '@/src/components/JsonLd/BreadcrumbJsonLd'
import { listingCrumbs } from '@/src/lib/nav/crumbs'

interface SearchResponse {
  total: number;
  results: any[];
}

export default function PropertySearchPage() {
  const router = useRouter()
  const locale = router.locale || router.defaultLocale || 'en'
  const [filters, setFilters] = useState<Filters>({})
  const [results, setResults] = useState<any[]>([])
  const { pageUrl } = getSeoUrls(locale, '/properties')
  const crumbs = listingCrumbs(locale)

  const runSearch = (f: Filters) => {
    const worker = new Worker(new URL('../src/workers/search.worker.ts', import.meta.url))
    worker.onmessage = (e: MessageEvent<SearchResponse>) => {
      setResults(e.data.results)
      worker.terminate()
    }
    worker.postMessage({ query: '', ...f })
  }

  useEffect(() => {
    const parsed = filterParamsSchema.safeParse(router.query);
    if (parsed.success) {
      const q = parsed.data as Filters;
      setFilters(q);
      runSearch(q);
    } else {
      runSearch({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (f: Filters) => {
    const safe = filterParamsSchema.parse(f) as Filters
    setFilters(safe)
    const query = Object.fromEntries(
      Object.entries(safe).filter(([, v]) => v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0))
    )
    router.replace({ pathname: router.pathname, query }, undefined, { shallow: true })
    runSearch(safe)
  }

  return (
    <div className='p-4 space-y-4'>
      <NextSeo
        title='Property Listings'
        canonical={pageUrl}
        languageAlternates={getLanguageAlternates('/properties')}
      />
      <BreadcrumbJsonLd items={crumbs} />
      <Breadcrumbs items={crumbs} />
      <PropertyFilters filters={filters} onChange={handleChange} />
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {results.map((p) => (
          <PropertyCard key={p.id} property={p} locale={locale} />
        ))}
      </div>
      {results.length > 0 && (
        <Script
          id='property-itemlist'
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'ItemList',
              itemListElement: results.map((p, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                url: `/${locale}/properties/${p.id}`,
              })),
            }).replace(/</g, '\\u003c'),
          }}
        />
      )}
    </div>
  )
}
