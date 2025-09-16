import crypto from 'crypto';
import type { CookieMap } from '../http/cookies';

export interface CsrfValidationOptions {
  cookieName?: string;
}

export function isValidCsrfToken(
  cookies: CookieMap,
  headerValue: string | string[] | undefined,
  options: CsrfValidationOptions = {}
): boolean {
  const cookieName = options.cookieName ?? 'csrf_token';
  const tokenFromCookie = cookies[cookieName];
  const headerToken = Array.isArray(headerValue) ? headerValue[0] : headerValue;

  if (!tokenFromCookie || typeof headerToken !== 'string' || headerToken.length === 0) {
    return false;
  }

  if (tokenFromCookie.length !== headerToken.length) {
    return false;
  }

  try {
    const cookieBuffer = Buffer.from(tokenFromCookie, 'utf8');
    const headerBuffer = Buffer.from(headerToken, 'utf8');
    return crypto.timingSafeEqual(cookieBuffer, headerBuffer);
  } catch {
    return false;
  }
}
