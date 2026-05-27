import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// noinspection JSUnusedGlobalSymbols -- Vitest consumes the default export as test config.
export default defineConfig({
  resolve: {
    alias: {
      "#app": fileURLToPath(
        new URL("./tests/unit/fixtures/nuxt-app.ts", import.meta.url),
      ),
      "#build/uniauth-options": fileURLToPath(
        new URL("./tests/unit/fixtures/uniauth-options.ts", import.meta.url),
      ),
    },
  },
  test: {
    environment: "node",
  },
});
