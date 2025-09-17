import type { NextApiRequest, NextApiResponse } from 'next';

import { getAdminSessionFromCookies, type AdminSession } from '@/src/lib/auth/session';
import { parseCookies } from '@/src/lib/http/cookies';
import { isValidCsrfToken } from '@/src/lib/security/csrf';
import { ADMIN_CSRF_HEADER_NAME } from '@/src/lib/security/csrfConstants';

interface ErrorResponse {
  error: string;
}

export function requireAdminAuth(
  req: NextApiRequest,
  res: NextApiResponse<ErrorResponse>,
): AdminSession | null {
  const cookies = parseCookies(req.headers.cookie);
  const session = getAdminSessionFromCookies(cookies);
  if (!session) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }

  if (!isValidCsrfToken(session, cookies, req.headers[ADMIN_CSRF_HEADER_NAME])) {
    res.status(403).json({ error: 'Invalid request' });
    return null;
  }

  return session;
}
