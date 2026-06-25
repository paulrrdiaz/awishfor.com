## 1. Dependencies & Config

- [x] 1.1 Install `@clerk/nextjs`, `react-hook-form`, and `@hookform/resolvers`
- [x] 1.2 Add shadcn `form` (or `field`), `input`, and `label` components via the shadcn CLI
- [x] 1.3 Add `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` to `src/env.js` (server/client split)
- [x] 1.4 Add the Clerk keys to `.env` and `.env.example`; document enabling Google OAuth in the Clerk dashboard

## 2. Clerk Wiring

- [x] 2.1 Wrap the `RootLayout` body in `ClerkProvider` in `src/app/layout.tsx`
- [x] 2.2 Create `src/proxy.ts` (Next.js 16 convention) using `clerkMiddleware` + `createRouteMatcher`, marking `/sign-in`, `/sign-up`, and `/sso-callback` public and protecting the rest
- [x] 2.3 Add the Clerk-recommended middleware `matcher` config

## 3. Shared Auth Building Blocks

- [x] 3.1 Create `src/components/features/auth/schemas.ts` with `signInSchema` and `signUpSchema` (zod) and inferred types
- [x] 3.2 Create `src/components/features/auth/google-button.tsx` — a reusable "Continue with Google" button taking a Clerk `authenticateWithRedirect` handler, with loading/disabled state

## 4. Sign-In Flow

- [x] 4.1 Build `src/components/features/auth/sign-in-form.tsx` with `react-hook-form` + zod resolver and Clerk `useSignIn`; on success call `setActive` and redirect
- [x] 4.2 Wire the Google button to `signIn.authenticateWithRedirect({ strategy: "oauth_google", redirectUrl: "/sso-callback", redirectUrlComplete: "/" })`
- [x] 4.3 Surface Clerk errors via `err.errors[0]?.longMessage` with a generic fallback
- [x] 4.4 Create `src/app/(auth)/sign-in/page.tsx` rendering the form

## 5. Sign-Up Flow

- [x] 5.1 Build `src/components/features/auth/sign-up-form.tsx` step 1 (email + password) using `useSignUp` → `signUp.create` + `prepareEmailAddressVerification({ strategy: "email_code" })`
- [x] 5.2 Add the `<div id="clerk-captcha" />` mount point for smart CAPTCHA
- [x] 5.3 Implement step 2 (email code) → `attemptEmailAddressVerification` then `setActive` + redirect, with a `verifying` state toggle
- [x] 5.4 Wire the Google button to `signUp.authenticateWithRedirect` with the same redirect targets
- [x] 5.5 Surface Clerk errors with a generic fallback
- [x] 5.6 Create `src/app/(auth)/sign-up/page.tsx` rendering the form

## 6. OAuth Callback

- [x] 6.1 Create `src/app/(auth)/sso-callback/page.tsx` rendering Clerk's `AuthenticateWithRedirectCallback`

## 7. Verify

- [x] 7.1 Run `pnpm typecheck` and `pnpm check` (Biome) and fix issues
- [x] 7.2 Manually verify: email sign-up + verification, email sign-in, Google on both pages, and redirect of unauthenticated users to sign-in
