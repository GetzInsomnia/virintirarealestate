import { useRouter } from 'next/router'

export default function LanguageSwitcher() {
  const router = useRouter()
  const { locale, asPath, pathname, query } = router

  // ลิสต์ภาษา
  const languages = [
    { code: 'th', label: 'ไทย' },
    { code: 'en', label: 'English' },
  ]

  return (
    <div>
      {languages.map((lang) => (
        <button
          key={lang.code}
          disabled={locale === lang.code}
          onClick={() => {
            // ใช้ pathname + query เพื่อไม่ให้ path หาย
            router.push({ pathname, query }, asPath, { locale: lang.code })
          }}
          style={{
            marginRight: 8,
            fontWeight: locale === lang.code ? 'bold' : 'normal'
          }}
        >
          {lang.label}
        </button>
      ))}
    </div>
  )
}
