import { describe, expect, it } from "vitest";
import { filterCookieHeader } from "../src/runtime/server/utils";
import {
  joinApiPath,
  resolveUniAuthOptions,
} from "../src/runtime/utils/options";

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
