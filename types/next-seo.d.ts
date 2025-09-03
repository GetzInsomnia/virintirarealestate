import type { ComponentType } from 'react';

declare module 'next-seo' {
  export interface JsonLdProps {
    scriptKey: string;
    scriptId: string;
    [key: string]: unknown;
  }

  export const JsonLd: ComponentType<JsonLdProps>;
}

