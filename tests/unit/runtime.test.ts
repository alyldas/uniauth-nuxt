import { beforeEach, describe, expect, it, vi } from "vitest";
import authMiddleware from "../../src/runtime/middleware/auth";
import { requireAuth } from "../../src/runtime/composables/requireAuth";
import { useAuth } from "../../src/runtime/composables/useAuth";
import { useSession } from "../../src/runtime/composables/useSession";
import {
  UNIAUTH_PROXY_REQUEST_HEADER,
  UNIAUTH_PROXY_REQUEST_HEADER_VALUE,
} from "../../src/runtime/server/utils";
import {
  getLastNavigation,
  resetNuxtAppFixture,
  setRuntimeConfig,
} from "./fixtures/nuxt-app";

const sessionContext = {
  user: {
    id: "user-1",
  },
  session: {
    id: "session-1",
    userId: "user-1",
  },
};

describe("runtime auth helpers", () => {
  beforeEach(() => {
    resetNuxtAppFixture();
    setRuntimeConfig({
      public: {
        uniauth: {
          proxyPrefix: "/auth-proxy",
          redirects: {
            signIn: "/login",
          },
        },
      },
    });
    vi.stubGlobal("$fetch", vi.fn());
  });

  it("tracks ready and guest state in useSession", async () => {
    const fetchMock = vi.mocked($fetch);
    fetchMock.mockResolvedValueOnce(sessionContext);

    const authSession = useSession();

    expect(authSession.ready.value).toBe(true);
    expect(authSession.guest.value).toBe(true);
    expect(authSession.authenticated.value).toBe(false);

    await expect(authSession.refresh()).resolves.toEqual(sessionContext);

    expect(fetchMock).toHaveBeenCalledWith("/auth-proxy/session");
    expect(authSession.ready.value).toBe(true);
    expect(authSession.guest.value).toBe(false);
    expect(authSession.authenticated.value).toBe(true);
    expect(authSession.user.value).toEqual(sessionContext.user);
  });

  it("returns the session context from requireAuth", async () => {
    vi.mocked($fetch).mockResolvedValueOnce(sessionContext);

    await expect(requireAuth()).resolves.toEqual(sessionContext);
  });

  it("throws a 401 error from requireAuth without a session", async () => {
    vi.mocked($fetch).mockResolvedValueOnce(null);

    await expect(requireAuth()).rejects.toMatchObject({
      statusCode: 401,
      statusMessage: "Authentication required.",
    });
  });

  it("redirects guests from the auth middleware", async () => {
    vi.mocked($fetch).mockResolvedValueOnce(null);

    await expect(authMiddleware()).resolves.toBe("/login");

    expect(getLastNavigation()).toBe("/login");
  });

  it("allows authenticated users through the auth middleware", async () => {
    vi.mocked($fetch).mockResolvedValueOnce(sessionContext);

    await expect(authMiddleware()).resolves.toBeUndefined();

    expect(getLastNavigation()).toBeNull();
  });

  it("adds the internal request header to state-changing auth proxy requests", async () => {
    const fetchMock = vi.mocked($fetch);
    fetchMock
      .mockResolvedValueOnce({
        user: sessionContext.user,
        session: sessionContext.session,
      })
      .mockResolvedValueOnce(sessionContext)
      .mockResolvedValueOnce(sessionContext)
      .mockResolvedValueOnce(sessionContext)
      .mockResolvedValueOnce(null);

    const auth = useAuth();

    await auth.signInWithPassword({
      email: "user@example.test",
      password: "password",
    });
    await auth.refreshSession();
    await auth.logout();

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "/auth-proxy/password-sign-in",
      {
        method: "POST",
        body: {
          email: "user@example.test",
          password: "password",
        },
        headers: {
          [UNIAUTH_PROXY_REQUEST_HEADER]: UNIAUTH_PROXY_REQUEST_HEADER_VALUE,
        },
      },
    );
    expect(fetchMock).toHaveBeenNthCalledWith(3, "/auth-proxy/refresh", {
      method: "POST",
      headers: {
        [UNIAUTH_PROXY_REQUEST_HEADER]: UNIAUTH_PROXY_REQUEST_HEADER_VALUE,
      },
    });
    expect(fetchMock).toHaveBeenNthCalledWith(5, "/auth-proxy/logout", {
      method: "POST",
      headers: {
        [UNIAUTH_PROXY_REQUEST_HEADER]: UNIAUTH_PROXY_REQUEST_HEADER_VALUE,
      },
    });
  });
});
