import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import netlify from "@netlify/vite-plugin";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import os from "node:os";

export default defineConfig(({ command }) => ({
  cacheDir: path.join(os.tmpdir(), `vite-buyphone-gtm-${command}-cache`),
  server: {
    watch: {
      ignored: ["**/node_modules/**"],
    },
  },
  plugins: [
    tsconfigPaths(),
    tailwindcss(),
    tanstackStart(),
    netlify({
      build: { enabled: true },
      // Vite must transform local modules and CSS before they reach the browser.
      middleware: false,
      edgeFunctions: { enabled: false },
    }),
    react(),
  ],
}));
