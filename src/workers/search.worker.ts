import MiniSearch from 'minisearch';
import { searchParamsSchema, type SearchParams } from '../lib/validation/search';
import { MIN_PRICE, MAX_PRICE, isValidPrice } from '../lib/filters/price';

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
  beds?: number;
  baths?: number;
  status?: string;
  nearTransit?: boolean;
  furnished?: string;
  transitLine?: string;
  transitStation?: string;
}

interface SearchResponse {
  total: number;
  results: PropertyDTO[];
}

const indexCache: Record<string, MiniSearch<any>> = {};
let manifest: { shards: { key: string; province: string; type: string }[] } | null = null;
let amenitiesList: string[] | null = null;
let transitMap: Record<string, string[]> | null = null;

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

async function loadAmenities() {
  if (!amenitiesList) {
    const res = await fetch('/data/amenities.json');
    const json = await res.json();
    amenitiesList = json.amenities || [];
  }
  return amenitiesList;
}

async function loadTransit() {
  if (!transitMap) {
    const res = await fetch('/data/transit-bkk.json');
    transitMap = await res.json();
  }
  return transitMap;
}

function applyFilters(docs: any[], req: SearchParams) {
  return docs.filter((doc) => {
    if (req.minPrice !== undefined && doc.price < req.minPrice) return false;
    if (req.maxPrice !== undefined && doc.price > req.maxPrice) return false;
    if (req.beds !== undefined && (doc.beds ?? 0) < req.beds) return false;
    if (req.baths !== undefined && (doc.baths ?? 0) < req.baths) return false;
    if (req.status && doc.status !== req.status) return false;
    if (req.freshness !== undefined) {
      const days = (Date.now() - new Date(doc.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      if (days > req.freshness) return false;
    }
    if (req.nearTransit && !doc.nearTransit) return false;
    if (req.transitLine && doc.transitLine !== req.transitLine) return false;
    if (req.transitStation && doc.transitStation !== req.transitStation) return false;
    if (req.furnished && doc.furnished !== req.furnished) return false;
    if (req.amenities && req.amenities.length) {
      for (const a of req.amenities) {
        if (!doc.amenities.includes(a)) return false;
      }
    }
    return true;
  });
}

function sortResults(docs: any[], sort: SearchParams['sort']) {
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

self.onmessage = async (event: MessageEvent<any>) => {
  const parsed = searchParamsSchema.safeParse(event.data);
  if (!parsed.success) {
    (self as any).postMessage({ total: 0, results: [] });
    return;
  }
  const req: SearchParams = parsed.data;
  if (req.minPrice !== undefined) {
    if (!isValidPrice(req.minPrice) || req.minPrice < MIN_PRICE) {
      req.minPrice = MIN_PRICE;
    }
  }
  if (req.maxPrice !== undefined) {
    if (!isValidPrice(req.maxPrice) || req.maxPrice > MAX_PRICE) {
      req.maxPrice = MAX_PRICE;
    }
  }
  if (
    req.minPrice !== undefined &&
    req.maxPrice !== undefined &&
    req.minPrice > req.maxPrice
  ) {
    [req.minPrice, req.maxPrice] = [req.maxPrice, req.minPrice];
  }
  const [amenities, transit] = await Promise.all([
    loadAmenities(),
    loadTransit(),
  ]);
  const amenitySet = new Set(amenities);
  req.amenities = req.amenities?.filter((a) => amenitySet.has(a));
  if (req.transitLine && !transit[req.transitLine]) {
    delete req.transitLine;
    delete req.transitStation;
  } else if (
    req.transitLine &&
    req.transitStation &&
    !transit[req.transitLine].includes(req.transitStation)
  ) {
    delete req.transitStation;
  }
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
    createdAt: doc.createdAt,
    beds: doc.beds,
    baths: doc.baths,
    status: doc.status,
    nearTransit: doc.nearTransit,
    furnished: doc.furnished,
    transitLine: doc.transitLine,
    transitStation: doc.transitStation
  }));

  const response: SearchResponse = { total: filtered.length, results };
  (self as any).postMessage(response);
};
