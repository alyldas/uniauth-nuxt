import {
  addImportsDir,
  addRouteMiddleware,
  addServerHandler,
  addServerImports,
  createResolver,
  defineNuxtModule,
} from "@nuxt/kit";
import type { UniAuthModuleOptions } from "./runtime/types";
import { resolveUniAuthOptions } from "./runtime/utils/options";

// noinspection JSUnusedGlobalSymbols -- Nuxt consumes the default export as the module entry point.
export default defineNuxtModule<UniAuthModuleOptions>({
  meta: {
    name: "@alyldas/uniauth-nuxt",
    configKey: "uniauth",
  },
  defaults: {},
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url);
    const runtimeOptions = isRecord(nuxt.options.runtimeConfig.uniauth)
      ? nuxt.options.runtimeConfig.uniauth
      : {};
    const resolvedOptions = resolveUniAuthOptions({
      ...runtimeOptions,
      ...options,
    });

    nuxt.options.runtimeConfig.uniauth = resolvedOptions;

    nuxt.options.runtimeConfig.public.uniauth = {
      proxyPrefix: resolvedOptions.proxyPrefix,
      redirects: resolvedOptions.redirects,
    };

    addImportsDir(resolver.resolve("./runtime/composables"));
    const serverUtilsPath = resolver.resolve("./runtime/server/utils");
    addServerImports([
      { from: serverUtilsPath, name: "createUniAuthBackendClient" },
      { from: serverUtilsPath, name: "getUniAuthSession" },
      { from: serverUtilsPath, name: "requireUniAuthSession" },
      { from: serverUtilsPath, name: "filterCookieHeader" },
      { from: serverUtilsPath, name: "readForwardedHeaders" },
    ]);

    addRouteMiddleware({
      name: "auth",
      path: resolver.resolve("./runtime/middleware/auth"),
    });

    addServerHandler({
      route: `${resolvedOptions.proxyPrefix}/session`,
      method: "get",
      handler: resolver.resolve("./runtime/server/api/_uniauth/session.get"),
    });
    addServerHandler({
      route: `${resolvedOptions.proxyPrefix}/password-sign-in`,
      method: "post",
      handler: resolver.resolve(
        "./runtime/server/api/_uniauth/password-sign-in.post",
      ),
    });
    addServerHandler({
      route: `${resolvedOptions.proxyPrefix}/logout`,
      method: "post",
      handler: resolver.resolve("./runtime/server/api/_uniauth/logout.post"),
    });
    addServerHandler({
      route: `${resolvedOptions.proxyPrefix}/refresh`,
      method: "post",
      handler: resolver.resolve("./runtime/server/api/_uniauth/refresh.post"),
    });
  },
});

export type {
  ResolvedUniAuthModuleOptions,
  UniAuthClientState,
  UniAuthJsonSession,
  UniAuthJsonUser,
  UniAuthModuleEndpointOptions,
  UniAuthModuleOptions,
  UniAuthModuleRedirectOptions,
  UniAuthPasswordSignInBody,
  UniAuthPublicAuthResult,
  UniAuthSession,
  UniAuthSessionContext,
  UniAuthUser,
} from "./runtime/types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
