import type { NextApiRequest, NextApiResponse } from 'next';
import MiniSearch from 'minisearch';
import fs from 'fs/promises';
import path from 'path';
import { searchParamsSchema, type SearchParams } from '../../src/lib/validation/search';
import type { ProcessedImage } from '../../src/components/PropertyImage';
import { applyFilters, sortResults } from '../../src/lib/search/shared';

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

const indexCache: Record<string, MiniSearch<any>> = {};
let manifest: { shards: { key: string; province: string; type: string }[] } | null = null;
let amenitiesList: string[] | null = null;
let transitMap: Record<string, string[]> | null = null;

async function loadManifest() {
  if (!manifest) {
    const file = await fs.readFile(path.join(process.cwd(), 'public', 'data', 'index', 'manifest.json'), 'utf-8');
    manifest = JSON.parse(file);
  }
  return manifest!;
}

async function loadIndex(key: string) {
  if (!indexCache[key]) {
    const file = await fs.readFile(path.join(process.cwd(), 'public', 'data', 'index', `${key}.json`), 'utf-8');
    const json = JSON.parse(file);
    indexCache[key] = MiniSearch.loadJSON(json, {
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
    });
  }
  return indexCache[key];
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
  const params = parsed.data;

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

  const matches: any[] = [];
  for (const shard of shards) {
    const index = await loadIndex(shard.key);
    const resu = index.search(params.query || '', { prefix: true });
    matches.push(...resu.map((r) => r));
  }

  const filtered = applyFilters(matches, params);
  const sorted = sortResults(filtered, params.sort);
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;
  const start = (page - 1) * pageSize;
  const paginated = sorted.slice(start, start + pageSize);

  const results: PropertyDTO[] = paginated.map((doc: any) => ({
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

