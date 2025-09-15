import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { NavItem } from '@/src/config/nav'

interface MegaMenuProps {
  item: NavItem
}

export default function MegaMenu({ item }: MegaMenuProps) {
  const [open, setOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLUListElement>(null)

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
    if (open) menuRef.current?.querySelector('a')?.focus()
  }, [open])

  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {item.title}
      </button>
      {open && (
        <ul
          ref={menuRef}
          role="menu"
          className={`absolute mt-2 bg-white shadow ${prefersReduced ? '' : 'transition-opacity duration-200'}`}
        >
          {item.children?.map((child) => (
            <li key={child.title} role="none">
              <Link role="menuitem" href={child.href ?? '#'} className="block px-4 py-2">
                {child.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
