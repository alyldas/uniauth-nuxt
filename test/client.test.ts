import { beforeEach, describe, expect, it, vi } from "vitest";
import { $fetch } from "ofetch";
import { createUniAuthBackendClient } from "../src/runtime/server/utils";

const appendResponseHeaderMock = vi.hoisted(() => vi.fn());
const rawFetchMock = vi.hoisted(() => vi.fn());

vi.mock("h3", async (importOriginal) => ({
  ...(await importOriginal<typeof import("h3")>()),
  appendResponseHeader: appendResponseHeaderMock,
}));

vi.mock("ofetch", () => ({
  $fetch: Object.assign(vi.fn(), {
    raw: rawFetchMock,
  }),
  FetchError: class FetchError extends Error {
    status?: number;
    response?: {
      status?: number;
    };
  },
}));

const fetchMock = vi.mocked($fetch);

vi.mock("nitropack/runtime", () => ({
  useRuntimeConfig: vi.fn(() => ({
    uniauth: {
      apiBase: "",
      apiPrefix: "",
      proxyPrefix: "/api/_uniauth",
      endpoints: {
        session: "/auth/account/session",
        passwordSignIn: "/auth/password/sign-in",
        logout: "/auth/account/sessions/revoke-current",
        refresh: "/auth/account/session/refresh",
      },
      redirects: {
        signIn: "/sign-in",
      },
      forwardHeaders: ["cookie", "authorization", "user-agent"],
      sessionCookieNames: ["session"],
    },
  })),
}));

describe("createUniAuthBackendClient", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    rawFetchMock.mockReset();
    appendResponseHeaderMock.mockReset();
  });

  it("calls the configured session endpoint", async () => {
    const context = {
      user: { id: "user-1" },
      session: { id: "session-1", userId: "user-1" },
    };
    rawFetchMock.mockResolvedValueOnce(createFetchResponse(context));

    await expect(createClient().getSession()).resolves.toEqual(context);

    expect(rawFetchMock).toHaveBeenCalledWith("/auth/account/session", {
      baseURL: undefined,
      credentials: "include",
      ignoreResponseError: true,
      headers: {
        cookie: "session=abc",
        authorization: "Bearer token",
        "user-agent": "vitest",
      },
    });
    expect(appendResponseHeaderMock).toHaveBeenCalledWith(
      expect.anything(),
      "set-cookie",
      "session=abc",
    );
    expect(appendResponseHeaderMock).not.toHaveBeenCalledWith(
      expect.anything(),
      "content-length",
      expect.anything(),
    );
    expect(appendResponseHeaderMock).not.toHaveBeenCalledWith(
      expect.anything(),
      "etag",
      expect.anything(),
    );
  });

  it("calls the configured password sign-in endpoint", async () => {
    const result = {
      user: { id: "user-1" },
      session: { id: "session-1", userId: "user-1" },
    };
    const body = {
      email: "user@example.test",
      password: "password",
    };
    rawFetchMock.mockResolvedValueOnce(createFetchResponse(result));

    await expect(createClient().signInWithPassword(body)).resolves.toEqual(
      result,
    );

    expect(rawFetchMock).toHaveBeenCalledWith("/auth/password/sign-in", {
      baseURL: undefined,
      credentials: "include",
      ignoreResponseError: true,
      method: "POST",
      body,
      headers: {
        cookie: "session=abc",
        authorization: "Bearer token",
        "user-agent": "vitest",
      },
    });
  });

  it("calls the configured logout endpoint", async () => {
    rawFetchMock.mockResolvedValueOnce(createFetchResponse(null));

    await expect(createClient().logout()).resolves.toBeUndefined();

    expect(rawFetchMock).toHaveBeenCalledWith(
      "/auth/account/sessions/revoke-current",
      {
        baseURL: undefined,
        credentials: "include",
        ignoreResponseError: true,
        method: "POST",
        body: {},
        headers: {
          cookie: "session=abc",
          authorization: "Bearer token",
          "user-agent": "vitest",
        },
      },
    );
  });

  it("calls the configured refresh endpoint", async () => {
    const context = {
      user: { id: "user-1" },
      session: { id: "session-1", userId: "user-1" },
    };
    rawFetchMock.mockResolvedValueOnce(createFetchResponse(context));

    await expect(createClient().refreshSession()).resolves.toEqual(context);

    expect(rawFetchMock).toHaveBeenCalledWith("/auth/account/session/refresh", {
      baseURL: undefined,
      credentials: "include",
      ignoreResponseError: true,
      method: "POST",
      headers: {
        cookie: "session=abc",
        authorization: "Bearer token",
        "user-agent": "vitest",
      },
    });
  });
});

function createFetchResponse(data: unknown) {
  return {
    _data: data,
    status: 200,
    headers: new Headers({
      "content-length": "345",
      "content-type": "application/json",
      etag: 'W/"159-test"',
      "set-cookie": "session=abc",
    }),
  } as never;
}

function createClient() {
  return createUniAuthBackendClient({
    node: {
      req: {
        headers: {
          cookie: "session=abc; theme=dark",
          authorization: "Bearer token",
          "user-agent": "vitest",
        },
      },
    },
  } as never);
}
