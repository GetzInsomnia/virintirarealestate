import type { NextSeoProps } from 'next-seo'
import type { ConsoleUser } from '@/context/ConsoleUserContext'

export type ConsoleTabKey = 'overview' | 'account' | 'posts' | 'favorites'

export interface ConsoleHeadProps {
  seo: NextSeoProps
}

export interface ConsolePageBaseProps {
  locale: string
  user: ConsoleUser
  head: ConsoleHeadProps
}
