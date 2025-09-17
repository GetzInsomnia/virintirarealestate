import type { NextApiRequest, NextApiResponse } from 'next'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'

import { createAdminSessionCookie } from '../../../src/lib/auth/session'
import { logAuditEvent } from '../../../src/lib/logging/audit'
import { consumeLoginRateLimit } from '../../../src/lib/security/rateLimit'
import { prisma } from '@/src/lib/prisma'

interface LoginRequestBody {
  username?: unknown
  password?: unknown
}

interface SuccessResponse {
  ok: true
}

interface ErrorResponse {
  error: string
}

type ResponseBody = SuccessResponse | ErrorResponse

const GENERIC_AUTH_ERROR = 'Invalid username or password'
const RATE_LIMIT_ERROR = 'Too many login attempts. Please try again later.'
const INTERNAL_ERROR = 'Unable to process login right now'

const DUMMY_BCRYPT_HASH = bcrypt.hashSync('admin-login-dummy-password', 10)

function parseBooleanFlag(value: string | undefined | null): boolean {
  if (!value) return false
  const normalized = value.trim().toLowerCase()
  return ['1', 'true', 't', 'yes', 'y', 'on'].includes(normalized)
}

function isDatabaseAuthEnabled(): boolean {
  return parseBooleanFlag(
    process.env.ADMIN_DB_AUTH_ENABLED ?? process.env.ADMIN_DB_AUTH ?? undefined
  )
}


function getClientIp(req: NextApiRequest): string {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    const [first] = forwarded.split(',')
    if (first?.trim()) return first.trim()
  }
  if (Array.isArray(forwarded) && forwarded.length > 0) {
    const [first] = forwarded[0].split(',')
    if (first?.trim()) return first.trim()
  }
  return req.socket?.remoteAddress ?? 'unknown'
}

function constantTimeEquals(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8')
  const bufB = Buffer.from(b, 'utf8')
  const len = Math.max(bufA.length, bufB.length)
  const paddedA = Buffer.alloc(len)
  const paddedB = Buffer.alloc(len)
  bufA.copy(paddedA)
  bufB.copy(paddedB)
  try {
    return crypto.timingSafeEqual(paddedA, paddedB) && bufA.length === bufB.length
  } catch {
    return false
  }
}

function comparePassword(password: string, hash: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, hash, (error, result) => {
      if (error) {
        reject(error)
        return
      }
      resolve(Boolean(result))
    })
  })
}

async function verifyWithDatabase(
  username: string,
  password: string
): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { username },
  })

  if (!user) {
    await comparePassword(password, DUMMY_BCRYPT_HASH)
    return null
  }

  if (!user.isActive) {
    await comparePassword(password, DUMMY_BCRYPT_HASH)
    return null
  }

  const passwordMatches = await comparePassword(password, user.passwordHash)
  if (!passwordMatches) {
    return null
  }

  return user.username
}

async function verifyWithEnv(
  username: string,
  password: string
): Promise<string | null> {
  const expectedUser = process.env.ADMIN_USER
  if (!expectedUser) {
    return null
  }

  const expectedHash = process.env.ADMIN_HASH
  const expectedPassword = process.env.ADMIN_PASSWORD

  const usernameMatches = constantTimeEquals(username, expectedUser)

  if (expectedHash) {
    const passwordMatches = await comparePassword(password, expectedHash)
    if (usernameMatches && passwordMatches) {
      return expectedUser
    }
    return null
  }

  if (typeof expectedPassword === 'string' && expectedPassword.length > 0) {
    const passwordMatches = constantTimeEquals(password, expectedPassword)
    if (usernameMatches && passwordMatches) {
      return expectedUser
    }
  }

  return null
}

async function verifyCredentials(
  username: string,
  password: string
): Promise<string | null> {
  if (isDatabaseAuthEnabled()) {
    return verifyWithDatabase(username, password)
  }
  return verifyWithEnv(username, password)
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseBody>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  res.setHeader('Cache-Control', 'no-store, max-age=0')

  const clientIp = getClientIp(req)
  const rateLimitRes = await consumeLoginRateLimit(clientIp)
  if (rateLimitRes) {
    const retryAfterSeconds = Math.ceil(rateLimitRes.msBeforeNext / 1000)
    res.setHeader('Retry-After', String(retryAfterSeconds))
    await logAuditEvent({
      actor: 'unknown',
      action: 'admin_login',
      result: 'failure',
      ip: clientIp,
      reason: 'rate_limited',
      details: { msBeforeNext: rateLimitRes.msBeforeNext },
    })
    res.status(429).json({ error: RATE_LIMIT_ERROR })
    return
  }

  const body = (req.body ?? {}) as LoginRequestBody
  const usernameRaw =
    typeof body.username === 'string' ? body.username.trim() : ''
  const passwordRaw = typeof body.password === 'string' ? body.password : ''

  if (!usernameRaw || !passwordRaw) {
    await logAuditEvent({
      actor: usernameRaw || 'unknown',
      action: 'admin_login',
      result: 'failure',
      ip: clientIp,
      reason: 'invalid_request',
    })
    res.status(400).json({ error: GENERIC_AUTH_ERROR })
    return
  }

  try {
    const verifiedUsername = await verifyCredentials(usernameRaw, passwordRaw)
    if (!verifiedUsername) {
      await logAuditEvent({
        actor: usernameRaw,
        action: 'admin_login',
        result: 'failure',
        ip: clientIp,
        reason: 'invalid_credentials',
      })
      res.status(401).json({ error: GENERIC_AUTH_ERROR })
      return
    }

    let sessionCookie: ReturnType<typeof createAdminSessionCookie>
    try {
      sessionCookie = createAdminSessionCookie(verifiedUsername)
    } catch (error) {
      console.error('Failed to create admin session cookie', error)
      await logAuditEvent({
        actor: verifiedUsername,
        action: 'admin_login',
        result: 'failure',
        ip: clientIp,
        reason: 'session_error',
      })
      res.status(500).json({ error: INTERNAL_ERROR })
      return
    }

    res.setHeader('Set-Cookie', sessionCookie.cookie)

    await logAuditEvent({
      actor: verifiedUsername,
      action: 'admin_login',
      result: 'success',
      ip: clientIp,
      details: { expiresAt: sessionCookie.payload.expiresAt },
    })

    res.status(200).json({ ok: true })
  } catch (error) {
    console.error('Admin login attempt failed', error)
    await logAuditEvent({
      actor: usernameRaw,
      action: 'admin_login',
      result: 'failure',
      ip: clientIp,
      reason: 'internal_error',
    })
    res.status(500).json({ error: INTERNAL_ERROR })
  }
}
