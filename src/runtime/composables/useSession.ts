import { computed } from "vue";
import { useAsyncData, useState } from "#app";
import type {
  UniAuthClientState,
  UniAuthJsonSession,
  UniAuthJsonUser,
  UniAuthSession,
  UniAuthSessionContext,
  UniAuthUser,
} from "../types";
import { useUniAuthProxyPrefix } from "../utils/public-config";

const sessionKey = "uniauth:session";

// noinspection JSUnusedGlobalSymbols -- Nuxt exposes composables from this directory as auto-imports.
export function useSession<
  User extends UniAuthJsonUser = UniAuthUser,
  Session extends UniAuthJsonSession = UniAuthSession,
>() {
  const proxyPrefix = useUniAuthProxyPrefix();
  const state = useState<UniAuthClientState<User, Session>>(sessionKey, () => ({
    user: null,
    session: null,
    authenticated: false,
  }));

  function setContext(
    context: UniAuthSessionContext<User, Session> | null,
  ): void {
    state.value = {
      user: context?.user ?? null,
      session: context?.session ?? null,
      authenticated: Boolean(context?.user && context?.session),
    };
  }

  const asyncData = useAsyncData(
    sessionKey,
    async () => {
      const context = await $fetch<
        UniAuthSessionContext<User, Session> | null | undefined
      >(`${proxyPrefix}/session`);

      return context ?? null;
    },
    {
      default: () => null,
      transform: (context: UniAuthSessionContext<User, Session> | null) => {
        setContext(context);
        return context;
      },
    },
  );

  async function refresh(): Promise<UniAuthSessionContext<
    User,
    Session
  > | null> {
    await asyncData.refresh();
    return asyncData.data.value;
  }

  function clear(): void {
    setContext(null);
    asyncData.clear();
  }

  return {
    state,
    user: computed(() => state.value.user),
    session: computed(() => state.value.session),
    authenticated: computed(() => state.value.authenticated),
    ready: computed(() => !asyncData.pending.value),
    guest: computed(
      () => !asyncData.pending.value && !state.value.authenticated,
    ),
    pending: asyncData.pending,
    error: asyncData.error,
    refresh,
    clear,
  };
}
