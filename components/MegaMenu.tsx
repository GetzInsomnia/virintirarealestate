import { useState, useRef, useEffect, useId, useCallback } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import { NavItem } from '@/config/nav'

interface MegaMenuProps {
  item: NavItem
}

export default function MegaMenu({ item }: MegaMenuProps) {
  const [open, setOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuItemsRef = useRef<HTMLElement[]>([])
  const id = useId()
  const menuId = `${id}-menu`
  const buttonId = `${id}-trigger`
  const shouldReduceMotion = useReducedMotion()

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
    if (!open) {
      menuItemsRef.current = []
      return
    }

    const items = Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []
    )

    menuItemsRef.current = items

    if (items.length > 0) {
      const focusTarget = items[0]
      // Delay focus slightly to ensure elements are mounted when animations run
      if (typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(() => focusTarget.focus())
      } else {
        focusTarget.focus()
      }
    }
  }, [open])

  const handleMenuKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const { key } = event
      const items = menuItemsRef.current

      if (!items.length) return

      const currentIndex = items.findIndex((item) => item === document.activeElement)
      const lastIndex = items.length - 1

      if (key === 'ArrowDown' || key === 'ArrowRight') {
        event.preventDefault()
        const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % items.length : 0
        items[nextIndex].focus()
      } else if (key === 'ArrowUp' || key === 'ArrowLeft') {
        event.preventDefault()
        const prevIndex = currentIndex >= 0 ? (currentIndex - 1 + items.length) % items.length : lastIndex
        items[prevIndex].focus()
      } else if (key === 'Home') {
        event.preventDefault()
        items[0].focus()
      } else if (key === 'End') {
        event.preventDefault()
        items[lastIndex].focus()
      }
    },
    []
  )

  const hasSections = item.sections && item.sections.length > 0

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        aria-haspopup="true"
        aria-expanded={open}
        id={buttonId}
        aria-controls={menuId}
        onClick={() => hasSections && setOpen((value) => !value)}
        disabled={!hasSections}
      >
        {item.title}
      </button>
      <AnimatePresence>
        {open && hasSections && (
          <motion.div
            id={menuId}
            ref={menuRef}
            role="menu"
            aria-labelledby={buttonId}
            onKeyDown={handleMenuKeyDown}
            initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.98 }}
            transition={{ duration: 0.14, ease: 'easeOut' }}
            className="absolute left-1/2 z-20 mt-2 w-screen max-w-4xl -translate-x-1/2 rounded-md border border-gray-200 bg-white shadow-lg focus:outline-none"
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
                  <ul className="space-y-2" role="none">
                    {section.items.map((link) => (
                      <li key={link.title} role="none">
                        <Link
                          role="menuitem"
                          href={link.href}
                          className="block rounded-md px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
