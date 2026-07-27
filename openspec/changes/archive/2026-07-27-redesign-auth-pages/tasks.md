## 1. Shared auth layout & brand panel

- [x] 1.1 Create `src/components/shared/auth/brand-panel.tsx` — static wishlist-preview card ("Vista previa de tu wishlist" / "Esperando a Mateo · 2 regalos · Cielo Suave") + testimonial/tagline, brand tokens, presentational only (no data fetching), any motion gated behind `prefers-reduced-motion`
- [x] 1.2 Create `src/components/shared/auth/auth-shell.tsx` — two-column split at `lg:` (form column + `BrandPanel`), collapsing to a single centered card below `lg`; props for eyebrow, serif heading, subheading, and form children
- [x] 1.3 Add reusable `AuthEyebrow` / serif-heading styling helpers (JetBrains Mono uppercase eyebrow, Lora heading) as small utilities or classNames used by the shell

## 2. Schemas

- [x] 2.1 In `src/components/features/auth/schemas.ts` add `resetRequestSchema` (email) and `resetPasswordSchema` (code 6-digit + new password, reuse sign-up password rules); export inferred types

## 3. Check-your-email confirmation

- [x] 3.1 Create `src/components/features/auth/check-email.tsx` — presentational "Revisa tu correo" state (Spanish copy, brand tokens) with a slot for the code-entry field(s) and an optional resend affordance; used in-place by sign-up and recovery forms

## 4. Redesign sign-in

- [x] 4.1 Restyle `sign-in-form.tsx` to app tokens/Spanish (Correo, Contraseña, Iniciar sesión, "o", Continuar con Google), pill primary button, rounded fields; keep all Clerk signal-API logic unchanged
- [x] 4.2 Add "¿Olvidaste tu contraseña?" link → `/forgot-password` (preserve `redirect_url` if present)
- [x] 4.3 Rewrite `src/app/(auth)/sign-in/page.tsx` to compose `AuthShell` (split desktop / centered mobile) with Spanish heading + "¿No tienes cuenta? Crea una"

## 5. Redesign sign-up

- [x] 5.1 Restyle `sign-up-form.tsx` to app tokens/Spanish (Crear cuenta, Continuar con Google); keep Clerk signal-API logic
- [x] 5.2 Replace the inline `verifying` block with the shared `CheckEmail` component (code field inside), preserving the Clerk sign-up session
- [x] 5.3 Rewrite `src/app/(auth)/sign-up/page.tsx` to compose `AuthShell` with Spanish heading + "¿Ya tienes cuenta? Inicia sesión"

## 6. Password recovery flow

- [x] 6.1 Create `src/components/features/auth/forgot-password-form.tsx` — staged: `request` (email → `signIn.create({identifier})` + `resetPasswordEmailCode.sendCode()`) → `CheckEmail` state with code + new-password (`.verifyCode({code})` → `.submitPassword({password})`) → on `status === "complete"` `signIn.finalize()` and redirect to resolved `redirect_url`; human-readable errors + retry
- [x] 6.2 Verify the reset signal-API method names against the pinned `@clerk/nextjs` version; if the signal helpers are absent, fall back to `signIn.create({ strategy: "reset_password_email_code", identifier })` + `attemptFirstFactor`
- [x] 6.3 Create `src/app/(auth)/forgot-password/page.tsx` composing `AuthShell` (Spanish "Recuperar contraseña", back-to-sign-in link), `Suspense`-wrapped like the other auth pages
- [x] 6.4 Add `/forgot-password(.*)` to the public-route matcher in `src/proxy.ts`

## 7. Verify

- [x] 7.1 `pnpm check`, `pnpm typecheck`, `pnpm test` all pass
- [x] 7.2 Manually verify at 390px (centered card, all 4 screens) and ≥1024px (split brand panel): sign-in, sign-up → check-email, forgot-password → check-email → reset, and Google button on sign-in/sign-up
