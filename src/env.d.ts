/// <reference types="vite/client" />

declare module "*.wasm?url" {
  const url: string;
  export default url;
}
