import Script from 'next/script'

interface Provider {
  '@type': string
  name: string
  url?: string
}

export interface ServiceJsonLdProps {
  name: string
  description: string
  provider: Provider
  type?: string
  url?: string
}

export default function ServiceJsonLd({
  type = 'Service',
  name,
  description,
  provider,
  url,
}: ServiceJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': type,
    name,
    description,
    provider,
    ...(url ? { url } : {}),
  }

  return (
    <>
      {/* eslint-disable-next-line react/no-danger */}
      <Script
        id="service-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
    </>
  )
}

