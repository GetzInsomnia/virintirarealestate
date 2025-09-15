const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.zomzomproperty.com').replace(/\/$/, '')

module.exports = siteUrl
