import type { NextApiRequest, NextApiResponse } from 'next';
import { getAdminSessionFromCookies } from '@/src/lib/auth/session';
import { parseCookies } from '@/src/lib/http/cookies';
import { isValidCsrfToken } from '@/src/lib/security/csrf';
import { ADMIN_CSRF_HEADER_NAME } from '@/src/lib/security/csrfConstants';
import { buildIndexes } from '../../../src/lib/search/indexBuilder';

const GENERIC_CSRF_ERROR = 'Invalid request';

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
  await buildIndexes();
  res.status(200).json({ ok: true });
}

