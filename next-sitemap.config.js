/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.virintira.com',
  generateRobotsTxt: true,
  i18n: {
    defaultLocale: 'th',
    locales: ['th', 'en'],
  },
};
