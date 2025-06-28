import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@/neat": path.resolve(__dirname, "./src/neat"),
      "@/snake": path.resolve(__dirname, "./src/snake"),
    },
  },
});
