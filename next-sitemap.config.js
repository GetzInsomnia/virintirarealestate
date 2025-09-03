/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.virintira.com',
  generateRobotsTxt: true,
  i18n: {
    defaultLocale: 'th',
    locales: ['th', 'en', 'zh'],
  },
  alternateRefs: [
    { href: 'https://www.virintira.com/th', hreflang: 'th' },
    { href: 'https://www.virintira.com/en', hreflang: 'en' },
    { href: 'https://www.virintira.com/zh', hreflang: 'zh' },
  ],
};
