import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

export type SearchLocale = 'en' | 'th' | 'zh'

export interface SearchPanelProps {
  open: boolean
  locale?: string
  onClose?: () => void
  onSubmit?: (query: string, locale: SearchLocale) => void
  id?: string
  className?: string
}

interface SuggestionItem {
  title: string
  image: string
}

const PLACEHOLDER_IMAGE = '/images/placeholder.jpg'

function classNames(...tokens: Array<string | false | null | undefined>) {
  return tokens.filter(Boolean).join(' ')
}

export function normalizeSearchLocale(input?: string): SearchLocale {
  const value = input?.toLowerCase()
  if (value === 'th') return 'th'
  if (value === 'zh' || value === 'zh-cn' || value === 'zh-hans') return 'zh'
  return 'en'
}

export default function SearchPanel({
  open,
  locale,
  onClose,
  onSubmit,
  id,
  className,
}: SearchPanelProps) {
  const inputId = useId()
  const listboxId = `${inputId}-listbox`
  const panelRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const shouldReduceMotion = useReducedMotion()
  const activeLocale = useMemo(() => normalizeSearchLocale(locale), [locale])
  const fetchSequence = useRef(0)

  useEffect(() => {
    if (!open) {
      setQuery('')
      setSuggestions([])
      setHighlightedIndex(-1)
      setError(null)
      setLoading(false)
      return
    }
    const timer = window.setTimeout(() => {
      inputRef.current?.focus()
    }, 50)
    return () => window.clearTimeout(timer)
  }, [open])

  useEffect(() => {
    if (!open) return
    const trimmed = query.trim()
    if (!trimmed) {
      setSuggestions([])
      setHighlightedIndex(-1)
      setError(null)
      setLoading(false)
      return
    }
    const currentRequest = ++fetchSequence.current
    const controller = new AbortController()
    setLoading(true)
    setError(null)
    const timeout = window.setTimeout(() => {
      fetch(`/api/suggest?locale=${activeLocale}&q=${encodeURIComponent(trimmed)}`, {
        signal: controller.signal,
      })
        .then((response) => {
          if (!response.ok) throw new Error('Failed to fetch suggestions')
          return response.json() as Promise<{ suggestions?: string[] }>
        })
        .then((data) => {
          if (fetchSequence.current !== currentRequest) return
          const rows = (data.suggestions ?? []).map((title) => ({
            title,
            image: PLACEHOLDER_IMAGE,
          }))
          setSuggestions(rows)
          setHighlightedIndex(rows.length > 0 ? 0 : -1)
        })
        .catch((err) => {
          if (err?.name === 'AbortError') return
          if (fetchSequence.current !== currentRequest) return
          setError('Unable to load suggestions')
          setSuggestions([])
          setHighlightedIndex(-1)
        })
        .finally(() => {
          if (fetchSequence.current === currentRequest) {
            setLoading(false)
          }
        })
    }, 200)

    return () => {
      window.clearTimeout(timeout)
      controller.abort()
    }
  }, [query, activeLocale, open])

  useEffect(() => {
    if (!open) return
    const handlePointer = (event: MouseEvent | TouchEvent) => {
      if (!panelRef.current) return
      const target = event.target as Node | null
      if (target && panelRef.current.contains(target)) return
      onClose?.()
    }
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose?.()
      }
    }
    document.addEventListener('mousedown', handlePointer)
    document.addEventListener('touchstart', handlePointer)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handlePointer)
      document.removeEventListener('touchstart', handlePointer)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open, onClose])

  const submitQuery = useCallback(
    (value: string) => {
      const trimmed = value.trim()
      if (!trimmed) return
      onSubmit?.(trimmed, activeLocale)
    },
    [onSubmit, activeLocale]
  )

  const handleFormSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      const selected =
        highlightedIndex >= 0 && highlightedIndex < suggestions.length
          ? suggestions[highlightedIndex].title
          : query
      submitQuery(selected)
    },
    [highlightedIndex, suggestions, query, submitQuery]
  )

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (!suggestions.length) return
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setHighlightedIndex((index) => (index + 1) % suggestions.length)
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        setHighlightedIndex((index) => (index - 1 + suggestions.length) % suggestions.length)
      } else if (event.key === 'Enter') {
        const selected =
          highlightedIndex >= 0 && highlightedIndex < suggestions.length
            ? suggestions[highlightedIndex].title
            : query
        submitQuery(selected)
      }
    },
    [suggestions, highlightedIndex, query, submitQuery]
  )

  const handleSuggestionClick = useCallback(
    (title: string) => {
      submitQuery(title)
    },
    [submitQuery]
  )

  return (
    <AnimatePresence>
      {open ? (
        <motion.section
          id={id}
          aria-labelledby={`${inputId}-label`}
          initial={shouldReduceMotion ? false : { height: 0, opacity: 0 }}
          animate={shouldReduceMotion ? { height: 'auto', opacity: 1 } : { height: 'auto', opacity: 1 }}
          exit={shouldReduceMotion ? { height: 0, opacity: 0 } : { height: 0, opacity: 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.2, ease: 'easeInOut' }}
          className={classNames('overflow-hidden bg-white shadow-lg border-t border-neutral-200', className)}
        >
          <div ref={panelRef} className="px-4 py-6 md:px-6">
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label id={`${inputId}-label`} htmlFor={inputId} className="sr-only">
                  Search
                </label>
                <input
                  ref={inputRef}
                  id={inputId}
                  type="text"
                  role="combobox"
                  aria-autocomplete="list"
                  aria-expanded={suggestions.length > 0}
                  aria-controls={listboxId}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search for properties or guides"
                  className="w-full rounded-md border border-neutral-300 px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  Search
                </button>
              </div>
            </form>
            <div className="mt-4">
              {loading && <p className="text-sm text-neutral-500">Loading suggestions…</p>}
              {error && <p className="text-sm text-red-600">{error}</p>}
              {suggestions.length > 0 && (
                <ul
                  id={listboxId}
                  role="listbox"
                  className="mt-2 max-h-64 overflow-y-auto divide-y divide-neutral-200 border border-neutral-200 rounded-md"
                >
                  {suggestions.map((item, index) => (
                    <li
                      key={`${item.title}-${index}`}
                      role="option"
                      aria-selected={highlightedIndex === index}
                      className={classNames(
                        'flex cursor-pointer items-center gap-4 px-4 py-3 transition-colors',
                        highlightedIndex === index ? 'bg-primary-50' : 'bg-white'
                      )}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => handleSuggestionClick(item.title)}
                    >
                      <img
                        src={item.image}
                        alt=""
                        width={48}
                        height={48}
                        className="h-12 w-12 flex-shrink-0 rounded object-cover"
                      />
                      <span className="text-sm font-medium text-neutral-900">{item.title}</span>
                    </li>
                  ))}
                </ul>
              )}
              {!loading && !error && query.trim() && suggestions.length === 0 && (
                <p className="text-sm text-neutral-500">No matches found.</p>
              )}
            </div>
          </div>
        </motion.section>
      ) : null}
    </AnimatePresence>
  )
}
