import crypto from 'crypto';
import type { CookieMap } from '../http/cookies';
import type { AdminSession } from '../auth/session';
import { ADMIN_CSRF_COOKIE_NAME } from './csrfConstants';

export interface CsrfValidationOptions {
  cookieName?: string;
}

function constantTimeEquals(expected: string, provided: string): boolean {
  try {
    const expectedBuffer = Buffer.from(expected, 'utf8');
    const providedBuffer = Buffer.from(provided, 'utf8');
    if (expectedBuffer.length !== providedBuffer.length) {
      return false;
    }
    return crypto.timingSafeEqual(expectedBuffer, providedBuffer);
  } catch {
    return false;
  }
}

export function isValidCsrfToken(
  session: AdminSession | null,
  cookies: CookieMap,
  headerValue: string | string[] | undefined,
  options: CsrfValidationOptions = {}
): boolean {
  if (!session || typeof session.csrfToken !== 'string' || session.csrfToken.length === 0) {
    return false;
  }

  const headerToken = Array.isArray(headerValue) ? headerValue[0] : headerValue;
  if (typeof headerToken !== 'string' || headerToken.length === 0) {
    return false;
  }

  const cookieName = options.cookieName ?? ADMIN_CSRF_COOKIE_NAME;
  const cookieToken = cookies[cookieName];
  if (typeof cookieToken !== 'string' || cookieToken.length === 0) {
    return false;
  }

  return (
    constantTimeEquals(session.csrfToken, headerToken) &&
    constantTimeEquals(session.csrfToken, cookieToken)
  );
}
