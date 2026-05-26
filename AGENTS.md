# UniAuth Nuxt Module Rules

## Language

All repository-facing and GitHub-facing content must be written in English only: branch names,
commit messages, PR titles and bodies, issues, labels, milestones, changelog entries,
version-controlled documentation, code comments, generated artifacts, and release notes. Local
documents that are not tracked by Git are the only exception. Do not introduce new Russian text into
repository or GitHub artifacts.

## Ownership Boundary

This repository implements Nuxt-side integration for UniAuth-backed applications.

It may own:

- Nuxt module setup
- runtime config
- SSR/backend API client helpers
- composables such as `useSession()` and `useAuth()`
- route middleware for protected pages

It must not own:

- auth backend logic
- password verification
- session issuance
- OTP flows
- database access
- Express routes

## Public API

The package talks to an external backend API. Backend routes are provided by an application backend,
for example Express with `@alyldas/uniauth-express`.

## Local Setup

Install dependencies before checks:

```sh
npm install
npm run check
```

## Expected Checks

Run `npm run check` before publishing or committing Nuxt integration changes.
