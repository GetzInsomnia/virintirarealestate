import { useEffect, useRef, useCallback } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import { NavItem } from '@/config/nav'

interface MobileMenuProps {
  open: boolean
  onClose: () => void
  items: NavItem[]
  children?: React.ReactNode
}

export default function MobileMenu({ open, onClose, items, children }: MobileMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const shouldReduceMotion = useReducedMotion()

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
    if (!open) return

    const focusables = menuRef.current?.querySelectorAll<HTMLElement>(
      'a, button, select, textarea, input, [tabindex]:not([tabindex="-1"])'
    )

    if (focusables && focusables.length > 0) {
      const focusTarget = closeButtonRef.current ?? focusables[0]

      if (typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(() => focusTarget.focus())
      } else {
        focusTarget.focus()
      }
    }
  }, [open])

  const handleFocusTrap = useCallback(
    (event: KeyboardEvent) => {
      if (!open || event.key !== 'Tab') return

      const focusables = Array.from(
        menuRef.current?.querySelectorAll<HTMLElement>(
          'a, button, select, textarea, input, [tabindex]:not([tabindex="-1"])'
        ) ?? []
      ).filter((element) => !element.hasAttribute('disabled'))

      if (!focusables.length) return

      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const active = document.activeElement as HTMLElement | null

      if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      } else if (event.shiftKey && active === first) {
        event.preventDefault()
        last.focus()
      }
    },
    [open]
  )

  useEffect(() => {
    if (!open) return
    document.addEventListener('keydown', handleFocusTrap)
    return () => document.removeEventListener('keydown', handleFocusTrap)
  }, [open, handleFocusTrap])

  return (
    <AnimatePresence>
      {open && (
        <div className="md:hidden fixed inset-0 z-40">
          <motion.div
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
          />
          <motion.div
            id="mobile-menu"
            ref={menuRef}
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, x: shouldReduceMotion ? 0 : 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: shouldReduceMotion ? 0 : 16 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="relative ml-auto flex h-full w-full max-w-sm flex-col overflow-auto bg-white p-4 shadow-xl"
          >
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="mb-4 self-end text-sm font-semibold text-gray-600 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
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
                                    className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-white hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
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
              {children && (
                <li role="none" className="mt-2 flex flex-wrap items-center gap-4">
                  {children}
                </li>
              )}
            </ul>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
