import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import { ApiError, apiRequest, setAuthToken, setUnauthorizedHandler } from '@/src/lib/api'

interface AdminAuthContextValue {
  token: string | null
  isAuthenticated: boolean
  isReady: boolean
  isLoading: boolean
  error: string | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  clearError: () => void
}

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined)

const STORAGE_KEY = 'admin.auth.token'

function readStoredToken(): string | null {
  if (typeof window === 'undefined') {
    return null
  }
  try {
    return window.sessionStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function persistToken(token: string | null): void {
  if (typeof window === 'undefined') {
    return
  }
  try {
    if (token) {
      window.sessionStorage.setItem(STORAGE_KEY, token)
    } else {
      window.sessionStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    // Ignore persistence failures (e.g., storage disabled)
  }
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const applyToken = useCallback((value: string | null) => {
    setTokenState(value)
    setAuthToken(value)
    persistToken(value)
  }, [])

  useEffect(() => {
    const stored = readStoredToken()
    if (stored) {
      applyToken(stored)
    }
    setIsReady(true)
  }, [applyToken])

  useEffect(() => {
    setUnauthorizedHandler(() => {
      applyToken(null)
    })
    return () => {
      setUnauthorizedHandler(null)
    }
  }, [applyToken])

  const logout = useCallback(() => {
    applyToken(null)
  }, [applyToken])

  const login = useCallback(
    async (username: string, password: string) => {
      setIsLoading(true)
      setError(null)
      try {
        const payload = await apiRequest<{ token?: string }>(
          '/v1/auth/login',
          {
            method: 'POST',
            json: { username, password },
            auth: false,
          },
        )
        if (!payload?.token) {
          throw new ApiError('Authentication response missing token', 500, payload)
        }
        applyToken(payload.token)
      } catch (err: any) {
        if (err instanceof ApiError) {
          setError(err.message)
        } else if (typeof err?.message === 'string') {
          setError(err.message)
        } else {
          setError('Unable to authenticate. Please try again.')
        }
        applyToken(null)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [applyToken],
  )

  const clearError = useCallback(() => setError(null), [])

  const value = useMemo<AdminAuthContextValue>(
    () => ({
      token,
      isAuthenticated: Boolean(token),
      isReady,
      isLoading,
      error,
      login,
      logout,
      clearError,
    }),
    [token, isReady, isLoading, error, login, logout, clearError],
  )

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

export function useAdminAuth(): AdminAuthContextValue {
  const context = useContext(AdminAuthContext)
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  }
  return context
}
