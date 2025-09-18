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

test('MegaMenu supports roving focus with arrow keys and closes on Escape', async () => {
  const Module = require('module')
  const originalRequire = Module.prototype.require
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

  let cleanup
  try {
    const MegaMenu = require('../components/MegaMenu').default

    const item = {
      title: 'Services',
      description: 'All services',
      sections: [
        {
          title: 'Group 1',
          items: [
            { title: 'First item', href: '/first' },
            { title: 'Second item', href: '/second' }
          ]
        },
        {
          title: 'Group 2',
          items: [{ title: 'Third item', href: '/third' }]
        }
      ]
    }

    const { unmount } = render(React.createElement(MegaMenu, { item }))
    cleanup = unmount

    const trigger = screen.getByRole('button', { name: 'Services' })
    fireEvent.click(trigger)

    const menu = await screen.findByRole('menu')
    await tick()

    const firstItem = within(menu).getByRole('menuitem', { name: 'First item' })
    firstItem.focus()
    assert.strictEqual(document.activeElement, firstItem)

    fireEvent.keyDown(menu, { key: 'ArrowDown' })
    const secondItem = within(menu).getByRole('menuitem', { name: 'Second item' })
    assert.strictEqual(document.activeElement, secondItem)

    fireEvent.keyDown(menu, { key: 'ArrowRight' })
    const thirdItem = within(menu).getByRole('menuitem', { name: 'Third item' })
    assert.strictEqual(document.activeElement, thirdItem)

    fireEvent.keyDown(menu, { key: 'Home' })
    assert.strictEqual(document.activeElement, firstItem)

    fireEvent.keyDown(menu, { key: 'End' })
    assert.strictEqual(document.activeElement, thirdItem)

    fireEvent.keyDown(menu, { key: 'ArrowUp' })
    assert.strictEqual(document.activeElement, secondItem)

    fireEvent.keyDown(menu, { key: 'Escape' })
    await tick()
    assert.strictEqual(document.activeElement, trigger)
  } finally {
    if (typeof cleanup === 'function') {
      cleanup()
    }
    Module.prototype.require = originalRequire
  }
})
