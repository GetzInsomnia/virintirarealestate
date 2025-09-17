import type { NextApiRequest, NextApiResponse } from 'next'
import crypto from 'crypto'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'

import { createAdminSessionCookie } from '../../../src/lib/auth/session'
import { logAuditEvent } from '../../../src/lib/logging/audit'
import { consumeLoginRateLimit } from '../../../src/lib/security/rateLimit'

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

let cachedPool: Pool | null = null

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

function shouldUseDatabaseSsl(): boolean {
  return parseBooleanFlag(
    process.env.ADMIN_DB_SSL ?? process.env.DATABASE_SSL ?? undefined
  )
}

function getDatabaseConnectionString(): string {
  const connectionString =
    process.env.ADMIN_DB_URL ?? process.env.DATABASE_URL ?? undefined
  if (!connectionString) {
    throw new Error(
      'Database authentication is enabled but no connection string is configured'
    )
  }
  return connectionString
}

function getPool(): Pool {
  if (cachedPool) {
    return cachedPool
  }
  const connectionString = getDatabaseConnectionString()
  const useSsl = shouldUseDatabaseSsl()
  cachedPool = new Pool({
    connectionString,
    ssl: useSsl ? { rejectUnauthorized: false } : undefined,
  })
  cachedPool.on('error', (error) => {
    console.error('Unexpected admin database error', error)
  })
  return cachedPool
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

function isValueExplicitlyFalse(value: unknown): boolean {
  if (value === null || value === undefined) return false
  if (typeof value === 'boolean') return value === false
  if (typeof value === 'number') return value === 0
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    return ['0', 'false', 'f', 'no', 'inactive', 'disabled'].includes(normalized)
  }
  return false
}

function extractPasswordHash(row: Record<string, unknown>): string | null {
  const possibleKeys = ['password_hash', 'passwordHash', 'hash', 'password']
  for (const key of possibleKeys) {
    const value = row[key]
    if (typeof value === 'string' && value.length > 0) {
      return value
    }
  }
  return null
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
  const pool = getPool()
  const table = process.env.ADMIN_DB_TABLE ?? 'admin_users'
  const usernameColumn = process.env.ADMIN_DB_USERNAME_COLUMN ?? 'username'
  const passwordColumn =
    process.env.ADMIN_DB_PASSWORD_HASH_COLUMN ?? 'password_hash'
  const activeColumn = process.env.ADMIN_DB_ACTIVE_COLUMN

  const selectColumns = [
    `${usernameColumn} AS username`,
    `${passwordColumn} AS password_hash`,
  ]
  if (activeColumn) {
    selectColumns.push(`${activeColumn} AS is_active`)
  }

  const query = `SELECT ${selectColumns.join(', ')} FROM ${table} WHERE ${usernameColumn} = $1 LIMIT 1`

  const result = await pool.query(query, [username])
  if (result.rows.length === 0) {
    await comparePassword(password, DUMMY_BCRYPT_HASH)
    return null
  }

  const row = result.rows[0] as Record<string, unknown>
  const passwordHash = extractPasswordHash(row)
  if (!passwordHash) {
    await comparePassword(password, DUMMY_BCRYPT_HASH)
    return null
  }

  if (activeColumn) {
    const activeValue = row.is_active ?? row.active ?? row.enabled
    if (isValueExplicitlyFalse(activeValue)) {
      await comparePassword(password, DUMMY_BCRYPT_HASH)
      return null
    }
  }

  const passwordMatches = await comparePassword(password, passwordHash)
  if (!passwordMatches) {
    return null
  }

  const canonicalUsername =
    typeof row.username === 'string' && row.username.length > 0
      ? row.username
      : username
  return canonicalUsername
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
