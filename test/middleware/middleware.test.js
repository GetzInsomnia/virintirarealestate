require('ts-node').register({ transpileOnly: true, compilerOptions: { jsx: 'react-jsx', module: 'commonjs' } });
const test = require('node:test');
const assert = require('node:assert/strict');
const { NextRequest } = require('next/server');
const { middleware } = require('../../middleware');

test('redirects requests without locale', () => {
  const req = new NextRequest('https://example.com/about', {
    headers: { 'accept-language': 'en' },
  });
  const res = middleware(req);
  assert.strictEqual(res.headers.get('location'), 'https://example.com/en/about');
});

test('ignores _next paths', () => {
  const req = new NextRequest('https://example.com/_next/static/chunk.js');
  const res = middleware(req);
  assert.strictEqual(res.headers.get('location'), null);
});

test('ignores api paths', () => {
  const req = new NextRequest('https://example.com/api/data');
  const res = middleware(req);
  assert.strictEqual(res.headers.get('location'), null);
});

test('uses Accept-Language to determine locale', () => {
  const req = new NextRequest('https://example.com/properties', {
    headers: { 'accept-language': 'zh;q=0.9,en;q=0.8' },
  });
  const res = middleware(req);
  assert.strictEqual(res.headers.get('location'), 'https://example.com/zh/properties');
});

test('supports region subtags and q values', () => {
  const req = new NextRequest('https://example.com/about', {
    headers: { 'accept-language': 'en-US,en;q=0.8,th;q=0.5' },
  });
  const res = middleware(req);
  assert.strictEqual(res.headers.get('location'), 'https://example.com/en/about');
});

test('falls back to default locale on malformed header', () => {
  const req = new NextRequest('https://example.com/about', {
    headers: { 'accept-language': 'malformed-header' },
  });
  const res = middleware(req);
  assert.strictEqual(res.headers.get('location'), 'https://example.com/th/about');
});
