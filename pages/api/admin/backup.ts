import type { NextApiRequest, NextApiResponse } from 'next'
import archiver, { type Archiver } from 'archiver'
import fs from 'fs/promises'
import { Dirent } from 'fs'
import path from 'path'

import { requireAdminAuth } from '@/src/lib/admin/apiAuth'

interface ErrorResponse {
  error: string
}

const RECENT_UPLOAD_LIMIT = 20

async function addDevDatabase(archive: Archiver) {
  const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')
  try {
    await fs.access(dbPath)
    archive.file(dbPath, { name: path.join('prisma', 'dev.db') })
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException)?.code !== 'ENOENT') {
      throw error
    }
  }
}

async function addDataJsonFiles(archive: Archiver) {
  const dataDir = path.join(process.cwd(), 'public', 'data')
  let entries: Dirent[]
  try {
    entries = await fs.readdir(dataDir, { withFileTypes: true })
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException)?.code === 'ENOENT') {
      return
    }
    throw error
  }

  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith('.json')) {
      const absolute = path.join(dataDir, entry.name)
      archive.file(absolute, {
        name: path.join('public', 'data', entry.name),
      })
    }
  }
}

interface UploadFileEntry {
  name: string
  absolutePath: string
  mtimeMs: number
}

async function getRecentProcessedUploads(): Promise<UploadFileEntry[]> {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'processed')
  let entries: Dirent[]
  try {
    entries = await fs.readdir(uploadsDir, { withFileTypes: true })
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException)?.code === 'ENOENT') {
      return []
    }
    throw error
  }

  const files: UploadFileEntry[] = []
  for (const entry of entries) {
    if (!entry.isFile()) continue
    const absolutePath = path.join(uploadsDir, entry.name)
    try {
      const stats = await fs.stat(absolutePath)
      files.push({
        name: entry.name,
        absolutePath,
        mtimeMs: stats.mtimeMs,
      })
    } catch (error: unknown) {
      if ((error as NodeJS.ErrnoException)?.code !== 'ENOENT') {
        throw error
      }
    }
  }

  return files
    .sort((a, b) => b.mtimeMs - a.mtimeMs)
    .slice(0, RECENT_UPLOAD_LIMIT)
}

async function addRecentProcessedUploads(archive: Archiver) {
  const uploads = await getRecentProcessedUploads()
  for (const file of uploads) {
    archive.file(file.absolutePath, {
      name: path.join('public', 'uploads', 'processed', file.name),
    })
  }
}

export const config = {
  api: {
    responseLimit: false,
  },
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ErrorResponse | void>
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const session = requireAdminAuth(req, res)
  if (!session) {
    return
  }

  const timestamp = new Date()
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\..*/, '')
  const filename = `admin-backup-${timestamp}.zip`

  const archive = archiver('zip', { zlib: { level: 9 } })

  res.setHeader('Content-Type', 'application/zip')
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
  res.setHeader('Cache-Control', 'no-store')

  archive.on('error', (error) => {
    console.error('Failed to stream admin backup', error)
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to generate backup' })
    } else {
      res.end()
    }
  })

  res.on('close', () => {
    if (!res.writableEnded) {
      archive.destroy()
    }
  })

  archive.pipe(res)

  try {
    await addDevDatabase(archive)
    await addDataJsonFiles(archive)
    await addRecentProcessedUploads(archive)
    await archive.finalize()
  } catch (error) {
    console.error('Error while building admin backup archive', error)
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to generate backup' })
    } else {
      res.end()
    }
  }
}
