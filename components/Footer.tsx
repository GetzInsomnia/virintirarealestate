import Link from 'next/link'
import { NAV_MAIN } from '@/src/config/nav'
import LanguageSwitcher from './LanguageSwitcher'
import CurrencySwitcher from '@/src/components/CurrencySwitcher'
import { ContactIcons, CONTACT_ITEMS } from '@/src/components/ContactIcons'

export default function Footer() {
  return (
    <footer className="mt-8 border-t pt-4">
      <nav aria-label="Footer navigation">
        <ul className="flex flex-wrap gap-4 items-center">
          {NAV_MAIN.map((item) => (
            <li key={item.title}>
              <Link href={item.href ?? '#'}>{item.title}</Link>
            </li>
          ))}
          <li><LanguageSwitcher /></li>
          <li><CurrencySwitcher /></li>
          {CONTACT_ITEMS.length > 0 && (
            <li><ContactIcons /></li>
          )}
        </ul>
      </nav>
    </footer>
  )
}
