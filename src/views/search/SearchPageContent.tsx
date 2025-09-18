import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { useRouter } from 'next/router'
import { normalizeSearchLocale } from '@/components/search/SearchPanel'

interface ResultItem {
  title: string
  image: string
}

const PLACEHOLDER_IMAGE = '/images/placeholder.jpg'

type FetchStatus = 'idle' | 'loading' | 'error' | 'success'

export default function SearchPageContent() {
  const router = useRouter()
  const activeLocale = useMemo(() => {
    const paramLocale = Array.isArray(router.query?.locale)
      ? router.query?.locale[0]
      : router.query?.locale
    return normalizeSearchLocale(paramLocale ?? router.locale ?? router.defaultLocale ?? 'en')
  }, [router.query?.locale, router.locale, router.defaultLocale])
  const [inputValue, setInputValue] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState('')
  const [results, setResults] = useState<ResultItem[]>([])
  const [status, setStatus] = useState<FetchStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!router.isReady) return
    const param = router.query?.q
    const value = Array.isArray(param) ? param[0] ?? '' : param ?? ''
    setInputValue(value)
    setSubmittedQuery(value.trim())
  }, [router.isReady, router.query?.q])

  useEffect(() => {
    if (!submittedQuery) {
      setStatus('idle')
      setResults([])
      setErrorMessage('')
      return
    }
    const controller = new AbortController()
    setStatus('loading')
    setErrorMessage('')
    fetch(`/api/suggest?locale=${activeLocale}&q=${encodeURIComponent(submittedQuery)}`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error('Failed to fetch results')
        return response.json() as Promise<{ suggestions?: string[] }>
      })
      .then((data) => {
        const items = (data.suggestions ?? []).map((title) => ({
          title,
          image: PLACEHOLDER_IMAGE,
        }))
        setResults(items)
        setStatus('success')
      })
      .catch((error) => {
        if (error?.name === 'AbortError') return
        setErrorMessage('Something went wrong while loading results. Please try again.')
        setStatus('error')
        setResults([])
      })
    return () => {
      controller.abort()
    }
  }, [submittedQuery, activeLocale])

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      const trimmed = inputValue.trim()
      if (!trimmed) {
        setSubmittedQuery('')
        setResults([])
        setStatus('idle')
        return
      }
      const destination = `/${activeLocale}/search?q=${encodeURIComponent(trimmed)}`
      if (router.asPath === destination) {
        setSubmittedQuery(trimmed)
        return
      }
      setSubmittedQuery(trimmed)
      router.push(destination)
    },
    [inputValue, activeLocale, router]
  )

  return (
    <div className="px-4 py-10 md:py-16">
      <div className="mx-auto w-full max-w-3xl">
        <h1 className="text-3xl font-semibold text-neutral-900">Search</h1>
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4 md:flex-row">
          <label className="sr-only" htmlFor="search-input">
            Search
          </label>
          <input
            id="search-input"
            type="text"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder="Search for properties or guides"
            className="flex-1 rounded-md border border-neutral-300 px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-md bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            Search
          </button>
        </form>
        <div className="mt-8 space-y-4">
          {status === 'idle' && !submittedQuery && (
            <p className="text-neutral-500">Start typing to discover listings, guides, and more.</p>
          )}
          {status === 'loading' && <p className="text-neutral-500">Loading results…</p>}
          {status === 'error' && <p className="text-red-600">{errorMessage}</p>}
          {status === 'success' && results.length === 0 && (
            <p className="text-neutral-500">
              No results found for <span className="font-semibold">{submittedQuery}</span>.
            </p>
          )}
          {results.length > 0 && (
            <ul className="divide-y divide-neutral-200 rounded-md border border-neutral-200">
              {results.map((item) => {
                const href = `/${activeLocale}/search?q=${encodeURIComponent(item.title)}`
                return (
                  <li key={item.title} className="flex items-center gap-4 px-4 py-3">
                    <img
                      src={item.image}
                      alt=""
                      width={64}
                      height={64}
                      className="h-16 w-16 flex-shrink-0 rounded object-cover"
                    />
                    <div className="flex-1">
                      <Link
                        href={href}
                        className="text-lg font-medium text-primary-700 hover:underline"
                        onClick={() => {
                          setSubmittedQuery(item.title)
                          setInputValue(item.title)
                        }}
                      >
                        {item.title}
                      </Link>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
