## Context

The wizard ships five steps today (`event-type`, `details`, `design`, `gifts`, `publish`) against a `Wishlist` row that accumulated three name columns and two cover-image columns. `Wishlist Wizard.dc.html` replaces that with eight steps, one name, and an image step that classifies photos by orientation — none of which the current schema can express. Orientation is already computed in `multi-image-upload.tsx` via `getImageOrientation(width, height)` and then discarded after a transient mismatch warning.

Two facts shape the plan. First, `resolveLayout()` and `resolveTheme()` fall back to defaults silently, so removing presets never throws — it quietly restyles a page instead, which is why the trim has to be deliberate rather than incidental. Second, there is no production data, so the migration can be destructive and single-phase.

This change is the data half. The eight-step wizard lands separately in `redesign-wishlist-wizard`; the five current steps must keep working end to end when this one merges.

## Goals / Non-Goals

**Goals:**

- One wishlist name (`title`) across dashboard, wizard and public page.
- Cover images as records carrying dimensions and orientation, so a layout can ask for the photo shapes it renders.
- Layout and theme catalogs matching what the design ships: nine and seven.
- Per-occasion sample cover images available to preview surfaces.
- Every surviving layout renders date, venue and dress code, which the hero no longer carries.
- The five existing wizard steps still work when this change merges.

**Non-Goals:**

- The eight-step wizard, the segmented stepper, sample-image previews in wizard UI, and layout-driven image minimums.
- Adding an `images` gate to publish readiness.
- Raising the six-image cap. The design suggests 4–8 photos; that copy and limit belong with the redesigned images step.
- Any dashboard gift-management move.

## Decisions

### Collapse three name columns into `title`

`title` becomes the single name: what the owner sees in their dashboard and what guests read as the hero heading. `displayName` and `heroTitle` are dropped.

The design is explicit — step 2's hint reads *"Así la identificas en tu panel y así la verán tus invitados — un solo nombre para ambos."* Keeping `heroTitle` instead was considered, since it is the field public layouts already render, but `title` is the one every dashboard list, mapper and validator already keys on, so collapsing onto it touches less. Collapsing only in the wizard while leaving the columns was rejected: it preserves exactly the confusion the design removes.

Consequence: `defaultHeroTitleTemplate` loses its only consumer and is dropped from the presets, along with the `{name}` substitution helper and the `heroTitle` entry in `copyTouched`. Picking an occasion no longer writes a name.

### Cover images become `WishlistImage` records

```prisma
enum ImageOrientation { landscape portrait square }

model WishlistImage {
  id          String           @id @default(cuid())
  wishlistId  String
  wishlist    Wishlist         @relation(fields: [wishlistId], references: [id], onDelete: Cascade)
  url         String
  width       Int
  height      Int
  orientation ImageOrientation
  sortOrder   Int              @default(0)
  createdAt   DateTime         @default(now())

  @@index([wishlistId])
  @@index([wishlistId, sortOrder])
}
```

A `Json` column was the cheap alternative and a pair of parallel per-orientation arrays the naive one. The table wins because orientation is about to become a query-shaped concern — the redesigned images step groups by it, layouts request slots by it, and publish readiness will count by it. Rows also give ordering and cascade deletion for free, matching how `Category` and `Gift` already hang off `Wishlist`.

`coverImageUrl` disappears with `coverImageUrls`; it was only ever a mirror of the first element, and `withCoverImageUrlMirror()` goes with it.

### Orientation is classified once, at add time

`getImageOrientation()` moves out of `multi-image-upload.tsx` into a shared module so the store, the mappers and the tests can all reach it, keeping the 0.15 square deadband. The browser measures `naturalWidth`/`naturalHeight` on the accepted file and submits them with the hosted URL.

Deriving orientation at render time was rejected: it would mean either fetching every image to measure it or trusting a URL query string. Measuring once is also what makes an unsaved draft previewable without a round trip.

An image whose dimensions cannot be read is rejected rather than stored with zeros, because a zero-dimension record would classify as neither orientation and silently break slot filling.

### Hard-delete retired presets instead of flagging them

`PublicLayoutPreset` already carries a `deprecated` flag, and the existing `public-wishlist-layout` spec uses it to keep `grid`, `editorial` and `minimal` alive while recording their removal as pre-PROD debt in `docs/FUTURE_IMPROVEMENTS.md`. This change is that debt coming due, so the flag mechanism is not reused — the eight layouts and five themes are deleted along with their components, tests and stories, and the debt entry is cleared.

