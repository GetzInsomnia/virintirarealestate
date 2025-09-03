import React from 'react'
import { JsonLd, JsonLdProps } from 'next-seo'

interface Provider {
  '@type': string
  name: string
  url?: string
}

export interface ServiceJsonLdProps extends JsonLdProps {
  name: string
  description: string
  provider: Provider
  type?: string
}

export default function ServiceJsonLd({
  type = 'Service',
  keyOverride,
  ...rest
}: ServiceJsonLdProps) {
  return <JsonLd type={type} keyOverride={keyOverride} {...rest} scriptKey="Service" />
}
