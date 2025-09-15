import { useEffect, useRef, useState } from 'react';

// simple in-memory cache shared across hook instances
const responseCache = new Map<string, unknown>();

/**
 * Fetch a JSON resource with caching and abort support.
 *
 * Subsequent calls with the same URL reuse cached data.
 * Pending requests are aborted when the component unmounts.
 */
export default function useCachedFetch<T = unknown>(url: string) {
  const cacheRef = useRef(responseCache);
  const [data, setData] = useState<T | null>(() => {
    return (cacheRef.current.get(url) as T) ?? null;
  });
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(() => !cacheRef.current.has(url));

  useEffect(() => {
    if (cacheRef.current.has(url)) {
      // Data already cached; no need to fetch.
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    fetch(url, { signal: controller.signal })
      .then((res) => res.json())
      .then((json) => {
        cacheRef.current.set(url, json);
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        if ((err as Error).name === 'AbortError') {
          return;
        }
        setError(err as Error);
        setLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [url]);

  return { data, error, loading };
}
