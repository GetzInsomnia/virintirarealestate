import { NextSeo } from 'next-seo'
import BreadcrumbJsonLd from '@/components/JsonLd/BreadcrumbJsonLd'
import GuidesListView, { GuidesListViewProps } from '@/views/guides/guidesListView'

export { getStaticPaths, getStaticProps } from '@/views/guides/guidesListView'

export default function GuidesListPage(props: GuidesListViewProps) {
  const { head } = props
  return (
    <>
      <NextSeo {...head.seo} />
      <BreadcrumbJsonLd items={head.breadcrumb} />
      <GuidesListView {...props} />
    </>
  )
}
