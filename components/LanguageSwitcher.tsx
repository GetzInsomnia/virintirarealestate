import { useRouter } from 'next/router'

export default function LanguageSwitcher() {
  const router = useRouter()
  const { locale, asPath } = router

  const changeTo = locale === 'th' ? 'en' : 'th'

  return (
    <button
      onClick={() => router.push(asPath, asPath, { locale: changeTo })}
      disabled={locale === changeTo}
    >
      {changeTo === 'th' ? 'ไทย' : 'English'}
    </button>
  )
}
