import { useCallback, type ChangeEvent } from 'react'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import ConsoleLayout from './ConsoleLayout'
import type { ConsolePageBaseProps } from './types'
import { createConsoleGetServerSideProps } from './consoleServer'
import { ConsoleUserProvider, useConsoleUser } from '@/context/ConsoleUserContext'

interface ConsoleAccountViewProps extends ConsolePageBaseProps {}

function ConsoleAccountContent(props: ConsoleAccountViewProps) {
  const router = useRouter()
  const { t } = useTranslation('common')
  const { user, updateLocalePreference } = useConsoleUser()

  const handleLocaleChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const nextLocale = event.target.value
      updateLocalePreference(nextLocale)
      if (nextLocale !== router.locale) {
        const pathSuffix = router.asPath.replace(/^\/[^/]+/, '')
        router.push(`/${nextLocale}${pathSuffix}`)
      }
    },
    [router, updateLocalePreference],
  )

  return (
    <ConsoleLayout {...props} activeTab="account">
      <section className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-neutral-900">
          {t('Console.account.title')}
        </h2>
        <div className="space-y-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-neutral-400">
              {t('Console.account.name')}
            </p>
            <p className="mt-1 text-sm font-medium text-neutral-800">{user.name}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-neutral-400">
              {t('Console.account.email')}
            </p>
            <p className="mt-1 text-sm font-medium text-neutral-800">{user.email}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-neutral-400">
              {t('Console.account.plan')}
            </p>
            <p className="mt-1 text-sm font-medium text-neutral-800">
              {t(`Console.plans.${user.plan}`)}
            </p>
          </div>
        </div>
      </section>
      <section className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">
              {t('Console.account.localeTitle')}
            </h3>
            <p className="text-sm text-neutral-500">
              {t('Console.account.localeDescription')}
            </p>
          </div>
          <div>
            <label className="sr-only" htmlFor="console-locale">
              {t('Console.account.localeTitle')}
            </label>
            <select
              id="console-locale"
              value={user.localePreference ?? router.locale}
              onChange={handleLocaleChange}
              className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm"
            >
              {(router.locales ?? []).map((code) => (
                <option key={code} value={code}>
                  {t(`Console.locales.${code}`, code)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>
    </ConsoleLayout>
  )
}

export default function ConsoleAccountView(props: ConsoleAccountViewProps) {
  return (
    <ConsoleUserProvider initialUser={props.user}>
      <ConsoleAccountContent {...props} />
    </ConsoleUserProvider>
  )
}

export const getServerSideProps = createConsoleGetServerSideProps({
  seoPath: '/console/account',
  seoTitle: 'Console Account',
})
