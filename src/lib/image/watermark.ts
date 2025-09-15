import sharp from 'sharp'

interface WatermarkOptions {
  opacity?: number
  margin?: number
  text?: string
}

/**
 * Apply a text watermark to an image buffer.
 * The text is placed at the top-right corner with the given opacity and margin.
 */
export async function applyWatermark(
  input: Buffer | string,
  opts: WatermarkOptions = {}
): Promise<Buffer> {
  const { opacity = 0.5, margin = 10, text = 'Zomzom Property' } = opts

  const base = sharp(input)
  const metadata = await base.metadata()

  const svg = `<svg xmlns="http://www.w3.org/2000/svg">
    <style>
      .text { fill: rgba(255,255,255,${opacity}); font-size: 24px; font-family: sans-serif; }
    </style>
    <text x="0" y="24" class="text">${text}</text>
  </svg>`
  const overlay = Buffer.from(svg)
  const overlayMeta = await sharp(overlay).metadata()
  const width = metadata.width || 0
  const overlayWidth = overlayMeta.width || 0
  const left = Math.max(width - overlayWidth - margin, margin)
  const top = margin

  return base.composite([{ input: overlay, left, top }]).toBuffer()
}
