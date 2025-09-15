import type { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import { applyWatermark } from '../../../src/lib/image/watermark'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']

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

  const form = formidable({ multiples: false, maxFileSize: MAX_FILE_SIZE })

  form.parse(req, async (err, fields, files) => {
    if (err) {
      if ((err as any).httpCode === 413) {
        res.status(400).json({ error: 'File is too large' })
      } else {
        res.status(500).json({ error: 'Failed to parse form' })
      }
      return
    }

    const file = files.file as formidable.File | formidable.File[] | undefined
    if (!file || Array.isArray(file)) {
      res.status(400).json({ error: 'No file uploaded' })
      return
    }

    if (!ALLOWED_TYPES.includes(file.mimetype || '')) {
      res.status(400).json({ error: 'Invalid file type' })
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      res.status(400).json({ error: 'File is too large' })
      return
    }

    let buffer = await fs.promises.readFile(file.filepath)
    if (process.env.WATERMARK_ENABLED === 'true') {
      buffer = await applyWatermark(buffer)
    }

    const processedDir = path.join(process.cwd(), 'public', 'uploads', 'processed')
    await fs.promises.mkdir(processedDir, { recursive: true })

    const baseName = path.parse(file.originalFilename || 'upload').name
    const webpPath = path.join(processedDir, `${baseName}.webp`)
    const avifPath = path.join(processedDir, `${baseName}.avif`)

    await sharp(buffer).webp().toFile(webpPath)
    await sharp(buffer).avif().toFile(avifPath)

    res.status(200).json({
      webp: `/uploads/processed/${baseName}.webp`,
      avif: `/uploads/processed/${baseName}.avif`,
    })
  })
}
