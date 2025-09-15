import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import path from 'path';

function slugify(value: string) {
  return value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function priceBucket(price: number) {
  if (price < 1_000_000) return '0-1M';
  if (price < 3_000_000) return '1-3M';
  if (price < 5_000_000) return '3-5M';
  if (price < 10_000_000) return '5-10M';
  return '10M+';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  if (process.env.NODE_ENV === 'production') {
    res.status(403).json({ error: 'Not available in production' });
    return;
  }

  const dataPath = path.join(process.cwd(), 'public', 'data', 'properties.json');
  let properties: any[] = [];
  try {
    const file = await fs.readFile(dataPath, 'utf-8');
    properties = JSON.parse(file);
  } catch {}

  let id = properties.reduce((m, p) => Math.max(m, p.id), 0) + 1;
  const types = ['condo', 'house', 'land'];
  const provinces = ['Bangkok', 'Phuket', 'Chiang Mai'];
  const now = new Date().toISOString();
  const added: any[] = [];

  for (let i = 0; i < types.length; i++) {
    const type = types[i];
    const province = provinces[i % provinces.length];
    const district = 'Central';
    const price = 1_000_000 + i * 500_000;
    const areaBuilt = 100 + i * 20;
    const code = `P${String(id).padStart(5, '0')}`;
    const title = `${type} in ${province}`;
    const prop = {
      id,
      slug: `${slugify(province)}-${slugify(type)}-${code.toLowerCase()}`,
      code,
      province: { en: province, th: province },
      district: { en: district, th: district },
      type,
      title: { en: title, th: title },
      description: { en: title, th: title },
      price,
      priceBucket: priceBucket(price),
      pricePerSqm: Math.round(price / areaBuilt),
      beds: i + 1,
      baths: i + 1,
      areaBuilt,
      status: 'available',
      amenities: [],
      images: [{ src: `https://placehold.co/600x400?text=${encodeURIComponent(type + ' ' + code)}`, alt: title }],
      createdAt: now,
      updatedAt: now,
    };
    properties.push(prop);
    added.push(prop);
    id++;
  }

  await fs.writeFile(dataPath, JSON.stringify(properties, null, 2));
  res.status(200).json({ added: added.length });
}

