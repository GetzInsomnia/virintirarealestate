const fs = require('fs'); const path = require('path');
const root = process.cwd();
const OUT = path.join(root, 'reports'); fs.mkdirSync(OUT, { recursive: true });
const IGNORE_DIRS = new Set(['node_modules','.next','.git','coverage','dist','out','public/uploads','public/*.zip']);
const MAX = 200*1024;
const acc = { files:[], pages:[], apis:[], env:new Set(), notes:[] };

function shouldIgnore(p){ return [...IGNORE_DIRS].some(x => p.includes(x)); }
function walk(dir){
  for(const name of fs.readdirSync(dir)){
    const p = path.join(dir,name); const st=fs.statSync(p);
    if(st.isDirectory()){ if(!shouldIgnore(p)) walk(p); continue; }
    if(shouldIgnore(p)) continue;
    const rel = p.replace(root+path.sep,'');
    const ext = path.extname(rel).toLowerCase();
    if(['.png','.jpg','.jpeg','.webp','.avif','.gif','.pdf','.ttf','.woff','.woff2','.zip'].includes(ext)) continue;
    let head=''; try{ const buf=fs.readFileSync(p); if(buf.length<=MAX) head=buf.toString('utf8').split(/\r?\n/).slice(0,20).join('\n'); }catch{}
    const hasImg = /<img[^>]/.test(head), hasNextImage = /from 'next\/image'/.test(head);
    const hasHead = /from 'next\/head'|<Head>/.test(head), hasJsonLd = /application\/ld\+json/.test(head);
    const envKeys=[...head.matchAll(/process\.env\.([A-Z0-9_]+)/g)].map(m=>m[1]); envKeys.forEach(k=>acc.env.add(k));
    acc.files.push({rel, size: st.size, hasImg, hasNextImage, hasHead, hasJsonLd});
    if(/^pages[\\/](.+)\.tsx?$/.test(rel)){
      const r = RegExp.$1; if(r.startsWith('api/')) acc.apis.push('/'+r); else acc.pages.push('/'+r);
    }
  }
}
walk(root);

function mdList(){
  const f = acc.files.sort((a,b)=>a.rel.localeCompare(b.rel))
    .map(f=>`- ${f.rel} (${f.size}b) `+
      [f.hasNextImage?'next/image':'', f.hasImg?'img':'', f.hasHead?'Head':'', f.hasJsonLd?'JSON-LD':''].filter(Boolean).join(', ')
    ).join('\n');
  return f;
}
fs.writeFileSync(path.join(OUT,'INVENTORY.md'),
`# Inventory\n\n## Files\n${mdList()}\n\n## Pages\n${acc.pages.sort().map(p=>'- '+p).join('\n')}\n\n## API Routes\n${acc.apis.sort().map(p=>'- '+p).join('\n')}\n`);
fs.writeFileSync(path.join(OUT,'ENV.md'), `# ENV keys referenced\n\n${[...acc.env].sort().map(k=>'- '+k).join('\n')}\n`);
console.log('Reports written to /reports: INVENTORY.md, ENV.md');
