require('ts-node').register({ transpileOnly: true, compilerOptions: { jsx: 'react-jsx', module: 'commonjs' } });
const test = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

test('ServiceJsonLd escapes unsafe characters', () => {
  const Module = require('module');
  const originalRequire = Module.prototype.require;
  Module.prototype.require = function (request) {
    if (request === 'next/script') {
      return (props) => React.createElement('script', props);
    }
    return originalRequire.apply(this, arguments);
  };
  const ServiceJsonLd = require('../components/ServiceJsonLd').default;
  Module.prototype.require = originalRequire;
  const html = renderToStaticMarkup(
    React.createElement(ServiceJsonLd, {
      name: '</script><script>alert(1)</script>',
      description: 'desc',
      provider: { '@type': 'Organization', name: 'Org' },
    })
  );
  const match = html.match(/<script[^>]*>([\s\S]*?)<\/script>/);
  assert.ok(match);
  assert.ok(!match[1].includes('<'), 'script content contains unsafe characters');
});

test('ServiceJsonLd renders areaServed and escapes unsafe characters', () => {
  const Module = require('module');
  const originalRequire = Module.prototype.require;
  Module.prototype.require = function (request) {
    if (request === 'next/script') {
      return (props) => React.createElement('script', props);
    }
    return originalRequire.apply(this, arguments);
  };
  const ServiceJsonLd = require('../components/ServiceJsonLd').default;
  Module.prototype.require = originalRequire;
  const html = renderToStaticMarkup(
    React.createElement(ServiceJsonLd, {
      name: 'safe',
      description: 'desc',
      provider: { '@type': 'Organization', name: 'Org' },
      areaServed: {
        '@type': 'AdministrativeArea',
        name: '</script><script>alert(1)</script>',
      },
    })
  );
  const match = html.match(/<script[^>]*>([\s\S]*?)<\/script>/);
  assert.ok(match);
  assert.ok(match[1].includes('areaServed'), 'areaServed not rendered');
  assert.ok(!match[1].includes('<'), 'script content contains unsafe characters');
});

test('index page JSON-LD escapes unsafe characters', () => {
  const Module = require('module');
  const originalRequire = Module.prototype.require;
  Module.prototype.require = function (request) {
    if (request === 'next-i18next') {
      return {
        useTranslation: () => ({
          t: (key) => {
            switch (key) {
              case 'seo_keywords':
                return ['kw'];
              case 'seo_title':
              case 'seo_description':
                return '</script><script>alert("xss")</script>';
              case 'welcome':
                return 'welcome';
              default:
                return key;
            }
          },
        }),
      };
    }
    if (request === 'next/router') {
      return { useRouter: () => ({ locale: 'en', defaultLocale: 'th' }) };
    }
    if (request === 'next-seo') {
      return {
        NextSeo: () => null,
        LocalBusinessJsonLd: () => null,
        WebPageJsonLd: () => null,
        BreadcrumbJsonLd: () => null,
        SiteLinksSearchBoxJsonLd: () => null,
      };
    }
    if (request === '../components/LanguageSwitcher' || request === './components/LanguageSwitcher' || request === './../components/LanguageSwitcher') {
      return () => null;
    }
    if (request === 'next/script') {
      return (props) => React.createElement('script', props);
    }
    return originalRequire.apply(this, arguments);
  };

  const Home = require('../pages/index').default;
  const html = renderToStaticMarkup(React.createElement(Home));
  Module.prototype.require = originalRequire;
  const match = html.match(/<script id="speakable"[^>]*>([\s\S]*?)<\/script>/);
  assert.ok(match);
  assert.ok(!match[1].includes('<'), 'script content contains unsafe characters');
});

test('index page JSON-LD includes SpeakableSpecification', () => {
  const Module = require('module');
  const originalRequire = Module.prototype.require;
  Module.prototype.require = function (request) {
    if (request === 'next-i18next') {
      return {
        useTranslation: () => ({
          t: (key) => {
            switch (key) {
              case 'seo_keywords':
                return ['kw'];
              case 'seo_title':
              case 'seo_description':
                return '</script><script>alert("xss")</script>';
              case 'welcome':
                return 'welcome';
              default:
                return key;
            }
          },
        }),
      };
    }
    if (request === 'next/router') {
      return { useRouter: () => ({ locale: 'en', defaultLocale: 'th' }) };
    }
    if (request === 'next-seo') {
      return {
        NextSeo: () => null,
        LocalBusinessJsonLd: () => null,
        WebPageJsonLd: () => null,
        BreadcrumbJsonLd: () => null,
        SiteLinksSearchBoxJsonLd: () => null,
      };
    }
    if (
      request === '../components/LanguageSwitcher' ||
      request === './components/LanguageSwitcher' ||
      request === './../components/LanguageSwitcher'
    ) {
      return () => null;
    }
    if (request === 'next/script') {
      return (props) => React.createElement('script', props);
    }
    return originalRequire.apply(this, arguments);
  };

  const Home = require('../pages/index').default;
  const html = renderToStaticMarkup(React.createElement(Home));
  Module.prototype.require = originalRequire;
  const match = html.match(/<script id="speakable"[^>]*>([\s\S]*?)<\/script>/);
  assert.ok(match);
  const data = JSON.parse(match[1]);
  assert.equal(data.speakable['@type'], 'SpeakableSpecification');
  assert.ok(!match[1].includes('<'), 'script content contains unsafe characters');
});

