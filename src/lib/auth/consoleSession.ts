import { z } from 'zod'
import type { CookieMap } from '@/lib/http/cookies'

export const CONSOLE_USER_COOKIE = 'console_user'
export const CONSOLE_LOCALE_COOKIE = 'console_locale'

const consoleUserSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    email: z.string().email(),
    plan: z.union([z.literal('free'), z.literal('premium')]),
    favoritesUsed: z.number().int().min(0).default(0),
    postsUsed: z.number().int().min(0).default(0),
    localePreference: z.string().min(2).max(5).optional(),
  })
  .transform((data) => ({
    ...data,
    favoritesUsed: data.favoritesUsed ?? 0,
    postsUsed: data.postsUsed ?? 0,
  }))

export type ConsoleUserSession = z.infer<typeof consoleUserSchema>

function decodeBase64Json(value: string): unknown {
  const json = Buffer.from(value, 'base64url').toString('utf8')
  return JSON.parse(json)
}

export function parseConsoleUser(value: string | undefined): ConsoleUserSession | null {
  if (!value) return null

  try {
    const raw = decodeBase64Json(value)
    return consoleUserSchema.parse(raw)
  } catch {
    return null
  }
}

export function getConsoleUserFromCookies(
  cookies: CookieMap,
): ConsoleUserSession | null {
  const raw = cookies[CONSOLE_USER_COOKIE]
  return parseConsoleUser(raw)
}
