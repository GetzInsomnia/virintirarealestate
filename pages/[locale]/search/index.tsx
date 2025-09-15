import { NextSeo } from 'next-seo'
import { useRouter } from 'next/router'
import { getSeoUrls, getLanguageAlternates } from '@/lib/seo'
import SearchPageContent from '../../../src/views/search/SearchPageContent'

export default function SearchPage() {
  const { locale, defaultLocale } = useRouter()
  const lang = locale || defaultLocale || 'th'
  const { pageUrl } = getSeoUrls(lang, '/search')

  return (
    <>
      <NextSeo
        title='Search'
        canonical={pageUrl}
        noindex
        languageAlternates={getLanguageAlternates('/search')}
      />
      <SearchPageContent />
    </>
  )
}
