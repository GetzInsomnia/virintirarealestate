import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import PropertyFilters, { Filters } from '../src/components/PropertyFilters';
import PropertyCard from '../src/components/PropertyCard';
import { filterParamsSchema } from '../src/lib/validation/search';

interface SearchResponse {
  total: number;
  results: any[];
}

export default function PropertySearchPage() {
  const router = useRouter();
  const locale = router.locale || router.defaultLocale || 'en';
  const [filters, setFilters] = useState<Filters>({});
  const [results, setResults] = useState<any[]>([]);

  const runSearch = (f: Filters) => {
    const worker = new Worker(new URL('../src/workers/search.worker.ts', import.meta.url));
    worker.onmessage = (e: MessageEvent<SearchResponse>) => {
      setResults(e.data.results);
      worker.terminate();
    };
    worker.postMessage({ query: '', ...f });
  };

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
    const safe = filterParamsSchema.parse(f) as Filters;
    setFilters(safe);
    const query = Object.fromEntries(
      Object.entries(safe).filter(([, v]) => v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0))
    );
    router.replace({ pathname: router.pathname, query }, undefined, { shallow: true });
    runSearch(safe);
  };

  return (
    <div className="p-4 space-y-4">
      <PropertyFilters filters={filters} onChange={handleChange} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {results.map((p) => (
          <PropertyCard key={p.id} property={p} locale={locale} />
        ))}
      </div>
    </div>
  );
}
