import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const filePath = path.join(process.cwd(), 'public', 'data', 'index', 'suggest.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  res.status(200).json(data);
}
