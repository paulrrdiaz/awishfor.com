## Context

The wizard foundation (archived `add-creation-wizard-foundation`) shipped:
- A Zustand draft store (`src/stores/wishlist-wizard.store.ts`) persisted to `localStorage`, with `copyTouched` tracking and stale-draft recovery.
- A `/create` route + shell that routes by `?step=` and renders the single Event Type step.
- Event-type presets (`src/config/event-type-presets.ts`) with categories, copy templates, default theme/layout, and `sampleGifts`.

This change adds the three remaining content steps. The wizard remains **unauthenticated-first**: everything lives in the local draft; nothing touches the DB. The reusable public rendering stack already exists — `PublicWishlistPage` accepts a `mode` (`"full" | "preview" | "compact"`) and a `PublicWishlistViewModel`, resolves theme/layout/font/button from `src/config/public-*`, and disables purchase actions in `preview` mode. The slug pipeline (`slugify`, `isValidSlug`, `wishlistSlugPattern`, `checkSlugAvailability` service) also exists, but the tRPC `checkSlugAvailability` procedure is currently `protectedProcedure`.

## Goals / Non-Goals

**Goals:**
- Capture all draft fields the public wishlist needs: details (title, display name, event date/time/location), slug, design (theme/layout/font/button), and a local list of gifts.
- Live design preview that reuses the real public layout and falls back to preset `sampleGifts` before real gifts exist.
- Let a signed-out user check slug availability against the DB.
- Multi-step navigation across `event-type → details → design → gifts`.

**Non-Goals:**
- DB persistence / save-draft (3.7) and publish/auth-gate (3.8).
- Real URL import (Milestone 4.1) — only a placeholder entry point here.
- Cover-image upload (UploadThing, Milestone 4.3) — disabled placeholder only.
- Drag-and-drop gift ordering as a polished feature (dashboard-first; basic local reorder only).

## Decisions

### 1. Slug availability check becomes a `publicProcedure`
The wizard runs signed-out, so the existing `protectedProcedure` cannot be called. The underlying `checkSlugAvailability` service returns only `{ available }` / `{ available: false, reason: "invalid" | "taken" }` — no user-identifying data — so exposing it publicly leaks nothing. **Alternative considered:** a separate public procedure that duplicates the call; rejected as needless duplication. Client uses `use-debounce` (~400ms) to debounce the query as the user types; UI states map directly from the result plus a Checking state while the query is in flight and an Invalid state from client-side `isValidSlug` before any request.

### 2. Slug auto-generation, decoupled from manual edits
Slug auto-fills from the title via `slugify` until the user edits the slug field; after a manual edit, the slug stops tracking the title (a `slugTouched` flag, mirroring the existing `copyTouched` pattern). This avoids clobbering a deliberately chosen slug.

### 3. Draft store extension
Add to `WishlistDraft`: `title`, `slug`, `displayName`, `eventDate` (ISO `string | null`), `eventTime` (`HH:mm | null`), `eventLocation`, `coverImageUrl`, `buttonStyle`, `fontPairing`, `showHowItWorks`, and `gifts: DraftGift[]`. Add `slugTouched` alongside `copyTouched`. A `DraftGift` carries a client-generated `id` (`crypto.randomUUID()`), `name`, `productUrl`, `imageUrl`, `priceAmount` (number | null), `category` (the draft category **name**, since draft categories are a `string[]` with no ids), `quantityNeeded`, `priority` (`GiftPriority`), `publicNote`, `internalNote`, `hidden` (boolean), and `sortOrder`. New actions: `addGift`, `updateGift`, `removeGift`, `reorderGifts`. Dates are stored as strings to keep the persisted JSON serializable.

### 4. Client draft → preview view-model mapper
A pure client helper (`src/lib/wishlist/draft-to-preview.ts`) maps the draft to a `PublicWishlistViewModel` for `PublicWishlistPage mode="preview"`. Draft categories (`string[]`) become synthetic `PublicCategoryViewModel`s with `id = name`; gifts map to `PublicGiftViewModel`s referencing that synthetic category id, hidden gifts excluded. When the draft has no visible gifts, the preset's `sampleGifts` are mapped to placeholder gift view-models so the layout is never empty. Progress is computed locally (all units available, none purchased).

### 5. Multi-step shell navigation
Extend `WizardShell` `STEPS` to `["event-type", "details", "design", "gifts"]`, keep `?step=` routing with first-step fallback, and add Back/Next controls that update the query param. Step order is linear; no hard gating between steps in this slice (gating is a publish concern, 3.8).

## Risks / Trade-offs

- **Making slug check public could be probed to enumerate taken slugs.** → The data (a boolean "taken") is already implied by visiting a public wishlist URL; acceptable. Rate limiting is a later concern (5.5) and can wrap this procedure then.
- **Local draft gifts have no real category ids**, so wiring to DB categories later (3.7) needs a name→id reconciliation. → Acceptable; documented here and isolated to the save-draft slice.
- **Preview mapper drifting from the server mapper shape.** → Mitigate by typing the helper's return against the shared `PublicWishlistViewModel`; a type error surfaces drift at build time.
- **Date/time stored as strings** must round-trip through the Calendar/Popover correctly across timezones. → Store the date as a date-only ISO string and treat it as wall-clock (no time component); the separate `eventTime` holds `HH:mm`.

## Open Questions

- None blocking. Cover-image upload and real URL import are deferred by design to Milestone 4.
