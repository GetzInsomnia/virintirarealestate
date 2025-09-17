import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import path from 'path';

type Locale = 'en' | 'th' | 'zh';

interface SuggestionRecord {
  canonical: string;
  locales?: Partial<Record<Locale, string>>;
}

function normalizeLocale(input?: string | string[]): Locale | undefined {
  const value = Array.isArray(input) ? input[0] : input;
  if (!value) return undefined;
  const lower = value.toLowerCase();
  if (lower.startsWith('en')) return 'en';
  if (lower.startsWith('th')) return 'th';
  if (lower.startsWith('zh')) return 'zh';
  return undefined;
}

function detectLocale(req: NextApiRequest): Locale | undefined {
  return (
    normalizeLocale(req.query.locale) ||
    normalizeLocale(req.cookies?.NEXT_LOCALE) ||
    normalizeLocale(req.headers['accept-language'])
  );
}

function parseQuery(q: string | string[] | undefined) {
  if (!q) return '';
  return Array.isArray(q) ? q[0]?.trim() ?? '' : q.trim();
}

function asSuggestionRecords(raw: any): SuggestionRecord[] | null {
  if (!raw || typeof raw !== 'object') return null;
  if (!('suggestions' in raw)) return null;
  const list = (raw as any).suggestions;
  if (Array.isArray(list) && list.every((item) => typeof item === 'string')) {
    return (list as string[]).map((canonical) => ({ canonical, locales: { en: canonical } }));
  }
  if (Array.isArray(list)) {
    return list.filter((entry) => typeof entry?.canonical === 'string');
  }
  return null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const filePath = path.join(process.cwd(), 'public', 'data', 'index', 'suggest.json');
  try {
    const fileContents = await fs.readFile(filePath, 'utf-8');
    const parsed = JSON.parse(fileContents);
    const suggestions = asSuggestionRecords(parsed) ?? [];
    const locale = detectLocale(req) ?? 'en';
    const query = parseQuery(req.query.q).toLowerCase();

    const unique = new Set<string>();
    const results: string[] = [];

    for (const entry of suggestions) {
      if (results.length >= 10) break;
      const localized = entry.locales?.[locale] ?? entry.locales?.en ?? entry.canonical;
      if (!localized) continue;
      const candidate = localized.trim();
      if (!candidate) continue;
      const canonical = entry.canonical?.toLowerCase?.() ?? '';
      const candidateLower = candidate.toLowerCase();
      if (
        query &&
        !(candidateLower.startsWith(query) || (canonical && canonical.startsWith(query)))
      ) {
        continue;
      }
      const key = candidate.toLowerCase();
      if (unique.has(key)) continue;
      unique.add(key);
      results.push(candidate);
    }

    res.status(200).json({ suggestions: results });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load suggestions' });
  }
}
