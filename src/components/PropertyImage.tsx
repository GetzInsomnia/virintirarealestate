import Image from 'next/image'

export interface ProcessedImage {
  webp: string
  avif: string
}

export type ImgLike = string | { src?: string } | ProcessedImage | undefined

const DEFAULT_WIDTH = 600
const DEFAULT_HEIGHT = 400
const DEFAULT_SIZES = '100vw'

const ensurePositiveInt = (value?: number): number | undefined => {
  if (typeof value !== 'number') return undefined
  if (!Number.isFinite(value)) return undefined
  if (value <= 0) return undefined
  return Math.round(value)
}

const placeholderSrc = (width?: number, height?: number): string => {
  const finalWidth = ensurePositiveInt(width) ?? DEFAULT_WIDTH
  const finalHeight = ensurePositiveInt(height) ?? DEFAULT_HEIGHT
  return `https://placehold.co/${finalWidth}x${finalHeight}?text=Property+Image`
}

export const asSrc = (
  img?: ImgLike,
  dimensions?: { width?: number; height?: number }
): string => {
  const width = dimensions?.width
  const height = dimensions?.height

  if (!img) return placeholderSrc(width, height)

  if (typeof img === 'string') {
    const trimmed = img.trim()
    return trimmed ? trimmed : placeholderSrc(width, height)
  }

  const candidate: string = 'webp' in img ? img.webp : img.src ?? ''
  const trimmed = candidate.trim()
  return trimmed ? trimmed : placeholderSrc(width, height)
}

interface Props {
  src?: ImgLike
  alt?: string
  w?: number
  h?: number
  sizes?: string
  className?: string
}

export default function PropertyImage({
  src,
  alt,
  w,
  h,
  sizes = DEFAULT_SIZES,
  className = 'object-cover',
}: Props) {
  const width = ensurePositiveInt(w) ?? DEFAULT_WIDTH
  const height = ensurePositiveInt(h) ?? DEFAULT_HEIGHT
  const finalSrc = asSrc(src, { width, height })

  return (
    <Image
      src={finalSrc}
      alt={alt ?? ''}
      width={width}
      height={height}
      sizes={sizes}
      className={className}
    />
  )
}

