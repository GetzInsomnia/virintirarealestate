import Script from 'next/script'

export interface JsonLdProps {
  scriptId: string
  [key: string]: unknown
}

export default function JsonLd({ scriptId, ...jsonLd }: JsonLdProps) {
  return (
    <>
      {/* eslint-disable-next-line react/no-danger */}
      <Script
        id={scriptId}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
    </>
  )
}

