/** @type {import('next-sitemap').IConfig} */
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.virintira.com'

module.exports = {
  siteUrl,
  generateRobotsTxt: true,
  i18n: {
    defaultLocale: 'th',
    locales: ['th', 'en', 'zh'],
  },
  alternateRefs: [
    { href: `${siteUrl}/th`, hreflang: 'th' },
    { href: `${siteUrl}/en`, hreflang: 'en' },
    { href: `${siteUrl}/zh`, hreflang: 'zh' },
  ],
  /**
   * Remove query params from sitemap URLs
   */
  transform: async (config, url) => {
    const loc = url.split('?')[0]
    return {
      loc,
      changefreq: 'daily',
      priority: 0.7,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      alternateRefs: config.alternateRefs ?? [],
    }
  },
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/adminmanager', '/*?*'],
      },
    ],
    additionalSitemaps: [
      `${siteUrl}/sitemap-properties.xml`,
      `${siteUrl}/sitemap-guides.xml`,
    ],
  },
}