Retired: `hero-cinematic`, `arch-split`, `wedding-formal`, `panoramic-band`, `diagonal-duo`, `grid`, `editorial`, `minimal`; themes `terracota-calida`, `menta-fresca`, `noche-azul`, `sol-dorado`, `coral-vivo`.

Both defaults survive (`DEFAULT_LAYOUT_ID = "magazine-editorial"`, `DEFAULT_THEME_ID = "cielo-suave"`), so the fallback path stays valid. Two event-type presets do not: `birthday` points at `arch-split` and `wedding` at `hero-cinematic`. They move to `arch-hero-party` and `carousel-hero` — the party arch and the carousel the design's own step-4 preview uses for a wedding.

### `EventDetails` gets wired into all nine layouts

Dropping `displayName` empties the hero subtitle in five surviving layouts (`carousel-hero`, `split-image-right`, `arch-trio`, `arch-hero-party`, `scrapbook-polaroids`). Rather than invent a replacement subtitle, the hero shows the title alone and the existing `src/components/shared/event-details.tsx` — Fecha, Lugar, Código de vestimenta cards — is wired into every layout.

That component exists and is spec'd, but is currently rendered only by `grid`, `editorial` and `minimal`, all three retired. Without this wiring the trim would silently delete the only place date, venue and dress code appear.

A derived `eventType · fecha · lugar` subtitle was considered and dropped: it duplicates the cards for no gain.

### Sample cover images live in the presets, not the database

`EVENT_TYPE_PRESETS` grows `sampleCoverImages`, grouped so landscape and portrait can be requested separately, each entry carrying the same url/width/height/orientation shape as a real image. This mirrors the `sampleGifts` convention that `draftToPreview()` already uses to keep an empty preview from looking broken.

They are Unsplash URLs; `images.unsplash.com` is already in `next.config` `remotePatterns`, so no configuration changes. Nothing consumes them in this change — they are the foundation the redesigned layout and image steps preview against.

Samples are strictly a preview device. The hero gallery fills unfilled slots with the theme's tinted placeholder, never with sample photography, so stock images cannot reach a published page.

### The five wizard steps stay

The wizard's step list, routes and stepper are untouched. `details-step.tsx` loses its display-name field and `design-step.tsx` works against image records, but the shape of the flow is change 2's problem. This keeps `/create` continuously shippable.

## Risks / Trade-offs

- **Deleting eight layout components may orphan or break shared helpers they co-own** → Run `codegraph_impact` on each component before deleting, not after. Spot-checked so far: `wedding-formal-layout.tsx`'s `initialsFrom` is file-local with no other callers, so it leaves cleanly.
- **The store version bump discards in-progress local drafts** → Only developer and tester drafts exist. The migration is written to drop unmappable values rather than throw, so a stale `localStorage` entry degrades to an empty wizard instead of a crash loop.
- **Hotlinked Unsplash samples can rot or rate-limit** → They are preview-only and never persisted to a wishlist, so a dead sample degrades a preview rather than a published page. If they prove flaky, the URLs can be swapped for self-hosted assets without touching the contract.
- **Dimension capture adds a failure mode to an upload path that previously could not fail this way** → The control rejects unmeasurable files with a friendly error, matching how it already handles type and size rejections.
- **A destructive migration is unrecoverable if the "no production data" assumption is wrong** → Confirm the target database is empty of real wishlists immediately before running it; the check is cheap and the assumption is the whole basis for the single-phase plan.
- **Trimming the catalogs narrows creative range for occasions the survivors serve less well** → Accepted: the design chose these nine and seven, and the retired presets can be reintroduced later as additions rather than resurrections.

## Migration Plan

One Prisma migration, applied in a single deploy:

1. Create the `ImageOrientation` enum and the `WishlistImage` table.
2. Drop `Wishlist.displayName`, `heroTitle`, `fontPairing`, `coverImageUrl`, `coverImageUrls`.
3. Regenerate the client (`pnpm prisma generate`) — remember the client lands in `src/generated/prisma`, not `node_modules`.

No backfill runs, because there is no data to carry. Rollback is `prisma migrate resolve` plus a revert of the code change; the dropped columns hold nothing worth recovering.

Order of work matters more than the migration itself: config trim and schema first, then validators and mappers, then the store, then UI, then tests. Typechecking will be red in between, which is expected and is why the tasks are sequenced rather than parallel.

## Open Questions

- None blocking. The six-image cap, the layout-driven image minimums, and the publish-readiness `images` check are all deliberately deferred to `redesign-wishlist-wizard`.
