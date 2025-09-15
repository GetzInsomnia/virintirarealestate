import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote'
import Breadcrumbs from '../../components/Breadcrumbs'
import { Crumb } from '../../lib/nav/crumbs'

export interface ArticleData {
  slug: string
  category: string
  coverImage: string
  publishedAt: string
  provinces: string[]
  title: string
}

interface Props {
  source: MDXRemoteSerializeResult
  article: ArticleData
  crumbs: Crumb[]
}

export default function GuideDetailPageContent({ source, article, crumbs }: Props) {
  return (
    <div>
      <Breadcrumbs items={crumbs} />
      <h1>{article.title}</h1>
      <MDXRemote {...source} />
    </div>
  )
}
