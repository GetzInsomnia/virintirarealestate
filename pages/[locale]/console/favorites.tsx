import { NextSeo } from 'next-seo'
import ConsoleFavoritesView, {
  getServerSideProps,
} from '@/views/console/ConsoleFavoritesView'
import type { InferGetServerSidePropsType } from 'next'

export { getServerSideProps } from '@/views/console/ConsoleFavoritesView'

type Props = InferGetServerSidePropsType<typeof getServerSideProps>

export default function ConsoleFavoritesPage(props: Props) {
  return (
    <>
      <NextSeo {...props.head.seo} />
      <ConsoleFavoritesView {...props} />
    </>
  )
}
