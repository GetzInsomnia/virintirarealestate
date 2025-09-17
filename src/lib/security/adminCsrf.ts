import { useEffect, useState } from 'react';
import {
  ADMIN_CSRF_HEADER_NAME,
  ADMIN_CSRF_STORAGE_KEY,
  ADMIN_CSRF_TOKEN_COOKIE_NAME,
} from './csrfConstants';

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') {
    return null;
  }
  const pattern = `${name}=`;
  const cookies = document.cookie ? document.cookie.split(';') : [];
  for (const cookie of cookies) {
    const trimmed = cookie.trim();
    if (trimmed.startsWith(pattern)) {
      const value = trimmed.slice(pattern.length);
      try {
        return decodeURIComponent(value);
      } catch {
        return value;
      }
    }
  }
  return null;
}

export function persistAdminCsrfToken(token: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(ADMIN_CSRF_STORAGE_KEY, token);
  } catch {
    // Ignore persistence errors (e.g., storage disabled)
  }
}

export function getStoredAdminCsrfToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    return window.localStorage.getItem(ADMIN_CSRF_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function readAdminCsrfToken(): string | null {
  const cookieToken = readCookie(ADMIN_CSRF_TOKEN_COOKIE_NAME);
  if (cookieToken) {
    persistAdminCsrfToken(cookieToken);
    return cookieToken;
  }
  return getStoredAdminCsrfToken();
}

export function useAdminCsrfToken(): string | null {
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') {
      return null;
    }
    return readAdminCsrfToken();
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const nextToken = readAdminCsrfToken();
    if (nextToken) {
      setToken(nextToken);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const handler = () => {
      const nextToken = readAdminCsrfToken();
      if (nextToken) {
        setToken(nextToken);
      }
    };
    window.addEventListener('focus', handler);
    return () => {
      window.removeEventListener('focus', handler);
    };
  }, []);

  return token;
}

export function withAdminCsrfHeader(
  headers: HeadersInit | undefined,
  token: string | null
): HeadersInit | undefined {
  if (!token) {
    return headers;
  }
  if (headers instanceof Headers) {
    headers.set(ADMIN_CSRF_HEADER_NAME, token);
    return headers;
  }
  if (Array.isArray(headers)) {
    return [...headers, [ADMIN_CSRF_HEADER_NAME, token]];
  }
  return { ...headers, [ADMIN_CSRF_HEADER_NAME]: token };
}
