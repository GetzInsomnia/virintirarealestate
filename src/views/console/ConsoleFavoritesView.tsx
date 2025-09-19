import { useMemo } from 'react'
import { useTranslation } from 'next-i18next'
import ConsoleLayout from './ConsoleLayout'
import type { ConsolePageBaseProps } from './types'
import { createConsoleGetServerSideProps } from './consoleServer'
import { useFavoritesQuota } from '@/hooks/useFavoritesQuota'
import { ConsoleUserProvider } from '@/context/ConsoleUserContext'

interface ConsoleFavoritesViewProps extends ConsolePageBaseProps {}

function ConsoleFavoritesContent(props: ConsoleFavoritesViewProps) {
  const { user } = props
  const { t } = useTranslation('common')
  const favorites = useFavoritesQuota()

  const items = useMemo(
    () =>
      Array.from({ length: user.favoritesUsed }, (_, index) => ({
        id: `${index + 1}`,
        title: t('Console.favorites.placeholderTitle', { index: index + 1 }),
        location: t('Console.favorites.placeholderLocation'),
      })),
    [t, user.favoritesUsed],
  )

  return (
    <ConsoleLayout {...props} activeTab="favorites">
      <section className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">
              {t('Console.favorites.title')}
            </h2>
            <p className="text-sm text-neutral-500">
              {favorites.isAtLimit
                ? t('Console.favorites.limitReached', { count: favorites.limit })
                : t('Console.favorites.remaining', { count: favorites.remaining })}
            </p>
          </div>
          <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600">
            {t('Console.favorites.counter', {
              used: favorites.used,
              limit: favorites.limit,
            })}
          </span>
        </div>
        <ul className="divide-y divide-neutral-200">
          {items.length === 0 && (
            <li className="py-6 text-sm text-neutral-500">
              {t('Console.favorites.emptyState')}
            </li>
          )}
          {items.map((item) => (
            <li key={item.id} className="py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-neutral-900">{item.title}</p>
                  <p className="text-xs text-neutral-500">{item.location}</p>
                </div>
                <button className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">
                  {t('Console.favorites.viewCta')}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </ConsoleLayout>
  )
}

export default function ConsoleFavoritesView(props: ConsoleFavoritesViewProps) {
  return (
    <ConsoleUserProvider initialUser={props.user}>
      <ConsoleFavoritesContent {...props} />
    </ConsoleUserProvider>
  )
}

export const getServerSideProps = createConsoleGetServerSideProps({
  seoPath: '/console/favorites',
  seoTitle: 'Console Favorites',
})
