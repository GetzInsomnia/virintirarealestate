module.exports = {
  i18n: {
    defaultLocale: 'th',
    locales: ['th', 'en'],
    localeDetection: true,
  },
  reloadOnPrerender: process.env.NODE_ENV === 'development'
};