const fs = require('fs');
const path = require('path');
const MiniSearch = require('minisearch');

function buildArticleIndexes() {
  const dataPath = path.join(process.cwd(), 'public', 'data', 'articles.json');
  const articles = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  const indexDir = path.join(process.cwd(), 'public', 'data', 'index');
  const locales = new Set();
  for (const article of articles) {
    Object.keys(article.locales).forEach((l) => locales.add(l));
  }
  for (const locale of locales) {
    const mini = new MiniSearch({
      idField: 'slug',
      fields: ['title', 'category', 'provinces'],
      storeFields: ['slug', 'title', 'category', 'provinces'],
    });
    const docs = articles.map((a) => ({
      slug: a.slug,
      title: a.locales[locale]?.title || '',
      category: a.category,
      provinces: a.provinces,
    }));
    mini.addAll(docs);
    fs.writeFileSync(
      path.join(indexDir, `articles-${locale}.json`),
      JSON.stringify(mini.toJSON())
    );
  }
}

if (require.main === module) {
  buildArticleIndexes();
  console.log('Article indexes built');
}

module.exports = { buildArticleIndexes };
