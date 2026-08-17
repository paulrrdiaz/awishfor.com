## Context

See `proposal.md` — Why. The constraints that shape the approach:

- `src/components/shared/wishlist-message.tsx` is a server component holding all three welcome variants (`Postcard`, `Handwritten`, `Avatars`). The copy action needs `navigator.clipboard` and transient state.
- `PurchaseGiftModal` receives only `{gift, open, onOpenChange, debugState}`; `PublicGiftFilters` receives no wishlist-level data. Neither can reach delivery details today.
- `wishlistCreateUpdateShape` (`src/server/validators/wishlist.schema.ts`) is a single shape serving both create and update, so draft saves and settings saves pass through the same validator. Anything made required there is required for partial draft saves too.
- The wizard store seeds `welcomeMessage: ""` and `save-draft.ts` forwards it unchanged, so existing rows may hold `''` as well as `NULL`.
- `EVENT_TYPE_PRESETS` is a TypeScript constant. A Prisma migration is SQL and cannot call it.
- Four files render both `WishlistMessage` and `PublicGiftFilters`: `public-wishlist-body.tsx`, `split-image-right-layout.tsx`, `collage-staggered-layout.tsx`, `arch-trio-layout.tsx`.

## Goals / Non-Goals

**Goals:**

- One composition/gating implementation shared by both surfaces, so the hero postscript and the modal block can never disagree about what a wishlist's delivery line says.
- Keep `wishlist-message.tsx` a server component.
- Make `welcomeMessage` genuinely non-empty in the database without breaking partial draft saves.
- Add the data to the modal through the same prop path the postscript already needs, not a second one.

**Non-Goals:**

- No new tRPC procedure. Delivery details ride the existing wishlist read and `updateSettings` write.
- No client-side data fetching in the modal. The details arrive as props from the server-rendered page.
- No change to `WELCOME_VARIANT_IDS` or the variant picker.

## Decisions

### Delivery details travel as one derived value, not three raw fields

The mapper exposes the three raw fields on the view model, but composition and gating live in one pure helper (`src/lib/format/delivery.ts` or similar) that takes the three optional fields and returns either `null` or `{ line, recipientName, rest }`. Returning `null` when the address is absent puts the anchor rule in one testable place instead of duplicating `address && …` at two render sites.

Rejected: composing in the mapper and shipping only a string. The postscript emphasizes the recipient name (`<b>`) while the copy action copies the flat line, so the render needs the parts and the clipboard needs the whole. A pure helper returning both keeps the mapper dumb and the rule unit-testable without React.

### `CopyButton` is the only client component added

A small `"use client"` component owning `navigator.clipboard.writeText`, the copied flag, and the 1500ms revert. `wishlist-message.tsx` and `purchase-gift-modal.tsx` both render it. This mirrors how `countdown.tsx` is isolated so its parent layouts stay server components.

Rejected: adding `"use client"` to `wishlist-message.tsx`. It would push all three welcome variants and everything they import across the boundary for one button.

Note: `purchase-gift-modal.tsx` is already a client component, so it gains nothing from the isolation — the shared button exists for consistency of behavior (same label copy, same revert timing), not for boundary reasons there. This is the assumption flagged in the proposal; if the two surfaces need different affordances later, this is the seam that splits.

### Prop threading, not context

`PublicWishlistViewModel` already reaches all four render sites. Each passes the composed delivery value down to `PublicGiftFilters`, which forwards it to `PurchaseGiftModal`. Four one-line prop additions in files this change already edits for the postscript.

Rejected: a React context provider for delivery details. Four call sites do not justify a provider, and `PublicThemeProvider` already wraps this tree — adding a second provider for three optional strings is heavier than the prop.

### `welcomeMessage`: client validation for the human, server default for the machine

The two halves are not redundant, they cover different callers:

