import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    tanstackStart(), // 👈 අර අවුල් සහගත server කෑල්ල සම්පූර්ණයෙන්ම අයින් කළා
    react(),
  ],
});