interface Props {
  src?: string;
  alt: string;
}

function getUrl(src?: string) {
  try {
    if (!src) return '/images/placeholder.jpg';
    return src.startsWith('http') ? src : `/uploads/processed/${src}`;
  } catch {
    return '/images/placeholder.jpg';
  }
}

export default function PropertyImage({ src, alt }: Props) {
  const url = getUrl(src);
  return (
    <img
      src={url}
      alt={alt}
      width={600}
      height={400}
      onError={(e) => {
        try {
          (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
        } catch {}
      }}
    />
  );
}
