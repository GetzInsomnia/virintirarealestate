import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { NavItem } from '@/src/config/nav'

interface MegaMenuProps {
  item: NavItem
}

export default function MegaMenu({ item }: MegaMenuProps) {
  const [open, setOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as Node
      if (!menuRef.current?.contains(target) && !buttonRef.current?.contains(target)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClick)
    }
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  useEffect(() => {
    if (open) menuRef.current?.querySelector('a')?.focus()
  }, [open])

  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const hasSections = item.sections && item.sections.length > 0

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => hasSections && setOpen((value) => !value)}
        disabled={!hasSections}
      >
        {item.title}
      </button>
      {open && hasSections && (
        <div
          ref={menuRef}
          role="menu"
          className={`absolute left-1/2 z-20 mt-2 w-screen max-w-4xl -translate-x-1/2 rounded-md border border-gray-200 bg-white shadow-lg focus:outline-none ${
            prefersReduced ? '' : 'transition-opacity duration-200'
          }`}
        >
          <div className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3">
            {item.href && (
              <div className="sm:col-span-2 lg:col-span-3">
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-500"
                  onClick={() => setOpen(false)}
                >
                  View all {item.title}
                </Link>
                {item.description && (
                  <p className="mt-1 text-sm text-gray-600">{item.description}</p>
                )}
              </div>
            )}
            {item.sections?.map((section) => (
              <div key={section.title} className="space-y-2">
                <p className="text-sm font-semibold text-gray-900">{section.title}</p>
                {section.description && (
                  <p className="text-xs text-gray-600">{section.description}</p>
                )}
                <ul className="space-y-2">
                  {section.items.map((link) => (
                    <li key={link.title} role="none">
                      <Link
                        role="menuitem"
                        href={link.href}
                        className="block rounded-md px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50 hover:text-gray-900"
                        onClick={() => setOpen(false)}
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
        </div>
      )}
    </div>
  )
}
