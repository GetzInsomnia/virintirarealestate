import { useState, useRef } from 'react'
import Link from 'next/link'
import { NAV_MAIN } from '@/src/config/nav'
import LanguageSwitcher from '../LanguageSwitcher'
import CurrencySwitcher from '@/src/components/CurrencySwitcher'
import MegaMenu from '../MegaMenu'
import MobileMenu from '../MobileMenu'
import { ContactIcons } from '@/src/components/ContactIcons'

export default function NavBar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)

  function handleClose() {
    setMobileOpen(false)
    toggleRef.current?.focus()
  }

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
            {NAV_MAIN.map((item) => (
              <li key={item.title}>
                {item.children ? (
                  <MegaMenu item={item} />
                ) : (
                  <Link href={item.href ?? '#'}>{item.title}</Link>
                )}
              </li>
            ))}
            <li><LanguageSwitcher /></li>
            <li><CurrencySwitcher /></li>
          </ul>
          <ContactIcons className="hidden xl:flex" />
        </div>
      </nav>
      <MobileMenu open={mobileOpen} onClose={handleClose} items={NAV_MAIN}>
        <LanguageSwitcher />
        <CurrencySwitcher />
      </MobileMenu>
    </header>
  )
}
