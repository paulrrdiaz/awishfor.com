## 1. Schema and Validation

- [x] 1.1 Add nullable `Wishlist.subtitle` to the Prisma schema, create the additive migration without a content backfill, and regenerate the Prisma client without hand-editing generated files.
- [x] 1.2 Add the reusable optional subtitle validator with trim/empty-to-null normalization and a 160-character cap to create, update, wizard save/publish, and Settings schemas.
- [x] 1.3 Add validator tests for a valid subtitle, whitespace normalization, null/omitted input, the 160-character boundary, and rejection at 161 characters.

## 2. Wizard Draft and Persistence

- [x] 2.1 Add `subtitle` to `WishlistDraft`, seed brand-new/reset drafts with `Una lista creada con cariño para celebrar juntos.`, bump the persisted store version, and migrate older local drafts to an empty subtitle while preserving their other state.
- [x] 2.2 Extend wizard-store tests for new/reset defaults, direct editing and clearing, reload persistence, and the legacy-version migration behavior.
- [x] 2.3 Carry subtitle through draft save/publish payloads, service create/update data, conflict responses, and server-draft restoration, normalizing an absent database value to an empty controlled-input string.
- [x] 2.4 Extend save-draft and wishlist-service tests to prove subtitle create/update persistence, clearing, conflict round trips, and no injected generic copy for existing saved drafts.
- [x] 2.5 Carry subtitle through local-draft and persisted-dashboard preview transforms and update their tests for present and absent values.

## 3. Queries, View Models, and Settings API

- [x] 3.1 Add nullable subtitle to the public and owner/dashboard wishlist view-model types, query projections, and mappers while leaving title, slug, share, and social-metadata behavior unchanged.
- [x] 3.2 Update mapper and service tests to prove stored subtitles are exposed verbatim and absent subtitles remain `null` in public and owner-facing outputs.
- [x] 3.3 Extend the owner-scoped Settings mutation to persist or clear subtitle and reuse existing public cache/path invalidation; cover both paths and overlong rejection in router tests.
- [x] 3.4 Update typed fixtures, seeds, preview sources, stories, and test builders affected by the new view-model field, using `null` where no intentional subtitle is needed.

## 4. Owner Editing Surfaces

- [x] 4.1 Add the optional subtitle input beside the wishlist name in the wizard Details identity card, with the specified default value and Spanish help text explaining personalization, later Settings editing, and removal.
- [x] 4.2 Render the live Details-step header preview from `draft.subtitle`, including immediate collapse when the field is cleared, and add focused component coverage.
- [x] 4.3 Add a prefilled optional subtitle input to wishlist Settings, submit empty values as absent, surface the 160-character validation state, and test editing and clearing.

## 5. Public Hero and CTA Composition

- [x] 5.1 Render a conditional paragraph subtitle directly beneath the sole `h1` in each of the six shared-body hero layouts, with layout-appropriate alignment/contrast and no subtitle-specific gap when absent.
- [x] 5.2 Remove `HeroCtas` from those six hero components and render one non-compact group in `PublicWishlistBody` after the welcome-message content, preserving scroll, toggle, drawer, and theme behavior.
- [x] 5.3 Add subtitle rendering to `arch-trio`, `split-image-right`, and `collage-staggered`; preserve and format the user-owned `arch-trio` CTA relocation, keep the already compliant split placement, and move the collage group beside its welcome content before RSVP/gifts.
- [x] 5.4 Extend cross-layout tests to cover all nine layout ids with and without subtitle in full/preview/compact modes, asserting one `h1`, conditional subtitle rendering, one non-compact CTA group outside the title block, compact omission, and `showHowItWorks` behavior.
- [x] 5.5 Add focused regression coverage for the three self-contained layouts' welcome/countdown/CTA/RSVP/gift ordering and for scoped CTA scrolling after relocation.

## 6. Verification

- [x] 6.1 Run focused store, validator, transform, service, mapper, router, wizard, Settings, and public-layout tests; resolve all regressions attributable to the change.
- [x] 6.2 Run `pnpm check`, `pnpm test`, and `pnpm typecheck`, then record any unrelated pre-existing failures without modifying unrelated user work.
