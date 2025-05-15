import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import checker from "vite-plugin-checker";
import Markdown from "unplugin-vue-markdown/vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    vue({
      include: [/\.vue$/, /\.md$/],
    }),
    checker({
      typescript: true,
      // overlay: false,
      eslint: {
        useFlatConfig: true,
        lintCommand: 'eslint "./src/**/*.{js,ts,vue}"',
      },
    }),
    Markdown(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: ["fast-deep-equal"],
  },
  server: {
    watch: {
      usePolling: true,
    },
    port: 3000,
  },
});
