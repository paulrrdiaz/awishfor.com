## Context

Auth is fully wired via Clerk's headless **signal API** (`signIn.password`, `signIn.sso`, `signIn.verifications`, `signIn.finalize`, and the sign-up equivalents). Forms use `react-hook-form` + `zod`; `resolveRedirectPath` validates `redirect_url`. The app design tokens already exist in `globals.css` (warm near-white bg, deep-navy ink, lime-chartreuse `--primary`, Lora/Inter). The Claude Design file `A Wish For.dc.html` contains only one auth artifact — the **Step 5a "Auth gate"** centered mobile card — so the split desktop, forgot-password, and check-email screens are designed fresh in the established app language (decided in explore).

Design-file app tokens (reference): `--abg #F7F8F1`, `--afg #1E2A47`, `--apri #C3E63E`, `--aprifg #1A2400`, `--amut #6B7384`, `--aacc #EAF6EE`, `--aaccfg #2E7D4F`; fields radius 12px, cards 16px, buttons pill (999px), eyebrow = JetBrains Mono uppercase.

## Goals / Non-Goals

**Goals:**
- Auth screens read as "A Wish For": warm, editorial, Spanish, brand tokens.
- Split desktop (≥1024px) with a wishlist-preview brand panel; centered card on mobile.
- Add password recovery + a reusable check-your-email confirmation.
- Reuse existing Clerk plumbing untouched.

**Non-Goals:**
- No changes to Clerk signal-API logic, `sso-callback`, `safe-redirect`, env vars, or design-system tokens.
- No new auth providers; no server/tRPC/DB changes.

## Decisions

- **Shared `AuthLayout` shell + `BrandPanel`.** New presentational components render the two-column split (form column + brand column) at `lg:`, collapsing to a single centered card below. Each page (`sign-in`, `sign-up`, `forgot-password`) composes `AuthLayout`. Rationale: one layout, three forms — avoids per-page duplication and keeps the split responsive rules in one place. Alternative (per-page layout markup) rejected: drift risk across 3+ screens.
- **BrandPanel reuses the auth-gate preview motif.** Static "Vista previa de tu wishlist" card (placeholder wishlist "Esperando a Mateo · 2 regalos · Cielo Suave") + testimonial/tagline. Rationale: ties auth to the product payoff and matches the only auth frame in the design. Presentational only, lives in `shared/` per design-system spec (no data fetching).
- **Check-email as a controlled sub-state, not a route.** `CheckEmail` is a presentational component the sign-up and forgot-password forms render in place (like the current inline `verifying` state) rather than a separate URL. Rationale: the code (verification/reset session) lives in the form's Clerk signal state; a separate route would lose it. Keeps deep-link/refresh from stranding a half-finished flow.
- **Reset flow = one route, staged state.** `/forgot-password` holds three internal stages: `request` (email) → `code+password` (Clerk status `needs_new_password`) → complete → `finalize()` → redirect. Mirrors the existing sign-up verify pattern. Uses `signIn.create({identifier})` then `resetPasswordEmailCode.sendCode()/.verifyCode()/.submitPassword()`.
- **Spanish copy centralized in components.** Strings inline in the auth components (no i18n framework in scope). Rationale: product is single-locale today; introducing i18n is out of scope.
- **shadcn primitives first, Tailwind fallback.** Reuse `input`, `label`, `button`, `field`, `card`; brand-specific shape (pill, eyebrow, serif heading) via Tailwind utilities mapped to existing tokens.

## Risks / Trade-offs

- **Clerk reset signal-API method names** (`resetPasswordEmailCode.sendCode/.verifyCode/.submitPassword`) confirmed against Clerk custom-flow docs, but the installed `@clerk/nextjs` version's signal surface must be verified at apply time → verify against the pinned version; fall back to the classic `signIn.create({ strategy: 'reset_password_email_code' })` + `attemptFirstFactor` shape if the signal helpers are absent.
- **Check-email as sub-state** means a page refresh mid-flow drops the "sent" state → acceptable; user re-requests the code. Documented, not mitigated.
- **Split panel adds a new large surface** not in the design file → keep BrandPanel simple/static to limit new design debt; content reuses an existing motif.
- **`prefers-reduced-motion`** — any brand-panel motion must be gated (per design-system brief) → keep panel static or motion-gated.

## Migration Plan

Pure UI + additive routes; no data migration. Register `/forgot-password(.*)` as public in `proxy.ts`. Rollback = revert the change; existing auth keeps working since plumbing is untouched.

## Open Questions

- Exact testimonial/tagline copy for the brand panel (placeholder acceptable for first pass).
- Whether "¿Olvidaste tu contraseña?" should also surface a resend-code affordance on the check-email screen (lean yes — cheap, add in tasks).
