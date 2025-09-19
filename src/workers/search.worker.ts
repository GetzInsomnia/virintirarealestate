import MiniSearch, { type Options } from 'minisearch';
import { searchParamsSchema, type SearchParams } from '../lib/validation/search';
import { MIN_PRICE, MAX_PRICE, isValidPrice } from '../lib/filters/price';
import type { ProcessedImage } from '../components/PropertyImage';
import { applyFilters, sortResults } from '../lib/search/shared';
import { USE_API_READ } from '../lib/config';

type Locale = 'en' | 'th' | 'zh';

interface PropertyDTO {
  id: number;
  title: { en: string; th: string; zh?: string };
  province: { en: string; th: string };
  district?: { en: string; th?: string };
  type: string;
  price: number;
  priceBucket: string;
  amenities: string[];
  images: (string | ProcessedImage)[];
  createdAt: string;
  updatedAt?: string;
  beds?: number;
  baths?: number;
  status?: string;
  views?: number;
  nearTransit?: boolean;
  furnished?: string;
  transitLine?: string;
  transitStation?: string;
}

interface SearchResponse {
  total: number;
  results: PropertyDTO[];
}

interface SearchDoc {
  id: number;
  province: string;
  province_th: string;
  district?: string;
  district_th?: string;
  type: string;
  title_en: string;
  title_th: string;
  title_zh: string;
  description_en: string;
  description_th: string;
  description_zh: string;
  price: number;
  priceBucket: string;
  amenities: string[];
  images: string[];
  createdAt: string;
  updatedAt?: string;
  image?: string;
  beds?: number;
  baths?: number;
  status?: string;
  pricePerSqm?: number;
  areaBuilt?: number;
  area?: number;
  views?: number;
  tags?: string[];
  nearTransit?: boolean;
  furnished?: string;
  transitLine?: string;
  transitStation?: string;
}

interface ModernShard {
  docs: SearchDoc[];
  docMap: Map<number, SearchDoc>;
  indexes: Partial<Record<Locale, MiniSearch<SearchDoc>>>;
}

interface LegacyShard {
  legacy: true;
  index: MiniSearch<SearchDoc>;
}

type LoadedShard = ModernShard | LegacyShard;

const shardCache: Record<string, LoadedShard> = {};
let manifest: { shards: { key: string; province: string; type: string }[] } | null = null;
let amenitiesList: string[] | null = null;
let transitMap: Record<string, string[]> | null = null;

const MODERN_FIELDS: Record<Locale, (keyof SearchDoc)[]> = {
  en: ['title_en', 'description_en'],
  th: ['title_th', 'description_th'],
  zh: ['title_zh', 'description_zh'],
};

const LEGACY_FIELDS = [
  'title_en',
  'title_th',
  'title_zh',
  'description_en',
  'description_th',
  'description_zh',
] as const;

const LEGACY_STORE_FIELDS = [
  'id',
  'title_en',
  'title_th',
  'title_zh',
  'province',
  'province_th',
  'district',
  'district_th',
  'type',
  'price',
  'priceBucket',
  'amenities',
  'image',
  'images',
  'createdAt',
  'updatedAt',
  'beds',
  'baths',
  'status',
  'pricePerSqm',
  'area',
  'areaBuilt',
  'views',
  'tags',
  'description_en',
  'description_th',
  'description_zh',
  'nearTransit',
  'furnished',
  'transitLine',
  'transitStation',
] as const;

const LEGACY_OPTIONS: Options<SearchDoc> = {
  fields: [...LEGACY_FIELDS],
  storeFields: [...LEGACY_STORE_FIELDS],
};

function isLegacyShard(shard: LoadedShard): shard is LegacyShard {
  return 'legacy' in shard && shard.legacy;
}

function localePriority(locale?: string): Locale[] {
  const bases: Locale[] = ['en', 'th', 'zh'];
  if (!locale) return bases;
  const lower = locale.toLowerCase();
  if (!['en', 'th', 'zh'].includes(lower)) return bases;
  const preferred = lower as Locale;
  return [preferred, ...bases.filter((loc) => loc !== preferred)];
}

