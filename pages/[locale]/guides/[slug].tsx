import { NextSeo, ArticleJsonLd } from 'next-seo'
import BreadcrumbJsonLd from '@/components/JsonLd/BreadcrumbJsonLd'
import GuideDetailView, { GuideDetailViewProps } from '@/views/guides/guideDetailView'

export { getStaticPaths, getStaticProps } from '@/views/guides/guideDetailView'

export default function GuideDetailPage(props: GuideDetailViewProps) {
  const { head } = props
  return (
    <>
      <NextSeo {...head.seo} />
      <BreadcrumbJsonLd items={head.breadcrumb} />
      <ArticleJsonLd {...head.articleJsonLd} />
      <GuideDetailView {...props} />
    </>
  )
}
