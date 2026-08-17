## Why

Guests who want to send a gift directly to the host's home have nowhere to find the address — they have to ask over WhatsApp, which breaks the flow and pushes the transaction off the product. The design project settled this in `PublicWishlistPages.dc.html` (proposal `2f`, "Posdata dentro de la tarjeta de mensaje"): the shipping details ride along as a discreet postscript inside the welcome message card the host already writes, rather than as a new section competing for attention.

## What Changes

- Hosts can record three optional delivery fields on a wishlist — recipient name, address, and phone — edited in the wishlist settings form beside the existing welcome copy.
- The public wishlist page renders those details as a postscript inside the welcome message card, on every existing welcome variant (`postcard`, `handwritten`, `avatars`). This is a shared optional slot, **not** a fourth variant — `WELCOME_VARIANT_IDS` is unchanged.
- The postscript reads `P.D. — si prefieres enviarlo a casa: {name}, {address} · {phone}` with a single copy-to-clipboard action that copies the composed string.
- The "Regalar" purchase modal shows the same details as a contained block in its `form` phase, so a guest who has just committed to a gift can copy the address without leaving the dialog.
- The details are visible to anyone who opens the public wishlist URL, not only to invited guests on the personalized route.
- Fields degrade individually, with `deliveryAddress` as the anchor: with no address, nothing renders anywhere. The fixed copy promises a home to send to, so the block never appears without one.
- **BREAKING** `Wishlist.welcomeMessage` becomes non-nullable. Existing rows are backfilled from the per-event-type preset copy, the settings and wizard forms block an empty submit with a visible error, and the server fills an empty value with the preset default as a backstop. The welcome card is now guaranteed to exist, which is what gives the postscript somewhere to live.

### Non-goals

- The welcome message **attribution drift** is explicitly out of scope. The design renders attribution as an eyebrow *above* the quote with per-variant copy (`De X & Y`, `X & Y escriben`), while the code renders `— {attribution}` below it; `avatars` has no attribution text at all. Realigning that is a separate change.
- The four delivery fields the round-1 design proposals explored but the shipped design dropped — DNI, email, and delivery notes — are not added.
- Delivery fields are not added to the creation wizard's details step. Only the `welcomeMessage` validation touches the wizard.

## Capabilities

### New Capabilities

- `wishlist-delivery-info`: Optional per-wishlist delivery details (recipient name, address, phone), their composition and degradation rules, the address-as-anchor gate, and their presentation as a welcome-card postscript and a purchase-modal block.

### Modified Capabilities

- `public-message-variants`: The three welcome variants gain a shared optional postscript slot, and the graceful-degradation requirement extends to cover a missing or partial delivery block.
- `wishlist-settings`: The settings form gains the three delivery fields, and `welcomeMessage` changes from optional to required with a visible validation error.
- `public-wishlist-page`: The guest purchase modal gains the delivery block in its form phase.
- `creation-wizard`: The Event Details step blocks an empty welcome message.

## Impact

**Schema and data.** `prisma/schema.prisma` — three new nullable `String` columns on `Wishlist` following the `eventLocation`/`dressCode` idiom, plus `welcomeMessage String? → String`. The migration must backfill before the `NOT NULL` alter, and its predicate must cover empty strings as well as nulls (the wizard store seeds `welcomeMessage: ""` and `save-draft.ts` sends it raw). A Prisma migration is SQL and cannot call `EVENT_TYPE_PRESETS`, so the preset copy is inlined into the migration.

**Server.** `src/server/validators/wishlist.schema.ts` (three field schemas; `wishlistWelcomeMessageSchema` becomes required, with the empty-value default applied where the shared create/update shape is consumed) · `src/server/services/wishlist.service.ts` · `src/server/mappers/{public-wishlist,dashboard-wishlist}.mapper.ts` · `src/server/mappers/view-models.ts` (two view models carry `welcomeMessage: string | null`).

**Draft pipeline.** `src/lib/wishlist/{draft-to-preview,persisted-to-preview,save-draft}.ts`. The shared `wishlistCreateUpdateShape` serves both create and update, so partial draft saves flow through the same validator — the server-side default is what keeps them working.

**UI.** `src/components/features/dashboard/settings/wishlist-settings-form.tsx` (input) · `src/components/shared/wishlist-message.tsx` (all three variants) · a new small client `CopyButton`, isolated the way `countdown.tsx` is, so the message component stays a server component · `src/components/features/wishlist/purchase-gift-modal.tsx` and `public-filters.tsx` (neither receives wishlist-level data today; the details thread down from the four call sites that already render both) · `src/components/features/wizard/details-step.tsx` (welcome message validation only).

**Render sites.** `public-wishlist-body.tsx`, `split-image-right-layout.tsx`, `collage-staggered-layout.tsx`, `arch-trio-layout.tsx` — the same four files render `WishlistMessage` and `PublicGiftFilters`, so both the postscript data and the modal data arrive through one prop addition per file. Each guards on `wishlist.welcomeMessage &&`; `arch-trio-layout.tsx` uses a ternary whose else branch becomes unreachable once the field is non-nullable.

**Fixtures and tests.** `src/config/demo-wishlist.ts`, `src/components/shared/wishlist-message.{test,stories}.tsx`. Every mapper, service, and validator in scope already has a test file.

**Accepted interim consequence.** Because the attribution realignment ships separately and later, the `postcard` card will temporarily read quote → `— Ana & Diego` → postscript, with the attribution sandwiched between the quote and the postscript. The design never specifies that arrangement; it is accepted for the duration between the two changes rather than discovered mid-implementation.

**Assumption, not a ratified decision.** A single shared `CopyButton` serves both the hero postscript and the modal block. If the two surfaces need to diverge, this is the seam that gives.
