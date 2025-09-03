import Script from 'next/script'

interface Provider {
  '@type': string
  name: string
  url?: string
}

interface AreaServed {
  '@type': string
  name: string
}

export interface ServiceJsonLdProps {
  name: string
  description: string
  provider: Provider
  areaServed?: AreaServed
  type?: string
  url?: string
  id?: string
}

export default function ServiceJsonLd({
  type = 'Service',
  name,
  description,
  provider,
  areaServed,
  url,
  id = 'service-jsonld',
}: ServiceJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': type,
    name,
    description,
    provider,
    ...(areaServed ? { areaServed } : {}),
    ...(url ? { url } : {}),
  }

  return (
    <>
      {/* eslint-disable-next-line react/no-danger */}
      <Script
        id={id}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
    </>
  )
}

