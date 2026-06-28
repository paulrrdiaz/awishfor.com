## Context

The wishlist detail area lives at `src/app/(protected)/dashboard/wishlists/[id]/`. Today it has only `gifts/page.tsx` and `categories/page.tsx` — both React Server Components that fetch via the `@/trpc/server` caller. There is no `[id]/layout.tsx`, so the pages share no chrome or navigation.

Design is currently chosen only once, in the creation wizard's `DesignStep` (`src/components/features/wizard/design-step.tsx`), which composes the design catalogs (`getAllThemes`, `getAllLayouts`, `getAllFontPairingOptions`, `getAllButtonStyles`), the `ImageUpload` component, and a live preview via `draftToPreview()` → `PublicWishlistPage`. The persisted `Wishlist` model already carries `themeId`, `layoutId`, `fontPairing`, `buttonStyle`, `coverImageUrl` — so no schema change is needed.

The `wishlist` tRPC router exposes `list`, `checkSlugAvailability`, `publish`, `publishWizard`, `saveDraft`. There is no single-wishlist `getById` query and no design-only update path. Field-level Zod schemas already exist in `@/server/validators/wishlist.schema` and are reused by the save-draft validator.

## Goals / Non-Goals

**Goals:**
- One shared, responsive section navigation for all wishlist detail pages (7.3).
- A design page that edits a persisted wishlist's design with live preview and save (7.4).
- Reuse existing catalogs, `ImageUpload`, and the wizard preview pipeline rather than rebuilding them.
- A design-only persistence path that works for both draft and published wishlists.

**Non-Goals:**
- Building the Resumen (7.2) and Configuración (7.5) pages — nav links to them; they are owned by their own tasks.
- Freeform custom colors or new theme presets.
- Breadcrumbs (not required per TASKS 7.3).
- Any change to the design catalogs themselves or the public theme config.

## Decisions

### Navigation lives in `[id]/layout.tsx`, rendered by a client nav component
The layout is a RSC that reads `params.id` and renders a `<WishlistDetailNav wishlistId={id} />`. The nav itself is a client component because it needs `usePathname()` to compute the active item and `useRouter()` for the `Select` onChange. Nav items are a static array of `{ label, segment }` mapped to `/dashboard/wishlists/${id}/${segment}` (segment `""` for Resumen). Active detection compares the current pathname's trailing segment against each item.

*Alternative considered:* deriving nav per-page instead of in the layout — rejected because it duplicates the nav on every page and loses the shared-layout guarantee the spec requires.

### Responsive split via Tailwind, not JS breakpoint detection
Render both presentations and toggle with `hidden md:flex` (tabs) / `md:hidden` (select wrapper). This avoids hydration mismatch and a `useMediaQuery` hook. Tabs use the existing shadcn/Base UI styling; the dropdown uses the shared `Select` component.

*Alternative considered:* a single component that swaps via `useMediaQuery` — rejected for SSR flicker and extra client logic.

### Design page = RSC loader + client editor
`[id]/design/page.tsx` (RSC) fetches the wishlist via a new `api.wishlist.getById({ id })` and passes its design fields + content into a client `WishlistDesignEditor`. The editor holds the selected design in local state, drives the embedded preview through the existing `draftToPreview()` → `PublicWishlistPage` pipeline (the same data shape the wizard already feeds it), and saves via `api.wishlist.updateDesign` (`@/trpc/react`). Reuse `SelectorGrid`-style selectors and `ImageUpload` from the wizard; extract shared bits into `src/components/features/dashboard/design/*` if the wizard component can't be imported directly without coupling to the wizard store.

*Alternative considered:* reusing `DesignStep` verbatim — rejected because it is bound to `useWizardStore`; the dashboard editor operates on a persisted wishlist, not wizard draft state.

### New `getById` query and `updateDesign` mutation
- `wishlist.getById`: `protectedProcedure`, input `{ id }`, returns the caller-owned wishlist (404/throw if not found or not owned). Needed by the design page now and reusable by Resumen/Settings later.
- `wishlist.updateDesign`: `protectedProcedure`, input a design-only schema `{ id, themeId, layoutId, fontPairing, buttonStyle, coverImageUrl }` built from the existing field schemas in `@/server/validators/wishlist.schema`. It verifies ownership, updates only those columns regardless of `status`, and revalidates the public page (`revalidatePath`/tag for the wishlist slug) so a published page reflects the change.

*Alternative considered:* extending `saveDraft` to carry design edits — rejected because `saveDraft` targets draft content and full-draft semantics; design edits must also apply to published wishlists without touching gifts/categories/content.

### Ownership enforcement at the service/router layer
Both new procedures resolve the local user id (existing `getLocalUserId` helper) and scope the query/update by `ownerId`. Page-level protection in `proxy.ts` does not guard the API, per project convention.

## Risks / Trade-offs

- **Resumen/Settings routes may not exist yet (7.2/7.5)** → Nav links still render and point to the correct routes; visiting an unbuilt route is a separate task's concern. Document the dependency in the proposal/tasks rather than stubbing pages here.
- **Preview data-shape drift** → The wizard preview expects a specific draft shape; mapping a persisted wishlist into it risks divergence. Mitigation: build a small adapter that maps the persisted wishlist to the `draftToPreview` input, covered by a unit test.
- **Stale public page after design save** → If revalidation is missed, published pages show old design. Mitigation: explicitly revalidate the public wishlist path/tag in `updateDesign` and assert it in tests.
- **Duplicated selector UI** between wizard and dashboard → Mitigation: extract the shared `SelectorGrid` into a reusable component if duplication grows; acceptable to start with a focused copy in `dashboard/design/*`.

## Open Questions

- Should `updateDesign` validation require non-null theme/layout (publish-readiness), or allow clearing back to null? Default: mirror the wizard's nullable design field schemas (allow null), since publish readiness is enforced separately.
- Does the active-tab style come from an existing shadcn `Tabs` primitive in the repo, or a custom nav? Resolve during apply by checking `src/components/ui`.
