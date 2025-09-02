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

  return (
    <div>
      {(locales ?? []).map((code) => (
        <Link
          key={code}
          href={{ pathname, query }}
          locale={code}
          style={{
            marginRight: 8,
            fontWeight: (locale ?? defaultLocale) === code ? 'bold' : 'normal'
          }}
        >
          {localeLabels[code] ?? code}
        </Link>
      ))}
    </div>
  )
}
