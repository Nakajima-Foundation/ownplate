import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

export default defineConfig({
  plugins: [vue()],
  assetsInclude: ["**/*.md", "**/*.png"],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: ["fast-deep-equal"],
  },
  server: {
    port: 3000,
  },
});
