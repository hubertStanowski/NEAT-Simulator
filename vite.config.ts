import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@/neat": path.resolve(
        path.dirname(fileURLToPath(import.meta.url)),
        "./src/neat",
      ),
      "@/snake": path.resolve(
        path.dirname(fileURLToPath(import.meta.url)),
        "./src/snake",
      ),
    },
  },
});
