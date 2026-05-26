import { defineEventHandler } from "h3";
import { getUniAuthSession } from "../../utils";

// noinspection JSUnusedGlobalSymbols -- Nuxt consumes the default export as a server handler.
export default defineEventHandler(async (event) => {
  return await getUniAuthSession(event);
});
