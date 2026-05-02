import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
  base: process.env.VITE_BASE_PATH ?? "/recipe-library/",
  build: {
    outDir: path.resolve(import.meta.dirname, "../docs"),
    emptyOutDir: true,
  },
  server: {
    port: 5174,
    host: "0.0.0.0",
  },
});
