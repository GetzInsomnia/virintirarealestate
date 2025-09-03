// next-seo.config.js
// Default SEO configuration shared across all pages.
// Individual pages should extend these options via the `NextSeo` component.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.virintira.com/';

const config = {
  baseUrl: siteUrl,
  defaultTitle: 'Virintira | Accounting & Business',
  description: 'Multilingual accounting partner.',
  openGraph: {
    type: 'website',
    locale: 'th_TH',
    // List alternates excluding the default locale
    localeAlternate: ['en_US', 'zh_CN'],
    url: siteUrl,
    site_name: 'Virintira',
    images: [
      {
        url: `${siteUrl}og-image.png`,
        width: 1845,
        height: 871,
        alt: 'Virintira Open Graph Image',
      },
      {
        url: `${siteUrl}favicon.ico`,
        width: 256,
        height: 256,
        alt: 'Virintira Favicon',
      },
    ],
  },
  twitter: {
    handle: '@virintira',
    site: '@virintira',
    cardType: 'summary_large_image',
  },
  additionalMetaTags: [
    {
      name: 'geo.position',
      content: '13.7563; 100.5018',
    },
    {
      name: 'ICBM',
      content: '13.7563, 100.5018',
    },
    {
      name: 'geo.region',
      content: 'TH-Bangkok',
    },
    {
      name: 'geo.placename',
      content: 'Bangkok',
    },
    {
      name: 'ai-experiment',
      content: 'enabled',
    },
  ],
};

export default config;
