import Link from 'next/link'
import { useRouter } from 'next/router'

export default function LanguageSwitcher() {
  const router = useRouter()
  const { locale, defaultLocale, pathname, query } = router

  // ลิสต์ภาษา
  const languages = [
    { code: 'th', label: 'ไทย' },
    { code: 'en', label: 'English' },
    { code: 'zh', label: '中文' },
  ]

  return (
    <div>
      {languages.map((lang) => (
        <Link
          key={lang.code}
          href={{ pathname, query }}
          locale={lang.code}
          style={{
            marginRight: 8,
            fontWeight:
              (locale ?? defaultLocale) === lang.code ? 'bold' : 'normal'
          }}
        >
          {lang.label}
        </Link>
      ))}
    </div>
  )
}
