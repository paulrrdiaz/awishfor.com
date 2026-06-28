## Why

The Claude Design brief landed after several features were already built, adding a set of design and copy refinements to items in `docs/TASKS.md` that were otherwise complete. Eight items now sit partially-checked. Closing these design-driven gaps lets us mark those items fully done and brings the implemented surfaces in line with the brief — without starting new feature milestones.

## What Changes

- **Wishlist data model (1.2)**: Add optional `dressCode` plain-text field powering the "Código de vestimenta" details card.
- **Public wishlist layout (3.4)**: Add the event-details section (3 cards: Fecha · Lugar · Código de vestimenta, hiding empty cards); add countdown states (`Faltan N días` · `Falta 1 día` · `Es hoy` · post-event "Gracias por celebrar con nosotros."); de-emphasize purchased gifts (~60% opacity + line-through name, sorted below available).
- **Public gift filters (3.5)**: Render filter chips as a scroll-snap toggle group with `aria-pressed`, selected chip inverted (`bg-foreground text-background`); use the exact empty-filter copy from the brief.
- **Event-type presets (4.1)**: Align default theme/layout per event type to the brief table (Baby Shower → Cielo Suave + Editorial; Birthday → Lavanda Fiesta + Galería; Wedding → Crema Elegante + Editorial; Housewarming → Jardín Verde + Lista Minimal; General → Clásico Minimal + Galería).
- **Wizard Details step (4.4)**: Add optional dress-code field; use exact slug-state copy (`◌ Verificando…` · `✓ Disponible` · `✕ Ya está en uso` · `✕ Solo letras, números y guiones`); use exact past-date warning copy.
- **Wizard Design step (4.5)**: Label the embedded preview "Vista previa con ejemplos"; show all seven theme swatches including `cielo-suave-rosa`.
- **Wizard Publish step (4.8)**: Label the final preview "Vista previa de tu wishlist" and auth-gate copy "tu progreso ya está guardado"; render publish-success copy with five actions (Copiar enlace · Compartir por WhatsApp · Descargar QR · Ver lista pública · Gestionar en dashboard).
- **Guest purchase modal (6.2)**: Render as a bottom sheet on mobile and a centered dialog ≥ md with a sticky 48px footer; show exact consent copy.

## Capabilities

### New Capabilities

_None — all changes refine existing capabilities._

### Modified Capabilities

- `wishlist-lifecycle`: Wishlist event details gain an optional `dressCode` field.
- `public-wishlist-layout`: Adds an event-details section requirement, expands countdown states, and adds purchased-gift de-emphasis/sorting.
- `public-wishlist-filters`: Status filters become an accessible scroll-snap toggle group; empty-filter states use exact brief copy.
- `event-type-presets`: Preset catalog pins a default theme + layout per event type matching the brief.
- `creation-wizard`: Details, Design, and Publish steps gain the dress-code field, exact slug/past-date/preview/auth/success copy, and the seven-swatch theme picker.
- `public-wishlist-page`: Guest purchase modal gains responsive bottom-sheet/dialog behavior and exact consent copy.

## Impact

- **Schema**: `prisma/schema.prisma` (Wishlist `dressCode`), one Prisma migration, `src/generated/prisma` regenerated.
- **Validators/services/mappers**: `wishlist.schema.ts`, `wishlist.service.ts`, public/dashboard wishlist mappers (carry `dressCode`).
- **Config**: `src/config/event-type-presets.ts`, `src/config/public-themes.ts` (swatch metadata if needed).
- **UI**: public layout + countdown + gift card/list components, `public-filters.tsx`, wizard `details-step` / `design-step` / `publish-step`, `purchase-gift-modal.tsx`.
- **No new env vars, no new dependencies, no breaking changes.** Source of truth for all copy strings is `docs/TASKS.md` (the brief's `.md`/`.dc.html` files are not in-repo).
