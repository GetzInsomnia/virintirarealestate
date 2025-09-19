import { NextSeo } from 'next-seo'
import ConsoleAccountView, {
  getServerSideProps,
} from '@/views/console/ConsoleAccountView'
import type { InferGetServerSidePropsType } from 'next'

export { getServerSideProps } from '@/views/console/ConsoleAccountView'

type Props = InferGetServerSidePropsType<typeof getServerSideProps>

export default function ConsoleAccountPage(props: Props) {
  return (
    <>
      <NextSeo {...props.head.seo} />
      <ConsoleAccountView {...props} />
    </>
  )
}
