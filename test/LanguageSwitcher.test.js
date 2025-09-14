require('ts-node').register({ transpileOnly: true, compilerOptions: { jsx: 'react-jsx', module: 'commonjs' } });
const test = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const { JSDOM } = require('jsdom');

// Setup a basic DOM environment for Testing Library
const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost/'
});
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.navigator = dom.window.navigator;

const { render, screen } = require('@testing-library/react');

test('LanguageSwitcher sets aria-label and aria-current correctly', () => {
  const Module = require('module');
  const originalRequire = Module.prototype.require;
  Module.prototype.require = function (request) {
    if (request === 'next/link') {
      return ({ children, ...props }) => React.createElement('a', props, children);
    }
    if (request === 'next/router') {
      return {
        useRouter: () => ({
          locale: 'en',
          defaultLocale: 'en',
          pathname: '/',
          query: {},
          locales: ['en', 'th']
        })
      };
    }
    return originalRequire.apply(this, arguments);
  };

  const LanguageSwitcher = require('../components/LanguageSwitcher').default;
  render(React.createElement(LanguageSwitcher));

  Module.prototype.require = originalRequire;

  const nav = screen.getByLabelText('Language selector');
  assert.ok(nav, 'nav with aria-label "Language selector" should exist');

  const active = screen.getByRole('link', { name: 'Switch to English' });
  assert.strictEqual(active.getAttribute('aria-current'), 'page');
  assert.strictEqual(active.className, 'font-bold');

  const other = screen.getByRole('link', { name: 'Switch to ไทย' });
  assert.strictEqual(other.getAttribute('aria-current'), null);
  assert.strictEqual(other.className, 'font-normal');
});
