import { NextSeo } from 'next-seo'
import ConsoleOverviewView, {
  getServerSideProps,
} from '@/views/console/ConsoleOverviewView'
import type { InferGetServerSidePropsType } from 'next'

export { getServerSideProps } from '@/views/console/ConsoleOverviewView'

type Props = InferGetServerSidePropsType<typeof getServerSideProps>

export default function ConsoleOverviewPage(props: Props) {
  return (
    <>
      <NextSeo {...props.head.seo} />
      <ConsoleOverviewView {...props} />
    </>
  )
}
