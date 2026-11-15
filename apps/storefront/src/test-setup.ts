import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => {
  cleanup()
})

// Mock window.matchMedia for theme tests
if (typeof window !== 'undefined') {
  if (!window.localStorage) {
    const store = new Map<string, string>()
    const storageMock = {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, String(value)),
      removeItem: (key: string) => store.delete(key),
      clear: () => store.clear(),
      key: (index: number) => Array.from(store.keys())[index] ?? null,
      get length() {
        return store.size
      },
    }
    Object.defineProperty(window, 'localStorage', {
      value: storageMock,
      writable: true,
    })
  }

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  })

  if (typeof window.IntersectionObserver === 'undefined') {
    class MockIntersectionObserver {
      readonly root: Element | null = null
      readonly rootMargin: string = ''
      readonly thresholds: ReadonlyArray<number> = []
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return []
      }
    }
    Object.defineProperty(window, 'IntersectionObserver', {
      writable: true,
      configurable: true,
      value: MockIntersectionObserver,
    })
  }
}
