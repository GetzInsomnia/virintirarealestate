import fs from 'fs';
import path from 'path';
import MiniSearch from 'minisearch';
import type { ProcessedImage } from '@/src/components/PropertyImage';

interface Property {
  id: number;
  province: { en: string; th: string };
  district?: { en: string; th: string };
  type: string;
  title: { en: string; th: string; zh?: string };
  description: { en: string; th: string; zh?: string };
  price: number;
  priceBucket: string;
  amenities: string[];
  images: (string | ProcessedImage | { src: string; alt?: string })[];
  createdAt: string;
  updatedAt: string;
  beds?: number;
  baths?: number;
  areaBuilt?: number;
  pricePerSqm?: number;
  status?: string;
  nearTransit?: boolean;
  furnished?: string;
  transitLine?: string;
  transitStation?: string;
}

type Locale = 'en' | 'th' | 'zh';

interface Doc {
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

interface SuggestionEntry {
  canonical: string;
  locales: Partial<Record<Locale, string>>;
}

function slug(value: string) {
  return value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export function buildIndexes() {
  const dataPath = path.join(process.cwd(), 'public', 'data', 'properties.json');
  const properties: Property[] = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

  const docs: Doc[] = properties.map((p) => ({
    id: p.id,
    province: p.province.en,
    province_th: p.province.th,
    type: p.type,
    title_en: p.title.en,
    title_th: p.title.th,
    title_zh: p.title.zh ?? p.title.en,
    description_en: p.description.en,
    description_th: p.description.th,
    description_zh: p.description.zh ?? p.description.en,
    price: p.price,
    priceBucket: p.priceBucket,
    amenities: p.amenities,
    images: p.images.map((img) =>
      typeof img === 'string'
        ? img
        : 'webp' in img
        ? (img as ProcessedImage).webp
        : (img as any).src
    ),
    createdAt: p.createdAt,
    beds: p.beds,
    baths: p.baths,
    status: p.status,
    pricePerSqm: p.pricePerSqm,
    areaBuilt: p.areaBuilt,
    nearTransit: p.nearTransit,
    furnished: p.furnished,
    transitLine: p.transitLine,
    transitStation: p.transitStation,
  }));

  const indexDir = path.join(process.cwd(), 'public', 'data', 'index');
  fs.rmSync(indexDir, { recursive: true, force: true });
  fs.mkdirSync(indexDir, { recursive: true });

  const suggestions = new Map<string, SuggestionEntry>();
  const manifest: { shards: { key: string; province: string; type: string }[] } = {
    shards: [],
  };

  const groups = new Map<string, Doc[]>();
  for (const doc of docs) {
    const key = `${slug(doc.province)}-${doc.type}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(doc);
    const canonical = doc.title_en;
    if (!suggestions.has(canonical)) {
      suggestions.set(canonical, { canonical, locales: { en: doc.title_en } });
    }
    const entry = suggestions.get(canonical)!;
    if (doc.title_th) entry.locales.th = doc.title_th;
    if (doc.title_zh) entry.locales.zh = doc.title_zh;
  }

  for (const [key, groupDocs] of groups.entries()) {
    const indexes: Partial<Record<Locale, any>> = {};
    const localeFields: Record<Locale, (keyof Doc)[]> = {
      en: ['title_en', 'description_en'],
      th: ['title_th', 'description_th'],
      zh: ['title_zh', 'description_zh'],
    };

    (Object.keys(localeFields) as Locale[]).forEach((locale) => {
      const mini = new MiniSearch<Doc>({
        fields: localeFields[locale],
        storeFields: ['id'],
      });
      mini.addAll(groupDocs);
      indexes[locale] = mini.toJSON();
    });

    const shardPayload = {
      shard: {
        key,
        province: groupDocs[0].province,
        type: groupDocs[0].type,
      },
      docs: groupDocs,
      indexes,
    };

    fs.writeFileSync(path.join(indexDir, `${key}.json`), JSON.stringify(shardPayload));
    const provinceName = groupDocs[0].province;
    manifest.shards.push({ key, province: provinceName, type: groupDocs[0].type });
  }

  fs.writeFileSync(path.join(indexDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  const suggestPath = path.join(indexDir, 'suggest.json');
  fs.writeFileSync(
    suggestPath,
    JSON.stringify({ suggestions: Array.from(suggestions.values()) }, null, 2)
  );
}

if (require.main === module) {
  buildIndexes();
  console.log('Indexes built');
}
