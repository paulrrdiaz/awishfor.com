## Context

The app is a Create-T3 stack (Next.js 16 App Router, React 19, tRPC, Tailwind v4, shadcn `base-nova`, zod v4, Biome). There is no auth today. The `src/app/(auth)` route group and `src/components/features` directory already exist but are empty. Env vars are validated through `@t3-oss/env-nextjs` in `src/env.js`. We want Clerk for the identity backend but fully custom UI to stay on-brand.

## Goals / Non-Goals

**Goals:**
- Email/password + Google OAuth sign-up and sign-in using Clerk's headless hooks.
- Forms built with `react-hook-form` + `zod`, reusing shadcn primitives.
- Reusable Google button shared by both pages.
- Type-safe Clerk env vars and middleware-based route protection.

**Non-Goals:**
- No Clerk pre-built components (`<SignIn />`, `<SignUp />`, `<UserButton />`).
- No additional OAuth providers beyond Google.
- No user profile / account management screens, password reset, or organizations (can follow later).
- No persistence of user data in our own DB (Clerk is the source of truth for now).

## Decisions

- **Clerk via `@clerk/nextjs` headless hooks.** Use `useSignUp` / `useSignIn` for credentials and `signIn.authenticateWithRedirect` / `signUp.authenticateWithRedirect` for Google. Rationale: the requirement is custom UI; hooks expose the full state machine (e.g. `status === "missing_requirements"`, email verification) while we own the markup. Alternative — Clerk Elements — was rejected because it still imposes its own component/slot model; raw hooks give maximum control.

- **Form stack: `react-hook-form` + `@hookform/resolvers/zod` + shadcn `form`/`field`.** zod schemas (`signInSchema`, `signUpSchema`) live alongside the components and drive both client validation and typed values. Server-side validity is enforced by Clerk itself.

- **Two-step sign-up.** Step 1 collects email+password and calls `signUp.create` then `prepareEmailAddressVerification({ strategy: "email_code" })`. Step 2 collects the 6-digit code and calls `attemptEmailAddressVerification`, then `setActive` on success. Component holds a small `verifying` state flag to switch between steps. Rationale: Clerk requires email verification to activate a session for email/password sign-ups.

- **OAuth callback route.** Add `src/app/(auth)/sso-callback/page.tsx` rendering Clerk's `AuthenticateWithRedirectCallback` (a logic-only component, no visible Clerk UI), and point `redirectUrl` there from `authenticateWithRedirect`; `redirectUrlComplete` points at the post-auth destination (`/`).

- **Env + middleware.** Add `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (client) and `CLERK_SECRET_KEY` (server) to `src/env.js`. Add `src/middleware.ts` using `clerkMiddleware` + `createRouteMatcher`, marking `/sign-in`, `/sign-up`, `/sso-callback` public and protecting the rest. Wrap `RootLayout` body in `ClerkProvider`.

- **File layout.**
  - `src/app/(auth)/sign-in/page.tsx`, `src/app/(auth)/sign-up/page.tsx`, `src/app/(auth)/sso-callback/page.tsx`
  - `src/components/features/auth/`: `sign-in-form.tsx`, `sign-up-form.tsx`, `google-button.tsx`, `schemas.ts`
  - shadcn adds: `form` (or `field`), `input`, `label`.

## Risks / Trade-offs

- **Clerk error shape coupling** → parse `err.errors[0]?.longMessage` defensively with a fallback generic message; never crash the form on an unexpected error shape.
- **Bot protection / CAPTCHA on sign-up** → Clerk may inject a CAPTCHA widget; render the required `<div id="clerk-captcha" />` in the sign-up form so the smart CAPTCHA can mount even with custom UI.
- **`setActive` redirect timing** → navigate with the App Router `useRouter` only after `setActive` resolves to avoid a flash of the auth page.
- **Env var leakage** → publishable key is `NEXT_PUBLIC_` by design; secret key stays server-only in `env.js`, never imported into a client component.
- **External setup dependency** → Google OAuth must be enabled in the Clerk dashboard; document this in tasks so it isn't missed.
