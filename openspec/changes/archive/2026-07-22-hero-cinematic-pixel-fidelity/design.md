## Context

`HeroCinematicLayout` (`src/components/layouts/public-wishlist/hero-cinematic-layout.tsx`) and its shared pieces (`hero-ctas.tsx`, `countdown.tsx`, the welcome-message block in `public-wishlist-body.tsx`) are already implemented and wired into `PublicWishlistPage`. The gap is fidelity against the Claude Design mock for artboard `01 · HeroCinematic · Crema Elegante · Boda`, not missing functionality. `Countdown` and the welcome-message block are consumed verbatim by 14 of the ~17 layout variants (`editorial`, `minimal`, and `grid` have their own custom body composition and are unaffected), so the countdown/welcome-message decisions here apply everywhere, while the hero-specific decisions (gradient, eyebrow, subtitle, CTA variant) apply only to `HeroCinematicLayout`.

Current view model (`src/server/mappers/view-models.ts`) already exposes `heroTitle`, `displayName`, `eventLocation`, `dressCode`, `welcomeMessage`, `coverImageUrls` — no schema or mapper changes needed.

## Goals / Non-Goals

**Goals:**
- Match the design mock's hero composition for `HeroCinematicLayout`: fixed desktop height, warm-tinted gradient, eyebrow with date, subtitle from `eventLocation`, on-photo CTA contrast.
- Match the design mock's boxed-accent-card countdown and italic-quote-with-attribution welcome message, applied once in the shared components so all 14 consuming layouts benefit.
- Preserve existing countdown text logic (`formatCountdown`) and existing non-photo CTA styling (used by layouts where CTAs don't sit over a photo) exactly as-is.

**Non-Goals:**
- Auditing or fixing the other 9 sibling "layout exploration" components against their own mocks.
- Adding a `locale` field or any schema/mapper change — Spanish-only formatting is fine, matching existing precedent (`event-details.tsx` hardcodes `es-PE`).
- Changing `gift-card.tsx` (verified already close to the mock).
- Backfilling spec coverage for the 14 newer layout-exploration components in `openspec/specs/public-wishlist-layout/spec.md` beyond the requirements this change actually touches.

## Decisions

**1. Hero height** — change the desktop breakpoint from `lg:h-[460px]` to `lg:h-[440px]` to match the mock exactly. Leave `h-80`/`sm:h-96` (mobile/tablet) untouched — the mock only specifies a desktop measurement, and the existing responsive steps are reasonable extrapolations.

**2. Gradient** — replace `bg-gradient-to-t from-black/75 via-black/25 to-transparent` with `bg-gradient-to-b from-[rgba(20,10,5,.04)] via-[rgba(20,10,5,.44)] to-[rgba(20,10,5,.82)]`. Tailwind's default `via` stop sits at 50%, which matches the mock's explicit `0% / 50% / 100%` stops exactly — no arbitrary stop-position syntax needed. `to-b` (top→bottom, light→dark) replaces `to-t`, since the mock's dark end is the bottom where text sits.

**3. Eyebrow text** — compose `${eventLabel} · ${formattedDate}` when `wishlist.eventDate` is present, falling back to `eventLabel` alone when it isn't. Reuse `formatEventDate` from `@/lib/format/dates` (already exists, currently unused) with `locale: "es"`, rather than adding a third ad-hoc date formatter alongside the one in `event-details.tsx` — that file's local duplicate is pre-existing and untouched by this change.

**4. Subtitle line** — swap from `wishlist.displayName` to `wishlist.eventLocation`, falling back to `displayName` when `eventLocation` is null (so the line isn't empty for wishlists that haven't set a venue). Render nothing when both are null, matching the existing pattern where `wishlist.displayName && (...)` already guards the current line.

  *Freed-up `displayName`*: since the hero subtitle no longer needs it, decision 7 repurposes `displayName` as the welcome-message attribution (`— {displayName}`) — matching the mock's `— María & Tomás` line, which is exactly what `displayName` already represents (the host/couple name) elsewhere in the app (dashboard, nav).

**5. Hero CTA contrast** — add a `variant?: "default" | "on-photo"` prop to `HeroCtas` (default `"default"`, preserving current `bg-primary`/`border-primary` behavior for the 13 other consuming layouts). The `"on-photo"` variant hardcodes a white/glass treatment (solid white bg + dark text for primary; translucent-white border + white text for secondary) independent of theme CSS variables, since it must stay legible over arbitrary user-uploaded photography regardless of the active theme's primary color. `HeroCinematicLayout` passes `variant="on-photo"`.

**6. Countdown** — restyle `countdown.tsx`'s markup into a rounded, tinted accent-card container (`bg-accent`/theme-scoped tint, generous padding, rounded corners) with a small uppercase eyebrow label ("La cuenta regresiva") above the existing countdown text, now rendered large. `formatCountdown` and its returned strings are untouched — this is a wrapper/typography change only, applied uniformly (no variant prop) since every one of the 14 consuming layouts' mocks uses this same boxed treatment.

**7. Welcome message** — in `public-wishlist-body.tsx`, wrap `wishlist.welcomeMessage` in italic serif styling (quote-like presentation) and add an attribution line below it reading `— {wishlist.displayName}`, rendered only when `displayName` is present. Applied uniformly across the 14 consuming layouts, same as decision 6.

## Risks / Trade-offs

- **[Shared-component change touches 14 layouts at once]** → Run `pnpm test` and spot-check the dashboard live preview across at least 2-3 themes (not just Crema Elegante) before closing the apply session, since a visual regression here isn't isolated to one layout.
- **[`eventLocation`/`displayName` fallback ambiguity]** → Both the hero subtitle and the welcome-message attribution now conditionally fall back or omit; verify with a wishlist that has neither field set that no empty line renders.
- **[Hardcoded on-photo CTA colors ignore theme]** → Intentional per the mock (all 10 layout explorations use the same neutral on-photo treatment regardless of theme), but flagged as an open question below in case a future theme's photography skews very light and washes out the white pill.
- **[Reusing `displayName` for welcome-message attribution assumes it reads naturally as a signature]** → It already serves this role in copy elsewhere (e.g., "— Ana & Diego" patterns in other mocks), so no parsing/reformatting needed.

## Open Questions

- Should the `"on-photo"` CTA variant ever adapt to a light-toned cover photo (e.g., outdoor daytime wedding shots), or is the fixed dark-gradient overlay (decision 2) always strong enough to guarantee contrast regardless of photo brightness? Proceeding with the fixed/hardcoded approach per the mock; revisit only if a real photo washes it out during review.
