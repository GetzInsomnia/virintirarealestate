import type { NextApiRequest, NextApiResponse } from 'next';
import { buildIndexes } from '../../../src/lib/search/indexBuilder';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  await buildIndexes();
  res.status(200).json({ ok: true });
}

