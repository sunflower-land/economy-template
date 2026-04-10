// vite.config.ts
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "file:///sessions/bold-nifty-volta/mnt/sunflower-land-template/node_modules/vite/dist/node/index.js";
import react from "file:///sessions/bold-nifty-volta/mnt/sunflower-land-template/node_modules/@vitejs/plugin-react/dist/index.js";
import tsconfigPaths from "file:///sessions/bold-nifty-volta/mnt/sunflower-land-template/node_modules/vite-tsconfig-paths/dist/index.mjs";
var __vite_injected_original_import_meta_url = "file:///sessions/bold-nifty-volta/mnt/sunflower-land-template/vite.config.ts";
var __dirname = path.dirname(fileURLToPath(__vite_injected_original_import_meta_url));
var imagesAssets = path.resolve(__dirname, "../images/assets");
var vite_config_default = defineConfig({
  plugins: [react(), tsconfigPaths()],
  base: "./",
  resolve: {
    alias: {
      "@sl-assets": imagesAssets
    }
  },
  server: {
    fs: {
      allow: [path.resolve(__dirname), path.resolve(__dirname, "../images")]
    }
  },
  build: {
    assetsDir: "assets",
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ["phaser"]
        }
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvc2Vzc2lvbnMvYm9sZC1uaWZ0eS12b2x0YS9tbnQvc3VuZmxvd2VyLWxhbmQtdGVtcGxhdGVcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9zZXNzaW9ucy9ib2xkLW5pZnR5LXZvbHRhL21udC9zdW5mbG93ZXItbGFuZC10ZW1wbGF0ZS92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vc2Vzc2lvbnMvYm9sZC1uaWZ0eS12b2x0YS9tbnQvc3VuZmxvd2VyLWxhbmQtdGVtcGxhdGUvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgcGF0aCBmcm9tIFwibm9kZTpwYXRoXCI7XG5pbXBvcnQgeyBmaWxlVVJMVG9QYXRoIH0gZnJvbSBcIm5vZGU6dXJsXCI7XG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xuaW1wb3J0IHRzY29uZmlnUGF0aHMgZnJvbSBcInZpdGUtdHNjb25maWctcGF0aHNcIjtcblxuY29uc3QgX19kaXJuYW1lID0gcGF0aC5kaXJuYW1lKGZpbGVVUkxUb1BhdGgoaW1wb3J0Lm1ldGEudXJsKSk7XG5jb25zdCBpbWFnZXNBc3NldHMgPSBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4uL2ltYWdlcy9hc3NldHNcIik7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtyZWFjdCgpLCB0c2NvbmZpZ1BhdGhzKCldLFxuICBiYXNlOiBcIi4vXCIsXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgXCJAc2wtYXNzZXRzXCI6IGltYWdlc0Fzc2V0cyxcbiAgICB9LFxuICB9LFxuICBzZXJ2ZXI6IHtcbiAgICBmczoge1xuICAgICAgYWxsb3c6IFtwYXRoLnJlc29sdmUoX19kaXJuYW1lKSwgcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuLi9pbWFnZXNcIildLFxuICAgIH0sXG4gIH0sXG4gIGJ1aWxkOiB7XG4gICAgYXNzZXRzRGlyOiBcImFzc2V0c1wiLFxuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIG91dHB1dDoge1xuICAgICAgICBtYW51YWxDaHVua3M6IHtcbiAgICAgICAgICBwaGFzZXI6IFtcInBoYXNlclwiXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFvVixPQUFPLFVBQVU7QUFDclcsU0FBUyxxQkFBcUI7QUFDOUIsU0FBUyxvQkFBb0I7QUFDN0IsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sbUJBQW1CO0FBSjBMLElBQU0sMkNBQTJDO0FBTXJRLElBQU0sWUFBWSxLQUFLLFFBQVEsY0FBYyx3Q0FBZSxDQUFDO0FBQzdELElBQU0sZUFBZSxLQUFLLFFBQVEsV0FBVyxrQkFBa0I7QUFFL0QsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUyxDQUFDLE1BQU0sR0FBRyxjQUFjLENBQUM7QUFBQSxFQUNsQyxNQUFNO0FBQUEsRUFDTixTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxjQUFjO0FBQUEsSUFDaEI7QUFBQSxFQUNGO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDTixJQUFJO0FBQUEsTUFDRixPQUFPLENBQUMsS0FBSyxRQUFRLFNBQVMsR0FBRyxLQUFLLFFBQVEsV0FBVyxXQUFXLENBQUM7QUFBQSxJQUN2RTtBQUFBLEVBQ0Y7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLFdBQVc7QUFBQSxJQUNYLGVBQWU7QUFBQSxNQUNiLFFBQVE7QUFBQSxRQUNOLGNBQWM7QUFBQSxVQUNaLFFBQVEsQ0FBQyxRQUFRO0FBQUEsUUFDbkI7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
