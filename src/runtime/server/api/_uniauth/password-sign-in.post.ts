import { defineEventHandler, readBody } from "h3";
import type { UniAuthPasswordSignInBody } from "../../../types";
import {
  assertUniAuthProxyRequest,
  createUniAuthBackendClient,
} from "../../utils";

// noinspection JSUnusedGlobalSymbols -- Nuxt consumes the default export as a server handler.
export default defineEventHandler(async (event) => {
  assertUniAuthProxyRequest(event);
  const body = await readBody<UniAuthPasswordSignInBody>(event);
  return await createUniAuthBackendClient(event).signInWithPassword(body);
});
