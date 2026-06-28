## Why

The wishlist detail area (`/dashboard/wishlists/[id]`) has standalone gift and category pages but no shared navigation wrapping them, so owners cannot move between the wishlist's sections (Resumen, Regalos, Diseño, Configuración). It also has no way to change a wishlist's visual design after creation — design is only selectable once, inside the creation wizard. Owners need to refine theme, layout, fonts, button style, and cover image on an existing (including published) wishlist.

## What Changes

- Add a shared wishlist-detail layout (`[id]/layout.tsx`) that renders section navigation around all detail pages.
- Navigation shows tabs on desktop/tablet (≥ md) and collapses to a `Select` dropdown below md, with the active section clearly indicated.
- Navigation items: **Resumen** (`[id]`), **Regalos** (`[id]/gifts`), **Diseño** (`[id]/design`), **Configuración** (`[id]/settings`).
- Add a dashboard design page (`[id]/design/page.tsx`) letting the owner edit the persisted wishlist's design: theme (all seven presets), layout, font pairing, button style, and cover image (upload/remove), with an embedded live preview.
- Add an `updateDesign` tRPC mutation that persists design-only fields for an existing wishlist (works for draft and published) and revalidates the public page.
- Reuse existing design catalogs (`public-themes`, `public-layouts`, `public-fonts`, `public-button-styles`), the `ImageUpload` component, and the `draftToPreview` → `PublicWishlistPage` preview pipeline already used by the creation wizard.

## Capabilities

### New Capabilities
- `wishlist-detail-navigation`: Shared section navigation for the wishlist detail area — responsive tabs/select, active-state indication, and the canonical nav item → route mapping.
- `wishlist-design-editing`: Owner edits a persisted wishlist's design (theme, layout, font, button style, cover image) with live preview and saves changes that the public page reflects.

### Modified Capabilities
<!-- None. Design catalogs (public-theme-config) and view models are reused as-is, not changed at the requirement level. -->

## Impact

- **Routes/pages**: new `src/app/(protected)/dashboard/wishlists/[id]/layout.tsx`, new `src/app/(protected)/dashboard/wishlists/[id]/design/page.tsx`. Assumes the Resumen route (`[id]/page.tsx`, task 7.2) and Configuración route (`[id]/settings`, task 7.5) exist or are stubbed; nav links to them regardless.
- **Components**: new `src/components/layouts/dashboard/*` (detail nav) and `src/components/features/dashboard/design/*` (design editor).
- **API**: new `updateDesign` mutation in `src/server/api/routers/wishlist.ts`; new design-only validator (subset of the save-draft design fields).
- **Reused**: `src/config/public-{themes,layouts,fonts,button-styles}.ts`, `src/components/features/wishlist/image-upload.tsx`, `src/lib/wishlist/draft-to-preview.ts`, `src/components/layouts/public-wishlist/public-wishlist-page.tsx`.
- **Data/schema**: none — design fields (`themeId`, `layoutId`, `fontPairing`, `buttonStyle`, `coverImageUrl`) already exist on `Wishlist`.
