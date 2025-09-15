export interface ProcessedImage {
  webp: string
  avif: string
}

interface Props {
  src?: string
  alt: string
}

export default function PropertyImage({ src, alt }: Props) {
  const finalSrc = src || '/images/placeholder.jpg'
  return (
    <img
      src={finalSrc}
      alt={alt}
      width={600}
      height={400}
      onError={(e) => {
        try {
          ;(e.target as HTMLImageElement).src = '/images/placeholder.jpg'
        } catch {}
      }}
    />
  )
}
