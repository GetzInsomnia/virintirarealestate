const path = require('path')

require('ts-node').register({
  transpileOnly: true,
  project: path.resolve(__dirname, '../tsconfig.json'),
  compilerOptions: { jsx: 'react-jsx', module: 'commonjs' },
})
require('tsconfig-paths/register')

const test = require('node:test')
const assert = require('node:assert/strict')
const React = require('react')
const { JSDOM } = require('jsdom')

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost/',
})

globalThis.window = dom.window
globalThis.document = dom.window.document
globalThis.navigator = dom.window.navigator
globalThis.HTMLElement = dom.window.HTMLElement
globalThis.Element = dom.window.Element
global.document = dom.window.document
global.window = dom.window
global.navigator = dom.window.navigator

globalThis.requestAnimationFrame =
  dom.window.requestAnimationFrame?.bind(dom.window) || ((cb) => setTimeout(cb, 0))
globalThis.cancelAnimationFrame =
  dom.window.cancelAnimationFrame?.bind(dom.window) || ((id) => clearTimeout(id))

if (!window.matchMedia) {
  window.matchMedia = () => ({
    matches: false,
    addEventListener: () => {},
    removeEventListener: () => {},
  })
}

if (!window.scrollTo) {
  window.scrollTo = () => {}
}

if (!dom.window.HTMLElement.prototype.attachEvent) {
  dom.window.HTMLElement.prototype.attachEvent = () => {}
  dom.window.HTMLElement.prototype.detachEvent = () => {}
}

window.scrollTo = () => {}

const { render, screen, fireEvent } = require('@testing-library/react')

test('SearchPanel submits the highlighted suggestion with locale normalization', async (t) => {
  const originalFetch = global.fetch
  const calls = []
  global.fetch = (input) => {
    calls.push(input.toString())
    return Promise.resolve({
      ok: true,
      json: async () => ({ suggestions: ['Bangkok Condo', 'Bangkok House'] }),
    })
  }

  t.after(() => {
    global.fetch = originalFetch
  })

  const SearchPanel = require('../src/components/search/SearchPanel').default

  let submitted = null
  render(
    React.createElement(SearchPanel, {
      open: true,
      locale: 'TH',
      onClose: () => {},
      onSubmit: (value, locale) => {
        submitted = { value, locale }
      },
    })
  )

  const input = screen.getByRole('combobox', { name: 'Search' })
  fireEvent.change(input, { target: { value: 'Bang' } })
  await new Promise((resolve) => setTimeout(resolve, 350))
  const options = await screen.findAllByRole('option')
  assert.equal(options.length, 2)

  fireEvent.keyDown(input, { key: 'ArrowDown' })
  fireEvent.keyDown(input, { key: 'Enter' })

  assert.deepEqual(submitted, { value: 'Bangkok House', locale: 'th' })
  assert.ok(calls.some((url) => url.includes('locale=th')))
  await new Promise((resolve) => setTimeout(resolve, 0))
})
