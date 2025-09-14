import MiniSearch from 'minisearch';

interface SearchRequest {
  query: string;
  province?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
  page?: number;
  pageSize?: number;
  sort?: 'price-asc' | 'price-desc' | 'created-desc' | 'created-asc';
}

interface PropertyDTO {
  id: number;
  title: { en: string; th: string };
  province: { en: string; th: string };
  type: string;
  price: number;
  priceBucket: string;
  amenities: string[];
  images: string[];
  createdAt: string;
}

interface SearchResponse {
  total: number;
  results: PropertyDTO[];
}

const indexCache: Record<string, MiniSearch<any>> = {};
let manifest: { shards: { key: string; province: string; type: string }[] } | null = null;

async function loadManifest() {
  if (!manifest) {
    const res = await fetch('/data/index/manifest.json');
    manifest = await res.json();
  }
  return manifest!;
}

async function loadIndex(key: string) {
  if (!indexCache[key]) {
    const res = await fetch(`/data/index/${key}.json`);
    const json = await res.json();
    indexCache[key] = MiniSearch.loadJSON(json, {
      fields: ['title_en', 'title_th', 'description_en', 'description_th'],
      storeFields: ['id', 'title_en', 'title_th', 'province', 'province_th', 'type', 'price', 'priceBucket', 'amenities', 'images', 'createdAt']
    });
  }
  return indexCache[key];
}

function applyFilters(docs: any[], req: SearchRequest) {
  return docs.filter((doc) => {
    if (req.minPrice !== undefined && doc.price < req.minPrice) return false;
    if (req.maxPrice !== undefined && doc.price > req.maxPrice) return false;
    if (req.amenities && req.amenities.length) {
      for (const a of req.amenities) {
        if (!doc.amenities.includes(a)) return false;
      }
    }
    return true;
  });
}

function sortResults(docs: any[], sort: SearchRequest['sort']) {
  switch (sort) {
    case 'price-asc':
      return docs.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return docs.sort((a, b) => b.price - a.price);
    case 'created-asc':
      return docs.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    case 'created-desc':
    default:
      return docs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}

self.onmessage = async (event: MessageEvent<SearchRequest>) => {
  const req = event.data;
  const man = await loadManifest();
  const shards = man.shards.filter((s) => {
    return (!req.province || s.province === req.province) && (!req.type || s.type === req.type);
  });

  const matches: any[] = [];
  for (const shard of shards) {
    const index = await loadIndex(shard.key);
    const res = index.search(req.query, { prefix: true });
    matches.push(...res.map(r => r));
  }

  const filtered = applyFilters(matches, req);
  const sorted = sortResults(filtered, req.sort);
  const page = req.page ?? 1;
  const pageSize = req.pageSize ?? 10;
  const start = (page - 1) * pageSize;
  const paginated = sorted.slice(start, start + pageSize);

  const results: PropertyDTO[] = paginated.map((doc: any) => ({
    id: doc.id,
    title: { en: doc.title_en, th: doc.title_th },
    province: { en: doc.province, th: doc.province_th },
    type: doc.type,
    price: doc.price,
    priceBucket: doc.priceBucket,
    amenities: doc.amenities,
    images: doc.images,
    createdAt: doc.createdAt
  }));

  const response: SearchResponse = { total: filtered.length, results };
  (self as any).postMessage(response);
};
