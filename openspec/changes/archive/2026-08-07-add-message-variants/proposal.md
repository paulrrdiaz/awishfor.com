## Why

The public wishlist page renders its countdown, welcome message, and thank-you message in exactly one visual shape each, chosen by us rather than by the owner. The Claude Design project has since converged on three approved directions per component (`Cuenta Regresiva Proposals.dc.html`, `Welcome Message Proposals.dc.html`, `Thank You Message Proposals.dc.html`), and none of the three current renderers matches a winning proposal. Owners already pick their theme, layout, fonts, and button style; the emotional core of the page — the words they wrote — is the one thing they cannot style.

The current implementation also carries drift worth clearing while we are in here: the welcome message is implemented twice (an inline block in `public-wishlist-body.tsx` and the `WishlistMessage` component), and two layouts hardcode a countdown variant that would override any owner choice.

## What Changes

- Add three selectable variants for each of the three message components, per the approved designs:
  - **Countdown** — `filled-pill` (2a), `outline-pill` (2d), `progress-bar` (1d)
  - **Welcome** — `postcard` (2a), `handwritten` (1c), `avatars` (1d)
  - **Thank you** — `spotlight` (2a), `handwritten` (1c), `social-proof` (1d)
- Persist the owner's choice on `Wishlist` as three nullable string columns, resolved through a new config module — mirroring the existing `themeId` / `layoutId` / `buttonStyle` pattern.
- Add variant pickers to the wishlist settings form, each sitting beside the field it styles, with inline visual thumbnails.
- Every variant derives all color from the active theme's CSS custom properties. No hardcoded hex reaches a component.
- Add a signature-initials helper that splits an owner signature on explicit conjunctions only (`Ana & Diego` → `A`, `D`; `Familia Rodríguez` → `F`), feeding the seals and avatar clusters.
- Promote `welcomeMessageAttribution` ("Firma del mensaje") to a page-wide signature used by both the welcome and thank-you variants. Help text is reworded; no schema change.
- Expose contributor social proof on the public view model — a distinct-purchaser count and capped initials — for the thank-you `social-proof` variant.
- Expose `createdAt` on the public view model as the start anchor for the countdown `progress-bar` variant.
- **BREAKING (internal)**: `Countdown`'s `variant="default"` accent-box rendering is removed; it matches no approved proposal. The two call sites hardcoding `variant="chip"` yield to the owner's selection.
- Delete the duplicated inline welcome block in `public-wishlist-body.tsx` so all three welcome variants live in one component.

Non-goals: no change to which layouts exist or how heroes compose; no per-layout variant overrides (the owner's choice applies across every layout); no new message fields beyond the variant columns; no editing of message copy itself beyond what the settings form already does.

## Capabilities

### New Capabilities
- `public-message-variants`: The catalog of countdown, welcome, and thank-you variants — their ids, defaults, resolution from a persisted string, theme-token-only styling, graceful degradation when the data a variant wants is absent, and owner selection from the settings form.

### Modified Capabilities
- `formatting-helpers`: Adds a signature-initials requirement — conjunction-aware splitting of an owner signature, distinct from whitespace-splitting a single person's name.
- `wishlist-view-models`: The public view model gains a contributor summary (distinct-purchaser count plus capped initials) and `createdAt`. This narrows the existing "excludes private and internal data" requirement: guest initials become public by explicit product decision, while full names, emails, and phones remain owner-only.
- `wishlist-settings`: The settings form gains three variant pickers, and "Firma del mensaje" changes meaning from welcome-only to page-wide.
- `public-wishlist-layout`: Three shipped requirements currently mandate the appearances this change replaces — the countdown's "tinted, rounded accent-card container" and the welcome block's italic styling under "Shared section components", and the "centered countdown chip" hardcoded into "Split image right composition". "Countdown formatting" is narrowed to say the post-event sentence renders in a variant-neutral container rather than inside a pill.

## Impact

**Schema / data**
- `prisma/schema.prisma`: three nullable columns on `Wishlist` (`countdownVariant`, `welcomeMessageVariant`, `thankYouMessageVariant`) plus a migration.
- Public wishlist query must load purchases with `guestName` to compute the contributor summary server-side; raw names never cross the wire.

**Server**
- `src/server/mappers/view-models.ts`, `public-wishlist.mapper.ts`, `dashboard-wishlist.mapper.ts`
- `src/server/services/public-wishlist.service.ts`
- `src/server/validators/wishlist.schema.ts`, `wishlist-save-draft.schema.ts`
- `src/server/api/routers/wishlist.ts` (`getById`, `update`, `updateDesign`)

**Client / components**
- New `src/config/public-message-variants.ts`, new `src/lib/format/signature.ts`
- `src/components/shared/countdown.tsx`, `wishlist-message.tsx`, `wishlist-thank-you.tsx`, `public-wishlist-body.tsx`
- `src/components/layouts/public-wishlist/collage-staggered-layout.tsx`, `split-image-right-layout.tsx`
- `src/components/features/dashboard/settings/wishlist-settings-form.tsx`
- Preview plumbing: `src/lib/wishlist/draft-to-preview.ts`, `persisted-to-preview.ts`, `src/stores/wishlist-wizard.store.ts`, `src/config/demo-wishlist.ts`

**Tests / fixtures**
- Mapper, router, validator, and store test fixtures gain the new fields; `src/components/shared/story-data.ts` needs contributor and variant data for Storybook coverage.

**Privacy**
- Guest initials become visible to anyone holding a public wishlist link. Owner-registered manual purchases (`"Registrado por el creador"`) are excluded so the owner is never counted as a contributor to their own list.
