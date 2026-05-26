import type {
  UniAuthJsonSession,
  UniAuthJsonUser,
  UniAuthPasswordSignInBody,
  UniAuthPublicAuthResult,
  UniAuthSession,
  UniAuthSessionContext,
  UniAuthUser,
} from "../types";
import { useUniAuthProxyPrefix } from "../utils/public-config";
import { useSession } from "./useSession";

// noinspection JSUnusedGlobalSymbols -- Nuxt exposes composables from this directory as auto-imports.
export function useAuth<
  User extends UniAuthJsonUser = UniAuthUser,
  Session extends UniAuthJsonSession = UniAuthSession,
>() {
  const proxyPrefix = useUniAuthProxyPrefix();
  const authSession = useSession<User, Session>();

  async function signInWithPassword(
    body: UniAuthPasswordSignInBody,
  ): Promise<UniAuthPublicAuthResult<User, Session>> {
    const result = await $fetch<UniAuthPublicAuthResult<User, Session>>(
      `${proxyPrefix}/password-sign-in`,
      {
        method: "POST",
        body,
      },
    );

    await authSession.refresh();
    return result;
  }

  async function logout(): Promise<void> {
    await $fetch(`${proxyPrefix}/logout`, {
      method: "POST",
    });
    authSession.clear();
  }

  async function refreshSession(): Promise<UniAuthSessionContext<
    User,
    Session
  > | null> {
    const context = await $fetch<UniAuthSessionContext<User, Session> | null>(
      `${proxyPrefix}/refresh`,
      {
        method: "POST",
      },
    );
    await authSession.refresh();
    return context;
  }

  return {
    ...authSession,
    signInWithPassword,
    logout,
    refreshSession,
  };
}
