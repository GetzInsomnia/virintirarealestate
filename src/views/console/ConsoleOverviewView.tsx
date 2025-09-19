import { useTranslation } from 'next-i18next'
import ConsoleLayout from './ConsoleLayout'
import type { ConsolePageBaseProps } from './types'
import { createConsoleGetServerSideProps } from './consoleServer'
import { ConsoleUserProvider } from '@/context/ConsoleUserContext'
import { useFavoritesQuota } from '@/hooks/useFavoritesQuota'
import { useConsolePaywall } from '@/hooks/useConsolePaywall'

interface ConsoleOverviewViewProps extends ConsolePageBaseProps {}

function StatCard({
  title,
  value,
  helper,
}: {
  title: string
  value: string
  helper?: string
}) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-medium text-neutral-500">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-neutral-900">{value}</p>
      {helper && <p className="mt-2 text-xs text-neutral-500">{helper}</p>}
    </div>
  )
}

function ConsoleOverviewContent(props: ConsoleOverviewViewProps) {
  const { user } = props
  const { t } = useTranslation('common')
  const favorites = useFavoritesQuota()
  const paywall = useConsolePaywall()

  return (
    <ConsoleLayout {...props} activeTab="overview">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          title={t('Console.overview.plan')}
          value={t(`Console.plans.${user.plan}`)}
          helper={t('Console.overview.planHelper')}
        />
        <StatCard
          title={t('Console.overview.posts')}
          value={`${paywall.used}/${paywall.limit}`}
          helper={paywall.message}
        />
        <StatCard
          title={t('Console.overview.favorites')}
          value={`${favorites.used}/${favorites.limit}`}
          helper={
            favorites.isAtLimit
              ? t('Console.overview.favoritesLimit')
              : t('Console.overview.favoritesRemaining', {
                  count: favorites.remaining,
                })
          }
        />
      </section>
      {paywall.showPaywall && (
        <section className="rounded-lg border border-amber-300 bg-amber-50 p-6">
          <h2 className="text-lg font-semibold text-amber-900">
            {t('Console.paywall.title')}
          </h2>
          <p className="mt-2 text-sm text-amber-800">{t('Console.paywall.description')}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
              {t('Console.paywall.upgradeCta')}
            </button>
            <button className="rounded-md border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-700">
              {t('Console.paywall.contactCta')}
            </button>
          </div>
        </section>
      )}
      <section className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-neutral-900">
          {t('Console.overview.activityTitle')}
        </h2>
        <p className="mt-2 text-sm text-neutral-600">
          {t('Console.overview.activityDescription')}
        </p>
      </section>
    </ConsoleLayout>
  )
}

export default function ConsoleOverviewView(props: ConsoleOverviewViewProps) {
  return (
    <ConsoleUserProvider initialUser={props.user}>
      <ConsoleOverviewContent {...props} />
    </ConsoleUserProvider>
  )
}

export const getServerSideProps = createConsoleGetServerSideProps({
  seoPath: '/console',
  seoTitle: 'Console Overview',
})
