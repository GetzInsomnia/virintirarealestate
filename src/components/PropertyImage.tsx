export interface ProcessedImage {
  webp: string
  avif: string
}

interface Props {
  src?: string | ProcessedImage
  alt: string
}

function getUrls(src?: string | ProcessedImage) {
  try {
    if (!src) {
      return { img: '/images/placeholder.jpg' }
    }
    if (typeof src === 'string') {
      if (src.startsWith('http')) {
        return { img: src }
      }
      const base = src.replace(/\.[^/.]+$/, '')
      return {
        avif: `/uploads/processed/${base}.avif`,
        webp: `/uploads/processed/${base}.webp`,
        img: `/uploads/processed/${base}.webp`,
      }
    }
    return { avif: src.avif, webp: src.webp, img: src.webp }
  } catch {
    return { img: '/images/placeholder.jpg' }
  }
}

export default function PropertyImage({ src, alt }: Props) {
  const urls = getUrls(src)
  return (
    <picture>
      {urls.avif && <source srcSet={urls.avif} type='image/avif' />}
      {urls.webp && <source srcSet={urls.webp} type='image/webp' />}
      <img
        src={urls.img}
        alt={alt}
        width={600}
        height={400}
        onError={(e) => {
          try {
            (e.target as HTMLImageElement).src = '/images/placeholder.jpg'
          } catch {}
        }}
      />
    </picture>
  )
}
