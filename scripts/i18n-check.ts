const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const languages = ['en', 'th', 'zh'];
const localesDir = path.join(__dirname, '..', 'locales');

type Json = Record<string, any>;

function extractKeys(obj: Json, prefix = ''): string[] {
  const keys: string[] = [];
  if (Array.isArray(obj)) {
    if (obj.length === 0 && prefix) keys.push(prefix);
    for (const item of obj) {
      if (typeof item === 'object' && item !== null) {
        keys.push(...extractKeys(item, prefix));
      } else if (prefix) {
        keys.push(prefix);
      }
    }
    return keys;
  }
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null) {
      keys.push(...extractKeys(value, newKey));
    } else {
      keys.push(newKey);
    }
  }
  return keys;
}

const keySets: Record<string, Set<string>> = {};

for (const lang of languages) {
  const filePath = path.join(localesDir, lang, 'common.json');
  const json = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as Json;
  keySets[lang] = new Set(extractKeys(json));
}

const allKeys = new Set<string>();
for (const set of Object.values(keySets)) {
  for (const k of set) allKeys.add(k);
}

let hasMismatch = false;

for (const lang of languages) {
  const keys = keySets[lang];
  const missing = [...allKeys].filter(k => !keys.has(k));
  const extra = [...keys].filter(k => languages.some(other => !keySets[other].has(k)));
  if (missing.length) {
    console.warn(`Locale '${lang}' is missing keys: ${missing.join(', ')}`);
    hasMismatch = true;
  }
  if (extra.length) {
    const unique = extra.filter((k, i) => extra.indexOf(k) === i);
    console.warn(`Locale '${lang}' has extra keys: ${unique.join(', ')}`);
    hasMismatch = true;
  }
}

if (!hasMismatch) {
  console.log('All locale keys match.');
}
