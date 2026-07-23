# Proposal: expand-design-customization

## Why

The public wishlist page currently offers only 3 layouts, 7 color themes, 3 font pairings, 2 button styles, and a single cover image — and the button-style setting is broken (its CSS vars only reach `GiftCard` buttons; hero CTAs ignore them and `--public-btn-border-width` is never consumed). The Claude Design project now ships 14 new `PublicWishlistPage` layout explorations (sections "§3+ · 10 layout explorations — fila 1/fila 2" and "§3+ · 4 exploraciones nuevas — carrusel · lista de regalos lúdica") plus carousel components, so owners can get far more expressive pages. Step 3 of the wizard must scale to present all of it.

## What Changes

- **14 new public layouts** implemented from the design file: `hero-cinematic`, `split-image-right`, `arch-split`, `collage-staggered`, `magazine-editorial`, `overlap-duo`, `arch-hero-party`, `arch-trio`, `wedding-formal`, `panoramic-band`, `carousel-hero`, `diagonal-duo`, `scrapbook-polaroids`, `portrait-frame-split`. Existing `grid`/`editorial`/`minimal` remain functional but move to the bottom of the picker and are flagged as **tech debt to remove before PROD launch**.
- **New Disposición picker**: text chips replaced by a 2-column thumbnail grid of abstract skeleton previews (arch, collage, split…) + name label, used in both wizard step 3 and the dashboard Diseño editor.
- **Tema de color grows 7 → 12**: existing presets plus 5 new families designed under the same system (near-white background, tinted ink foreground, soft primary, ≥ 4.5:1 contrast): `terracota-calida`, `menta-fresca`, `noche-azul`, `sol-dorado`, `coral-vivo`. Swatch row becomes a fixed-column grid (6 cols desktop / 4 mobile).
- **Typography splits into two selects**: heading font (Lora, Playfair Display, Cormorant Garamond, DM Serif Display, Inter, Nunito) and body font (Inter, Nunito, Figtree, Source Serif 4, Karla), all via `next/font/google`. Legacy `fontPairing` values map: `serif-soft` → Lora+Inter, `sans-modern` → Inter+Inter, `rounded-friendly` → Nunito+Nunito.
- **Multiple cover images (max 6)**: new `Wishlist.coverImageUrls String[]` (ordered); existing `coverImageUrl` copied in as first element and kept until pre-PROD cleanup. Upload UI supports add/remove/reorder. Layouts with galleries show a carousel when 2+ images exist; fixed-slot layouts (CollageStaggered/ArchTrio = 3, OverlapDuo = 2) fill missing slots with the theme's tinted placeholder.
- **Button styles fixed and expanded to 4**: Píldora (999px) · Redondeado (12px) · Cuadrado (4px, weight 600) · Contorno (pill, transparent bg, 1.5px border). The style vars apply to **all** public buttons (hero CTAs, gift cards, modal, chips as appropriate), and each picker chip renders in its own style as a live preview.
- **Event-type default layouts re-seeded** to new layouts per the design file's event tags (e.g. Boda → `hero-cinematic`, Baby Shower → `collage-staggered`, Cumpleaños → `arch-split`, Nuevo hogar → `split-image-right`, General → `magazine-editorial`), so new wishlists never start on a deprecated layout.

## Capabilities

### New Capabilities

_None — all changes extend existing capabilities._

### Modified Capabilities

- `public-wishlist-layout`: layout variant catalog grows from 3 to 17 (14 new + 3 legacy); layouts gain hero gallery/carousel/fixed-slot image behavior; legacy 3 deprecated.
- `public-theme-config`: theme catalog 7 → 12; font pairing preset replaced by independent heading/body font presets with legacy mapping; button style catalog 2 → 4 with corrected var propagation scope.
- `creation-wizard`: step 3 Disposición becomes a thumbnail-grid picker; Tema de color becomes a fixed-column grid; Tipografía becomes two selects; Estilo de botón chips render self-previews; Imagen de portada becomes multi-image manager.
- `image-upload`: cover image upload supports up to 6 ordered images with add/remove/reorder; persistence moves to `coverImageUrls`.
- `event-type-presets`: default layout ids re-point to new layouts.

## Impact

- **Prisma schema**: add `Wishlist.coverImageUrls String[] @default([])`, `headingFont String?`, `bodyFont String?` + migration backfilling from `coverImageUrl`/`fontPairing`. Legacy columns (`coverImageUrl`, `fontPairing`) kept until pre-PROD cleanup (tech debt).
- **Config**: `src/config/public-layouts.ts`, `public-themes.ts`, `public-fonts.ts`, `public-button-styles.ts` all grow/reshape; `event-type-presets.ts` defaults change.
- **Components**: 14 new layout components under `src/components/layouts/public-wishlist/`; new layout thumbnail picker; multi-image upload manager; carousel usage (`src/components/ui/carousel.tsx` exists); `PublicThemeProvider` gains font vars; all public button surfaces consume `--public-btn-*` vars.
- **tRPC/validation**: `saveDraft` / wishlist update inputs accept `coverImageUrls[]`, `headingFont`, `bodyFont`; wizard store draft shape and `draftToPreview` / view models extend.
- **Fonts**: 9 distinct Google font families loaded via `next/font` on public pages (weight subsetting required to control payload).
- **Tech debt registered**: remove `grid`/`editorial`/`minimal` layouts, `coverImageUrl`, and `fontPairing` before PROD launch (tracked in `docs/FUTURE_IMPROVEMENTS.md`).
- **No breaking change** for existing published wishlists: unknown/legacy ids keep resolving via fallbacks; legacy layouts still render.
