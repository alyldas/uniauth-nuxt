import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// noinspection JSUnusedGlobalSymbols -- Vitest consumes the default export as test config.
export default defineConfig({
  resolve: {
    alias: {
      "#app": fileURLToPath(
        new URL("./test/fixtures/nuxt-app.ts", import.meta.url),
      ),
      "#build/uniauth-options": fileURLToPath(
        new URL("./test/fixtures/uniauth-options.ts", import.meta.url),
      ),
    },
  },
  test: {
    environment: "node",
  },
});
