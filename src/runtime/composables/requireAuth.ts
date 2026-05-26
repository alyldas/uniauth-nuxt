import { createError } from "#app";
import type {
  UniAuthJsonSession,
  UniAuthJsonUser,
  UniAuthSession,
  UniAuthSessionContext,
  UniAuthUser,
} from "../types";
import { useSession } from "./useSession";

// noinspection JSUnusedGlobalSymbols -- Nuxt exposes composables from this directory as auto-imports.
export async function requireAuth<
  User extends UniAuthJsonUser = UniAuthUser,
  Session extends UniAuthJsonSession = UniAuthSession,
>(): Promise<UniAuthSessionContext<User, Session>> {
  const context = await useSession<User, Session>().refresh();

  if (!context) {
    throw createError({
      statusCode: 401,
      statusMessage: "Authentication required.",
    });
  }

  return context;
}
