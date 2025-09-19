import { useState, useRef, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { NAV_MAIN } from '@/config/nav'
import LanguageSwitcher from '../LanguageSwitcher'
import CurrencySwitcher from '@/components/CurrencySwitcher'
import MegaMenu from '../MegaMenu'
import MobileMenu from '../MobileMenu'
import { ContactIcons } from '@/components/ContactIcons'
import SearchPanel, {
  normalizeSearchLocale,
  type SearchLocale,
} from '@/components/search/SearchPanel'

export default function NavBar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const searchToggleRef = useRef<HTMLButtonElement>(null)
  const router = useRouter()
  const searchPanelId = 'header-search-panel'

  const activeLocale = useMemo(() => {
    const queryLocale = Array.isArray(router.query?.locale)
      ? router.query?.locale[0]
      : router.query?.locale
    return normalizeSearchLocale(queryLocale ?? router.locale ?? router.defaultLocale ?? 'en')
  }, [router.query?.locale, router.locale, router.defaultLocale])

  function handleClose() {
    setMobileOpen(false)
    toggleRef.current?.focus()
  }

  const handleSearchClose = useCallback(() => {
    setSearchOpen(false)
    searchToggleRef.current?.focus()
  }, [])

  const handleSearchSubmit = useCallback(
    (query: string, locale: SearchLocale) => {
      const destination = `/${locale}/search?q=${encodeURIComponent(query)}`
      handleSearchClose()
      router.push(destination)
    },
    [router, handleSearchClose]
  )

  return (
    <header>
      <nav aria-label="Main navigation" className="flex items-center justify-between py-4">
        <button
          ref={toggleRef}
          className="md:hidden p-2"
          aria-controls="mobile-menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((o) => !o)}
        >
          Menu
        </button>
        <div className="flex items-center gap-4">
          <ul className="hidden md:flex gap-4 items-center">
            {NAV_MAIN.map((item) => {
              const hasSections = item.sections && item.sections.length > 0
              return (
                <li key={item.title}>
                  {hasSections ? (
                    <MegaMenu item={item} />
                  ) : (
                    <Link href={item.href ?? '#'}>{item.title}</Link>
                  )}
                </li>
              )
            })}
            <li><LanguageSwitcher /></li>
            <li><CurrencySwitcher /></li>
          </ul>
          <ContactIcons className="hidden xl:flex" />
          <Link
            href={`/${activeLocale}/console`}
            className="ml-2 inline-flex h-10 w-10 items-center justify-center rounded-full border border-neutral-300 text-lg"
            aria-label="Open console hub"
          >
            <span aria-hidden="true">👤</span>
          </Link>
          <button
            type="button"
            ref={searchToggleRef}
            className="ml-2 inline-flex items-center justify-center rounded-full border border-neutral-300 p-2 text-lg"
            aria-label="Toggle search"
            aria-expanded={searchOpen}
            aria-controls={searchPanelId}
            onClick={() => setSearchOpen((open) => !open)}
          >
            <span aria-hidden="true">🔍</span>
          </button>
        </div>
      </nav>
      <SearchPanel
        id={searchPanelId}
        open={searchOpen}
        locale={activeLocale}
        onClose={handleSearchClose}
        onSubmit={handleSearchSubmit}
      />
      <MobileMenu open={mobileOpen} onClose={handleClose} items={NAV_MAIN}>
        <LanguageSwitcher />
        <CurrencySwitcher />
      </MobileMenu>
    </header>
  )
}
