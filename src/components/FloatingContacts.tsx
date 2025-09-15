import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CONTACT_ITEMS } from '@/src/components/ContactIcons'

interface IconProps extends React.SVGProps<SVGSVGElement> {}

function PlusIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  )
}

function XMarkIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  )
}

export default function FloatingContacts() {
  const [open, setOpen] = useState(false)

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mb-2 flex flex-col items-center gap-2"
          >
            {CONTACT_ITEMS.map(({ label, href, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-2 rounded-full bg-white shadow"
                >
                  <Icon className="w-6 h-6" />
                </a>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
      <button
        aria-label="Toggle contacts"
        onClick={() => setOpen((o) => !o)}
        className="p-3 rounded-full bg-blue-600 text-white shadow"
      >
        {open ? <XMarkIcon className="w-6 h-6" /> : <PlusIcon className="w-6 h-6" />}
      </button>
    </div>
  )
}
