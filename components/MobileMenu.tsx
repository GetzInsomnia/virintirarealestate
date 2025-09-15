import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { NavItem } from '@/src/config/nav'

interface MobileMenuProps {
  open: boolean
  onClose: () => void
  items: NavItem[]
  children?: React.ReactNode
}

export default function MobileMenu({ open, onClose, items, children }: MobileMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (open) {
      menuRef.current?.querySelector('a,button,select')?.focus()
    }
  }, [open])

  if (!open) return null

  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  return (
    <div
      id="mobile-menu"
      ref={menuRef}
      role="dialog"
      aria-modal="true"
      className={`md:hidden fixed inset-0 bg-white p-4 overflow-auto ${prefersReduced ? '' : 'transition-transform duration-200'}`}
    >
      <button onClick={onClose} className="mb-4">
        Close
      </button>
      <ul className="flex flex-col gap-4" role="menu">
        {items.map((item) => (
          <li key={item.title} role="none">
            <Link href={item.href ?? '#'} role="menuitem" className="block">
              {item.title}
            </Link>
            {item.children && (
              <ul className="ml-4 mt-2 flex flex-col gap-2" role="menu">
                {item.children.map((child) => (
                  <li key={child.title} role="none">
                    <Link href={child.href ?? '#'} role="menuitem" className="block">
                      {child.title}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
        {children && <li role="none" className="mt-4 flex gap-4 items-center">{children}</li>}
      </ul>
    </div>
  )
}
