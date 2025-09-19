import { useMemo } from 'react'
import { useConsoleUser } from '@/context/ConsoleUserContext'

const FAVORITES_LIMIT: Record<'free' | 'premium', number> = {
  free: 20,
  premium: 100,
}

export interface FavoritesQuotaState {
  plan: 'free' | 'premium'
  used: number
  limit: number
  remaining: number
  isAtLimit: boolean
}

export function useFavoritesQuota(): FavoritesQuotaState {
  const { user } = useConsoleUser()

  return useMemo(() => {
    const limit = FAVORITES_LIMIT[user.plan]
    const used = Math.max(0, user.favoritesUsed)
    const remaining = Math.max(limit - used, 0)
    return {
      plan: user.plan,
      used,
      limit,
      remaining,
      isAtLimit: remaining === 0,
    }
  }, [user])
}
