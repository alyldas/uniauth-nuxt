import { defineEventHandler } from "h3";
import {
  assertUniAuthProxyRequest,
  createUniAuthBackendClient,
} from "../../utils";

// noinspection JSUnusedGlobalSymbols -- Nuxt consumes the default export as a server handler.
export default defineEventHandler(async (event) => {
  assertUniAuthProxyRequest(event);
  return await createUniAuthBackendClient(event).refreshSession();
});