- **Client** (`wishlist-settings-form.tsx`, `details-step.tsx`): blocks an empty submit with a visible field error. This is what tells the host the field matters. Without it the server would silently swap in preset copy and the host would not know their edit was discarded.
- **Server**: where the shared create/update shape is consumed, an empty or whitespace-only `welcomeMessage` is replaced with `EVENT_TYPE_PRESETS[eventType].defaultWelcomeMessage` before the write. This keeps partial draft saves working and guarantees the column invariant against any caller that bypasses the form.

The validator itself stays permissive on input and the substitution happens in the service layer, because making `wishlistWelcomeMessageSchema` reject empty would break draft saves at the shape both paths share.

Rejected: splitting `wishlistCreateUpdateShape` into draft and publish variants so the validator can reject empty on the publish path. It fragments a shape that is deliberately shared and pushes the requirement into two places that can drift.

Rejected: a publish-readiness gate instead of `NOT NULL`. The column invariant is what lets the postscript assume a card exists; a readiness check leaves drafts and any direct write able to produce a wishlist with no welcome card.

### Migration order

Backfill first, then alter. One migration, two statements:

1. `UPDATE "Wishlist" SET "welcomeMessage" = CASE "eventType" WHEN … END WHERE "welcomeMessage" IS NULL OR trim("welcomeMessage") = ''` — the five preset strings inlined as SQL literals.
2. `ALTER TABLE "Wishlist" ALTER COLUMN "welcomeMessage" SET NOT NULL`.

Inlining the preset copy is correct rather than unfortunate: migrations are frozen history, so a migration that read the current `EVENT_TYPE_PRESETS` would produce different results depending on when it ran.

The `trim(…) = ''` half of the predicate is load-bearing. A backfill keyed only on `IS NULL` would leave `''` rows in place, and `''` satisfies `NOT NULL` — the alter would succeed and the invariant would be false from day one.

### Divider treatment per variant

The shipped design shows two separations. Assigning them now so implementation does not guess:

- `postcard` and `handwritten` — bare top margin (`margin-top:10px` equivalent), matching the majority of design instances. `postcard` already has a short rule under the quote, so a second border would double up.
- `avatars` — top padding plus a top border (`padding-top:14px; border-top:1px solid var(--border)`), matching the one design instance that carries it; that variant has no rule of its own, so the postscript needs its own separation.

## Risks / Trade-offs

**The backfill writes generic copy into wishlists whose hosts deliberately left the message blank** → Those hosts get preset copy on their public page without asking for it. Accepted: it is the direct consequence of the ratified decision that the welcome message is always required, and the preset copy is per-event-type and reasonable rather than placeholder text. Not silently reversible after the fact, so it is called out here rather than discovered.

**`NOT NULL` on a column read by two view models produces wide typecheck fallout** → Enumerated and sequenced in `tasks.md` rather than discovered incrementally: `view-models.ts` (both models), both mappers, `draft-to-preview.ts`, and the four render-site guards. `arch-trio-layout.tsx` uses a ternary with an else branch that becomes unreachable — that branch is removed rather than left as dead code, since a fallback that can never render is a lie about the component's contract.

**Interim attribution sandwich** → Between this change and the separate attribution realignment, `postcard` reads quote → `— Ana & Diego` → postscript. Accepted and recorded in the proposal; the two changes touch different lines of the same three functions so ordering is a visual question, not a merge one.

**A home address and phone on a fully public, anonymous-accessible URL** → This is the ratified product decision, not an oversight. The mitigation that exists is that all three fields are optional and host-entered, so a host who does not want their address public simply leaves it empty and nothing renders. No new exposure surface is created beyond what the host types.

**Clipboard write can fail or be unavailable** → `CopyButton` catches and does nothing visible; the composed line is always readable as text on screen, so the copy action is an accelerator rather than the only path to the data.

## Migration Plan

1. Ship the schema migration (backfill then alter) — safe to run ahead of the application code, since the new columns are nullable and the backfill only fills values the old code already treated as empty.
2. Ship the application change.

Rollback: reverting the application code is safe against the migrated schema. Reverting the migration itself requires dropping `NOT NULL`; the backfilled welcome copy is not distinguishable from host-authored copy afterward and is not restored to `NULL`.
