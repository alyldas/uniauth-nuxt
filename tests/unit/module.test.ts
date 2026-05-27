import { describe, expect, it, vi } from "vitest";
import uniauthModule from "../../src/module";

const kitCalls = vi.hoisted(() => ({
  importsDirs: [] as string[],
  serverImports: [] as Array<{
    from: string;
    name: string;
  }>,
  routeMiddleware: [] as Array<{
    name: string;
    path: string;
  }>,
  serverHandlers: [] as Array<{
    route: string;
    method: string;
    handler: string;
  }>,
  templates: [] as Array<{
    filename: string;
    getContents: () => string;
  }>,
}));

vi.mock("@nuxt/kit", () => ({
  addImportsDir: vi.fn((path: string) => {
    kitCalls.importsDirs.push(path);
  }),
  addRouteMiddleware: vi.fn((middleware: { name: string; path: string }) => {
    kitCalls.routeMiddleware.push(middleware);
  }),
  addServerHandler: vi.fn(
    (handler: { route: string; method: string; handler: string }) => {
      kitCalls.serverHandlers.push(handler);
    },
  ),
  addServerImports: vi.fn((imports: Array<{ from: string; name: string }>) => {
    kitCalls.serverImports.push(...imports);
  }),
  createResolver: vi.fn(() => ({
    resolve: (path: string) => `/module/${path.replace(/^\.\//, "")}`,
  })),
  defineNuxtModule: vi.fn(
    (definition: { setup?: (options: unknown, nuxt: unknown) => unknown }) =>
      async (options: unknown, nuxt: unknown) =>
        await definition.setup?.(options, nuxt),
  ),
}));

describe("uniauth Nuxt module", () => {
  it("registers runtime helpers, auth middleware, proxy handlers, and public config", async () => {
    const nuxt = createNuxt();

    await uniauthModule(
      {
        proxyPrefix: "/auth-proxy",
        redirects: {
          signIn: "/login",
        },
      },
      nuxt as never,
    );

    expect(nuxt.options.runtimeConfig.public.uniauth).toEqual({
      proxyPrefix: "/auth-proxy",
      redirects: {
        signIn: "/login",
      },
    });
    expect(kitCalls.importsDirs).toEqual(["/module/runtime/composables"]);
    expect(kitCalls.serverImports).toEqual([
      {
        from: "/module/runtime/server/utils",
        name: "createUniAuthBackendClient",
      },
      {
        from: "/module/runtime/server/utils",
        name: "getUniAuthSession",
      },
      {
        from: "/module/runtime/server/utils",
        name: "requireUniAuthSession",
      },
      {
        from: "/module/runtime/server/utils",
        name: "filterCookieHeader",
      },
      {
        from: "/module/runtime/server/utils",
        name: "readForwardedHeaders",
      },
    ]);
    expect(kitCalls.routeMiddleware).toEqual([
      {
        name: "auth",
        path: "/module/runtime/middleware/auth",
      },
    ]);
    expect(kitCalls.serverHandlers).toEqual([
      {
        route: "/auth-proxy/session",
        method: "get",
        handler: "/module/runtime/server/api/_uniauth/session.get",
      },
      {
        route: "/auth-proxy/password-sign-in",
        method: "post",
        handler: "/module/runtime/server/api/_uniauth/password-sign-in.post",
      },
      {
        route: "/auth-proxy/logout",
        method: "post",
        handler: "/module/runtime/server/api/_uniauth/logout.post",
      },
      {
        route: "/auth-proxy/refresh",
        method: "post",
        handler: "/module/runtime/server/api/_uniauth/refresh.post",
      },
    ]);

    expect(kitCalls.templates).toHaveLength(0);
  });
});

interface TestNuxt {
  options: {
    runtimeConfig: {
      public: {
        uniauth?: unknown;
      };
    };
  };
}

function createNuxt(): TestNuxt {
  return {
    options: {
      runtimeConfig: {
        public: {},
      },
    },
  };
}
