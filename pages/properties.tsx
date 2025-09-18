import { NextSeo } from 'next-seo'
import BreadcrumbJsonLd from '@/components/JsonLd/BreadcrumbJsonLd'
import PropertySearchView, { PropertySearchViewProps } from '@/views/properties/propertySearchView'

export { getServerSideProps } from '@/views/properties/propertySearchView'

export default function PropertySearchPage(props: PropertySearchViewProps) {
  const { head } = props
  return (
    <>
      <NextSeo {...head.seo} />
      <BreadcrumbJsonLd items={head.breadcrumb} />
      <PropertySearchView {...props} />
    </>
  )
}
