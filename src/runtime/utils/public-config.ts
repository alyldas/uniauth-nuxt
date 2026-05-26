import { useRuntimeConfig } from "#app";

export function useUniAuthProxyPrefix(): string {
  const proxyPrefix = useUniAuthPublicConfig().proxyPrefix;

  return typeof proxyPrefix === "string" && proxyPrefix
    ? proxyPrefix
    : "/api/_uniauth";
}

export function useUniAuthSignInRedirect(): string {
  const signIn = useUniAuthPublicConfig().redirects?.signIn;

  return typeof signIn === "string" && signIn ? signIn : "/sign-in";
}

function useUniAuthPublicConfig(): {
  proxyPrefix?: string;
  redirects?: {
    signIn?: string;
  };
} {
  return useRuntimeConfig().public.uniauth ?? {};
}
