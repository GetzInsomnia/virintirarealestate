import Script from 'next/script'
import { NextSeo } from 'next-seo'
import BreadcrumbJsonLd from '@/components/JsonLd/BreadcrumbJsonLd'
import PropertyDetailView, { PropertyDetailViewProps } from '@/views/properties/propertyDetailView'

export { getStaticPaths, getStaticProps } from '@/views/properties/propertyDetailView'

export default function PropertyDetailPage(props: PropertyDetailViewProps) {
  const { head } = props
  return (
    <>
      <NextSeo {...head.seo} />
      <BreadcrumbJsonLd items={head.breadcrumb} />
      <Script
        id='realestate-listing'
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(head.realEstateJson).replace(/</g, '\\u003c'),
        }}
      />
      <PropertyDetailView {...props} />
    </>
  )
}
