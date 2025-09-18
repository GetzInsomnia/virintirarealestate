import { NextSeo } from 'next-seo'
import SearchView, { SearchViewProps } from '@/views/search/searchView'

export { getStaticPaths, getStaticProps } from '@/views/search/searchView'

export default function SearchPage(props: SearchViewProps) {
  const { head } = props
  return (
    <>
      <NextSeo {...head.seo} />
      <SearchView {...props} />
    </>
  )
}
