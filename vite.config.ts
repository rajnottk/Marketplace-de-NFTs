import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      assets: fileURLToPath(new URL("./src/assets", import.meta.url)),
      app: fileURLToPath(new URL("./src/app", import.meta.url)),
      mocks: fileURLToPath(new URL("./src/mocks", import.meta.url)),
      modules: fileURLToPath(new URL("./src/modules", import.meta.url)),
      shared: fileURLToPath(new URL("./src/shared", import.meta.url)),
      src: fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});