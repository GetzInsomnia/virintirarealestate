interface Props {
  src?: string
  alt: string
}

function getUrl(src?: string) {
  if (!src) return '/images/placeholder.jpg'
  return src.startsWith('http') ? src : `/uploads/processed/${src}`
}

export default function PropertyImage({ src, alt }: Props) {
  const url = getUrl(src)
  return <img src={url} alt={alt} width={600} height={400} />
}
