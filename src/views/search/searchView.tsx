import { GetStaticPaths, GetStaticProps } from 'next'
import type { NextSeoProps } from 'next-seo'
import SearchPageContent from './SearchPageContent'
import { getLanguageAlternates, getSeoUrls } from '@/lib/seo'

export interface SearchHeadProps {
  seo: NextSeoProps
}

export interface SearchViewProps {
  lang: string
  head: SearchHeadProps
}

export default function SearchView(_: SearchViewProps) {
  return <SearchPageContent />
}

export const getSearchStaticPaths: GetStaticPaths = async () => {
  const locales = ['en', 'th', 'zh']
  const paths = locales.map((locale) => ({ params: { locale } }))
  return { paths, fallback: false }
}

export const getSearchStaticProps: GetStaticProps<SearchViewProps> = async ({
  params,
}) => {
  const lang = (params?.locale as string) || 'th'
  const { pageUrl } = getSeoUrls(lang, '/search')
  return {
    props: {
      lang,
      head: {
        seo: {
          title: 'Search',
          canonical: pageUrl,
          noindex: true,
          languageAlternates: getLanguageAlternates('/search'),
        },
      },
    },
  }
}

export const getStaticPaths = getSearchStaticPaths
export const getStaticProps = getSearchStaticProps
