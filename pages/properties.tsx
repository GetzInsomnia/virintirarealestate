import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import PropertyFilters, { Filters } from '../src/components/PropertyFilters';
import PropertyCard from '../src/components/PropertyCard';
import { z } from 'zod';

const querySchema = z.object({
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  beds: z.coerce.number().optional(),
  baths: z.coerce.number().optional(),
  status: z.string().optional(),
  freshness: z.coerce.number().optional(),
  nearTransit: z.coerce.boolean().optional(),
  furnished: z.string().optional(),
  sort: z.string().optional(),
  amenities: z
    .union([z.string(), z.array(z.string())])
    .transform((val) => (Array.isArray(val) ? val : [val]))
    .optional(),
});

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
    const parsed = querySchema.safeParse(router.query);
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
    setFilters(f);
    const query = Object.fromEntries(
      Object.entries(f).filter(([, v]) => v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0))
    );
    router.replace({ pathname: router.pathname, query }, undefined, { shallow: true });
    runSearch(f);
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
