import type {
  ResolvedUniAuthModuleOptions,
  UniAuthModuleOptions,
} from "../types";

export const defaultUniAuthOptions = {
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
  forwardHeaders: ["cookie", "authorization", "user-agent", "x-forwarded-for"],
  sessionCookieNames: ["session"],
} as const satisfies ResolvedUniAuthModuleOptions;

export function resolveUniAuthOptions(
  options: UniAuthModuleOptions = {},
): ResolvedUniAuthModuleOptions {
  return {
    apiBase: stripTrailingSlash(
      options.apiBase ?? defaultUniAuthOptions.apiBase,
    ),
    apiPrefix: normalizePath(
      options.apiPrefix ?? defaultUniAuthOptions.apiPrefix,
    ),
    proxyPrefix: normalizePath(
      options.proxyPrefix ?? defaultUniAuthOptions.proxyPrefix,
    ),
    endpoints: {
      session: normalizePath(
        options.endpoints?.session ?? defaultUniAuthOptions.endpoints.session,
      ),
      passwordSignIn: normalizePath(
        options.endpoints?.passwordSignIn ??
          defaultUniAuthOptions.endpoints.passwordSignIn,
      ),
      logout: normalizePath(
        options.endpoints?.logout ?? defaultUniAuthOptions.endpoints.logout,
      ),
      refresh: normalizePath(
        options.endpoints?.refresh ?? defaultUniAuthOptions.endpoints.refresh,
      ),
    },
    redirects: {
      signIn: normalizePath(
        options.redirects?.signIn ?? defaultUniAuthOptions.redirects.signIn,
      ),
    },
    forwardHeaders: [
      ...(options.forwardHeaders ?? defaultUniAuthOptions.forwardHeaders),
    ],
    sessionCookieNames: [
      ...(options.sessionCookieNames ??
        defaultUniAuthOptions.sessionCookieNames),
    ],
  };
}

export function joinApiPath(prefix: string, endpoint: string): string {
  return `${normalizePath(prefix)}${normalizePath(endpoint)}` || "/";
}

function normalizePath(path: string): string {
  const trimmed = path.trim();

  if (!trimmed || trimmed === "/") {
    return "";
  }

  return `/${trimmed.replace(/^\/+|\/+$/g, "")}`;
}

function stripTrailingSlash(value: string): string {
  return value.replace(/\/+$/g, "");
}
