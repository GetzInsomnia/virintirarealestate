import Link from 'next/link'
import { useMemo, type ReactNode } from 'react'
import type { ConsolePageBaseProps, ConsoleTabKey } from './types'
import { useTranslation } from 'next-i18next'

interface ConsoleLayoutProps extends ConsolePageBaseProps {
  activeTab: ConsoleTabKey
  children: ReactNode
}

export default function ConsoleLayout({
  user,
  locale,
  activeTab,
  children,
}: ConsoleLayoutProps) {
  const { t } = useTranslation('common')

  const items = useMemo(() => {
    const basePath = `/${locale}/console`
    return [
      { key: 'overview' as const, href: basePath, label: t('Console.nav.overview') },
      {
        key: 'account' as const,
        href: `${basePath}/account`,
        label: t('Console.nav.account'),
      },
      {
        key: 'posts' as const,
        href: `${basePath}/posts`,
        label: t('Console.nav.posts'),
      },
      {
        key: 'favorites' as const,
        href: `${basePath}/favorites`,
        label: t('Console.nav.favorites'),
      },
    ]
  }, [locale, t])

  return (
    <div className="bg-neutral-50 min-h-screen">
      <div className="mx-auto max-w-5xl px-4 py-10 space-y-6">
        <header className="space-y-2">
          <p className="text-sm text-neutral-500">
            {t('Console.greeting', { name: user.name })}
          </p>
          <h1 className="text-2xl font-semibold text-neutral-900">
            {t('Console.heading')}
          </h1>
        </header>
        <nav aria-label={t('Console.nav.ariaLabel')} className="border-b border-neutral-200">
          <ul className="flex flex-wrap gap-4 pb-2">
            {items.map((item) => {
              const isActive = item.key === activeTab
              return (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className={`pb-2 border-b-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'border-emerald-500 text-emerald-600'
                        : 'border-transparent text-neutral-600 hover:text-neutral-900'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
        <main className="space-y-6">{children}</main>
      </div>
    </div>
  )
}
