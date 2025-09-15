export interface Crumb {
  href: string;
  label: string;
}

const LABELS = {
  en: { home: 'Home', properties: 'Properties', guides: 'Guides' },
  th: { home: 'หน้าแรก', properties: 'อสังหา', guides: 'คู่มือ' },
  zh: { home: '首页', properties: '房源', guides: '指南' },
} as const;

type Lang = keyof typeof LABELS;

function t(locale: string) {
  return LABELS[(locale as Lang) in LABELS ? (locale as Lang) : 'en'];
}

export function listingCrumbs(locale: string): Crumb[] {
  const l = t(locale);
  const base = `/${locale}`;
  return [
    { href: base, label: l.home },
    { href: `${base}/properties`, label: l.properties },
  ];
}

export function pdpCrumbs(locale: string, id: string | number, title: string): Crumb[] {
  const l = t(locale);
  const base = `/${locale}`;
  return [
    { href: base, label: l.home },
    { href: `${base}/properties`, label: l.properties },
    { href: `${base}/properties/${id}`, label: title },
  ];
}

export function guidesCrumbs(locale: string, slug?: string, title?: string): Crumb[] {
  const l = t(locale);
  const base = `/${locale}`;
  const crumbs: Crumb[] = [
    { href: base, label: l.home },
    { href: `${base}/guides`, label: l.guides },
  ];
  if (slug && title) {
    crumbs.push({ href: `${base}/guides/${slug}`, label: title });
  }
  return crumbs;
}
