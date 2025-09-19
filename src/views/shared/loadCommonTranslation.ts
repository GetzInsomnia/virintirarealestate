import fs from 'fs'
import path from 'path'

export interface CommonTranslation {
  seo_title?: string
  seo_description?: string
  seo_keywords?: string[]
  welcome?: string
  Brand?: {
    name?: string
    tagline?: string
  }
  [key: string]: unknown
}

const FALLBACK_ORDER = ['th', 'en']

export function loadCommonTranslation(locale?: string): CommonTranslation {
  const candidates = [locale, ...FALLBACK_ORDER].filter(Boolean) as string[]
  for (const lang of candidates) {
    const filePath = path.join(process.cwd(), 'locales', lang, 'common.json')
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8')
      return JSON.parse(raw) as CommonTranslation
    }
  }
  throw new Error('Unable to load common translation file')
}
