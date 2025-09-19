import { useMemo } from 'react'
import { useTranslation } from 'next-i18next'
import ConsoleLayout from './ConsoleLayout'
import type { ConsolePageBaseProps } from './types'
import { createConsoleGetServerSideProps } from './consoleServer'
import { useConsolePaywall } from '@/hooks/useConsolePaywall'
import { ConsoleUserProvider } from '@/context/ConsoleUserContext'

interface ConsolePostsViewProps extends ConsolePageBaseProps {}

function ConsolePostsContent(props: ConsolePostsViewProps) {
  const { user } = props
  const { t } = useTranslation('common')
  const paywall = useConsolePaywall()

  const posts = useMemo(
    () =>
      Array.from({ length: user.postsUsed }, (_, index) => ({
        id: `${index + 1}`,
        title: t('Console.posts.placeholderTitle', { index: index + 1 }),
        status: index % 2 === 0 ? 'published' : 'draft',
      })),
    [user.postsUsed, t],
  )

  return (
    <ConsoleLayout {...props} activeTab="posts">
      <section className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">
              {t('Console.posts.title')}
            </h2>
            <p className="text-sm text-neutral-500">{paywall.message}</p>
          </div>
          <button
            type="button"
            className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
              paywall.showPaywall
                ? 'cursor-not-allowed bg-neutral-200 text-neutral-500'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
            disabled={paywall.showPaywall}
          >
            {paywall.showPaywall
              ? t('Console.paywall.upgradeCta')
              : t('Console.posts.createCta')}
          </button>
        </div>
        {paywall.showPaywall && (
          <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            {t('Console.posts.paywallHint')}
          </div>
        )}
        <ul className="divide-y divide-neutral-200">
          {posts.length === 0 && (
            <li className="py-6 text-sm text-neutral-500">
              {t('Console.posts.emptyState')}
            </li>
          )}
          {posts.map((post) => (
            <li key={post.id} className="py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-neutral-900">{post.title}</p>
                  <p className="text-xs uppercase tracking-wide text-neutral-400">
                    {t(`Console.posts.status.${post.status}`)}
                  </p>
                </div>
                <button className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">
                  {t('Console.posts.manageCta')}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </ConsoleLayout>
  )
}

export default function ConsolePostsView(props: ConsolePostsViewProps) {
  return (
    <ConsoleUserProvider initialUser={props.user}>
      <ConsolePostsContent {...props} />
    </ConsoleUserProvider>
  )
}

export const getServerSideProps = createConsoleGetServerSideProps({
  seoPath: '/console/posts',
  seoTitle: 'Console Posts',
})
