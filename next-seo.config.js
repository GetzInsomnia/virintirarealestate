// next-seo.config.js
// Default SEO configuration shared across all pages.
// Individual pages should extend these options via the `NextSeo` component.
const config = {
  defaultTitle: 'Virintira | Accounting & Business',
  description: 'Multilingual accounting partner.',
  openGraph: {
    type: 'website',
    locale: 'th_TH',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com/',
    site_name: 'Virintira',
  },
  twitter: {
    handle: '@virintira',
    site: '@virintira',
    cardType: 'summary_large_image',
  },
};

export default config;
