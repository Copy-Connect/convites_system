/// <reference types="vite/client" />

// (opcional, mas ajuda a ter autocompletion)
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
}
interface ImportMeta {
  readonly env: ImportMetaEnv
}
