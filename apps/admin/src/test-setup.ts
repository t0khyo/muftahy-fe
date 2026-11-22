import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => {
  cleanup()
})

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

  if (typeof window.PointerEvent === 'undefined') {
    class MockPointerEvent extends MouseEvent {
      pointerId: number
      width: number
      height: number
      pressure: number
      tangentialPressure: number
      tiltX: number
      tiltY: number
      twist: number
      pointerType: string
      isPrimary: boolean

      constructor(type: string, params: PointerEventInit = {}) {
        super(type, params)
        this.pointerId = params.pointerId ?? 0
        this.width = params.width ?? 1
        this.height = params.height ?? 1
        this.pressure = params.pressure ?? 0
        this.tangentialPressure = params.tangentialPressure ?? 0
        this.tiltX = params.tiltX ?? 0
        this.tiltY = params.tiltY ?? 0
        this.twist = params.twist ?? 0
        this.pointerType = params.pointerType ?? 'mouse'
        this.isPrimary = params.isPrimary ?? false
      }
    }
    window.PointerEvent = MockPointerEvent as unknown as typeof PointerEvent
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
}
