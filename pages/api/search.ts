import type { NextApiRequest, NextApiResponse } from 'next';
import MiniSearch from 'minisearch';
import fs from 'fs/promises';
import path from 'path';
import { searchParamsSchema, type SearchParams } from '../../src/lib/validation/search';
import type { ProcessedImage } from '../../src/components/PropertyImage';

interface PropertyDTO {
  id: number;
  title: { en: string; th: string };
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
      fields: ['title_en', 'title_th', 'description_en', 'description_th'],
      storeFields: ['id', 'title_en', 'title_th', 'province', 'province_th', 'type', 'price', 'priceBucket', 'amenities', 'images', 'createdAt'],
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
    transitStation: doc.transitStation,
  }));

  const response: SearchResponse = { total: filtered.length, results };
  res.status(200).json(response);
}

