import crypto from 'crypto';
import type { CookieMap } from '../http/cookies';

export interface AdminSession {
  username: string;
  issuedAt?: number;
  expiresAt: number;
}

const SESSION_COOKIE_NAME = 'admin_session';

function constantTimeCompare(expected: string, provided: string): boolean {
  try {
    const expectedBuffer = Buffer.from(expected, 'hex');
    const providedBuffer = Buffer.from(provided, 'hex');
    if (expectedBuffer.length !== providedBuffer.length) {
      return false;
    }
    return crypto.timingSafeEqual(expectedBuffer, providedBuffer);
  } catch {
    return false;
  }
}

export function getAdminSessionFromCookies(cookies: CookieMap): AdminSession | null {
  const sessionCookie = cookies[SESSION_COOKIE_NAME];
  const secret = process.env.SESSION_SECRET;
  const expectedUser = process.env.ADMIN_USER;

  if (!sessionCookie || !secret || !expectedUser) {
    return null;
  }

  const [payloadPart, signaturePart] = sessionCookie.split('.');
  if (!payloadPart || !signaturePart) {
    return null;
  }

  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payloadPart);
  const expectedSignature = hmac.digest('hex');

  if (!constantTimeCompare(expectedSignature, signaturePart)) {
    return null;
  }

  let payloadJson: string;
  try {
    payloadJson = Buffer.from(payloadPart, 'base64url').toString('utf8');
  } catch {
    return null;
  }

  let payload: unknown;
  try {
    payload = JSON.parse(payloadJson);
  } catch {
    return null;
  }

  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const { username, expiresAt, issuedAt } = payload as {
    username?: unknown;
    expiresAt?: unknown;
    issuedAt?: unknown;
  };

  if (typeof username !== 'string' || username !== expectedUser) {
    return null;
  }

  if (typeof expiresAt !== 'number' || Number.isNaN(expiresAt) || expiresAt <= Date.now()) {
    return null;
  }

  const parsedIssuedAt = typeof issuedAt === 'number' ? issuedAt : undefined;

  return {
    username,
    expiresAt,
    issuedAt: parsedIssuedAt,
  };
}
