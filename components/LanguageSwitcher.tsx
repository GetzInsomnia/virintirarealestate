import Link from 'next/link'
import { useRouter } from 'next/router'

const localeLabels: Record<string, string> = {
  th: 'ไทย',
  en: 'English',
  zh: '中文',
}

export default function LanguageSwitcher() {
  const router = useRouter()
  const { locale, defaultLocale, pathname, query, locales } = router
  const activeLocale = locale ?? defaultLocale

  return (
    <nav aria-label="Language selector">
      <ul className="flex gap-2">
        {(locales ?? []).map((code) => {
          const label = localeLabels[code] ?? code
          const isActive = activeLocale === code
          return (
            <li key={code}>
              <Link
                href={{ pathname, query }}
                locale={code}
                aria-label={`Switch to ${label}`}
                aria-current={isActive ? 'page' : undefined}
                className={isActive ? 'font-bold' : 'font-normal'}
              >
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
