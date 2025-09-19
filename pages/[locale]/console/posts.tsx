import { NextSeo } from 'next-seo'
import ConsolePostsView, {
  getServerSideProps,
} from '@/views/console/ConsolePostsView'
import type { InferGetServerSidePropsType } from 'next'

export { getServerSideProps } from '@/views/console/ConsolePostsView'

type Props = InferGetServerSidePropsType<typeof getServerSideProps>

export default function ConsolePostsPage(props: Props) {
  return (
    <>
      <NextSeo {...props.head.seo} />
      <ConsolePostsView {...props} />
    </>
  )
}
