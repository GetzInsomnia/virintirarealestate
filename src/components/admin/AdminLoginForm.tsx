import { FormEvent, useEffect, useState } from 'react'

import { useAdminAuth } from '@/context/AdminAuthContext'

interface Props {
  title?: string
  description?: string
}

export default function AdminLoginForm({
  title = 'Admin login',
  description = 'Sign in with your workspace credentials to continue.',
}: Props) {
  const { login, isLoading, error, clearError } = useAdminAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

  useEffect(() => {
    if (error) {
      setLocalError(error)
    }
  }, [error])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLocalError(null)
    clearError()
    try {
      await login(username.trim(), password)
      setPassword('')
    } catch (err: any) {
      if (typeof err?.message === 'string') {
        setLocalError(err.message)
      } else if (!localError) {
        setLocalError('Login failed. Please check your credentials.')
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-xl">
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        <p className="mt-2 text-sm text-slate-600">{description}</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="admin-username" className="text-sm font-medium text-slate-700">
              Username
            </label>
            <input
              id="admin-username"
              name="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none"
              autoComplete="username"
              disabled={isLoading}
              required
            />
          </div>
          <div>
            <label htmlFor="admin-password" className="text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              name="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none"
              autoComplete="current-password"
              disabled={isLoading}
              required
            />
          </div>
          {localError && <p className="text-sm text-red-600">{localError}</p>}
          <button
            type="submit"
            className="w-full rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
