import '@testing-library/jest-dom/vitest'

type StorageLike = Pick<Storage, 'clear' | 'getItem' | 'removeItem' | 'setItem'>

const createStorage = (): StorageLike => {
  const storage = new Map<string, string>()

  return {
    clear: () => {
      storage.clear()
    },
    getItem: (key) => storage.get(key) ?? null,
    removeItem: (key) => {
      storage.delete(key)
    },
    setItem: (key, value) => {
      storage.set(key, value)
    },
  }
}

const ensureStorage = (key: 'localStorage' | 'sessionStorage') => {
  const current = globalThis[key]

  if (
    current &&
    typeof current.clear === 'function' &&
    typeof current.getItem === 'function' &&
    typeof current.removeItem === 'function' &&
    typeof current.setItem === 'function'
  ) {
    return
  }

  Object.defineProperty(globalThis, key, {
    value: createStorage(),
    configurable: true,
  })
}

ensureStorage('localStorage')
ensureStorage('sessionStorage')
