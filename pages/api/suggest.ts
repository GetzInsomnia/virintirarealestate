import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

/**
 * Returns search suggestions for the site.
 *
 * Responds with HTTP 500 if the suggestions file cannot be read.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const filePath = path.join(process.cwd(), 'public', 'data', 'index', 'suggest.json');
  try {
    const fileContents = await fs.promises.readFile(filePath, 'utf-8');
    const data = JSON.parse(fileContents);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load suggestions' });
  }
}
