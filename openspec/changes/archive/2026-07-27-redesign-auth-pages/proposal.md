## Why

Auth pages work functionally (Clerk headless flows) but render as plain, unbranded shadcn — off-brand versus the "A Wish For" app design language, and in English while the product is Spanish. Two expected flows are also missing: password recovery and a standalone "check your email" confirmation. A user mid-creation who hits the publish auth gate lands on a generic form that breaks the warm, editorial feel established everywhere else.

## What Changes

- Redesign **sign-in** and **sign-up** to the app design system: warm near-white surface, deep-navy ink, lime-chartreuse primary reserved for the main action, green link accent, Lora serif headings + Inter body, JetBrains Mono eyebrows, pill buttons, rounded fields/cards.
- **Split desktop layout** (≥1024px): form on one side, brand panel on the other — brand panel reuses the "Vista previa de tu wishlist" preview-card motif from the Step 5a auth gate plus a warm testimonial/tagline. Mobile stays a single centered card (no split).
- **NEW — password recovery** flow at a route under `(auth)` (`/forgot-password`): multi-step (request code → enter code + new password) via Clerk headless signal API (`signIn.create` → `resetPasswordEmailCode.sendCode` → `.verifyCode` → `.submitPassword` → `signIn.finalize`). New zod schemas.
- **NEW — "Revisa tu correo"** confirmation screen: standalone check-your-email state, reused after sign-up code send and after reset code send.
- **Spanish copy** across all auth surfaces (Iniciar sesión, Crear cuenta, Recuperar contraseña, Revisa tu correo, Continuar con Google).
- Add a **"¿Olvidaste tu contraseña?"** link on sign-in pointing to the new flow.

**Non-goals:** No change to Clerk functional plumbing (`useSignIn`/`useSignUp` signal API, `GoogleButton`, `sso-callback`, `resolveRedirectPath` / `redirect_url` validation). No new auth providers. No change to `proxy.ts` route protection beyond registering the new `/forgot-password` public route. No changes to design-system tokens/fonts (already aligned) or Clerk env vars.

## Capabilities

### New Capabilities
- (none — extends the existing `authentication` capability)

### Modified Capabilities
- `authentication`: Add requirements for **password recovery** (headless reset flow) and a **check-your-email confirmation** screen; update the **custom sign-in** and **custom sign-up** requirements so their UI SHALL follow the app design language (split desktop / centered mobile, Spanish copy, brand tokens) while keeping existing Clerk behavior unchanged.

## Impact

- **Code:** `src/app/(auth)/{sign-in,sign-up}/page.tsx` (redesign), new `src/app/(auth)/forgot-password/page.tsx`, new `check-email` presentational component; `src/components/features/auth/{sign-in-form,sign-up-form,schemas}.tsx` (restyle + new reset form + reset schemas); new shared auth layout/brand-panel component. `src/proxy.ts` public-route matcher gains `/forgot-password(.*)`.
- **Specs:** delta on `openspec/specs/authentication/spec.md`.
- **No impact:** DB/Prisma, env vars, tRPC, `safe-redirect`, `sso-callback`, design-system tokens.
