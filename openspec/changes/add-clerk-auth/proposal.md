## Why

The app currently has no authentication. We need users to be able to create accounts and sign in. Clerk gives us a managed identity backend (sessions, password handling, OAuth, security) without us building it, while custom-built forms keep the UI fully on-brand and consistent with the rest of the app.

## What Changes

- Add Clerk (`@clerk/nextjs`, latest) as the authentication provider, wired through `ClerkProvider` and `clerkMiddleware`.
- Add typed Clerk environment variables to `src/env.js`.
- Build a **custom** Sign Up page at `src/app/(auth)` using `react-hook-form` + `zod`, driven by Clerk's `useSignUp` headless hook (no Clerk pre-built UI components).
- Build a **custom** Sign In page at `src/app/(auth)` using `react-hook-form` + `zod`, driven by Clerk's `useSignIn` headless hook.
- Add a reusable "Continue with Google" button to both pages (OAuth via `authenticateWithRedirect`, `strategy: oauth_google`).
- Add an email-verification step for sign up (Clerk email code) to complete account creation.
- Add an OAuth callback route to finalize Google sign-in/sign-up.
- Place shared auth form components in `src/components/features/auth`.
- Install the shadcn components needed by the forms (e.g. `form`/`field`, `input`, `label`).
- Add `react-hook-form` and `@hookform/resolvers` dependencies.

## Capabilities

### New Capabilities
- `authentication`: Email/password and Google OAuth sign-up and sign-in flows backed by Clerk, with custom react-hook-form + zod forms, email verification, route protection via middleware, and session-based access.

### Modified Capabilities
<!-- None — no existing specs. -->

## Impact

- **Dependencies**: add `@clerk/nextjs`, `react-hook-form`, `@hookform/resolvers`; add shadcn `form`/`field`, `input`, `label` components.
- **Config**: `src/env.js` (new Clerk env vars), `.env` (keys), new `src/middleware.ts`.
- **Code**: `src/app/layout.tsx` (wrap in `ClerkProvider`), new routes under `src/app/(auth)`, new components under `src/components/features/auth`, new OAuth callback route.
- **External**: requires a Clerk application with Google OAuth configured in the Clerk dashboard.
