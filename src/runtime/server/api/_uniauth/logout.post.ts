import { defineEventHandler } from "h3";
import { createUniAuthBackendClient } from "../../utils";

// noinspection JSUnusedGlobalSymbols -- Nuxt consumes the default export as a server handler.
export default defineEventHandler(async (event) => {
  await createUniAuthBackendClient(event).logout();
  return null;
});
