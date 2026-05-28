import { describe, expect, it } from "vitest";
import {
  UNIAUTH_PROXY_REQUEST_HEADER,
  UNIAUTH_PROXY_REQUEST_HEADER_VALUE,
  assertUniAuthProxyRequest,
  filterCookieHeader,
} from "../../src/runtime/server/utils";
import {
  joinApiPath,
  resolveUniAuthOptions,
} from "../../src/runtime/utils/options";

describe("resolveUniAuthOptions", () => {
  it("defaults to the UniAuth Express router contract mounted at /auth", () => {
    const options = resolveUniAuthOptions();

    expect(options.endpoints).toEqual({
      session: "/auth/account/session",
      passwordSignIn: "/auth/password/sign-in",
      logout: "/auth/account/sessions/revoke-current",
      refresh: "/auth/account/session/refresh",
    });
    expect(options.redirects).toEqual({
      signIn: "/sign-in",
    });
    expect(options.forwardHeaders).toEqual([
      "cookie",
      "authorization",
      "user-agent",
    ]);
  });

  it("normalizes prefixes and endpoints", () => {
    const options = resolveUniAuthOptions({
      apiBase: "https://api.example.test/",
      apiPrefix: "/v1/",
      proxyPrefix: "auth",
      endpoints: {
        session: "me/",
        logout: "/logout",
      },
      redirects: {
        signIn: "login/",
      },
    });

    expect(options.apiBase).toBe("https://api.example.test");
    expect(options.apiPrefix).toBe("/v1");
    expect(options.proxyPrefix).toBe("/auth");
    expect(options.endpoints.session).toBe("/me");
    expect(options.endpoints.logout).toBe("/logout");
    expect(options.redirects.signIn).toBe("/login");
  });

  it("joins api prefix and endpoint without duplicate slashes", () => {
    expect(joinApiPath("/v1/", "/auth/password/sign-in")).toBe(
      "/v1/auth/password/sign-in",
    );
    expect(joinApiPath("", "/auth/account/session")).toBe(
      "/auth/account/session",
    );
  });

  it("normalizes slash-heavy paths without regex backtracking", () => {
    const slashes = "/".repeat(10_000);

    expect(joinApiPath(`${slashes}v1${slashes}`, `${slashes}session`)).toBe(
      "/v1/session",
    );
  });
});

describe("assertUniAuthProxyRequest", () => {
  it("allows proxy requests with the internal request header", () => {
    expect(() =>
      assertUniAuthProxyRequest({
        node: {
          req: {
            headers: {
              [UNIAUTH_PROXY_REQUEST_HEADER]:
                UNIAUTH_PROXY_REQUEST_HEADER_VALUE,
            },
          },
        },
      } as never),
    ).not.toThrow();
  });

  it("rejects proxy requests without the internal request header", () => {
    expect(() =>
      assertUniAuthProxyRequest({
        node: {
          req: {
            headers: {},
          },
        },
      } as never),
    ).toThrowError(
      expect.objectContaining({
        statusCode: 403,
      }),
    );
  });
});

describe("filterCookieHeader", () => {
  it("forwards only configured session cookies", () => {
    expect(
      filterCookieHeader("session=abc; theme=dark; refresh=def", [
        "session",
        "refresh",
      ]),
    ).toBe("session=abc; refresh=def");
  });
});
