import fs from 'fs';
import path from 'path';
import MiniSearch from 'minisearch';
import type { ProcessedImage } from '@/src/components/PropertyImage';

interface Property {
  id: number;
  province: { en: string; th: string };
  type: string;
  title: { en: string; th: string };
  description: { en: string; th: string };
  price: number;
  priceBucket: string;
  amenities: string[];
  images: (string | ProcessedImage)[];
  createdAt: string;
  updatedAt: string;
}

interface Doc {
  id: number;
  province: string;
  province_th: string;
  type: string;
  title_en: string;
  title_th: string;
  description_en: string;
  description_th: string;
  price: number;
  priceBucket: string;
  amenities: string[];
  images: string[];
  createdAt: string;
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
    description_en: p.description.en,
    description_th: p.description.th,
    price: p.price,
    priceBucket: p.priceBucket,
    amenities: p.amenities,
    images: p.images.map((img) => (typeof img === 'string' ? img : img.webp)),
    createdAt: p.createdAt,
  }));

  const indexDir = path.join(process.cwd(), 'public', 'data', 'index');
  fs.rmSync(indexDir, { recursive: true, force: true });
  fs.mkdirSync(indexDir, { recursive: true });

  const suggestions = new Set<string>();
  const manifest: { shards: { key: string; province: string; type: string }[] } = { shards: [] };

  const groups = new Map<string, Doc[]>();
  for (const doc of docs) {
    const key = `${slug(doc.province)}-${doc.type}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(doc);
    suggestions.add(doc.title_en);
    suggestions.add(doc.title_th);
  }

  for (const [key, groupDocs] of groups.entries()) {
    const mini = new MiniSearch<Doc>({
      fields: ['title_en', 'title_th', 'description_en', 'description_th'],
      storeFields: ['id', 'title_en', 'title_th', 'province', 'province_th', 'type', 'price', 'priceBucket', 'amenities', 'images', 'createdAt'],
    });
    mini.addAll(groupDocs);
    fs.writeFileSync(path.join(indexDir, `${key}.json`), JSON.stringify(mini.toJSON()));
    const [provinceSlug, type] = key.split('-');
    const provinceName = groupDocs[0].province;
    manifest.shards.push({ key, province: provinceName, type });
  }

  fs.writeFileSync(path.join(indexDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  const suggestPath = path.join(indexDir, 'suggest.json');
  fs.writeFileSync(suggestPath, JSON.stringify({ suggestions: Array.from(suggestions) }, null, 2));
}

if (require.main === module) {
  buildIndexes();
  console.log('Indexes built');
}
