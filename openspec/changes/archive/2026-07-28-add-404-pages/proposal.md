## Why

A guest who opens a mistyped or expired wishlist link — the single most common way this product fails a visitor — currently lands on Next.js's unstyled built-in 404. There is no `not-found.tsx` anywhere in the app, so all ten `notFound()` call sites and every unmatched URL fall through to default framework chrome that carries no branding, no Spanish copy, and no way back into the product.

Design canvas §11 (`A Wish For.dc.html`) specifies two branded 404 surfaces built around one idea — *"el regalo se escapó"*, a gift box drifting away on a string with confetti falling around it. This change implements those, plus a third boundary the canvas did not cover but the codebase demands.

## What Changes

- Add a **public 404** at `/w/[slug]`, pinned to the Cielo Suave theme, with isotype chrome, the escaped-gift art, and CTAs `Volver al inicio` / `Crear mi wishlist`.
- Add a **marketing 404** at the app root for unmatched URLs, in the light-green marketing theme, with CTAs `Volver al inicio` / `Ver un ejemplo`.
- Add a **dashboard 404** at `dashboard/wishlists/not-found.tsx`, app-themed, catching all eight `notFound()` call sites under `dashboard/wishlists/[id]/**` while keeping the sidebar intact.
- Introduce `GiftEscapedArt`, a self-contained client component rendering the `4 · caja · 4` composition with confetti and sparkles, driven by GSAP.
- Extract the guest finder's behavior into a `useGuestFinder()` hook so the public 404 can offer list recovery without duplicating validation.
- Surface the guest finder on the public 404 at **all** breakpoints, not desktop-only as the canvas draws it.

Non-goals, to be clear about what this change does not touch:

- **The archived wishlist state** (`w/[slug]/page.tsx:59-73`) stays as-is. It is visually adjacent and equally unstyled, but it has the wishlist record in hand — so it renders in that wishlist's own theme with its own title, and §3 specifies a centered inactive card rather than escaped-gift art. It shares layout instinct with the 404s and almost no code. Separate proposal.
- **Unmatched paths under `/dashboard`** (e.g. `/dashboard/garbage`) will still resolve to the marketing 404. Segment-level boundaries only catch `notFound()` calls; unmatched URLs always route to the root boundary. Fixing this would require `global-not-found.tsx`, rejected in design.
- **No new metadata mechanism.** `not-found.tsx` cannot export metadata; the marketing and dashboard 404s keep the generic `A Wish For` title.

## Capabilities

### New Capabilities

- `not-found-pages`: the three not-found boundaries, which `notFound()` call sites each one catches, their Spanish copy and recovery CTAs, the shared escaped-gift art, and its motion and reduced-motion resting behavior.

### Modified Capabilities

- `guest-list-finder`: the finder gains a second surface. Its resolution behavior is unchanged, but it must now be reachable from the public 404 at every breakpoint, and its behavior must be shared rather than reimplemented per surface.

## Impact

**New files**

- `src/app/not-found.tsx`, `src/app/w/[slug]/not-found.tsx`, `src/app/(protected)/dashboard/wishlists/not-found.tsx`
- `src/components/shared/gift-escaped-art.tsx` (+ `.stories.tsx`)
- `src/components/shared/guest-finder-field.tsx`
- `src/lib/gsap/use-escaped-gift-motion.ts`
- `src/lib/wishlist/use-guest-finder.ts`

**Modified**

- `src/components/layouts/marketing/guest-finder.tsx` — internals swapped for the hook; JSX and classes unchanged, so the shipped landing carries no visual risk.

**Dependencies** — none added. GSAP 3.15 is already a dependency and already has an established hook pattern under `src/lib/gsap/`.

**No** schema, env, API, or tRPC changes.

**Behavioral note:** eight dashboard `notFound()` call sites currently reach the framework default and will begin rendering the new app-themed boundary. Two `/w/[slug]/[guestSlug]` call sites will begin rendering the public 404 via the nearest ancestor boundary.
