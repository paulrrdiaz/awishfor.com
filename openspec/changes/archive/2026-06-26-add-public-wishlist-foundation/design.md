## Context

`mapPublicWishlist` already turns a `Wishlist` with relations into a leak-safe `PublicWishlistViewModel` (hidden/soft-deleted gifts filtered, guest contact data and internal notes excluded). What is missing is everything around it: a service that resolves a slug to that view model **only when access rules allow it**, the `/w/[slug]` route that renders it with correct SEO behavior, and the design presets the page needs. The Wishlist owner is a local `User` row (`Wishlist.ownerId Int` → `User`), and the viewer on the public RSC page is identified by their Clerk id from `auth()`; the link between them is `User.clerkId` (`@unique`). Lifecycle is `WishlistStatus = draft | published | archived`.

## Goals / Non-Goals

**Goals:**
- A `getPublicWishlistBySlug` service returning a discriminated result that encodes the access decision, so the route has no business logic to re-derive.
- Owner draft preview without leaking drafts to the public.
- `/w/[slug]` rendering published / archived / preview / not-found, always `noindex`.
- Hardcoded, id-selectable theme/layout/font/button presets with safe fallbacks and CSS scoping that cannot affect the dashboard.

**Non-Goals:**
- Public layout/section components (2.4), filters (2.5), progress UI (2.6).
- Guest purchase mutations and any write path.
- Locale URL prefixes, public search, custom colors, square buttons.

## Decisions

- **Service returns a discriminated union, not a nullable view model.** 
  `type PublicWishlistResult = { kind: "published" | "preview"; wishlist: PublicWishlistViewModel } | { kind: "archived"; archived: PublicArchivedViewModel } | { kind: "notFound" }`. 
  The access decision lives in the service (testable in isolation); the route just switches on `kind`. `preview` carries the same view model as `published` so the route renders one component with a banner. Alternative (return view model + separate flags) rejected: pushes branching into the RSC and invites leaks.

- **Access rules.** Resolve by slug, then branch on `status`:
  - `published` → `published`.
  - `archived` → `archived` (a minimal inactive-state payload: title/displayName for the message, not the gift list).
  - `draft` → `preview` **iff** the viewer owns it, else `notFound`.
  - no row → `notFound`.
  Drafts and unknown slugs are indistinguishable to non-owners (both `notFound`) so draft existence does not leak.

- **Owner identification by Clerk id.** The service takes `viewerClerkId: string | null` (null = signed out). Ownership = `wishlist.owner.clerkId === viewerClerkId` with a non-null viewer. The query selects `owner: { select: { clerkId: true } }`; no extra round-trip. The route obtains `viewerClerkId` from Clerk `auth()`.

- **Narrow DB port, mirroring existing services.** Define a `PublicWishlistDatabase` structural type exposing only the `wishlist.findUnique` (with the relation include) the service needs, matching the `WishlistDatabase`/`GiftDelegate` pattern in `wishlist.service.ts`. Keeps the service unit-testable with a plain object mock; the route passes the real `db`.

- **Reuse the mapper for gift safety.** The service includes `categories`, `gifts`, and each gift's `purchases`, then delegates to `mapPublicWishlist` — it never recomputes visibility or progress, so there is a single place that decides what is public. Archived results skip the mapper (no gift list needed).

- **`noindex` via the route's `generateMetadata`.** Return `robots: { index: false, follow: false }` for every `/w/[slug]` response. Marketing routes are unaffected because metadata is per-route. Title/description derive from the resolved wishlist; `notFound`/archived still return `noindex` metadata.

- **Theme config = data + resolver, CSS-variable based.** Each preset is a plain object of design tokens surfaced as CSS custom properties (e.g. `--public-bg`, `--public-accent`) applied to a wrapper element on the public page only — never on `:root` or the dashboard tree, so the dashboard theme is untouched. Each config file exports its presets keyed by id plus a `resolveX(id)` that returns the matching preset or a documented default when the id is null/unknown. Fonts go through `next/font` and expose their CSS variable the same way. This keeps "switch theme by `themeId`" a pure id→preset lookup the page applies as a class/style.

## Risks / Trade-offs

- **[Draft leak via timing/shape]** → Both draft-non-owner and unknown-slug return identical `notFound`; the route renders the same `notFound()`. No count/metadata branch reveals draft existence.
- **[CSS bleed into dashboard]** → Variables are scoped to a public wrapper element, asserted by keeping selectors off `:root`; dashboard pages never import the public config.
- **[Owner check cost]** → Single query with a selected `owner.clerkId`; no second query.
- **[Preset/schema drift]** → `themeId` etc. are free-form strings in the DB; resolvers fall back to a default for unknown ids rather than throwing, so a stale id never breaks the page.

## Migration Plan

Purely additive: new service, new route, new config, one line added to `src/proxy.ts` public-route matcher. No schema migration, no env changes. Rollback = revert the commit (the `/w/[slug]` route simply ceases to exist).

## Open Questions

- Exact archived-state copy and whether it links back to the marketing site — deferred to the component task (2.4); this change returns the minimal data the message needs.
- Whether previews need a distinct `robots` treatment beyond `noindex` — default: no, `noindex` already covers it.
