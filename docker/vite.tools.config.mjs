// Builds the scripts the production container runs into self-contained files
// in .output/tools, with their dependencies bundled in, so the image needs no
// node_modules: the migrations and bucket setup that run before the server
// starts (see docker/start.mjs). `npm run build` runs this after the app
// build (which clears .output first).
import { defineConfig } from "vite";

export default defineConfig({
  publicDir: false,
  logLevel: "warn",
  resolve: { tsconfigPaths: true },
  ssr: { noExternal: true },
  build: {
    ssr: true,
    outDir: ".output/tools",
    emptyOutDir: true,
    target: "node22",
    minify: false,
    rolldownOptions: {
      input: {
        migrate: "src/server/database/migrate.server.ts",
        "setup-bucket": "docker/setup-bucket.mjs",
      },
      // pg's optional native bindings; only loaded if asked for.
      external: ["pg-native"],
      output: {
        format: "esm",
        entryFileNames: "[name].mjs",
        // Code the scripts share. .mjs, since there's no package.json here to
        // say .js files are ES modules.
        chunkFileNames: "chunks/[name]-[hash].mjs",
      },
    },
  },
});
