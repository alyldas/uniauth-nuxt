import type { H3Event } from "h3";
import { createError, getHeader } from "h3";

export const UNIAUTH_PROXY_REQUEST_HEADER = "x-uniauth-proxy-request";
export const UNIAUTH_PROXY_REQUEST_HEADER_VALUE = "1";

export function assertUniAuthProxyRequest(event: H3Event): void {
  if (
    getHeader(event, UNIAUTH_PROXY_REQUEST_HEADER) !==
    UNIAUTH_PROXY_REQUEST_HEADER_VALUE
  ) {
    throw createError({
      statusCode: 403,
      statusMessage: "Authentication request is not allowed.",
    });
  }
}

export function readForwardedHeaders(
  event: H3Event,
  allowedHeaders: readonly string[],
  sessionCookieNames: readonly string[] = [],
): Record<string, string> {
  const headers: Record<string, string> = {};

  for (const name of allowedHeaders) {
    const value = getHeader(event, name);

    if (typeof value === "string" && value) {
      headers[name] =
        name.toLowerCase() === "cookie" && sessionCookieNames.length > 0
          ? filterCookieHeader(value, sessionCookieNames)
          : value;
    }
  }

  return headers;
}

export function filterCookieHeader(
  header: string,
  allowedCookieNames: readonly string[],
): string {
  const allowed = new Set(allowedCookieNames);

  return header
    .split(";")
    .map((part) => part.trim())
    .filter((part) => {
      const separatorIndex = part.indexOf("=");
      const name = separatorIndex === -1 ? part : part.slice(0, separatorIndex);
      return allowed.has(name);
    })
    .join("; ");
}
