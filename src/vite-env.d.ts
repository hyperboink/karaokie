/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CATALOG_ID_KEY: string;
  readonly VITE_SECURITY_ENABLED: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
