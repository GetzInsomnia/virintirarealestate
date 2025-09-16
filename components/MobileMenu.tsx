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
      className={`md:hidden fixed inset-0 bg-white p-4 overflow-auto ${
        prefersReduced ? '' : 'transition-transform duration-200'
      }`}
    >
      <button onClick={onClose} className="mb-4 text-sm font-semibold text-gray-600">
        Close
      </button>
      <ul className="flex flex-col gap-6" role="menu">
        {items.map((item) => {
          const hasSections = item.sections && item.sections.length > 0
          return (
            <li key={item.title} role="none" className="space-y-3">
              {item.href ? (
                <Link
                  href={item.href}
                  role="menuitem"
                  className="text-lg font-semibold"
                  onClick={onClose}
                >
                  {item.title}
                </Link>
              ) : (
                <span className="text-lg font-semibold" role="presentation">
                  {item.title}
                </span>
              )}
              {item.description && (
                <p className="text-sm text-gray-600">{item.description}</p>
              )}
              {hasSections && (
                <div className="space-y-4" role="group" aria-label={`${item.title} sections`}>
                  {item.sections!.map((section) => (
                    <div key={section.title} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                      <p className="text-sm font-semibold text-gray-900">{section.title}</p>
                      {section.description && (
                        <p className="mt-1 text-xs text-gray-600">{section.description}</p>
                      )}
                      <ul className="mt-2 space-y-2" role="menu">
                        {section.items.map((link) => (
                          <li key={link.title} role="none">
                            <Link
                              href={link.href}
                              role="menuitem"
                              className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-white hover:text-gray-900"
                              onClick={onClose}
                            >
                              <span className="font-medium">{link.title}</span>
                              {link.description && (
                                <span className="mt-1 block text-xs text-gray-500">{link.description}</span>
                              )}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </li>
          )
        })}
        {children && <li role="none" className="mt-2 flex flex-wrap gap-4 items-center">{children}</li>}
      </ul>
    </div>
  )
}
