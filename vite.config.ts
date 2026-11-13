import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import netlify from "@netlify/vite-plugin-tanstack-start";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import os from "node:os";

export default defineConfig({
  cacheDir: path.join(os.tmpdir(), "vite-buyphone-gtm-cache"),
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
      dev: {
        edgeFunctions: {
          enabled: false,
        },
      },
    }),
    react(),
  ],
});
