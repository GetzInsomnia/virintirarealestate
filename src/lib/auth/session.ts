import crypto from 'crypto';
import type { CookieMap } from '../http/cookies';

export interface AdminSession {
  username: string;
  issuedAt?: number;
  expiresAt: number;
}

export const SESSION_COOKIE_NAME = 'admin_session';

function parsePositiveInteger(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
}

function parseBooleanFlag(value: string | undefined): boolean {
  if (!value) {
    return false;
  }
  const normalized = value.trim().toLowerCase();
  return ['1', 'true', 't', 'yes', 'y', 'on'].includes(normalized);
}

function isDatabaseAuthEnabled(): boolean {
  return parseBooleanFlag(
    process.env.ADMIN_DB_AUTH_ENABLED ?? process.env.ADMIN_DB_AUTH
  );
}

function defaultSessionDurationMs(): number {
  const minutes = parsePositiveInteger(
    process.env.ADMIN_SESSION_TTL_MINUTES,
    60
  );
  return minutes * 60 * 1000;
}

export interface AdminSessionCookieOptions {
  ttlMs?: number;
  sameSite?: 'Strict' | 'Lax' | 'None';
  secure?: boolean;
  path?: string;
  domain?: string;
}

export interface AdminSessionCookieResult {
  cookie: string;
  value: string;
  payload: AdminSession;
}

function createSessionValue(
  username: string,
  secret: string,
  ttlMs: number
): { value: string; payload: AdminSession } {
  const now = Date.now();
  const expiresAt = now + ttlMs;
  const payload: AdminSession = {
    username,
    issuedAt: now,
    expiresAt,
  };
  const payloadJson = JSON.stringify(payload);
  const payloadPart = Buffer.from(payloadJson, 'utf8').toString('base64url');
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payloadPart);
  const signature = hmac.digest('hex');
  return {
    value: `${payloadPart}.${signature}`,
    payload,
  };
}

export function createAdminSessionCookie(
  username: string,
  options: AdminSessionCookieOptions = {}
): AdminSessionCookieResult {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error('SESSION_SECRET is not configured');
  }

  const ttlMs = options.ttlMs ?? defaultSessionDurationMs();
  const { value, payload } = createSessionValue(username, secret, ttlMs);
  const cookieName = SESSION_COOKIE_NAME;
  const parts = [`${cookieName}=${value}`];
  const path = options.path ?? '/';
  parts.push(`Path=${path}`);
  const maxAgeSeconds = Math.max(Math.floor(ttlMs / 1000), 0);
  parts.push(`Max-Age=${maxAgeSeconds}`);
  parts.push(`Expires=${new Date(payload.expiresAt).toUTCString()}`);
  parts.push('HttpOnly');
  const sameSite = options.sameSite ?? 'Strict';
  parts.push(`SameSite=${sameSite}`);
  if (options.domain) {
    parts.push(`Domain=${options.domain}`);
  }
  const secureDefault = process.env.NODE_ENV === 'production';
  if (options.secure ?? secureDefault) {
    parts.push('Secure');
  }

  return {
    cookie: parts.join('; '),
    value,
    payload,
  };
}

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
  const dbAuthEnabled = isDatabaseAuthEnabled();

  if (!sessionCookie || !secret || (!dbAuthEnabled && !expectedUser)) {
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

  if (typeof username !== 'string' || username.length === 0) {
    return null;
  }

  if (!dbAuthEnabled && expectedUser && username !== expectedUser) {
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
