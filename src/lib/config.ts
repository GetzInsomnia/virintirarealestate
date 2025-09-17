export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '')

export const USE_API_READ =
  typeof process.env.NEXT_PUBLIC_USE_API_READ === 'string'
    ? process.env.NEXT_PUBLIC_USE_API_READ !== 'false'
    : true
