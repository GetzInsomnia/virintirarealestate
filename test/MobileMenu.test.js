require('ts-node').register({ transpileOnly: true, compilerOptions: { jsx: 'react-jsx', module: 'commonjs' } })

const test = require('node:test')
const assert = require('node:assert/strict')
const React = require('react')
const { JSDOM } = require('jsdom')

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost/'
})

globalThis.window = dom.window
;['document', 'navigator', 'Node', 'HTMLElement', 'Element'].forEach((key) => {
  globalThis[key] = dom.window[key]
})

if (!globalThis.window.matchMedia) {
  globalThis.window.matchMedia = () => ({
    matches: false,
    media: '',
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false
  })
}

globalThis.matchMedia = globalThis.window.matchMedia

if (!globalThis.window.requestAnimationFrame) {
  globalThis.window.requestAnimationFrame = (callback) =>
    setTimeout(() => callback(Date.now()), 16)
  globalThis.requestAnimationFrame = globalThis.window.requestAnimationFrame
}

if (!globalThis.window.cancelAnimationFrame) {
  globalThis.window.cancelAnimationFrame = (id) => clearTimeout(id)
  globalThis.cancelAnimationFrame = globalThis.window.cancelAnimationFrame
}

const { render, screen, fireEvent, within } = require('@testing-library/react')
const tick = () => new Promise((resolve) => setTimeout(resolve, 0))

test('MobileMenu traps focus while open', async () => {
  const Module = require('module')
  const originalRequire = Module.prototype.require
  let cleanup
  Module.prototype.require = function (request) {
    if (request === 'next/link') {
      return ({ children, href, ...props }) =>
        React.createElement('a', { ...props, href }, children)
    }
    if (request === 'framer-motion') {
      return {
        AnimatePresence: ({ children }) => React.createElement(React.Fragment, null, children),
        motion: new Proxy(
          {},
          {
            get: (_, tag) =>
              React.forwardRef(({ children: motionChildren, ...rest }, ref) =>
                React.createElement(String(tag), { ref, ...rest }, motionChildren)
              )
          }
        ),
        useReducedMotion: () => false
      }
    }
    return originalRequire.apply(this, arguments)
  }

  try {
    const MobileMenu = require('../components/MobileMenu').default

    const navItems = [
      {
        title: 'Services',
        href: '/services'
      },
      {
        title: 'Guides',
        sections: [
          {
            title: 'Articles',
            items: [
              { title: 'First article', href: '/articles/1' },
              { title: 'Second article', href: '/articles/2' }
            ]
          }
        ]
      }
    ]

    const { unmount } = render(
      React.createElement(MobileMenu, {
        open: true,
        onClose: () => {},
        items: navItems,
        children: React.createElement(
          'button',
          { type: 'button' },
          'Extra action'
        )
      })
    )
    cleanup = unmount

    await tick()
    await tick()

    const closeButton = screen.getByRole('button', { name: 'Close' })
    const panel = screen.getByRole('dialog')
    const focusables = Array.from(
      panel.querySelectorAll('a, button, select, textarea, input, [tabindex]:not([tabindex="-1"])')
    )
    const firstFocusable = focusables[0]
    const lastFocusable = focusables[focusables.length - 1]

    assert.strictEqual(firstFocusable, closeButton)

    closeButton.focus()
    assert.strictEqual(document.activeElement, closeButton)

    lastFocusable.focus()
    fireEvent.keyDown(lastFocusable, { key: 'Tab' })
    await tick()
    assert.strictEqual(document.activeElement, closeButton)

    closeButton.focus()
    fireEvent.keyDown(closeButton, { key: 'Tab', shiftKey: true })
    await tick()
    assert.strictEqual(document.activeElement, lastFocusable)
  } finally {
    if (typeof cleanup === 'function') {
      cleanup()
    }
    Module.prototype.require = originalRequire
  }
})
