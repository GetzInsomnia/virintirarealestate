import { useMemo } from 'react'
import { useConsoleUser } from '@/context/ConsoleUserContext'

const POST_LIMIT: Record<'free' | 'premium', number> = {
  free: 3,
  premium: 100,
}

export interface ConsolePaywallState {
  plan: 'free' | 'premium'
  used: number
  limit: number
  remaining: number
  showPaywall: boolean
  message: string
  cta: string
}

export function useConsolePaywall(): ConsolePaywallState {
  const { user } = useConsoleUser()

  return useMemo(() => {
    const limit = POST_LIMIT[user.plan]
    const used = Math.max(0, user.postsUsed)
    const remaining = Math.max(limit - used, 0)
    const showPaywall = user.plan === 'free' && remaining === 0
    const message = showPaywall
      ? `Upgrade to Premium to publish more than ${limit} listings.`
      : `You can publish ${remaining} more ${remaining === 1 ? 'listing' : 'listings'}.`

    const cta = showPaywall ? 'Upgrade now' : 'Create listing'

    return {
      plan: user.plan,
      used,
      limit,
      remaining,
      showPaywall,
      message,
      cta,
    }
  }, [user])
}
