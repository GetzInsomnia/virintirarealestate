const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Ensure the uploads directory exists and is writable
const uploadDir = path.join(__dirname, 'public', 'uploads');

app.prepare().then(() => {
  fs.mkdirSync(uploadDir, { recursive: true });
  try {
    fs.chmodSync(uploadDir, 0o755);
  } catch (err) {
    console.error(`Failed to set permissions for ${uploadDir}:`, err);
  }

  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
  });
});
