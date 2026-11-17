/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the backend API. Defaults to `/api`. */
  readonly VITE_API_URL?: string
  /** `enabled` serves the API from the MSW mock backend. Defaults to `enabled` in dev only. */
  readonly VITE_API_MOCKING?: 'enabled' | 'disabled'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
