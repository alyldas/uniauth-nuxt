import { defineNuxtRouteMiddleware, navigateTo } from "#app";
import { useSession } from "../composables/useSession";
import { useUniAuthSignInRedirect } from "../utils/public-config";

// noinspection JSUnusedGlobalSymbols -- Nuxt consumes the default export as route middleware.
export default defineNuxtRouteMiddleware(async () => {
  const authSession = useSession();

  if (!authSession.authenticated.value) {
    await authSession.refresh();
  }

  if (!authSession.authenticated.value) {
    return navigateTo(useUniAuthSignInRedirect());
  }
});
