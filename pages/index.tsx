import Script from 'next/script'
import {
  NextSeo,
  LocalBusinessJsonLd,
  WebPageJsonLd,
  BreadcrumbJsonLd,
} from 'next-seo'
import HomeView, { HomeViewProps } from '@/views/home/homeView'

export { getStaticProps } from '@/views/home/homeView'

export default function HomePage(props: HomeViewProps) {
  const { head } = props
  return (
    <>
      <NextSeo {...head.seo} />
      <WebPageJsonLd {...head.webPage} />
      <BreadcrumbJsonLd itemListElements={head.breadcrumb} />
      <LocalBusinessJsonLd {...head.localBusiness} />
      <Script
        id='website'
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(head.websiteJson).replace(/</g, '\\u003c'),
        }}
      />
      <Script
        id='speakable'
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(head.speakableJson).replace(/</g, '\\u003c'),
        }}
      />
      <HomeView {...props} />
    </>
  )
}
