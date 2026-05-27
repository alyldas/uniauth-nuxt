# @alyldas/uniauth-nuxt

[![GitHub Packages](https://img.shields.io/static/v1?label=GitHub%20Packages&message=%40alyldas%2Funiauth-nuxt&color=24292f&logo=github)](https://github.com/users/alyldas/packages/npm/package/uniauth-nuxt)

Nuxt module for applications that use a UniAuth-powered backend API.

## Runtime Boundary

This package does not create auth records, verify passwords, issue sessions, or own cookies. It only
forwards Nuxt SSR and browser calls to the backend API and exposes Nuxt-friendly helpers.

## Install

Configure the GitHub Packages registry for the package scope before installing:

```ini
@alyldas:registry=https://npm.pkg.github.com
```

GitHub Packages can require authentication for package reads. Use a token with `read:packages` in local npm config or CI secrets; do not commit tokens.

```sh
npm install @alyldas/uniauth-nuxt nuxt
```

By default, the module expects `@alyldas/uniauth-express` mounted at `/auth`:

- `GET /auth/account/session`
- `POST /auth/password/sign-in`
- `POST /auth/account/sessions/revoke-current`
- `POST /auth/account/session/refresh`

```ts
export default defineNuxtConfig({
  modules: ["@alyldas/uniauth-nuxt"],
  uniauth: {
    apiBase: process.env.UNIAUTH_API_BASE,
    redirects: {
      signIn: "/sign-in",
    },
  },
});
```

Available runtime helpers:

- `useSession()`
- `useAuth()`
- `requireAuth()`
- `createUniAuthBackendClient(event)`
- `getUniAuthSession(event)`
- `requireUniAuthSession(event)`

Protect a page with the built-in route middleware:

```ts
definePageMeta({
  middleware: "auth",
});
```

Read session state in components:

```vue
<script setup lang="ts">
const { user, authenticated, guest, ready, pending, refresh } = useSession();
const { signInWithPassword, logout } = useAuth();
</script>
```

Require a session in client-side setup:

```ts
const { user, session } = await requireAuth();
```

Require a session in server handlers:

```ts
export default defineEventHandler(async (event) => {
  const { user } = await requireUniAuthSession(event);

  return {
    id: user.id,
  };
});
```

Applications can specialize the default user and session types once:

```ts
declare module "@alyldas/uniauth-nuxt/types" {
  interface UniAuthUser {
    readonly roles?: readonly string[];
  }

  interface UniAuthSession {
    readonly tenantId?: string;
  }
}
```

## Migration Notes

Use the session context as the single source of truth for the current user:

```ts
const { user, session, authenticated } = useSession();
```

The package does not expose a separate current-user composable, helper, endpoint option, or proxy
route. Code that previously read the current user separately should read `useSession().user` on the
client, or `getUniAuthSession(event)?.user` / `requireUniAuthSession(event).user` on the server.

## Security Notes

- Keep backend origin and proxy rules in server-controlled runtime config.
- Do not put provider secrets or UniAuth core runtime objects in Nuxt public config.
- Treat this package as a frontend/SSR integration layer, not an auth backend.

## Local Checks

```sh
npm run check
```
