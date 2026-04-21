/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NEW_DS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
