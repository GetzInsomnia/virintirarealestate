import type { NextApiRequest, NextApiResponse } from 'next';
import MiniSearch from 'minisearch';
import fs from 'fs/promises';
import path from 'path';
import { searchParamsSchema, type SearchParams } from '../../src/lib/validation/search';
import type { ProcessedImage } from '../../src/components/PropertyImage';
import { applyFilters, sortResults } from '../../src/lib/search/shared';

type Locale = 'en' | 'th' | 'zh';

interface PropertyDTO {
  id: number;
  title: { en: string; th: string; zh?: string };
  province: { en: string; th: string };
  type: string;
  price: number;
  priceBucket: string;
  amenities: string[];
  images: (string | ProcessedImage)[];
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

interface SearchDoc {
  id: number;
  province: string;
  province_th: string;
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
  beds?: number;
  baths?: number;
  status?: string;
  pricePerSqm?: number;
  areaBuilt?: number;
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
  index: MiniSearch<any>;
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

const LEGACY_OPTIONS = {
  fields: [
    'title_en',
    'title_th',
    'title_zh',
    'description_en',
    'description_th',
    'description_zh',
  ],
  storeFields: [
    'id',
    'title_en',
    'title_th',
    'title_zh',
    'province',
    'province_th',
    'type',
    'price',
    'priceBucket',
    'amenities',
    'images',
    'createdAt',
    'beds',
    'baths',
    'status',
    'pricePerSqm',
    'areaBuilt',
    'description_en',
    'description_th',
    'description_zh',
  ],
} as const;

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

async function loadManifest() {
  if (!manifest) {
    const file = await fs.readFile(path.join(process.cwd(), 'public', 'data', 'index', 'manifest.json'), 'utf-8');
    manifest = JSON.parse(file);
  }
  return manifest!;
}

async function loadShard(key: string): Promise<LoadedShard> {
  if (!shardCache[key]) {
    const file = await fs.readFile(path.join(process.cwd(), 'public', 'data', 'index', `${key}.json`), 'utf-8');
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
        if (indexJson) {
          indexes[locale] = MiniSearch.loadJSON(indexJson, {
            fields: MODERN_FIELDS[locale],
            storeFields: ['id'],
          });
        }
      });
      shardCache[key] = { docs, docMap, indexes };
    } else {
      shardCache[key] = {
        legacy: true,
        index: MiniSearch.loadJSON(json, LEGACY_OPTIONS),
      };
    }
  }
  return shardCache[key];
}

async function loadAmenities() {
  if (!amenitiesList) {
    try {
      const file = await fs.readFile(path.join(process.cwd(), 'public', 'data', 'amenities.json'), 'utf-8');
      const json = JSON.parse(file);
      amenitiesList = json.amenities || [];
    } catch {
      amenitiesList = [];
    }
  }
  return amenitiesList;
}

async function loadTransit() {
  if (!transitMap) {
    try {
      const file = await fs.readFile(path.join(process.cwd(), 'public', 'data', 'transit-bkk.json'), 'utf-8');
      transitMap = JSON.parse(file);
    } catch {
      transitMap = {} as any;
    }
  }
  return transitMap;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const parsed = searchParamsSchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid search parameters' });
    return;
  }
  const params = parsed.data as SearchParams & { locale?: string };

  const [amenities, transit] = await Promise.all([
    loadAmenities(),
    loadTransit(),
  ]);
  const amenitySet = new Set(amenities);
  params.amenities = params.amenities?.filter((a) => amenitySet.has(a));
  if (params.transitLine && !transit[params.transitLine]) {
    delete params.transitLine;
    delete params.transitStation;
  } else if (
    params.transitLine &&
    params.transitStation &&
    !transit[params.transitLine].includes(params.transitStation)
  ) {
    delete params.transitStation;
  }

  const man = await loadManifest();
  const shards = man.shards.filter((s) => {
    return (!params.province || s.province === params.province) && (!params.type || s.type === params.type);
  });

  const matches: SearchDoc[] = [];
  const seen = new Set<number>();
  const query = params.query?.trim() ?? '';
  const priorities = localePriority(params.locale);
  for (const shardInfo of shards) {
    const shard = await loadShard(shardInfo.key);
    if (isLegacyShard(shard)) {
      const resu = shard.index.search(query, { prefix: true, fuzzy: 0.2 });
      for (const r of resu) {
        const id = typeof r.id === 'number' ? r.id : Number(r.id);
        if (!Number.isFinite(id) || seen.has(id)) continue;
        matches.push(r as SearchDoc);
        seen.add(id);
      }
      if (!query) {
        const store = (shard.index as any).documentStore;
        const docs = store ? Object.values(store.docs || {}) : [];
        for (const entry of docs) {
          const value = entry?.store;
          const docId = value?.id;
          const numericId = typeof docId === 'number' ? docId : Number(docId);
          if (!value || !Number.isFinite(numericId) || seen.has(numericId)) continue;
          matches.push(value as SearchDoc);
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
      const resu = index.search(query, { prefix: true, fuzzy: 0.2 });
      for (const r of resu) {
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

  if (params.minPrice !== undefined) {
    if (!isValidPrice(params.minPrice) || params.minPrice < MIN_PRICE) {
      params.minPrice = MIN_PRICE;
    }
  }
  if (params.maxPrice !== undefined) {
    if (!isValidPrice(params.maxPrice) || params.maxPrice > MAX_PRICE) {
      params.maxPrice = MAX_PRICE;
    }
  }
  if (
    params.minPrice !== undefined &&
    params.maxPrice !== undefined &&
    params.minPrice > params.maxPrice
  ) {
    [params.minPrice, params.maxPrice] = [params.maxPrice, params.minPrice];
  }

  const filtered = applyFilters(matches, params);
  const sorted = sortResults(filtered, params.sort);
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;
  const start = (page - 1) * pageSize;
  const paginated = sorted.slice(start, start + pageSize);

  const results: PropertyDTO[] = paginated.map((doc: SearchDoc) => ({
    id: doc.id,
    title: { en: doc.title_en, th: doc.title_th, zh: doc.title_zh },
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
    transitStation: doc.transitStation,
  }));

  const response: SearchResponse = { total: filtered.length, results };
  res.status(200).json(response);
}
