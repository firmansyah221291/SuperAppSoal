/// <reference types="vite/client" />

interface ImportMetaEnv {
  // No client-side API keys needed for security
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
