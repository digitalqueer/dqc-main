import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

// Node server build: `vite build` emits .output/server/index.mjs (run with `npm start`).
export default defineConfig({
  resolve: { tsconfigPaths: true },
  server: { port: 3000 },
  plugins: [
    tanstackStart(), // must precede the React plugin
    nitro({ preset: "node-server" }),
    tailwindcss(),
    viteReact(),
  ],
});
