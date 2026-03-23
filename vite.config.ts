import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const imagesAssets = path.resolve(__dirname, "../images/assets");

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  base: "./",
  resolve: {
    alias: {
      "@sl-assets": imagesAssets,
    },
  },
  server: {
    fs: {
      allow: [path.resolve(__dirname), path.resolve(__dirname, "../images")],
    },
  },
  build: {
    assetsDir: "assets",
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ["phaser"],
        },
      },
    },
  },
});
