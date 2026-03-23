/// <reference types="vite/client" />

declare module "*.mp3" {
  const src: string;
  export default src;
}

declare module "*.webp" {
  const src: string;
  export default src;
}

interface ImportMetaEnv {
  readonly VITE_ANIMATION_URL?: string;
  readonly VITE_IMAGE_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
