import type { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import { applyWatermark } from '../../../src/lib/image/watermark'

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

  const form = formidable({ multiples: false })

  form.parse(req, async (err, fields, files) => {
    if (err) {
      res.status(500).json({ error: 'Failed to parse form' })
      return
    }

    const file = files.file as formidable.File | formidable.File[] | undefined
    if (!file || Array.isArray(file)) {
      res.status(400).json({ error: 'No file uploaded' })
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
