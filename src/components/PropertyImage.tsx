import Image from 'next/image'

export interface ProcessedImage {
  webp: string
  avif: string
}

export type ImgLike = string | { src: string } | ProcessedImage

export const FALLBACK_SRC = '/images/placeholder.jpg'

export const asSrc = (img?: ImgLike): string | undefined => {
  if (!img) return undefined
  if (typeof img === 'string') return img
  return 'webp' in img ? img.webp : img.src
}

interface Props {
  src?: ImgLike
  alt: string
}

export default function PropertyImage({ src, alt }: Props) {
  const finalSrc = asSrc(src) ?? FALLBACK_SRC
  return (
    <Image
      src={finalSrc}
      alt={alt}
      width={600}
      height={400}
      onError={(e) => {
        try {
          e.currentTarget.src = FALLBACK_SRC
        } catch {}
      }}
    />
  )
}

