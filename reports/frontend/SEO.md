# SEO

## next-sitemap.config.js (present)

```js
const fallbackSite = 'https://www.zomzomproperty.com'
const rawSite =
  [process.env.SITE, process.env.NEXT_PUBLIC_SITE_URL, fallbackSite].find(
    (value) => typeof value === 'string' && value.trim().length > 0,
  ) ?? fallbackSite

const SITE = rawSite.trim().replace(/\/$/, '')

const LOCALES = ['th', 'en', 'zh']

const stripQuery = (path) => path.split('?')[0]
const stripTrailingSlash = (path) => (path !== '/' && path.endsWith('/') ? path.slice(0, -1) : path)
const normalizePath = (path) => {
  const clean = stripTrailingSlash(stripQuery(path))
  return clean === '' ? '/' : clean
}
const isRoot = (path) => path === '/'
const isLocaleLanding = (path) => LOCALES.some((locale) => path === `/${locale}`)
const priorityFor = (path) => {
  if (isRoot(path)) return 1
  if (isLocaleLanding(path)) return 0.8
  return 0.7
}
const toAbsolute = (path) => (isRoot(path) ? SITE : `${SITE}${path}`)

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: SITE,
  generateRobotsTxt: true,
  transform: async (_, path) => {
    const normalized = normalizePath(path)
    return {
      loc: toAbsolute(normalized),
      changefreq: 'daily',
      priority: priorityFor(normalized),
      lastmod: new Date().toISOString(),
    }
  },
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/adminmanager', '/*?*'],
      },
    ],
  },
}
```

## public assets
- robots.txt: ✅
- sitemap.xml: ✅ (generated?)