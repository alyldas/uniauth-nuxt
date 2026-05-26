import type { H3Event } from "h3";
import { appendResponseHeader, createError } from "h3";
import type { FetchOptions } from "ofetch";
import { FetchError, $fetch } from "ofetch";
import type {
  UniAuthJsonSession,
  UniAuthJsonUser,
  UniAuthPasswordSignInBody,
  UniAuthPublicAuthResult,
  UniAuthSessionContext,
  ResolvedUniAuthModuleOptions,
} from "../../types";
import { joinApiPath } from "../../utils/options";
import { readForwardedHeaders } from "./headers";

export interface UniAuthBackendClient {
  request<T>(endpoint: string, options?: FetchOptions<"json">): Promise<T>;
  getSession<
    User extends UniAuthJsonUser = UniAuthJsonUser,
    Session extends UniAuthJsonSession = UniAuthJsonSession,
  >(): Promise<UniAuthSessionContext<User, Session> | null>;
  signInWithPassword<
    User extends UniAuthJsonUser = UniAuthJsonUser,
    Session extends UniAuthJsonSession = UniAuthJsonSession,
  >(
    body: UniAuthPasswordSignInBody,
  ): Promise<UniAuthPublicAuthResult<User, Session>>;
  logout(): Promise<void>;
  refreshSession<
    User extends UniAuthJsonUser = UniAuthJsonUser,
    Session extends UniAuthJsonSession = UniAuthJsonSession,
  >(): Promise<UniAuthSessionContext<User, Session> | null>;
}

export function createUniAuthBackendClient(
  event: H3Event,
): UniAuthBackendClient {
  async function request<T>(
    endpoint: string,
    options: FetchOptions<"json"> = {},
  ): Promise<T> {
    const clientOptions = await readUniAuthOptions(event);
    const url = joinApiPath(clientOptions.apiPrefix, endpoint);
    const headers = {
      ...readForwardedHeaders(
        event,
        clientOptions.forwardHeaders,
        clientOptions.sessionCookieNames,
      ),
      ...(options.headers as Record<string, string> | undefined),
    };

    const response = await $fetch.raw<T>(url, {
      baseURL: clientOptions.apiBase || undefined,
      credentials: "include",
      ...options,
      headers,
      ignoreResponseError: true,
    });

    for (const [name, value] of response.headers.entries()) {
      if (!isForwardableResponseHeader(name)) {
        continue;
      }

      appendResponseHeader(event, name, value);
    }

    if (response.status >= 400) {
      throw createError({
        statusCode: response.status,
        statusMessage: readResponseErrorMessage(response._data),
      });
    }

    return response._data as T;
  }

  return {
    request,
    async getSession() {
      const clientOptions = await readUniAuthOptions(event);
      return await nullableAuthRequest(() =>
        request(clientOptions.endpoints.session),
      );
    },
    async signInWithPassword(body) {
      const clientOptions = await readUniAuthOptions(event);
      return await request(clientOptions.endpoints.passwordSignIn, {
        method: "POST",
        body,
      });
    },
    async logout() {
      const clientOptions = await readUniAuthOptions(event);
      await request(clientOptions.endpoints.logout, {
        method: "POST",
        body: {},
      });
    },
    async refreshSession() {
      const clientOptions = await readUniAuthOptions(event);
      return await nullableAuthRequest(() =>
        request(clientOptions.endpoints.refresh, {
          method: "POST",
        }),
      );
    },
  };
}

async function readUniAuthOptions(
  event: H3Event,
): Promise<ResolvedUniAuthModuleOptions> {
  const { useRuntimeConfig } = await import("nitropack/runtime");
  const runtimeConfig = useRuntimeConfig(event) as {
    uniauth?: ResolvedUniAuthModuleOptions;
  };

  if (!runtimeConfig.uniauth) {
    throw createError({
      statusCode: 500,
      statusMessage: "UniAuth runtime config is not available.",
    });
  }

  return runtimeConfig.uniauth;
}

export async function getUniAuthSession<
  User extends UniAuthJsonUser = UniAuthJsonUser,
  Session extends UniAuthJsonSession = UniAuthJsonSession,
>(event: H3Event): Promise<UniAuthSessionContext<User, Session> | null> {
  return await createUniAuthBackendClient(event).getSession<User, Session>();
}

export async function requireUniAuthSession<
  User extends UniAuthJsonUser = UniAuthJsonUser,
  Session extends UniAuthJsonSession = UniAuthJsonSession,
>(event: H3Event): Promise<UniAuthSessionContext<User, Session>> {
  const context = await getUniAuthSession<User, Session>(event);

  if (!context) {
    throw createError({
      statusCode: 401,
      statusMessage: "Authentication required.",
    });
  }

  return context;
}

async function nullableAuthRequest<T>(
  request: () => Promise<T>,
): Promise<T | null> {
  try {
    return await request();
  } catch (error) {
    if (isUnauthorizedFetchError(error)) {
      return null;
    }

    throw error;
  }
}

function isUnauthorizedFetchError(error: unknown): boolean {
  if (!(error instanceof FetchError)) {
    return isErrorWithStatus(error, 401) || isErrorWithStatus(error, 403);
  }

  return (
    error.status === 401 ||
    error.status === 403 ||
    error.response?.status === 401 ||
    error.response?.status === 403
  );
}

function isErrorWithStatus(error: unknown, status: number): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "statusCode" in error &&
    (error as { readonly statusCode?: unknown }).statusCode === status
  );
}

function readResponseErrorMessage(data: unknown): string {
  if (
    typeof data === "object" &&
    data !== null &&
    "error" in data &&
    typeof (data as { readonly error?: unknown }).error === "string"
  ) {
    return (data as { readonly error: string }).error;
  }

  return "Authentication request failed.";
}

function isForwardableResponseHeader(name: string): boolean {
  return !NON_FORWARDABLE_RESPONSE_HEADERS.has(name.toLowerCase());
}

const NON_FORWARDABLE_RESPONSE_HEADERS = new Set([
  "connection",
  "content-encoding",
  "content-length",
  "etag",
  "keep-alive",
  "transfer-encoding",
]);
