## 1. API layer

- [x] 1.1 Add `wishlist.getById` protected query: input `{ id }`, returns the caller-owned wishlist, throws/404 when missing or not owned (reuse `getLocalUserId`).
- [x] 1.2 Add a design-only validator (`{ id, themeId, layoutId, fontPairing, buttonStyle, coverImageUrl }`) composed from the field schemas in `@/server/validators/wishlist.schema`.
- [x] 1.3 Add `wishlist.updateDesign` protected mutation: verify ownership, update only design columns regardless of `status`, and revalidate the public wishlist page (path/tag for the slug).
- [x] 1.4 Add router tests for `getById` (owner ok / non-owner rejected / missing) and `updateDesign` (owner saves, published updates, non-owner rejected, revalidation triggered).

## 2. Detail navigation (7.3)

- [x] 2.1 Add `WishlistDetailNav` client component in `src/components/layouts/dashboard/` with the static nav items (Resumen `""`, Regalos `gifts`, Diseño `design`, Configuración `settings`) mapped to `/dashboard/wishlists/[id]/<segment>`.
- [x] 2.2 Render tabs at `md`+ (`hidden md:flex`) with active-state from `usePathname()`; reuse the repo's `Tabs`/`ui` primitives if present.
- [x] 2.3 Render a `Select` dropdown below `md` (`md:hidden`) that navigates via `useRouter()` and shows the active section as the selected value.
- [x] 2.4 Add `src/app/(protected)/dashboard/wishlists/[id]/layout.tsx` (RSC) that reads `params.id` and renders `WishlistDetailNav` around `children`.

## 3. Design page (7.4)

- [x] 3.1 Add a preview adapter mapping a persisted wishlist to the `draftToPreview` input shape, with a unit test.
- [x] 3.2 Add `WishlistDesignEditor` client component in `src/components/features/dashboard/design/` with theme (7 presets), layout, font, and button-style selectors plus `ImageUpload` cover upload/remove, initialized from the wishlist's current values.
- [x] 3.3 Render the embedded live preview (`PublicWishlistPage` via the adapter) that reacts to selection changes before save.
- [x] 3.4 Wire save through `api.wishlist.updateDesign` (`@/trpc/react`) with pending/success/error feedback.
- [x] 3.5 Add `src/app/(protected)/dashboard/wishlists/[id]/design/page.tsx` (RSC) that fetches via `api.wishlist.getById`, `notFound()` on failure, and renders `WishlistDesignEditor`.

## 4. Validation

- [x] 4.1 Run `pnpm check`, `pnpm test`, and `pnpm typecheck`; fix any failures.
- [x] 4.2 Manually verify: nav switches sections on desktop and mobile with active indication; design edits preview live and persist; a published wishlist's public page reflects saved design.
