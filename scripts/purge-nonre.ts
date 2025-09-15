import fs from 'fs';
import path from 'path';

const KEYWORDS = ['invoice', 'ledger', 'withholding'];
const ROOT_DIRS = [path.join(__dirname, '..', 'src', 'pages'), path.join(__dirname, '..', 'src', 'views')];

function scanDir(dir: string) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(full);
    } else if (entry.isFile()) {
      const content = fs.readFileSync(full, 'utf8').toLowerCase();
      for (const kw of KEYWORDS) {
        if (content.includes(kw)) {
          console.log(`${path.relative(path.join(__dirname, '..'), full)}: ${kw}`);
        }
      }
    }
  }
}

for (const dir of ROOT_DIRS) {
  scanDir(dir);
}
