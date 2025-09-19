import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { CONSOLE_LOCALE_COOKIE, type ConsoleUserSession } from '@/lib/auth/consoleSession'

export type SubscriptionPlan = ConsoleUserSession['plan']

export interface ConsoleUser extends ConsoleUserSession {}

interface ConsoleUserContextValue {
  user: ConsoleUser
  updateLocalePreference: (locale: string) => void
}

const ConsoleUserContext = createContext<ConsoleUserContextValue | undefined>(
  undefined,
)

function persistLocalePreference(locale: string) {
  if (typeof document === 'undefined') return

  const oneYear = 365 * 24 * 60 * 60 * 1000
  const expires = new Date(Date.now() + oneYear).toUTCString()
  document.cookie = `${CONSOLE_LOCALE_COOKIE}=${encodeURIComponent(
    locale,
  )}; Path=/; Expires=${expires}`
}

interface ConsoleUserProviderProps {
  initialUser: ConsoleUser
  children: ReactNode
}

export function ConsoleUserProvider({
  initialUser,
  children,
}: ConsoleUserProviderProps) {
  const [user, setUser] = useState<ConsoleUser>(initialUser)

  const updateLocalePreference = useCallback((locale: string) => {
    setUser((current) => ({ ...current, localePreference: locale }))
    persistLocalePreference(locale)
  }, [])

  const value = useMemo(
    () => ({
      user,
      updateLocalePreference,
    }),
    [user, updateLocalePreference],
  )

  return (
    <ConsoleUserContext.Provider value={value}>
      {children}
    </ConsoleUserContext.Provider>
  )
}

export function useConsoleUser(): ConsoleUserContextValue {
  const context = useContext(ConsoleUserContext)
  if (!context) {
    throw new Error('useConsoleUser must be used within a ConsoleUserProvider')
  }
  return context
}
