export type CookieMap = Record<string, string>;

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function parseCookies(cookieHeader?: string | null): CookieMap {
  if (!cookieHeader) return {};

  const cookies: CookieMap = {};
  const pairs = cookieHeader.split(';');

  for (const pair of pairs) {
    if (!pair) continue;
    const [rawName, ...rest] = pair.trim().split('=');
    if (!rawName) continue;

    const name = safeDecode(rawName);
    const value = rest.length > 0 ? rest.join('=') : '';
    cookies[name] = safeDecode(value);
  }

  return cookies;
}
