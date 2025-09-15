const fs = require('fs')
const path = require('path')

const siteUrl = require('../lib/siteUrl')
const locales = ['th', 'en', 'zh']

function writeSitemap(file, urls) {
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map((u) => `  <url><loc>${u}</loc></url>`),
    '</urlset>',
  ].join('\n')
  fs.writeFileSync(path.join(__dirname, '..', 'public', file), xml)
}

const propPath = path.join(__dirname, '..', 'public', 'data', 'properties.json')
const properties = JSON.parse(fs.readFileSync(propPath, 'utf-8'))
const propertyUrls = []
for (const p of properties) {
  for (const locale of locales) {
    propertyUrls.push(`${siteUrl}/${locale}/properties/${p.id}`)
  }
}
writeSitemap('sitemap-properties.xml', propertyUrls)

const artPath = path.join(__dirname, '..', 'public', 'data', 'articles.json')
const articles = JSON.parse(fs.readFileSync(artPath, 'utf-8'))
const guideUrls = []
for (const a of articles) {
  for (const locale of Object.keys(a.locales)) {
    guideUrls.push(`${siteUrl}/${locale}/guides/${a.slug}`)
  }
}
writeSitemap('sitemap-guides.xml', guideUrls)
