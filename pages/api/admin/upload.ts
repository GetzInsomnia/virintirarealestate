import type { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import fs from 'fs/promises'
import path from 'path'
import sharp from 'sharp'
import { applyWatermark } from '../../../src/lib/image/watermark'
import { getAdminSessionFromCookies } from '../../../src/lib/auth/session'
import { parseCookies } from '../../../src/lib/http/cookies'
import { logAuditEvent } from '../../../src/lib/logging/audit'
import { isValidCsrfToken } from '../../../src/lib/security/csrf'
import { consumeUploadRateLimit } from '../../../src/lib/security/rateLimit'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
const CSRF_HEADER_NAME = 'x-csrf'

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

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const clientIp = getClientIp(req)
  const cookies = parseCookies(req.headers.cookie)
  let auditActor = 'unknown'

  const logFailure = async (
    reason: string,
    details?: Record<string, unknown>
  ) =>
    logAuditEvent({
      actor: auditActor,
      action: 'admin_upload',
      result: 'failure',
      ip: clientIp,
      reason,
      details,
    })

  const logSuccess = (details?: Record<string, unknown>) =>
    logAuditEvent({
      actor: auditActor,
      action: 'admin_upload',
      result: 'success',
      ip: clientIp,
      details,
    })

  const rateLimitRes = await consumeUploadRateLimit(clientIp)
  if (rateLimitRes) {
    res.setHeader('Retry-After', Math.ceil(rateLimitRes.msBeforeNext / 1000))
    await logFailure('rate_limited', { msBeforeNext: rateLimitRes.msBeforeNext })
    res.status(429).json({ error: 'Too many requests' })
    return
  }

  if (!isValidCsrfToken(cookies, req.headers[CSRF_HEADER_NAME])) {
    await logFailure('csrf_mismatch')
    res.status(403).json({ error: 'Invalid CSRF token' })
    return
  }

  const session = getAdminSessionFromCookies(cookies)
  if (!session) {
    await logFailure('unauthorized')
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  auditActor = session.username

  const form = formidable({ multiples: false, maxFileSize: MAX_FILE_SIZE })

  let files: formidable.Files
  try {
    const parsed = (await form.parse(req)) as [
      formidable.Fields,
      formidable.Files
    ]
    files = parsed[1]
  } catch (error: unknown) {
    const httpCode =
      typeof error === 'object' && error && 'httpCode' in error
        ? (error as { httpCode?: number }).httpCode
        : undefined
    if (httpCode === 413) {
      await logFailure('file_too_large', { stage: 'parse' })
      res.status(400).json({ error: 'File is too large' })
    } else {
      await logFailure('form_parse_failed', {
        error: error instanceof Error ? error.message : 'unknown',
      })
      res.status(500).json({ error: 'Failed to parse form' })
    }
    return
  }

  const uploaded = files.file as
    | formidable.File
    | formidable.File[]
    | undefined
  if (!uploaded || Array.isArray(uploaded)) {
    await logFailure('missing_file')
    res.status(400).json({ error: 'No file uploaded' })
    return
  }

  const file = uploaded

  if (!ALLOWED_TYPES.includes(file.mimetype || '')) {
    await logFailure('invalid_file_type', {
      mimetype: file.mimetype ?? null,
    })
    res.status(400).json({ error: 'Invalid file type' })
    return
  }

  if (file.size > MAX_FILE_SIZE) {
    await logFailure('file_too_large', { size: file.size })
    res.status(400).json({ error: 'File is too large' })
    return
  }

  let buffer: Buffer
  try {
    buffer = await fs.readFile(file.filepath)
  } catch (error: unknown) {
    await logFailure('file_read_failed', {
      error: error instanceof Error ? error.message : 'unknown',
    })
    res.status(500).json({ error: 'Failed to read uploaded file' })
    return
  }

  try {
    if (process.env.WATERMARK_ENABLED === 'true') {
      buffer = await applyWatermark(buffer)
    }
  } catch (error: unknown) {
    await logFailure('watermark_failed', {
      error: error instanceof Error ? error.message : 'unknown',
    })
    res.status(500).json({ error: 'Failed to apply watermark' })
    return
  }

  const processedDir = path.join(process.cwd(), 'public', 'uploads', 'processed')
  try {
    await fs.mkdir(processedDir, { recursive: true })
  } catch (error: unknown) {
    await logFailure('directory_prepare_failed', {
      error: error instanceof Error ? error.message : 'unknown',
    })
    res.status(500).json({ error: 'Failed to prepare upload directory' })
    return
  }

  const baseName = path.parse(file.originalFilename || 'upload').name
  const webpPath = path.join(processedDir, `${baseName}.webp`)
  const avifPath = path.join(processedDir, `${baseName}.avif`)

  try {
    await sharp(buffer).webp().toFile(webpPath)
    await sharp(buffer).avif().toFile(avifPath)
  } catch (error: unknown) {
    await logFailure('image_processing_failed', {
      error: error instanceof Error ? error.message : 'unknown',
    })
    res.status(500).json({ error: 'Failed to process image' })
    return
  }

  const responsePayload = {
    webp: `/uploads/processed/${baseName}.webp`,
    avif: `/uploads/processed/${baseName}.avif`,
  }

  await logSuccess({
    filename: file.originalFilename ?? null,
    mimetype: file.mimetype ?? null,
    size: file.size,
    outputs: responsePayload,
  })

  res.status(200).json(responsePayload)
}
