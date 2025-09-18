import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import path from 'path';
import { getAdminSessionFromCookies } from '@/lib/auth/session';
import { parseCookies } from '@/lib/http/cookies';
import { isValidCsrfToken } from '@/lib/security/csrf';
import { ADMIN_CSRF_HEADER_NAME } from '@/lib/security/csrfConstants';
import { buildIndexes } from '@/lib/search/indexBuilder';

const GENERIC_CSRF_ERROR = 'Invalid request';

interface RequestBody {
  type: string;
  province: string;
  district: string;
  priceTHB: number;
  beds?: number;
  baths?: number;
  areaBuilt: number;
}

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
  const cookies = parseCookies(req.headers.cookie);
  const session = getAdminSessionFromCookies(cookies);
  if (!session) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  if (!isValidCsrfToken(session, cookies, req.headers[ADMIN_CSRF_HEADER_NAME])) {
    res.status(403).json({ error: GENERIC_CSRF_ERROR });
    return;
  }
  const body: RequestBody = req.body;
  if (!body || !body.type || !body.province || !body.district || !body.priceTHB || !body.areaBuilt) {
    res.status(400).json({ error: 'Missing fields' });
    return;
  }

  const dataPath = path.join(process.cwd(), 'public', 'data', 'properties.json');
  let properties: any[] = [];
  try {
    const file = await fs.readFile(dataPath, 'utf-8');
    properties = JSON.parse(file);
  } catch {}

  const id = properties.reduce((m, p) => Math.max(m, p.id), 0) + 1;
  const code = `P${String(id).padStart(5, '0')}`;
  const title = `${body.type} in ${body.province}`;
  const slug = `${slugify(body.province)}-${slugify(body.type)}-${code.toLowerCase()}`;
  const price = Number(body.priceTHB);
  const area = Number(body.areaBuilt);
  const pricePerSqm = area > 0 ? Math.round(price / area) : price;
  const now = new Date().toISOString();
  const imageUrl = `https://placehold.co/600x400?text=${encodeURIComponent(body.type + ' ' + code)}`;

  const property = {
    id,
    slug,
    code,
    province: { en: body.province, th: body.province },
    district: { en: body.district, th: body.district },
    type: body.type,
    title: { en: title, th: title },
    description: { en: title, th: title },
    price,
    priceBucket: priceBucket(price),
    pricePerSqm,
    beds: body.beds,
    baths: body.baths,
    areaBuilt: area,
    status: 'available',
    amenities: [],
    images: [{ src: imageUrl, alt: title }],
    createdAt: now,
    updatedAt: now,
  };

  properties.push(property);
  await fs.writeFile(dataPath, JSON.stringify(properties, null, 2));

  await buildIndexes();

  res.status(200).json({ property });
}

