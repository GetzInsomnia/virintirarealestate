import defaultSeo from '../next-seo.config'
import { buildUrl } from './url'

export const getSeoUrls = (lang: string, path = '') => buildUrl(lang, path)

const ogLocaleMap: Record<string, string> = { en: 'en_US', zh: 'zh_CN', th: 'th_TH' }

export const getOpenGraph = (
  lang: string,
  url: string,
  title?: string,
  description?: string
) => ({
  ...defaultSeo.openGraph,
  ...(title && { title }),
  ...(description && { description }),
  locale: ogLocaleMap[lang] || ogLocaleMap.th,
  url,
})

export const getLanguageAlternates = (path = '') => [
  { hrefLang: 'th', href: getSeoUrls('th', path).pageUrl },
  { hrefLang: 'en', href: getSeoUrls('en', path).pageUrl },
  { hrefLang: 'zh', href: getSeoUrls('zh', path).pageUrl },
  { hrefLang: 'x-default', href: getSeoUrls('th', path).pageUrl },
]