function toStringOrEmpty(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function toNumberOrUndefined(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return undefined;
}

function mapLegacyDoc(raw: any, id: number): SearchDoc {
  const images: string[] = Array.isArray(raw?.images)
    ? (raw.images as unknown[]).filter((value): value is string => typeof value === 'string')
    : [];
  const image = typeof raw?.image === 'string' ? raw.image : undefined;
  if (image && !images.includes(image)) {
    images.push(image);
  }

  const priceValue = Number(raw?.price);

  return {
    id,
    province: toStringOrEmpty(raw?.province),
    province_th: toStringOrEmpty(raw?.province_th),
    district: toStringOrEmpty(raw?.district),
    district_th: toStringOrEmpty(raw?.district_th),
    type: toStringOrEmpty(raw?.type),
    title_en: toStringOrEmpty(raw?.title_en),
    title_th: toStringOrEmpty(raw?.title_th),
    title_zh: toStringOrEmpty(raw?.title_zh),
    description_en: toStringOrEmpty(raw?.description_en),
    description_th: toStringOrEmpty(raw?.description_th),
    description_zh: toStringOrEmpty(raw?.description_zh),
    price: Number.isFinite(priceValue) ? priceValue : 0,
    priceBucket: toStringOrEmpty(raw?.priceBucket),
    amenities: Array.isArray(raw?.amenities)
      ? (raw.amenities as unknown[]).filter((value): value is string => typeof value === 'string')
      : [],
    images,
    image,
    createdAt: toStringOrEmpty(raw?.createdAt),
    updatedAt: toStringOrEmpty(raw?.updatedAt),
    beds: toNumberOrUndefined(raw?.beds),
    baths: toNumberOrUndefined(raw?.baths),
    status: toStringOrEmpty(raw?.status),
    pricePerSqm: toNumberOrUndefined(raw?.pricePerSqm),
    areaBuilt: toNumberOrUndefined(raw?.areaBuilt),
    area: toNumberOrUndefined(raw?.area),
    views: toNumberOrUndefined(raw?.views),
    tags: Array.isArray(raw?.tags)
      ? (raw.tags as unknown[]).filter((value): value is string => typeof value === 'string')
      : undefined,
    nearTransit: typeof raw?.nearTransit === 'boolean' ? raw.nearTransit : undefined,
    furnished: toStringOrEmpty(raw?.furnished),
    transitLine: toStringOrEmpty(raw?.transitLine),
    transitStation: toStringOrEmpty(raw?.transitStation),
  };
}

async function loadManifest() {
  if (!manifest) {
    if (!USE_API_READ) {
      manifest = { shards: [] };
      return manifest;
    }
    try {
      const res = await fetch('/data/index/manifest.json');
      if (!res.ok) {
        manifest = { shards: [] };
      } else {
        manifest = await res.json();
      }
    } catch {
      manifest = { shards: [] };
    }
  }
  return manifest!;
}

async function loadShard(key: string): Promise<LoadedShard> {
  if (!shardCache[key]) {
    try {
      const res = await fetch(`/data/index/${key}.json`);
      if (!res.ok) {
        throw new Error('Missing shard');
      }
      const file = await res.text();
      const json = JSON.parse(file);
      if (json && typeof json === 'object' && 'indexes' in json && 'docs' in json) {
        const docs: SearchDoc[] = Array.isArray(json.docs) ? json.docs : [];
        const docMap = new Map<number, SearchDoc>();
        for (const doc of docs) {
          docMap.set(doc.id, doc);
        }
        const indexes: Partial<Record<Locale, MiniSearch<SearchDoc>>> = {};
        (Object.keys(MODERN_FIELDS) as Locale[]).forEach((locale) => {
          const indexJson = json.indexes?.[locale];
          if (typeof indexJson === 'string') {
            indexes[locale] = MiniSearch.loadJSON<SearchDoc>(indexJson, {
              fields: [...MODERN_FIELDS[locale]],
              storeFields: ['id'],
            });
          } else if (indexJson && typeof indexJson === 'object') {
            indexes[locale] = MiniSearch.loadJSON<SearchDoc>(
              JSON.stringify(indexJson),
              {
                fields: [...MODERN_FIELDS[locale]],
                storeFields: ['id'],
              }
            );
          }
        });
        shardCache[key] = { docs, docMap, indexes };
      } else {
        shardCache[key] = {
          legacy: true,
          index: MiniSearch.loadJSON<SearchDoc>(
            typeof json === 'string' ? json : file,
            LEGACY_OPTIONS
          ),
        };
      }
    } catch {
      shardCache[key] = {
        docs: [],
        docMap: new Map<number, SearchDoc>(),
        indexes: {},
      } as ModernShard;
    }
  }
  return shardCache[key];
}

async function loadAmenities() {
  if (!amenitiesList) {
    try {
      const res = await fetch('/data/amenities.json');
      if (res.ok) {
        const json = await res.json();
        amenitiesList = json.amenities || [];
      } else {
        amenitiesList = [];
      }
    } catch {
      amenitiesList = [];
    }
  }
  return amenitiesList;
}

async function loadTransit() {
  if (!transitMap) {
    try {
      const res = await fetch('/data/transit-bkk.json');
      if (res.ok) {
        transitMap = await res.json();
      } else {
        transitMap = null;
      }
    } catch {
      transitMap = null;
    }
  }
  return transitMap;
}

self.onmessage = async (event: MessageEvent<any>) => {
  const parsed = searchParamsSchema.safeParse(event.data);
  if (!parsed.success) {
    (self as any).postMessage({ total: 0, results: [] });
    return;
  }
  const req: (SearchParams & { locale?: string }) = parsed.data as any;
  const [amenities, transit] = await Promise.all([
    loadAmenities(),
    loadTransit(),
  ]);
  const amenitySet = new Set(amenities);
  req.amenities = req.amenities?.filter((a) => amenitySet.has(a));
  if (!transit) {
    delete req.transitLine;
    delete req.transitStation;
  } else if (req.transitLine && !transit[req.transitLine]) {
    delete req.transitLine;
    delete req.transitStation;
  } else if (
    req.transitLine &&
    req.transitStation &&
    (!transit[req.transitLine] || !transit[req.transitLine].includes(req.transitStation))
  ) {
    delete req.transitStation;
  }
  const man = await loadManifest();
  const shards = man.shards;

  const matches: SearchDoc[] = [];
  const seen = new Set<number>();
  const query = req.query?.trim() ?? '';
  const priorities = localePriority(req.locale);
  for (const shardInfo of shards) {
    const shard = await loadShard(shardInfo.key);
    if (isLegacyShard(shard)) {
      const res = shard.index.search(query, { prefix: true, fuzzy: 0.2 });
      for (const r of res) {
        const id = typeof r.id === 'number' ? r.id : Number(r.id);
        if (!Number.isFinite(id) || seen.has(id)) continue;
        matches.push(mapLegacyDoc(r, id));
        seen.add(id);
      }
      if (!query) {
        const storeDocs = ((shard.index as any)?.documentStore?.docs ?? {}) as Record<string, unknown>;
        const docs = Object.values(storeDocs);
        for (const entry of docs) {
          const value = (entry as any)?.store;
          const docId = value?.id;
          const numericId = typeof docId === 'number' ? docId : Number(docId);
          if (!value || !Number.isFinite(numericId) || seen.has(numericId)) continue;
          matches.push(mapLegacyDoc(value, numericId));
          seen.add(numericId);
        }
      }
      continue;
    }

    if (!query) {
      for (const doc of shard.docs) {
        if (!seen.has(doc.id)) {
          matches.push(doc);
          seen.add(doc.id);
        }
      }
      continue;
    }

    for (const locale of priorities) {
      const index = shard.indexes[locale];
      if (!index) continue;
      const res = index.search(query, { prefix: true, fuzzy: 0.2 });
      for (const r of res) {
        const docId = typeof r.id === 'number' ? r.id : Number(r.id);
        if (!Number.isFinite(docId) || seen.has(docId)) continue;
        const doc = shard.docMap.get(docId);
        if (doc) {
          matches.push(doc);
          seen.add(doc.id);
        }
      }
    }
  }

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
  const filtered = applyFilters(matches, req);
  const sorted = sortResults(filtered, req.sort);
  const page = req.page ?? 1;
  const pageSize = req.pageSize ?? 10;
  const start = (page - 1) * pageSize;
  const paginated = sorted.slice(start, start + pageSize);

  const results: PropertyDTO[] = paginated.map((doc: SearchDoc) => ({
    id: doc.id,
    title: { en: doc.title_en, th: doc.title_th, zh: doc.title_zh },
    province: { en: doc.province, th: doc.province_th },
    district: doc.district
      ? { en: doc.district, th: doc.district_th }
      : undefined,
    type: doc.type,
    price: doc.price,
    priceBucket: doc.priceBucket,
    amenities: doc.amenities,
    images: doc.images,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    beds: doc.beds,
    baths: doc.baths,
    status: doc.status,
    views: doc.views,
    nearTransit: doc.nearTransit,
    furnished: doc.furnished,
    transitLine: doc.transitLine,
    transitStation: doc.transitStation,
  }));

  const response: SearchResponse = { total: filtered.length, results };
  (self as any).postMessage(response);
};
